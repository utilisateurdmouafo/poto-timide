/**
 * Import "Montants cotisés" from cotisation.jpeg into poto-timide-cotisations.
 */
const db = require("./lib/db");
const fs = require("fs");
const path = require("path");

// From C:\Users\dmoua\Downloads\cotisation.jpeg — Montants cotisés
const AMOUNTS = {
  Boris: 100,
  Cedrick: 200,
  Dario: 100, // image: Darios
  Darios: 100,
  David: 0,
  Donald: 250,
  Fabrice: 100,
  Ferlin: 200,
  Hugo: 50,
  Jordan: 200,
  Jp: 200,
  Prince: 0,
  Quentin: 200,
  Vitran: 100,
  William: 200,
  Yves: 200,
};

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

function resolveAmount(name) {
  if (AMOUNTS[name] !== undefined) return AMOUNTS[name];
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(AMOUNTS)) {
    if (k.toLowerCase() === lower) return v;
    if (lower === "darios" && k.toLowerCase() === "dario") return v;
  }
  return undefined;
}

async function main() {
  await db.init();

  const members = (await getData("poto-timide-members")) || [];
  const cotisations = { ...((await getData("poto-timide-cotisations")) || {}) };
  const finance = (await getData("poto-timide-finance")) || {};

  const byName = {};
  for (const m of members) {
    byName[m.name.toLowerCase()] = m;
  }

  // Ensure Jordan exists if listed
  if (!byName.jordan) {
    const jordan = {
      id: `import-jordan-${Date.now()}`,
      name: "Jordan",
      createdAt: new Date().toISOString(),
    };
    members.push(jordan);
    byName.jordan = jordan;
    console.log("Added Jordan", jordan.id);
  }

  const applied = [];
  const missing = [];
  const listedIds = new Set();

  for (const [name, amount] of Object.entries(AMOUNTS)) {
    if (name === "Darios") continue; // alias of Dario
    const key = name.toLowerCase();
    const member = byName[key] || (key === "dario" ? byName.darios : null);
    if (!member) {
      missing.push(name);
      continue;
    }
    cotisations[member.id] = amount;
    listedIds.add(member.id);
    applied.push(`${member.name}: ${amount}`);
  }

  // Members not on the image list → 0 (document is source of truth, total 2100)
  for (const m of members) {
    if (!listedIds.has(m.id)) {
      const prev = cotisations[m.id];
      if (prev && prev !== 0) {
        console.log(`Reset non-listé ${m.name}: ${prev} → 0`);
      }
      cotisations[m.id] = 0;
    }
  }

  const financeTotals = members
    .map((m) => ({
      name: m.name,
      amount: typeof cotisations[m.id] === "number" ? cotisations[m.id] : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const total = financeTotals.reduce((s, t) => s + (t.amount || 0), 0);
  const imageTotal = 2100;

  members.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));

  const newFinance = {
    ...finance,
    cotisationTotal: total,
    cotisationMemberTotals: financeTotals.filter((t) => t.amount > 0 || ["David", "Prince"].includes(t.name)),
  };

  await setData("poto-timide-members", members);
  await setData("poto-timide-cotisations", cotisations);
  await setData("poto-timide-finance", newFinance);

  const rev = Number((await getData("poto-timide-data-revision")) || 0) + 1;
  await setData("poto-timide-data-revision", rev);

  const backupPath = path.join(__dirname, "data", "backup-latest.json");
  let backup = {};
  try {
    backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  } catch {
    backup = {};
  }
  backup["poto-timide-members"] = members;
  backup["poto-timide-cotisations"] = cotisations;
  backup["poto-timide-finance"] = newFinance;
  backup["poto-timide-data-revision"] = rev;
  fs.writeFileSync(backupPath, JSON.stringify(backup));

  console.log("Applied:");
  applied.forEach((l) => console.log(" ", l));
  if (missing.length) console.log("Missing members:", missing.join(", "));
  console.log("Sum in app:", total, "| Image total:", imageTotal);
  console.log("Revision:", rev);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
