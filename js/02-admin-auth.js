function getTabLabel(tabId) {
  return MANAGEABLE_TABS.find((tab) => tab.id === tabId)?.label || tabId;
}

function getTabAllowedRoles(tabId) {
  return tabPermissions[tabId] || [];
}

/** Onglet principal actuellement affiché */
function getActiveMainTab() {
  const activeBtn = document.querySelector(".tab.active[data-tab]");
  if (activeBtn?.dataset?.tab) return activeBtn.dataset.tab;
  const activeContent = document.querySelector(".tab-content.active");
  if (activeContent?.id?.startsWith("tab-")) return activeContent.id.slice(4);
  return "reunion";
}

/**
 * Espace Admin = uniquement l'onglet Admin.
 * C'est là que l'admin configure le groupe.
 */
function isAdminWorkspace() {
  if (!canAccessAdminTab()) return false;
  if (getActiveMainTab() === "admin") return true;
  const tab = document.getElementById("tab-admin");
  if (tab && tab.classList.contains("active")) return true;
  // Sous-page admin ouverte (hub → section)
  if (typeof activeAdminSub === "string" && activeAdminSub && ADMIN_SUBTABS.includes(activeAdminSub)) {
    return true;
  }
  return false;
}

/**
 * Vue compte simple : usage quotidien + tests.
 * Hors de l'onglet Admin, chacun voit/agit comme un membre simple.
 */
function isSimpleAccountView() {
  if (!canAccessAdminTab()) return true;
  return !isAdminWorkspace();
}

function hasRoleTabAccess(tabId) {
  if (isGroupAdmin()) return true;
  const member = getCurrentMember();
  if (!member) return false;
  const memberRole = getMemberRole(member.id);
  if (!memberRole) return false;
  return getTabAllowedRoles(tabId).includes(memberRole);
}

function canAccessAdminSub(subId) {
  if (subId === "connexions") {
    return isLoggedIn() && isOwnerMember(getCurrentMember());
  }
  if (isGroupAdmin()) return true;
  if (subId === "admins" || subId === "acces" || subId === "sauvegarde") return false;
  if (subId === "membres") return hasRoleTabAccess("membres") || hasRoleTabAccess("bureau");
  if (subId === "caisse") return isFinancierPoste() || hasRoleTabAccess("caisse");
  if (subId === "amendes") {
    return (
      isGroupAdmin() ||
      hasRoleTabAccess("amendes") ||
      hasRoleTabAccess("ancienne-tournee") ||
      isFinancierPoste()
    );
  }
  if (subId === "prets") return isFinancierPoste() || hasRoleTabAccess("prets");
  return hasRoleTabAccess(subId);
}

function getAllowedAdminSubs() {
  return ADMIN_SUBTABS.filter((id) => canAccessAdminSub(id));
}

function canEditTourneePlanning() {
  return isAdminWorkspace() && activeAdminSub === "tournee" && hasRoleTabAccess("tournee");
}

function canAccessTourneeTab() {
  return true;
}

function canAccessAdminTab() {
  if (!isLoggedIn()) return false;
  if (isGroupAdmin()) return true;
  if (isFinancierPoste()) return true;
  return MANAGEABLE_TABS.some((tab) => hasRoleTabAccess(tab.id));
}

function canAccessGestionTab() {
  return canAccessAdminTab();
}

function canAccessCaisse() {
  if (!isAdminWorkspace() || activeAdminSub !== "caisse") return false;
  return isGroupAdmin() || isFinancierPoste() || hasRoleTabAccess("caisse");
}

function canManageCaisseArgent() {
  return isGroupAdmin() || isFinancierPoste() || hasRoleTabAccess("caisse");
}

function getAdminSubtab() {
  const stored = localStorage.getItem(ADMIN_SUBTAB_KEY);
  let requested = stored === "equipe" || stored === "bureau" ? "membres" : stored;
  if (requested === "ancienne-tournee") requested = "amendes";
  const allowed = getAllowedAdminSubs();
  if (allowed.includes(requested)) return requested;
  return allowed[0] || "membres";
}

function getGestionSubtab() {
  return getAdminSubtab();
}

function updateAdminSubtabVisibility() {
  document.querySelectorAll("[data-admin-sub]").forEach((btn) => {
    const key = btn.dataset.adminSub;
    if (!key) return;
    btn.hidden = !canAccessAdminSub(key);
  });
}

function getAdminHubLabel(subId) {
  const item = ADMIN_HUB_ITEMS.find((x) => x.id === subId);
  return item?.label || subId || "Admin";
}

function renderAdminHub() {
  const grid = document.getElementById("adminHubGrid");
  if (!grid) {
    console.warn("adminHubGrid introuvable");
    return;
  }
  const hubItems =
    typeof ADMIN_HUB_ITEMS !== "undefined" && Array.isArray(ADMIN_HUB_ITEMS)
      ? ADMIN_HUB_ITEMS
      : ADMIN_SUBTABS.map((id) => ({ id, label: id, tone: "navy" }));
  let allowed = [];
  try {
    allowed = typeof getAllowedAdminSubs === "function" ? getAllowedAdminSubs() : ADMIN_SUBTABS.slice();
  } catch (err) {
    console.warn("getAllowedAdminSubs:", err);
    allowed = ADMIN_SUBTABS.slice();
  }
  // Si aucun filtre (ou admin groupe) : tout afficher
  let items = hubItems.filter((item) => allowed.includes(item.id));
  if (!items.length && typeof isGroupAdmin === "function" && isGroupAdmin()) {
    items = hubItems.slice();
  }
  if (!items.length) {
    items = hubItems.slice(); // fallback visible pour débloquer l'UI
  }
  grid.innerHTML = items
    .map(
      (item) =>
        `<button type="button" class="reunion-kpi reunion-kpi-${escapeHtml(item.tone || "navy")} admin-hub-btn" data-admin-go="${escapeHtml(item.id)}">
        <span class="admin-hub-label">${escapeHtml(item.label)}</span>
      </button>`
    )
    .join("");
}

/** Tableau de bord admin (comme Réunion) — aucune sous-page visible */
function showAdminHub() {
  activeAdminSub = null;
  activeGestionSub = null;
  try {
    localStorage.removeItem(ADMIN_SUBTAB_KEY);
  } catch {
    /* ignore */
  }

  const hub = document.getElementById("adminHub");
  const backBar = document.getElementById("adminBackBar");
  const subcontent = document.getElementById("adminSubcontent");
  const desc = document.getElementById("adminHubDesc");
  const label = document.getElementById("adminCurrentSubLabel");

  if (hub) {
    hub.hidden = false;
    hub.style.display = "";
  }
  if (backBar) backBar.hidden = true;
  if (subcontent) {
    subcontent.hidden = true;
    subcontent.style.display = "none";
  }
  if (desc) {
    desc.hidden = false;
    desc.textContent = "Choisis une section à gérer.";
  }
  if (label) {
    label.hidden = true;
    label.textContent = "";
  }

  document.querySelectorAll("#tab-admin .gestion-subpanel[data-admin-panel]").forEach((panel) => {
    panel.classList.remove("is-active");
    panel.hidden = true;
  });

  try {
    renderAdminHub();
  } catch (err) {
    console.warn("renderAdminHub:", err);
  }
  try {
    closeAdminMenu();
  } catch {
    /* ignore */
  }
}

function showAdminSub(subId) {
  if (subId === "hub" || subId === "home" || !subId) {
    showAdminHub();
    return;
  }
  if (subId === "bureau" || subId === "equipe") subId = "membres";
  if (subId === "ancienne-tournee") subId = "amendes";
  if (!ADMIN_SUBTABS.includes(subId) || !canAccessAdminSub(subId)) {
    const allowed = getAllowedAdminSubs();
    if (!allowed.length) {
      showAdminHub();
      return;
    }
    subId = allowed.includes(getAdminSubtab()) ? getAdminSubtab() : allowed[0];
  }

  activeAdminSub = subId;
  activeGestionSub = subId;
  localStorage.setItem(ADMIN_SUBTAB_KEY, subId);

  const hub = document.getElementById("adminHub");
  const backBar = document.getElementById("adminBackBar");
  const backLabel = document.getElementById("adminBackLabel");
  const subcontent = document.getElementById("adminSubcontent");
  const desc = document.getElementById("adminHubDesc");
  const label = document.getElementById("adminCurrentSubLabel");

  if (hub) {
    hub.hidden = true;
    hub.style.display = "none";
  }
  if (backBar) backBar.hidden = false;
  if (backLabel) backLabel.textContent = getAdminHubLabel(subId);
  if (subcontent) {
    subcontent.hidden = false;
    subcontent.style.display = "";
  }
  if (desc) desc.hidden = true;
  if (label) {
    label.hidden = true; // évite le doublon avec la barre ← Admin
    label.textContent = "";
  }

  document.querySelectorAll("#tab-admin .gestion-subpanel[data-admin-panel]").forEach((panel) => {
    const match = panel.dataset.adminPanel === subId;
    panel.classList.toggle("is-active", match);
    if (match) {
      panel.hidden = false;
      panel.removeAttribute("hidden");
      panel.style.display = "flex";
    } else {
      panel.hidden = true;
      panel.setAttribute("hidden", "");
      panel.style.display = "none";
    }
  });

  // Rendu ciblé de la section
  if (subId === "membres") {
    if (addMemberPanel) {
      addMemberPanel.hidden = !(isGroupAdmin() || hasRoleTabAccess("membres"));
      addMemberPanel.classList.toggle("locked", !(isGroupAdmin() || hasRoleTabAccess("membres")));
    }
    if (rolesPanel) {
      rolesPanel.hidden = !(isGroupAdmin() || hasRoleTabAccess("bureau"));
      rolesPanel.classList.toggle("locked", !(isGroupAdmin() || hasRoleTabAccess("bureau")));
    }
    if (typeof updateFormState === "function") updateFormState();
    if (typeof renderBureau === "function") renderBureau();
    if (typeof renderMemberList === "function") renderMemberList();
    if (typeof renderAdminList === "function") renderAdminList();
  }
  if (subId === "admins") {
    if (typeof renderAdminList === "function") renderAdminList();
  }
  if (subId === "acces" && typeof renderTabPermissionsPanel === "function") renderTabPermissionsPanel();
  if (subId === "tournee" && typeof renderTourneeTable === "function") renderTourneeTable();
  if (subId === "caisse") {
    if (typeof renderFondCaissePanel === "function") renderFondCaissePanel();
    if (typeof renderAutreArgent === "function") renderAutreArgent();
  }
  if (subId === "prets" && typeof renderAdminPrets === "function") renderAdminPrets();
  if (subId === "amendes") {
    if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
    if (typeof renderAmendesAdminHistory === "function") renderAmendesAdminHistory();
  }
  if (subId === "evenements" && typeof renderEvenements === "function") renderEvenements();
  if (subId === "communication" && typeof renderCommunication === "function") renderCommunication();
  if (subId === "loi" && typeof renderLoiAdmin === "function") renderLoiAdmin();
  if (subId === "sauvegarde" && typeof renderAuditLog === "function") renderAuditLog();
  if (subId === "connexions" && typeof renderLoginLog === "function") renderLoginLog();

  try {
    closeAdminMenu();
  } catch {
    /* ignore */
  }
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    /* ignore */
  }
}

function showGestionSub(subId) {
  if (subId === "equipe" || subId === "bureau") subId = "membres";
  showAdminSub(subId);
}

function renderAdmin() {
  // Toujours le hub sauf deep-link notif (sessionStorage poto-open-admin)
  let deep = null;
  try {
    deep = sessionStorage.getItem("poto-open-admin");
    if (deep) sessionStorage.removeItem("poto-open-admin");
  } catch {
    deep = null;
  }
  // Ne pas relire localStorage ADMIN_SUBTAB_KEY (sinon retour auto sur Membres)
  try {
    localStorage.removeItem(ADMIN_SUBTAB_KEY);
  } catch {
    /* ignore */
  }
  if (deep && ADMIN_SUBTABS.includes(deep) && canAccessAdminSub(deep)) {
    showAdminSub(deep);
  } else {
    activeAdminSub = null;
    showAdminHub();
  }
}

function renderGestion() {
  renderAdmin();
}

function canManageTab(tabId) {
  // Les manipulations se font uniquement dans l'onglet Admin
  if (isSimpleAccountView()) return false;
  if (isGroupAdmin()) return true;
  return hasRoleTabAccess(tabId);
}

function saveAmendes(shouldRender = true) {
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));
  if (shouldRender) {
    renderAmendes();
    renderAmendesAdminHistory();
    renderPrets();
    if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
    if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  }
}

function getAmendeTypeLabel(typeId) {
  if (typeId === "dette") return "Dette événement";
  if (typeId === "evenement") return "Événement";
  if (typeId === "ancienne-tournee" || typeId === "ex-tournee") return "Ex tournée";
  if (typeId === "cotisation") return "Cotisation";
  if (typeId === "pret") return "Prêt";
  return AMENDE_TYPES.find((t) => t.id === typeId)?.label || typeId;
}


/** Supprime en dur (tombstone) toutes les dettes événement historiques — source = onglet Événements */
function purgeEvenementDettesAmendes() {
  let changed = false;
  const now = new Date().toISOString();
  (Array.isArray(amendes) ? amendes : []).forEach((a) => {
    if (!a || a.type !== "dette" || a.deletedAt) return;
    a.deletedAt = now;
    a.updatedAt = now;
    a.amount = 0;
    changed = true;
  });
  if (changed) {
    try {
      localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));
    } catch {
      /* ignore */
    }
  }
  return changed;
}

function isDetteAmende(amende) {
  return amende?.type === "dette";
}

function isAmendeDeleted(amende) {
  return Boolean(amende?.deletedAt);
}

function getRegularAmendes(amendesList) {
  return (amendesList || []).filter((amende) => !isDetteAmende(amende) && !isAmendeDeleted(amende));
}

function getDetteAmendes() {
  return amendes.filter((amende) => isDetteAmende(amende) && !isAmendeDeleted(amende));
}

function resetEvenementDettes() {
  const removedDettes = amendes.filter((amende) => isDetteAmende(amende)).length;

  amendes = amendes.filter((amende) => !isDetteAmende(amende));
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));

  evenements.forEach((evt) => {
    delete evt.caisseDebtDeduction;

    if (!evt.payments) return;

    Object.keys(evt.payments).forEach((memberId) => {
      const payment = evt.payments[memberId];
      if (!payment) return;

      delete payment.convertedToDebt;
      delete payment.debtCreatedAt;

      if (payment.debtRepaidAt) {
        payment.paid = false;
        payment.paidAt = null;
        payment.validatedBy = null;
        payment.paidAmount = null;
        delete payment.debtRepaidAt;
      }
    });
  });

  localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));

  return removedDettes;
}

function reloadFromStorage() {
  try { if (typeof loadLoginLog === "function") loadLoginLog(); } catch { /* ignore */ }
  members = loadMembers();
  roles = loadRoles();
  cotisations = loadCotisations();
  amendes = loadAmendes();
  if (typeof purgeEvenementDettesAmendes === "function") purgeEvenementDettesAmendes();
  amendesCaisse = loadAmendesCaisse();
  tabPermissions = loadTabPermissions();
  prets = loadPrets();
  // Réappliquer les votes faits sur cet appareil (évite le "comme si je n'avais pas voté")
  if (typeof applyPendingLocalVotesToPrets === "function" && applyPendingLocalVotesToPrets()) {
    try {
      localStorage.setItem(PRETS_KEY, JSON.stringify(prets));
    } catch {
      /* ignore */
    }
  }
  notifications = loadNotifications();
  evenements = loadEvenements();
  auditLog = loadAuditLog();
  communicationPosts = loadCommunicationPosts();
  activeCommunicationSub = loadCommunicationSubtab();
  loiArticles = loadLoiArticles();
  guideArticles = loadGuideArticles();
  autreArgent = loadAutreArgent();
  capitalHorsGroupe = loadCapitalHorsGroupe();
  ancienneTourneeDettes = loadAncienneTourneeDettes();
  fondCaisse = loadFondCaisse();
  fondCaisseAnnuel = loadFondCaisseAnnuel();
  financierAccount = loadFinancierAccount();
  financeData = loadFinance();
  adminIds = loadAdminIds();
  ensureDefaultAdmin();
  tourneeData = loadTourneeData();
  // Toujours réaligner le draft (sinon les OK disparaissent à l'affichage admin)
  tourneeDraft = cloneTourneeData(tourneeData);
  if (canEditTourneePlanning()) {
    cotisationsDraft = { ...cotisations };
  }
}

function saveMembers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  render();
}

function saveRoles() {
  localStorage.setItem(ROLES_KEY, JSON.stringify({ ...roles, updatedAt: new Date().toISOString() }));
  render();
}

function saveCotisations() {
  localStorage.setItem(COTISATIONS_KEY, JSON.stringify(cotisations));
}

function getSession() {
  if (!authState.loggedIn || !authState.member) return null;
  return {
    memberId: authState.member.id,
    memberName: authState.member.name,
    isAdmin: authState.member.isAdmin,
  };
}

function setSession(member) {
  authState.loggedIn = true;
  authState.member = {
    id: member.id,
    name: member.name,
    isAdmin: isMemberAdmin(member.id),
  };
}

function clearSession() {
  authState.loggedIn = false;
  authState.member = null;
  authState.mustChangePassword = false;
}

function isLoggedIn() {
  return authState.loggedIn && !authState.mustChangePassword;
}

function isAuthenticated() {
  return authState.loggedIn;
}

function getCurrentMember() {
  if (!authState.loggedIn || !authState.member) return null;
  return (
    getMemberById(authState.member.id) ||
    members.find((m) => m.name.toLowerCase() === authState.member.name.toLowerCase())
  );
}

function isGroupAdmin() {
  const member = getCurrentMember();
  return !!member && isMemberAdmin(member.id);
}

function isFinancier() {
  const member = getCurrentMember();
  if (!member) return false;
  // En vue compte simple, l'admin n'est Financier que s'il a le poste
  if (isGroupAdmin() && isSimpleAccountView()) {
    return getMemberRole(member.id) === "tresorier";
  }
  return isGroupAdmin() || getMemberRole(member.id) === "tresorier";
}

function canDecidePrets() {
  return isFinancier();
}

function isNavPreview() {
  const preview = new URLSearchParams(location.search).get("preview");
  return preview === "nav" || preview === "menu";
}

function hasSessionHint() {
  try {
    const hint = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return Boolean(hint?.memberId);
  } catch {
    return false;
  }
}

function applySessionHint() {
  try {
    const hint = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!hint?.memberId) return false;
    authState = {
      loggedIn: true,
      member: { id: hint.memberId, name: hint.memberName || "" },
      mustChangePassword: false,
    };
    return true;
  } catch {
    return false;
  }
}

function revealApp(loggedIn) {
  document.documentElement.classList.toggle("has-session", Boolean(loggedIn));
  document.documentElement.classList.toggle("needs-login", !loggedIn);
}

function openLoginModal() {
  if (isNavPreview()) return;
  revealApp(false);
  closeAppMenu();
  loginError.hidden = true;
  loginForm.reset();
  const remembered = typeof getRememberedLoginName === "function" ? getRememberedLoginName() : "";
  if (remembered && loginNameInput) {
    loginNameInput.value = remembered;
  }
  loginModal.classList.add("open");
  appEl.classList.add("app-blurred");
  loginNameInput.focus();
}

function closeLoginModal() {
  if (!isAuthenticated()) return;
  if (authState.mustChangePassword) return;
  loginModal.classList.remove("open");
  appEl.classList.remove("app-blurred");
}

function openChangePasswordModal() {
  changePasswordError.hidden = true;
  changePasswordForm.reset();
  changePasswordModal.classList.add("open");
  appEl.classList.add("app-blurred");
  currentPasswordInput.focus();
}

function closeChangePasswordModal() {
  if (authState.mustChangePassword) return;
  changePasswordModal.classList.remove("open");
  if (isAuthenticated()) {
    appEl.classList.remove("app-blurred");
  }
}

const confirmModal = document.getElementById("confirmModal");
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalDesc = document.getElementById("confirmModalDesc");
const confirmModalOk = document.getElementById("confirmModalOk");
const confirmModalCancel = document.getElementById("confirmModalCancel");
const confirmModalQueue = [];

function isAppDialogOpen() {
  return confirmModalQueue.length > 0;
}

function presentConfirmModal() {
  const item = confirmModalQueue[0];
  if (!item || !confirmModal) return;
  const {
    title = "Confirmation",
    message = "",
    okLabel = "OK",
    cancelLabel = "Annuler",
    showCancel = true,
  } = item.opts;
  if (confirmModalTitle) confirmModalTitle.textContent = title;
  if (confirmModalDesc) confirmModalDesc.textContent = message;
  if (confirmModalOk) confirmModalOk.textContent = okLabel;
  if (confirmModalCancel) {
    confirmModalCancel.textContent = cancelLabel;
    confirmModalCancel.hidden = !showCancel;
  }
  confirmModal.classList.add("open");
  appEl.classList.add("app-blurred");
  confirmModalOk?.focus();
}

function closeConfirmModal(result) {
  const item = confirmModalQueue.shift();
  const showCancel = item?.opts?.showCancel !== false;
  confirmModal?.classList.remove("open");
  if (
    !confirmModalQueue.length &&
    !loginModal?.classList.contains("open") &&
    !changePasswordModal?.classList.contains("open")
  ) {
    appEl.classList.remove("app-blurred");
  }
  if (item?.resolve) item.resolve(showCancel ? Boolean(result) : true);
  if (confirmModalQueue.length) presentConfirmModal();
}

function openConfirmModal(opts = {}) {
  return new Promise((resolve) => {
    confirmModalQueue.push({ opts, resolve });
    if (confirmModalQueue.length === 1) presentConfirmModal();
  });
}

function appConfirm(message, title = "Confirmation") {
  const modal = document.getElementById("confirmModal");
  if (!modal || typeof openConfirmModal !== "function") {
    try {
      return Promise.resolve(window.confirm(String(message ?? "")));
    } catch {
      return Promise.resolve(true);
    }
  }
  return openConfirmModal({
    title,
    message: String(message ?? ""),
    okLabel: "OK",
    cancelLabel: "Annuler",
    showCancel: true,
  });
}

/** Toast non bloquant (remplace la plupart des alert) */
function showToast(message, type = "info", options = {}) {
  const host = document.getElementById("toastHost");
  const text = String(message ?? "").trim();
  if (!text) return;

  if (!host) {
    // Fallback ultime
    try {
      openConfirmModal({
        title: options.title || "Poto Timide",
        message: text,
        okLabel: "OK",
        showCancel: false,
      });
    } catch {
      /* ignore */
    }
    return;
  }

  const duration = options.duration ?? (type === "error" ? 5500 : type === "success" ? 3200 : 4200);
  const icons = { success: "✓", error: "!", info: "i", warn: "!" };
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icons[type] || "i"}</span>
    <div class="toast-body"></div>
    <button type="button" class="toast-close" aria-label="Fermer">×</button>
  `;
  el.querySelector(".toast-body").textContent = text;

  const remove = () => {
    if (el.classList.contains("is-leaving")) return;
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 220);
  };
  el.querySelector(".toast-close")?.addEventListener("click", remove);
  host.appendChild(el);
  // Max 4 toasts
  while (host.children.length > 4) host.firstElementChild?.remove();
  if (duration > 0) setTimeout(remove, duration);
}

function showToastSuccess(message, opts) {
  showToast(message, "success", opts);
}
function showToastError(message, opts) {
  showToast(message, "error", opts);
}
function showToastInfo(message, opts) {
  showToast(message, "info", opts);
}
function showToastWarn(message, opts) {
  showToast(message, "warn", opts);
}

/**
 * Remplace alert() : toast non bloquant.
 * Type auto : erreur si le texte ressemble à un refus / invalide.
 */
function appAlert(message, title = "Poto Timide") {
  const text = String(message ?? "");
  const lower = text.toLowerCase();
  let type = "info";
  if (
    /invalide|impossible|erreur|refusé|refus|interdit|seul |seuls |veuillez|obligatoire|trop |maximum|aucun |pas (pu|encore|autoris)/i.test(
      lower
    )
  ) {
    type = "error";
  } else if (/enregistr|validé|ajouté|supprimé|publié|succès|ok —|remboursé|à jour/i.test(lower)) {
    type = "success";
  } else if (/attention|déjà|attendre|encore en vote/i.test(lower)) {
    type = "warn";
  }
  showToast(text, type, { title });
}

// Toutes les alert() natives → toast
window.alert = (message) => {
  appAlert(message);
};

confirmModalOk?.addEventListener("click", () => closeConfirmModal(true));
confirmModalCancel?.addEventListener("click", () => closeConfirmModal(false));
confirmModal?.addEventListener("click", (e) => {
  if (e.target !== confirmModal) return;
  closeConfirmModal(confirmModalQueue[0]?.opts?.showCancel === false);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!confirmModal?.classList.contains("open")) return;
  e.preventDefault();
  closeConfirmModal(confirmModalQueue[0]?.opts?.showCancel === false);
});

function bindFormEnterKey(form, inputs, onSubmit) {
  if (!form) return;
  const fields = inputs.filter(Boolean);
  if (fields.length === 0) return;

  form.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing || e.repeat) return;
    const target = e.target;
    if (!(target instanceof HTMLInputElement) || !fields.includes(target)) return;

    const index = fields.indexOf(target);
    const nextField = index < fields.length - 1 ? fields[index + 1] : null;

    if (nextField && !nextField.value.trim()) {
      e.preventDefault();
      nextField.focus();
      return;
    }

    e.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit();
      return;
    }
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  });
}

function setupLoginForm() {
  if (!loginForm) return;

  const submitLogin = () => {
    loginMember(loginNameInput?.value ?? "", loginPasswordInput?.value ?? "");
  };

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    submitLogin();
  });

  loginForm.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing || e.repeat) return;
    const target = e.target;
    if (target !== loginNameInput && target !== loginPasswordInput) return;

    if (target === loginNameInput && loginPasswordInput && !loginPasswordInput.value.trim()) {
      e.preventDefault();
      loginPasswordInput.focus();
      return;
    }

    e.preventDefault();
    submitLogin();
  });
}

async function loginMember(name, password) {
  if (loginForm?.dataset.busy === "1") return false;

  const submitBtn = loginForm?.querySelector('button[type="submit"]');
  const submitLabel = submitBtn?.textContent;
  loginError.hidden = true;
  if (loginForm) loginForm.dataset.busy = "1";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Connexion…";
  }

  try {
    try {
      await apiLogin(name.trim(), password);
    } catch (err) {
      loginError.textContent = err.message || "Identifiant ou mot de passe incorrect.";
      loginError.hidden = false;
      return false;
    }

    loginModal.classList.remove("open");
    revealApp(true);
    if (authState.mustChangePassword) {
      openChangePasswordModal();
    } else {
      appEl.classList.remove("app-blurred");
    }
    // Journal de connexion : uniquement côté serveur (évite les doublons)
    updateSessionUI();

    try {
      await loadDataFromServer();
    } catch (err) {
      console.warn("Chargement des données après connexion :", err);
    }

    try {
      reloadFromStorage();
      if (typeof potoStartPeriodicSync === "function") potoStartPeriodicSync();
      startOnlinePolling();
      ensureDefaultAdmin();
      if (authState.member) {
        authState.member.isAdmin = isMemberAdmin(authState.member.id);
      }
      updateSessionUI();
      render();
      maybeShowInstallBanner();
      pushSetupStarted = false;
      setupPushNotifications();
      applyNotificationDeepLink();
    } catch (err) {
      console.warn("Affichage après connexion :", err);
      appEl.classList.remove("app-blurred");
      updateSessionUI();
      try {
        render();
      } catch (renderErr) {
        console.warn("Rendu après connexion :", renderErr);
      }
    }
    return true;
  } finally {
    if (loginForm) delete loginForm.dataset.busy;
    if (submitBtn) {
      submitBtn.disabled = false;
      if (submitLabel) submitBtn.textContent = submitLabel;
    }
  }
}

async function changeMemberPassword(currentPassword, newPassword, confirmPassword) {
  changePasswordError.hidden = true;

  if (newPassword !== confirmPassword) {
    changePasswordError.textContent = "Les mots de passe ne correspondent pas.";
    changePasswordError.hidden = false;
    return false;
  }

  try {
    await apiChangePassword(currentPassword, newPassword);
    changePasswordModal.classList.remove("open");
    appEl.classList.remove("app-blurred");
    updateSessionUI();
    render();
    return true;
  } catch (err) {
    changePasswordError.textContent = err.message || "Impossible de changer le mot de passe.";
    changePasswordError.hidden = false;
    return false;
  }
}

async function resetMemberPassword(memberId) {
  const member = getMemberById(memberId);
  if (!member || !isGroupAdmin()) return;

  if (isOwnerMember(memberId) && !isOwnerMember(getCurrentMember())) {
    alert("Le mot de passe du propriétaire ne peut pas être réinitialisé par un autre admin.");
    return;
  }

  if (
    !(await appConfirm(
      `Réinitialiser le mot de passe de ${member.name} à 1234 ?\nIl devra le changer à la prochaine connexion.`
    ))
  ) {
    return;
  }

  try {
    await apiResetMemberPassword(memberId);
    alert(`Mot de passe de ${member.name} réinitialisé à 1234.`);
  } catch (err) {
    alert(err.message || "Échec de la réinitialisation.");
  }
}

async function logoutMember() {
  cancelEditAmende();
  stopOnlinePolling();
  onlineMembers = [];
  renderOnlineList();
  try {
    if (typeof potoFlushSync === "function") await potoFlushSync();
    await apiLogout();
  } catch {
    /* ignore */
  }
  clearSession();
  cotisationsDraft = { ...cotisations };
  tourneeDraft = cloneTourneeData(tourneeData);
  saveMsg.hidden = true;
  changePasswordModal.classList.remove("open");
  updateSessionUI();
  render();
  openLoginModal();
}

function canAccessMainTab(tabId) {
  if (!isLoggedIn()) return false;
  if (isNouveauMember(getCurrentMember())) {
    return tabId === "loi";
  }
  return true;
}

/** Restreint la navigation pour un compte "nouveau" (La loi seulement) */
function applyNouveauTabRestrictions() {
  const isNouveau = isNouveauMember(getCurrentMember());
  document.querySelectorAll(".tab[data-tab]").forEach((btn) => {
    const tabId = btn.dataset.tab;
    if (!tabId) return;
    if (isNouveau) {
      btn.hidden = tabId !== "loi";
    } else if (tabId === "admin" || tabId === "gestion") {
      // géré ailleurs
    } else {
      // réafficher les onglets standards (sauf admin géré au-dessus)
      if (tabId !== "admin") btn.hidden = false;
    }
  });
  if (isNouveau) {
    if (tabBtnAdmin) tabBtnAdmin.hidden = true;
    if (tabBtnGestion) tabBtnGestion.hidden = true;
    const active = document.querySelector(".tab-content.active");
    if (active && active.id !== "tab-loi") {
      showTab("loi");
    }
  }
}

function updateSessionUI() {
  const loggedIn = isAuthenticated();
  const canUseApp = isLoggedIn();
  const isAdmin = isGroupAdmin();
  const current = getCurrentMember();

  if (loggedIn && current) {
    const roleId = getMemberRole(current.id);
    const roleLabel = roleId ? getRoleLabel(roleId) : null;

    if (isAdmin) {
      userStatus.innerHTML = `<span class="badge-crown" aria-hidden="true">👑</span> Administrateur : ${escapeHtml(current.name)}`;
    } else if (roleLabel) {
      userStatus.textContent = `Connecté : ${current.name} (${roleLabel})`;
    } else {
      userStatus.textContent = `Connecté : ${current.name}`;
    }

    userStatus.classList.toggle("admin-active", isAdmin);
    userStatus.classList.toggle("member-active", !isAdmin);
  } else {
    userStatus.textContent = "Non connecté";
    userStatus.classList.remove("admin-active", "member-active");
  }

  if (loginBtn) {
    loginBtn.hidden = loggedIn;
    loginBtn.setAttribute("aria-hidden", loggedIn ? "true" : "false");
  }
  if (logoutBtn) {
    logoutBtn.hidden = !loggedIn;
    logoutBtn.setAttribute("aria-hidden", loggedIn ? "false" : "true");
  }
  document.body.classList.toggle("is-logged-in", loggedIn);
  if (loggedIn) updatePretTabBadge();

  // Pas de bannière / messages « vue simple » pour les membres
  if (simpleViewBanner) simpleViewBanner.hidden = true;

  if (saveCotisationsBtn) saveCotisationsBtn.hidden = !canEditTourneePlanning();
  if (tourneeInfoMsg) tourneeInfoMsg.hidden = true;
  const tourneeEditHint = document.getElementById("tourneeEditHint");
  if (tourneeEditHint) {
    tourneeEditHint.hidden = true;
    tourneeEditHint.textContent = "";
  }
  if (membresLockMsg) {
    membresLockMsg.hidden = true;
    membresLockMsg.textContent = "";
  }

  // Onglet Admin : administrateur ou personne avec un accès métier
  if (tabBtnAdmin) tabBtnAdmin.hidden = !canAccessAdminTab();
  if (tabBtnGestion) tabBtnGestion.hidden = !canAccessAdminTab();
  if (tabBtnTournee) tabBtnTournee.hidden = false;
  if (tabBtnAutreArgent) tabBtnAutreArgent.hidden = true;

  // Nouveau (invité) : uniquement l'onglet La loi
  applyNouveauTabRestrictions();

  // Fond de caisse : pas dans Finance public
  if (financeSubCaisse) financeSubCaisse.hidden = true;

  if (rolesPanel) rolesPanel.hidden = !hasRoleTabAccess("bureau");
  if (addMemberPanel) addMemberPanel.hidden = !hasRoleTabAccess("membres");
  if (tabPermissionsPanel) tabPermissionsPanel.hidden = !isAdmin;
  if (adminRolesPanel) adminRolesPanel.hidden = !isAdmin;

  if (addAmendePanel) addAmendePanel.hidden = !canAddDettesAmendesUnified();
  if (addEvenementPanel) addEvenementPanel.hidden = !canManageTab("evenements");

  if (fondCaissePanel) fondCaissePanel.hidden = true;
  const fondAdminPanel = document.getElementById("fondCaissePanelAdmin");
  if (fondAdminPanel) fondAdminPanel.hidden = !hasRoleTabAccess("caisse");
  if (autreArgentFormPanel) autreArgentFormPanel.hidden = !canManageCaisseArgent();
  if (autreArgentListPanel) autreArgentListPanel.hidden = !canManageCaisseArgent();

  addMemberPanel?.classList.toggle("locked", !hasRoleTabAccess("membres"));
  rolesPanel?.classList.toggle("locked", !hasRoleTabAccess("bureau"));
  adminRolesPanel?.classList.toggle("locked", !isAdmin);
  tabPermissionsPanel?.classList.toggle("locked", !isAdmin);

  // Ne jamais rappeler showAdminSub/Hub ici (boucle infinie avec render())
}

function requireGroupAdmin(actionLabel) {
  if (!isLoggedIn()) {
    alert("Veuillez vous connecter avec votre nom.");
    openLoginModal();
    return false;
  }
  if (isGroupAdmin()) return true;
  alert(`Seul un administrateur du groupe peut ${actionLabel}.`);
  return false;
}


/** Accès simple : connecté + (admin groupe OU owner OU rôle) — pas de verrou "vue simple" */
function canDo(tabId) {
  if (!isLoggedIn()) return false;
  if (typeof isGroupAdmin === "function" && isGroupAdmin()) return true;
  if (typeof isOwnerMember === "function" && isOwnerMember(getCurrentMember())) return true;
  if (typeof isFinancierPoste === "function" && isFinancierPoste()) {
    if (!tabId || ["caisse", "prets", "amendes", "evenements", "finance"].includes(tabId)) return true;
  }
  if (!tabId) return canAccessAdminTab();
  if (typeof hasRoleTabAccess === "function" && hasRoleTabAccess(tabId)) return true;
  if (tabId === "membres" && hasRoleTabAccess("bureau")) return true;
  if (tabId === "ancienne-tournee" && hasRoleTabAccess("amendes")) return true;
  return false;
}

function requireLogin(msg) {
  if (isLoggedIn()) return true;
  alert(msg || "Connecte-toi d'abord.");
  if (typeof openLoginModal === "function") openLoginModal();
  return false;
}

function requireTabAccess(tabId, actionLabel) {
  if (!requireLogin()) return false;
  if (canDo(tabId)) return true;
  alert(`Pas l'accès pour ${actionLabel || "cette action"}.`);
  return false;
}

function showSaveMessage(text, type = "success") {
  saveMsg.textContent = text;
  saveMsg.className = `save-msg save-msg-${type}`;
  saveMsg.hidden = false;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFriendlyDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(String(dateStr).split("T")[0] + "T12:00:00");
  if (Number.isNaN(date.getTime())) return formatDate(dateStr);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday - startDate) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays > 1 && diffDays < 7) return `Il y a ${diffDays} jours`;
  return formatDate(String(dateStr).split("T")[0]);
}

function formatCompactDate(dateStr) {
  const date = new Date(String(dateStr || "").split("T")[0] + "T12:00:00");
  if (Number.isNaN(date.getTime())) return formatFriendlyDate(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function formatAdaptiveDate(dateStr) {
  if (typeof window !== "undefined" && window.innerWidth <= 900) return formatCompactDate(dateStr);
  return formatFriendlyDate(dateStr);
}

function fitTablesToScreen(scope) {
  // Plus de réduction (scale) : on garde une taille lisible
  // et on permet le défilement horizontal (swipe gauche/droite).
  if (typeof isUserEditingForm === "function" && isUserEditingForm()) return;
  if (typeof isLoanDateEditing === "function" && isLoanDateEditing()) return;
  const root = scope && scope.querySelectorAll ? scope : document;
  root.querySelectorAll(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap").forEach((wrap) => {
    const table = wrap.querySelector("table");
    if (!table) return;

    // Annuler tout ancien scale / hauteur forcée
    table.style.transform = "";
    table.style.transformOrigin = "";
    table.style.width = "max-content";
    table.style.minWidth = "max-content";
    wrap.style.height = "";
  });
}

let lastFitViewportWidth = 0;
function scheduleFitTables() {
  fitTablesToScreen();
}

function toDateInputValue(iso) {
  const raw = String(iso || "");
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function combineDateWithTime(ymd, previousIso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd || ""))) return null;
  const previous = String(previousIso || "");
  const timePart = previous.includes("T") ? previous.slice(previous.indexOf("T") + 1) : "12:00:00.000Z";
  const next = `${ymd}T${timePart}`;
  if (Number.isNaN(new Date(next).getTime())) return null;
  return next;
}

function getRoleLabel(roleId) {
  return ROLES.find((r) => r.id === roleId)?.label || roleId;
}

function getMemberRole(memberId) {
  return Object.entries(roles).find(([, id]) => id === memberId)?.[0] || null;
}

function getMemberById(id) {
  const raw = String(id || "").trim();
  if (!raw) return null;
  if (raw.toLowerCase() === "groupe" || raw.toLowerCase() === "le groupe") {
    return { id: "groupe", name: "Le groupe" };
  }
  return members.find((m) => m.id === raw) || null;
}

function compareMemberNames(a, b) {
  return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
}

function isNouveauMember(memberOrId) {
  if (!memberOrId) return false;
  const member = typeof memberOrId === "string" ? getMemberById(memberOrId) : memberOrId;
  return Boolean(member && member.kind === "nouveau");
}

/** Membres du groupe (exclut les "nouveaux" invités La loi) */
/** Tous les comptes (membres + nouveaux), triés */
function getAllAccountsSorted() {
  return [...members].sort(compareMemberNames);
}

/** Membres du groupe uniquement (sans les comptes "nouveau") */
function getGroupMembers() {
  return getAllAccountsSorted().filter((m) => !isNouveauMember(m));
}

/** Alias historique : membres du groupe (pas les invités La loi) */
function getSortedMembers() {
  return getGroupMembers();
}

function isLimitReached() {
  return members.length >= MAX_MEMBERS;
}

function updateFormState() {
  const full = isLimitReached();
  const canMembers = hasRoleTabAccess("membres");
  const canBureau = hasRoleTabAccess("bureau");
  const isAdmin = isGroupAdmin();
  memberNameInput.disabled = full || !canMembers;
  submitBtn.disabled = full || !canMembers;
  limitMsg.hidden = !full;
  roleMemberSelect.disabled = !canBureau;
  rolePostSelect.disabled = !canBureau;
  const roleSubmit = roleForm?.querySelector('button[type="submit"]');
  if (roleSubmit) roleSubmit.disabled = !canBureau;
  if (adminMemberSelect) adminMemberSelect.disabled = !isAdmin;
  if (adminForm) {
    const adminSubmit = adminForm.querySelector('button[type="submit"]');
    if (adminSubmit) adminSubmit.disabled = !isAdmin;
  }
}

function updateMemberSelects() {
  const options = `<option value="">— Choisir un membre —</option>`;

  roleMemberSelect.innerHTML = options;
  amendeMemberSelect.innerHTML = options;
  if (evenementMemberSelect) evenementMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option>`;
  if (adminMemberSelect) adminMemberSelect.innerHTML = `<option value="">— Choisir un membre —</option>`;
  if (autreArgentMemberSelect) {
    autreArgentMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option><option value="groupe">Le groupe</option>`;
  }
  if (ancienneTourneeMemberSelect) {
    ancienneTourneeMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option>`;
  }

  getSortedMembers().forEach((member) => {
    const currentRole = getMemberRole(member.id);
    const label = currentRole
      ? `${member.name} (${getRoleLabel(currentRole)})`
      : member.name;

    const roleOption = document.createElement("option");
    roleOption.value = member.id;
    roleOption.textContent = label;
    roleMemberSelect.appendChild(roleOption);

    const amendeOption = document.createElement("option");
    amendeOption.value = member.id;
    amendeOption.textContent = member.name;
    amendeMemberSelect.appendChild(amendeOption);

    if (evenementMemberSelect) {
      const evenementOption = document.createElement("option");
      evenementOption.value = member.id;
      evenementOption.textContent = member.name;
      evenementMemberSelect.appendChild(evenementOption);
    }

    if (adminMemberSelect && !isMemberAdmin(member.id)) {
      const adminOption = document.createElement("option");
      adminOption.value = member.id;
      adminOption.textContent = member.name;
      adminMemberSelect.appendChild(adminOption);
    }

    if (autreArgentMemberSelect) {
      const autreOption = document.createElement("option");
      autreOption.value = member.id;
      autreOption.textContent = member.name;
      autreArgentMemberSelect.appendChild(autreOption);
    }

    if (ancienneTourneeMemberSelect) {
      const detteOption = document.createElement("option");
      detteOption.value = member.id;
      detteOption.textContent = member.name;
      ancienneTourneeMemberSelect.appendChild(detteOption);
    }
  });
}

function renderAdminList() {
  if (!adminList) return;

  if (adminIds.length === 0) {
    adminList.innerHTML = `<li class="empty">Aucun administrateur.</li>`;
    return;
  }

  adminList.innerHTML = [...adminIds]
    .sort((idA, idB) => {
      const nameA = getMemberById(idA)?.name || "";
      const nameB = getMemberById(idB)?.name || "";
      return nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
    })
    .map((id) => {
      const member = getMemberById(id);
      if (!member) return "";

      const isOwner = isOwnerMember(member);
      const canRemove = adminIds.length > 1 && !isOwner;
      return `
        <li class="admin-item">
          <div>
            <p class="admin-item-name">${escapeHtml(member.name)}${isOwner ? ' <span class="tag-admin">Propriétaire</span>' : ""}</p>
            <p class="admin-item-meta">${isOwner ? "Créateur du site — droits permanents" : "Accès complet au groupe"}</p>
          </div>
          ${
            isOwner
              ? `<span class="admin-only-note">Protégé</span>`
              : canRemove
                ? `<button type="button" class="btn-clear btn-remove-admin" data-id="${member.id}">Retirer</button>`
                : `<span class="admin-only-note">Unique</span>`
          }
        </li>
      `;
    })
    .join("");

  adminList.querySelectorAll(".btn-remove-admin").forEach((btn) => {
    btn.addEventListener("click", () => removeAdmin(btn.dataset.id));
  });
}

async function assignAdmin(memberId) {
  if (!requireGroupAdmin("nommer un administrateur")) return;

  const member = getMemberById(memberId);
  if (!member) return;

  if (isMemberAdmin(memberId)) {
    alert("Ce membre est déjà administrateur.");
    return;
  }

  adminIds.push(memberId);
  saveAdminIds();
  if (typeof potoFlushSync === "function") await potoFlushSync();
  if (adminForm) adminForm.reset();
}

async function removeAdmin(memberId) {
  if (!requireGroupAdmin("retirer un administrateur")) return;

  if (isOwnerMember(memberId)) {
    alert("Le propriétaire du site ne peut pas perdre ses droits administrateur.");
    return;
  }

  if (adminIds.length <= 1) {
    alert("Il doit rester au moins un administrateur.");
    return;
  }

  const member = getMemberById(memberId);
  if (!member) return;

  if (!(await appConfirm(`Retirer les droits administrateur de « ${member.name} » ?`))) return;

  adminIds = adminIds.filter((id) => id !== memberId);
  saveAdminIds();
  if (typeof potoFlushSync === "function") await potoFlushSync();

  const current = getCurrentMember();
  if (current?.id === memberId) {
    updateSessionUI();
  }
}

let tabPermissionsSaving = false;
let tabPermissionsTouchAt = 0;

function collectTabPermissionsFromUI() {
  const nextPermissions = {};
  MANAGEABLE_TABS.forEach((tab) => {
    nextPermissions[tab.id] = [];
  });
  tabPermissionsBody?.querySelectorAll(".tab-perm-checkbox:checked").forEach((checkbox) => {
    const tabId = checkbox.dataset.tab;
    const roleId = checkbox.dataset.role;
    if (nextPermissions[tabId] && !nextPermissions[tabId].includes(roleId)) {
      nextPermissions[tabId].push(roleId);
    }
  });
  return nextPermissions;
}

function renderTabPermissionsPanel() {
  if (!tabPermissionsTable || !tabPermissionsBody) return;
  // Ne pas reconstruire le tableau si l'utilisateur vient de cocher une case
  if (tabPermissionsSaving) return;
  if (Date.now() - tabPermissionsTouchAt < 4000) return;

  const headerRow = tabPermissionsTable.querySelector("thead tr");
  headerRow.innerHTML = `
    <th class="permissions-tab-col">Onglet</th>
    ${ROLES.map((role) => `<th>${escapeHtml(role.label)}</th>`).join("")}
  `;

  tabPermissionsBody.innerHTML = MANAGEABLE_TABS.map((tab) => {
    const roleCells = ROLES.map((role) => {
      const checked = getTabAllowedRoles(tab.id).includes(role.id);
      return `
        <td>
          <input
            type="checkbox"
            class="tab-perm-checkbox"
            data-tab="${tab.id}"
            data-role="${role.id}"
            ${checked ? "checked" : ""}
            ${isGroupAdmin() ? "" : "disabled"}
          />
        </td>
      `;
    }).join("");

    return `
      <tr>
        <td class="permissions-tab-col">${escapeHtml(tab.label)}</td>
        ${roleCells}
      </tr>
    `;
  }).join("");
}

async function saveTabPermissionsFromUI(options = {}) {
  const { silent = false } = options;
  if (!requireGroupAdmin("configurer les accès aux onglets")) return;

  const nextPermissions = collectTabPermissionsFromUI();
  tabPermissions = nextPermissions;
  saveTabPermissionsData();
  tabPermissionsTouchAt = Date.now();

  if (!silent && tabPermissionsMsg) {
    tabPermissionsMsg.textContent = "Enregistrement des accès…";
    tabPermissionsMsg.className = "save-msg";
    tabPermissionsMsg.hidden = false;
  }

  tabPermissionsSaving = true;
  try {
    const flushed = typeof potoFlushSync === "function" ? await potoFlushSync() : true;
    if (!flushed) {
      if (tabPermissionsMsg) {
        tabPermissionsMsg.textContent = "Accès enregistrés ici, mais pas encore sur le serveur. Réessaie.";
        tabPermissionsMsg.className = "save-msg save-msg-error";
        tabPermissionsMsg.hidden = false;
      }
      return;
    }

    if (tabPermissionsMsg) {
      tabPermissionsMsg.textContent = silent ? "Accès mis à jour." : "Accès aux onglets enregistrés.";
      tabPermissionsMsg.className = "save-msg save-msg-success";
      tabPermissionsMsg.hidden = false;
    }

    updateSessionUI();
    updateAdminSubtabVisibility();
  } finally {
    tabPermissionsSaving = false;
    tabPermissionsTouchAt = Date.now();
  }
}

async function handleTabPermissionCheckboxChange(e) {
  const checkbox = e.target.closest?.(".tab-perm-checkbox");
  if (!checkbox || !tabPermissionsBody?.contains(checkbox)) return;
  if (!isGroupAdmin()) {
    checkbox.checked = !checkbox.checked;
    return;
  }
  tabPermissionsTouchAt = Date.now();
  // Enregistrement immédiat au clic — la case reste cochée
  await saveTabPermissionsFromUI({ silent: true });
}

function buildBureauHtml(allowClear) {
  const canBureau = hasRoleTabAccess("bureau");
  const visibleRoles = canBureau || allowClear ? ROLES : ROLES.filter((role) => roles[role.id]);

  if (visibleRoles.length === 0) {
    return `<li class="bureau-empty">Aucun poste attribué.</li>`;
  }

  return visibleRoles
    .map((role) => {
      const memberId = roles[role.id];
      const member = memberId ? getMemberById(memberId) : null;
      const canClear = allowClear && member && canBureau;
      const shortRole = role.short || role.label;
      return `
        <li class="bureau-card${member ? "" : " is-vacant"}" title="${escapeHtml(role.label)}${member ? " — " + escapeHtml(member.name) : " — vacant"}">
          <div class="bureau-card-body">
            <span class="bureau-card-role">${escapeHtml(shortRole)}</span>
            <span class="bureau-card-name">${member ? escapeHtml(member.name) : "—"}</span>
          </div>
          ${
            canClear
              ? `<button type="button" class="btn-bureau-clear" data-role="${role.id}" title="Retirer — ${escapeHtml(role.label)}">×</button>`
              : ""
          }
        </li>
      `;
    })
    .join("");
}

function bindBureauClearButtons(listEl) {
  if (!listEl) return;
  listEl.querySelectorAll(".btn-bureau-clear").forEach((btn) => {
    btn.addEventListener("click", () => clearRole(btn.dataset.role));
  });
}

function renderBureau() {
  if (bureauList) {
    bureauList.innerHTML = buildBureauHtml(false);
  }
  if (bureauListGestion) {
    bureauListGestion.innerHTML = buildBureauHtml(true);
    bindBureauClearButtons(bureauListGestion);
  }
}

function fillMemberList(listEl, { withAdminActions }) {
  if (!listEl) return;
  listEl.innerHTML = "";

  // Liste publique : membres du groupe. Admin : tout le monde (y compris nouveaux).
  const source = withAdminActions ? getAllAccountsSorted() : getGroupMembers();

  if (source.length === 0) {
    listEl.innerHTML = `<li class="empty">${
      withAdminActions ? "Aucun compte pour le moment." : "Aucun membre pour le moment."
    }</li>`;
    return;
  }

  const currentMember = getCurrentMember();
  const showActions = withAdminActions && hasRoleTabAccess("membres");

  source.forEach((member, index) => {
    const roleId = getMemberRole(member.id);
    const memberIsAdmin = isMemberAdmin(member.id);
    const isCurrentUser = currentMember?.id === member.id;
    const isOnline = isMemberOnline(member.id);

    const li = document.createElement("li");
    li.className = `member-item${isCurrentUser ? " member-current" : ""}${isOnline ? " member-online" : ""}`;
    li.innerHTML = `
      <div class="member-info">
        <span class="member-avatar${isOnline ? " member-avatar-online" : ""}">${escapeHtml(getInitials(member.name))}</span>
        <div class="member-text">
          <p class="member-name" title="${escapeHtml(member.name)} — ${formatEuro(getMemberCotisationAmount(member.id))} / mois">
            <span class="member-num">#${index + 1}</span>
            ${escapeHtml(member.name)}
            <span class="member-cotisation">: ${formatEuro(getMemberCotisationAmount(member.id))}</span>
            ${memberIsAdmin ? '<span class="tag-admin">Admin</span>' : ""}
            ${isNouveauMember(member) ? '<span class="tag-nouveau">Nouveau · La loi</span>' : ""}
            ${isCurrentUser ? '<span class="tag-you">Vous</span>' : ""}
            ${isOnline ? '<span class="tag-online">En ligne</span>' : ""}
          </p>
          <p class="member-date">
            ${
              isNouveauMember(member)
                ? '<span class="role-badge role-badge-nouveau">Nouveau — accès La loi</span>'
                : roleId
                  ? `<span class="role-badge">${escapeHtml(getRoleLabel(roleId))}</span>`
                  : "Membre du groupe"
            }
          </p>
        </div>
      </div>
      ${
        showActions
          ? `<div class="member-right">
              <div class="member-actions">
                ${
                  isOwnerMember(member)
                    ? `<span class="admin-only-note">Propriétaire</span>`
                    : `<button type="button" class="btn-clear btn-reset-pwd" data-id="${member.id}" title="Réinitialiser le mot de passe">MDP</button>
                       <button class="btn-delete" data-id="${member.id}" title="Supprimer">×</button>`
                }
              </div>
            </div>`
          : ""
      }
    `;

    const resetPwdBtn = li.querySelector(".btn-reset-pwd");
    if (resetPwdBtn) {
      resetPwdBtn.addEventListener("click", () => resetMemberPassword(member.id));
    }

    const deleteBtn = li.querySelector(".btn-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteMember(member.id));
    }
    listEl.appendChild(li);
  });
}

