/**
 * Import cotisations + mois de réception depuis la capture du rapport.
 */
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "poto-timide.db");
const DEFAULT_PASSWORD = "1234";
const TOURNEE_YEAR = "2026";
const MEMBERS_KEY = "poto-timide-members";
const COTISATIONS_KEY = "poto-timide-cotisations";
const TOURNEE_KEY = "poto-timide-tournee";

const NAME_ALIASES = {
  darios: "Dario",
  cedrick: "Cedrick",
  cedric: "Cedrick",
};

const COTISATIONS = {
  Boris: 200,
  Cedrick: 200,
  Dario: 100,
  David: 200,
  Donald: 50,
  Fabrice: 100,
  Ferlin: 100,
  Hugo: 50,
  Jp: 0,
  Luc: 0,
  Prince: 200,
  Quentin: 300,
  Vitran: 100,
  William: 200,
  Yves: 200,
};

// monthIndex (0=Janvier … 10=Novembre, 11=Décembre) → membres qui reçoivent
const RECEPTION_MONTHS = {
  10: ["David"],
  11: ["Hugo", "Donald"],
  0: ["Quentin"],
  1: ["Prince"],
  2: ["Yves"],
  3: ["William"],
  4: ["Boris"],
  5: ["Ferlin", "Dario"],
  6: ["Vitran", "Fabrice"],
  7: ["Cedrick"],
};

const db = new Database(DB_PATH);

function getData(key) {
  const row = db.prepare("SELECT value FROM app_data WHERE key = ?").get(key);
  return row ? JSON.parse(row.value) : null;
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
  return "exists";
}

function resolveName(name) {
  const trimmed = String(name || "").trim();
  return NAME_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function findMemberByName(members, name) {
  const resolved = resolveName(name);
  return members.find((m) => m.name.toLowerCase() === resolved.toLowerCase()) || null;
}

function generateId() {
  return `import-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function main() {
  let members = getData(MEMBERS_KEY);
  if (!Array.isArray(members) || members.length === 0) {
    throw new Error("Aucun membre en base.");
  }

  if (!findMemberByName(members, "Cedrick")) {
    members.push({
      id: generateId(),
      name: "Cedrick",
      createdAt: new Date().toISOString(),
    });
    members.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
    setData(MEMBERS_KEY, members);
    console.log("Membre ajouté : Cedrick (MDP : 1234)");
  }

  const idByName = {};
  members.forEach((m) => {
    idByName[m.name.toLowerCase()] = m.id;
  });

  const cotisations = {};
  Object.entries(COTISATIONS).forEach(([name, amount]) => {
    const member = findMemberByName(members, name);
    if (!member) throw new Error(`Membre introuvable : ${name}`);
    cotisations[member.id] = amount;
  });
  setData(COTISATIONS_KEY, cotisations);

  const months = {};
  Object.entries(RECEPTION_MONTHS).forEach(([monthIndex, names]) => {
    const ids = names.map((name) => {
      const member = findMemberByName(members, name);
      if (!member) throw new Error(`Membre introuvable pour mois ${monthIndex} : ${name}`);
      return member.id;
    });
    months[String(monthIndex)] = ids;
  });

  setData(TOURNEE_KEY, { years: { [TOURNEE_YEAR]: months } });

  members.forEach((m) => ensureUserForMember(m));

  console.log("Import terminé — cotisations et tournée 2026\n");
  console.log("Cotisations :");
  Object.entries(COTISATIONS).forEach(([name, amount]) => {
    console.log(`  ${resolveName(name)} : ${amount} €`);
  });
  console.log("\nMois de réception :");
  const labels = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  Object.entries(RECEPTION_MONTHS)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([idx, names]) => {
      console.log(`  ${labels[Number(idx)]} : ${names.map(resolveName).join(" + ")}`);
    });
  console.log("\nNon assignés : Jp (0 €), Luc (0 €), Elysée (absent du tableau)");
}

main();
db.close();