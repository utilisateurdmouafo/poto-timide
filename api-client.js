const API_SYNC_KEYS = new Set([
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
  "poto-timide-admin-ids",
  "poto-timide-autre-argent",
  "poto-timide-ancienne-tournee-dettes",
  "poto-timide-finance",
  "poto-timide-fond-caisse",
  "poto-timide-fond-caisse-annuel",
  "poto-timide-financier-account",
  "poto-timide-data-revision",
]);

const LAST_USER_KEY = "poto-last-user";
const SESSION_HINT_KEY = "poto-timide-session";

let authState = {
  loggedIn: false,
  member: null,
  mustChangePassword: false,
};

let syncTimer = null;
let pendingSyncPayload = {};
let periodicSyncTimer = null;
let nativeSetItem = null;
let syncing = false;

function rawSetItem(key, value) {
  const fn = nativeSetItem || localStorage.setItem.bind(localStorage);
  fn.call(localStorage, key, value);
}

function friendlyNetworkError(err) {
  const msg = String(err?.message || err || "");
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) {
    return "Connexion au serveur impossible. Chez Orange, le filtre peut bloquer onrender.com. Essaie la 4G / un autre réseau, ou ouvre le site dans Chrome/Safari sans l'appli installée.";
  }
  return msg || "Erreur réseau";
}

async function apiFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
  } catch (err) {
    throw new Error(friendlyNetworkError(err));
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new Error(body?.error || `Erreur ${res.status}`);
  }

  return body;
}

function persistSessionHint(member) {
  if (!member?.id) return;
  rawSetItem(
    SESSION_HINT_KEY,
    JSON.stringify({
      memberId: member.id,
      memberName: member.name,
      savedAt: Date.now(),
    })
  );
}

function clearSessionHint() {
  localStorage.removeItem(SESSION_HINT_KEY);
}

function rememberLoginName(username) {
  const normalized = String(username || "").trim();
  if (normalized) rawSetItem(LAST_USER_KEY, normalized);
}

function getRememberedLoginName() {
  return localStorage.getItem(LAST_USER_KEY) || "";
}

async function checkServerSession() {
  const data = await apiFetch("/api/auth/session");
  if (data.loggedIn) {
    authState = {
      loggedIn: true,
      member: data.member,
      mustChangePassword: Boolean(data.mustChangePassword),
    };
    persistSessionHint(data.member);
  } else {
    authState = { loggedIn: false, member: null, mustChangePassword: false };
  }
  return authState;
}

async function apiLogin(username, password) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  rememberLoginName(username);
  authState = {
    loggedIn: true,
    member: data.member,
    mustChangePassword: Boolean(data.mustChangePassword),
  };
  persistSessionHint(data.member);
  return authState;
}

async function apiLogout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  authState = { loggedIn: false, member: null, mustChangePassword: false };
  clearSessionHint();
  stopPeriodicSync();
}

async function apiChangePassword(currentPassword, newPassword) {
  await apiFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  authState.mustChangePassword = false;
}

async function apiResetMemberPassword(memberId) {
  return apiFetch(`/api/admin/reset-password/${memberId}`, { method: "POST" });
}

async function apiEnsureMemberUser(memberId) {
  return apiFetch(`/api/admin/ensure-user/${memberId}`, { method: "POST" });
}

async function apiFetchOnline() {
  const data = await apiFetch("/api/auth/online");
  return Array.isArray(data?.online) ? data.online : [];
}

function getLocalDataPayload() {
  const payload = {};
  API_SYNC_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      payload[key] = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  });
  return payload;
}

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

/** Union des remboursements par id (ne jamais perdre un paiement synchronisé) */
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

/** Fusion intelligente des prêts : votes + remboursements + statut le plus avancé */
function mergeLoansPreferringNewer(existing, incoming) {
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

    // Soft-delete collant : dès qu'un côté a deletedAt, on ne le perd jamais
    // (évite qu'un vote/remboursement plus récent fasse réapparaître le prêt)
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
      votes: mergeLoanVotes(prev.votes, loan.votes),
      repayments: mergeLoanRepayments(prev.repayments, loan.repayments),
      deletedAt: newerDeleted || null,
      updatedAt: finalUpdatedAt,
    };
    map.set(loan.id, recomputeLoanRepaid(merged));
  };

  existingList.forEach(add);
  incomingList.forEach(add);

  return [...map.values()].sort((a, b) => {
    const ta = new Date(a.updatedAt || a.deletedAt || a.createdAt || 0).getTime() || 0;
    const tb = new Date(b.updatedAt || b.deletedAt || b.createdAt || 0).getTime() || 0;
    return tb - ta;
  });
}

function unwrapLocalSynced(value) {
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

function objectUpdatedAtMs(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  const time = new Date(value.updatedAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function writeServerDataToLocal(serverData) {
  Object.entries(serverData || {}).forEach(([key, value]) => {
    if (!API_SYNC_KEYS.has(key)) return;
    if (Object.prototype.hasOwnProperty.call(pendingSyncPayload, key)) return;
    try {
      if (
        key === "poto-timide-communication" ||
        key === "poto-timide-notifications" ||
        key === "poto-timide-loi"
      ) {
        const raw = localStorage.getItem(key);
        const local = raw ? unwrapLocalSynced(JSON.parse(raw)) : [];
        const incoming = unwrapLocalSynced(value);
        value = mergeById(Array.isArray(local) ? local : [], Array.isArray(incoming) ? incoming : []);
      }
      if (key === "poto-timide-prets") {
        const raw = localStorage.getItem(key);
        const local = raw ? unwrapLocalSynced(JSON.parse(raw)) : [];
        const incoming = unwrapLocalSynced(value);
        value = mergeLoansPreferringNewer(Array.isArray(local) ? local : [], Array.isArray(incoming) ? incoming : []);
      }
      // Accès / rôles / admins : ne pas écraser une version locale plus récente
      if (
        key === "poto-timide-tab-permissions" ||
        key === "poto-timide-roles" ||
        key === "poto-timide-admin-ids"
      ) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const local = unwrapLocalSynced(JSON.parse(raw));
            const incoming = unwrapLocalSynced(value);
            if (objectUpdatedAtMs(local) > objectUpdatedAtMs(incoming)) {
              value = local;
            } else {
              value = incoming;
            }
          } catch {
            /* keep server value */
          }
        }
      }
      rawSetItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("Impossible d'écrire la clé locale", key, err);
    }
  });
}

function hasPendingEdits() {
  return Object.keys(pendingSyncPayload).length > 0;
}

async function loadDataFromServer() {
  try {
    const serverData = await apiFetch("/api/data");
    const serverComm = Array.isArray(serverData["poto-timide-communication"])
      ? serverData["poto-timide-communication"]
      : [];
    writeServerDataToLocal(serverData);

    try {
      const raw = localStorage.getItem("poto-timide-communication");
      const mergedComm = raw ? JSON.parse(raw) : [];
      if (
        Array.isArray(mergedComm) &&
        mergedComm.length &&
        JSON.stringify(mergedComm) !== JSON.stringify(serverComm)
      ) {
        queueServerSync("poto-timide-communication", mergedComm);
      }
    } catch {
      /* ignore */
    }

    return { source: "server", pushed: false };
  } catch (err) {
    console.warn("Serveur indisponible, cache local conservé.", err);
    return { source: "local", pushed: false };
  }
}

async function pullSharedUpdatesFromServer() {
  if (!authState.loggedIn || hasPendingEdits() || syncing) return false;
  if (typeof window.potoIsUserEditingForm === "function" && window.potoIsUserEditingForm()) return false;
  if (typeof window.potoIsLoanDateEditing === "function" && window.potoIsLoanDateEditing()) return false;

  try {
    const serverData = await apiFetch("/api/data");
    if (hasPendingEdits()) return false;
    writeServerDataToLocal(serverData);
    if (typeof window.potoOnServerDataPulled === "function") {
      window.potoOnServerDataPulled();
    }
    return true;
  } catch (err) {
    console.warn("Récupération serveur échouée.", err);
    return false;
  }
}

function queueServerSync(key, rawValue) {
  if (!API_SYNC_KEYS.has(key) || !authState.loggedIn) return;
  try {
    pendingSyncPayload[key] = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
  } catch {
    return;
  }
  clearTimeout(syncTimer);
  syncTimer = setTimeout(flushServerSync, 200);
}

/** Attentes quand un flush est déjà en cours (évite de perdre un vote) */
let flushWaiters = [];

async function flushServerSync() {
  if (!authState.loggedIn) return false;
  if (!hasPendingEdits()) return true;

  // Si un flush tourne déjà : attendre la fin puis réessayer (ne pas abandonner le vote)
  if (syncing) {
    await new Promise((resolve) => {
      flushWaiters.push(resolve);
    });
    if (!hasPendingEdits()) return true;
    if (syncing) return false;
  }

  syncing = true;
  // Fusionner tout le pending au moment du départ
  const payload = { ...pendingSyncPayload };
  pendingSyncPayload = {};
  try {
    await apiFetch("/api/data", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    // Si de nouvelles mods sont arrivées pendant le PUT, les envoyer aussi
    if (hasPendingEdits()) {
      const extra = { ...pendingSyncPayload };
      pendingSyncPayload = {};
      try {
        await apiFetch("/api/data", {
          method: "PUT",
          body: JSON.stringify(extra),
        });
      } catch (err2) {
        Object.assign(pendingSyncPayload, extra);
        console.warn("Synchronisation serveur (2e passe) échouée.", err2);
        return false;
      }
    }
    return true;
  } catch (err) {
    Object.assign(pendingSyncPayload, payload);
    console.warn("Synchronisation serveur échouée, nouvel essai plus tard.", err);
    return false;
  } finally {
    syncing = false;
    const waiters = flushWaiters.splice(0, flushWaiters.length);
    waiters.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore */
      }
    });
  }
}

function startPeriodicSync() {
  stopPeriodicSync();
  periodicSyncTimer = setInterval(async () => {
    if (!authState.loggedIn) return;
    await flushServerSync();
    await pullSharedUpdatesFromServer();
  }, 1500);
}

function stopPeriodicSync() {
  if (periodicSyncTimer) {
    clearInterval(periodicSyncTimer);
    periodicSyncTimer = null;
  }
}

function stampSyncedValue(key, value) {
  if (!API_SYNC_KEYS.has(key)) return value;
  if (key === "poto-timide-data-revision") return value;
  if (key === "poto-timide-communication" || key === "poto-timide-notifications") return value;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.updatedAt) {
      return value;
    }
    if (Array.isArray(parsed) || typeof parsed === "number") {
      return JSON.stringify({ data: parsed, updatedAt: new Date().toISOString() });
    }
    if (parsed && typeof parsed === "object") {
      return JSON.stringify({ ...parsed, updatedAt: new Date().toISOString() });
    }
  } catch {
    /* keep original */
  }
  return value;
}

function installStorageSync() {
  nativeSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function patchedSetItem(key, value) {
    const next = stampSyncedValue(key, value);
    nativeSetItem(key, next);
    if (API_SYNC_KEYS.has(key)) queueServerSync(key, next);
  };
}

function installUnloadSync() {
  window.addEventListener("pagehide", () => {
    if (!authState.loggedIn || !hasPendingEdits()) return;
    const payload = { ...pendingSyncPayload };
    pendingSyncPayload = {};
    fetch("/api/data", {
      method: "PUT",
      body: JSON.stringify(payload),
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushServerSync();
  });
}

installStorageSync();
installUnloadSync();

window.flushPotoServerSync = flushServerSync;
window.potoFlushSync = flushServerSync;
window.potoPullSharedUpdates = pullSharedUpdatesFromServer;
window.potoStartPeriodicSync = startPeriodicSync;
window.potoStopPeriodicSync = stopPeriodicSync;
window.apiFetchOnline = apiFetchOnline;
