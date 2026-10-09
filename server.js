require("./lib/load-env").loadEnvFile();

const express = require("express");
const compression = require("compression");
const session = require("express-session");
const { createServer } = require("http");
const { Server } = require("socket.io");
const SessionStore = session.Store;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const db = require("./lib/db");
const { ensureFrozenPlanning } = require("./lib/default-planning");
const push = require("./lib/push");
const { applyGroupAction, advanceLoanStatuses } = require("./lib/group-actions");
const {
  canWriteSyncKey,
  hasSyncTabPermission,
  validateFineSyncValue,
  validateMemberListSyncValue,
  validatePersonalSyncValue,
} = require("./lib/sync-permissions");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const DEFAULT_PASSWORD = "1234";
const DATA_DIR = process.env.POTO_DATA_DIR
  ? path.resolve(process.env.POTO_DATA_DIR)
  : path.join(__dirname, "data");
let groupActionQueue = Promise.resolve();
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
  "poto-timide-loi",
  "poto-timide-guide",
  "poto-timide-admin-ids",
  "poto-timide-autre-argent",
  "poto-timide-capital-hors-groupe",
  "poto-timide-ancienne-tournee-dettes",
  "poto-timide-finance",
  "poto-timide-fond-caisse",
  "poto-timide-fond-caisse-annuel",
  "poto-timide-financier-account",
  "poto-timide-data-revision",
  "poto-timide-audit-log",
  "poto-timide-login-log",
  "poto-timide-messages",
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
  loi: [],
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
  "poto-timide-messages": [],
  "poto-timide-evenements": [],
  "poto-timide-audit-log": [],
  "poto-timide-communication": [],
  "poto-timide-loi": [],
  "poto-timide-guide": [],
  "poto-timide-autre-argent": [],
  "poto-timide-capital-hors-groupe": [],
  "poto-timide-ancienne-tournee-dettes": [],
  "poto-timide-fond-caisse": 0,
  "poto-timide-fond-caisse-annuel": {},
  "poto-timide-financier-account": DEFAULT_FINANCIER_ACCOUNT,
};

const MEMBERS_KEY = "poto-timide-members";
const ADMIN_IDS_KEY = "poto-timide-admin-ids";

function unwrapAdminIds(value) {
  if (Array.isArray(value)) return [...value];
  if (value && Array.isArray(value.ids)) return [...value.ids];
  return [];
}
const ADMIN_NAME = "Dario";
const OWNER_NAME = process.env.POTO_OWNER_NAME || ADMIN_NAME;

fs.mkdirSync(DATA_DIR, { recursive: true });

class SqliteSessionStore extends SessionStore {
  constructor() {
    super();
    this.cache = new Map();
  }

  get(sid, callback) {
    const cached = this.cache.get(sid);
    if (cached && cached.expired > Date.now()) {
      try {
        return callback(null, JSON.parse(cached.sess));
      } catch (err) {
        this.cache.delete(sid);
      }
    }

    db.get("SELECT sess, expired FROM sessions WHERE sid = ? AND expired > ?", [sid, Date.now()])
      .then((row) => {
        if (!row) {
          this.cache.delete(sid);
          return callback(null, null);
        }
        const expired = Number(row.expired);
        this.cache.set(sid, {
          sess: row.sess,
          expired: Number.isFinite(expired) ? expired : Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
        return callback(null, JSON.parse(row.sess));
      })
      .catch((err) => callback(err));
  }

  set(sid, sess, callback) {
    const maxAge = sess?.cookie?.maxAge || 7 * 24 * 60 * 60 * 1000;
    const payload = JSON.stringify(sess);
    const expired = Date.now() + maxAge;
    this.cache.set(sid, { sess: payload, expired });
    callback?.(null);
    db.run(
      "INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired",
      [sid, payload, expired]
    ).catch((err) => console.warn("Session non persistée :", err.message));
  }

  destroy(sid, callback) {
    this.cache.delete(sid);
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

const dataCache = new Map();
let dataCacheHydrated = false;

function parseCachedValue(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function hydrateDataCache() {
  const rows = await db.all("SELECT key, value FROM app_data");
  dataCache.clear();
  for (const row of rows) {
    dataCache.set(row.key, row.value);
  }
  dataCacheHydrated = true;
}

function unwrapStored(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, "data") &&
    value.updatedAt
  ) {
    return value.data;
  }
  return value;
}

async function getAllStoredData() {
  if (!dataCacheHydrated) await hydrateDataCache();
  const data = {};
  for (const key of STORAGE_KEYS) {
    if (!dataCache.has(key)) continue;
    const value = parseCachedValue(dataCache.get(key));
    if (value !== null) data[key] = value;
  }
  return data;
}

async function getRawData(key) {
  if (dataCache.has(key)) return parseCachedValue(dataCache.get(key));
  if (dataCacheHydrated) return null;

  const row = await db.get("SELECT value FROM app_data WHERE key = ?", [key]);
  if (!row) {
    dataCache.set(key, null);
    return null;
  }
  dataCache.set(key, row.value);
  return parseCachedValue(row.value);
}

async function getData(key) {
  return unwrapStored(await getRawData(key));
}

async function setData(key, value) {
  const encoded = JSON.stringify(value);
  await db.run(
    "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    [key, encoded]
  );
  dataCache.set(key, encoded);
  backupDatabase().catch(() => {});
}

const MERGE_BY_ID_KEYS = new Set([
  "poto-timide-capital-hors-groupe",
  "poto-timide-communication",
  "poto-timide-notifications",
  "poto-timide-loi",
  "poto-timide-guide",
  "poto-timide-audit-log",
  "poto-timide-login-log",
  "poto-timide-messages",
  "poto-timide-amendes",
  "poto-timide-amendes-caisse",
  "poto-timide-ancienne-tournee-dettes",
  "poto-timide-autre-argent",
  "poto-timide-members",
]);

function itemTimestamp(item) {
  const raw = item?.updatedAt || item?.deletedAt || item?.createdAt || item?.date || 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

function mergeById(existing, incoming) {
  const map = new Map();
  const add = (item) => {
    if (!item || typeof item !== "object" || !item.id) return;
    const id = String(item.id);
    const prev = map.get(id);
    if (!prev) {
      map.set(id, { ...item, id });
      return;
    }
    const itemNewer = itemTimestamp(item) >= itemTimestamp(prev);
    const winner = itemNewer ? item : prev;
    const loser = itemNewer ? prev : item;
    const merged = { ...loser, ...winner, id };

    // Suppression sticky : dès qu'un côté a deletedAt, on ne le perd JAMAIS
    const prevDel = prev.deletedAt ? new Date(prev.deletedAt).getTime() || 0 : 0;
    const nextDel = item.deletedAt ? new Date(item.deletedAt).getTime() || 0 : 0;
    if (prevDel || nextDel) {
      const delAt =
        nextDel >= prevDel && nextDel > 0
          ? item.deletedAt
          : prev.deletedAt || item.deletedAt;
      merged.deletedAt = delAt;
      merged.amount = 0;
      const delT = new Date(delAt).getTime() || 0;
      const winT = itemTimestamp(merged);
      if (delT >= winT) {
        merged.updatedAt = delAt;
      } else {
        merged.updatedAt = merged.updatedAt || delAt;
      }
    }
    map.set(id, merged);
  };
  (Array.isArray(existing) ? existing : []).forEach(add);
  (Array.isArray(incoming) ? incoming : []).forEach(add);
  return [...map.values()].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
}

function loanStatusRank(status) {
  const ranks = {
    voting: 1,
    awaiting_financier: 2,
    active: 3,
    defaulted: 3,
    completed: 4,
    rejected: 4,
  };
  return ranks[status] || 0;
}

function mergeLoanVotes(a, b) {
  const votes = {};
  if (a && typeof a === "object") Object.assign(votes, a);
  if (b && typeof b === "object") Object.assign(votes, b);
  return votes;
}

function mergeLoanRepayments(a, b) {
  const map = new Map();
  const addList = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((repay) => {
      if (!repay || typeof repay !== "object") return;
      const key = repay.id || `${repay.date || ""}-${repay.amount || 0}-${repay.recordedBy || ""}`;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, { ...repay, id: repay.id || key });
        return;
      }
      const prevT = new Date(prev.date || 0).getTime() || 0;
      const nextT = new Date(repay.date || 0).getTime() || 0;
      map.set(key, nextT >= prevT ? { ...prev, ...repay, id: prev.id || repay.id || key } : prev);
    });
  };
  addList(a);
  addList(b);
  return [...map.values()].sort((x, y) => {
    const tx = new Date(x.date || 0).getTime() || 0;
    const ty = new Date(y.date || 0).getTime() || 0;
    return ty - tx;
  });
}

function recomputeLoanRepaid(loan) {
  if (!loan || typeof loan !== "object") return loan;
  const list = Array.isArray(loan.repayments) ? loan.repayments : [];
  loan.totalRepaid =
    Math.round(list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) * 100) / 100;
  return loan;
}

/** Fusion des prêts : votes + remboursements (ne jamais perdre un paiement) */
function mergeLoansWithVotes(existing, incoming) {
  const existingList = Array.isArray(existing) ? existing : [];
  const incomingList = Array.isArray(incoming) ? incoming : [];
  const map = new Map();

  const add = (loan) => {
    if (!loan || typeof loan !== "object" || !loan.id) return;
    const prev = map.get(loan.id);
    if (!prev) {
      const seeded = {
        ...loan,
        votes: mergeLoanVotes(null, loan.votes),
        repayments: mergeLoanRepayments(null, loan.repayments),
      };
      map.set(loan.id, recomputeLoanRepaid(seeded));
      return;
    }

    const prevTime = new Date(prev.updatedAt || prev.deletedAt || prev.createdAt || 0).getTime() || 0;
    const nextTime = new Date(loan.updatedAt || loan.deletedAt || loan.createdAt || 0).getTime() || 0;
    const preferIncoming = nextTime >= prevTime;
    const base = preferIncoming ? loan : prev;
    const other = preferIncoming ? prev : loan;

    // Soft-delete collant : ne jamais faire réapparaître un prêt supprimé
    const prevDel = prev.deletedAt ? new Date(prev.deletedAt).getTime() || 0 : 0;
    const nextDel = loan.deletedAt ? new Date(loan.deletedAt).getTime() || 0 : 0;
    const newerDeleted =
      nextDel >= prevDel && nextDel > 0
        ? loan.deletedAt
        : prevDel > 0
          ? prev.deletedAt
          : null;

    let status = base.status;
    if (!newerDeleted && loanStatusRank(other.status) > loanStatusRank(base.status)) {
      status = other.status;
    }
    if (newerDeleted) status = "rejected";

    const mergedRepayments = mergeLoanRepayments(prev.repayments, loan.repayments);
    const totalRepaidMerged =
      Math.round(mergedRepayments.reduce((s, r) => s + (Number(r.amount) || 0), 0) * 100) / 100;
    const amountMerged = Math.round((Number(base.amount || other.amount) || 0) * 100) / 100;
    // Capital soldé → completed, sans intérêts (priorité absolue)
    let interestAmount = base.interestAmount ?? other.interestAmount ?? 0;
    let interestApplied = !!(base.interestApplied || other.interestApplied);
    if (amountMerged > 0 && totalRepaidMerged >= amountMerged) {
      status = "completed";
      interestAmount = 0;
      interestApplied = false;
    }

    const mergedUpdatedAt =
      nextTime >= prevTime
        ? loan.updatedAt || loan.deletedAt || prev.updatedAt || new Date().toISOString()
        : prev.updatedAt || prev.deletedAt || loan.updatedAt || new Date().toISOString();
    const finalUpdatedAt =
      newerDeleted && new Date(mergedUpdatedAt).getTime() < new Date(newerDeleted).getTime()
        ? newerDeleted
        : mergedUpdatedAt;

    const merged = {
      ...other,
      ...base,
      status,
      interestAmount,
      interestApplied,
      votes: mergeLoanVotes(prev.votes, loan.votes),
      repayments: mergedRepayments,
      totalRepaid: totalRepaidMerged,
      deletedAt: newerDeleted || null,
      updatedAt: finalUpdatedAt,
    };
    map.set(loan.id, recomputeLoanRepaid(merged));
  };

  existingList.forEach(add);
  incomingList.forEach(add);

  return [...map.values()].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
}

function objectUpdatedAt(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  const time = new Date(value.updatedAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

const VERSIONED_OBJECT_KEYS = new Set([
  "poto-timide-tab-permissions",
  "poto-timide-roles",
  "poto-timide-admin-ids",
]);


/** Clients SSE branchés pour la synchro quasi temps réel (votes prêts) */
const liveClients = new Set();
let liveSocketServer = null;

function broadcastLive(eventName, payload = {}) {
  liveSocketServer?.emit(eventName, payload);
  if (!liveClients.size) return;
  const body = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of [...liveClients]) {
    try {
      client.write(body);
      if (typeof client.flush === "function") client.flush();
    } catch {
      liveClients.delete(client);
    }
  }
}


/** Fusion profonde tournée : ne pas perdre receptionOk / ristourneOk */
function mergeTourneeOkMaps(a, b) {
  const norm = (v) => {
    if (v === true || v === 1 || v === "true") return { ok: true, at: "1970-01-01T00:00:00.000Z" };
    if (v && typeof v === "object" && ("ok" in v || "at" in v))
      return { ok: Boolean(v.ok), at: String(v.at || "1970-01-01T00:00:00.000Z") };
    return null;
  };
  const out = {};
  const ids = new Set([
    ...Object.keys(a && typeof a === "object" ? a : {}),
    ...Object.keys(b && typeof b === "object" ? b : {}),
  ]);
  for (const id of ids) {
    const ea = norm(a?.[id]);
    const eb = norm(b?.[id]);
    if (!ea && !eb) continue;
    if (!ea) { out[id] = eb; continue; }
    if (!eb) { out[id] = ea; continue; }
    const ta = new Date(ea.at).getTime() || 0;
    const tb = new Date(eb.at).getTime() || 0;
    out[id] = ta >= tb ? ea : eb;
  }
  return out;
}

function mergeTourneeYear(existingYear, incomingYear) {
  const base = existingYear && typeof existingYear === "object" ? { ...existingYear } : {};
  const inc = incomingYear && typeof incomingYear === "object" ? incomingYear : {};
  const out = { ...base, ...inc };

  // Maps OK : union (ne jamais perdre un OK déjà présent)
  for (const key of ["receptionOk", "ristourneOk", "bouffeOk"]) {
    if (base[key] || inc[key]) {
      out[key] = mergeTourneeOkMaps(base[key], inc[key]);
      if (!Object.keys(out[key]).length) delete out[key];
    }
  }

  // Ordres mois : préférer incoming s'il a des données, sinon garder base
  for (const key of ["reception", "ristourne"]) {
    if (inc[key] && typeof inc[key] === "object" && Object.keys(inc[key]).length > 0) {
      out[key] = inc[key];
    } else if (base[key]) {
      out[key] = base[key];
    }
  }

  if (inc.partners && typeof inc.partners === "object") out.partners = inc.partners;
  else if (base.partners) out.partners = base.partners;

  return out;
}

function mergeTourneeData(existing, incoming) {
  const a = existing && typeof existing === "object" ? existing : { years: {} };
  const b = incoming && typeof incoming === "object" ? incoming : { years: {} };
  const yearsA = a.years && typeof a.years === "object" ? a.years : {};
  const yearsB = b.years && typeof b.years === "object" ? b.years : {};
  const yearKeys = new Set([...Object.keys(yearsA), ...Object.keys(yearsB)]);
  const years = {};
  yearKeys.forEach((y) => {
    years[y] = mergeTourneeYear(yearsA[y], yearsB[y]);
  });
  const updatedAtA = new Date(a.updatedAt || 0).getTime() || 0;
  const updatedAtB = new Date(b.updatedAt || 0).getTime() || 0;
  return {
    years,
    updatedAt: new Date(Math.max(updatedAtA, updatedAtB, Date.now())).toISOString(),
  };
}


/** Fusion événements : union des paiements par membre (ne jamais perdre un "payé") */
function mergeEvenementPayments(a, b) {
  const out = {};
  const add = (src) => {
    if (!src || typeof src !== "object") return;
    Object.entries(src).forEach(([memberId, pay]) => {
      if (!pay || typeof pay !== "object") return;
      const prev = out[memberId];
      if (!prev) {
        out[memberId] = { ...pay };
        return;
      }
      const prevPaid = Boolean(prev.paid);
      const nextPaid = Boolean(pay.paid);
      const prevT = new Date(prev.paidAt || prev.updatedAt || prev.debtCreatedAt || 0).getTime() || 0;
      const nextT = new Date(pay.paidAt || pay.updatedAt || pay.debtCreatedAt || 0).getTime() || 0;
      let merged;
      if (nextPaid && !prevPaid) merged = { ...pay };
      else if (prevPaid && !nextPaid) merged = { ...prev };
      else if (nextT >= prevT) merged = { ...prev, ...pay };
      else merged = { ...pay, ...prev };

      // Dette annulée / supprimée : ne jamais ressusciter convertedToDebt
      if (prev.debtDismissed || pay.debtDismissed) {
        merged.debtDismissed = true;
        merged.debtDismissedAt =
          pay.debtDismissedAt || prev.debtDismissedAt || new Date().toISOString();
        delete merged.convertedToDebt;
        delete merged.debtCreatedAt;
      }
      out[memberId] = merged;
    });
  };
  add(a);
  add(b);
  return out;
}

function mergeEvenementsWithPayments(existing, incoming) {
  const map = new Map();
  const add = (evt) => {
    if (!evt || typeof evt !== "object" || !evt.id) return;
    const prev = map.get(evt.id);
    if (!prev) {
      map.set(evt.id, { ...evt, payments: { ...(evt.payments || {}) } });
      return;
    }
    const prevT = itemTimestamp(prev);
    const nextT = itemTimestamp(evt);
    const base = nextT >= prevT ? evt : prev;
    const other = nextT >= prevT ? prev : evt;
    map.set(evt.id, {
      ...other,
      ...base,
      payments: mergeEvenementPayments(prev.payments, evt.payments),
      updatedAt:
        nextT >= prevT
          ? evt.updatedAt || prev.updatedAt || new Date().toISOString()
          : prev.updatedAt || evt.updatedAt || new Date().toISOString(),
    });
  };
  (Array.isArray(existing) ? existing : []).forEach(add);
  (Array.isArray(incoming) ? incoming : []).forEach(add);
  return [...map.values()].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
}

async function persistStorageValue(key, value) {
  try {
    const existingRaw = await getRawData(key);
    if (key === "poto-timide-members") {
      // La liste complète est la source de vérité : une suppression doit rester supprimée.
      value = unwrapStored(value) || [];
    } else if (key === "poto-timide-prets") {
      value = mergeLoansWithVotes(unwrapStored(existingRaw) || [], unwrapStored(value) || []);
    } else if (key === "poto-timide-evenements") {
      value = mergeEvenementsWithPayments(unwrapStored(existingRaw) || [], unwrapStored(value) || []);
    } else if (key === "poto-timide-tournee") {
      value = mergeTourneeData(unwrapStored(existingRaw) || { years: {} }, unwrapStored(value) || { years: {} });
    } else if (MERGE_BY_ID_KEYS.has(key)) {
      value = mergeById(unwrapStored(existingRaw) || [], unwrapStored(value) || []);
    } else if (objectUpdatedAt(existingRaw) > objectUpdatedAt(value)) {
      return unwrapStored(existingRaw);
    }
    await setData(key, value);
    return unwrapStored(value);
  } catch (err) {
    console.warn("Fusion/écriture impossible :", key, err.message);
    await setData(key, value);
    return unwrapStored(value);
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
  if (!username || !member?.id) return;
  const existing = await db.get("SELECT * FROM users WHERE id = ?", [member.id]);
  let changed = false;

  if (!existing) {
    // username déjà pris par un autre id → ne pas planter le démarrage
    const byName = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (byName) {
      // Réutilise le compte existant : on ne recrée pas
      if (forceReset) {
        try {
          await db.run("UPDATE users SET password_hash = ?, must_change_password = 1 WHERE username = ?", [
            hashPassword(DEFAULT_PASSWORD),
            username,
          ]);
          changed = true;
        } catch (e) {
          console.warn("ensureUserForMember forceReset:", e?.message || e);
        }
      }
    } else {
      try {
        await db.run(
          "INSERT INTO users (id, username, password_hash, must_change_password) VALUES (?, ?, ?, 1)",
          [member.id, username, hashPassword(DEFAULT_PASSWORD)]
        );
        changed = true;
      } catch (e) {
        // UNIQUE username / id : ignore (seed concurrent ou déjà présent)
        const msg = String(e?.message || e || "");
        if (!/UNIQUE|constraint/i.test(msg)) throw e;
        console.warn("ensureUserForMember insert ignoré:", msg);
      }
    }
  } else {
    if (existing.username !== username) {
      try {
        await db.run("UPDATE users SET username = ? WHERE id = ?", [username, member.id]);
        changed = true;
      } catch (e) {
        const msg = String(e?.message || e || "");
        if (!/UNIQUE|constraint/i.test(msg)) throw e;
        console.warn("ensureUserForMember rename ignoré:", msg);
      }
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
  delete sanitized.__silent;
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
      const raw = sanitized[ADMIN_IDS_KEY];
      const adminIds = unwrapAdminIds(raw);
      if (!adminIds.includes(owner.id)) {
        const next = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
        sanitized[ADMIN_IDS_KEY] = Array.isArray(raw)
          ? next
          : { ...(raw && typeof raw === "object" ? raw : {}), ids: next, updatedAt: raw?.updatedAt || new Date().toISOString() };
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

  const storedAdmins = await getData(ADMIN_IDS_KEY);
  let adminIds = unwrapAdminIds(storedAdmins);
  if (!adminIds.includes(owner.id)) {
    adminIds = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
    await setData(
      ADMIN_IDS_KEY,
      Array.isArray(storedAdmins)
        ? adminIds
        : { ...(storedAdmins && typeof storedAdmins === "object" ? storedAdmins : {}), ids: adminIds, updatedAt: storedAdmins?.updatedAt || new Date().toISOString() }
    );
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
  const adminIds = unwrapAdminIds(await getData(ADMIN_IDS_KEY));
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

  app.use(compression());
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

  const sessionMiddleware = session({
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
  });
  app.use(sessionMiddleware);
  app.locals.sessionMiddleware = sessionMiddleware;

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

  
const LOGIN_LOG_KEY = "poto-timide-login-log";
const LOGIN_LOG_MAX = 5000;
/** Si un poto était absent plus longtemps que ça, une nouvelle présence = nouvelle ligne journal */
const PRESENCE_GAP_MS = 30 * 60 * 1000; // nouvelle ligne seulement après 30 min d'absence

function parisDay(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

async function appendPresenceLogEntry(person) {
  if (!person?.id) return;
  try {
    const now = new Date();
    const entry = {
      id: `presence-${person.id}-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      memberId: person.id,
      memberName: person.name || "—",
      at: now.toISOString(),
      day: parisDay(now),
      source: "online",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    let list = (await getData(LOGIN_LOG_KEY)) || [];
    if (!Array.isArray(list)) list = [];
    list.unshift(entry);
    if (list.length > LOGIN_LOG_MAX) list = list.slice(0, LOGIN_LOG_MAX);
    await setData(LOGIN_LOG_KEY, list);
  } catch (err) {
    console.warn("appendPresenceLogEntry:", err?.message || err);
  }
}

/**
 * Basé sur "Connectés en ce moment" :
 * si un membre est en ligne et n'a pas de ligne récente (< PRESENCE_GAP), on ajoute heure + nom.
 */
async function syncPresenceLogFromOnline(onlineList) {
  if (!Array.isArray(onlineList) || !onlineList.length) return;
  try {
    let list = (await getData(LOGIN_LOG_KEY)) || [];
    if (!Array.isArray(list)) list = [];
    const now = Date.now();
    let changed = false;

    for (const person of onlineList) {
      if (!person?.id) continue;
      const latest = list.find((e) => e && String(e.memberId) === String(person.id) && !e.deletedAt);
      const latestAt = latest?.at ? new Date(latest.at).getTime() : 0;
      if (latestAt && now - latestAt < PRESENCE_GAP_MS) continue;

      const ts = new Date();
      list.unshift({
        id: `presence-${person.id}-${ts.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        memberId: person.id,
        memberName: person.name || "—",
        at: ts.toISOString(),
        day: parisDay(ts),
        source: "online",
        createdAt: ts.toISOString(),
        updatedAt: ts.toISOString(),
      });
      changed = true;
    }

    if (changed) {
      if (list.length > LOGIN_LOG_MAX) list = list.slice(0, LOGIN_LOG_MAX);
      await setData(LOGIN_LOG_KEY, list);
    }
  } catch (err) {
    console.warn("syncPresenceLogFromOnline:", err?.message || err);
  }
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

      const members = (await getData(MEMBERS_KEY)) || [];
      const member = members.find((m) => m.id === user.id) || null;
      if (!member) {
        return res.status(401).json({ error: "Membre introuvable" });
      }

      const ownerId = findOwnerInMembers(members)?.id || getOwnerFallbackMember()?.id || null;
      const adminIds = unwrapAdminIds(await getData(ADMIN_IDS_KEY));
      req.session.userId = user.id;
      req.session.memberName = member.name;
      req.session.isAdmin = Boolean(
        (ownerId && user.id === ownerId) || adminIds.includes(user.id)
      );
      req.session.mustChangePassword = Boolean(user.must_change_password);
      req.session.lastSeen = Date.now();

      // Présence journalisée via /api/auth/online (Connectés en ce moment)
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
    const userId = req.session?.userId;
    req.session.destroy((err) => {
      if (err) {
        console.error("Déconnexion impossible :", err);
        return res.status(500).json({ error: "Déconnexion impossible" });
      }
      if (userId) liveSocketServer?.in(`user:${userId}`).disconnectSockets(true);
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
      touchLastSeen(req);
      const online = await getOnlineMembers();
      // Journal basé sur les connectés en ce moment
      try {
        await syncPresenceLogFromOnline(online);
      } catch (e) {
        console.warn("presence log:", e?.message || e);
      }
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
      res.json(await getAllStoredData());
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/actions", requireAuth, async (req, res) => {
    const runAction = async () => {
      const member = await findMemberById(req.session.userId);
      if (!member) {
        const error = new Error("Membre introuvable.");
        error.status = 403;
        throw error;
      }
      const [storedRoles, storedPermissions] = await Promise.all([
        getData("poto-timide-roles"),
        getData("poto-timide-tab-permissions"),
      ]);
      const roles = storedRoles && typeof storedRoles === "object" ? storedRoles : {};
      const roleIds = Object.entries(roles)
        .filter(([, memberId]) => String(memberId) === String(member.id))
        .map(([roleId]) => roleId);
      const permissions =
        storedPermissions && typeof storedPermissions === "object"
          ? storedPermissions
          : DEFAULT_TAB_PERMISSIONS;
      const isAdmin = await isAdminId(member.id);
      const hasTab = (tab) =>
        roleIds.some((roleId) => Array.isArray(permissions[tab]) && permissions[tab].includes(roleId));
      const isTreasurer = isAdmin || roleIds.includes("tresorier");
      const action = req.body || {};
      const canManageLoans =
        isTreasurer || hasTab("prets");
      const canManageFines =
        isTreasurer || hasTab("amendes") || hasTab("ancienne-tournee");
      const canManageFund = isTreasurer || hasTab("caisse") || hasTab("tournee");
      const canManageEvents = isTreasurer || hasTab("evenements");
      const state = await getAllStoredData();
      const canManageMembers = isAdmin || hasTab("membres");
      const applied = applyGroupAction(
        state,
        {
          id: member.id,
          isAdmin,
          canManageLoans,
          canManageFines,
          canManageFund,
          canManageEvents,
          canManageMembers,
          ownerId: action.domain === "member" ? await getOwnerId() : null,
        },
        action,
      );

      for (const key of applied.changedKeys) {
        await setData(key, applied.data[key]);
      }
      if (applied.changedKeys.includes(MEMBERS_KEY)) {
        await syncUsersFromMembers(applied.data[MEMBERS_KEY]);
        await enforceOwnerSafeguards();
      }
      // Push téléphone pour les notifs créées par l’action métier
      if (applied.changedKeys.includes("poto-timide-notifications") && !action.silent) {
        try {
          const notifs = Array.isArray(applied.data["poto-timide-notifications"])
            ? applied.data["poto-timide-notifications"]
            : [];
          const recent = notifs.slice(0, 80);
          const byUser = new Map();
          for (const n of recent) {
            if (!n?.memberId || n.read) continue;
            // n’envoyer que les toutes nouvelles (créées dans les 2 dernières minutes)
            const age = Date.now() - new Date(n.createdAt || 0).getTime();
            if (age > 120000) continue;
            if (!byUser.has(n.memberId)) byUser.set(n.memberId, n);
          }
          await Promise.all(
            [...byUser.entries()].map(([memberId, n]) =>
              push.sendToUserIds([memberId], {
                title: n.title || "Poto Timide",
                body: n.message || "Nouvelle activité",
                url: `/?tab=${encodeURIComponent(n.tab || "reunion")}`,
                tab: n.tab || "reunion",
                loanId: n.loanId || "",
                item: n.item || "",
                tag: `poto-action-${n.id || Date.now()}`,
              }).catch(() => {}),
            ),
          );
        } catch (err) {
          console.warn("Push action:", err.message || err);
        }
      }
      await backupDatabase();
      broadcastLive("data", {
        keys: applied.changedKeys,
        at: new Date().toISOString(),
        action: `${action.domain}.${action.type}`,
      });
      res.json({ ok: true, result: applied.result, data: applied.data });
    };

    const queued = groupActionQueue.then(runAction, runAction);
    groupActionQueue = queued.then(
      () => undefined,
      () => undefined,
    );
    try {
      await queued;
    } catch (err) {
      const status = Number(err.status) || 500;
      if (status === 500) console.error("Opération métier impossible :", err);
      res.status(status).json({ error: status === 500 ? "Erreur serveur" : err.message });
    }
  });


  const NOTIFY_DOMAINS = {
    "poto-timide-communication": { title: "Communication", tab: "communication", label: "une publication" },
    "poto-timide-evenements": { title: "Événements", tab: "evenements", label: "un événement / cotisation" },
    "poto-timide-amendes": { title: "Dettes & amendes", tab: "amendes", label: "une amende ou dette" },
    "poto-timide-ancienne-tournee-dettes": { title: "Ex tournée", tab: "amendes", label: "une dette d’ex tournée" },
    "poto-timide-prets": { title: "Prêts", tab: "prets", label: "un prêt" },
    "poto-timide-finance": { title: "Finance", tab: "finance", label: "une opération de caisse" },
    "poto-timide-fond-caisse-annuel": { title: "Fond de caisse", tab: "fond-caisse", label: "le fond de caisse" },
    "poto-timide-fond-caisse": { title: "Fond de caisse", tab: "fond-caisse", label: "le fond de caisse" },
    "poto-timide-tournee": { title: "Tournée", tab: "tournee", label: "la tournée" },
    "poto-timide-loi": { title: "La loi", tab: "loi", label: "La loi" },
    "poto-timide-guide": { title: "Guide", tab: "communication", label: "le guide du site" },
    "poto-timide-cotisations": { title: "Tournée", tab: "tournee", label: "les cotisations" },
  };

  async function notifyAllMembers({ actor, type, title, message, tab, item, loanId, silent }) {
    if (silent) return { created: 0, pushed: 0 };
    const membersRaw = unwrapStored(await getData(MEMBERS_KEY)) || [];
    const members = (Array.isArray(membersRaw) ? membersRaw : []).filter(
      (m) => m && m.kind !== "nouveau" && m.id,
    );
    if (!members.length) return { created: 0, pushed: 0 };
    const now = new Date().toISOString();
    const existing = unwrapStored(await getData("poto-timide-notifications")) || [];
    const list = Array.isArray(existing) ? existing : [];
    const rows = members.map((member) => ({
      id: crypto.randomUUID(),
      memberId: member.id,
      type: type || "activity",
      title: title || "Poto Timide",
      message: message || "Nouvelle activité sur le site.",
      tab: tab || "reunion",
      item: item || "",
      loanId: loanId || "",
      read: false,
      createdAt: now,
      updatedAt: now,
    }));
    const next = [...rows, ...list].slice(0, 1000);
    await setData("poto-timide-notifications", next);
    let pushed = 0;
    try {
      const result = await push.sendToUserIds(
        members.map((m) => m.id),
        {
          title: title || "Poto Timide",
          body: message || "Nouvelle activité",
          url: `/?tab=${encodeURIComponent(tab || "reunion")}`,
          tab: tab || "reunion",
          item: item || "",
          loanId: loanId || "",
          tag: `poto-${type || "activity"}-${Date.now()}`,
        },
      );
      pushed = Number(result?.sent || 0);
    } catch (err) {
      console.warn("Push notification:", err.message || err);
    }
    return { created: rows.length, pushed, notifications: next };
  }

  async function notifyFromChangedKeys(actor, changedKeys, silent) {
    if (silent || !changedKeys?.length) return null;
    const domains = changedKeys.filter((k) => NOTIFY_DOMAINS[k]);
    if (!domains.length) return null;
    // Une seule notif regroupée si plusieurs clés d’un coup
    const primary = NOTIFY_DOMAINS[domains[0]];
    const extra = domains.length > 1 ? ` (+${domains.length - 1})` : "";
    const message = `${actor?.name || "Un membre"} a modifié ${primary.label}${extra}.`;
    return notifyAllMembers({
      actor,
      type: domains[0].replace("poto-timide-", ""),
      title: primary.title,
      message,
      tab: primary.tab,
      silent: false,
    });
  }


  app.put("/api/data", requireAuth, async (req, res) => {
    const runSync = async () => {
      const payload = await sanitizePayloadForOwner(req.body || {});
      const actor = await findMemberById(req.session.userId);
      if (!actor) {
        const error = new Error("Membre introuvable.");
        error.status = 403;
        throw error;
      }
      const [storedRoles, storedPermissions, admin] = await Promise.all([
        getData("poto-timide-roles"),
        getData("poto-timide-tab-permissions"),
        isAdminId(actor.id),
      ]);
      const roleIds = Object.entries(storedRoles || {})
        .filter(([, memberId]) => String(memberId) === String(actor.id))
        .map(([roleId]) => roleId);
      const permissions =
        storedPermissions && typeof storedPermissions === "object"
          ? storedPermissions
          : DEFAULT_TAB_PERMISSIONS;
      const syncActor = { id: actor.id, isAdmin: admin, roleIds, permissions };
      if (Array.isArray(payload[MEMBERS_KEY])) {
        const existingMembers = unwrapStored(await getData(MEMBERS_KEY)) || [];
        if (!validateMemberListSyncValue(payload[MEMBERS_KEY], existingMembers)) {
          const error = new Error("La suppression d’un membre doit passer par une action métier.");
          error.status = 403;
          throw error;
        }
      }
      const entries = Object.entries(payload);
      for (const [key, value] of entries) {
        if (!STORAGE_KEYS.includes(key)) {
          const error = new Error(`Clé de synchronisation inconnue : ${key}`);
          error.status = 400;
          throw error;
        }
        const canWriteDomain = canWriteSyncKey(key, syncActor);
        if (!canWriteDomain) {
          const error = new Error(`Vous n’avez pas accès à la modification de ${key}.`);
          error.status = 403;
          throw error;
        }
        if (
          (key !== "poto-timide-communication" || !hasSyncTabPermission("communication", syncActor)) &&
          !validatePersonalSyncValue(
            key,
            unwrapStored(value),
            unwrapStored(await getData(key)),
            actor.id,
            {
              messages: unwrapStored(
                payload["poto-timide-messages"] || (await getData("poto-timide-messages")),
              ),
            },
          )
        ) {
          const error = new Error(`Modification non autorisée dans ${key}.`);
          error.status = 403;
          throw error;
        }
        if (
          key === "poto-timide-amendes" &&
          !validateFineSyncValue(
            unwrapStored(value),
            unwrapStored(await getData(key)),
            unwrapStored(
              payload["poto-timide-evenements"] || (await getData("poto-timide-evenements")),
            ),
          )
        ) {
          const error = new Error("Les amendes courantes doivent être modifiées via une action métier.");
          error.status = 403;
          throw error;
        }
      }
      const persistedKeys = [];

      for (const [key, value] of Object.entries(payload)) {
        await persistStorageValue(key, value);
        persistedKeys.push(key);
      }

      if (payload[MEMBERS_KEY]) {
        await syncUsersFromMembers(payload[MEMBERS_KEY]);
      }

      await enforceOwnerSafeguards();

      // Notifier tous les clients connectés (votes, prêts, etc.)
      const changedKeys = persistedKeys;
      const silent = Boolean(payload.__silent || req.body?.__silent || req.headers["x-poto-silent"] === "1");
      let notifResult = null;
      try {
        notifResult = await notifyFromChangedKeys(actor, changedKeys, silent);
        if (notifResult?.notifications) {
          changedKeys.push("poto-timide-notifications");
        }
      } catch (err) {
        console.warn("Notifications auto:", err.message || err);
      }
      if (changedKeys.length) {
        broadcastLive("data", {
          keys: [...new Set(changedKeys)],
          at: new Date().toISOString(),
          prets: changedKeys.includes("poto-timide-prets"),
        });
      }

      res.json({
        ok: true,
        data: notifResult?.notifications
          ? { "poto-timide-notifications": notifResult.notifications }
          : undefined,
      });
    };
    const queued = groupActionQueue.then(runSync, runSync);
    groupActionQueue = queued.then(
      () => undefined,
      () => undefined,
    );
    try {
      await queued;
    } catch (err) {
      const status = Number(err.status) || 500;
      if (status === 500) console.error("Synchronisation impossible :", err);
      res.status(status).json({ error: status === 500 ? "Erreur serveur" : err.message });
    }
  });

  app.get("/api/live", requireAuth, (req, res) => {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    if (typeof res.flushHeaders === "function") res.flushHeaders();
    res.write(`event: connected\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`);
    liveClients.add(res);
    const heartbeat = setInterval(() => {
      try {
        res.write(`event: ping\ndata: {}\n\n`);
      } catch {
        clearInterval(heartbeat);
        liveClients.delete(res);
      }
    }, 25000);
    req.on("close", () => {
      clearInterval(heartbeat);
      liveClients.delete(res);
    });
  });

  
  app.get("/api/admin/login-log", requireAuth, async (req, res) => {
    try {
      const members = (await getData(MEMBERS_KEY)) || [];
      const ownerId = findOwnerInMembers(members)?.id || getOwnerFallbackMember()?.id || null;
      if (!ownerId || req.session.userId !== ownerId) {
        return res.status(403).json({ error: "Réservé au propriétaire" });
      }
      let list = (await getData(LOGIN_LOG_KEY)) || [];
      if (!Array.isArray(list)) list = [];
      // plus récents d'abord, max 2000
      list = list
        .filter((e) => e && e.id && !e.deletedAt)
        .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
        .slice(0, 2000);
      res.json({ entries: list, count: list.length });
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

  // Digital Asset Links : obligatoire pour cacher la barre d'URL (TWA / APK)
  app.get("/.well-known/assetlinks.json", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.sendFile(path.join(__dirname, ".well-known", "assetlinks.json"));
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
        if (/assetlinks\.json$/i.test(filePath)) {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
        }
      },
    })
  );

  app.use(
    express.static(path.join(__dirname, "frontend", "dist"), {
      etag: false,
      lastModified: false,
      setHeaders(res, filePath) {
        if (/[\\/]assets[\\/]/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (/\.(html|js|css)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        }
      },
    })
  );

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Route introuvable" });
    }
    const reactEntry = path.join(__dirname, "frontend", "dist", "index.html");
    if (fs.existsSync(reactEntry)) return res.sendFile(reactEntry);
    res.sendFile(path.join(__dirname, "legacy.html"));
  });

  return app;
}

async function main() {
  await db.init();
  await seedDatabase();
  await hydrateDataCache();
  await push.ensureVapidKeys();

  const app = createApp();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  io.engine.use(app.locals.sessionMiddleware);
  io.use((socket, next) => {
    const session = socket.request.session;
    if (!session?.userId) return next(new Error("Non connecté"));

    session.lastSeen = Date.now();
    session.save((err) => {
      if (err) return next(err);
      socket.data.userId = session.userId;
      next();
    });
  });
  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
  });
  liveSocketServer = io;
  const loanStatusTimer = setInterval(async () => {
    const runStatusUpdate = async () => {
      const state = await getAllStoredData();
      const priorNotificationIds = new Set(
        (Array.isArray(state["poto-timide-notifications"]) ? state["poto-timide-notifications"] : [])
          .map((notification) => notification?.id)
          .filter(Boolean),
      );
      const advanced = advanceLoanStatuses(state);
      if (!advanced.changed) return;
      for (const [key, value] of Object.entries(advanced.data)) await setData(key, value);
      broadcastLive("data", {
        keys: Object.keys(advanced.data),
        at: new Date().toISOString(),
        action: "loan.status-updated",
      });
      const newInterestNotifications = (advanced.data["poto-timide-notifications"] || [])
        .filter((notification) =>
          notification?.type === "loan_interest" && !priorNotificationIds.has(notification.id),
        );
      await Promise.all(newInterestNotifications.map(async (notification) => {
        try {
          await push.sendToUserIds([notification.memberId], {
            title: notification.title || "Retard de prêt",
            body: notification.message,
            url: `/?tab=prets&loan=${encodeURIComponent(notification.loanId || "")}`,
            tab: "prets",
            loanId: notification.loanId || "",
            tag: `loan-interest-${notification.loanId || notification.id}`,
          });
        } catch (err) {
          console.warn("Push de retard de prêt impossible :", err.message);
        }
      }));
    };
    const queued = groupActionQueue.then(runStatusUpdate, runStatusUpdate);
    groupActionQueue = queued.then(() => undefined, () => undefined);
    try {
      await queued;
    } catch (err) {
      console.error("Mise à jour automatique des prêts impossible :", err);
    }
  }, 10_000);
  loanStatusTimer.unref();

  httpServer.listen(PORT, HOST, () => {
    console.log(`Poto Timide — http://localhost:${PORT}`);
    console.log(`Base de données : ${db.getConnectionLabel()}`);
  });
}

main().catch((err) => {
  console.error("Démarrage impossible :", err);
  process.exit(1);
});