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
  "poto-timide-payment-signals",
  "poto-timide-evenements",
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

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

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

function writeServerDataToLocal(serverData) {
  Object.entries(serverData || {}).forEach(([key, value]) => {
    if (!API_SYNC_KEYS.has(key)) return;
    rawSetItem(key, JSON.stringify(value));
  });
}

function hasPendingEdits() {
  return Object.keys(pendingSyncPayload).length > 0;
}

async function loadDataFromServer() {
  try {
    const serverData = await apiFetch("/api/data");
    writeServerDataToLocal(serverData);
    return { source: "server", pushed: false };
  } catch (err) {
    if (Object.keys(getLocalDataPayload()).length > 0) {
      console.warn("Serveur indisponible, cache local conservé.", err);
      return { source: "local", pushed: false };
    }
    throw err;
  }
}

async function pullSharedUpdatesFromServer() {
  if (!authState.loggedIn || hasPendingEdits() || syncing) return false;

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

async function flushServerSync() {
  if (!authState.loggedIn || !hasPendingEdits() || syncing) return;
  syncing = true;
  const payload = { ...pendingSyncPayload };
  pendingSyncPayload = {};
  try {
    await apiFetch("/api/data", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    Object.assign(pendingSyncPayload, payload);
    console.warn("Synchronisation serveur échouée, nouvel essai plus tard.", err);
  } finally {
    syncing = false;
  }
}

function startPeriodicSync() {
  stopPeriodicSync();
  periodicSyncTimer = setInterval(async () => {
    if (!authState.loggedIn) return;
    await flushServerSync();
    await pullSharedUpdatesFromServer();
  }, 4000);
}

function stopPeriodicSync() {
  if (periodicSyncTimer) {
    clearInterval(periodicSyncTimer);
    periodicSyncTimer = null;
  }
}

function installStorageSync() {
  nativeSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function patchedSetItem(key, value) {
    nativeSetItem(key, value);
    if (API_SYNC_KEYS.has(key)) queueServerSync(key, value);
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
