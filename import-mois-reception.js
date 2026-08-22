/**
 * Import "Mois de reception" planning from the paper schedule into:
 * - poto-timide-tournee (mois de ristourne / reception)
 * - poto-timide-cotisations (amounts from ordre ristourne)
 * - poto-timide-finance.cotisations (Reçoit / Bouffe table)
 * Adds member Jordan if missing.
 */
const db = require("./lib/db");
const fs = require("fs");
const path = require("path");

function parseJson(v) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  return JSON.parse(v);
}

async function getData(key) {
  const row = await db.get("SELECT value FROM app_data WHERE key = ?", [key]);
  if (!row) return null;
  return parseJson(row.value);
}

async function setData(key, value) {
  await db.run(
    "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
    [key, JSON.stringify(value)]
  );
}

// Image schedule: Mois | Ordre de reception | Ordre ristourne
// Amounts for Mai/Juin use cotisation scale (Donald 250, Hugo 50, Boris/Vitran 100)
// matching existing app cotisations (OCR often adds extra zeros).
const SCHEDULE = [
  {
    month: 8,
    label: "Septembre",
    receivers: ["Ferlin"],
    ristourne: [{ n: "Ferlin", a: 200 }],
  },
  {
    month: 9,
    label: "Octobre",
    receivers: ["Yves", "Hugo"],
    ristourne: [{ n: "Yves", a: 200 }],
  },
  {
    month: 10,
    label: "Novembre",
    receivers: ["William"],
    ristourne: [{ n: "William", a: 200 }],
  },
  {
    month: 11,
    label: "Décembre",
    receivers: ["Quentin"],
    ristourne: [{ n: "Quentin", a: 200 }],
  },
  {
    month: 0,
    label: "Janvier",
    receivers: ["Dario", "Fabrice"],
    ristourne: [
      { n: "Dario", a: 100 },
      { n: "Fabrice", a: 100 },
    ],
  },
  {
    month: 1,
    label: "Février",
    receivers: ["Cedrick"],
    ristourne: [{ n: "Cedrick", a: 200 }],
  },
  {
    month: 2,
    label: "Mars",
    receivers: ["Jp"],
    ristourne: [{ n: "Jp", a: 200 }],
  },
  {
    month: 3,
    label: "Avril",
    receivers: ["Donald", "Jordan"],
    ristourne: [{ n: "Jordan", a: 200 }],
  },
  {
    month: 4,
    label: "Mai",
    receivers: ["David", "Prince"],
    // Image OCR: Donald(2500); Hugo(500) → cotisation scale 250 / 50
    ristourne: [
      { n: "Donald", a: 250 },
      { n: "Hugo", a: 50 },
    ],
  },
  {
    month: 5,
    label: "Juin",
    receivers: ["Boris", "Vitran"],
    // Image OCR: Boris(1000); Vitran(1000) → cotisation scale 100 / 100
    ristourne: [
      { n: "Boris", a: 100 },
      { n: "Vitran", a: 100 },
    ],
  },
];

async function main() {
  await db.init();

  const members = (await getData("poto-timide-members")) || [];
  const cotisations = (await getData("poto-timide-cotisations")) || {};
  const finance = (await getData("poto-timide-finance")) || {};
  const tournee = (await getData("poto-timide-tournee")) || { years: {} };

  const byName = {};
  for (const m of members) {
    byName[m.name.toLowerCase()] = m;
  }

  if (!byName.jordan) {
    const jordan = {
      id: `import-jordan-${Date.now()}`,
      name: "Jordan",
      createdAt: new Date().toISOString(),
    };
    members.push(jordan);
    byName.jordan = jordan;
    cotisations[jordan.id] = 200;
    console.log("Added member Jordan:", jordan.id);
  } else if (cotisations[byName.jordan.id] == null) {
    cotisations[byName.jordan.id] = 200;
  }

  function nameId(name) {
    const key = String(name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^darios$/, "dario");
    const m = byName[key] || byName[String(name).toLowerCase()];
    if (!m) throw new Error(`Member not found: ${name}`);
    return m.id;
  }

  // Cotisations from ordre ristourne
  for (const row of SCHEDULE) {
    for (const r of row.ristourne) {
      cotisations[nameId(r.n)] = r.a;
    }
  }

  function buildYearData(monthFilter = null) {
    const yearData = {};
    const partners = {};

    for (const row of SCHEDULE) {
      if (monthFilter && !monthFilter.includes(row.month)) continue;

      // Mois de réception = ordre de réception only
      const ids = [];
      const seen = new Set();
      for (const n of row.receivers) {
        const id = nameId(n);
        if (!seen.has(id)) {
          ids.push(id);
          seen.add(id);
        }
      }

      yearData[String(row.month)] = ids;

      const needing = ids.filter((id) => (cotisations[id] || 0) < 200);
      if (needing.length === 2) {
        const [a, b] = needing;
        partners[a] = partners[a] || {};
        partners[b] = partners[b] || {};
        partners[a][String(row.month)] = b;
        partners[b][String(row.month)] = a;
      }
    }

    if (Object.keys(partners).length) yearData.partners = partners;
    return yearData;
  }

  const year2026 = buildYearData();
  const year2027 = buildYearData([0, 1, 2, 3, 4, 5]);

  tournee.years = tournee.years || {};
  tournee.years["2026"] = year2026;
  tournee.years["2027"] = year2027;

  // Finance "Organisation des cotisations" — Reçoit / Bouffe
  const financeRows = SCHEDULE.map((row) => {
    const receivers = row.receivers.join(", ");
    const eaters = row.ristourne.map((r) => `${r.n} (${r.a})`).join(", ");
    return {
      yearA: { month: row.label, receivers, eaters },
      yearB: { month: row.label, receivers: "—", eaters: "—" },
    };
  });

  members.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));

  const totals = members
    .map((m) => ({ name: m.name, amount: cotisations[m.id] || 0 }))
    .filter((t) => t.amount > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const total = totals.reduce((s, t) => s + t.amount, 0);

  const newFinance = {
    ...finance,
    cleared: false,
    source: "mois-de-reception-import",
    importedAt: new Date().toISOString(),
    cotisationTotal: total,
    cotisations: financeRows,
    cotisationMemberTotals: totals,
  };

  await setData("poto-timide-members", members);
  await setData("poto-timide-cotisations", cotisations);
  await setData("poto-timide-tournee", tournee);
  await setData("poto-timide-finance", newFinance);

  const rev = Number((await getData("poto-timide-data-revision")) || 0) + 1;
  await setData("poto-timide-data-revision", rev);

  // Refresh backup so it matches DB
  const backupPath = path.join(__dirname, "data", "backup-latest.json");
  let backup = {};
  try {
    backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  } catch {
    backup = {};
  }
  backup["poto-timide-members"] = members;
  backup["poto-timide-cotisations"] = cotisations;
  backup["poto-timide-tournee"] = tournee;
  backup["poto-timide-finance"] = newFinance;
  backup["poto-timide-data-revision"] = rev;
  fs.writeFileSync(backupPath, JSON.stringify(backup));

  console.log("Import OK — revision", rev);
  console.log("Jordan:", byName.jordan.id);
  console.log("Tournee 2026:", JSON.stringify(year2026, null, 2));
  console.log(
    "Mois:",
    SCHEDULE.map((r) => `${r.label}: ${r.receivers.join(" + ")}`).join(" | ")
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
