async function clearRole(roleId) {
  if (!requireTabAccess("bureau", "modifier le bureau")) return;

  const member = getMemberById(roles[roleId]);
  if (!member) return;

  if (await appConfirm(`Retirer « ${member.name} » du poste de ${getRoleLabel(roleId)} ?`)) {
    delete roles[roleId];
    saveRoles();
  }
}

async function addMember(name, kind = "member") {
  // Autoriser depuis Admin → Membres (workspace admin)
  if (!isLoggedIn()) {
    alert("Veuillez vous connecter avec votre nom.");
    openLoginModal();
    return;
  }
  if (!(isGroupAdmin() || hasRoleTabAccess("membres"))) {
    alert("Vous n'avez pas l'autorisation d'ajouter des membres.");
    return;
  }
  // Si on est dans Admin, on n'exige pas le test isSimpleAccountView
  if (!isAdminWorkspace() && isSimpleAccountView()) {
    alert("Cette action se fait dans l'onglet Admin → Membres & Bureau.");
    return;
  }

  const trimmed = String(name || "").trim();
  if (!trimmed) {
    alert("Indique un nom.");
    memberNameInput?.focus();
    return;
  }

  if (isLimitReached()) {
    alert(`Maximum de ${MAX_MEMBERS} membres atteint.`);
    return;
  }

  if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
    alert("Ce nom existe déjà.");
    return;
  }

  const accountKind = kind === "nouveau" ? "nouveau" : "member";
  const newMember = {
    id: generateId(),
    name: trimmed,
    kind: accountKind,
    createdAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveMembers();

  const kindLabel =
    accountKind === "nouveau"
      ? "Nouveau (accès uniquement à l'onglet La loi)"
      : "Membre du groupe";

  if (authState.loggedIn) {
    try {
      if (typeof potoFlushSync === "function") await potoFlushSync();
      const result = await apiEnsureMemberUser(newMember.id);
      if (result?.created) {
        alert(
          `${trimmed} ajouté — ${kindLabel}.\nMot de passe : 1234`
        );
      } else {
        alert(`${trimmed} ajouté — ${kindLabel}.`);
      }
    } catch (err) {
      console.warn("Compte non créé immédiatement :", err.message);
      alert(
        `${trimmed} enregistré (${kindLabel}), mais le compte n'a pas pu être créé tout de suite.\nRéinitialisez le mot de passe depuis la liste.`
      );
    }
  } else {
    alert(
      `${trimmed} est enregistré localement (${kindLabel}). Connectez-vous en admin pour activer son compte (mot de passe : 1234).`
    );
  }

  memberForm?.reset();
  const kindEl = memberKindSelect || document.getElementById("memberKind");
  if (kindEl) kindEl.value = "member";
  memberNameInput?.focus();
  if (typeof renderMemberList === "function") renderMemberList();
  if (typeof renderBureau === "function") renderBureau();
}

function purgeMemberFromTourneeYear(yearData, memberId) {
  if (!yearData || typeof yearData !== "object") return;

  Object.keys(yearData).forEach((key) => {
    if (key === TOURNEE_PARTNERS_KEY) {
      const partners = yearData[key];
      delete partners[memberId];
      Object.entries(partners).forEach(([otherId, monthPartners]) => {
        Object.entries(monthPartners || {}).forEach(([monthKey, partnerId]) => {
          if (partnerId === memberId) delete monthPartners[monthKey];
        });
        if (!Object.keys(monthPartners || {}).length) delete partners[otherId];
      });
      if (!Object.keys(partners).length) delete yearData[key];
      return;
    }

    if (
      key === TOURNEE_BOUFFE_OK_KEY ||
      key === TOURNEE_RECEPTION_OK_KEY ||
      key === TOURNEE_RISTOURNE_OK_KEY ||
      key === TOURNEE_RECEPTION_DATES_KEY
    ) {
      if (yearData[key]?.[memberId]) {
        delete yearData[key][memberId];
        if (!Object.keys(yearData[key]).length) delete yearData[key];
      }
      return;
    }

    if (key === TOURNEE_RECEPTION_KEY || key === TOURNEE_RISTOURNE_KEY) {
      const map = yearData[key] || {};
      Object.keys(map).forEach((monthKey) => {
        if (!Array.isArray(map[monthKey])) return;
        map[monthKey] = map[monthKey].filter((id) => id !== memberId);
        if (map[monthKey].length === 0) delete map[monthKey];
      });
      if (!Object.keys(map).length) delete yearData[key];
      return;
    }

    if (Number.isNaN(Number(key)) || !Array.isArray(yearData[key])) return;

    yearData[key] = yearData[key].filter((id) => id !== memberId);
    if (yearData[key].length === 0) delete yearData[key];
  });
}

function purgeMemberFromTourneeStore(tourneeStore, memberId) {
  if (!tourneeStore?.years) return;
  Object.values(tourneeStore.years).forEach((yearData) => {
    purgeMemberFromTourneeYear(yearData, memberId);
  });
}

function purgeMemberFromEvenements(memberId) {
  const removedEventIds = new Set();

  evenements.forEach((evt) => {
    if (evt.beneficiaryMemberId === memberId) {
      removedEventIds.add(evt.id);
      return;
    }

    if (evt.payments?.[memberId]) {
      delete evt.payments[memberId];
    }

    if (evt.createdBy === memberId) {
      evt.createdBy = null;
    }
  });

  if (removedEventIds.size > 0) {
    evenements = evenements.filter((evt) => !removedEventIds.has(evt.id));
    amendes = amendes.filter(
      (amende) => !amende.evenementId || !removedEventIds.has(amende.evenementId)
    );
  }
}

function purgeMemberReferences(memberId) {
  Object.keys(roles).forEach((roleId) => {
    if (roles[roleId] === memberId) delete roles[roleId];
  });

  delete cotisations[memberId];
  delete cotisationsDraft[memberId];

  purgeMemberFromTourneeStore(tourneeData, memberId);
  purgeMemberFromTourneeStore(tourneeDraft, memberId);

  amendes = amendes.filter((amende) => amende.memberId !== memberId);
  amendesCaisse = amendesCaisse.filter((entry) => entry.memberId !== memberId);

  purgeMemberFromEvenements(memberId);

  prets = prets.filter((loan) => loan.borrowerId !== memberId);
  prets.forEach((loan) => {
    delete loan.votes?.[memberId];
  });

  notifications = notifications.filter((notif) => notif.memberId !== memberId);
  adminIds = adminIds.filter((adminId) => adminId !== memberId || isOwnerMember(adminId));
  ensureOwnerAdmin();
  autreArgent = autreArgent.filter((entry) => entry.memberId !== memberId);
  ancienneTourneeDettes = ancienneTourneeDettes.filter((entry) => entry.memberId !== memberId);

  Object.values(fondCaisseAnnuel.years || {}).forEach((yearData) => {
    if (yearData?.payments) delete yearData.payments[memberId];
  });

  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  localStorage.setItem(COTISATIONS_KEY, JSON.stringify(cotisations));
  localStorage.setItem(TOURNEE_KEY, JSON.stringify(tourneeData));
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));
  localStorage.setItem(AMENDES_CAISSE_KEY, JSON.stringify(amendesCaisse));
  localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));
  localStorage.setItem(PRETS_KEY, JSON.stringify(prets));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  saveAdminIds(false);
  localStorage.setItem(AUTRE_ARGENT_KEY, JSON.stringify(autreArgent));
  localStorage.setItem(ANCIENNE_TOURNEE_DETTES_KEY, JSON.stringify(ancienneTourneeDettes));
  localStorage.setItem(FOND_CAISSE_ANNUEL_KEY, JSON.stringify(fondCaisseAnnuel));
}

async function deleteMember(id) {
  if (!canDo("membres")) {
    alert("Pas l'accès pour supprimer.");
    return;
  }

  const member = members.find((m) => m.id === id);
  if (!member) return;

  if (isOwnerMember(member)) {
    alert("Le propriétaire du site ne peut pas être supprimé.");
    return;
  }

  if (
    !(await appConfirm(
      `Supprimer le membre « ${member.name} » ?\n\nIl sera retiré de la tournée, des cotisations, amendes, événements, prêts et de toutes les autres données.`
    ))
  ) {
    return;
  }

  const deletingSelf = getCurrentMember()?.id === id;

  purgeMemberReferences(id);
  members = members.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));

  if (deletingSelf) {
    logoutMember();
    return;
  }

  render();
}

memberForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = memberNameInput?.value || "";
  const kindEl = memberKindSelect || document.getElementById("memberKind");
  const kind = kindEl?.value || "member";
  addMember(name, kind);
});

roleForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const memberId = roleMemberSelect.value;
  const roleId = rolePostSelect.value;
  if (!memberId || !roleId) return;
  assignRole(memberId, roleId);
});

const menuToggle = document.getElementById("menuToggle");
const adminMenuToggle = document.getElementById("adminMenuToggle");
const appNavBackdrop = document.getElementById("appNavBackdrop");
const adminNavBackdrop = document.getElementById("adminNavBackdrop");
const adminNavHost = document.getElementById("adminNavHost");
const adminSubtabsMount = document.getElementById("adminSubtabsMount");
const adminCurrentSubLabel = document.getElementById("adminCurrentSubLabel");

function isPhoneNav() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function syncPhoneNavClass() {
  document.documentElement.classList.toggle("phone-nav", isPhoneNav());
}

function setMenuToggleIcon(open) {
  const icon = menuToggle?.querySelector(".menu-toggle-icon");
  if (icon) icon.textContent = open ? "✕" : "☰";
}

function setSubMenuToggleIcon(open) {
  const icon = adminMenuToggle?.querySelector(".menu-toggle-icon");
  if (icon) icon.textContent = open ? "✕" : "☰";
}

function isAdminTabActive() {
  return document.getElementById("tab-admin")?.classList.contains("active");
}

function placeAdminSubtabs() {
  if (!adminSubtabs || !adminNavHost || !adminSubtabsMount) return;
  const host = isPhoneNav() ? adminNavHost : adminSubtabsMount;
  if (adminSubtabs.parentElement !== host) host.appendChild(adminSubtabs);
}

function syncAdminMenuToggle() {
  // Navigation admin = hub (plus de 3 barres / sous-menu latéral)
  placeAdminSubtabs();
  if (adminMenuToggle) adminMenuToggle.hidden = true;
  document.documentElement.classList.remove("admin-tab-on");
  closeAdminMenu();
}

function setPanelInert(el, inert) {
  if (!el) return;
  if (inert) el.setAttribute("inert", "");
  else el.removeAttribute("inert");
}

function openAdminMenu() {
  if (!isPhoneNav()) return;
  if (adminMenuToggle?.hidden) return;
  placeAdminSubtabs();
  closeAppMenu();
  document.body.classList.add("admin-menu-open");
  adminMenuToggle?.setAttribute("aria-expanded", "true");
  adminMenuToggle?.setAttribute("aria-label", "Fermer le menu Admin");
  setSubMenuToggleIcon(true);
  setPanelInert(adminSubtabs, false);
}

function closeAdminMenu() {
  document.body.classList.remove("admin-menu-open");
  adminMenuToggle?.setAttribute("aria-expanded", "false");
  adminMenuToggle?.setAttribute("aria-label", "Ouvrir le menu Admin");
  setSubMenuToggleIcon(false);
  setPanelInert(adminSubtabs, isPhoneNav());
}

function openAppMenu() {
  if (!isPhoneNav()) return;
  closeAdminMenu();
  document.body.classList.add("app-menu-open");
  menuToggle?.setAttribute("aria-expanded", "true");
  menuToggle?.setAttribute("aria-label", "Fermer le menu");
  setMenuToggleIcon(true);
  setPanelInert(document.getElementById("appNav"), false);
}

function closeAppMenu() {
  document.body.classList.remove("app-menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  setMenuToggleIcon(false);
  setPanelInert(document.getElementById("appNav"), isPhoneNav());
}

function toggleAppMenu() {
  if (document.body.classList.contains("app-menu-open")) closeAppMenu();
  else openAppMenu();
}

function setupMenuSwipe() {
  const EDGE = 40;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let tracking = false;
  let mode = "";
  let committed = false;

  function drawerEl() {
    return document.getElementById("appNav");
  }

  function drawerWidth() {
    return drawerEl()?.offsetWidth || Math.min(window.innerWidth * 0.78, 296);
  }

  function loginBlocksSwipe() {
    return Boolean(loginModal?.classList.contains("open") || document.getElementById("changePasswordModal")?.classList.contains("open"));
  }

  function isHorizScrollable(el) {
    let node = el;
    while (node && node !== document.body) {
      if (node instanceof HTMLElement) {
        const style = getComputedStyle(node);
        if ((style.overflowX === "auto" || style.overflowX === "scroll") && node.scrollWidth > node.clientWidth + 12) {
          return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  function setProgress(progress) {
    const nav = drawerEl();
    if (!nav) return;
    const p = Math.max(0, Math.min(1, progress));
    nav.classList.add("menu-swiping");
    nav.style.visibility = p > 0.02 ? "visible" : "hidden";
    nav.style.pointerEvents = "none";
    nav.style.transform = `translateX(${((1 - p) * 110).toFixed(2)}%)`;
    if (appNavBackdrop) {
      appNavBackdrop.style.display = p > 0.02 ? "block" : "none";
      appNavBackdrop.style.opacity = String(p);
      appNavBackdrop.style.pointerEvents = "none";
    }
  }

  function clearSwipeStyles() {
    const nav = drawerEl();
    if (nav) {
      nav.classList.remove("menu-swiping");
      nav.style.visibility = "";
      nav.style.pointerEvents = "";
      nav.style.transform = "";
    }
    if (appNavBackdrop) {
      appNavBackdrop.style.display = "";
      appNavBackdrop.style.opacity = "";
      appNavBackdrop.style.pointerEvents = "";
    }
  }

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!isPhoneNav() || e.touches.length !== 1) return;
      if (loginBlocksSwipe()) return;
      if (document.body.classList.contains("admin-menu-open")) return;
      const target = e.target;
      if (target instanceof Element && target.closest("input, textarea, select")) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = touch.clientX;
      committed = false;
      const menuOpen = document.body.classList.contains("app-menu-open");
      if (menuOpen) {
        // Menu ouvert : ne pas bloquer le scroll vertical ; fermeture = swipe horizontal clair
        tracking = true;
        mode = "maybe-close";
        return;
      }
      if (isHorizScrollable(target)) {
        tracking = false;
        return;
      }
      if (startX >= window.innerWidth - EDGE) {
        tracking = true;
        mode = "open";
        return;
      }
      tracking = true;
      mode = "maybe-open";
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!tracking) return;
      const touch = e.touches[0];
      lastX = touch.clientX;
      const dx = lastX - startX;
      const dy = touch.clientY - startY;
      // Priorité au scroll vertical (menu + page)
      if (!committed && Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
        tracking = false;
        mode = "";
        clearSwipeStyles();
        return;
      }
      if (mode === "maybe-close") {
        if (Math.abs(dx) < 14) return;
        if (dx <= 0 || Math.abs(dx) < Math.abs(dy) + 6) {
          tracking = false;
          mode = "";
          return;
        }
        mode = "close";
      }
      if (mode === "maybe-open") {
        if (dx > -24) return;
        if (startX < window.innerWidth * 0.55) {
          tracking = false;
          return;
        }
        mode = "open";
      }
      if (mode !== "open" && mode !== "close") return;
      committed = true;
      if (e.cancelable) e.preventDefault();
      const width = drawerWidth();
      if (mode === "open") setProgress(Math.max(0, Math.min(1, -dx / width)));
      else if (mode === "close") setProgress(Math.max(0, Math.min(1, 1 - dx / width)));
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    () => {
      if (!tracking) return;
      const dx = lastX - startX;
      const width = drawerWidth();
      const wasOpening = mode === "open";
      const wasClosing = mode === "close";
      tracking = false;
      mode = "";
      if (!committed) return;
      if (wasOpening) {
        if (-dx > Math.min(56, width * 0.25)) {
          clearSwipeStyles();
          openAppMenu();
        } else {
          clearSwipeStyles();
          closeAppMenu();
        }
        return;
      }
      if (!wasClosing) return;
      if (dx > Math.min(48, width * 0.2)) {
        clearSwipeStyles();
        closeAppMenu();
      } else {
        clearSwipeStyles();
        openAppMenu();
      }
    },
    { passive: true }
  );
}

setupMenuSwipe();

menuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAppMenu();
});
adminMenuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (document.body.classList.contains("admin-menu-open")) closeAdminMenu();
  else openAdminMenu();
});
appNavBackdrop?.addEventListener("click", closeAppMenu);
adminNavBackdrop?.addEventListener("click", closeAdminMenu);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (document.body.classList.contains("admin-menu-open")) closeAdminMenu();
  else closeAppMenu();
});
syncPhoneNavClass();
syncAdminMenuToggle();
closeAppMenu();
closeAdminMenu();
window.addEventListener("resize", () => {
  syncPhoneNavClass();
  syncAdminMenuToggle();
  if (!isPhoneNav()) {
    closeAppMenu();
    closeAdminMenu();
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

financeSubtabs?.addEventListener("click", (e) => {
  const btn = e.target.closest(".finance-subtab");
  if (!btn?.dataset.financeSub) return;
  showFinanceSub(btn.dataset.financeSub);
});

function handleCommunicationSubClick(e) {
  const btn = e.target.closest("[data-comm-sub]");
  if (!btn?.dataset.commSub) return;
  showCommunicationSub(btn.dataset.commSub);
}

communicationSubtabs?.addEventListener("click", handleCommunicationSubClick);
adminCommunicationSubtabs?.addEventListener("click", handleCommunicationSubClick);

communicationForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  publishCommunication();
});

communicationCancelBtn?.addEventListener("click", () => {
  cancelEditCommunication();
  renderCommunication();
});

function handleCommunicationListClick(e) {
  const readBtn = e.target.closest(".btn-comm-read");
  if (readBtn) {
    markCommunicationRead(readBtn.dataset.id);
    return;
  }
  const editBtn = e.target.closest(".btn-comm-edit");
  if (editBtn) {
    startEditCommunication(editBtn.dataset.id);
    return;
  }
  const deleteBtn = e.target.closest(".btn-comm-delete");
  if (deleteBtn) deleteCommunication(deleteBtn.dataset.id);
}

communicationList?.addEventListener("click", handleCommunicationListClick);
communicationAdminList?.addEventListener("click", handleCommunicationListClick);

loiForm?.addEventListener("submit", submitLoiForm);
document.getElementById("guideForm")?.addEventListener("submit", submitGuideForm);
document.getElementById("guideCancelBtn")?.addEventListener("click", cancelEditGuide);
document.getElementById("guideSearchInput")?.addEventListener("input", handleGuideSearchInput);
document.getElementById("guideSearchInput")?.addEventListener("search", handleGuideSearchInput);
document.getElementById("guideSearchInputAdmin")?.addEventListener("input", handleGuideSearchInput);
document.getElementById("guideSearchInputAdmin")?.addEventListener("search", handleGuideSearchInput);
document.getElementById("guideList")?.addEventListener("click", (e) => {
  const openCard = e.target.closest("[data-guide-open-id]");
  if (openCard) {
    openGuideArticleFromSearch(openCard.getAttribute("data-guide-open-id"));
    return;
  }
});
document.getElementById("guideAdminList")?.addEventListener("click", (e) => {
  const openCard = e.target.closest("[data-guide-open-id]");
  if (openCard) {
    openGuideArticleFromSearch(openCard.getAttribute("data-guide-open-id"));
    return;
  }
  const editBtn = e.target.closest(".btn-guide-edit");
  if (editBtn) {
    startEditGuide(editBtn.getAttribute("data-guide-id"));
    return;
  }
  const delBtn = e.target.closest(".btn-guide-delete");
  if (delBtn) {
    deleteGuideArticle(delBtn.getAttribute("data-guide-id"));
  }
});
loiCancelBtn?.addEventListener("click", () => {
  cancelEditLoi();
  renderLoiAdmin();
});
loiAdminList?.addEventListener("click", handleLoiListClick);
loiList?.addEventListener("click", handleLoiMemberListClick);
loiList?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const openCard = e.target.closest?.("[data-loi-open-id]");
  if (!openCard || !loiList?.contains(openCard)) return;
  e.preventDefault();
  openLoiArticleFromSearch(openCard.dataset.loiOpenId);
});
loiSearchInput?.addEventListener("input", handleLoiSearchInput);
loiSearchInput?.addEventListener("search", handleLoiSearchInput);

adminSubtabs?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-admin-sub]");
  if (!btn?.dataset.adminSub) return;
  showAdminSub(btn.dataset.adminSub);
});

loginBtn.addEventListener("click", openLoginModal);
logoutBtn.addEventListener("click", logoutMember);

setupLoginForm();
bindFormEnterKey(changePasswordForm, [
  currentPasswordInput,
  newPasswordInput,
  confirmPasswordInput,
]);

changePasswordForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  changeMemberPassword(
    currentPasswordInput.value,
    newPasswordInput.value,
    confirmPasswordInput.value
  );
});

saveCotisationsBtn?.addEventListener("click", saveCotisationsData);

cotisationBody?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".tournee-order-remove");
  if (!removeBtn || !cotisationBody.contains(removeBtn)) return;
  e.preventDefault();
  if (!canEditTourneePlanning()) return;

  const kind = removeBtn.dataset.kind;
  const monthIndex = Number(removeBtn.dataset.month);
  const memberId = removeBtn.dataset.member;
  if (!kind || !memberId || Number.isNaN(monthIndex)) return;

  removeTourneeOrderMember(kind, monthIndex, memberId);
  renderTourneeTable();
});

cotisationBody?.addEventListener("change", (e) => {
  const select = e.target.closest(".tournee-order-add");
  if (!select || !cotisationBody.contains(select)) return;
  if (!canEditTourneePlanning()) return;

  const kind = select.dataset.kind;
  const monthIndex = Number(select.dataset.month);
  const memberId = select.value;
  if (!kind || !memberId || Number.isNaN(monthIndex)) return;

  addTourneeOrderMember(kind, monthIndex, memberId);
  renderTourneeTable();
});

function onTourneeYearChange(selectEl) {
  if (!selectEl) return;
  tourneeYear = selectEl.value;
  if (canEditTourneePlanning() && !tourneeDraft.years[tourneeYear]) {
    ensureTourneeYearDraft(tourneeYear);
  }
  renderTourneeTable();
}

tourneeYearSelect?.addEventListener("change", () => onTourneeYearChange(tourneeYearSelect));
tourneeYearPublic?.addEventListener("change", () => onTourneeYearChange(tourneeYearPublic));

// Admin / Financier : marquer OK réception ou ristourne
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-bouffe-ok");
  if (!btn) return;
  e.preventDefault();
  const memberId = btn.dataset.memberId;
  const kind = btn.dataset.kind === "ristourne" ? "ristourne" : "reception";
  if (memberId) toggleTourneeMarkOk(kind, memberId);
});



document.getElementById("capitalHorsGroupeForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const label = document.getElementById("capitalHorsGroupeLabel")?.value;
  const amount = document.getElementById("capitalHorsGroupeAmount")?.value;
  if (addCapitalHorsGroupe(label, amount)) {
    e.target.reset();
  }
});
document.getElementById("capitalHorsGroupeList")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-capital-hors-delete");
  if (btn?.dataset.id) deleteCapitalHorsGroupe(btn.dataset.id);
});

saveTabPermissionsBtn?.addEventListener("click", () => saveTabPermissionsFromUI({ silent: false }));
tabPermissionsBody?.addEventListener("change", handleTabPermissionCheckboxChange);

amendeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    memberId: amendeMemberSelect?.value,
    type: amendeTypeSelect?.value,
    amount: amendeAmountInput?.value,
    note: amendeNoteInput?.value,
  };

  if (editingAmendeId) {
    if (payload.type === "ex-tournee" || payload.type === "ancienne-tournee") {
      alert("Pour modifier une dette d'ex tournée, supprime-la puis rajoute-la.");
      return;
    }
    if (!String(payload.note || "").trim()) {
      alert("Le motif est obligatoire.");
      return;
    }
    updateAmende(editingAmendeId, payload.memberId, payload.type, payload.amount, payload.note);
    return;
  }

  const ok = await submitUnifiedDettesAmendesLine(payload);
  if (ok) amendeForm?.reset();
});

amendeCancelBtn?.addEventListener("click", cancelEditAmende);

function handleAmendeCardClick(e) {
  const editBtn = e.target.closest(".btn-amende-edit");
  if (editBtn) {
    startEditAmende(editBtn.dataset.id);
    return;
  }
  const deleteBtn = e.target.closest(".btn-amende-delete");
  if (deleteBtn) {
    deleteAmendeRecord(deleteBtn.dataset.id);
    return;
  }
  const undoBtn = e.target.closest(".btn-amende-undo");
  if (undoBtn) {
    undoAmendePayment(undoBtn.dataset.id);
    return;
  }
  const repayBtn = e.target.closest(".btn-amende-repay, .btn-amende-pay, .btn-dette-pay");
  if (repayBtn) {
    const wrap = repayBtn.closest(".amende-action-controls, .dette-card, .amende-history-row");
    const input = wrap?.querySelector(`.amende-repay-input[data-id="${repayBtn.dataset.id}"]`)
      || wrap?.querySelector(".amende-repay-input");
    repayAmende(repayBtn.dataset.id, input?.value);
  }
}

amendeBody?.addEventListener("click", handleAmendeCardClick);
amendeDetteBody?.addEventListener("click", handleAmendeCardClick);
document.getElementById("amendeHistoryPanel")?.addEventListener("click", handleAmendeCardClick);

pretNotificationsList?.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".pret-notif-delete");
  if (deleteBtn) {
    deleteOwnNotification(deleteBtn.dataset.id);
    return;
  }
  const item = e.target.closest(".pret-notif-item");
  if (!item) return;
  const loanId = item.dataset.loanId;
  if (loanId) openFromNotification({ tab: "prets", loanId });
});

document.getElementById("pretNotificationsClearBtn")?.addEventListener("click", deleteAllOwnNotifications);

pretForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  initiatePret(pretAmountInput.value, pretNoteInput.value);
});

fondCaisseForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  setFondCaisseAmount(fondCaisseAmountInput?.value);
});

resetFondCaisseBtn?.addEventListener("click", () => {
  resetFondCaisse();
});

document.getElementById("financierAccountForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  saveFinancierAccountFromForm();
});

fondCaisseFormAdmin?.addEventListener("submit", (e) => {
  e.preventDefault();
  setFondCaisseAmount(fondCaisseAmountAdmin?.value);
});

resetFondCaisseBtnAdmin?.addEventListener("click", () => {
  resetFondCaisse();
});

fondCaisseAnnuelForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  setFondCaisseAnnuelAmount(fondCaisseAnnuelYearSelect?.value, fondCaisseAnnuelAmountInput?.value);
});

fondCaisseAnnuelDeleteBtn?.addEventListener("click", () => {
  deleteFondCaisseAnnuel(fondCaisseAnnuelYearSelect?.value);
});

fondCaisseAnnuelYearSelect?.addEventListener("change", () => {
  renderFondCaisseAnnuel();
});

fondCaisseAnnuelList?.addEventListener("click", (e) => {
  const undoBtn = e.target.closest(".fond-caisse-annuel-undo");
  if (undoBtn) {
    cancelFondCaisseAnnuelPayment(
      undoBtn.dataset.year,
      undoBtn.dataset.memberId,
      undoBtn.dataset.paymentId
    );
    return;
  }
  const btn = e.target.closest(".btn-fond-caisse-annuel-pay");
  if (!btn) return;
  const input =
    btn.closest("tr, .amende-admin-actions")?.querySelector(".fond-caisse-annuel-pay-input") ||
    document.querySelector(
      `.fond-caisse-annuel-pay-input[data-member-id="${btn.dataset.memberId}"][data-year="${btn.dataset.year}"]`
    );
  payFondCaisseAnnuel(btn.dataset.year, btn.dataset.memberId, input?.value);
});

fondCaisseAnnuelList?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const input = e.target.closest(".fond-caisse-annuel-pay-input");
  if (!input) return;
  e.preventDefault();
  payFondCaisseAnnuel(input.dataset.year, input.dataset.memberId, input.value);
});

async function handlePretActionClick(e) {
  const yesBtn = e.target.closest(".btn-pret-yes");
  const noBtn = e.target.closest(".btn-pret-no");
  const approveBtn = e.target.closest(".btn-pret-approve");
  const rejectBtn = e.target.closest(".btn-pret-reject");
  const repayBtn = e.target.closest(".btn-pret-repay");
  const undoRepayBtn = e.target.closest(".btn-pret-repay-undo");
  const deletePretBtn = e.target.closest(".btn-pret-delete");

  if (yesBtn || noBtn) {
    const btn = yesBtn || noBtn;
    if (btn.dataset.voting === "1") return; // anti double-clic
    const actions = btn.closest(".pret-vote-actions");
    if (actions) {
      actions.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
        b.dataset.voting = "1";
      });
    } else {
      btn.disabled = true;
      btn.dataset.voting = "1";
    }
    await votePret(btn.dataset.loanId, yesBtn ? "yes" : "no");
    return;
  }

  if (approveBtn) {
    const borrower = getMemberById(getLoanById(approveBtn.dataset.loanId)?.borrowerId);
    if (await appConfirm(`Accorder immédiatement le prêt de ${borrower?.name || "ce membre"} ?`)) {
      financierDecidePret(approveBtn.dataset.loanId, "approved");
    }
  }

  if (rejectBtn) {
    if (await appConfirm("Refuser cette demande de prêt ?")) {
      financierDecidePret(rejectBtn.dataset.loanId, "rejected");
    }
  }

  if (repayBtn) {
    const root = e.currentTarget;
    const input =
      root.querySelector?.(`.pret-repay-input[data-loan-id="${repayBtn.dataset.loanId}"]`) ||
      document.querySelector(`.pret-repay-input[data-loan-id="${repayBtn.dataset.loanId}"]`);
    if (input) recordRepayment(repayBtn.dataset.loanId, input.value);
  }

  if (undoRepayBtn) {
    undoLoanRepayment(undoRepayBtn.dataset.loanId, undoRepayBtn.dataset.repayId);
  }

  if (deletePretBtn) deletePret(deletePretBtn.dataset.loanId);
}

function handlePretRequestDateChange(e) {
  const input = e.target.closest(".pret-request-date-input");
  if (!input || !input.value) return;
  loanDateSaving = true;
  Promise.resolve(updateLoanRequestDate(input.dataset.loanId, input.value)).finally(() => {
    loanDateSaving = false;
  });
}

function handlePretRequestDateClick(e) {
  const btn = e.target.closest(".pret-date-cell-btn");
  if (!btn) return;
  e.preventDefault();
  startLoanDateEdit(btn.dataset.loanId);
}

function handlePretRequestDateFocusOut(e) {
  const input = e.target.closest(".pret-request-date-input");
  if (!input) return;
  const loanId = input.dataset.loanId;
  const wait = Math.max(80, loanDateIgnoreBlurUntil - Date.now());
  setTimeout(() => {
    if (loanDateSaving) return;
    if (loanDateEditingId !== loanId) return;
    if (document.activeElement?.classList?.contains("pret-request-date-input")) return;
    stopLoanDateEdit();
    renderAdminPretLedger(true);
  }, wait);
}

document.getElementById("tab-prets")?.addEventListener("click", handlePretActionClick);
document.getElementById("tab-admin")?.addEventListener("click", handlePretActionClick);
document.getElementById("tab-prets")?.addEventListener("change", handlePretRequestDateChange);
document.getElementById("tab-admin")?.addEventListener("change", handlePretRequestDateChange);
document.getElementById("tab-admin")?.addEventListener("click", handlePretRequestDateClick);
document.getElementById("tab-admin")?.addEventListener("focusout", handlePretRequestDateFocusOut);

lastFitViewportWidth = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth === lastFitViewportWidth) return;
  lastFitViewportWidth = window.innerWidth;
  fitTablesToScreen();
});
window.addEventListener("orientationchange", () => {
  lastFitViewportWidth = 0;
  setTimeout(() => {
    lastFitViewportWidth = window.innerWidth;
    fitTablesToScreen();
  }, 250);
});

adminForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  assignAdmin(adminMemberSelect?.value);
});

ancienneTourneeForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  addAncienneTourneeDette(
    ancienneTourneeMemberSelect?.value,
    ancienneTourneeAmountInput?.value
  );
});

function prepareAddAncienneTourneeDette(memberId) {
  if (!ancienneTourneeMemberSelect || !memberId) return;
  ancienneTourneeMemberSelect.value = memberId;
  ancienneTourneeAmountInput?.focus();
  ancienneTourneeForm?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function handleAncienneTourneeActionClick(e) {
  const addBtn = e.target.closest(".btn-ancienne-tournee-add");
  if (addBtn) {
    prepareAddAncienneTourneeDette(addBtn.dataset.memberId);
    return;
  }
  const repayBtn = e.target.closest(".btn-ancienne-tournee-repay");
  if (repayBtn) {
    const row = repayBtn.closest(".ancienne-tournee-row, tr, .ancienne-tournee-repay-controls");
    const input = row?.querySelector(".ancienne-tournee-repay-input");
    repayAncienneTourneeDette(repayBtn.dataset.id, input?.value);
    return;
  }
  const deleteBtn = e.target.closest(".btn-ancienne-tournee-delete");
  if (deleteBtn) {
    e.preventDefault();
    e.stopPropagation();
    const id = deleteBtn.dataset.id || deleteBtn.getAttribute("data-id");
    if (id) deleteAncienneTourneeDette(id);
    return;
  }
}

function handleAncienneTourneeKeydown(e) {
  if (e.key !== "Enter") return;
  const input = e.target.closest(".ancienne-tournee-repay-input");
  if (!input) return;
  e.preventDefault();
  repayAncienneTourneeDette(input.dataset.id, input.value);
}

document.getElementById("adminSub-amendes")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("adminExTourneePanel")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("tab-amendes")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("tab-admin")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("adminSub-amendes")?.addEventListener("keydown", handleAncienneTourneeKeydown);
document.getElementById("tab-amendes")?.addEventListener("keydown", handleAncienneTourneeKeydown);
document.getElementById("tab-admin")?.addEventListener("keydown", handleAncienneTourneeKeydown);

const BACKUP_KEY_LABELS = {
  members: "Membres",
  roles: "Bureau",
  cotisations: "Cotisations",
  tournee: "Tournée",
  amendes: "Amendes",
  "amendes-caisse": "Caisse amendes",
  "tab-permissions": "Accès",
  prets: "Prêts",
  notifications: "Notifications",
  evenements: "Événements",
  communication: "Communication",
  loi: "La loi",
  "admin-ids": "Administrateurs",
  "autre-argent": "Autre argent",
  "ancienne-tournee-dettes": "Dettes ancienne tournée",
  finance: "Finance",
  "fond-caisse": "Fond de caisse",
  "fond-caisse-annuel": "Fond annuel",
  "financier-account": "Compte financier",
  "data-revision": "Révision",
};

function showBackupMessage(text, isError = false) {
  const el = document.getElementById("backupSaveMsg");
  if (!el) return;
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("save-msg-success", Boolean(text) && !isError);
  el.classList.toggle("save-msg-error", Boolean(isError));
}

async function fetchBackupJson(url, options = {}) {
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

async function loadBackupPanel() {
  const card = document.getElementById("backupStatusCard");
  const list = document.getElementById("backupKeysList");
  showBackupMessage("");
  if (card) card.innerHTML = `<p class="backup-status-loading">Lecture de la base…</p>`;
  if (list) list.innerHTML = "";

  try {
    const status = await fetchBackupJson("/api/admin/db-status");
    const hostNote = status.independentOfHost
      ? "Les données sont dans Turso (cloud), indépendantes de Render. Pour publier sur un domaine, reconnectez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sur le nouveau serveur."
      : "Les données sont dans le fichier SQLite local. Téléchargez une sauvegarde complète avant de changer d'hébergeur, puis restaurez-la sur le nouveau serveur.";

    if (card) {
      card.innerHTML = `
        <p class="backup-status-kicker">${status.independentOfHost ? "Base cloud prête" : "Base locale"}</p>
        <h3>${status.label || "Base de données"}</h3>
        <p class="backup-status-copy">${hostNote}</p>
        <ul class="backup-status-stats">
          <li><strong>${status.memberCount}</strong> membres</li>
          <li><strong>${status.userCount}</strong> comptes</li>
          <li><strong>${status.keyCount}/${status.keyTotal}</strong> jeux de données</li>
          <li><strong>${status.pushCount}</strong> notifications push</li>
        </ul>
      `;
    }

    if (list) {
      list.innerHTML = (status.keys || [])
        .map((item) => {
          const label = BACKUP_KEY_LABELS[item.key] || item.key;
          const state = item.present ? `${item.items} enreg.` : "manquant";
          return `<div class="backup-key-row ${item.present ? "is-present" : "is-missing"}">
            <span>${label}</span>
            <strong>${state}</strong>
          </div>`;
        })
        .join("");
    }
  } catch (err) {
    if (card) {
      card.innerHTML = `<p class="backup-status-copy">Impossible de lire la base : ${err.message}</p>`;
    }
  }
}

async function downloadFullBackup() {
  showBackupMessage("");
  try {
    const dump = await fetchBackupJson("/api/admin/export");
    const stamp = String(dump.exportedAt || "").slice(0, 10) || "export";
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `poto-timide-sauvegarde-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showBackupMessage("Sauvegarde téléchargée. Gardez ce fichier hors ligne avant de changer d'hébergeur.");
  } catch (err) {
    showBackupMessage(err.message || "Téléchargement impossible.", true);
  }
}

async function restoreFullBackupFromFile(file) {
  if (!file) return;
  showBackupMessage("");

  let dump;
  try {
    dump = JSON.parse(await file.text());
  } catch {
    showBackupMessage("Fichier illisible. Choisissez une sauvegarde Poto Timide (.json).", true);
    return;
  }

  if (dump?.kind !== "poto-timide-full-dump") {
    showBackupMessage("Ce fichier n'est pas une sauvegarde Poto Timide.", true);
    return;
  }

  const confirmed = await appConfirm(
    "Cette restauration remplace les données actuelles par le fichier choisi (membres, tournée, amendes, prêts, communication, comptes). Continuer ?",
    "Restaurer la sauvegarde"
  );
  if (!confirmed) return;

  try {
    const result = await fetchBackupJson("/api/admin/import", {
      method: "POST",
      body: JSON.stringify({ confirm: "RESTAURER", dump }),
    });
    await appAlert(
      `Restauration enregistrée : ${result.keys} jeux de données, ${result.users} comptes. La page se recharge depuis la base.`,
      "Sauvegarde restaurée"
    );
    window.location.reload();
  } catch (err) {
    showBackupMessage(err.message || "Restauration impossible.", true);
  }
}

document.getElementById("backupDownloadBtn")?.addEventListener("click", () => {
  downloadFullBackup();
});

document.getElementById("backupImportInput")?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  restoreFullBackupFromFile(file);
});

autreArgentForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  addAutreArgent(
    autreArgentMemberSelect?.value,
    autreArgentAmountInput?.value,
    autreArgentNoteInput?.value,
    autreArgentMotifSelect?.value
  );
});

autreArgentWithdrawBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  withdrawAutreArgent(
    autreArgentMemberSelect?.value || "groupe",
    autreArgentAmountInput?.value,
    autreArgentNoteInput?.value,
    autreArgentMotifSelect?.value
  );
});

function handleAutreArgentDeleteClick(e) {
  const deleteBtn = e.target.closest(".btn-autre-argent-delete");
  if (deleteBtn) deleteAutreArgent(deleteBtn.dataset.id);
}

document.getElementById("tab-finance")?.addEventListener("click", handleAutreArgentDeleteClick);
document.getElementById("tab-admin")?.addEventListener("click", handleAutreArgentDeleteClick);
autreArgentList?.addEventListener("click", handleAutreArgentDeleteClick);

evenementForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  createEvenement(
    evenementTitleInput.value,
    evenementAmountInput.value,
    evenementDescInput.value,
    evenementMemberSelect?.value
  );
});

document.getElementById("evenementFormPublic")?.addEventListener("submit", (e) => {
  e.preventDefault();
  createEvenement(
    document.getElementById("evenementTitlePublic")?.value,
    document.getElementById("evenementAmountPublic")?.value,
    document.getElementById("evenementDescPublic")?.value,
    document.getElementById("evenementMemberPublic")?.value
  );
});

resetClosedEvenementsBtn?.addEventListener("click", resetClosedEvenements);

function handleEvenementActionClick(e) {
  const payBtn = e.target.closest(".btn-evenement-pay");
  const editPayBtn = e.target.closest(".btn-evenement-edit-pay");
  const unpayBtn = e.target.closest(".btn-evenement-unpay");
  const deleteBtn = e.target.closest(".btn-evenement-delete");
  const reimburseBtn = e.target.closest(".btn-evenement-reimburse");
  const closeBtn = e.target.closest(".btn-evenement-close");

  const getPayInputValue = (eventId, memberId) =>
    e.currentTarget.querySelector(
      `.evenement-pay-input[data-event-id="${eventId}"][data-member-id="${memberId}"]`
    )?.value;

  if (payBtn) {
    validateEvenementPayment(
      payBtn.dataset.eventId,
      payBtn.dataset.memberId,
      getPayInputValue(payBtn.dataset.eventId, payBtn.dataset.memberId)
    );
  }
  const payAllBtn = e.target.closest(".btn-evenement-pay-all");
  if (payAllBtn) {
    markAllEvenementPaid(payAllBtn.dataset.eventId);
    return;
  }
  const paySelectedBtn = e.target.closest(".btn-evenement-pay-selected");
  if (paySelectedBtn) {
    const eventId = paySelectedBtn.dataset.eventId;
    const root = paySelectedBtn.closest(".evenement-card") || e.currentTarget;
    const select = root.querySelector(`.evenement-pay-select[data-event-id="${eventId}"][data-role="pay"]`);
    const input = root.querySelector(`.evenement-pay-input-single[data-event-id="${eventId}"]`);
    const memberId = select?.value;
    if (!memberId) {
      alert("Choisis un poto.");
      return;
    }
    validateEvenementPayment(eventId, memberId, input?.value);
  }
  const unpaySelectedBtn = e.target.closest(".btn-evenement-unpay-selected");
  if (unpaySelectedBtn) {
    const eventId = unpaySelectedBtn.dataset.eventId;
    const root = unpaySelectedBtn.closest(".evenement-card") || e.currentTarget;
    const select = root.querySelector(`.evenement-pay-select[data-event-id="${eventId}"][data-role="unpay"]`);
    const memberId = select?.value;
    if (!memberId) {
      alert("Choisis un poto déjà payé.");
      return;
    }
    cancelEvenementPayment(eventId, memberId);
  }
  if (editPayBtn) {
    updateEvenementPayment(
      editPayBtn.dataset.eventId,
      editPayBtn.dataset.memberId,
      getPayInputValue(editPayBtn.dataset.eventId, editPayBtn.dataset.memberId)
    );
  }
  if (unpayBtn) cancelEvenementPayment(unpayBtn.dataset.eventId, unpayBtn.dataset.memberId);
  if (deleteBtn) deleteEvenement(deleteBtn.dataset.eventId);
  if (reimburseBtn) reimburseEvenementToBeneficiary(reimburseBtn.dataset.eventId);
  if (closeBtn) closeEvenement(closeBtn.dataset.eventId);
}

document.getElementById("tab-evenements")?.addEventListener("click", handleEvenementActionClick);
document.getElementById("tab-admin")?.addEventListener("click", handleEvenementActionClick);

document.querySelectorAll(".tournee-sort-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const sortKey = button.dataset.sort;
    if (!sortKey) return;

    if (tourneeSortKey === sortKey) {
      tourneeSortDir = tourneeSortDir === "asc" ? "desc" : "asc";
    } else {
      tourneeSortKey = sortKey;
      tourneeSortDir = "asc";
    }

    renderTourneeTable();
  });
});

async function restoreLoggedInApp() {
  try {
    await loadDataFromServer();
  } catch (err) {
    console.warn("Chargement serveur partiel, utilisation du cache local.", err);
  }

  reloadFromStorage();
  await ensureFinanceData();
  ensureDefaultAdmin();
  if (authState.member) {
    authState.member.isAdmin = isMemberAdmin(authState.member.id);
  }
  if (typeof potoStartPeriodicSync === "function") potoStartPeriodicSync();
  startOnlinePolling();

  loginModal.classList.remove("open");

  if (authState.mustChangePassword) {
    openChangePasswordModal();
  } else {
    appEl.classList.remove("app-blurred");
  }
  updateSessionUI();
  maybeShowInstallBanner();
}

async function initApp() {
  reloadFromStorage();
  await ensureFinanceData();

  const hinted = applySessionHint();
  if (hinted) {
    revealApp(true);
    loginModal?.classList.remove("open");
    appEl?.classList.remove("app-blurred");
    updateSessionUI();
    render();
    showTab(getSavedTab());
  }

  try {
    await checkServerSession();
  } catch (err) {
    console.error(err);
    reloadFromStorage();
    if (!hinted) {
      revealApp(false);
      openLoginModal();
      loginError.textContent =
        "Serveur indisponible — vos données locales sont conservées. Reconnectez-vous.";
      loginError.hidden = false;
    }
    appReady = true;
    updateSessionUI();
    render();
    showTab(getSavedTab());
    return;
  }

  if (authState.loggedIn) {
    await restoreLoggedInApp();
    revealApp(true);
  } else {
    revealApp(false);
    openLoginModal();
  }

  window.potoOnServerDataPulled = () => {
    if (typeof window.potoIsUserEditingForm === "function" && window.potoIsUserEditingForm()) return;
    if (typeof window.potoIsLoanDateEditing === "function" && window.potoIsLoanDateEditing()) return;

    // Mémoriser scroll page + tableaux
    const pageScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollSnapshot = [];
    document.querySelectorAll(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap").forEach((wrap, index) => {
      if (wrap.scrollLeft > 0) {
        scrollSnapshot.push({
          index,
          left: wrap.scrollLeft,
          parentId: wrap.closest("[id]")?.id || "",
        });
      }
    });

    reloadFromStorage();
    updatePretTabBadge();

    const isActive = (id) => document.getElementById(id)?.classList.contains("active");
    const tabReunion = isActive("tab-reunion");
    const tabMembres = isActive("tab-membres");
    const tabTournee = isActive("tab-tournee");
    const tabPrets = isActive("tab-prets");
    const tabEvenements = isActive("tab-evenements");
    const tabAmendes = isActive("tab-amendes");
    const tabFinance = isActive("tab-finance");
    const tabLoi = isActive("tab-loi");
    const tabComm = isActive("tab-communication");
    const tabAdmin = isActive("tab-admin");

    // --- Toujours resynchroniser les vues dépendantes (légères) ---
    try {
      if (typeof renderCommunication === "function") renderCommunication();
      if (typeof renderEvenements === "function") renderEvenements();
      if (typeof renderAmendes === "function") renderAmendes();
      if (typeof renderMesDettes === "function") renderMesDettes();
      if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
      if (typeof renderFondCaisseAnnuel === "function") renderFondCaisseAnnuel();
      if (typeof renderAncienneTourneeMemberView === "function") renderAncienneTourneeMemberView();
      if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
    } catch (err) {
      console.warn("refresh données:", err);
    }

    // --- Onglet visible : refresh complet ---
    try {
      if (tabReunion && typeof renderReunion === "function") renderReunion();
      else if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();

      if (tabMembres) {
        if (typeof renderBureau === "function") renderBureau();
        if (typeof renderMemberList === "function") renderMemberList();
        if (typeof renderOnlineList === "function") renderOnlineList();
        if (typeof renderAdminList === "function") renderAdminList();
      }

      if (tabTournee && typeof renderTourneeTable === "function") renderTourneeTable();

      if (tabPrets && typeof renderPrets === "function") renderPrets();

      if (tabEvenements && typeof renderEvenements === "function") renderEvenements();

      if (tabAmendes) {
        if (typeof renderAmendes === "function") renderAmendes();
        if (typeof renderMesAmendes === "function") renderMesAmendes();
        if (typeof renderMesDettes === "function") renderMesDettes();
      }

      if (tabFinance && typeof renderFinance === "function") renderFinance();
      else if (tabFinance && typeof renderFinanceDashboard === "function") renderFinanceDashboard();

      if (tabLoi && typeof renderLoi === "function") renderLoi();

      if (tabComm && typeof renderCommunication === "function") renderCommunication();
      if (tabComm && activeCommunicationSub === "guide" && typeof renderGuidePanels === "function") {
        renderGuidePanels();
      }

      if (tabAdmin) {
        if (typeof renderTourneeTable === "function" && activeAdminSub === "tournee") renderTourneeTable();
        if (activeAdminSub === "amendes" || activeAdminSub === "ancienne-tournee") {
          if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
          if (typeof renderAmendesAdminHistory === "function") renderAmendesAdminHistory();
        }
        if (activeAdminSub === "communication" && typeof renderCommunication === "function") renderCommunication();
        if (activeAdminSub === "prets" && typeof renderAdminPrets === "function") renderAdminPrets();
        if (activeAdminSub === "loi" && typeof renderLoiAdmin === "function") renderLoiAdmin();
        if (activeAdminSub === "acces" && typeof renderTabPermissionsPanel === "function") renderTabPermissionsPanel();
        if (activeAdminSub === "caisse") {
          if (typeof renderFondCaissePanel === "function") renderFondCaissePanel();
          if (typeof renderAutreArgent === "function") renderAutreArgent();
        }
        if (activeAdminSub === "evenements" && typeof renderEvenements === "function") renderEvenements();
        if (activeAdminSub === "membres") {
          if (typeof renderBureau === "function") renderBureau();
          if (typeof renderMemberList === "function") renderMemberList();
          if (typeof renderAdminList === "function") renderAdminList();
        }
        if (activeAdminSub === "admins" && typeof renderAdminList === "function") renderAdminList();
        if (activeAdminSub === "sauvegarde" && typeof renderAuditLog === "function") renderAuditLog();
        if (activeAdminSub === "connexions" && typeof renderLoginLog === "function") renderLoginLog({ pull: false });
      }
    } catch (err) {
      console.warn("refresh UI après pull:", err);
    }

    if (typeof scheduleFitTables === "function") scheduleFitTables();

    const restoreAll = () => {
      window.scrollTo(0, pageScrollY);
      const wraps = document.querySelectorAll(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap");
      scrollSnapshot.forEach(({ index, left, parentId }) => {
        let wrap = null;
        if (parentId) {
          const parent = document.getElementById(parentId);
          wrap = parent?.querySelector?.(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap") || null;
        }
        if (!wrap) wrap = wraps[index] || null;
        if (wrap) wrap.scrollLeft = left;
      });
    };
    restoreAll();
    requestAnimationFrame(() => {
      restoreAll();
      requestAnimationFrame(restoreAll);
    });
  };


  appReady = true;
  updateSessionUI();
  render();
  updatePretTabBadge();
  showTab(getSavedTab());
  setupPwaInstall();
  if (authState.loggedIn) setupPushNotifications();
  applyNotificationDeepLink();
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type === "OPEN_NOTIFICATION") openFromNotification(event.data);
  });

  if (isNavPreview()) {
    revealApp(true);
    loginModal?.classList.remove("open");
    appEl?.classList.remove("app-blurred");
    if (new URLSearchParams(location.search).get("preview") === "menu") openAppMenu();
  }
}

const INSTALL_DISMISS_KEY = "poto-install-dismissed";
const PUSH_DISMISS_KEY = "poto-push-dismissed";
let deferredPwaPrompt = null;
let pushSetupStarted = false;
let pushListenersBound = false;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function canUseWebPush() {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    (!isIosDevice() || isPwaStandalone())
  );
}

function rememberNotificationDeepLink() {
  const params = new URLSearchParams(location.search);
  const tab = params.get("tab");
  const loan = params.get("loan");
  const admin = params.get("admin");
  const item = params.get("item");
  if (tab) sessionStorage.setItem("poto-open-tab", tab);
  if (loan) sessionStorage.setItem("poto-open-loan", loan);
  if (admin) sessionStorage.setItem("poto-open-admin", admin);
  if (item) sessionStorage.setItem("poto-open-item", item);
}

function openFromNotification({ tab = "prets", admin = "", loanId = "", item = "" } = {}) {
  // Permettre un nouveau highlight à chaque clic notif
  loanHighlightConsumed = false;
  if (admin) sessionStorage.setItem("poto-open-admin", admin);
  if (item) sessionStorage.setItem("poto-open-item", item);
  if (tab) {
    sessionStorage.setItem("poto-open-tab", tab);
    showTab(tab);
  }
  if (admin && (tab === "admin" || getActiveMainTab() === "admin")) {
    showAdminSub(admin);
  }
  if (loanId) {
    sessionStorage.setItem("poto-open-loan", loanId);
  }
  // Plusieurs tentatives : le DOM peut ne pas être prêt juste après showTab
  const tryHighlight = () => {
    if (loanId) highlightLoanFromNotification();
    highlightNotificationItem();
  };
  tryHighlight();
  requestAnimationFrame(tryHighlight);
  setTimeout(tryHighlight, 250);
  setTimeout(tryHighlight, 800);
  setTimeout(tryHighlight, 1600);
}

function applyNotificationDeepLink() {
  const params = new URLSearchParams(location.search);
  const tab = sessionStorage.getItem("poto-open-tab") || params.get("tab");
  const admin = sessionStorage.getItem("poto-open-admin") || params.get("admin");
  const item = sessionStorage.getItem("poto-open-item") || params.get("item");
  const loanId = sessionStorage.getItem("poto-open-loan") || params.get("loan");
  if (!tab && !loanId && !item && !admin) return;
  openFromNotification({
    tab: tab || "prets",
    admin: admin || "",
    loanId: loanId || "",
    item: item || "",
  });
  sessionStorage.removeItem("poto-open-tab");
  sessionStorage.removeItem("poto-open-admin");
}

function highlightNotificationItem() {
  const item = sessionStorage.getItem("poto-open-item") || new URLSearchParams(location.search).get("item");
  if (!item) return;
  const target =
    document.getElementById(`admin-amende-${item}`) ||
    document.getElementById(`admin-ancienne-${item}`) ||
    document.getElementById(`admin-evenement-${item}`) ||
    document.getElementById(`dette-evenement-${item}`) ||
    document.getElementById(`amende-${item}`) ||
    document.getElementById(`ancienne-${item}`) ||
    document.getElementById(`evenement-${item}`) ||
    document.getElementById(`loan-${item}`) ||
    document.getElementById(`ex-tournee-${item}`) ||
    document.getElementById(`loi-${item}`);
  if (!target) return;
  sessionStorage.removeItem("poto-open-item");
  target.classList.add("is-notif-target");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => target.classList.remove("is-notif-target"), 4000);
}

let loanHighlightConsumed = false;
function highlightLoanFromNotification() {
  // Une seule fois quand l'élément est trouvé (sinon on réessaie)
  if (loanHighlightConsumed) return;
  const loanId = sessionStorage.getItem("poto-open-loan") || new URLSearchParams(location.search).get("loan");
  if (!loanId) return;
  const card =
    document.getElementById(`loan-${loanId}`) ||
    document.querySelector(`[data-loan-id="${loanId}"]`);
  // Ne consommer que si on a vraiment la carte du prêt
  if (!card) return;
  loanHighlightConsumed = true;
  sessionStorage.removeItem("poto-open-loan");
  try {
    const url = new URL(location.href);
    let changed = false;
    ["loan", "tab", "admin", "item"].forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });
    if (changed) history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch {
    /* ignore */
  }
  card.classList.add("is-notif-target");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => card.classList.remove("is-notif-target"), 4000);
}

function hidePushBanner(persist) {
  const banner = document.getElementById("pushBanner");
  if (banner) banner.hidden = true;
  if (persist) localStorage.setItem(PUSH_DISMISS_KEY, "1");
}

function showPushBanner() {
  const banner = document.getElementById("pushBanner");
  if (!banner || localStorage.getItem(PUSH_DISMISS_KEY) === "1") return;
  if (loginModal?.classList.contains("open")) return;
  if (Notification.permission !== "default") return;
  banner.hidden = false;
}

async function subscribeToPush() {
  if (!canUseWebPush()) return false;
  const registration = await navigator.serviceWorker.ready;
  const { publicKey } = await apiFetch("/api/push/public-key");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  await apiFetch("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  });
  hidePushBanner(true);
  return true;
}

async function setupPushNotifications() {
  if (!authState.loggedIn) return;
  if (!canUseWebPush()) return;

  const enableBtn = document.getElementById("pushEnableBtn");
  const dismissBtn = document.getElementById("pushDismissBtn");
  if (!pushListenersBound) {
    pushListenersBound = true;
    enableBtn?.addEventListener("click", async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
        await subscribeToPush();
      } catch (err) {
        console.warn("Activation notifications impossible.", err);
      }
    });
    dismissBtn?.addEventListener("click", () => hidePushBanner(true));
  }

  if (Notification.permission === "granted") {
    try {
      await subscribeToPush();
    } catch (err) {
      console.warn("Abonnement push impossible.", err);
    }
    return;
  }

  if (!pushSetupStarted) showPushBanner();
  pushSetupStarted = true;
}

rememberNotificationDeepLink();

function isPwaStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function maybeShowInstallBanner() {
  const banner = document.getElementById("installBanner");
  if (!banner || isPwaStandalone()) return;
  if (localStorage.getItem(INSTALL_DISMISS_KEY) === "1") return;
  if (loginModal?.classList.contains("open")) return;
  if (!deferredPwaPrompt && !isIosDevice()) return;
  banner.hidden = false;
}

function hideInstallBanner(persist) {
  const banner = document.getElementById("installBanner");
  if (banner) banner.hidden = true;
  if (persist) localStorage.setItem(INSTALL_DISMISS_KEY, "1");
}

function setupPwaInstall() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  const desc = document.getElementById("installBannerDesc");
  const installBtn = document.getElementById("installAppBtn");
  const dismissBtn = document.getElementById("installDismissBtn");
  const loginHint = document.getElementById("installLoginHint");

  if (isPwaStandalone()) return;

  if (isIosDevice() && loginHint) {
    loginHint.hidden = false;
    loginHint.textContent = "Astuce iPhone : bouton Partager, puis « Sur l’écran d’accueil ».";
  }

  if (isIosDevice()) {
    if (desc) desc.textContent = "iPhone : Partager → Sur l’écran d’accueil.";
    if (installBtn) installBtn.textContent = "OK";
    if (dismissBtn) dismissBtn.hidden = true;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPwaPrompt = event;
    maybeShowInstallBanner();
  });

  window.addEventListener("appinstalled", () => {
    hideInstallBanner(true);
  });

  installBtn?.addEventListener("click", async () => {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      const choice = await deferredPwaPrompt.userChoice.catch(() => null);
      deferredPwaPrompt = null;
      if (choice?.outcome === "accepted") hideInstallBanner(true);
      return;
    }
    if (isIosDevice()) {
      hideInstallBanner(true);
    }
  });

  dismissBtn?.addEventListener("click", () => hideInstallBanner(true));
  maybeShowInstallBanner();
}


/* GLOBAL_DELETE_DELEGATE — filet de sécurité pour tous les boutons Supprimer */
document.addEventListener(
  "click",
  (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const btn =
      t.closest(".btn-amende-delete") ||
      t.closest(".btn-delete") ||
      t.closest(".btn-pret-delete") ||
      t.closest(".btn-evenement-delete") ||
      t.closest(".btn-loi-delete") ||
      t.closest(".btn-guide-delete") ||
      t.closest(".btn-comm-delete") ||
      t.closest(".btn-autre-argent-delete") ||
      t.closest(".btn-ancienne-tournee-delete") ||
      t.closest(".btn-capital-hors-delete");
    if (!btn) return;
    // Laisser les handlers spécifiques s'exécuter s'ils stoppent la propagation
    // On ne double-traite que si data-delete-handled n'est pas posé
    if (btn.dataset.deleteHandled === "1") return;
    const id =
      btn.dataset.id ||
      btn.dataset.loanId ||
      btn.dataset.eventId ||
      btn.dataset.loiId ||
      btn.dataset.guideId ||
      btn.dataset.memberId ||
      "";
    // Membres
    if (btn.classList.contains("btn-delete") && id && typeof deleteMember === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteMember(id);
      return;
    }
    // Amendes / dettes
    if (btn.classList.contains("btn-amende-delete") && id && typeof deleteAmendeRecord === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteAmendeRecord(id);
      return;
    }
    // Prêts
    if (btn.classList.contains("btn-pret-delete") && !btn.classList.contains("btn-evenement-delete") && !btn.classList.contains("btn-loi-delete") && !btn.classList.contains("btn-guide-delete") && !btn.classList.contains("btn-capital-hors-delete") && btn.dataset.loanId && typeof deletePret === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deletePret(btn.dataset.loanId);
      return;
    }
    // Événements
    if (btn.classList.contains("btn-evenement-delete") && btn.dataset.eventId && typeof deleteEvenement === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteEvenement(btn.dataset.eventId);
      return;
    }
    // Loi
    if (btn.classList.contains("btn-loi-delete") && btn.dataset.loiId && typeof deleteLoiArticle === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteLoiArticle(btn.dataset.loiId);
      return;
    }
    // Guide
    if (btn.classList.contains("btn-guide-delete") && btn.dataset.guideId && typeof deleteGuideArticle === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteGuideArticle(btn.dataset.guideId);
      return;
    }
    // Communication
    if (btn.classList.contains("btn-comm-delete") && id && typeof deleteCommunication === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteCommunication(id);
      return;
    }
    // Autre argent
    if (btn.classList.contains("btn-autre-argent-delete") && id && typeof deleteAutreArgent === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteAutreArgent(id);
      return;
    }
    // Ex tournée
    if (btn.classList.contains("btn-ancienne-tournee-delete") && id && typeof deleteAncienneTourneeDette === "function") {
      e.preventDefault();
      e.stopPropagation();
      btn.dataset.deleteHandled = "1";
      setTimeout(() => delete btn.dataset.deleteHandled, 800);
      deleteAncienneTourneeDette(id);
      return;
    }
  },
  true
);

// Expose suppressions pour onclick HTML + tests
window.deleteAncienneTourneeDette = deleteAncienneTourneeDette;
window.deleteAmendeRecord = deleteAmendeRecord;
window.deleteMember = deleteMember;
window.deletePret = deletePret;
window.deleteEvenement = deleteEvenement;
window.deleteLoiArticle = deleteLoiArticle;
window.deleteGuideArticle = deleteGuideArticle;
window.deleteCommunication = deleteCommunication;
window.deleteAutreArgent = deleteAutreArgent;
window.deleteCapitalHorsGroupe = deleteCapitalHorsGroupe;

/** Test interne : liste tous les types de boutons supprimer présents dans le DOM */
window.__testDeleteButtons = function () {
  const selectors = [
    ".btn-delete",
    ".btn-amende-delete",
    ".btn-pret-delete",
    ".btn-evenement-delete",
    ".btn-loi-delete",
    ".btn-guide-delete",
    ".btn-comm-delete",
    ".btn-autre-argent-delete",
    ".btn-ancienne-tournee-delete",
    ".btn-capital-hors-delete",
    ".pret-notif-delete",
  ];
  const report = {};
  selectors.forEach((sel) => {
    const nodes = document.querySelectorAll(sel);
    report[sel] = {
      count: nodes.length,
      ids: Array.from(nodes)
        .slice(0, 5)
        .map((n) => n.dataset.id || n.dataset.loanId || n.dataset.eventId || n.dataset.loiId || n.dataset.guideId || ""),
    };
  });
  console.table(
    Object.entries(report).map(([sel, v]) => ({
      bouton: sel,
      quantite: v.count,
      exemples_id: v.ids.join(", "),
    }))
  );
  return report;
};

initApp();