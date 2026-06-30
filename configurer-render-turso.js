const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;
const SERVICE_ID = "srv-d91ap98js32c739deffg";
const RENDER_CLI_CONFIG = path.join(process.env.USERPROFILE || "", ".render", "cli.yaml");

function parseSimpleYaml(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const result = {};
  let current = null;
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.match(/^\s*/)[0].length;
    const trimmed = line.trim();
    if (indent === 0 && trimmed.endsWith(":")) {
      current = trimmed.slice(0, -1);
      result[current] = {};
      continue;
    }
    if (current && trimmed.includes(":")) {
      const idx = trimmed.indexOf(":");
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (!value) continue;
      result[current][key] = value;
    }
  }
  return result;
}

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) throw new Error(".env introuvable");
  const env = {};
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eq = trimmed.indexOf("=");
      if (eq < 0) return;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    });
  return env;
}

async function renderApi(method, pathname, body) {
  const config = parseSimpleYaml(RENDER_CLI_CONFIG);
  const apiKey = config.api?.key;
  if (!apiKey) throw new Error("Clé API Render introuvable dans ~/.render/cli.yaml");

  const res = await fetch(`https://api.render.com/v1${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
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
    throw new Error(data?.message || data?.error || text || `HTTP ${res.status}`);
  }
  return data;
}

async function setEnvVar(key, value) {
  await renderApi("PUT", `/services/${SERVICE_ID}/env-vars/${encodeURIComponent(key)}`, {
    value,
  });
  console.log(`  ${key} = OK`);
}

async function main() {
  const env = loadEnvFile();
  const tursoUrl = env.TURSO_DATABASE_URL;
  const tursoToken = env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    throw new Error("TURSO_DATABASE_URL et TURSO_AUTH_TOKEN requis dans .env");
  }

  console.log("Configuration Render — variables Turso");
  await setEnvVar("TURSO_DATABASE_URL", tursoUrl);
  await setEnvVar("TURSO_AUTH_TOKEN", tursoToken);

  console.log("\nDéploiement Render...");
  const renderCli = path.join(ROOT, "tools", "render", "cli_v2.19.0.exe");
  const deploy = spawnSync(renderCli, ["deploys", "create", SERVICE_ID, "--wait", "-o", "text", "--confirm"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
  });

  if (deploy.status !== 0) {
    throw new Error("Échec du déploiement Render");
  }

  console.log("\nVérification du site...");
  const res = await fetch("https://poto-timide.onrender.com/api/auth/session");
  const body = await res.json().catch(() => null);
  console.log("Session en ligne :", body?.loggedIn === false ? "serveur OK" : JSON.stringify(body));
}

main().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});