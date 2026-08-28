require("./lib/load-env").loadEnvFile();

const express = require("express");
const session = require("express-session");
const SessionStore = session.Store;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const db = require("./lib/db");
const { ensureFrozenPlanning } = require("./lib/default-planning");
const push = require("./lib/push");

const PORT = process.env.PORT || 8080;
const DEFAULT_PASSWORD = "1234";
const DATA_DIR = path.join(__dirname, "data");
const BACKUP_PATH = path.join(DATA_DIR, "backup-latest.json");
const FINANCE_KEY = "poto-timide-finance";
const FINANCE_JSON_PATH = path.join(__dirname, "finance-vitran.json");

const DEFAULT_MEMBER_NAMES = [
  "Yves", "Quentin", "Donald", "Hugo", "Elysée", "Ferlin", "William", "Luc",
  "David", "Boris", "Prince", "Dario", "Jp", "Fabrice", "Vitran",
];

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
  "poto-timide-communication",
  "poto-timide-admin-ids",
  "poto-timide-autre-argent",
  "poto-timide-ancienne-tournee-dettes",
  "poto-timide-finance",
  "poto-timide-fond-caisse",
  "poto-timide-fond-caisse-annuel",
  "poto-timide-financier-account",
  "poto-timide-data-revision",
];

const DUMP_KIND = "poto-timide-full-dump";
const DUMP_VERSION = 1;
const VAPID_STORE_KEY = push.VAPID_STORE_KEY || "poto-timide-vapid";
const IMPORT_CONFIRM_WORD = "RESTAURER";

const DEFAULT_TAB_PERMISSIONS = {
  membres: [],
  bureau: [],
  tournee: [],
  "ancienne-tournee": ["tresorier"],
  caisse: ["tresorier"],
  prets: ["tresorier"],
  amendes: ["censeur", "tresorier"],
  evenements: ["tresorier"],
  communication: ["president", "vice-president"],
};

const DEFAULT_FINANCIER_ACCOUNT = {
  iban: "BE76063676212495",
  holder: "Quenton Fozing",
  bank: "ING",
};

const EMPTY_APP_DEFAULTS = {
  "poto-timide-roles": {},
  "poto-timide-cotisations": {},
  "poto-timide-tournee": { years: {} },
  "poto-timide-amendes": [],
  "poto-timide-amendes-caisse": [],
  "poto-timide-tab-permissions": DEFAULT_TAB_PERMISSIONS,
  "poto-timide-prets": [],
  "poto-timide-notifications": [],
  "poto-timide-evenements": [],
  "poto-timide-communication": [],
  "poto-timide-autre-argent": [],
  "poto-timide-ancienne-tournee-dettes": [],
  "poto-timide-fond-caisse": 0,
  "poto-timide-fond-caisse-annuel": {},
  "poto-timide-financier-account": DEFAULT_FINANCIER_ACCOUNT,
};

const MEMBERS_KEY = "poto-timide-members";
const ADMIN_IDS_KEY = "poto-timide-admin-ids";
const ADMIN_NAME = "Dario";
const OWNER_NAME = process.env.POTO_OWNER_NAME || ADMIN_NAME;

fs.mkdirSync(DATA_DIR, { recursive: true });

class SqliteSessionStore extends SessionStore {
  get(sid, callback) {
    db.get("SELECT sess FROM sessions WHERE sid = ? AND expired > ?", [sid, Date.now()])
      .then((row) => {
        if (!row) return callback(null, null);
        return callback(null, JSON.parse(row.sess));
      })
      .catch((err) => callback(err));
  }

  set(sid, sess, callback) {
    const maxAge = sess?.cookie?.maxAge || 7 * 24 * 60 * 60 * 1000;
    db.run(
      "INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired",
      [sid, JSON.stringify(sess), Date.now() + maxAge]
    )
      .then(() => callback?.(null))
      .catch((err) => callback?.(err));
  }

  destroy(sid, callback) {
    db.run("DELETE FROM sessions WHERE sid = ?", [sid])
      .then(() => callback?.(null))
      .catch((err) => callback?.(err));
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback);
  }
}

async function getUsersSnapshot() {
  const users = await db.all(
    "SELECT id, username, password_hash, must_change_password FROM users"
  );
  return users.map((user) => ({
    id: user.id,
    username: user.username,
    password_hash: user.password_hash,
    must_change_password: Boolean(user.must_change_password),
  }));
}

async function restoreUsersFromSnapshot(users) {
  if (!Array.isArray(users) || users.length === 0) return 0;

  let restored = 0;
  for (const user of users) {
    if (!user?.id || !user?.username || !user?.password_hash) continue;
    const existing = await db.get("SELECT id FROM users WHERE id = ?", [user.id]);
    if (existing) continue;

    const mustChange = user.must_change_password ? 1 : 0;
    await db.run(
      "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, ?)",
      [user.id, user.username, user.password_hash, mustChange]
    );
    restored += 1;
  }

  return restored;
}

async function backupDatabase() {
  try {
    const payload = {};
    for (const key of STORAGE_KEYS) {
      const value = await getData(key);
      if (value !== null) payload[key] = value;
    }
    payload.users = await getUsersSnapshot();
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(payload));
  } catch (err) {
    console.warn("Sauvegarde locale impossible :", err.message);
  }
}

function readBackupFile() {
  if (!fs.existsSync(BACKUP_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(BACKUP_PATH, "utf8"));
  } catch (err) {
    console.warn("Lecture backup impossible :", err.message);
    return null;
  }
}

async function restoreFromBackupIfNeeded() {
  const backup = readBackupFile();
  if (!backup) return false;

  const needsDataRestore = !(await getData(MEMBERS_KEY)) && backup[MEMBERS_KEY];
  const userCountRow = await db.get("SELECT COUNT(*) AS c FROM users");
  const userCount = Number(userCountRow?.c || 0);
  const needsUsersRestore = userCount === 0 && Array.isArray(backup.users) && backup.users.length > 0;

  if (!needsDataRestore && !needsUsersRestore) return false;

  try {
    if (needsDataRestore) {
      for (const [key, value] of Object.entries(backup)) {
        if (!STORAGE_KEYS.includes(key)) continue;
        await db.run(
          "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
          [key, JSON.stringify(value)]
        );
      }
    }

    if (needsUsersRestore) {
      const restored = await restoreUsersFromSnapshot(backup.users);
      console.log(`${restored} compte(s) restauré(s) depuis backup-latest.json`);
    } else if (needsDataRestore && backup[MEMBERS_KEY]) {
      await syncUsersFromMembers(backup[MEMBERS_KEY]);
    }

    await enforceOwnerSafeguards();
    await backupDatabase();
    console.log("Données restaurées depuis backup-latest.json");
    return true;
  } catch (err) {
    console.warn("Restauration backup impossible :", err.message);
    return false;
  }
}

async function getData(key) {
  const row = await db.get("SELECT value FROM app_data WHERE key = ?", [key]);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

async function setData(key, value) {
  await db.run(
    "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    [key, JSON.stringify(value)]
  );
  backupDatabase().catch(() => {});
}

const MERGE_BY_ID_KEYS = new Set(["poto-timide-communication"]);

function itemTimestamp(item) {
  const raw = item?.updatedAt || item?.deletedAt || item?.createdAt || 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

function mergeById(existing, incoming) {
  const map = new Map();
  const add = (item) => {
    if (!item || typeof item !== "object" || !item.id) return;
    const prev = map.get(item.id);
    if (!prev || itemTimestamp(item) >= itemTimestamp(prev)) {
      map.set(item.id, item);
    }
  };
  (Array.isArray(existing) ? existing : []).forEach(add);
  (Array.isArray(incoming) ? incoming : []).forEach(add);
  return [...map.values()].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
}

async function persistStorageValue(key, value) {
  try {
    if (MERGE_BY_ID_KEYS.has(key)) {
      value = mergeById(await getData(key), value);
    }
    await setData(key, value);
    return value;
  } catch (err) {
    console.warn("Fusion/écriture impossible :", key, err.message);
    await setData(key, value);
    return value;
  }
}

function countStoredItems(value) {
  if (value === null || value === undefined) return 0;
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object") return Object.keys(value).length;
  return 1;
}

async function seedMissingAppData() {
  let seeded = 0;

  for (const [key, fallback] of Object.entries(EMPTY_APP_DEFAULTS)) {
    const existing = await getData(key);
    if (existing === null || existing === undefined) {
      await setData(key, fallback);
      seeded += 1;
    }
  }

  const perms = { ...((await getData("poto-timide-tab-permissions")) || {}) };
  let permsChanged = false;
  for (const [tabId, roles] of Object.entries(DEFAULT_TAB_PERMISSIONS)) {
    if (!Array.isArray(perms[tabId])) {
      perms[tabId] = roles;
      permsChanged = true;
    }
  }
  if (
    Array.isArray(perms.communication) &&
    perms.communication.length === 1 &&
    perms.communication[0] === "president"
  ) {
    perms.communication = ["president", "vice-president"];
    permsChanged = true;
  }
  if (permsChanged) await setData("poto-timide-tab-permissions", perms);

  const account = await getData("poto-timide-financier-account");
  const hasIban = account && typeof account === "object" && String(account.iban || "").trim();
  if (!hasIban) {
    await setData("poto-timide-financier-account", DEFAULT_FINANCIER_ACCOUNT);
  }

  if ((await getData("poto-timide-data-revision")) === null) {
    await setData("poto-timide-data-revision", Date.now());
  }

  if (seeded) {
    console.log(`${seeded} clé(s) manquante(s) initialisée(s) dans la base`);
  }
}

async function readStoredVapid() {
  const row = await db.get("SELECT value FROM app_data WHERE key = ?", [VAPID_STORE_KEY]);
  if (row?.value) {
    try {
      return JSON.parse(row.value);
    } catch {
      /* ignore */
    }
  }
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  }
  return null;
}

async function buildFullDump() {
  const data = {};
  for (const key of STORAGE_KEYS) {
    const value = await getData(key);
    if (value !== null) data[key] = value;
  }

  return {
    kind: DUMP_KIND,
    version: DUMP_VERSION,
    exportedAt: new Date().toISOString(),
    db: {
      mode: db.getDbMode(),
      label: db.getConnectionLabel(),
    },
    data,
    users: await getUsersSnapshot(),
    vapid: await readStoredVapid(),
    pushSubscriptions: await db.all(
      "SELECT id, user_id, endpoint, p256dh, auth, created_at FROM push_subscriptions"
    ),
  };
}

function isValidDump(dump) {
  return Boolean(dump && dump.kind === DUMP_KIND && dump.data && typeof dump.data === "object");
}

async function restorePushSubscriptions(subscriptions) {
  if (!Array.isArray(subscriptions) || !subscriptions.length) return 0;

  let restored = 0;
  for (const sub of subscriptions) {
    const endpoint = String(sub?.endpoint || "").trim();
    const userId = String(sub?.user_id || "").trim();
    const p256dh = String(sub?.p256dh || "").trim();
    const auth = String(sub?.auth || "").trim();
    if (!endpoint || !userId || !p256dh || !auth) continue;

    const existing = await db.get("SELECT id FROM push_subscriptions WHERE endpoint = ?", [endpoint]);
    if (existing?.id) {
      await db.run(
        "UPDATE push_subscriptions SET user_id = ?, p256dh = ?, auth = ? WHERE id = ?",
        [userId, p256dh, auth, existing.id]
      );
    } else {
      const id = String(sub.id || "").trim() || crypto.randomUUID();
      try {
        await db.run(
          "INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          [id, userId, endpoint, p256dh, auth, sub.created_at || new Date().toISOString()]
        );
      } catch {
        await db.run(
          "INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          [crypto.randomUUID(), userId, endpoint, p256dh, auth, sub.created_at || new Date().toISOString()]
        );
      }
    }
    restored += 1;
  }
  return restored;
}

async function restoreFullDump(dump) {
  if (!isValidDump(dump)) {
    throw new Error("Fichier de sauvegarde invalide");
  }

  await applySyncPayload(dump.data || {}, dump.users);

  if (dump.vapid?.publicKey && dump.vapid?.privateKey) {
    await push.replaceVapidKeys(dump.vapid);
  }

  const pushCount = await restorePushSubscriptions(dump.pushSubscriptions);
  await seedMissingAppData();
  await backupDatabase();

  return {
    keys: Object.keys(dump.data || {}).filter((key) => STORAGE_KEYS.includes(key)).length,
    users: Array.isArray(dump.users) ? dump.users.length : 0,
    push: pushCount,
  };
}

async function getDatabaseStatus() {
  const keys = [];
  for (const key of STORAGE_KEYS) {
    const row = await db.get("SELECT value, updated_at FROM app_data WHERE key = ?", [key]);
    let items = 0;
    let present = false;
    if (row?.value != null) {
      present = true;
      try {
        items = countStoredItems(JSON.parse(row.value));
      } catch {
        items = 0;
      }
    }
    keys.push({
      key: key.replace(/^poto-timide-/, ""),
      present,
      items,
      updatedAt: row?.updated_at || null,
    });
  }

  const userCountRow = await db.get("SELECT COUNT(*) AS c FROM users");
  const pushCountRow = await db.get("SELECT COUNT(*) AS c FROM push_subscriptions");
  const members = (await getData(MEMBERS_KEY)) || [];

  return {
    mode: db.getDbMode(),
    label: db.getConnectionLabel(),
    independentOfHost: db.getDbMode() === "turso",
    memberCount: Array.isArray(members) ? members.length : 0,
    userCount: Number(userCountRow?.c || 0),
    pushCount: Number(pushCountRow?.c || 0),
    keyCount: keys.filter((item) => item.present).length,
    keyTotal: STORAGE_KEYS.length,
    keys,
    generatedAt: new Date().toISOString(),
  };
}

function normalizeUsername(name) {
  return String(name || "").trim().toLowerCase();
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function getDefaultMembers() {
  const baseDate = "2025-01-18T00:00:00.000Z";
  return [...DEFAULT_MEMBER_NAMES]
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
    .map((name, index) => ({
      id: `default-${index + 1}`,
      name,
      createdAt: baseDate,
    }));
}

async function ensureUserForMember(member, forceReset = false) {
  const username = normalizeUsername(member.name);
  const existing = await db.get("SELECT * FROM users WHERE id = ?", [member.id]);
  let changed = false;

  if (!existing) {
    await db.run(
      "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, 1)",
      [member.id, username, hashPassword(DEFAULT_PASSWORD)]
    );
    changed = true;
  } else {
    if (existing.username !== username) {
      await db.run("UPDATE users SET username = ? WHERE id = ?", [username, member.id]);
      changed = true;
    }

    if (forceReset) {
      await db.run("UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?", [
        hashPassword(DEFAULT_PASSWORD),
        member.id,
      ]);
      changed = true;
    }
  }

  if (changed) backupDatabase().catch(() => {});
}

function findOwnerInMembers(members) {
  if (!Array.isArray(members)) return null;
  return (
    members.find((member) => member.name?.toLowerCase() === OWNER_NAME.toLowerCase()) || null
  );
}

function getOwnerFallbackMember() {
  return findOwnerInMembers(getDefaultMembers());
}

async function getOwnerId() {
  const members = (await getData(MEMBERS_KEY)) || [];
  return findOwnerInMembers(members)?.id || getOwnerFallbackMember()?.id || null;
}

async function isOwnerId(memberId) {
  const ownerId = await getOwnerId();
  return Boolean(ownerId && memberId === ownerId);
}

function sortMembers(members) {
  return [...members].sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
  );
}

async function sanitizePayloadForOwner(payload) {
  const sanitized = { ...payload };
  const ownerFallback = getOwnerFallbackMember();

  if (Array.isArray(sanitized[MEMBERS_KEY]) && ownerFallback) {
    const hasOwner = Boolean(findOwnerInMembers(sanitized[MEMBERS_KEY]));
    if (!hasOwner) {
      sanitized[MEMBERS_KEY] = sortMembers([...sanitized[MEMBERS_KEY], ownerFallback]);
    }
  }

  if (sanitized[ADMIN_IDS_KEY] !== undefined) {
    const members = Array.isArray(sanitized[MEMBERS_KEY])
      ? sanitized[MEMBERS_KEY]
      : (await getData(MEMBERS_KEY)) || [];
    const owner = findOwnerInMembers(members) || ownerFallback;
    if (owner) {
      const adminIds = Array.isArray(sanitized[ADMIN_IDS_KEY]) ? sanitized[ADMIN_IDS_KEY] : [];
      if (!adminIds.includes(owner.id)) {
        sanitized[ADMIN_IDS_KEY] = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
      }
    }
  }

  return sanitized;
}

async function enforceOwnerSafeguards() {
  const ownerFallback = getOwnerFallbackMember();
  if (!ownerFallback) return;

  let members = await getData(MEMBERS_KEY);
  if (!Array.isArray(members)) return;

  let owner = findOwnerInMembers(members);
  if (!owner) {
    members = sortMembers([...members, ownerFallback]);
    await setData(MEMBERS_KEY, members);
    await ensureUserForMember(ownerFallback, false);
    owner = ownerFallback;
  }

  let adminIds = (await getData(ADMIN_IDS_KEY)) || [];
  if (!adminIds.includes(owner.id)) {
    adminIds = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
    await setData(ADMIN_IDS_KEY, adminIds);
  }
}

async function syncUsersFromMembers(members) {
  if (!Array.isArray(members)) return;

  const memberIds = new Set(members.map((member) => member.id));
  const ownerId = await getOwnerId();

  for (const member of members) {
    await ensureUserForMember(member, false);
  }

  const users = await db.all("SELECT id FROM users");
  for (const user of users) {
    if (!memberIds.has(user.id) && user.id !== ownerId) {
      await db.run("DELETE FROM users WHERE id = ?", [user.id]);
    }
  }
}

async function seedDatabase() {
  await restoreFromBackupIfNeeded();

  if (!(await getData(MEMBERS_KEY))) {
    const members = getDefaultMembers();
    await setData(MEMBERS_KEY, members);
    for (const member of members) {
      await ensureUserForMember(member, false);
    }

    const dario = members.find((m) => m.name.toLowerCase() === ADMIN_NAME.toLowerCase());
    if (dario) {
      await setData(ADMIN_IDS_KEY, [dario.id]);
    }

    await setData("poto-timide-roles", {});
    await setData("poto-timide-cotisations", {});
    await setData("poto-timide-tournee", { years: {} });
    await setData("poto-timide-amendes", []);
    await setData("poto-timide-amendes-caisse", []);
    await setData("poto-timide-tab-permissions", { ...DEFAULT_TAB_PERMISSIONS });
    await setData("poto-timide-prets", []);
    await setData("poto-timide-notifications", []);
    await setData("poto-timide-evenements", []);
    await setData("poto-timide-communication", []);
    await setData("poto-timide-autre-argent", []);
    await setData("poto-timide-ancienne-tournee-dettes", []);
    await setData("poto-timide-fond-caisse", 0);
    await setData("poto-timide-fond-caisse-annuel", {});
    await setData("poto-timide-financier-account", DEFAULT_FINANCIER_ACCOUNT);
    console.log("Base initialisée avec 15 membres (mot de passe : 1234)");
  } else {
    let userCountRow = await db.get("SELECT COUNT(*) AS c FROM users");
    let userCount = Number(userCountRow?.c || 0);

    if (userCount === 0) {
      const backup = readBackupFile();
      if (backup?.users?.length) {
        await restoreUsersFromSnapshot(backup.users);
      }
    }

    userCountRow = await db.get("SELECT COUNT(*) AS c FROM users");
    userCount = Number(userCountRow?.c || 0);
    if (userCount === 0) {
      await syncUsersFromMembers(await getData(MEMBERS_KEY));
    }
  }

  await enforceOwnerSafeguards();
  await seedFinanceIfMissing();

  // Applique le planning figé seulement s'il manque (ne pas écraser les données live)
  await ensureFrozenPlanning(
    { getData, setData, ensureUserForMember },
    { force: false }
  );

  await seedMissingAppData();
  await backupDatabase();
}

async function seedFinanceIfMissing() {
  const existing = await getData(FINANCE_KEY);
  // Respect explicit wipe — do not re-import historical archive
  if (existing) {
    if (existing.cleared === true || existing.source === "cleared") return;
    return;
  }
  // Fresh installs only: leave finance empty (no auto Excel import)
  await setData(FINANCE_KEY, {
    cleared: true,
    source: "cleared",
    importedAt: null,
    cotisationTotal: 0,
    cotisations: [],
    cotisationMemberTotals: [],
    ancienneTournee: [],
    finances: { entries: [], exits: [], totalIn: 0, totalOut: 0, balance: 0 },
    amendesHistorique: { columns: [], rows: [] },
    pretsHistorique: [],
    equipeExcel: [],
  });
}

async function findMemberById(id) {
  const members = (await getData(MEMBERS_KEY)) || [];
  return members.find((m) => m.id === id) || null;
}

async function isAdminId(memberId) {
  if (await isOwnerId(memberId)) return true;
  const adminIds = (await getData(ADMIN_IDS_KEY)) || [];
  return adminIds.includes(memberId);
}

async function applySyncPayload(payload, users) {
  const safePayload = await sanitizePayloadForOwner(payload);

  for (const [key, value] of Object.entries(safePayload)) {
    if (STORAGE_KEYS.includes(key)) {
      await persistStorageValue(key, value);
    }
  }

  if (safePayload[MEMBERS_KEY]) {
    await syncUsersFromMembers(safePayload[MEMBERS_KEY]);
  }

  if (Array.isArray(users)) {
    for (const user of users) {
      if (!user?.id || !user?.username) continue;
      const mustChange = user.must_change_password ? 1 : 0;
      const existing = await db.get("SELECT * FROM users WHERE id = ?", [user.id]);

      if (existing) {
        if (existing.username !== user.username) {
          await db.run("UPDATE users SET username = ? WHERE id = ?", [user.username, user.id]);
        }
        if (
          user.password_hash &&
          !user.must_change_password &&
          user.password_hash !== existing.password_hash
        ) {
          await db.run("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?", [
            user.password_hash,
            user.id,
          ]);
        }
        continue;
      }

      if (!user.password_hash) continue;
      await db.run(
        "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, ?)",
        [user.id, user.username, user.password_hash, mustChange]
      );
    }
  }

  await enforceOwnerSafeguards();
  await backupDatabase();
}

function createApp() {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(express.json({ limit: "15mb" }));

  const sessionStore = new SqliteSessionStore();

  setInterval(() => {
    db.run("DELETE FROM sessions WHERE expired <= ?", [Date.now()]).catch(() => {});
  }, 60 * 60 * 1000);

  const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  const ONLINE_WINDOW_MS = 90 * 1000;
  const LAST_SEEN_TOUCH_MS = 15 * 1000;

  function touchLastSeen(req) {
    if (!req.session?.userId) return;
    const now = Date.now();
    if (!req.session.lastSeen || now - req.session.lastSeen > LAST_SEEN_TOUCH_MS) {
      req.session.lastSeen = now;
    }
  }

  async function getOnlineMembers() {
    const now = Date.now();
    const rows = await db.all("SELECT sess FROM sessions WHERE expired > ?", [now]);
    const byUser = new Map();

    for (const row of rows) {
      let sess;
      try {
        sess = JSON.parse(row.sess);
      } catch {
        continue;
      }
      if (!sess?.userId || !sess.lastSeen) continue;
      const lastSeen = Number(sess.lastSeen);
      if (!lastSeen || now - lastSeen > ONLINE_WINDOW_MS) continue;

      const prev = byUser.get(sess.userId);
      if (!prev || lastSeen > prev.lastSeen) {
        byUser.set(sess.userId, {
          id: sess.userId,
          name: sess.memberName || "",
          lastSeen,
          isAdmin: Boolean(sess.isAdmin),
        });
      }
    }

    for (const person of byUser.values()) {
      if (person.name) continue;
      const member = await findMemberById(person.id);
      person.name = member?.name || "Membre";
    }

    return [...byUser.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );
  }

  app.use(
    session({
      name: "poto.sid",
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "poto-timide-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: SESSION_MAX_AGE_MS,
        path: "/",
      },
    })
  );

  function requireAuth(req, res, next) {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Non connecté" });
    }
    touchLastSeen(req);
    next();
  }

  function requireAdmin(req, res, next) {
    if (!req.session?.isAdmin) {
      return res.status(403).json({ error: "Réservé aux administrateurs" });
    }
    next();
  }

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body || {};
      const normalized = normalizeUsername(username);

      if (!normalized || !password) {
        return res.status(400).json({ error: "Identifiant et mot de passe requis" });
      }

      const user = await db.get("SELECT * FROM users WHERE username = ?", [normalized]);
      if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
      }

      const member = await findMemberById(user.id);
      if (!member) {
        return res.status(401).json({ error: "Membre introuvable" });
      }

      req.session.userId = user.id;
      req.session.memberName = member.name;
      req.session.isAdmin = await isAdminId(user.id);
      req.session.mustChangePassword = Boolean(user.must_change_password);
      req.session.lastSeen = Date.now();

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ error: "Impossible de créer la session" });
        }
        res.json({
          member: {
            id: member.id,
            name: member.name,
            isAdmin: req.session.isAdmin,
          },
          mustChangePassword: req.session.mustChangePassword,
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/session", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.json({ loggedIn: false });
      }

      const member = await findMemberById(req.session.userId);
      if (!member) {
        req.session.destroy(() => {});
        return res.json({ loggedIn: false });
      }

      const user = await db.get("SELECT must_change_password FROM users WHERE id = ?", [
        req.session.userId,
      ]);

      req.session.isAdmin = await isAdminId(member.id);
      req.session.memberName = member.name;
      req.session.mustChangePassword = Boolean(user?.must_change_password);
      req.session.lastSeen = Date.now();

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ error: "Impossible de rafraîchir la session" });
        }
        res.json({
          loggedIn: true,
          member: {
            id: member.id,
            name: member.name,
            isAdmin: req.session.isAdmin,
          },
          mustChangePassword: req.session.mustChangePassword,
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/auth/online", requireAuth, async (req, res) => {
    try {
      const online = await getOnlineMembers();
      res.json({ online, count: online.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body || {};
      const userId = req.session.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Mots de passe requis" });
      }

      if (String(newPassword).length < 4) {
        return res.status(400).json({ error: "Le nouveau mot de passe doit faire au moins 4 caractères" });
      }

      if (newPassword === DEFAULT_PASSWORD) {
        return res.status(400).json({ error: "Choisissez un mot de passe différent de 1234" });
      }

      const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
      if (!user || !verifyPassword(currentPassword, user.password_hash)) {
        return res.status(401).json({ error: "Mot de passe actuel incorrect" });
      }

      await db.run("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?", [
        hashPassword(newPassword),
        userId,
      ]);

      await backupDatabase();
      req.session.mustChangePassword = false;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ error: "Mot de passe changé mais session non sauvegardée" });
        }
        res.json({ ok: true });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/admin/ensure-user/:memberId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { memberId } = req.params;
      const member = await findMemberById(memberId);

      if (!member) {
        return res.status(404).json({ error: "Membre introuvable" });
      }

      const existed = Boolean(await db.get("SELECT id FROM users WHERE id = ?", [memberId]));
      await ensureUserForMember(member, false);

      res.json({
        ok: true,
        created: !existed,
        message: existed
          ? `Le compte de ${member.name} existe déjà.`
          : `Compte créé pour ${member.name} (mot de passe : ${DEFAULT_PASSWORD})`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/admin/reset-password/:memberId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { memberId } = req.params;
      const member = await findMemberById(memberId);

      if (!member) {
        return res.status(404).json({ error: "Membre introuvable" });
      }

      if ((await isOwnerId(memberId)) && !(await isOwnerId(req.session.userId))) {
        return res
          .status(403)
          .json({ error: "Le propriétaire du site ne peut pas être réinitialisé par un autre admin" });
      }

      await ensureUserForMember(member, true);
      res.json({
        ok: true,
        message: `Mot de passe de ${member.name} réinitialisé à ${DEFAULT_PASSWORD}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/data/status", requireAuth, async (req, res) => {
    try {
      const members = (await getData(MEMBERS_KEY)) || [];
      const roles = (await getData("poto-timide-roles")) || {};
      const cotisations = (await getData("poto-timide-cotisations")) || {};
      const tournee = (await getData("poto-timide-tournee")) || { years: {} };
      res.json({
        memberCount: members.length,
        roleCount: Object.keys(roles).length,
        cotisationCount: Object.keys(cotisations).length,
        tourneeYears: Object.keys(tournee.years || {}),
        looksEmpty:
          Object.keys(roles).length === 0 &&
          Object.keys(cotisations).length === 0 &&
          Object.keys(tournee.years || {}).length === 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/push/public-key", requireAuth, async (req, res) => {
    try {
      const keys = await push.ensureVapidKeys();
      res.json({ publicKey: keys.publicKey });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Clé push indisponible" });
    }
  });

  app.post("/api/push/subscribe", requireAuth, async (req, res) => {
    try {
      await push.saveSubscription(req.session.userId, req.body || {});
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message || "Abonnement push impossible" });
    }
  });

  app.post("/api/push/unsubscribe", requireAuth, async (req, res) => {
    try {
      await push.deleteSubscription(req.session.userId, req.body?.endpoint);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Désabonnement impossible" });
    }
  });

  app.post("/api/push/send", requireAuth, async (req, res) => {
    try {
      const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
      if (!messages.length) return res.json({ ok: true, sent: 0 });

      const senderId = req.session.userId;
      let sent = 0;

      for (const message of messages) {
        const memberId = String(message?.memberId || "");
        if (!memberId || memberId === senderId) continue;
        const payload = {
          title: String(message.title || "Poto Timide").slice(0, 80),
          body: String(message.body || "").slice(0, 180),
          url: String(message.url || "/?tab=prets"),
          tab: String(message.tab || "prets"),
          admin: String(message.admin || ""),
          loanId: String(message.loanId || ""),
          item: String(message.item || ""),
          tag: String(message.tag || "poto-timide"),
        };
        const result = await push.sendToUserIds([memberId], payload);
        sent += result.sent;
      }

      res.json({ ok: true, sent });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Envoi de notification impossible" });
    }
  });

  app.get("/api/data", requireAuth, async (req, res) => {
    try {
      const data = {};
      for (const key of STORAGE_KEYS) {
        try {
          const value = await getData(key);
          if (value !== null) data[key] = value;
        } catch (err) {
          console.warn("Lecture clé impossible :", key, err.message);
        }
      }
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/data", requireAuth, async (req, res) => {
    try {
      const payload = await sanitizePayloadForOwner(req.body || {});

      for (const [key, value] of Object.entries(payload)) {
        if (!STORAGE_KEYS.includes(key)) continue;
        try {
          await persistStorageValue(key, value);
        } catch (err) {
          console.warn("Écriture clé impossible :", key, err.message);
        }
      }

      if (payload[MEMBERS_KEY]) {
        await syncUsersFromMembers(payload[MEMBERS_KEY]);
      }

      await enforceOwnerSafeguards();
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/db-status", requireAuth, requireAdmin, async (req, res) => {
    try {
      res.json(await getDatabaseStatus());
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Impossible de lire l'état de la base" });
    }
  });

  app.get("/api/admin/export", requireAuth, requireAdmin, async (req, res) => {
    try {
      const dump = await buildFullDump();
      const stamp = dump.exportedAt.slice(0, 10);
      res.setHeader("Content-Disposition", `attachment; filename="poto-timide-sauvegarde-${stamp}.json"`);
      res.json(dump);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Export impossible" });
    }
  });

  app.post("/api/admin/import", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { confirm, dump } = req.body || {};
      if (String(confirm || "").trim() !== IMPORT_CONFIRM_WORD) {
        return res.status(400).json({ error: `Tapez ${IMPORT_CONFIRM_WORD} pour confirmer la restauration` });
      }

      const summary = await restoreFullDump(dump);
      res.json({ ok: true, ...summary });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message || "Import impossible" });
    }
  });

  const SYNC_SECRET = process.env.POTO_SYNC_SECRET;

  app.get("/api/sync/export", async (req, res) => {
    try {
      if (!SYNC_SECRET) {
        return res.status(503).json({ error: "Synchronisation non configurée sur le serveur" });
      }
      const secret = req.get("x-poto-sync-secret") || req.query.secret;
      if (secret !== SYNC_SECRET) {
        return res.status(403).json({ error: "Clé de synchronisation invalide" });
      }
      res.json(await buildFullDump());
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Export impossible" });
    }
  });

  app.post("/api/sync", async (req, res) => {
    try {
      if (!SYNC_SECRET) {
        return res.status(503).json({ error: "Synchronisation non configurée sur le serveur" });
      }

      const payload = req.body || {};
      if (payload.secret !== SYNC_SECRET) {
        return res.status(403).json({ error: "Clé de synchronisation invalide" });
      }

      if (payload.kind === DUMP_KIND) {
        const summary = await restoreFullDump(payload);
        return res.json({ ok: true, ...summary });
      }

      await applySyncPayload(payload.data || {}, payload.users);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/owner/recover", async (req, res) => {
    try {
      if (!SYNC_SECRET) {
        return res.status(503).json({ error: "Récupération non configurée sur le serveur" });
      }

      const { secret } = req.body || {};
      if (secret !== SYNC_SECRET) {
        return res.status(403).json({ error: "Clé de synchronisation invalide" });
      }

      await enforceOwnerSafeguards();

      const owner =
        findOwnerInMembers((await getData(MEMBERS_KEY)) || []) || getOwnerFallbackMember();
      if (!owner) {
        return res.status(500).json({ error: "Propriétaire introuvable" });
      }

      await ensureUserForMember(owner, false);

      res.json({
        ok: true,
        owner: { id: owner.id, name: owner.name },
        message: `${owner.name} est garanti administrateur. Utilisez sync-vers-render.bat pour restaurer vos mots de passe locaux.`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.use(
    express.static(__dirname, {
      etag: false,
      lastModified: false,
      setHeaders(res, filePath) {
        if (/\.(html|js|css)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        }
        if (/\.webmanifest$/i.test(filePath)) {
          res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        }
      },
    })
  );

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Route introuvable" });
    }
    res.sendFile(path.join(__dirname, "index.html"));
  });

  return app;
}

async function main() {
  await db.init();
  await seedDatabase();
  await push.ensureVapidKeys();

  const app = createApp();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Poto Timide — http://localhost:${PORT}`);
    console.log(`Base de données : ${db.getConnectionLabel()}`);
  });
}

main().catch((err) => {
  console.error("Démarrage impossible :", err);
  process.exit(1);
});