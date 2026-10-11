/**
 * Stockage SQL par entité (listes du site).
 * Chaque élément d'une liste app_data a une ligne dans `entities`.
 */
const ENTITY_KEY_TO_DOMAIN = {
  "poto-timide-members": "members",
  "poto-timide-prets": "loans",
  "poto-timide-evenements": "events",
  "poto-timide-amendes": "fines",
  "poto-timide-amendes-caisse": "fine_cash",
  "poto-timide-ancienne-tournee-dettes": "old_debts",
  "poto-timide-autre-argent": "cash_entries",
  "poto-timide-capital-hors-groupe": "capital",
  "poto-timide-communication": "communication",
  "poto-timide-loi": "loi",
  "poto-timide-guide": "guide",
  "poto-timide-notifications": "notifications",
  "poto-timide-messages": "messages",
  "poto-timide-audit-log": "audit_log",
  "poto-timide-login-log": "login_log",
};

const DOMAIN_TO_KEY = Object.fromEntries(
  Object.entries(ENTITY_KEY_TO_DOMAIN).map(([key, domain]) => [domain, key]),
);

function isEntityKey(key) {
  return Boolean(ENTITY_KEY_TO_DOMAIN[key]);
}

function domainForKey(key) {
  return ENTITY_KEY_TO_DOMAIN[key] || null;
}

async function ensureEntitiesTable(db) {
  await db.run(`CREATE TABLE IF NOT EXISTS entities (
    domain TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    PRIMARY KEY (domain, id)
  )`);
  await db.run(
    `CREATE INDEX IF NOT EXISTS idx_entities_domain_updated ON entities(domain, updated_at)`,
  );
}

async function countDomain(db, domain) {
  const row = await db.get(
    `SELECT COUNT(*) AS c FROM entities WHERE domain = ?`,
    [domain],
  );
  return Number(row?.c || 0);
}

async function loadDomainList(db, domain) {
  const rows = await db.all(
    `SELECT id, data, deleted_at FROM entities WHERE domain = ? ORDER BY updated_at DESC`,
    [domain],
  );
  const list = [];
  for (const row of rows || []) {
    try {
      const item = JSON.parse(row.data);
      if (!item || typeof item !== "object") continue;
      if (!item.id) item.id = row.id;
      if (row.deleted_at && !item.deletedAt) item.deletedAt = row.deleted_at;
      list.push(item);
    } catch {
      /* ignore bad row */
    }
  }
  return list;
}

/** Remplace tout le domaine par la liste fournie (source de vérité). */
async function replaceDomainList(db, domain, list) {
  const items = Array.isArray(list) ? list : [];
  const now = new Date().toISOString();
  // Charge ids existants
  const existing = await db.all(`SELECT id FROM entities WHERE domain = ?`, [domain]);
  const keep = new Set();

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const id = String(item.id || "");
    if (!id) continue;
    keep.add(id);
    const deletedAt = item.deletedAt ? String(item.deletedAt) : null;
    const updatedAt = String(item.updatedAt || item.createdAt || now);
    await db.run(
      `INSERT INTO entities (domain, id, data, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(domain, id) DO UPDATE SET
         data = excluded.data,
         updated_at = excluded.updated_at,
         deleted_at = excluded.deleted_at`,
      [domain, id, JSON.stringify(item), updatedAt, deletedAt],
    );
  }

  // Soft-delete rows no longer present: remove hard to match list source of truth
  for (const row of existing || []) {
    if (!keep.has(String(row.id))) {
      await db.run(`DELETE FROM entities WHERE domain = ? AND id = ?`, [domain, row.id]);
    }
  }
  return items.length;
}

/** Migre app_data → entities si le domaine SQL est vide. */
async function migrateKeyIfEmpty(db, key, value) {
  const domain = domainForKey(key);
  if (!domain) return false;
  if (!Array.isArray(value) || !value.length) return false;
  const count = await countDomain(db, domain);
  if (count > 0) return false;
  await replaceDomainList(db, domain, value);
  return true;
}

async function migrateAllFromAppData(db, getRawValue) {
  let migrated = 0;
  for (const [key, domain] of Object.entries(ENTITY_KEY_TO_DOMAIN)) {
    const count = await countDomain(db, domain);
    if (count > 0) continue;
    let value = null;
    try {
      value = await getRawValue(key);
    } catch {
      continue;
    }
    if (!Array.isArray(value) || !value.length) continue;
    await replaceDomainList(db, domain, value);
    migrated += 1;
    console.log(`[entities] migré ${domain}: ${value.length} lignes`);
  }
  return migrated;
}

module.exports = {
  ENTITY_KEY_TO_DOMAIN,
  DOMAIN_TO_KEY,
  isEntityKey,
  domainForKey,
  ensureEntitiesTable,
  countDomain,
  loadDomainList,
  replaceDomainList,
  migrateKeyIfEmpty,
  migrateAllFromAppData,
};
