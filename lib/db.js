const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "..", "data");
const LOCAL_DB_PATH = path.join(DATA_DIR, "poto-timide.db");

let client = null;

function getDbMode() {
  return process.env.TURSO_DATABASE_URL ? "turso" : "local";
}

function createDbClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    if (!tursoToken) {
      throw new Error("TURSO_AUTH_TOKEN est requis avec TURSO_DATABASE_URL");
    }
    return createClient({ url: tursoUrl, authToken: tursoToken });
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  return createClient({ url: `file:${LOCAL_DB_PATH}` });
}

function rowToObject(columns, row) {
  const obj = {};
  columns.forEach((col, index) => {
    obj[col] = row[index];
  });
  return obj;
}

async function initSchema() {
  const statements = [
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

  for (const sql of statements) {
    await client.execute(sql);
  }
}

async function get(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  if (!result.rows.length) return null;
  return rowToObject(result.columns, result.rows[0]);
}

async function all(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return result.rows.map((row) => rowToObject(result.columns, row));
}

async function run(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return {
    changes: Number(result.rowsAffected || 0),
    lastInsertRowid: null,
  };
}

async function init() {
  client = createDbClient();
  await initSchema();
  return client;
}

function getClient() {
  if (!client) {
    throw new Error("Base de données non initialisée — appelez db.init() d'abord");
  }
  return client;
}

function getLocalDbPath() {
  return LOCAL_DB_PATH;
}

function getConnectionLabel() {
  if (getDbMode() === "turso") {
    const url = process.env.TURSO_DATABASE_URL || "";
    const host = url.replace(/^libsql:\/\//, "").split("-")[0] || "turso";
    return `Turso (${host}…)`;
  }
  return `SQLite locale (${LOCAL_DB_PATH})`;
}

module.exports = {
  init,
  get,
  all,
  run,
  getClient,
  getDbMode,
  getLocalDbPath,
  getConnectionLabel,
};