const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 8080;
const DEFAULT_PASSWORD = "1234";
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "poto-timide.db");

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
`);

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

function syncUsersFromMembers(members) {
  if (!Array.isArray(members)) return;

  const memberIds = new Set(members.map((member) => member.id));
  members.forEach((member) => ensureUserForMember(member, false));

  db.prepare("SELECT id FROM users").all().forEach((user) => {
    if (!memberIds.has(user.id)) {
      db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
    }
  });
}

function seedDatabase() {
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
}

seedDatabase();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "5mb" }));

app.use(
  session({
    name: "poto.sid",
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

  ensureUserForMember(member, true);
  res.json({
    ok: true,
    message: `Mot de passe de ${member.name} réinitialisé à ${DEFAULT_PASSWORD}`,
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
  const payload = req.body || {};

  Object.entries(payload).forEach(([key, value]) => {
    if (STORAGE_KEYS.includes(key)) {
      setData(key, value);
    }
  });

  if (payload[MEMBERS_KEY]) {
    syncUsersFromMembers(payload[MEMBERS_KEY]);
  }

  res.json({ ok: true });
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