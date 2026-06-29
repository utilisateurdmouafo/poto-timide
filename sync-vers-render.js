/**
 * Synchronise les données locales (SQLite) vers Poto Timide en ligne (Render).
 *
 * Variables d'environnement optionnelles :
 *   POTO_SYNC_URL      — URL de base (défaut : https://poto-timide.onrender.com)
 *   POTO_SYNC_USER     — identifiant admin (défaut : dario)
 *   POTO_SYNC_PASSWORD — mot de passe admin
 */
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const STORAGE_KEYS = [
  "poto-timide-members",
  "poto-timide-roles",
  "poto-timide-cotisations",
  "poto-timide-tournee",
  "poto-timide-amendes",
  "poto-timide-amendes-caisse",
  "poto-timide-tab-permissions",
  "poto-timide-prets",
  "poto-timide-notifications",
  "poto-timide-evenements",
  "poto-timide-admin-ids",
  "poto-timide-autre-argent",
];

const DB_PATH = path.join(__dirname, "data", "poto-timide.db");
const SECRET_PATH = path.join(__dirname, "sync-secret.txt");
const BASE_URL = (process.env.POTO_SYNC_URL || "https://poto-timide.onrender.com").replace(/\/$/, "");
const USERNAME = process.env.POTO_SYNC_USER || "dario";
const PASSWORD = process.env.POTO_SYNC_PASSWORD || "1234";

function readSyncSecret() {
  if (process.env.POTO_SYNC_SECRET) return process.env.POTO_SYNC_SECRET.trim();
  if (fs.existsSync(SECRET_PATH)) {
    return fs.readFileSync(SECRET_PATH, "utf8").trim();
  }
  return "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mergeCookies(existing, incoming) {
  const jar = new Map();
  const parts = `${existing}; ${incoming}`.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || !trimmed.includes("=")) continue;
    const name = trimmed.split("=")[0].trim();
    jar.set(name, trimmed);
  }
  return [...jar.values()].join("; ");
}

function cookiesFromResponse(res, existing = "") {
  const setCookies = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : [];
  if (setCookies.length === 0) return existing;
  const incoming = setCookies.map((c) => c.split(";")[0]).join("; ");
  return mergeCookies(existing, incoming);
}

async function fetchJson(url, options = {}, cookies = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (cookies) headers.Cookie = cookies;

  const res = await fetch(url, { ...options, headers });
  const nextCookies = cookiesFromResponse(res, cookies);

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = body?.error || `Erreur HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return { body, cookies: nextCookies };
}

async function wakeUpServer() {
  console.log(`Réveil du serveur (${BASE_URL})…`);
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(90000) });
      if (res.status < 500) {
        console.log("Serveur en ligne.");
        return;
      }
    } catch {
      // Render gratuit : peut mettre ~30 s à démarrer
    }
    process.stdout.write(`  tentative ${attempt}/15…\r`);
    await sleep(5000);
  }
  throw new Error("Impossible de joindre le serveur Render. Réessayez dans quelques minutes.");
}

function readLocalData() {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Base locale introuvable : ${DB_PATH}`);
  }

  const db = new Database(DB_PATH, { readonly: true });
  const payload = {};
  const summary = [];

  for (const key of STORAGE_KEYS) {
    const row = db.prepare("SELECT value FROM app_data WHERE key = ?").get(key);
    if (!row) continue;
    const value = JSON.parse(row.value);
    payload[key] = value;

    let detail = "";
    if (key === "poto-timide-members" && Array.isArray(value)) {
      detail = `${value.length} membres`;
    } else if (key === "poto-timide-amendes" && Array.isArray(value)) {
      detail = `${value.length} amendes`;
    } else if (key === "poto-timide-evenements" && Array.isArray(value)) {
      detail = `${value.length} événements`;
    } else if (key === "poto-timide-tournee" && value?.years) {
      const years = Object.keys(value.years);
      detail = `années ${years.join(", ") || "—"}`;
    }
    summary.push({ key, detail });
  }

  const users = db
    .prepare("SELECT id, username, password_hash, must_change_password FROM users")
    .all()
    .map((user) => ({
      id: user.id,
      username: user.username,
      password_hash: user.password_hash,
      must_change_password: Boolean(user.must_change_password),
    }));

  db.close();

  if (!payload["poto-timide-members"]) {
    throw new Error("Aucun membre trouvé en local. Lancez d'abord l'app locale.");
  }

  return { payload, summary, users };
}

async function login() {
  const { body, cookies } = await fetchJson(
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    }
  );

  if (!body?.member) {
    throw new Error("Connexion échouée : réponse invalide.");
  }

  console.log(`Connecté en tant que ${body.member.name}${body.member.isAdmin ? " (admin)" : ""}.`);
  return cookies;
}

async function pushDataWithSecret(secret, payload, users) {
  await fetchJson(`${BASE_URL}/api/sync`, {
    method: "POST",
    body: JSON.stringify({ secret, data: payload, users }),
  });
}

async function pushDataWithSession(cookies, payload) {
  await fetchJson(
    `${BASE_URL}/api/data`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    cookies
  );
}

async function verifyRemote(cookies) {
  const { body } = await fetchJson(`${BASE_URL}/api/data`, {}, cookies);
  const members = body["poto-timide-members"] || [];
  const amendes = body["poto-timide-amendes"] || [];
  const evenements = body["poto-timide-evenements"] || [];
  const tournee = body["poto-timide-tournee"];
  const years = tournee?.years ? Object.keys(tournee.years) : [];

  console.log("\nVérification sur Render :");
  console.log(`  • ${members.length} membres (${members.map((m) => m.name).join(", ")})`);
  console.log(`  • ${amendes.length} amendes`);
  console.log(`  • ${evenements.length} événements`);
  console.log(`  • Tournée : ${years.length ? years.join(", ") : "aucune année"}`);
}

async function main() {
  console.log("=== Poto Timide — sync locale → Render ===\n");

  const { payload, summary, users } = readLocalData();
  const syncSecret = readSyncSecret();

  console.log("Données locales à envoyer :");
  for (const { key, detail } of summary) {
    console.log(`  • ${key}${detail ? ` — ${detail}` : ""}`);
  }
  console.log(`  • ${users.length} comptes utilisateurs`);
  console.log();

  await wakeUpServer();

  let cookies = "";
  if (syncSecret) {
    console.log("Envoi via clé de synchronisation…");
    await pushDataWithSecret(syncSecret, payload, users);
    console.log("Données envoyées avec succès.");
    try {
      cookies = await login();
    } catch {
      console.log("Vérification détaillée ignorée (connexion admin impossible).");
      console.log(`\nTerminé. Site : ${BASE_URL}`);
      return;
    }
  } else {
    console.log("Aucune clé sync-secret.txt — connexion admin requise.");
    cookies = await login();
    console.log("Envoi des données…");
    await pushDataWithSession(cookies, payload);
    console.log("Données envoyées avec succès.");
  }

  await verifyRemote(cookies);

  console.log(`\nTerminé. Site : ${BASE_URL}`);
}

main().catch((err) => {
  console.error("\nÉchec de la synchronisation :", err.message);
  if (err.status === 401) {
    console.error("Vérifiez POTO_SYNC_USER / POTO_SYNC_PASSWORD (mot de passe admin sur Render).");
  }
  process.exit(1);
});