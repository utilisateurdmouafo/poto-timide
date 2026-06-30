/**
 * Migre la base SQLite locale (data/poto-timide.db) vers Turso.
 *
 * Prérequis :
 *   1. Compte Turso : https://turso.tech
 *   2. Créer une base "poto-timide"
 *   3. Renseigner TURSO_DATABASE_URL et TURSO_AUTH_TOKEN dans .env
 *
 * Usage : node migrate-to-turso.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");
const Database = require("better-sqlite3");

const ROOT = __dirname;
const LOCAL_DB = path.join(ROOT, "data", "poto-timide.db");
const ENV_PATH = path.join(ROOT, ".env");

function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return;
  const lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function migrateTable(localDb, turso, tableName, columns) {
  const rows = localDb.prepare(`SELECT ${columns.join(", ")} FROM ${tableName}`).all();
  if (!rows.length) {
    console.log(`  ${tableName} : vide`);
    return 0;
  }

  const placeholders = columns.map(() => "?").join(", ");
  let count = 0;

  for (const row of rows) {
    const values = columns.map((col) => {
      const value = row[col];
      return value === undefined ? null : value;
    });
    await turso.execute({
      sql: `INSERT OR REPLACE INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`,
      args: values,
    });
    count += 1;
  }

  console.log(`  ${tableName} : ${count} ligne(s)`);
  return count;
}

async function main() {
  loadEnvFile();

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error("ERREUR : définissez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN dans .env");
    console.error("Voir .env.example pour le format.");
    process.exit(1);
  }

  if (!fs.existsSync(LOCAL_DB)) {
    console.error(`ERREUR : base locale introuvable (${LOCAL_DB})`);
    process.exit(1);
  }

  console.log("Migration SQLite locale → Turso");
  console.log(`Source : ${LOCAL_DB}`);
  console.log(`Cible  : ${tursoUrl}`);
  console.log("");

  const localDb = new Database(LOCAL_DB, { readonly: true });
  const turso = createClient({ url: tursoUrl, authToken: tursoToken });

  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS app_data (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired INTEGER NOT NULL
    )`,
  ];

  for (const sql of schemaStatements) {
    await turso.execute(sql);
  }

  let total = 0;
  total += await migrateTable(localDb, turso, "app_data", ["key", "value", "updated_at"]);
  total += await migrateTable(localDb, turso, "users", [
    "id",
    "username",
    "password_hash",
    "must_change_password",
    "created_at",
  ]);
  total += await migrateTable(localDb, turso, "sessions", ["sid", "sess", "expired"]);

  localDb.close();

  console.log("");
  console.log(`Migration terminée (${total} lignes au total).`);
  console.log("Prochaine étape : ajoutez les variables Turso sur Render, puis redéployez.");
}

main().catch((err) => {
  console.error("Échec migration :", err.message);
  process.exit(1);
});