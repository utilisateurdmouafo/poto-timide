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

const SYNC_FAST_KEYS = new Set([
  "poto-timide-amendes",
  "poto-timide-amendes-caisse",
  "poto-timide-ancienne-tournee-dettes",
  "poto-timide-evenements",
  "poto-timide-prets",
  "poto-timide-tournee",
  "poto-timide-data-revision",
]);

function queueServerSync(key, rawValue) {
  if (!API_SYNC_KEYS.has(key) || !authState.loggedIn) return;
  try {
    pendingSyncPayload[key] = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
  } catch {
    return;
  }
  clearTimeout(syncTimer);
  const delay = SYNC_FAST_KEYS.has(key) ? 40 : 200;
  syncTimer = setTimeout(flushServerSync, delay);
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
  const payload = { ...pendingSyncPayload };
  pendingSyncPayload = {};
  inFlightSyncPayload = { ...inFlightSyncPayload, ...payload };
  try {
    await apiFetch("/api/data", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    // Succès : retirer de in-flight les clés envoyées (sauf si re-pending)
    Object.keys(payload).forEach((k) => {
      if (!Object.prototype.hasOwnProperty.call(pendingSyncPayload, k)) {
        delete inFlightSyncPayload[k];
      }
    });
    if (hasPendingEdits()) {
      const extra = { ...pendingSyncPayload };
      pendingSyncPayload = {};
      inFlightSyncPayload = { ...inFlightSyncPayload, ...extra };
      try {
        await apiFetch("/api/data", {
          method: "PUT",
          body: JSON.stringify(extra),
        });
        Object.keys(extra).forEach((k) => {
          if (!Object.prototype.hasOwnProperty.call(pendingSyncPayload, k)) {
            delete inFlightSyncPayload[k];
          }
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

let liveEventSource = null;
let liveReconnectTimer = null;
/** Intervalle court quand des votes sont en cours */
const SYNC_INTERVAL_MS = 800;
const SYNC_INTERVAL_VOTING_MS = 400;

function startPeriodicSync() {
  stopPeriodicSync();
  const tick = async () => {
    if (!authState.loggedIn) return;
    await flushServerSync();
    await pullSharedUpdatesFromServer();
  };
  // Base rapide (800 ms) — quasi temps réel même sans SSE
  periodicSyncTimer = setInterval(tick, SYNC_INTERVAL_MS);
  startLiveEventSource();
}

function stopPeriodicSync() {
  if (periodicSyncTimer) {
    clearInterval(periodicSyncTimer);
    periodicSyncTimer = null;
  }
  stopLiveEventSource();
}

function stopLiveEventSource() {
  if (liveReconnectTimer) {
    clearTimeout(liveReconnectTimer);
    liveReconnectTimer = null;
  }
  if (liveEventSource) {
    try {
      liveEventSource.close();
    } catch {
      /* ignore */
    }
    liveEventSource = null;
  }
}

/** Canal SSE : le serveur pousse dès qu'un poto vote / modifie les prêts */
function startLiveEventSource() {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
  if (!authState.loggedIn) return;
  stopLiveEventSource();
  try {
    // withCredentials pour envoyer le cookie de session
    liveEventSource = new EventSource("/api/live", { withCredentials: true });
  } catch (err) {
    console.warn("SSE indisponible, polling seul.", err);
    return;
  }

  const onData = async () => {
    if (!authState.loggedIn) return;
    // D'abord envoyer nos votes en attente, puis tirer le reste
    await flushServerSync();
    await pullSharedUpdatesFromServer();
  };

  liveEventSource.addEventListener("data", () => {
    onData().catch(() => {});
  });
  liveEventSource.addEventListener("connected", () => {
    onData().catch(() => {});
  });
  liveEventSource.onerror = () => {
    stopLiveEventSource();
    if (!authState.loggedIn) return;
    liveReconnectTimer = setTimeout(() => startLiveEventSource(), 2000);
  };
}

/** Accélère le polling pendant un vote (appelé depuis app.js) */
function setVotingSyncBoost(enabled) {
  if (!periodicSyncTimer) return;
  clearInterval(periodicSyncTimer);
  const ms = enabled ? SYNC_INTERVAL_VOTING_MS : SYNC_INTERVAL_MS;
  periodicSyncTimer = setInterval(async () => {
    if (!authState.loggedIn) return;
    await flushServerSync();
    await pullSharedUpdatesFromServer();
  }, ms);
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
window.queueServerSync = queueServerSync;
window.potoPullSharedUpdates = pullSharedUpdatesFromServer;
window.potoStartPeriodicSync = startPeriodicSync;
window.potoStopPeriodicSync = stopPeriodicSync;
window.potoSetVotingSyncBoost = setVotingSyncBoost;
window.potoStartLiveSync = startLiveEventSource;
window.apiFetchOnline = apiFetchOnline;