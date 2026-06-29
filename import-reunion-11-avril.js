/**
 * Import des données du rapport de réunion du 11 avril 2026
 * Source : Rapport de réunion du 11 avril.pdf
 */
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "poto-timide.db");
const DEFAULT_PASSWORD = "1234";
const FOND_CAISSE = 1000;
const CAISSE_RESERVE = 300;
const FULL_COTISATION = 200;
const REUNION_DATE = "2026-04-11T18:00:00.000Z";

const MEMBERS_KEY = "poto-timide-members";
const ROLES_KEY = "poto-timide-roles";
const COTISATIONS_KEY = "poto-timide-cotisations";
const AMENDES_KEY = "poto-timide-amendes";
const AUTRE_ARGENT_KEY = "poto-timide-autre-argent";

const NAME_ALIASES = {
  darios: "Dario",
  dario: "Dario",
  jp: "Jp",
};

const DETTES_2025 = [
  { name: "Fabrice", amount: 270 },
  { name: "Ferlin", amount: 110 },
  { name: "William", amount: 185 },
];

const DETTES_2026 = [
  { name: "Cedric", amount: 7 },
  { name: "Dario", amount: 5 },
  { name: "Fabrice", amount: 3 },
  { name: "Jp", amount: 3 },
  { name: "Vitran", amount: 3 },
];

const ROLES_TO_ASSIGN = [
  { roleId: "charge-affaires", name: "Prince" },
  { roleId: "vice-charge-affaires", name: "Jp" },
  { roleId: "vice-president", name: "Hugo" },
];

const CAISSE_TARGET = 1258.25;
const AUTRE_ARGENT_AMOUNT = CAISSE_TARGET - FOND_CAISSE;

const db = new Database(DB_PATH);

function getData(key) {
  const row = db.prepare("SELECT value FROM app_data WHERE key = ?").get(key);
  if (!row) return null;
  return JSON.parse(row.value);
}

function setData(key, value) {
  db.prepare(
    "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run(key, JSON.stringify(value));
}

function normalizeUsername(name) {
  return String(name || "").trim().toLowerCase();
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function ensureUserForMember(member) {
  const username = normalizeUsername(member.name);
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(member.id);

  if (!existing) {
    db.prepare(
      "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, 1)"
    ).run(member.id, username, hashPassword(DEFAULT_PASSWORD));
    return "created";
  }

  if (existing.username !== username) {
    db.prepare("UPDATE users SET username = ? WHERE id = ?").run(username, member.id);
    return "updated";
  }

  return "exists";
}

function resolveName(input) {
  const trimmed = String(input || "").trim();
  const alias = NAME_ALIASES[trimmed.toLowerCase()];
  return alias || trimmed;
}

function findMemberByName(members, name) {
  const resolved = resolveName(name);
  return members.find((m) => m.name.toLowerCase() === resolved.toLowerCase()) || null;
}

function generateId() {
  return `import-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function getCaisseBrute(autreArgent, amendesCaisse = [], evenements = []) {
  const amendesTotal = amendesCaisse.reduce((sum, e) => sum + e.amount, 0);
  const evtTotal = evenements.reduce((sum, evt) => {
    if (evt.reimbursedAt) return sum;
    if (!evt.payments) return sum;
    return (
      sum +
      Object.values(evt.payments).reduce((s, p) => s + (p?.paid && p?.paidAmount ? p.paidAmount : 0), 0)
    );
  }, 0);
  const autreTotal = autreArgent.reduce((sum, e) => sum + e.amount, 0);
  return round2(FOND_CAISSE + amendesTotal + evtTotal + autreTotal);
}

function main() {
  let members = getData(MEMBERS_KEY);
  if (!Array.isArray(members) || members.length === 0) {
    throw new Error("Aucun membre en base — lancez d'abord le serveur pour initialiser la base.");
  }

  const addedMembers = [];

  if (!findMemberByName(members, "Cedric")) {
    const cedric = {
      id: generateId(),
      name: "Cedric",
      createdAt: REUNION_DATE,
    };
    members.push(cedric);
    addedMembers.push(cedric.name);
  }

  members.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
  setData(MEMBERS_KEY, members);

  const userResults = members.map((m) => ({
    name: m.name,
    status: ensureUserForMember(m),
  }));

  const dettes2026ById = {};
  DETTES_2026.forEach((dette) => {
    const member = findMemberByName(members, dette.name);
    if (!member) {
      throw new Error(`Membre introuvable pour dette 2026 : ${dette.name}`);
    }
    dettes2026ById[member.id] = dette.amount;
  });

  const cotisations = {};
  members.forEach((member) => {
    const dette = dettes2026ById[member.id];
    cotisations[member.id] = dette ? FULL_COTISATION - dette : FULL_COTISATION;
  });
  setData(COTISATIONS_KEY, cotisations);

  const amendes = [];
  DETTES_2025.forEach((dette) => {
    const member = findMemberByName(members, dette.name);
    if (!member) {
      throw new Error(`Membre introuvable pour dette 2025 : ${dette.name}`);
    }
    amendes.push({
      id: generateId(),
      memberId: member.id,
      type: "sanctions",
      amount: dette.amount,
      note: "Dette tournée 2025 — rapport réunion 11 avril",
      date: REUNION_DATE,
    });
  });
  setData(AMENDES_KEY, amendes);

  const dario = findMemberByName(members, "Dario");
  const autreArgent = [
    {
      id: generateId(),
      memberId: dario.id,
      amount: AUTRE_ARGENT_AMOUNT,
      note: "Solde caisse — rapport réunion 11 avril 2026",
      createdAt: REUNION_DATE,
      createdBy: dario.id,
    },
  ];
  setData(AUTRE_ARGENT_KEY, autreArgent);

  const roles = {};
  ROLES_TO_ASSIGN.forEach(({ roleId, name }) => {
    const member = findMemberByName(members, name);
    if (!member) {
      throw new Error(`Membre introuvable pour rôle ${roleId} : ${name}`);
    }
    roles[roleId] = member.id;
  });
  setData(ROLES_KEY, roles);

  const caisseBrute = getCaisseBrute(autreArgent);
  const empruntable = round2(Math.max(0, (caisseBrute - CAISSE_RESERVE) / 2));

  console.log("Import terminé — rapport réunion 11 avril 2026\n");
  if (addedMembers.length) {
    console.log(`Nouveaux membres : ${addedMembers.join(", ")} (MDP initial : ${DEFAULT_PASSWORD})`);
  }
  console.log(`Caisse brute : ${caisseBrute} € (cible ${CAISSE_TARGET} €)`);
  console.log(`Empruntable : ${empruntable} € (cible 479 €)`);
  console.log(`Cotisations 2026 : ${Object.keys(cotisations).length} membres`);
  console.log(`Dettes 2025 (amendes sanctions) : ${amendes.length}`);
  console.log(`Rôles : Prince (chargé d'activités), Jp (adjoint), Hugo (vice-président)`);
  console.log("\nComptes utilisateurs :");
  userResults
    .filter((u) => u.status === "created")
    .forEach((u) => console.log(`  + ${u.name} (${u.status})`));
}

main();