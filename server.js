const express = require("express");
const session = require("express-session");
const SessionStore = session.Store;
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 8080;
const DEFAULT_PASSWORD = "1234";
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "poto-timide.db");
const BACKUP_PATH = path.join(DATA_DIR, "backup-latest.json");

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
  "poto-timide-admin-ids",
  "poto-timide-autre-argent",
];

const MEMBERS_KEY = "poto-timide-members";
const ADMIN_IDS_KEY = "poto-timide-admin-ids";
const ADMIN_NAME = "Dario";
const OWNER_NAME = process.env.POTO_OWNER_NAME || ADMIN_NAME;

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    must_change_password INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS app_data (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expired INTEGER NOT NULL
  );
`);

class SqliteSessionStore extends SessionStore {
  constructor(database) {
    super();
    this.db = database;
  }

  get(sid, callback) {
    try {
      const row = this.db
        .prepare("SELECT sess FROM sessions WHERE sid = ? AND expired > ?")
        .get(sid, Date.now());
      if (!row) return callback(null, null);
      return callback(null, JSON.parse(row.sess));
    } catch (err) {
      return callback(err);
    }
  }

  set(sid, sess, callback) {
    try {
      const maxAge = sess?.cookie?.maxAge || 7 * 24 * 60 * 60 * 1000;
      this.db
        .prepare(
          "INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired"
        )
        .run(sid, JSON.stringify(sess), Date.now() + maxAge);
      return callback?.(null);
    } catch (err) {
      return callback?.(err);
    }
  }

  destroy(sid, callback) {
    try {
      this.db.prepare("DELETE FROM sessions WHERE sid = ?").run(sid);
      return callback?.(null);
    } catch (err) {
      return callback?.(err);
    }
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback);
  }
}

function backupDatabase() {
  try {
    const payload = {};
    STORAGE_KEYS.forEach((key) => {
      const value = getData(key);
      if (value !== null) payload[key] = value;
    });
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(payload));
  } catch (err) {
    console.warn("Sauvegarde locale impossible :", err.message);
  }
}

function restoreFromBackupIfNeeded() {
  if (getData(MEMBERS_KEY)) return false;
  if (!fs.existsSync(BACKUP_PATH)) return false;

  try {
    const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, "utf8"));
    if (!backup[MEMBERS_KEY]) return false;
    Object.entries(backup).forEach(([key, value]) => {
      if (STORAGE_KEYS.includes(key)) setData(key, value);
    });
    if (backup[MEMBERS_KEY]) syncUsersFromMembers(backup[MEMBERS_KEY]);
    enforceOwnerSafeguards();
    console.log("Données restaurées depuis backup-latest.json");
    return true;
  } catch (err) {
    console.warn("Restauration backup impossible :", err.message);
    return false;
  }
}

function getData(key) {
  const row = db.prepare("SELECT value FROM app_data WHERE key = ?").get(key);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

function setData(key, value) {
  db.prepare(
    "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run(key, JSON.stringify(value));
  backupDatabase();
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

function ensureUserForMember(member, forceReset = false) {
  const username = normalizeUsername(member.name);
  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(member.id);

  if (!existing) {
    db.prepare(
      "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, 1)"
    ).run(member.id, username, hashPassword(DEFAULT_PASSWORD));
    return;
  }

  if (existing.username !== username) {
    db.prepare("UPDATE users SET username = ? WHERE id = ?").run(username, member.id);
  }

  if (forceReset) {
    db.prepare(
      "UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?"
    ).run(hashPassword(DEFAULT_PASSWORD), member.id);
  }
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

function getOwnerId() {
  const members = getData(MEMBERS_KEY) || [];
  return findOwnerInMembers(members)?.id || getOwnerFallbackMember()?.id || null;
}

function isOwnerId(memberId) {
  const ownerId = getOwnerId();
  return Boolean(ownerId && memberId === ownerId);
}

function sortMembers(members) {
  return [...members].sort((a, b) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
  );
}

function sanitizePayloadForOwner(payload) {
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
      : getData(MEMBERS_KEY) || [];
    const owner = findOwnerInMembers(members) || ownerFallback;
    if (owner) {
      const adminIds = Array.isArray(sanitized[ADMIN_IDS_KEY])
        ? sanitized[ADMIN_IDS_KEY]
        : [];
      if (!adminIds.includes(owner.id)) {
        sanitized[ADMIN_IDS_KEY] = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
      }
    }
  }

  return sanitized;
}

function enforceOwnerSafeguards() {
  const ownerFallback = getOwnerFallbackMember();
  if (!ownerFallback) return;

  let members = getData(MEMBERS_KEY);
  if (!Array.isArray(members)) return;

  let owner = findOwnerInMembers(members);
  if (!owner) {
    members = sortMembers([...members, ownerFallback]);
    setData(MEMBERS_KEY, members);
    ensureUserForMember(ownerFallback, false);
    owner = ownerFallback;
  }

  let adminIds = getData(ADMIN_IDS_KEY) || [];
  if (!adminIds.includes(owner.id)) {
    adminIds = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
    setData(ADMIN_IDS_KEY, adminIds);
  }
}

function syncUsersFromMembers(members) {
  if (!Array.isArray(members)) return;

  const memberIds = new Set(members.map((member) => member.id));
  const ownerId = getOwnerId();
  members.forEach((member) => ensureUserForMember(member, false));

  db.prepare("SELECT id FROM users").all().forEach((user) => {
    if (!memberIds.has(user.id) && user.id !== ownerId) {
      db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
    }
  });
}

function seedDatabase() {
  restoreFromBackupIfNeeded();

  if (!getData(MEMBERS_KEY)) {
    const members = getDefaultMembers();
    setData(MEMBERS_KEY, members);
    members.forEach((m) => ensureUserForMember(m, false));

    const dario = members.find((m) => m.name.toLowerCase() === ADMIN_NAME.toLowerCase());
    if (dario) {
      setData(ADMIN_IDS_KEY, [dario.id]);
    }

    setData("poto-timide-roles", {});
    setData("poto-timide-cotisations", {});
    setData("poto-timide-tournee", { years: {} });
    setData("poto-timide-amendes", []);
    setData("poto-timide-amendes-caisse", []);
    setData("poto-timide-tab-permissions", {
      amendes: ["censeur", "tresorier"],
      tournee: [],
      prets: ["tresorier"],
      evenements: ["tresorier"],
    });
    setData("poto-timide-prets", []);
    setData("poto-timide-notifications", []);
    setData("poto-timide-evenements", []);
    setData("poto-timide-autre-argent", []);
    console.log("Base initialisée avec 15 membres (mot de passe : 1234)");
  } else {
    syncUsersFromMembers(getData(MEMBERS_KEY));
  }

  enforceOwnerSafeguards();
}

seedDatabase();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "5mb" }));

const sessionStore = new SqliteSessionStore(db);

setInterval(() => {
  try {
    db.prepare("DELETE FROM sessions WHERE expired <= ?").run(Date.now());
  } catch {
    /* ignore */
  }
}, 60 * 60 * 1000);

app.use(
  session({
    name: "poto.sid",
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "poto-timide-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Non connecté" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.isAdmin) {
    return res.status(403).json({ error: "Réservé aux administrateurs" });
  }
  next();
}

function findMemberById(id) {
  const members = getData(MEMBERS_KEY) || [];
  return members.find((m) => m.id === id) || null;
}

function isAdminId(memberId) {
  if (isOwnerId(memberId)) return true;
  const adminIds = getData(ADMIN_IDS_KEY) || [];
  return adminIds.includes(memberId);
}

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const normalized = normalizeUsername(username);

  if (!normalized || !password) {
    return res.status(400).json({ error: "Identifiant et mot de passe requis" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(normalized);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
  }

  const member = findMemberById(user.id);
  if (!member) {
    return res.status(401).json({ error: "Membre introuvable" });
  }

  req.session.userId = user.id;
  req.session.memberName = member.name;
  req.session.isAdmin = isAdminId(user.id);
  req.session.mustChangePassword = Boolean(user.must_change_password);

  res.json({
    member: {
      id: member.id,
      name: member.name,
      isAdmin: req.session.isAdmin,
    },
    mustChangePassword: req.session.mustChangePassword,
  });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/auth/session", (req, res) => {
  if (!req.session?.userId) {
    return res.json({ loggedIn: false });
  }

  const member = findMemberById(req.session.userId);
  if (!member) {
    req.session.destroy(() => {});
    return res.json({ loggedIn: false });
  }

  const user = db.prepare("SELECT must_change_password FROM users WHERE id = ?").get(req.session.userId);

  res.json({
    loggedIn: true,
    member: {
      id: member.id,
      name: member.name,
      isAdmin: isAdminId(member.id),
    },
    mustChangePassword: Boolean(user?.must_change_password),
  });
});

app.post("/api/auth/change-password", requireAuth, (req, res) => {
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

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: "Mot de passe actuel incorrect" });
  }

  db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?").run(
    hashPassword(newPassword),
    userId
  );

  req.session.mustChangePassword = false;
  res.json({ ok: true });
});

app.post("/api/admin/reset-password/:memberId", requireAuth, requireAdmin, (req, res) => {
  const { memberId } = req.params;
  const member = findMemberById(memberId);

  if (!member) {
    return res.status(404).json({ error: "Membre introuvable" });
  }

  if (isOwnerId(memberId) && !isOwnerId(req.session.userId)) {
    return res.status(403).json({ error: "Le propriétaire du site ne peut pas être réinitialisé par un autre admin" });
  }

  ensureUserForMember(member, true);
  res.json({
    ok: true,
    message: `Mot de passe de ${member.name} réinitialisé à ${DEFAULT_PASSWORD}`,
  });
});

app.get("/api/data/status", requireAuth, (req, res) => {
  const members = getData(MEMBERS_KEY) || [];
  const roles = getData("poto-timide-roles") || {};
  const cotisations = getData("poto-timide-cotisations") || {};
  const tournee = getData("poto-timide-tournee") || { years: {} };
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
});

app.get("/api/data", requireAuth, (req, res) => {
  const data = {};
  STORAGE_KEYS.forEach((key) => {
    const value = getData(key);
    if (value !== null) data[key] = value;
  });
  res.json(data);
});

app.put("/api/data", requireAuth, (req, res) => {
  const payload = sanitizePayloadForOwner(req.body || {});

  Object.entries(payload).forEach(([key, value]) => {
    if (STORAGE_KEYS.includes(key)) {
      setData(key, value);
    }
  });

  if (payload[MEMBERS_KEY]) {
    syncUsersFromMembers(payload[MEMBERS_KEY]);
  }

  enforceOwnerSafeguards();
  res.json({ ok: true });
});

const SYNC_SECRET = process.env.POTO_SYNC_SECRET;

function applySyncPayload(payload, users) {
  const safePayload = sanitizePayloadForOwner(payload);

  Object.entries(safePayload).forEach(([key, value]) => {
    if (STORAGE_KEYS.includes(key)) {
      setData(key, value);
    }
  });

  if (safePayload[MEMBERS_KEY]) {
    syncUsersFromMembers(safePayload[MEMBERS_KEY]);
  }

  if (Array.isArray(users)) {
    users.forEach((user) => {
      if (!user?.id || !user?.username || !user?.password_hash) return;
      const mustChange = user.must_change_password ? 1 : 0;
      const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(user.id);
      if (existing) {
        db.prepare(
          "UPDATE users SET username = ?, password_hash = ?, must_change_password = ? WHERE id = ?"
        ).run(user.username, user.password_hash, mustChange, user.id);
      } else {
        db.prepare(
          "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, ?)"
        ).run(user.id, user.username, user.password_hash, mustChange);
      }
    });
  }

  enforceOwnerSafeguards();
}

app.post("/api/sync", (req, res) => {
  if (!SYNC_SECRET) {
    return res.status(503).json({ error: "Synchronisation non configurée sur le serveur" });
  }

  const { secret, data, users } = req.body || {};
  if (secret !== SYNC_SECRET) {
    return res.status(403).json({ error: "Clé de synchronisation invalide" });
  }

  applySyncPayload(data || {}, users);
  res.json({ ok: true });
});

app.post("/api/owner/recover", (req, res) => {
  if (!SYNC_SECRET) {
    return res.status(503).json({ error: "Récupération non configurée sur le serveur" });
  }

  const { secret } = req.body || {};
  if (secret !== SYNC_SECRET) {
    return res.status(403).json({ error: "Clé de synchronisation invalide" });
  }

  enforceOwnerSafeguards();

  const owner = findOwnerInMembers(getData(MEMBERS_KEY) || []) || getOwnerFallbackMember();
  if (!owner) {
    return res.status(500).json({ error: "Propriétaire introuvable" });
  }

  ensureUserForMember(owner, false);

  res.json({
    ok: true,
    owner: { id: owner.id, name: owner.name },
    message: `${owner.name} est garanti administrateur. Utilisez sync-vers-render.bat pour restaurer vos mots de passe locaux.`,
  });
});

app.use(express.static(__dirname));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Route introuvable" });
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Poto Timide — http://localhost:${PORT}`);
  console.log(`Base SQLite : ${DB_PATH}`);
});