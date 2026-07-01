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
  "poto-timide-finance",
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

const SESSION_HINT_KEY = "poto-timide-session";

function persistSessionHint(member) {
  if (!member?.id) return;
  localStorage.setItem(
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

const LAST_USER_KEY = "poto-last-user";

function rememberLoginName(username) {
  const normalized = String(username || "").trim();
  if (normalized) localStorage.setItem(LAST_USER_KEY, normalized);
}

function getRememberedLoginName() {
  return localStorage.getItem(LAST_USER_KEY) || "";
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
  const prets = Array.isArray(data["poto-timide-prets"]) ? data["poto-timide-prets"].length : 0;
  const notifications = Array.isArray(data["poto-timide-notifications"])
    ? data["poto-timide-notifications"].length
    : 0;
  return members + roles * 3 + cotisations * 2 + tourneeYears * 5 + amendes + evenements * 2 + prets * 4 + notifications;
}

function mergeNotifications(local, server) {
  const localArr = Array.isArray(local) ? local : [];
  const serverArr = Array.isArray(server) ? server : [];
  const byKey = new Map();

  [...localArr, ...serverArr].forEach((notif) => {
    if (!notif) return;
    const key = notif.id || `${notif.memberId}:${notif.loanId}:${notif.type}`;
    const existing = byKey.get(key);
    if (!existing || new Date(notif.createdAt || 0) >= new Date(existing.createdAt || 0)) {
      byKey.set(key, notif);
    }
  });

  return [...byKey.values()].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

function mergePrets(local, server) {
  const localArr = Array.isArray(local) ? local : [];
  const serverArr = Array.isArray(server) ? server : [];
  const byId = new Map();

  [...localArr, ...serverArr].forEach((loan) => {
    if (!loan?.id) return;
    const existing = byId.get(loan.id);
    if (!existing) {
      byId.set(loan.id, loan);
      return;
    }

    const existingVotes = Object.keys(existing.votes || {}).length;
    const incomingVotes = Object.keys(loan.votes || {}).length;
    const existingDate = new Date(existing.createdAt || 0).getTime();
    const incomingDate = new Date(loan.createdAt || 0).getTime();

    if (incomingVotes > existingVotes || incomingDate >= existingDate) {
      byId.set(loan.id, loan);
    }
  });

  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

function mergeSharedLiveData(localPayload, serverData) {
  const merged = { ...serverData };
  merged["poto-timide-notifications"] = mergeNotifications(
    localPayload["poto-timide-notifications"],
    serverData["poto-timide-notifications"]
  );
  merged["poto-timide-prets"] = mergePrets(
    localPayload["poto-timide-prets"],
    serverData["poto-timide-prets"]
  );
  return merged;
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
    const mergedLive = mergeSharedLiveData(localPayload, serverData);
    const payloadToPush = { ...localPayload };
    payloadToPush["poto-timide-prets"] = mergedLive["poto-timide-prets"];
    payloadToPush["poto-timide-notifications"] = mergedLive["poto-timide-notifications"];
    await pushLocalDataToServer(payloadToPush);
    return { source: "local", pushed: true };
  }

  writeServerDataToLocal(mergeSharedLiveData(localPayload, serverData));
  return { source: "server", pushed: false };
}

async function pullSharedUpdatesFromServer() {
  if (!authState.loggedIn) return false;

  try {
    const serverData = await apiFetch("/api/data");
    const localPayload = getLocalDataPayload();
    const merged = mergeSharedLiveData(localPayload, serverData);
    const originalSetItem = localStorage.setItem.bind(localStorage);

    ["poto-timide-prets", "poto-timide-notifications"].forEach((key) => {
      if (merged[key] !== undefined) {
        originalSetItem(key, JSON.stringify(merged[key]));
      }
    });

    if (typeof window.potoOnServerDataPulled === "function") {
      window.potoOnServerDataPulled();
    }
    return true;
  } catch (err) {
    console.warn("Récupération des prêts/notifications échouée.", err);
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
  periodicSyncTimer = setInterval(async () => {
    if (!authState.loggedIn) return;
    await pullSharedUpdatesFromServer();
    await flushServerSync();
  }, 15000);
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
window.potoPullSharedUpdates = pullSharedUpdatesFromServer;
window.potoStartPeriodicSync = startPeriodicSync;
window.potoStopPeriodicSync = stopPeriodicSync;