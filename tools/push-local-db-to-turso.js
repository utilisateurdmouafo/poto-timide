/**
 * Remplace intégralement la base Turso (prod) par la SQLite locale actuelle.
 * Met aussi à jour data/baseline-planning.json pour que Render ne réécrase
 * pas avec un ancien planning au démarrage.
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

const ROOT = path.join(__dirname, "..");
const LOCAL_DB = path.join(ROOT, "data", "poto-timide.db");
const ENV_PATH = path.join(ROOT, ".env");
const BASELINE_PATH = path.join(ROOT, "data", "baseline-planning.json");

const PLANNING_KEYS = [
  "poto-timide-members",
  "poto-timide-cotisations",
  "poto-timide-tournee",
  "poto-timide-finance",
  "poto-timide-data-revision",
  "poto-timide-roles",
  "poto-timide-admin-ids",
  "poto-timide-tab-permissions",
  "poto-timide-fond-caisse",
];

function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return;
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
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

function summarize(map) {
  const members = JSON.parse(map["poto-timide-members"] || "[]");
  const cotis = JSON.parse(map["poto-timide-cotisations"] || "{}");
  const tournee = JSON.parse(map["poto-timide-tournee"] || "{}");
  const amendes = JSON.parse(map["poto-timide-amendes"] || "[]");
  const evenements = JSON.parse(map["poto-timide-evenements"] || "[]");
  const prets = JSON.parse(map["poto-timide-prets"] || "[]");
  const autre = JSON.parse(map["poto-timide-autre-argent"] || "[]");
  const fond = JSON.parse(map["poto-timide-fond-caisse"] || "0");
  return {
    members: members.length,
    names: members.map((m) => m.name).join(", "),
    cotisTotal: Object.values(cotis).reduce((s, v) => s + Number(v || 0), 0),
    years: Object.keys(tournee.years || {}).join(","),
    amendes: amendes.length,
    evenements: evenements.length,
    prets: Array.isArray(prets) ? prets.length : 0,
    autre: autre.length,
    fond,
  };
}

async function rowsToMap(client, sql) {
  const result = await client.execute(sql);
  return result.rows || [];
}

async function main() {
  loadEnvFile();
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl || !tursoToken) {
    throw new Error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN manquants");
  }
  if (!fs.existsSync(LOCAL_DB)) {
    throw new Error(`Base locale introuvable : ${LOCAL_DB}`);
  }

  const local = createClient({ url: `file:${LOCAL_DB}` });
  const turso = createClient({ url: tursoUrl, authToken: tursoToken });

  const appRows = await rowsToMap(local, "SELECT key, value, updated_at FROM app_data");
  const userRows = await rowsToMap(
    local,
    "SELECT id, username, password_hash, must_change_password, created_at FROM users"
  );
  const sessionRows = await rowsToMap(local, "SELECT sid, sess, expired FROM sessions");

  if (!appRows.length) throw new Error("app_data locale vide — abandon");

  const localMap = {};
  for (const row of appRows) localMap[row.key] = row.value;
  const localSummary = summarize(localMap);
  console.log("Source locale :");
  console.log(`  Membres (${localSummary.members}) : ${localSummary.names}`);
  console.log(`  Cotisations : ${localSummary.cotisTotal} €`);
  console.log(`  Tournée : ${localSummary.years || "—"}`);
  console.log(
    `  Amendes ${localSummary.amendes} · Événements ${localSummary.evenements} · Prêts ${localSummary.prets} · Autre argent ${localSummary.autre} · Fond ${localSummary.fond}`
  );
  console.log(`  Comptes : ${userRows.map((u) => u.username).join(", ")}`);

  const baseline = {
    version: 2,
    source: "local-sqlite-push",
    description: "Planning et données figés depuis la base locale actuelle",
    exportedAt: new Date().toISOString(),
  };
  for (const key of PLANNING_KEYS) {
    if (localMap[key] !== undefined) baseline[key] = JSON.parse(localMap[key]);
  }
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`\nbaseline-planning.json mis à jour (${PLANNING_KEYS.length} clés).`);

  for (const sql of [
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
  ]) {
    await turso.execute(sql);
  }

  for (const row of appRows) {
    await turso.execute({
      sql: "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      args: [row.key, row.value, row.updated_at],
    });
  }
  const localAppKeys = appRows.map((row) => row.key);
  const remoteApp = await rowsToMap(turso, "SELECT key FROM app_data");
  for (const row of remoteApp) {
    if (!localAppKeys.includes(row.key)) {
      await turso.execute({ sql: "DELETE FROM app_data WHERE key = ?", args: [row.key] });
    }
  }

  for (const row of userRows) {
    await turso.execute({
      sql: "INSERT INTO users (id, username, password_hash, must_change_password, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET username = excluded.username, password_hash = excluded.password_hash, must_change_password = excluded.must_change_password, created_at = excluded.created_at",
      args: [row.id, row.username, row.password_hash, row.must_change_password, row.created_at],
    });
  }
  const localUserIds = new Set(userRows.map((row) => row.id));
  const localUserNames = new Set(userRows.map((row) => row.username));
  const remoteUsers = await rowsToMap(turso, "SELECT id, username FROM users");
  for (const row of remoteUsers) {
    if (!localUserIds.has(row.id)) {
      await turso.execute({ sql: "DELETE FROM users WHERE id = ?", args: [row.id] });
    }
  }

  const remoteSessions = await rowsToMap(turso, "SELECT sid FROM sessions");
  for (const row of remoteSessions) {
    await turso.execute({ sql: "DELETE FROM sessions WHERE sid = ?", args: [row.sid] });
  }

  const tursoApp = await rowsToMap(turso, "SELECT key, value FROM app_data");
  const tursoMap = {};
  for (const row of tursoApp) tursoMap[row.key] = row.value;
  const tursoUsers = await rowsToMap(turso, "SELECT username FROM users ORDER BY username");
  const tursoSummary = summarize(tursoMap);

  console.log("\nTurso après copie :");
  console.log(`  Membres (${tursoSummary.members}) : ${tursoSummary.names}`);
  console.log(`  Cotisations : ${tursoSummary.cotisTotal} €`);
  console.log(`  Tournée : ${tursoSummary.years || "—"}`);
  console.log(
    `  Amendes ${tursoSummary.amendes} · Événements ${tursoSummary.evenements} · Prêts ${tursoSummary.prets} · Autre argent ${tursoSummary.autre} · Fond ${tursoSummary.fond}`
  );
  console.log(`  Comptes : ${tursoUsers.map((u) => u.username).join(", ")}`);

  const revision = Date.now();
  await turso.execute({
    sql: "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    args: ["poto-timide-data-revision", JSON.stringify(revision)],
  });
  console.log(`Révision serveur : ${revision} (les vieux caches navigateur ne réécraseront pas la base)`);

  const mismatches = [];
  if (localSummary.members !== tursoSummary.members) mismatches.push("members");
  if (localSummary.names !== tursoSummary.names) mismatches.push("names");
  if (localSummary.cotisTotal !== tursoSummary.cotisTotal) mismatches.push("cotisations");
  if (localSummary.years !== tursoSummary.years) mismatches.push("tournee");
  if (localSummary.amendes !== tursoSummary.amendes) mismatches.push("amendes");
  if (localSummary.evenements !== tursoSummary.evenements) mismatches.push("evenements");
  if (userRows.length !== tursoUsers.length) mismatches.push("users");
  if (mismatches.length) {
    throw new Error(`Vérification échouée : ${mismatches.join(", ")}`);
  }

  console.log("\nCopie locale → Turso OK.");
}

main().catch((err) => {
  console.error("Échec :", err.message);
  process.exit(1);
});
