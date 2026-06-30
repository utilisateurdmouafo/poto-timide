/**
 * Crée automatiquement la base Turso "poto-timide", génère les tokens,
 * remplit .env et migre les données locales.
 *
 * Variables requises (dans .env ou l'environnement) :
 *   TURSO_API_TOKEN  — token API Plateforme Turso
 *   TURSO_ORG        — slug de votre compte/organisation (ex: dmouafo)
 *
 * Usage : node setup-turso-auto.js
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;
const ENV_PATH = path.join(ROOT, ".env");
const DB_NAME = "poto-timide";
const API_BASE = "https://api.turso.tech/v1";

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

async function apiFetch(pathname, { method = "GET", body } = {}) {
  const token = process.env.TURSO_API_TOKEN;
  if (!token) throw new Error("TURSO_API_TOKEN manquant");

  const res = await fetch(`${API_BASE}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.error || data?.message || text || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

async function resolveOrgSlug() {
  if (process.env.TURSO_ORG) return process.env.TURSO_ORG;

  const me = await apiFetch("/user");
  const username = me?.user?.username || me?.username;
  if (username) {
    console.log(`Organisation détectée : ${username}`);
    return username;
  }

  const orgs = await apiFetch("/organizations");
  const first = orgs?.organizations?.[0]?.slug || orgs?.[0]?.slug;
  if (first) {
    console.log(`Organisation détectée : ${first}`);
    return first;
  }

  throw new Error("Impossible de détecter TURSO_ORG — ajoutez-le dans .env");
}

async function ensureDefaultGroup(org) {
  try {
    await apiFetch(`/organizations/${org}/groups/default`);
    return "default";
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  console.log("Création du groupe default (région fra)...");
  await apiFetch(`/organizations/${org}/groups`, {
    method: "POST",
    body: { name: "default", location: "fra" },
  });
  return "default";
}

async function ensureDatabase(org, group) {
  try {
    const existing = await apiFetch(`/organizations/${org}/databases/${DB_NAME}`);
    console.log(`Base existante : ${DB_NAME}`);
    return existing.database;
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  console.log(`Création de la base ${DB_NAME}...`);
  const created = await apiFetch(`/organizations/${org}/databases`, {
    method: "POST",
    body: { name: DB_NAME, group },
  });
  return created.database;
}

async function createDatabaseToken(org) {
  console.log("Génération du token d'accès à la base...");
  const tokenRes = await apiFetch(
    `/organizations/${org}/databases/${DB_NAME}/auth/tokens?expiration=never&authorization=full-access`,
    { method: "POST", body: {} }
  );
  if (!tokenRes?.jwt) throw new Error("Token base non reçu");
  return tokenRes.jwt;
}

function buildDatabaseUrl(org, hostname) {
  if (hostname) return `libsql://${hostname}`;
  return `libsql://${DB_NAME}-${org}.turso.io`;
}

function upsertEnvValue(key, value) {
  const line = `${key}=${value}`;
  let content = "";

  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, "utf8");
    const pattern = new RegExp(`^${key}=.*$`, "m");
    if (pattern.test(content)) {
      content = content.replace(pattern, line);
    } else {
      content = `${content.trimEnd()}\n${line}\n`;
    }
  } else if (fs.existsSync(path.join(ROOT, ".env.example"))) {
    content = `${fs.readFileSync(path.join(ROOT, ".env.example"), "utf8").trimEnd()}\n${line}\n`;
  } else {
    content = `${line}\n`;
  }

  fs.writeFileSync(ENV_PATH, content.endsWith("\n") ? content : `${content}\n`);
}

function runMigration() {
  console.log("\nMigration des données locales vers Turso...");
  const result = spawnSync(process.execPath, [path.join(ROOT, "migrate-to-turso.js")], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error("Échec de migrate-to-turso.js");
  }
}

async function main() {
  loadEnvFile();

  if (!process.env.TURSO_API_TOKEN) {
    console.error(`
ERREUR : il manque le token API Turso.

Ce dont j'ai besoin pour tout faire automatiquement :
  1) TURSO_API_TOKEN  — token API Plateforme (pas le token de la base)
  2) TURSO_ORG        — votre identifiant Turso (optionnel, détecté auto)

Comment les obtenir (2 minutes) :
  1. Créez un compte sur https://turso.tech
  2. Installez le CLI Turso (WSL) ou allez dans le dashboard
  3. Générez un token API :
       turso auth api-tokens mint poto-timide
  4. Mettez-le dans .env :
       TURSO_API_TOKEN=votre_token_ici
       TURSO_ORG=votre_nom_utilisateur

Puis relancez : node setup-turso-auto.js
`);
    process.exit(1);
  }

  const org = await resolveOrgSlug();
  const group = await ensureDefaultGroup(org);
  const database = await ensureDatabase(org, group);
  const dbToken = await createDatabaseToken(org);
  const dbUrl = buildDatabaseUrl(org, database?.Hostname);

  process.env.TURSO_DATABASE_URL = dbUrl;
  process.env.TURSO_AUTH_TOKEN = dbToken;
  process.env.TURSO_ORG = org;

  upsertEnvValue("TURSO_ORG", org);
  upsertEnvValue("TURSO_DATABASE_URL", dbUrl);
  upsertEnvValue("TURSO_AUTH_TOKEN", dbToken);

  console.log("\nConfiguration .env mise à jour.");
  console.log(`URL  : ${dbUrl}`);
  console.log(`Org  : ${org}`);

  if (fs.existsSync(path.join(ROOT, "data", "poto-timide.db"))) {
    runMigration();
  } else {
    console.log("\nPas de base locale — migration ignorée.");
  }

  console.log(`
Terminé !

Prochaine étape Render (dashboard) :
  TURSO_DATABASE_URL = ${dbUrl}
  TURSO_AUTH_TOKEN   = (copié dans .env)

Ne partagez jamais ces tokens publiquement.
`);
}

main().catch((err) => {
  console.error("Échec :", err.message);
  process.exit(1);
});