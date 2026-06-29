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
  "poto-timide-admin-ids",
  "poto-timide-autre-argent",
]);

let authState = {
  loggedIn: false,
  member: null,
  mustChangePassword: false,
};

let syncTimer = null;
let pendingSyncPayload = {};
let periodicSyncTimer = null;

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
    const message = body?.error || `Erreur ${res.status}`;
    throw new Error(message);
  }

  return body;
}

async function checkServerSession() {
  const data = await apiFetch("/api/auth/session");
  if (data.loggedIn) {
    authState = {
      loggedIn: true,
      member: data.member,
      mustChangePassword: Boolean(data.mustChangePassword),
    };
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
  authState = {
    loggedIn: true,
    member: data.member,
    mustChangePassword: Boolean(data.mustChangePassword),
  };
  return authState;
}

async function apiLogout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  authState = { loggedIn: false, member: null, mustChangePassword: false };
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

function getLocalDataPayload() {
  const payload = {};
  API_SYNC_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      payload[key] = JSON.parse(raw);
    } catch {
      /* ignore corrupted cache */
    }
  });
  return payload;
}

function writeServerDataToLocal(serverData) {
  Object.entries(serverData).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
}

function dataRichness(data) {
  if (!data || typeof data !== "object") return 0;
  const members = Array.isArray(data["poto-timide-members"]) ? data["poto-timide-members"].length : 0;
  const roles = Object.keys(data["poto-timide-roles"] || {}).length;
  const cotisations = Object.keys(data["poto-timide-cotisations"] || {}).length;
  const tourneeYears = Object.keys(data["poto-timide-tournee"]?.years || {}).length;
  const amendes = Array.isArray(data["poto-timide-amendes"]) ? data["poto-timide-amendes"].length : 0;
  const evenements = Array.isArray(data["poto-timide-evenements"])
    ? data["poto-timide-evenements"].length
    : 0;
  return members + roles * 3 + cotisations * 2 + tourneeYears * 5 + amendes + evenements * 2;
}

function serverLooksEmpty(serverData, status) {
  if (status?.looksEmpty) return true;
  return dataRichness(serverData) <= 15;
}

async function pushLocalDataToServer(payload = getLocalDataPayload()) {
  if (!authState.loggedIn || Object.keys(payload).length === 0) return false;
  await apiFetch("/api/data", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return true;
}

async function loadDataFromServer() {
  const localPayload = getLocalDataPayload();
  let serverData = {};
  let status = null;

  try {
    [serverData, status] = await Promise.all([
      apiFetch("/api/data"),
      apiFetch("/api/data/status").catch(() => null),
    ]);
  } catch (err) {
    if (Object.keys(localPayload).length > 0) {
      console.warn("Serveur indisponible, utilisation du cache local.", err);
      return { source: "local", pushed: false };
    }
    throw err;
  }

  const localScore = dataRichness(localPayload);
  const serverScore = dataRichness(serverData);

  if (serverLooksEmpty(serverData, status) && localScore > 0) {
    await pushLocalDataToServer(localPayload);
    return { source: "local", pushed: true };
  }

  if (localScore > serverScore + 2) {
    await pushLocalDataToServer(localPayload);
    return { source: "local", pushed: true };
  }

  writeServerDataToLocal(serverData);
  return { source: "server", pushed: false };
}

function queueServerSync(key, rawValue) {
  if (!API_SYNC_KEYS.has(key) || !authState.loggedIn) return;
  try {
    pendingSyncPayload[key] = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
  } catch {
    return;
  }

  clearTimeout(syncTimer);
  syncTimer = setTimeout(flushServerSync, 350);
}

async function flushServerSync() {
  if (!authState.loggedIn || Object.keys(pendingSyncPayload).length === 0) return;
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
  }
}

function startPeriodicSync() {
  stopPeriodicSync();
  periodicSyncTimer = setInterval(() => {
    if (!authState.loggedIn) return;
    flushServerSync();
  }, 30000);
}

function stopPeriodicSync() {
  if (periodicSyncTimer) {
    clearInterval(periodicSyncTimer);
    periodicSyncTimer = null;
  }
}

function installStorageSync() {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function patchedSetItem(key, value) {
    originalSetItem(key, value);
    if (API_SYNC_KEYS.has(key)) {
      queueServerSync(key, value);
    }
  };
}

function installUnloadSync() {
  window.addEventListener("pagehide", () => {
    if (!authState.loggedIn || Object.keys(pendingSyncPayload).length === 0) return;
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
    if (document.visibilityState === "hidden") {
      flushServerSync();
    }
  });
}

installStorageSync();
installUnloadSync();

window.potoFlushSync = flushServerSync;
window.potoStartPeriodicSync = startPeriodicSync;
window.potoStopPeriodicSync = stopPeriodicSync;