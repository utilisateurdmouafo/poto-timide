/**
 * Planning figé (mois de réception + montants cotisés).
 * Source unique : data/baseline-planning.json
 * Appliqué au démarrage serveur pour que chaque connexion charge ces valeurs par défaut.
 */
const fs = require("fs");
const path = require("path");

const BASELINE_PATH = path.join(__dirname, "..", "data", "baseline-planning.json");

const PLANNING_KEYS = [
  "poto-timide-members",
  "poto-timide-cotisations",
  "poto-timide-tournee",
  "poto-timide-finance",
  "poto-timide-admin-ids",
  "poto-timide-tab-permissions",
  "poto-timide-fond-caisse",
];

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  } catch (err) {
    console.warn("baseline-planning.json illisible :", err.message);
    return null;
  }
}

function isPlanningBaseline(finance) {
  if (!finance || typeof finance !== "object") return false;
  const source = String(finance.source || "");
  return (
    source === "planning-baseline-frozen" ||
    source === "mois-de-reception-import" ||
    finance.planningFrozen === true
  );
}

/**
 * Applique le planning figé dans la base.
 * @param {{ getData: Function, setData: Function, ensureUserForMember?: Function }} deps
 * @param {{ force?: boolean }} options force=true réécrit toujours cotisations/tournée
 */
async function ensureFrozenPlanning(deps, options = {}) {
  const { getData, setData, ensureUserForMember } = deps;
  const force = Boolean(options.force);
  const baseline = loadBaseline();
  if (!baseline) {
    console.warn("Aucun baseline-planning.json — planning figé non appliqué");
    return { applied: false, reason: "missing-baseline" };
  }

  const existingCotis = await getData("poto-timide-cotisations");
  const existingTournee = await getData("poto-timide-tournee");
  const existingFinance = await getData("poto-timide-finance");
  const hasTournee =
    existingTournee?.years &&
    Object.values(existingTournee.years).some((year) =>
      Object.keys(year || {}).some((k) => k !== "partners")
    );
  const hasCotis =
    existingCotis &&
    typeof existingCotis === "object" &&
    Object.values(existingCotis).some((v) => Number(v) > 0);

  // Réappliquer si force, ou si données manquantes, ou si déjà marqué figé (maintien du baseline)
  const shouldApply =
    force ||
    !hasCotis ||
    !hasTournee ||
    isPlanningBaseline(existingFinance) ||
    existingFinance?.cleared === true ||
    !existingFinance;

  if (!shouldApply) {
    return { applied: false, reason: "already-custom" };
  }

  // Membres : fusion par id/nom pour ne pas perdre d'éventuels ajouts hors baseline
  const baselineMembers = Array.isArray(baseline["poto-timide-members"])
    ? baseline["poto-timide-members"]
    : [];
  const currentMembers = (await getData("poto-timide-members")) || [];
  const byId = new Map(currentMembers.map((m) => [m.id, m]));
  const byName = new Map(
    currentMembers.map((m) => [String(m.name || "").toLowerCase(), m])
  );

  for (const bm of baselineMembers) {
    const nameKey = String(bm.name || "").toLowerCase();
    if (byId.has(bm.id)) {
      byId.set(bm.id, { ...byId.get(bm.id), ...bm, name: bm.name });
    } else if (byName.has(nameKey)) {
      // garder l'id existant si même nom
      const existing = byName.get(nameKey);
      byId.set(existing.id, { ...existing, name: bm.name });
    } else {
      byId.set(bm.id, bm);
    }
  }

  const members = [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
  );
  await setData("poto-timide-members", members);

  if (typeof ensureUserForMember === "function") {
    for (const member of members) {
      await ensureUserForMember(member, false);
    }
  }

  // Cotisations figées (noms du baseline → ids actuels)
  const nameToId = new Map(members.map((m) => [m.name.toLowerCase(), m.id]));
  const baselineCotis = baseline["poto-timide-cotisations"] || {};
  const baselineMembersById = new Map(baselineMembers.map((m) => [m.id, m]));
  const cotisations = {};

  // Map baseline id → amount, puis re-map vers ids courants par nom
  for (const [bId, amount] of Object.entries(baselineCotis)) {
    const bMember = baselineMembersById.get(bId);
    if (!bMember) {
      cotisations[bId] = amount;
      continue;
    }
    const currentId = nameToId.get(bMember.name.toLowerCase()) || bId;
    cotisations[currentId] = amount;
  }

  // Membres hors liste → 0 pour coller au total document (2100)
  for (const m of members) {
    if (cotisations[m.id] === undefined) cotisations[m.id] = 0;
  }
  await setData("poto-timide-cotisations", cotisations);

  // Tournée : remap ids par nom si besoin
  const remapId = (id) => {
    const bMember = baselineMembersById.get(id);
    if (!bMember) return id;
    return nameToId.get(bMember.name.toLowerCase()) || id;
  };

  const baselineTournee = baseline["poto-timide-tournee"] || { years: {} };
  const tournee = { years: {} };
  for (const [year, yearData] of Object.entries(baselineTournee.years || {})) {
    const next = {};
    for (const [key, value] of Object.entries(yearData || {})) {
      if (key === "partners") {
        const partners = {};
        for (const [mid, monthMap] of Object.entries(value || {})) {
          const newMid = remapId(mid);
          partners[newMid] = {};
          for (const [mk, pid] of Object.entries(monthMap || {})) {
            partners[newMid][mk] = remapId(pid);
          }
        }
        next.partners = partners;
      } else if (key === "reception" || key === "ristourne") {
        const mapped = {};
        for (const [monthKey, ids] of Object.entries(value || {})) {
          mapped[monthKey] = Array.isArray(ids) ? ids.map(remapId) : [];
        }
        next[key] = mapped;
      } else if (Array.isArray(value)) {
        next[key] = value.map(remapId);
      } else {
        next[key] = value;
      }
    }
    tournee.years[year] = next;
  }

  // Conserver l'ordre de réception / ristourne déjà saisi (et anciennes dates)
  for (const [year, yearData] of Object.entries(existingTournee?.years || {})) {
    if (!tournee.years[year]) tournee.years[year] = {};

    for (const mapKey of ["reception", "ristourne"]) {
      const sourceMap = yearData?.[mapKey];
      if (!sourceMap || typeof sourceMap !== "object") continue;
      const mapped = {};
      for (const [monthKey, ids] of Object.entries(sourceMap)) {
        const remapped = (Array.isArray(ids) ? ids : []).map(remapId).filter(Boolean);
        if (remapped.length) mapped[monthKey] = remapped;
      }
      if (Object.keys(mapped).length) {
        tournee.years[year][mapKey] = mapped;
      }
    }

    const dates = yearData?.receptionDates;
    if (dates && typeof dates === "object") {
      const mapped = { ...(tournee.years[year].receptionDates || {}) };
      for (const [memberId, dateStr] of Object.entries(dates)) {
        if (!dateStr) continue;
        mapped[remapId(memberId)] = dateStr;
      }
      if (Object.keys(mapped).length) {
        tournee.years[year].receptionDates = mapped;
      }
    }
  }

  await setData("poto-timide-tournee", tournee);

  // Finance : archives historiques toujours vides (live = poto-timide-cotisations)
  const finance = {
    ...(existingFinance && typeof existingFinance === "object" ? existingFinance : {}),
    cleared: false,
    source: "planning-baseline-frozen",
    planningFrozen: true,
    cotisations: [],
    cotisationMemberTotals: [],
    cotisationTotal: 0,
    ancienneTournee: [],
    finances: { entries: [], exits: [], totalIn: 0, totalOut: 0, balance: 0 },
    amendesHistorique: { columns: [], rows: [], headers: [] },
    pretsHistorique: [],
    equipeExcel: [],
    importedAt: null,
  };
  await setData("poto-timide-finance", finance);

  if (baseline["poto-timide-admin-ids"]) {
    await setData("poto-timide-admin-ids", baseline["poto-timide-admin-ids"]);
  }
  if (baseline["poto-timide-tab-permissions"]) {
    await setData("poto-timide-tab-permissions", baseline["poto-timide-tab-permissions"]);
  }
  if (baseline["poto-timide-fond-caisse"] !== undefined) {
    const currentFond = await getData("poto-timide-fond-caisse");
    if (currentFond === null || currentFond === undefined) {
      await setData("poto-timide-fond-caisse", baseline["poto-timide-fond-caisse"]);
    }
  }

  const currentAccount = await getData("poto-timide-financier-account");
  const hasIban =
    currentAccount &&
    typeof currentAccount === "object" &&
    String(currentAccount.iban || "").trim();
  if (!hasIban) {
    await setData("poto-timide-financier-account", {
      iban: "BE76063676212495",
      holder: "Quenton Fozing",
      bank: "ING",
    });
  }

  // Revision haute pour que le navigateur prenne toujours le serveur au login
  const rev = Date.now();
  await setData("poto-timide-data-revision", rev);

  console.log(
    `Planning figé appliqué (cotisations total ${finance.cotisationTotal} €, révision ${rev})`
  );
  return { applied: true, revision: rev, total: finance.cotisationTotal };
}

module.exports = {
  BASELINE_PATH,
  PLANNING_KEYS,
  loadBaseline,
  isPlanningBaseline,
  ensureFrozenPlanning,
};
