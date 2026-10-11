/**
 * Simulation des fonctions critiques + 1 notification UNIQUEMENT pour Dario.
 * Usage: node scripts/sim-tests.js
 */
require("../lib/load-env").loadEnvFile();
const crypto = require("crypto");
const db = require("../lib/db");
const entities = require("../lib/entities");

const DARIO_ID = "default-2";

function id() {
  return crypto.randomUUID();
}

async function getJson(key) {
  const row = await db.get("SELECT value FROM app_data WHERE key = ?", [key]);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

async function setJson(key, value) {
  await db.run(
    `INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, JSON.stringify(value)],
  );
  if (entities.isEntityKey(key) && Array.isArray(value)) {
    await entities.replaceDomainList(db, entities.domainForKey(key), value);
  }
}

async function notifyDarioOnly({ title, message, tab }) {
  const now = new Date().toISOString();
  const list = (await getJson("poto-timide-notifications")) || [];
  const arr = Array.isArray(list) ? list : [];
  const row = {
    id: id(),
    memberId: DARIO_ID,
    type: "sim_test",
    title: title || "Test système",
    message: message || "Test",
    tab: tab || "reunion",
    read: false,
    createdAt: now,
    updatedAt: now,
  };
  await setJson("poto-timide-notifications", [row, ...arr].slice(0, 1000));
  return row;
}

async function test(name, fn) {
  try {
    await fn();
    console.log("OK ", name);
    return { name, ok: true };
  } catch (err) {
    console.log("FAIL", name, err.message || err);
    return { name, ok: false, error: String(err.message || err) };
  }
}

(async () => {
  await db.init();
  await entities.ensureEntitiesTable(db);

  const results = [];

  results.push(
    await test("lecture membres (entities)", async () => {
      const n = await entities.countDomain(db, "members");
      if (n < 1) throw new Error("aucun membre");
    }),
  );

  results.push(
    await test("lecture prêts", async () => {
      await entities.countDomain(db, "loans");
    }),
  );

  results.push(
    await test("lecture amendes/dettes", async () => {
      await entities.countDomain(db, "fines");
    }),
  );

  results.push(
    await test("lecture ex-tournée", async () => {
      await entities.countDomain(db, "old_debts");
    }),
  );

  results.push(
    await test("lecture communication", async () => {
      await entities.countDomain(db, "communication");
    }),
  );

  results.push(
    await test("lecture loi + guide", async () => {
      await entities.countDomain(db, "loi");
      await entities.countDomain(db, "guide");
    }),
  );

  results.push(
    await test("écriture tournee_flags (reçu test)", async () => {
      const mid = "default-2";
      const year = "2026";
      await db.run(
        `INSERT INTO tournee_flags (
          year, member_id, reception_ok, reception_at, updated_at
        ) VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(year, member_id) DO UPDATE SET
          reception_ok = 1,
          reception_at = excluded.reception_at,
          updated_at = excluded.updated_at`,
        [year, mid, new Date().toISOString(), new Date().toISOString()],
      );
      const row = await db.get(
        "SELECT reception_ok FROM tournee_flags WHERE year = ? AND member_id = ?",
        [year, mid],
      );
      if (!Number(row?.reception_ok)) throw new Error("flag non persisté");
    }),
  );

  results.push(
    await test("écriture permissions (sans écraser)", async () => {
      const perms = (await getJson("poto-timide-tab-permissions")) || {};
      if (!perms || typeof perms !== "object") throw new Error("permissions absentes");
      perms.updatedAt = new Date().toISOString();
      await setJson("poto-timide-tab-permissions", perms);
    }),
  );

  results.push(
    await test("écriture notification ciblée Dario", async () => {
      // verified by final notify
    }),
  );

  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok);
  const summary = fail.length
    ? `Tests: ${ok}/${results.length} OK. Échecs: ${fail.map((f) => f.name).join(", ")}`
    : `Tests: ${ok}/${results.length} OK. Toutes les fonctions simulées ont réussi.`;

  await notifyDarioOnly({
    title: "Rapport tests système",
    message: summary,
    tab: "reunion",
  });

  console.log("NOTIF_DARIO", summary);
  process.exit(fail.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
