/**
 * Importe les données de Finance poto_vitran.xlsx (JSON généré) dans la base locale.
 */
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const FINANCE_KEY = "poto-timide-finance";
const DB_PATH = path.join(__dirname, "data", "poto-timide.db");
const JSON_PATH = path.join(__dirname, "data", "finance-vitran.json");

function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Fichier introuvable : ${JSON_PATH}`);
    process.exit(1);
  }

  const finance = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const db = new Database(DB_PATH);

  db.prepare(
    `INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(FINANCE_KEY, JSON.stringify(finance));

  console.log("Finance importée dans la base :");
  console.log(`- Journal : ${finance.finances?.entries?.length || 0} entrées, ${finance.finances?.exits?.length || 0} sorties`);
  console.log(`- Cotisations : ${finance.cotisations?.length || 0} mois`);
  console.log(`- Ancienne tournée : ${finance.ancienneTournee?.length || 0} membres`);
  console.log(`- Amendes historiques : ${finance.amendesHistorique?.rows?.length || 0} lignes`);
  console.log(`- Prêts historiques : ${finance.pretsHistorique?.length || 0} prêts`);
}

main();