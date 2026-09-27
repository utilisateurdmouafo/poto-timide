function friendlyNetworkError(err) {
  const msg = String(err?.message || err || "");
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) {
    return "Connexion au serveur impossible. Vérifie que le site est démarré (Hetzner / Caddy). Essaie aussi la 4G si le Wi-Fi bloque.";
  }
  if (/502|503|504|bad gateway|service unavailable|not ready/i.test(msg)) {
    return "Le serveur n'est pas prêt (application arrêtée ou en redémarrage). Réessaie dans 30 secondes.";
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
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        body?.error ||
          "Le serveur n'est pas prêt (application arrêtée ou en redémarrage). Réessaie dans 30 secondes."
      );
    }
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