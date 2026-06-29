/**
 * Réinitialise Poto Timide : 15 membres par défaut, données vides, MDP 1234.
 */
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "poto-timide.db");
const DEFAULT_PASSWORD = "1234";
const ADMIN_NAME = "Dario";

const DEFAULT_MEMBER_NAMES = [
  "Yves", "Quentin", "Donald", "Hugo", "Elysée", "Ferlin", "William", "Luc",
  "David", "Boris", "Prince", "Dario", "Jp", "Fabrice", "Vitran",
];

const db = new Database(DB_PATH);

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function normalizeUsername(name) {
  return String(name || "").trim().toLowerCase();
}

function getDefaultMembers() {
  const baseDate = "2025-01-18T00:00:00.000Z";
  return [...DEFAULT_MEMBER_NAMES]
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
    .map((name, index) => ({
      id: `default-${index + 1}`,
      name,
      createdAt: baseDate,
    }));
}

function setData(key, value) {
  db.prepare(
    "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run(key, JSON.stringify(value));
}

function reset() {
  db.exec("DELETE FROM app_data");
  db.exec("DELETE FROM users");

  const members = getDefaultMembers();
  setData("poto-timide-members", members);
  setData("poto-timide-admin-ids", [
    members.find((m) => m.name.toLowerCase() === ADMIN_NAME.toLowerCase()).id,
  ]);
  setData("poto-timide-roles", {});
  setData("poto-timide-cotisations", {});
  setData("poto-timide-tournee", { years: {} });
  setData("poto-timide-amendes", []);
  setData("poto-timide-amendes-caisse", []);
  setData("poto-timide-tab-permissions", {
    amendes: ["censeur", "tresorier"],
    tournee: [],
    prets: ["tresorier"],
    evenements: ["tresorier"],
  });
  setData("poto-timide-prets", []);
  setData("poto-timide-notifications", []);
  setData("poto-timide-evenements", []);
  setData("poto-timide-autre-argent", []);

  const insertUser = db.prepare(
    "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, 1)"
  );
  members.forEach((member) => {
    insertUser.run(member.id, normalizeUsername(member.name), hashPassword(DEFAULT_PASSWORD));
  });

  console.log("Site réinitialisé.");
  console.log(`- ${members.length} membres (mot de passe : ${DEFAULT_PASSWORD})`);
  console.log(`- Admin : ${ADMIN_NAME}`);
  console.log("- Cotisations, amendes, tournée, prêts, événements : vides");
  console.log("- Caisse : fond de base uniquement (1 000 €)");
}

reset();
db.close();