/**
 * Récupération d'urgence : garantit Dario comme admin sur Render.
 * Pour restaurer aussi le mot de passe, lancez ensuite sync-vers-render.bat
 */
const fs = require("fs");
const path = require("path");

const BASE_URL = (process.env.POTO_SYNC_URL || "https://poto-timide.onrender.com").replace(/\/$/, "");
const SECRET_PATH = path.join(__dirname, "sync-secret.txt");

function readSyncSecret() {
  if (process.env.POTO_SYNC_SECRET) return process.env.POTO_SYNC_SECRET.trim();
  if (fs.existsSync(SECRET_PATH)) return fs.readFileSync(SECRET_PATH, "utf8").trim();
  throw new Error("Clé introuvable. Vérifiez sync-secret.txt");
}

async function main() {
  const secret = readSyncSecret();
  console.log("=== Récupération accès propriétaire ===\n");

  const res = await fetch(`${BASE_URL}/api/owner/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Erreur HTTP ${res.status}`);
  }

  console.log(body.message || "Récupération OK.");
  if (body.owner?.name) {
    console.log(`Propriétaire : ${body.owner.name}`);
  }
  console.log("\nSi besoin, lancez sync-vers-render.bat pour remettre vos mots de passe locaux.");
}

main().catch((err) => {
  console.error("Échec :", err.message);
  process.exit(1);
});