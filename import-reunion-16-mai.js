/**
 * Import des données du rapport de réunion du 16 mai 2026.
 * Conserve cotisations et tournée déjà saisies.
 */
const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "poto-timide.db");
const REUNION_DATE = "2026-05-16T17:40:00.000Z";
const FOND_CAISSE = 1000;
const CAISSE_TARGET = 1748;
const AUTRE_ARGENT_AMOUNT = CAISSE_TARGET - FOND_CAISSE;

const NAME_ALIASES = {
  darios: "Dario",
  cedric: "Cedrick",
  cédric: "Cedrick",
  jp: "Jp",
  jordan: "Jp",
};

const DETTES_2025 = [
  { name: "Fabrice", amount: 260 },
  { name: "Ferlin", amount: 110 },
];

const DETTES_2026 = [
  { name: "Cedrick", amount: 7 },
  { name: "Dario", amount: 5 },
  { name: "Fabrice", amount: 3 },
  { name: "Jp", amount: 3 },
  { name: "Vitran", amount: 3 },
];

const BAVARDAGES = [
  { name: "Quentin", amount: 2 },
  { name: "Prince", amount: 2 },
  { name: "William", amount: 0.5 },
  { name: "Jp", amount: 2.5 },
  { name: "Hugo", amount: 0.5 },
];

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

function resolveName(name) {
  const trimmed = String(name || "").trim();
  return NAME_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function findMemberByName(members, name) {
  const resolved = resolveName(name);
  return members.find((m) => m.name.toLowerCase() === resolved.toLowerCase()) || null;
}

function generateId() {
  return `import-16mai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function makeAmende(members, name, type, amount, note) {
  const member = findMemberByName(members, name);
  if (!member) throw new Error(`Membre introuvable : ${name}`);
  return {
    id: generateId(),
    memberId: member.id,
    type,
    amount,
    note,
    date: REUNION_DATE,
  };
}

function main() {
  const members = getData("poto-timide-members");
  if (!Array.isArray(members) || members.length === 0) {
    throw new Error("Aucun membre en base.");
  }

  const amendes = [];

  DETTES_2025.forEach((d) => {
    amendes.push(
      makeAmende(
        members,
        d.name,
        "sanctions",
        d.amount,
        "Dette tournée 2025 — rapport réunion 16 mai"
      )
    );
  });

  DETTES_2026.forEach((d) => {
    amendes.push(
      makeAmende(
        members,
        d.name,
        "sanctions",
        d.amount,
        "Dette tournée 2026 — rapport réunion 16 mai"
      )
    );
  });

  BAVARDAGES.forEach((b) => {
    amendes.push(
      makeAmende(
        members,
        b.name,
        "bavardage",
        b.amount,
        "Bavardage — rapport réunion 16 mai"
      )
    );
  });

  setData("poto-timide-amendes", amendes);

  const dario = findMemberByName(members, "Dario");
  setData("poto-timide-autre-argent", [
    {
      id: generateId(),
      memberId: dario.id,
      amount: AUTRE_ARGENT_AMOUNT,
      note: "Solde caisse — rapport réunion 16 mai 2026 (1 748 €)",
      createdAt: REUNION_DATE,
      createdBy: dario.id,
    },
  ]);

  const yves = findMemberByName(members, "Yves");
  const ferlin = findMemberByName(members, "Ferlin");
  const cotisantCount = members.length - 1;
  const parisShare = round2(952.5 / 10);
  const ferlinShare = round2(100 / cotisantCount);

  const parisPayments = {};
  members.forEach((m) => {
    if (m.id !== yves.id) {
      parisPayments[m.id] = { paid: false, paidAt: null, validatedBy: null };
    }
  });

  const ferlinPayments = {};
  members.forEach((m) => {
    if (m.id !== ferlin.id) {
      ferlinPayments[m.id] = { paid: false, paidAt: null, validatedBy: null };
    }
  });

  setData("poto-timide-evenements", [
    {
      id: generateId(),
      title: "Réunion juillet Paris (Yves Moyo)",
      description:
        "Budget : 952,50 € pour 10 personnes. Participants prévus : Jojo, Hugo, Dario, Prince, William, Ferlin, Quentin, Boris, Jp. Voir fichier Prince pour détails.",
      beneficiaryMemberId: yves.id,
      totalAmount: round2(parisShare * cotisantCount),
      sharePerMember: parisShare,
      memberCount: cotisantCount,
      payments: parisPayments,
      createdAt: REUNION_DATE,
      createdBy: dario.id,
    },
    {
      id: generateId(),
      title: "Remboursement nettoyage fête 2024 — Ferlin",
      description:
        "Réclamation Ferlin : remboursement de 100 € pour le nettoyage lors de la fête de fin d'année 2024.",
      beneficiaryMemberId: ferlin.id,
      totalAmount: 100,
      sharePerMember: ferlinShare,
      memberCount: cotisantCount,
      payments: ferlinPayments,
      createdAt: REUNION_DATE,
      createdBy: dario.id,
    },
  ]);

  const empruntable = round2((CAISSE_TARGET - 300) / 2);

  console.log("Import rapport 16 mai terminé\n");
  console.log(`Caisse brute : ${CAISSE_TARGET} €`);
  console.log(`Empruntable : ${empruntable} €`);
  console.log(`Dettes 2025 : ${DETTES_2025.length} amendes`);
  console.log(`Dettes 2026 : ${DETTES_2026.length} amendes`);
  console.log(`Bavardages : ${BAVARDAGES.length} amendes`);
  console.log("Événements : Paris juillet (Yves), remboursement Ferlin (100 €)");
  console.log("Conservé : cotisations et tournée existantes");
}

main();
db.close();