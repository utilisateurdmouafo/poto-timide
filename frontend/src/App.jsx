import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KEYS, NAV, APP_TABS, EMPTY, active, list, request, allowedAdminSections, Button, Form } from "./shared.jsx";
import { MeetingPage, MembersPage, TourneePage, FundPage, LoansPage, EventsPage, DebtsPage, FinancePage, CommunicationPage, NotificationsPage, ReferencePage } from "./pages.jsx";

const AdminPage = lazy(() => import("./AdminSection.jsx").then((module) => ({ default: module.AdminPage })));

function UserMenu({ name, isAdmin, isDeveloper, devMode, toggleDevMode, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    const key = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", key); };
  }, [open]);
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="user-avatar" aria-hidden="true">{initial}</span>
        <span className="user-id"><strong>{name}</strong><small>{isAdmin ? "Administrateur" : "Membre"}</small></span>
        {isDeveloper && <span className={`user-mode ${devMode ? "is-on" : ""}`} aria-hidden="true" />}
        <span className="user-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          {isDeveloper && (
            <button type="button" role="menuitemcheckbox" aria-checked={devMode} className="user-item" onClick={toggleDevMode}>
              <span>Mode développeur</span><span className={`switch ${devMode ? "is-on" : ""}`} aria-hidden="true" />
            </button>
          )}
          <button type="button" role="menuitem" className="user-item user-logout" onClick={logout}><span>Se déconnecter</span><span aria-hidden="true">↪</span></button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [data, setData] = useState(EMPTY);
  const initialTab = location.hash.slice(1).split("/")[0];
  const [activeTab, setActiveTab] = useState(APP_TABS.includes(initialTab) ? initialTab : "reunion");
  const [adminSection, setAdminSection] = useState(location.hash.split("/")[1] || "membres");
  const [devMode, setDevMode] = useState(() => localStorage.getItem("poto-timide-dev-mode") !== "0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(0);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const refresh = useCallback(async () => {
    const latest = await request("/api/data");
    setData((previous) => ({ ...previous, ...latest }));
  }, []);

  useEffect(() => {
    let mounted = true;
    request("/api/auth/session")
      .then(async (state) => {
        if (!mounted) return;
        if (state.loggedIn) {
          setSession(state.member);
          setMustChangePassword(Boolean(state.mustChangePassword));
          const latest = await request("/api/data");
          if (mounted) setData((previous) => ({ ...previous, ...latest }));
        }
      })
      .catch((reason) => mounted && setError(reason.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onHash = () => {
      const [tab, sub] = location.hash.slice(1).split("/");
      if (APP_TABS.includes(tab)) setActiveTab(tab);
      if (tab === "admin") setAdminSection(sub || "membres");
    };
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  // Notifications push (comme une vraie app)
  useEffect(() => {
    if (!session) return undefined;
    let cancelled = false;
    async function setupPush() {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        if (cancelled) return;
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
          // Demande une fois ; l’utilisateur peut accepter
          await Notification.requestPermission();
        }
        if (cancelled || Notification.permission !== "granted") return;
        const keyRes = await request("/api/push/public-key");
        const publicKey = keyRes?.publicKey;
        if (!publicKey) return;
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          await request("/api/push/subscribe", { method: "POST", body: JSON.stringify(existing.toJSON()) });
          return;
        }
        const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
        const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawStr = atob(base64);
        const raw = new Uint8Array(rawStr.length);
        for (let i = 0; i < rawStr.length; i += 1) raw[i] = rawStr.charCodeAt(i);
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: raw });
        await request("/api/push/subscribe", { method: "POST", body: JSON.stringify(sub.toJSON()) });
      } catch (err) {
        console.warn("Push setup:", err);
      }
    }
    setupPush();
    return () => { cancelled = true; };
  }, [session]);


  useEffect(() => {
    if (!session) return undefined;
    let socket;
    let stopped = false;
    let dataDebounce = null;
    const scheduleRefresh = () => {
      clearTimeout(dataDebounce);
      dataDebounce = setTimeout(() => {
        refresh().catch((reason) => setError(reason.message));
      }, 250);
    };
    const connect = () => {
      if (typeof window.io !== "function" || stopped) return;
      socket = window.io({ withCredentials: true });
      socket.on("data", scheduleRefresh);
      socket.on("connect_error", () => setNotice("Connexion temps réel interrompue ; actualisation de secours active."));
    };
    let socketScript;
    if (typeof window.io === "function") {
      connect();
    } else {
      fetch("/socket.io/socket.io.js", { credentials: "same-origin" })
        .then((response) => {
          if (stopped) return;
          if (!response.ok || !response.headers.get("content-type")?.includes("javascript")) {
            setNotice("Socket.IO est indisponible ; les données seront actualisées automatiquement.");
            return;
          }
          socketScript = document.createElement("script");
          socketScript.src = "/socket.io/socket.io.js";
          socketScript.dataset.socketClient = "true";
          socketScript.onload = connect;
          socketScript.onerror = () => setNotice("Socket.IO est indisponible ; les données seront actualisées automatiquement.");
          document.head.append(socketScript);
        })
        .catch(() => setNotice("Socket.IO est indisponible ; les données seront actualisées automatiquement."));
    }
    const pollPresence = () => request("/api/auth/online").then((result) => {
      setOnline(result.count);
      setOnlineMembers(Array.isArray(result.online) ? result.online : []);
    }).catch(() => {});
    const pollData = () => refresh().catch((reason) => setError(reason.message));
    pollPresence();
    const timer = setInterval(pollPresence, 30000);
    // 12s au lieu de 5s : assez pour synchro, moins de saccades
    const dataTimer = setInterval(pollData, 12000);
    return () => {
      stopped = true;
      clearTimeout(dataDebounce);
      clearInterval(timer);
      clearInterval(dataTimer);
      socket?.disconnect();
      socketScript?.remove();
    };
  }, [session, refresh]);

  const members = useMemo(() => list(data, KEYS.members).filter((member) => member.kind !== "nouveau"), [data]);
  const memberNames = useMemo(() => Object.fromEntries(list(data, KEYS.members).map((member) => [member.id, member.name])), [data]);
  const isDeveloper = Boolean(session?.isAdmin);
  const isAdmin = isDeveloper && devMode;
  function toggleDevMode() {
    const next = !devMode;
    localStorage.setItem("poto-timide-dev-mode", next ? "1" : "0");
    setDevMode(next);
    if (!next && activeTab === "admin" && !allowedAdminSections(data, session, false).some((id) => id !== "connexions")) navigate("reunion");
    setNotice(next ? "Mode Dev : accès total, sans notifications." : "Mode Normal : uniquement vos accès de rôle.");
  }
  const roles = data[KEYS.roles] || {};
  const roleIds = Object.entries(roles).filter(([, memberId]) => String(memberId) === String(session?.id)).map(([roleId]) => roleId);
  const permissionMap = data[KEYS.permissions] || {};
  const unreadCount = list(data, KEYS.notifications).filter((row) => String(row.memberId) === String(session?.id) && !row.read && !row.deletedAt).length;
  const noticeIsWarning = /indisponible|interrompue|actualisation de secours/i.test(notice);
  const adminSections = allowedAdminSections(data, session, isAdmin);
  const canOpenAdmin = adminSections.some((id) => id !== "connexions");
  const can = (tab) => isAdmin || roleIds.some((roleId) => Array.isArray(permissionMap[tab]) && permissionMap[tab].includes(roleId));

  async function runAction(action, success = "Action enregistrée.") {
    setError("");
    setNotice("");
    try {
      const silent = Boolean(session?.isAdmin && devMode);
      const result = await request("/api/actions", {
        method: "POST",
        body: JSON.stringify({ ...action, silent }),
      });
      if (result.data) setData((previous) => ({ ...previous, ...result.data }));
      else await refresh();
      setNotice(success);
      return result.result;
    } catch (reason) {
      setError(reason.message);
      return false;
    }
  }

  async function saveData(payload, success = "Modification enregistrée.") {
    setError("");
    setNotice("");
    try {
      // Mode Dev (Dario) : pas de notifications pour les autres
      const silent = Boolean(session?.isAdmin && devMode);
      const result = await request("/api/data", {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: silent ? { "X-Poto-Silent": "1" } : undefined,
      });
      setData((previous) => ({
        ...previous,
        ...payload,
        ...(result?.data || {}),
      }));
      setNotice(success);
      return result;
    } catch (reason) {
      setError(reason.message);
      return false;
    }
  }

  async function login(values) {
    setError("");
    try {
      const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify(values) });
      setSession(result.member);
      setMustChangePassword(Boolean(result.mustChangePassword));
      const latest = await request("/api/data");
      setData((previous) => ({ ...previous, ...latest }));
      navigate("reunion");
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function logout() {
    try {
      await request("/api/auth/logout", { method: "POST", body: "{}" });
      setSession(null);
      setData(EMPTY);
      setMustChangePassword(false);
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function changePassword(values) {
    try {
      await request("/api/auth/change-password", { method: "POST", body: JSON.stringify(values) });
      setMustChangePassword(false);
      setNotice("Mot de passe modifié.");
    } catch (reason) {
      setError(reason.message);
    }
  }

  function navigate(tab, section) {
    setActiveTab(tab);
    const adminTarget = tab === "admin" ? section || "membres" : "";
    if (adminTarget) setAdminSection(adminTarget);
    location.hash = adminTarget ? `${tab}/${adminTarget}` : tab;
    setError("");
    setNotice("");
  }

  async function confirmAction(action, message) {
    if (!confirm(message)) return;
    await runAction(action, "Suppression effectuée.");
  }

  if (loading) return <main className="center-screen"><div className="spinner" /><p>Chargement de Poto Timide…</p></main>;
  if (!session) return <Login onLogin={login} error={error} />;
  if (mustChangePassword) return <PasswordChange onSubmit={changePassword} error={error} />;

  const page = (() => {
    switch (activeTab) {
      case "membres": return <MembersPage data={data} members={members} roles={roles} online={online} onlineMembers={onlineMembers} member={session} navigate={navigate} />;
      case "tournee": return <TourneePage data={data} members={members}       canManage={false} saveData={saveData} />;
            case "prets": return <LoansPage data={data} member={session} members={members} names={memberNames} canManage={false} runAction={runAction} confirmAction={confirmAction} />;
      case "evenements": return <EventsPage data={data} member={session} members={members} names={memberNames} canManage={false} runAction={runAction} confirmAction={confirmAction} />;
      case "communication": return <CommunicationPage data={data} member={session} members={members}       canManage={false} saveData={saveData} />;
            case "loi": return <ReferencePage data={data} canManageLaw={false} canManageGuide={false} saveData={saveData} />;
      case "notifications": return <NotificationsPage data={data} member={session} saveData={saveData} />;
      case "amendes": return <DebtsPage data={data} member={session} members={members} names={memberNames} canManage={false} runAction={runAction} confirmAction={confirmAction} />;
      case "finance": return <FinancePage data={data} members={members} names={memberNames} canManage={false} runAction={runAction} confirmAction={confirmAction} saveData={saveData} />;
      case "fond-caisse": return <FundPage data={data} members={members} member={session} />;
      case "admin": return canOpenAdmin
        ? <Suspense fallback={<div className="page-content"><p className="muted">Chargement…</p></div>}><AdminPage section={adminSection} sections={adminSections} setSection={(section) => navigate("admin", section)} data={data} member={session} members={members} names={memberNames} runAction={runAction} confirmAction={confirmAction} saveData={saveData} /></Suspense>
        : <NoAccess />;
      default: return <MeetingPage data={data} member={session} members={members} names={memberNames} online={online} onlineMembers={onlineMembers} isAdmin={canOpenAdmin} can={can} unreadCount={unreadCount} navigate={navigate} />;
    }
  })();
  const selectedTab = activeTab;

  return (
    <div className="app-shell">
      <header className="topbar topbar--underline">
        <a className="brand" href="#reunion" onClick={() => navigate("reunion")} aria-label="Poto Timide, accueil"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="12" fill="#0284C7"/><circle cx="27.5" cy="12" r="5.2" fill="#67E8F9"/><path d="M7 22.5c6.2-10.2 11.2-10.2 18.2 0 7 10.2 11.4 10.2 20.4 0" stroke="#fff" strokeWidth="3.1" strokeLinecap="round"/><path d="M9 29.2c5.2-8 9.4-8 16.2 0" stroke="#7DD3FC" strokeWidth="2.6" strokeLinecap="round"/></svg></span><span><strong>Poto Timide</strong><small>GROUPE · ESPACE PRIVÉ</small></span></a>
        <nav className="main-nav" aria-label="Navigation principale">
          {NAV.map(([id, label, icon]) => ((id !== "admin" || canOpenAdmin) && (
            <button type="button" key={id} className={selectedTab === id ? "nav-item selected" : "nav-item"} onClick={() => navigate(id)}>
              <span aria-hidden="true">{icon}</span>{label}
              {id === "notifications" && unreadCount > 0 && <span className="nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </button>
          )))}
        </nav>
        <UserMenu name={session.name} isAdmin={isAdmin} isDeveloper={isDeveloper} devMode={devMode} toggleDevMode={toggleDevMode} logout={logout} />
      </header>
      <main className="page-main">
        {(error || notice) && <div className={`notice ${error ? "notice-error" : noticeIsWarning ? "notice-warning" : "notice-success"}`} role="status">{error || notice}<button aria-label="Fermer" onClick={() => { setError(""); setNotice(""); }}>×</button></div>}
        {selectedTab !== "reunion" && <div className="reunion-back-bar"><Button onClick={() => navigate("reunion")}>← Réunion</Button></div>}
        {page}
      </main>
      <footer className="app-footer"><span>Poto Timide · Espace privé du groupe</span><span>{online} membre{online > 1 ? "s" : ""} en ligne · synchronisation temps réel</span></footer>
    </div>
  );

  function NoAccess() {
    return <section className="page-heading"><span className="eyebrow">Accès restreint</span><h1>Administration</h1><p>Cette section est réservée aux administrateurs du groupe.</p></section>;
  }
}

function Login({ onLogin, error }) {
  return (
    <main className="login-screen">
      <section className="login-card">
        <a className="brand login-brand" href="#"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="12" fill="#0284C7"/><circle cx="27.5" cy="12" r="5.2" fill="#67E8F9"/><path d="M7 22.5c6.2-10.2 11.2-10.2 18.2 0 7 10.2 11.4 10.2 20.4 0" stroke="#fff" strokeWidth="3.1" strokeLinecap="round"/><path d="M9 29.2c5.2-8 9.4-8 16.2 0" stroke="#7DD3FC" strokeWidth="2.6" strokeLinecap="round"/></svg></span><span><strong>Poto Timide</strong><small>GROUPE · ESPACE PRIVÉ</small></span></a>
        <span className="eyebrow">Bienvenue</span><h1>Connectez-vous à votre groupe</h1>
        <p>Accédez aux réunions, aux prêts et aux finances de Poto Timide.</p>
        {error && <div className="notice notice-error">{error}</div>}
        <Form fields={[
          { name: "username", label: "Identifiant", placeholder: "Votre identifiant" },
          { name: "password", label: "Mot de passe", type: "password", placeholder: "Votre mot de passe" },
        ]} submitLabel="Se connecter" onSubmit={onLogin} />
      </section>
    </main>
  );
}

function PasswordChange({ onSubmit, error }) {
  return (
    <main className="login-screen"><section className="login-card">
      <span className="eyebrow">Sécurité du compte</span><h1>Choisissez un nouveau mot de passe</h1>
      <p>Pour continuer, veuillez remplacer le mot de passe provisoire de votre compte.</p>
      {error && <div className="notice notice-error">{error}</div>}
      <Form fields={[
        { name: "currentPassword", label: "Mot de passe actuel", type: "password" },
        { name: "newPassword", label: "Nouveau mot de passe", type: "password" },
      ]} submitLabel="Modifier le mot de passe" onSubmit={onSubmit} />
    </section></main>
  );
}
