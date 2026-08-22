const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const SERVICE_ID = "srv-d91ap98js32c739deffg";

function readRenderApiKey() {
  const yamlPath = path.join(process.env.USERPROFILE || "", ".render", "cli.yaml");
  const yaml = fs.readFileSync(yamlPath, "utf8");
  const match = yaml.match(/key:\s*(\S+)/);
  if (!match) throw new Error("Clé API Render introuvable");
  return match[1];
}

function upsertEnv(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content.trimEnd()}\n${line}\n`;
}

async function main() {
  const apiKey = readRenderApiKey();
  const res = await fetch(`https://api.render.com/v1/services/${SERVICE_ID}/env-vars`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  });
  const rows = await res.json();
  if (!res.ok) throw new Error(`Render env-vars HTTP ${res.status}`);

  const map = {};
  for (const row of rows) {
    const ev = row.envVar || row;
    if (ev?.key) map[ev.key] = ev.value;
  }

  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "POTO_SYNC_SECRET"]) {
    if (!map[key]) throw new Error(`Variable manquante sur Render : ${key}`);
  }

  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  content = upsertEnv(content, "TURSO_DATABASE_URL", map.TURSO_DATABASE_URL);
  content = upsertEnv(content, "TURSO_AUTH_TOKEN", map.TURSO_AUTH_TOKEN);
  content = upsertEnv(content, "POTO_SYNC_SECRET", map.POTO_SYNC_SECRET);
  if (!/^NODE_ENV=/m.test(content)) content = upsertEnv(content, "NODE_ENV", "development");
  fs.writeFileSync(ENV_PATH, content.endsWith("\n") ? content : `${content}\n`);

  const host = String(map.TURSO_DATABASE_URL).replace(/^libsql:\/\//, "").split("/")[0];
  console.log("Variables Turso copiées dans .env");
  console.log(`Base Turso : ${host}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
