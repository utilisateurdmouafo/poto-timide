require("./lib/load-env").loadEnvFile();

const express = require("express");
const session = require("express-session");
const SessionStore = session.Store;
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const db = require("./lib/db");

const PORT = process.env.PORT || 8080;
const DEFAULT_PASSWORD = "1234";
const DATA_DIR = path.join(__dirname, "data");
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
    await setData("poto-timide-tab-permissions", {
      amendes: ["censeur", "tresorier"],
      tournee: [],
      prets: ["tresorier"],
      evenements: ["tresorier"],
    });
    await setData("poto-timide-prets", []);
    await setData("poto-timide-notifications", []);
    await setData("poto-timide-evenements", []);
    await setData("poto-timide-autre-argent", []);
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
  await backupDatabase();
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
      await setData(key, value);
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

  app.use(express.json({ limit: "5mb" }));

  const sessionStore = new SqliteSessionStore();

  setInterval(() => {
    db.run("DELETE FROM sessions WHERE expired <= ?", [Date.now()]).catch(() => {});
  }, 60 * 60 * 1000);

  const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

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

  app.get("/api/data", requireAuth, async (req, res) => {
    try {
      const data = {};
      for (const key of STORAGE_KEYS) {
        const value = await getData(key);
        if (value !== null) data[key] = value;
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
        if (STORAGE_KEYS.includes(key)) {
          await setData(key, value);
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

  const SYNC_SECRET = process.env.POTO_SYNC_SECRET;

  app.post("/api/sync", async (req, res) => {
    try {
      if (!SYNC_SECRET) {
        return res.status(503).json({ error: "Synchronisation non configurée sur le serveur" });
      }

      const { secret, data, users } = req.body || {};
      if (secret !== SYNC_SECRET) {
        return res.status(403).json({ error: "Clé de synchronisation invalide" });
      }

      await applySyncPayload(data || {}, users);
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

  app.use(express.static(__dirname));

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