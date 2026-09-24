function addAmende(memberId, type, amount, note) {
  if (!requireTabAccess("amendes", "ajouter des amendes")) return;

  const member = getMemberById(memberId);
  if (!member) {
    alert("Membre introuvable.");
    return;
  }

  if (type === "dette" || type === "evenement") {
    alert(
      "Les dettes d’événements se créent automatiquement. Impossible de les ajouter à la main."
    );
    return;
  }

  const parsedAmount = parseAmendeAmount(amount);
  if (parsedAmount === null) return;
  if (parsedAmount <= 0) {
    alert("Le montant doit être supérieur à 0.");
    return;
  }

  const now = new Date().toISOString();
  amendes.unshift({
    id: generateId(),
    memberId,
    type: type || "absence",
    amount: parsedAmount,
    originalAmount: parsedAmount,
    repaidAmount: 0,
    note: String(note || "").trim(),
    date: now,
    createdAt: now,
    updatedAt: now,
  });

  saveAmendes();
  amendeForm?.reset();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  showToast?.(
    `Amende ${formatEuro(parsedAmount)} enregistrée pour ${member.name}.`,
    "success"
  );
}

function updateAmende(id, memberId, type, amount, note) {
  if (!requireTabAccess("amendes", "modifier des amendes")) return;

  const index = amendes.findIndex((a) => a.id === id);
  if (index === -1) return;

  const member = getMemberById(memberId);
  if (!member) return;

  const parsedAmount = parseAmendeAmount(amount);
  if (parsedAmount === null) return;

  amendes[index] = {
    ...amendes[index],
    memberId,
    type,
    amount: parsedAmount,
    note: String(note || "").trim(),
    updatedAt: new Date().toISOString(),
  };

  saveAmendes();
  cancelEditAmende();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
}

function applyDetteRemoval(amende, { restoreCaisse = false, markEventPaid = false, restoreAmount = null, dismissDebt = false } = {}) {
  if (!isDetteAmende(amende) || !amende.evenementId) return false;

  const evt = getEvenementById(amende.evenementId);
  if (!evt) return false;
  const amount = restoreAmount != null ? Number(restoreAmount) : Number(amende.amount) || 0;

  if (!evt.payments) evt.payments = {};
  if (!evt.payments[amende.memberId]) {
    evt.payments[amende.memberId] = { paid: false, paidAt: null, validatedBy: null };
  }
  const payment = evt.payments[amende.memberId];

  if (markEventPaid) {
    payment.paid = true;
    payment.paidAt = new Date().toISOString();
    payment.validatedBy = getCurrentMember()?.id || null;
    payment.paidAmount = (Number(payment.paidAmount) || 0) + amount;
    payment.debtRepaidAt = new Date().toISOString();
  }

  // Toujours lever le flag dette événement à la suppression / remboursement
  // sinon la dette est recréée ou reste affichée comme "Dette"
  delete payment.convertedToDebt;
  delete payment.debtCreatedAt;
  if (dismissDebt || (!markEventPaid && amount === 0)) {
    payment.debtDismissed = true;
    payment.debtDismissedAt = new Date().toISOString();
  }

  if (restoreCaisse && evt.caisseDebtDeduction) {
    evt.caisseDebtDeduction = Math.max(0, evt.caisseDebtDeduction - amount);
  }

  evt.updatedAt = new Date().toISOString();
  return true;
}

function validateDettePayment(amendeId) {
  repayAmende(amendeId);
}

function creditAmendeToCaisse(amende) {
  const now = new Date().toISOString();
  amendesCaisse.unshift({
    id: generateId(),
    sourceAmendeId: amende.id,
    memberId: amende.memberId,
    type: amende.type,
    amount: amende.amount,
    note: amende.note || "",
    paidAt: now,
    createdAt: now,
    updatedAt: now,
    validatedBy: getCurrentMember()?.id || null,
  });
  saveAmendesCaisse();
}

async function repayAmende(id, amountValue) {
  const amende = getAmendeById(id);
  if (!amende) return;

  if (!canRepayAmende(amende)) {
    alert("Les remboursements se font dans l'onglet Admin, pour les postes qui ont l'accès Dettes et amendes.");
    return;
  }

  const remaining = Math.round((Number(amende.amount) || 0) * 100) / 100;
  if (remaining <= 0) return;

  const typed = String(amountValue ?? "").trim().replace(",", ".");
  if (!typed) {
    alert(`Indique le montant de ce versement.\nReste dû : ${formatEuro(remaining)} (tu peux mettre moins).`);
    return;
  }
  const payAmount = Math.round(parseFloat(typed) * 100) / 100;
  if (Number.isNaN(payAmount) || payAmount <= 0) {
    alert("Montant invalide.");
    return;
  }
  if (payAmount > remaining) {
    alert(`Impossible de rembourser ${formatEuro(payAmount)} : il reste ${formatEuro(remaining)}.`);
    return;
  }

  const member = getMemberById(amende.memberId);
  const typeLabel = getAmendeTypeLabel(amende.type);
  const nextRemaining = Math.round((remaining - payAmount) * 100) / 100;
  const isFull = nextRemaining <= 0;

  if (
    !(await appConfirm(
      isFull
        ? `Valider ${formatEuro(payAmount)} (${typeLabel.toLowerCase()} de ${member?.name || "ce poto"}) ?\nL'amende sera soldée, le montant ira dans Déjà versé et dans la caisse.`
        : `Valider ${formatEuro(payAmount)} sur ${formatEuro(remaining)} (${member?.name || "ce poto"}) ?\nDéjà versé sera mis à jour.\nIl restera ${formatEuro(nextRemaining)}.\n${formatEuro(payAmount)} ira dans la caisse.`
    ))
  ) {
    return;
  }

  if (editingAmendeId === id) cancelEditAmende();

  if (!amende.originalAmount) {
    amende.originalAmount = Math.round((remaining + getAmendeRepaidAmount(amende)) * 100) / 100;
  }

  if (isDetteAmende(amende)) {
    applyDetteRemoval(amende, {
      restoreCaisse: true,
      markEventPaid: isFull,
      restoreAmount: payAmount,
    });
    localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));
  } else {
    creditAmendeToCaisse({ ...amende, amount: payAmount });
  }

  amende.repaidAmount = Math.round(((Number(amende.repaidAmount) || 0) + payAmount) * 100) / 100;
  if (isFull) {
    amende.amount = 0;
    amende.settledAt = new Date().toISOString();
  } else {
    amende.amount = nextRemaining;
    delete amende.settledAt;
  }
  amende.updatedAt = new Date().toISOString();

  saveAmendes();
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  renderEvenements();
  renderFinanceDashboard();
  renderMesAmendes();
  renderMesDettes();

  const shownRepaid = getAmendeById(id) ? getAmendeRepaidAmount(getAmendeById(id)) : payAmount;
  alert(
    isFull
      ? `Versement validé — ${formatEuro(payAmount)} dans Déjà versé, amende soldée.\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
      : `Versement validé — ${formatEuro(payAmount)} ajouté à Déjà versé (total ${formatEuro(shownRepaid)}).\nReste dû : ${formatEuro(nextRemaining)}\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
  );
}

function validateAmendePayment(id) {
  repayAmende(id);
}

function deleteAmende(id) {
  deleteAmendeRecord(id);
}

async function deleteAmendeRecord(id) {
  if (!canDo("amendes")) {
    alert("Pas l'accès pour supprimer.");
    return;
  }

  const amende = getAmendeById(id);
  if (!amende) return;

  const member = getMemberById(amende.memberId);
  const memberName = member?.name || "ce poto";
  if (
    !(await appConfirm(
      isDetteAmende(amende)
        ? `Supprimer la dette de ${memberName} (${formatEuro(amende.amount)}) ?\nElle ne sera pas ajoutée à la caisse.`
        : `Supprimer ${getAmendeTypeLabel(amende.type).toLowerCase()} de ${memberName} (${formatEuro(amende.amount)}) ?\nElle ne sera pas ajoutée à la caisse.`
    ))
  ) {
    return;
  }

  if (editingAmendeId === id) cancelEditAmende();

  const wasDette = isDetteAmende(amende);
  if (wasDette) {
    applyDetteRemoval(amende, {
      restoreCaisse: false,
      markEventPaid: false,
      dismissDebt: true,
      restoreAmount: 0,
    });
    localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));
  }

  // Soft-delete + UI immédiate + flush serveur
  const now = new Date().toISOString();
  amende.deletedAt = now;
  amende.updatedAt = now;
  amende.amount = 0;
  // Retrait immédiat du DOM (avant confirm réseau)
  document.getElementById(`amende-${id}`)?.remove();
  document.getElementById(`admin-amende-${id}`)?.remove();
  document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`).forEach((el) => {
    const row = el.closest("tr, .amende-history-row, .dette-card, article");
    if (row) row.remove();
  });
  saveAmendes();
  bumpLiveDataRevision();
  renderAmendes();
  renderAmendesAdminHistory();
  renderEvenements();
  renderFinanceDashboard();
  if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  showToast?.(wasDette ? `Dette de ${memberName} supprimée.` : `Amende de ${memberName} supprimée.`, "success");
  // Forcer envoi amendes + événements (dette) avant tout pull
  try {
    const aRaw = localStorage.getItem(AMENDES_KEY);
    const qs = window.queueServerSync || (typeof queueServerSync === "function" ? queueServerSync : null);
    if (aRaw && qs) qs(AMENDES_KEY, aRaw);
    const eRaw = localStorage.getItem(EVENEMENTS_KEY);
    if (eRaw && wasDette && qs) qs(EVENEMENTS_KEY, eRaw);
  } catch { /* ignore */ }
  if (typeof potoFlushSync === "function") {
    try {
      await potoFlushSync();
    } catch {
      /* ignore */
    }
  }
  renderAmendes();
  renderAmendesAdminHistory();
  renderEvenements();
  renderFinanceDashboard();
  if (typeof renderReunion === "function") renderReunion();
}

async function undoAmendePayment(caisseId) {
  if (!requireTabAccess("amendes", "annuler un encaissement d'amende")) return;

  const entry = amendesCaisse.find((item) => item.id === caisseId);
  if (!entry) return;

  const member = getMemberById(entry.memberId);
  const memberName = member?.name || "ce poto";
  if (
    !(await appConfirm(
      `Annuler l'encaissement de ${formatEuro(entry.amount)} (${memberName}) ?\nLe montant sort de la caisse et l'amende revient en cours.`
    ))
  ) {
    return;
  }

  const existing = entry.sourceAmendeId ? getAmendeById(entry.sourceAmendeId) : null;
  const restoredAmount = Number(entry.amount) || 0;
  if (existing) {
    existing.amount = Math.round(((Number(existing.amount) || 0) + restoredAmount) * 100) / 100;
    existing.repaidAmount = Math.max(
      0,
      Math.round(((Number(existing.repaidAmount) || 0) - restoredAmount) * 100) / 100
    );
    delete existing.settledAt;
  } else {
    amendes.unshift({
      id: entry.sourceAmendeId || generateId(),
      memberId: entry.memberId,
      type: entry.type || "sanctions",
      amount: restoredAmount,
      originalAmount: restoredAmount,
      repaidAmount: 0,
      note: entry.note || "",
      date: entry.paidAt || new Date().toISOString(),
    });
  }

  amendesCaisse = amendesCaisse.filter((item) => item.id !== caisseId);
  saveAmendesCaisse();
  saveAmendes();
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  renderFinanceDashboard();
}

function renderAmendesAdminHistory() {
  const openEl = document.getElementById("amendeHistoryOpen");
  const paidEl = document.getElementById("amendeHistoryPaid");
  const panel = document.getElementById("amendeHistoryPanel");
  if (!openEl) return;

  const canSee = hasRoleTabAccess("amendes");
  if (panel) panel.hidden = !canSee;
  if (!canSee) {
    openEl.innerHTML = "";
    if (paidEl) paidEl.innerHTML = "";
    return;
  }

  const openRows = amendes
    .filter((amende) => !isAmendeDeleted(amende))
    .filter((amende) => !isDetteAmende(amende))
    .filter((amende) => (Number(amende.amount) || 0) > 0 || getAmendeRepaidAmount(amende) > 0)
    .map((amende) => {
      const remaining = Math.round((Number(amende.amount) || 0) * 100) / 100;
      const repaid = getAmendeRepaidAmount(amende);
      const original = Math.round((Number(amende.originalAmount) || remaining + repaid) * 100) / 100;
      const member = getMemberById(amende.memberId);
      const note = getAmendeDetailText(amende);
      return {
        id: amende.id,
        domId: `admin-amende-${amende.id}`,
        date: amende.date,
        type: amende.type,
        detail: note && note !== "—" ? `${member?.name || "—"} — ${note}` : member?.name || "—",
        original,
        repaid,
        remaining,
        settled: remaining <= 0,
        actions: remaining > 0
          ? buildAmendeActionControls(amende, { showEdit: true })
          : "",
        sortAt: amende.settledAt || amende.date,
      };
    });

  const paidRows = [...amendesCaisse]
    .filter((entry) => !openRows.some((row) => row.id === entry.sourceAmendeId))
    .map((entry) => {
      const member = getMemberById(entry.memberId);
      const amount = Number(entry.amount) || 0;
      return {
        id: entry.id,
        date: entry.paidAt,
        type: entry.type || "sanctions",
        detail: entry.note ? `${member?.name || "—"} — ${entry.note}` : member?.name || "—",
        original: amount,
        repaid: amount,
        remaining: 0,
        settled: true,
        statusLabel: "Encaissée",
        chipClass: "is-paid",
        actions: `<button type="button" class="btn-secondary btn-amende-undo" data-id="${entry.id}">Annuler</button>`,
        sortAt: entry.paidAt,
      };
    });

  const rows = [...openRows, ...paidRows].sort((a, b) => {
    if (a.settled !== b.settled) return a.settled ? 1 : -1;
    return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
  });

  renderLedgerInto(openEl, {
    noun: "amende",
    emptyMeta: "Aucune amende en cours",
    emptyText: "Aucune amende pour le moment.",
    rowIdPrefix: "admin-amende",
    rows,
  });
  if (paidEl) paidEl.innerHTML = "";
}

function loadPrets() {
  const parsed = readSynced(PRETS_KEY, []);
  if (!Array.isArray(parsed)) return [];
  // Recalcule totalRepaid depuis l'historique pour rester cohérent après sync
  return parsed.map((loan) => {
    if (!loan || typeof loan !== "object") return loan;
    if (!Array.isArray(loan.repayments)) loan.repayments = [];
    const fromHistory =
      Math.round(
        loan.repayments.reduce((sum, r) => sum + (Number(r?.amount) || 0), 0) * 100
      ) / 100;
    if (fromHistory > 0 || loan.repayments.length > 0) {
      loan.totalRepaid = fromHistory;
    } else {
      loan.totalRepaid = Math.round((Number(loan.totalRepaid) || 0) * 100) / 100;
    }
    return loan;
  });
}

function loadNotifications() {
  const parsed = readSynced(NOTIFICATIONS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function savePrets(shouldRender = true) {
  localStorage.setItem(PRETS_KEY, JSON.stringify(prets));
  if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  if (!shouldRender) return;
  renderPrets();
  renderMesDettes();
  if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
}

function saveNotifications(shouldRender = true) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  if (shouldRender) renderPrets();
  flushPushMessages();
}

function getTotalAmendesInCaisse() {
  return amendesCaisse.reduce((sum, entry) => {
    if (!entry || entry.deletedAt) return sum;
    return sum + (Number(entry.amount) || 0);
  }, 0);
}

function getTotalEvenementDebtDeductions() {
  return evenements.reduce((sum, evt) => sum + (evt.caisseDebtDeduction || 0), 0);
}

function getEvenementPaidAmount(evt, memberId) {
  if (!isEvenementPaid(evt, memberId)) return 0;
  const payment = evt.payments?.[memberId];
  if (payment?.paidAmount != null) return payment.paidAmount;
  return getEvenementShare(evt);
}

function getEvenementCollectedAmount(evt) {
  return getSortedMembers().reduce((sum, member) => {
    if (isEvenementBeneficiary(evt, member.id)) return sum;
    return sum + getEvenementPaidAmount(evt, member.id);
  }, 0);
}

function getEvenementPotoReceivable(evt) {
  if (isEvenementReimbursed(evt)) {
    return evt.reimbursedAmount ?? 0;
  }
  return getEvenementCollectedAmount(evt);
}

function isEvenementReimbursed(evt) {
  return Boolean(evt.reimbursedToBeneficiary);
}

function isEvenementClosed(evt) {
  return Boolean(evt.closed);
}

function getTotalEvenementsInCaisse() {
  return evenements.reduce((sum, evt) => {
    if (isEvenementReimbursed(evt)) return sum;
    return sum + getEvenementCollectedAmount(evt);
  }, 0);
}

function getCaisseBase() {
  // Fond de départ + fond annuel versé + amendes payées − dettes événements déduites
  return Math.max(
    0,
    getFondCaisse() +
      getTotalFondCaisseAnnuelVerse() +
      getTotalAmendesInCaisse() -
      getTotalEvenementDebtDeductions()
  );
}

function isAutreArgentRetrait(entry) {
  return Boolean(entry) && (entry.type === "retrait" || Number(entry.amount) < 0);
}

function getEntryAmount(entry) {
  const amount = Number(entry?.amount);
  return Number.isNaN(amount) ? 0 : amount;
}

function getTotalDonsOuAides() {
  return autreArgent.reduce((sum, entry) => {
    if (isAutreArgentRetrait(entry)) return sum;
    return sum + Math.max(0, getEntryAmount(entry));
  }, 0);
}

function getTotalRetraitsCaisse() {
  return autreArgent.reduce((sum, entry) => {
    if (!isAutreArgentRetrait(entry)) return sum;
    return sum + Math.abs(getEntryAmount(entry));
  }, 0);
}

function getTotalAutreArgent() {
  return getTotalDonsOuAides() - getTotalRetraitsCaisse();
}

function parseAutreArgentAmount(amount) {
  const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return null;
  return parsedAmount;
}

/**
 * Caisse brute = caisse disponible + argent des événements encore en caisse.
 */
function getCaisseBrute() {
  return getCaisseDisponible() + getTotalEvenementsInCaisse();
}

/**
 * Impact des prêts sur la caisse :
 * - prêt accordé → l'argent sort (− montant)
 * - remboursement → l'argent revient (+ montant remboursé)
 * Les demandes en vote / refusées ne touchent pas la caisse.
 */
function getLoansCashImpact() {
  return prets.reduce((sum, loan) => {
    if (isLoanDeleted(loan)) return sum;
    if (!["active", "defaulted", "completed"].includes(loan.status)) return sum;
    return sum - loan.amount + (loan.totalRepaid || 0);
  }, 0);
}

/** Capital encore sorti (prêts actifs non entièrement remboursés) */
function getLoansCapitalOut() {
  return getActiveLoans().reduce((sum, loan) => {
    return sum + Math.max(0, loan.amount - (loan.totalRepaid || 0));
  }, 0);
}

/** Argent dehors hors groupe (ex-membre, prêt non récupéré, etc.) */
function loadCapitalHorsGroupe() {
  const parsed = readSynced(CAPITAL_HORS_GROUPE_KEY, []);
  if (!Array.isArray(parsed)) return [];
  // Garder les tombes (deletedAt) pour la synchro, le total ignore les supprimés
  return parsed.filter((e) => e && e.id);
}

function saveCapitalHorsGroupe(shouldRender = true) {
  localStorage.setItem(CAPITAL_HORS_GROUPE_KEY, JSON.stringify(capitalHorsGroupe));
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  if (shouldRender) {
    renderCapitalHorsGroupeAdmin();
    renderPrets();
    renderFinanceDashboard();
    if (typeof renderAutreArgent === "function") renderAutreArgent();
  }
}

function getCapitalHorsGroupeTotal() {
  return capitalHorsGroupe.reduce((sum, entry) => {
    if (!entry || entry.deletedAt) return sum;
    return sum + Math.max(0, Number(entry.amount) || 0);
  }, 0);
}

/** Capital total dehors = prêts en cours + argent hors groupe */
function getTotalCapitalOut() {
  return getLoansCapitalOut() + getCapitalHorsGroupeTotal();
}

/**
 * Caisse disponible : fond + amendes + dons − prêts sortis (membres) + remboursements.
 * L'argent "hors groupe" (ex-membres) n'y figure pas : il n'est plus en caisse.
 * Sert aux prêts (argent libre).
 */
function getCaisseDisponible() {
  return Math.max(0, getCaisseBase() + getTotalAutreArgent() + getLoansCashImpact());
}

/**
 * Caisse total = argent encore en caisse + prêts sortis + créances hors groupe (ex-membres).
 * Les 850 € d'un ex-membre augmentent bien ce total sans être "disponibles".
 */
function getCaisseTotal() {
  return getCaisseDisponible() + getLoansCapitalOut() + getCapitalHorsGroupeTotal();
}

function addCapitalHorsGroupe(label, amount) {
  if (!canEditFondCaisse() && !canManageCaisseArgent()) {
    alert("Seul un administrateur (accès Caisse) peut ajouter de l'argent dehors.");
    return false;
  }
  const parsed = Math.round(parseFloat(amount) * 100) / 100;
  if (Number.isNaN(parsed) || parsed <= 0) {
    alert("Montant invalide.");
    return false;
  }
  const name = String(label || "").trim() || "Ex-membre / créance";
  capitalHorsGroupe.unshift({
    id: generateId(),
    label: name,
    amount: parsed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  saveCapitalHorsGroupe();
  notifyAllMembers(
    "capital_hors_groupe",
    `${getActorLabel()} a enregistré ${formatEuro(parsed)} dehors (${name}).`,
    { tab: "prets", title: "Argent dehors" }
  );
  return true;
}

async function deleteCapitalHorsGroupe(id) {
  if (!canEditFondCaisse() && !canManageCaisseArgent()) {
    alert("Seul un administrateur (accès Caisse) peut supprimer cette ligne.");
    return false;
  }
  const entry = capitalHorsGroupe.find((e) => e.id === id);
  if (!entry) return false;
  if (!(await appConfirm(`Retirer « ${entry.label} » (${formatEuro(entry.amount)}) de l'argent dehors ?`))) {
    return false;
  }
  const now = new Date().toISOString();
  entry.deletedAt = now;
  entry.updatedAt = now;
  saveCapitalHorsGroupe();
  return true;
}

function renderCapitalHorsGroupeAdmin() {
  const list = document.getElementById("capitalHorsGroupeList");
  const totalEl = document.getElementById("capitalHorsGroupeTotal");
  if (totalEl) totalEl.textContent = formatEuro(getCapitalHorsGroupeTotal());
  if (!list) return;
  const items = capitalHorsGroupe.filter((e) => e && !e.deletedAt);
  if (!items.length) {
    list.innerHTML = `<p class="panel-desc">Aucune créance hors groupe pour le moment.</p>`;
    return;
  }
  list.innerHTML = items
    .map(
      (e) => `
      <div class="capital-hors-item">
        <div>
          <strong>${escapeHtml(e.label || "—")}</strong>
          <span class="panel-desc">${formatEuro(e.amount)} · ${formatDate((e.createdAt || "").split("T")[0] || "")}</span>
        </div>
        <button type="button" class="btn-pret-delete btn-capital-hors-delete" data-id="${escapeHtml(e.id)}">Supprimer</button>
      </div>`
    )
    .join("");
}

function getPendingVoteLoan() {
  return (
    prets.find(
      (loan) => !isLoanDeleted(loan) && PENDING_VOTE_STATUSES.includes(loan.status)
    ) || null
  );
}

function getBorrowerActiveLoan(memberId) {
  return (
    prets.find(
      (loan) =>
        !isLoanDeleted(loan) &&
        loan.borrowerId === memberId &&
        BORROWER_ACTIVE_STATUSES.includes(loan.status)
    ) || null
  );
}

function canInitiateNewPret() {
  const current = getCurrentMember();
  if (!current) return false;
  if (getPendingVoteLoan()) return false;
  if (getBorrowerActiveLoan(current.id)) return false;
  if (getAncienneTourneeDette(current.id) > 0) return false;
  return true;
}

function getActiveLoans() {
  return prets.filter(
    (loan) => !isLoanDeleted(loan) && (loan.status === "active" || loan.status === "defaulted")
  );
}

function getActiveLoanRemaining() {
  return getActiveLoans().reduce((sum, loan) => sum + getLoanBalance(loan), 0);
}

function getTotalRepaymentsReturned() {
  return getActiveLoans().reduce((sum, loan) => sum + (loan.totalRepaid || 0), 0);
}

function showPretSaveMessage(text, type = "success") {
  [pretSaveMsg, document.getElementById("adminPretSaveMsg")].forEach((el) => {
    if (!el) return;
    el.textContent = text;
    el.className = `save-msg save-msg-${type}`;
    el.hidden = false;
  });
}

function getBorrowableAmount() {
  // Caisse disponible déjà nette des prêts sortis / remboursements
  const caisse = getCaisseDisponible();
  return Math.max(0, (caisse - CAISSE_RESERVE) / 2);
}

function getLoanVoters(borrowerId) {
  // Seuls les vrais membres du groupe votent (pas les "nouveaux")
  return getGroupMembers().filter((member) => member.id !== borrowerId);
}

function getVoteStats(loan) {
  const voters = getLoanVoters(loan.borrowerId);
  let yesCount = 0;
  let noCount = 0;
  const votes = loan?.votes && typeof loan.votes === "object" ? loan.votes : {};

  voters.forEach((voter) => {
    const vote = votes[voter.id];
    if (vote === "yes") yesCount += 1;
    if (vote === "no") noCount += 1;
  });

  return {
    voters,
    yesCount,
    noCount,
    pendingCount: voters.length - yesCount - noCount,
    unanimousYes: voters.length > 0 && yesCount === voters.length,
  };
}

/** Liste nominative des votes (Oui / Non / en attente) — pour Admin et suivi */
function buildVotersBreakdownHtml(loan) {
  const stats = getVoteStats(loan);
  const votes = loan?.votes && typeof loan.votes === "object" ? loan.votes : {};
  const yes = [];
  const no = [];
  const pending = [];
  stats.voters.forEach((v) => {
    const choice = votes[v.id];
    if (choice === "yes") yes.push(v.name);
    else if (choice === "no") no.push(v.name);
    else pending.push(v.name);
  });
  const line = (label, names, cls) => {
    if (!names.length) return "";
    return `<div class="pret-voters-line pret-voters-${cls}">
      <span class="pret-voters-label">${label} (${names.length})</span>
      <span class="pret-voters-names">${names.map((n) => escapeHtml(n)).join(", ")}</span>
    </div>`;
  };
  return `<div class="pret-voters-box" data-loan-id="${escapeHtml(loan.id || "")}">
    ${line("Oui", yes, "yes")}
    ${line("Non", no, "no")}
    ${line("En attente", pending, "pending")}
  </div>`;
}

function getLoanById(id) {
  return prets.find((loan) => loan.id === id);
}

function getLoanBalance(loan) {
  const base = Math.max(0, loan.amount - (loan.totalRepaid || 0));
  return base + (loan.interestAmount || 0);
}

function addMonthsYmd(ymd, months) {
  const [year, month, day] = String(ymd || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setMonth(date.getMonth() + months);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getLoanDueDates(loan) {
  const base = toDateInputValue(getLoanRequestDate(loan));
  if (!base) return null;
  const month1Ymd = addMonthsYmd(base, 1);
  const month2Ymd = addMonthsYmd(base, 2);
  if (!month1Ymd || !month2Ymd) return null;
  return {
    month1: new Date(`${month1Ymd}T12:00:00`),
    month2: new Date(`${month2Ymd}T12:00:00`),
    month1Ymd,
    month2Ymd,
  };
}

function formatLoanDueDatesLabel(loan, compact = false) {
  const dueDates = getLoanDueDates(loan);
  if (!dueDates) return "";
  if (compact) {
    const short = (ymd) => {
      const parts = String(ymd).split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : ymd;
    };
    return `80% ${short(dueDates.month1Ymd)} · Solde ${short(dueDates.month2Ymd)}`;
  }
  return `Échéance 80 % : ${formatDate(`${dueDates.month1Ymd}T12:00:00`)} · Solde : ${formatDate(`${dueDates.month2Ymd}T12:00:00`)}`;
}

function getLoanRequestDate(loan) {
  return loan?.createdAt || loan?.approvedAt || "";
}

let loanDateEditingId = null;
let loanDateSaving = false;
let loanDateIgnoreBlurUntil = 0;

function isLoanDateEditing() {
  return Boolean(loanDateEditingId);
}

function isUserEditingForm() {
  if (isLoanDateEditing()) return true;
  const el = document.activeElement;
  if (!el) return false;
  const tag = (el.tagName || "").toUpperCase();
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = (el.type || "").toLowerCase();
    if (type === "button" || type === "submit" || type === "checkbox" || type === "radio" || type === "hidden") {
      return false;
    }
    return true;
  }
  return Boolean(el.isContentEditable);
}

function stopLoanDateEdit() {
  loanDateEditingId = null;
}

function startLoanDateEdit(loanId) {
  if (!loanId || !canManagePretsActions()) return;
  loanDateEditingId = loanId;
  renderAdminPretLedger(true);
  const input = [...document.querySelectorAll(".pret-request-date-input")].find(
    (el) => el.dataset.loanId === loanId
  );
  if (!input) return;
  loanDateIgnoreBlurUntil = Date.now() + 500;
  input.focus();
  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
    } catch {
      /* picker déjà ouvert ou non supporté */
    }
  }
}

async function updateLoanRequestDate(loanId, ymd) {
  if (!canManagePretsActions()) {
    alert("Seul le Financier ou un administrateur peut modifier la date de demande.");
    return false;
  }

  const loan = getLoanById(loanId);
  if (!loan) return false;

  const nextCreated = combineDateWithTime(ymd, loan.createdAt);
  if (!nextCreated) {
    alert("Date invalide.");
    return false;
  }
  if (toDateInputValue(getLoanRequestDate(loan)) === ymd) {
    stopLoanDateEdit();
    renderAdminPretLedger(true);
    return true;
  }

  loan.createdAt = nextCreated;
  if (loan.approvedAt) loan.approvedAt = combineDateWithTime(ymd, loan.approvedAt) || loan.approvedAt;
  if (loan.financierDecidedAt) {
    loan.financierDecidedAt = combineDateWithTime(ymd, loan.financierDecidedAt) || loan.financierDecidedAt;
  }
  loan.updatedAt = new Date().toISOString();
  if (loan.status === "active" || loan.status === "defaulted" || loan.status === "completed") {
    const dueDates = getLoanDueDates(loan);
    const dueLabel = dueDates ? formatDate(`${dueDates.month1Ymd}T12:00:00`) : "—";
    upsertLoanNotification(
      loan.borrowerId,
      loan.id,
      "loan_approved",
      `Prêt accordé — ${formatEuro(loan.amount)}. Remboursez 80 % avant le ${dueLabel}.`
    );
    saveNotifications(false);
  }
  savePrets(false);
  try {
    localStorage.setItem("poto-timide-data-revision", JSON.stringify(Date.now()));
  } catch {
    /* ignore */
  }

  const flush = window.flushPotoServerSync || window.potoFlushSync;
  if (typeof flush === "function") {
    try {
      await flush();
    } catch (err) {
      console.warn("Synchronisation de la date de prêt :", err);
    }
  }

  stopLoanDateEdit();
  renderPrets();
  renderMesDettes();
  if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
  showPretSaveMessage(`Date de demande mise à jour : ${formatFriendlyDate(ymd)}.`);
  return true;
}

window.potoIsLoanDateEditing = isLoanDateEditing;
window.potoIsUserEditingForm = isUserEditingForm;

const pendingPushMessages = [];
/** Domaine public : le clic notif ouvre ce site (prod) */
const PUBLIC_APP_ORIGIN = "https://pototimide.com";

function buildNotificationDeepLinkUrl({ tab = "prets", admin = "", loanId = "", item = "" } = {}) {
  const params = new URLSearchParams();
  if (tab) params.set("tab", tab);
  if (admin) params.set("admin", admin);
  if (loanId) params.set("loan", loanId);
  if (item) params.set("item", item);
  let origin = PUBLIC_APP_ORIGIN;
  try {
    if (typeof location !== "undefined" && location.hostname) {
      if (/localhost|127\.0\.0\.1/.test(location.hostname)) {
        origin = location.origin;
      } else if (location.hostname.includes("pototimide")) {
        origin = location.origin;
      } else {
        // Render ou autre → renvoyer vers le domaine public
        origin = PUBLIC_APP_ORIGIN;
      }
    }
  } catch {
    /* keep PUBLIC_APP_ORIGIN */
  }
  return `${origin}/?${params.toString()}`;
}

function queuePushMessage(memberId, payload) {
  const current = getCurrentMember();
  if (!memberId || current?.id === memberId) return;
  if (shouldSuppressDevNotifications()) return;
  const tab = payload.tab || "prets";
  const loanId = payload.loanId || "";
  const admin = payload.admin || "";
  const item = payload.item || "";
  const url =
    payload.url || buildNotificationDeepLinkUrl({ tab, admin, loanId, item });
  pendingPushMessages.push({
    memberId,
    title: payload.title || "Poto Timide",
    body: payload.body || "",
    url,
    tab,
    admin,
    loanId,
    item,
    tag: payload.tag || "poto-timide",
  });
}

async function flushPushMessages() {
  if (!pendingPushMessages.length) return;
  const messages = pendingPushMessages.splice(0, pendingPushMessages.length);
  try {
    if (typeof flushServerSync === "function") await flushServerSync();
    await apiFetch("/api/push/send", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
  } catch (err) {
    console.warn("Notifications push non envoyées.", err);
  }
}

function addNotification(memberId, type, loanId, message) {
  const now = new Date().toISOString();
  notifications.unshift({
    id: generateId(),
    memberId,
    type,
    loanId: loanId || "",
    message,
    read: false,
    createdAt: now,
    updatedAt: now,
  });
}

function getActorLabel() {
  return getCurrentMember()?.name || "Le Financier";
}

/** Dario (développeur / owner) : aucune notif in-app ni push quand c'est lui qui agit */
function shouldSuppressDevNotifications() {
  const current = getCurrentMember();
  if (!current) return false;
  if (typeof isOwnerMember === "function" && isOwnerMember(current)) return true;
  const name = String(current.name || "").trim().toLowerCase();
  if (name === String(ADMIN_NAME || "Dario").toLowerCase()) return true;
  return false;
}


function notifyAllMembers(type, message, extras = {}) {
  if (shouldSuppressDevNotifications()) return;
  const { loanId = "", tab = "prets", title = "Poto Timide" } = extras;
  getSortedMembers().forEach((member) => {
    addNotification(member.id, type, loanId, message);
    queuePushMessage(member.id, {
      title,
      body: message,
      tab,
      loanId,
      tag: `${type}-${loanId || generateId()}`,
    });
  });
  saveNotifications(false);
  if (typeof window.flushPotoServerSync === "function") {
    window.flushPotoServerSync();
  }
}

function upsertLoanNotification(memberId, loanId, type, message) {
  const existing = notifications.find(
    (notif) => notif.memberId === memberId && notif.loanId === loanId
  );

  if (existing) {
    existing.type = type;
    existing.message = message;
    existing.read = false;
    existing.createdAt = new Date().toISOString();
    return;
  }

  addNotification(memberId, type, loanId, message);
}

function updateLoanNotificationsOnDecision(loan, decision) {
  if (shouldSuppressDevNotifications()) return;
  if (decision === "approved") {
    const dueDates = getLoanDueDates(loan);
    const dueLabel = dueDates
      ? formatDate(dueDates.month1.toISOString().split("T")[0])
      : "—";

    const approvedMsg = `Prêt accordé — ${formatEuro(loan.amount)}. Remboursez 80 % avant le ${dueLabel}.`;
    upsertLoanNotification(loan.borrowerId, loan.id, "loan_approved", approvedMsg);
    queuePushMessage(loan.borrowerId, {
      title: "Prêt accordé",
      body: approvedMsg,
      tab: "prets",
      loanId: loan.id,
      tag: `loan-approved-${loan.id}`,
    });
  } else {
    const rejectedMsg = `Prêt refusé — votre demande de ${formatEuro(loan.amount)} a été refusée par le Financier.`;
    upsertLoanNotification(loan.borrowerId, loan.id, "loan_rejected", rejectedMsg);
    queuePushMessage(loan.borrowerId, {
      title: "Prêt refusé",
      body: rejectedMsg,
      tab: "prets",
      loanId: loan.id,
      tag: `loan-rejected-${loan.id}`,
    });
  }

  notifications = notifications.filter((notif) => {
    if (notif.loanId !== loan.id) return true;
    return notif.memberId === loan.borrowerId;
  });
}

function clearLoanVoteRequestNotifications(loanId) {
  notifications = notifications.filter(
    (notif) => !(notif.loanId === loanId && notif.type === "loan_vote")
  );
}

function clearBorrowerPendingNotification(loan) {
  notifications = notifications.filter(
    (notif) =>
      !(
        notif.loanId === loan.id &&
        notif.memberId === loan.borrowerId &&
        notif.type === "loan_pending"
      )
  );
}

function finalizeVotePhaseNotifications(loan) {
  clearLoanVoteRequestNotifications(loan.id);
  clearBorrowerPendingNotification(loan);
}

function confirmVoterNotification(loan, memberId) {
  notifications = notifications.filter(
    (notif) =>
      !(notif.memberId === memberId && notif.loanId === loan.id && notif.type === "loan_vote")
  );
}

function notifyAllMembersOnLoanInitiated(loan) {
  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "Un membre";
  const amountLabel = formatEuro(loan.amount);
  notifyAllMembers(
    "loan_initiated",
    `${borrowerName} a initié un prêt de ${amountLabel}. Votez Oui ou Non sous 24 h.`,
    { loanId: loan.id, tab: "prets", title: "Nouveau prêt" }
  );
}

function notifyFinancierForLoan(loan) {
  if (shouldSuppressDevNotifications()) return;
  const borrower = getMemberById(loan.borrowerId);
  const stats = getVoteStats(loan);
  const financierId = roles.tresorier;
  const recipients = new Set();

  if (financierId) recipients.add(financierId);
  adminIds.forEach((memberId) => recipients.add(memberId));

  const message = loan.autoApprovedByTimeout
    ? `Délai de 24 h écoulé pour le prêt de ${borrower?.name || "un membre"} (${formatEuro(loan.amount)}). Validation finale requise.`
    : `Tous les membres ont voté Oui pour le prêt de ${borrower?.name || "un membre"} (${formatEuro(loan.amount)}). Validation finale requise.`;

  const fullMessage =
    stats.noCount > 0 ? `${message} (${stats.noCount} vote(s) Non.)` : message;

  recipients.forEach((memberId) => {
    addNotification(memberId, "loan_financier", loan.id, fullMessage);
    queuePushMessage(memberId, {
      title: "Prêt à valider",
      body: fullMessage,
      tab: "prets",
      loanId: loan.id,
      tag: `loan-financier-${loan.id}`,
    });
  });
}

function notifyBorrower(loan, type, message) {
  if (shouldSuppressDevNotifications()) return;
  upsertLoanNotification(loan.borrowerId, loan.id, type, message);
}

function processLoanStatusUpdates() {
  const now = Date.now();
  let changed = false;

  prets.forEach((loan) => {
    if (isLoanDeleted(loan)) return;
    if (loan.status !== "voting") return;

    const stats = getVoteStats(loan);
    const expired = now >= new Date(loan.deadlineAt).getTime();

    if (stats.unanimousYes || expired) {
      loan.status = "awaiting_financier";
      loan.autoApprovedByTimeout = expired && !stats.unanimousYes;
      finalizeVotePhaseNotifications(loan);
      notifyFinancierForLoan(loan);
      changed = true;
    }
  });

  prets.forEach((loan) => {
    if (loan.status !== "active") return;

    const dueDates = getLoanDueDates(loan);
    if (!dueDates) return;

    const balance = getLoanBalance(loan);
    if (balance <= 0) {
      loan.status = "completed";
      changed = true;
      return;
    }

    if (Date.now() > dueDates.month2.getTime() && !loan.interestApplied) {
      loan.interestApplied = true;
      loan.interestAmount = Math.round(balance * LOAN_INTEREST_RATE * 100) / 100;
      loan.status = "defaulted";
      const interestMsg = `Retard de remboursement : intérêts de 10 % appliqués (${formatEuro(loan.interestAmount)}).`;
      notifyBorrower(loan, "loan_interest", interestMsg);
      queuePushMessage(loan.borrowerId, {
        title: "Retard de prêt",
        body: interestMsg,
        tab: "prets",
        loanId: loan.id,
        tag: `loan-interest-${loan.id}`,
      });
      changed = true;
    }
  });

  if (changed) {
    saveNotifications(false);
    savePrets();
  }
}

function formatRemainingTime(deadlineIso) {
  const diff = new Date(deadlineIso).getTime() - Date.now();
  if (diff <= 0) return "Délai expiré";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} h ${minutes} min restantes`;
}

function initiatePret(amount, note) {
  const current = getCurrentMember();
  if (!current) {
    openLoginModal();
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Montant invalide.");
    return;
  }

  const motif = String(note || "").trim();
  if (motif.length < 3) {
    alert("Le motif est obligatoire (au moins 3 caractères).");
    pretNoteInput?.focus();
    return;
  }

  const pendingVote = getPendingVoteLoan();
  if (pendingVote) {
    const borrower = getMemberById(pendingVote.borrowerId);
    alert(
      `Une demande est encore en vote pour ${borrower?.name || "un membre"}. Attendez qu'elle soit accordée ou refusée avant d'en initier une nouvelle.`
    );
    return;
  }

  const ownLoan = getBorrowerActiveLoan(current.id);
  if (ownLoan) {
    alert("Vous avez déjà une demande ou un prêt en cours. Terminez-le avant d'en demander un autre.");
    return;
  }

  const ancienneDette = getAncienneTourneeDette(current.id);
  if (ancienneDette > 0) {
    alert(
      `Tu as une dette d'ancienne tournée (${formatEuro(ancienneDette)}). Rembourse-la avant de faire un prêt.`
    );
    return;
  }

  const available = getBorrowableAmount();
  if (parsedAmount > available) {
    alert(`Montant trop élevé. Empruntable : ${formatEuro(available)}.`);
    return;
  }

  const createdAt = new Date();
  const deadlineAt = new Date(createdAt.getTime() + LOAN_VOTE_HOURS * 60 * 60 * 1000);

  const loan = {
    id: generateId(),
    borrowerId: current.id,
    amount: parsedAmount,
    note: note.trim(),
    status: "voting",
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    deadlineAt: deadlineAt.toISOString(),
    votes: {},
    financierDecision: null,
    financierDecidedAt: null,
    approvedAt: null,
    totalRepaid: 0,
    repayments: [],
    interestApplied: false,
    interestAmount: 0,
    autoApprovedByTimeout: false,
  };

  prets.unshift(loan);
  notifyAllMembersOnLoanInitiated(loan);
  logAudit("Prêt · demande", `${current.name} demande ${formatEuro(parsedAmount)}${motif ? ` — ${motif}` : ""}`);
  savePrets();
  pretForm.reset();
}

/** Votes locaux non encore confirmés par le serveur — ne jamais les perdre au pull */
const pendingLocalVotes = new Map(); // loanId -> { [memberId]: "yes"|"no", at: iso }

function rememberLocalVote(loanId, memberId, choice) {
  if (!loanId || !memberId) return;
  const prev = pendingLocalVotes.get(loanId) || {};
  pendingLocalVotes.set(loanId, {
    ...prev,
    [memberId]: choice,
    at: new Date().toISOString(),
  });
}

/** Réapplique les votes locaux après un reload / pull (évite les boutons qui réapparaissent) */
function applyPendingLocalVotesToPrets() {
  if (!pendingLocalVotes.size || !Array.isArray(prets)) return false;
  let changed = false;
  pendingLocalVotes.forEach((voteMap, loanId) => {
    const loan = prets.find((l) => l && l.id === loanId && !isLoanDeleted(l));
    if (!loan) return;
    if (!loan.votes || typeof loan.votes !== "object") loan.votes = {};
    Object.entries(voteMap).forEach(([memberId, choice]) => {
      if (memberId === "at") return;
      if (choice !== "yes" && choice !== "no") return;
      if (loan.votes[memberId] !== choice) {
        loan.votes[memberId] = choice;
        changed = true;
      }
    });
    if (changed) {
      const at = voteMap.at || new Date().toISOString();
      if (!loan.updatedAt || new Date(at).getTime() >= new Date(loan.updatedAt).getTime()) {
        loan.updatedAt = at;
      }
    }
  });
  return changed;
}

function clearConfirmedLocalVotes() {
  pendingLocalVotes.forEach((voteMap, loanId) => {
    const loan = prets.find((l) => l && l.id === loanId);
    if (!loan || !loan.votes) return;
    let allPresent = true;
    Object.entries(voteMap).forEach(([memberId, choice]) => {
      if (memberId === "at") return;
      if (loan.votes[memberId] !== choice) allPresent = false;
    });
    if (allPresent) pendingLocalVotes.delete(loanId);
  });
}

async function votePret(loanId, vote) {
  const current = getCurrentMember();
  if (!current) return;

  const loan = getLoanById(loanId);
  if (!loan || loan.status !== "voting") return;
  if (loan.borrowerId === current.id) return;

  // Déjà voté → on ne propose plus les boutons
  if (!loan.votes || typeof loan.votes !== "object") loan.votes = {};
  if (loan.votes[current.id] === "yes" || loan.votes[current.id] === "no") {
    rememberLocalVote(loanId, current.id, loan.votes[current.id]);
    renderPrets();
    return;
  }

  const choice = vote === "yes" ? "yes" : "no";
  loan.votes[current.id] = choice;
  loan.updatedAt = new Date().toISOString();
  rememberLocalVote(loanId, current.id, choice);
  logAudit("Prêt · vote", `${current.name} vote ${choice === "yes" ? "Oui" : "Non"}`);
  confirmVoterNotification(loan, current.id);

  const stats = getVoteStats(loan);
  if (stats.unanimousYes) {
    loan.status = "awaiting_financier";
    loan.autoApprovedByTimeout = false;
    loan.updatedAt = new Date().toISOString();
    finalizeVotePhaseNotifications(loan);
    notifyFinancierForLoan(loan);
    saveNotifications(false);
  } else {
    saveNotifications(false);
  }

  // Affichage immédiat + forcer une synchro prioritaires des prêts
  savePrets();
  renderPrets();
  if (typeof renderAdminPrets === "function" && isAdminWorkspace?.() && activeAdminSub === "prets") {
    try { renderAdminPrets(); } catch { /* ignore */ }
  }

  // Sync serveur avec retries + réapplication si un pull a écrasé
  const flush = window.potoFlushSync || window.flushPotoServerSync;
  if (typeof flush !== "function") return;

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const live = getLoanById(loanId);
      if (live) {
        if (!live.votes || typeof live.votes !== "object") live.votes = {};
        if (live.votes[current.id] !== choice) {
          live.votes[current.id] = choice;
          live.updatedAt = new Date().toISOString();
          rememberLocalVote(loanId, current.id, choice);
          savePrets(false);
        }
      }
      const ok = await flush();
      if (ok) {
        clearConfirmedLocalVotes();
        // Tirer immédiatement les votes des autres
        if (typeof window.potoPullSharedUpdates === "function") {
          await window.potoPullSharedUpdates();
        }
        renderPrets();
        return;
      }
    } catch (err) {
      console.warn("Synchronisation du vote échouée, nouvel essai…", err);
    }
    await new Promise((r) => setTimeout(r, 250 + attempt * 200));
  }
  console.warn("Vote enregistré localement mais sync serveur non confirmée.");
}

const PENDING_FINANCIER_STATUSES = ["voting", "awaiting_financier"];

function financierDecidePret(loanId, decision) {
  if (!canManagePretsActions()) {
    alert("Seul le Financier ou un administrateur peut valider les prêts.");
    return;
  }

  const loan = getLoanById(loanId);
  if (!loan || !PENDING_FINANCIER_STATUSES.includes(loan.status)) return;

  const borrower = getMemberById(loan.borrowerId);

  if (decision === "approved") {
    if (loan.amount > getBorrowableAmount()) {
      alert(`Fonds insuffisants. Empruntable : ${formatEuro(getBorrowableAmount())}.`);
      return;
    }
    loan.status = "active";
    loan.financierDecision = "approved";
    loan.financierDecidedAt = new Date().toISOString();
    loan.approvedAt = loan.financierDecidedAt;
    loan.updatedAt = loan.financierDecidedAt;
    updateLoanNotificationsOnDecision(loan, "approved");
  } else {
    loan.status = "rejected";
    loan.financierDecision = "rejected";
    loan.financierDecidedAt = new Date().toISOString();
    loan.updatedAt = loan.financierDecidedAt;
    updateLoanNotificationsOnDecision(loan, "rejected");
  }

  const actor = getActorLabel();
  const action = decision === "approved" ? "accordé" : "refusé";
  notifyAllMembers(
    decision === "approved" ? "loan_approved" : "loan_rejected",
    `${actor} a ${action} le prêt de ${borrower?.name || "un membre"} (${formatEuro(loan.amount)}).`,
    { loanId: loan.id, tab: "prets", title: decision === "approved" ? "Prêt accordé" : "Prêt refusé" }
  );
  logAudit(
    decision === "approved" ? "Prêt · accordé" : "Prêt · refusé",
    `${borrower?.name || "membre"} — ${formatEuro(loan.amount)}`
  );
  savePrets();
}

function ensureLoanRepayments(loan) {
  if (!loan) return [];
  if (!Array.isArray(loan.repayments)) loan.repayments = [];
  loan.repayments.forEach((repay) => {
    if (repay && !repay.id) repay.id = generateId();
  });
  return loan.repayments;
}

function syncLoanRepaidFromHistory(loan) {
  const list = ensureLoanRepayments(loan);
  loan.totalRepaid = Math.round(
    list.reduce((sum, repay) => sum + (Number(repay.amount) || 0), 0) * 100
  ) / 100;
  const balance = getLoanBalance(loan);
  if (balance <= 0) {
    loan.status = "completed";
    return;
  }
  if (loan.status === "completed") {
    loan.status = loan.interestApplied || loan.interestAmount ? "defaulted" : "active";
  }
}

function recordRepayment(loanId, amount) {
  if (!canManagePretsActions()) {
    alert("Seul le Financier ou un administrateur peut enregistrer un remboursement.");
    return;
  }

  const loan = getLoanById(loanId);
  if (!loan || !["active", "defaulted"].includes(loan.status)) return;

  const raw = String(amount ?? "").trim().replace(",", ".");
  const parsedAmount = Math.round(parseFloat(raw) * 100) / 100;
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Montant invalide.");
    return;
  }

  const remaining = getLoanBalance(loan);
  if (parsedAmount > remaining) {
    alert(`Impossible de rembourser ${formatEuro(parsedAmount)} : il reste ${formatEuro(remaining)}.`);
    return;
  }

  const current = getCurrentMember();
  ensureLoanRepayments(loan);
  const now = new Date().toISOString();
  loan.repayments.push({
    id: generateId(),
    amount: parsedAmount,
    date: now,
    recordedBy: current?.id || null,
  });
  syncLoanRepaidFromHistory(loan);
  loan.updatedAt = now;

  const actor = getActorLabel();
  const borrower = getMemberById(loan.borrowerId);
  notifyAllMembers(
    "financier_repay",
    `${actor} a enregistré un remboursement de ${formatEuro(parsedAmount)} pour ${borrower?.name || "un membre"} (prêt ${formatEuro(loan.amount)}).`,
    { loanId: loan.id, tab: "prets", title: "Remboursement" }
  );
  if (loan.status === "completed") {
    notifyAllMembers(
      "loan_completed",
      `Le prêt de ${borrower?.name || "un membre"} (${formatEuro(loan.amount)}) est entièrement remboursé.`,
      { loanId: loan.id, tab: "prets", title: "Prêt remboursé" }
    );
  }

  logAudit(
    "Prêt · remboursement",
    `${borrower?.name || "membre"} — ${formatEuro(parsedAmount)} (prêt ${formatEuro(loan.amount)})`
  );
  savePrets();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  showPretSaveMessage(
    `${formatEuro(parsedAmount)} retournés dans la caisse. Reste sur ce prêt : ${formatEuro(getLoanBalance(loan))}. Prêts sortis : ${formatEuro(getLoansCapitalOut())}.`
  );
}

async function undoLoanRepayment(loanId, repaymentId) {
  if (!canManagePretsActions()) {
    alert("Seul le Financier ou un administrateur peut annuler un remboursement.");
    return;
  }

  const loan = getLoanById(loanId);
  if (!loan) return;
  const repayments = ensureLoanRepayments(loan);
  const repayment = repayments.find((item) => item.id === repaymentId) || repayments[repayments.length - 1];
  if (!repayment) return;

  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "ce membre";
  const amount = Math.round((Number(repayment.amount) || 0) * 100) / 100;
  const confirmed = await openConfirmModal({
    title: "Annuler ce remboursement ?",
    message: `Annuler le remboursement de ${formatEuro(amount)} (${borrowerName}) ?\n\nCe montant sort de la caisse et revient sur le reste dû du prêt.`,
    okLabel: "OK",
    cancelLabel: "Annuler",
  });
  if (!confirmed) return;

  loan.repayments = repayments.filter((item) => item.id !== repayment.id);
  const wasCompleted = loan.status === "completed";
  syncLoanRepaidFromHistory(loan);

  savePrets();
  if (typeof window.flushPotoServerSync === "function") {
    window.flushPotoServerSync();
  } else if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }

  const remaining = getLoanBalance(loan);
  showPretSaveMessage(
    wasCompleted && remaining > 0
      ? `Remboursement de ${formatEuro(amount)} annulé. Le prêt est de nouveau en cours, reste ${formatEuro(remaining)}.`
      : `Remboursement de ${formatEuro(amount)} annulé. Reste dû : ${formatEuro(remaining)}. Caisse : ${formatEuro(getCaisseDisponible())}.`
  );
}

function buildLoanRepaymentsBlock(loan) {
  const repayments = [...ensureLoanRepayments(loan)].reverse();
  if (!repayments.length) return "";
  const canUndo = canManagePretsActions();
  return `
    <div class="pret-repay-history">
      <p class="pret-repay-history-title">Remboursements enregistrés</p>
      <ul class="pret-repay-list">
        ${repayments
          .map(
            (repay) => `
          <li class="pret-repay-item">
            <span>${formatEuro(repay.amount)} · ${formatFriendlyDate(repay.date || repay.createdAt)}</span>
            ${
              canUndo
                ? `<button type="button" class="btn-secondary btn-pret-repay-undo" data-loan-id="${escapeHtml(loan.id)}" data-repay-id="${escapeHtml(repay.id)}">Annuler</button>`
                : ""
            }
          </li>`
          )
          .join("")}
      </ul>
    </div>
  `;
}

function isLoanDeleted(loan) {
  return Boolean(loan?.deletedAt);
}

async function deletePret(loanId) {
  if (!canDo("prets")) {
    alert("Pas l'accès pour supprimer un prêt.");
    return;
  }
  const loan = getLoanById(loanId);
  if (!loan || isLoanDeleted(loan)) return;

  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "ce membre";

  if (
    !(await appConfirm(
      `Supprimer définitivement le prêt de ${borrowerName} (${formatEuro(loan.amount)}) ?`
    ))
  ) {
    return;
  }

  // Soft-delete : on garde une tombe pour que la synchro ne ramène pas le prêt
  const now = new Date().toISOString();
  loan.deletedAt = now;
  loan.updatedAt = now;
  loan.status = "rejected";

  notifications = notifications.filter((notif) => notif.loanId !== loanId);

  notifyAllMembers(
    "loan_deleted",
    `${getActorLabel()} a supprimé le prêt de ${borrowerName} (${formatEuro(loan.amount)}).`,
    { loanId, tab: "prets", title: "Prêt supprimé" }
  );
  logAudit("Prêt · suppression", `Prêt ${loanId} supprimé`);
  savePrets();
  saveNotifications(false);
  try {
    if (typeof potoFlushSync === "function") await potoFlushSync();
    else if (typeof window.flushPotoServerSync === "function") await window.flushPotoServerSync();
  } catch (err) {
    console.warn("Sync suppression prêt échouée", err);
  }
  renderPrets();
  if (typeof renderAdminPrets === "function") renderAdminPrets();
}

function isPretNotification(notif) {
  if (!notif || notif.deletedAt) return false;
  const type = String(notif.type || "");
  return Boolean(notif.loanId) || type.startsWith("loan_") || type.startsWith("financier_");
}

function isPersonalNotificationFor(notif, memberId) {
  if (!notif || notif.memberId !== memberId || notif.deletedAt) return false;
  return true;
}

function getPretNotificationsForMember(memberId) {
  if (!memberId) return [];
  return notifications.filter((notif) => isPersonalNotificationFor(notif, memberId));
}

function markPretNotificationsRead() {
  const current = getCurrentMember();
  if (!current) return;

  let changed = false;
  notifications.forEach((notif) => {
    if (notif.memberId === current.id && isPretNotification(notif) && !notif.read) {
      notif.read = true;
      changed = true;
    }
  });

  if (changed) saveNotifications();
}

