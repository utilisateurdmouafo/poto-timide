function deleteOwnNotification(notificationId) {
  const current = getCurrentMember();
  if (!current || !notificationId) return;

  const notif = notifications.find((item) => item.id === notificationId);
  if (!notif || notif.memberId !== current.id) {
    alert("Tu ne peux supprimer que tes propres notifications.");
    return;
  }

  const now = new Date().toISOString();
  notif.deletedAt = now;
  notif.updatedAt = now;
  saveNotifications(false);
  if (typeof window.flushPotoServerSync === "function") window.flushPotoServerSync();
  renderPretNotifications();
}

async function deleteAllOwnNotifications() {
  const current = getCurrentMember();
  if (!current) return;

  const mine = getPretNotificationsForMember(current.id);
  if (!mine.length) return;
  if (!(await appConfirm(`Supprimer tes ${mine.length} notification${mine.length > 1 ? "s" : ""} ?`))) return;

  const now = new Date().toISOString();
  notifications.forEach((item) => {
    if (item.memberId === current.id && !item.deletedAt) {
      item.deletedAt = now;
      item.updatedAt = now;
    }
  });
  saveNotifications(false);
  if (typeof window.flushPotoServerSync === "function") window.flushPotoServerSync();
  renderPretNotifications();
}

function renderInitiatePretPanel() {
  if (!initiatePretPanel) return;

  const current = getCurrentMember();
  const pendingVote = getPendingVoteLoan();
  const ownLoan = current ? getBorrowerActiveLoan(current.id) : null;
  const canInitiate = canInitiateNewPret();

  if (pretLockMsg) {
    if (pendingVote) {
      const borrower = getMemberById(pendingVote.borrowerId);
      pretLockMsg.hidden = false;
      pretLockMsg.textContent = `Demande en vote pour ${borrower?.name || "un membre"} (${getPretStatusLabel(pendingVote.status).toLowerCase()}). Un nouveau prêt sera possible une fois accordé ou refusé.`;
    } else if (ownLoan) {
      pretLockMsg.hidden = false;
      pretLockMsg.textContent = `Vous avez déjà un prêt en cours (${getPretStatusLabel(ownLoan.status).toLowerCase()}).`;
    } else if (current && getAncienneTourneeDette(current.id) > 0) {
      pretLockMsg.hidden = false;
      pretLockMsg.textContent = `Tu as une dette d'ancienne tournée (${formatEuro(getAncienneTourneeDette(current.id))}). Rembourse-la avant de faire un prêt.`;
    } else {
      pretLockMsg.hidden = true;
    }
  }

  if (pretForm) {
    pretForm.querySelectorAll("input, button").forEach((el) => {
      el.disabled = !canInitiate;
    });
  }
}

function renderPretSummary() {
  if (!pretSummary) return;

  const caisseBrute = getCaisseBrute();
  const caisseDisponible = getCaisseDisponible();
  const borrowable = getBorrowableAmount();
  const activeLoans = prets.filter(
    (loan) => !isLoanDeleted(loan) && (loan.status === "active" || loan.status === "defaulted")
  );
  const activePretLabel = activeLoans.length === 1 ? "1 prêt" : `${activeLoans.length} prêts`;
  // Afficher le capital encore dû (prêt − déjà remboursé), pas le montant initial
  const activeLoansDetails = [...activeLoans]
    .sort((loanA, loanB) => {
      const nameA = getMemberById(loanA.borrowerId)?.name || "";
      const nameB = getMemberById(loanB.borrowerId)?.name || "";
      return nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
    })
    .map((loan) => {
      const restant = Math.max(0, (Number(loan.amount) || 0) - (Number(loan.totalRepaid) || 0));
      return `
      <span class="pret-active-detail-item">
        <span class="pret-active-detail-name">${escapeHtml(getMemberById(loan.borrowerId)?.name || "—")}</span>
        <span class="pret-active-detail-amount">${formatEuro(restant)}</span>
      </span>
    `;
    })
    .join("");

  const fond = getFondCaisse();

  const evenementsTotal = getTotalEvenementsInCaisse();
  const donsTotal = getTotalAutreArgent();
  const amendesTotal = getTotalAmendesInCaisse();
  const loansOut = getLoansCapitalOut();
  const horsGroupe = getCapitalHorsGroupeTotal();
  const totalOut = getTotalCapitalOut();
  const loansImpact = getLoansCashImpact();
  const horsItems = capitalHorsGroupe
    .filter((e) => e && !e.deletedAt)
    .map(
      (e) => `
      <span class="pret-active-detail-item">
        <span class="pret-active-detail-name">${escapeHtml(e.label || "Ex-membre")}</span>
        <span class="pret-active-detail-amount">${formatEuro(e.amount)}</span>
      </span>`
    )
    .join("");

  const fondCard = canViewFondCaisse()
    ? `<div class="pret-summary-card">
        <span class="pret-summary-label">Fond de caisse de départ</span>
        <strong>${formatEuro(fond)}</strong>
      </div>`
    : "";

  // La demande de vote est uniquement en haut de page (pretVotingList), pas ici
  pretSummary.innerHTML = `
    <div class="pret-summary-card pret-summary-main">
      <span class="pret-summary-label">Argent empruntable</span>
      <strong class="pret-summary-amount">${formatEuro(borrowable)}</strong>
      <span class="pret-summary-formula">(Caisse disponible − ${formatEuro(CAISSE_RESERVE)}) ÷ 2</span>
    </div>
    <div class="pret-summary-card">
      <span class="pret-summary-label">Caisse disponible</span>
      <strong>${formatEuro(caisseDisponible)}</strong>
      <span class="pret-summary-formula">Amendes + dons − prêts sortis + remboursements</span>
    </div>
    <div class="pret-summary-card">
      <span class="pret-summary-label">Caisse brute</span>
      <strong>${formatEuro(caisseBrute)}</strong>
      <span class="pret-summary-formula">Caisse disponible + événements (${formatEuro(evenementsTotal)})</span>
    </div>
    <div class="pret-summary-card pret-summary-out">
      <span class="pret-summary-label">Prêts sortis${activeLoans.length ? ` · ${activePretLabel}` : ""}</span>
      <strong class="pret-summary-amount">${formatEuro(loansOut)}</strong>
      <span class="pret-summary-formula">Capital encore dehors (prêt − remboursé)</span>
      ${activeLoans.length ? `<div class="pret-active-details">${activeLoansDetails}</div>` : ""}
    </div>
    ${fondCard}
    <div class="pret-summary-card pret-summary-total">
      <span class="pret-summary-label">Caisse total</span>
      <strong class="pret-summary-amount">${formatEuro(getCaisseTotal())}</strong>
      <span class="pret-summary-formula">Caisse disponible ${formatEuro(caisseDisponible)} + dehors ${formatEuro(totalOut)}</span>
    </div>
  `;
}

function getUnreadPretNotificationCount(memberId) {
  return getPretNotificationsForMember(memberId).filter((notif) => !notif.read).length;
}

function updatePretTabBadge() {
  // Badge rouge désactivé : ne plus afficher de pastille sur l'onglet Prêt
  const pretsTab = document.querySelector('.tab[data-tab="prets"]');
  if (!pretsTab) return;
  pretsTab.querySelectorAll(".tab-badge").forEach((badge) => badge.remove());
}

function renderPretNotifications() {
  const current = getCurrentMember();
  if (!current || !pretNotificationsList) {
    if (pretNotificationsPanel) pretNotificationsPanel.hidden = true;
    if (pretNotificationsList) pretNotificationsList.innerHTML = "";
    return;
  }

  const mine = getPretNotificationsForMember(current.id)
    .filter((notif) => notif.memberId === current.id)
    .slice(0, 20);
  updatePretTabBadge();

  if (pretNotificationsPanel) {
    pretNotificationsPanel.hidden = mine.length === 0;
  }

  const clearAllBtn = document.getElementById("pretNotificationsClearBtn");
  if (clearAllBtn) clearAllBtn.hidden = mine.length === 0;

  pretNotificationsList.innerHTML = mine
    .map(
      (notif) => `
      <li class="pret-notif-item${notif.read ? "" : " pret-notif-unread"}" data-loan-id="${escapeHtml(notif.loanId || "")}" data-type="${escapeHtml(notif.type || "")}" data-admin="${escapeHtml(notif.admin || "")}">
        <div class="pret-notif-body">
          <p>${escapeHtml(notif.message)}</p>
          <span class="pret-notif-date">${formatDate(notif.createdAt.split("T")[0])}</span>
        </div>
        <button type="button" class="btn-secondary pret-notif-delete" data-id="${escapeHtml(notif.id)}" title="Supprimer cette notification">Supprimer</button>
      </li>
    `
    )
    .join("");
}

/** Financier, admin, ou poste avec accès Prêts dans Admin */
function canManagePretsActions() {
  return canDo("prets") || (typeof canDecidePrets === "function" && canDecidePrets());
}

function buildFinancierActions(loan, options = {}) {
  if (!canManagePretsActions()) return "";
  if (isLoanDeleted(loan)) return "";

  const { showDelete = true } = options;
  const canApproveReject = PENDING_FINANCIER_STATUSES.includes(loan.status);

  return `
    <div class="pret-financier-controls">
      ${
        canApproveReject
          ? `<button type="button" class="btn-primary btn-pret-approve" data-loan-id="${loan.id}">Oui — Accorder</button>
             <button type="button" class="btn-secondary btn-pret-reject" data-loan-id="${loan.id}">Refuser</button>`
          : ""
      }
      ${
        showDelete
          ? `<button type="button" class="btn-pret-delete" data-loan-id="${loan.id}">Supprimer</button>`
          : ""
      }
    </div>
  `;
}

function buildLoanCard(loan, mode) {
  const borrower = getMemberById(loan.borrowerId);
  const stats = getVoteStats(loan);
  const current = getCurrentMember();
  const dueDates = getLoanDueDates(loan);
  const balance = getLoanBalance(loan);

  let voteSection = "";
  if (mode === "voting") {
    const canVote = current && current.id !== loan.borrowerId;
    const votesMap = loan?.votes && typeof loan.votes === "object" ? loan.votes : {};
    const myVote = current ? votesMap[current.id] : null;
    voteSection = `
      <div class="pret-vote-stats">
        <span class="pret-stat pret-stat-yes">${stats.yesCount} Oui</span>
        <span class="pret-stat pret-stat-no">${stats.noCount} Non</span>
        <span class="pret-stat pret-stat-pending">${stats.pendingCount} en attente</span>
        <span class="pret-stat">Objectif : ${stats.voters.length}/${stats.voters.length} Oui</span>
      </div>
      <p class="pret-deadline">${formatRemainingTime(loan.deadlineAt)}</p>
      ${myVote ? `<p class="pret-my-vote">Votre vote : <strong>${myVote === "yes" ? "Oui" : "Non"}</strong></p>` : ""}
      ${canManagePretsActions() ? buildVotersBreakdownHtml(loan) : ""}
      ${
        canManagePretsActions()
          ? `<p class="pret-financier-msg">Vous pouvez accorder ce prêt à tout moment.</p>`
          : ""
      }
    `;
  }

  let financierSection = "";
  if (mode === "financier") {
    financierSection = `
      <p class="pret-financier-msg">
        ${
          loan.autoApprovedByTimeout
            ? "Délai de 24 h écoulé — accorder ou refuser."
            : loan.status === "voting"
              ? "Vote en cours — vous pouvez accorder à tout moment."
              : "Tous les membres ont voté Oui — à valider."
        }
      </p>
      <div class="pret-vote-stats">
        <span class="pret-stat pret-stat-yes">${stats.yesCount} Oui</span>
        <span class="pret-stat pret-stat-no">${stats.noCount} Non</span>
      </div>
      ${buildVotersBreakdownHtml(loan)}
      ${buildFinancierActions(loan)}
    `;
  }

  const financierControls =
    mode === "voting" || mode === "active" || mode === "history" ? buildFinancierActions(loan) : "";

  let activeSection = "";
  if (mode === "active") {
    const repaid = loan.totalRepaid || 0;
    const progress = Math.min(100, Math.round((repaid / loan.amount) * 100));
    activeSection = `
      <div class="pret-progress-wrap">
        <div class="pret-progress-bar"><span style="width:${progress}%"></span></div>
        <p>${formatEuro(repaid)} remboursé sur ${formatEuro(loan.amount + (loan.interestAmount || 0))}${loan.interestAmount ? ` (dont ${formatEuro(loan.interestAmount)} d'intérêts)` : ""}</p>
      </div>
      ${
        dueDates
          ? `<p class="pret-due-dates">${escapeHtml(formatLoanDueDatesLabel(loan))}</p>`
          : ""
      }
      ${
        canManagePretsActions()
          ? `<div class="pret-repay-form">
              <input type="number" class="pret-repay-input" data-loan-id="${loan.id}" min="0.5" step="0.5" max="${balance}" placeholder="Montant remboursé" inputmode="decimal" aria-label="Montant remboursé, reste ${formatEuro(balance)}" />
              <button type="button" class="btn-primary btn-pret-repay" data-loan-id="${loan.id}">Enregistrer remboursement</button>
            </div>`
          : ""
      }
      ${buildLoanRepaymentsBlock(loan)}
    `;
  }

  return `
    <article class="pret-loan-card pret-status-${loan.status}" id="loan-${escapeHtml(loan.id)}">
      <div class="pret-loan-head">
        <h3>${escapeHtml(borrower?.name || "Membre")} — ${formatEuro(loan.amount)}</h3>
        <span class="pret-loan-status">${getPretStatusLabel(loan.status)}</span>
      </div>
      ${loan.note ? `<p class="pret-loan-note">${escapeHtml(loan.note)}</p>` : ""}
      <p class="pret-loan-date">Demandé le ${formatDate(toDateInputValue(getLoanRequestDate(loan)))}</p>
      ${voteSection}
      ${financierSection}
      ${activeSection}
      ${
        mode === "active" && balance > 0
          ? `<p class="pret-balance">Reste à payer : <strong>${formatEuro(balance)}</strong></p>`
          : ""
      }
      ${mode === "history" ? buildLoanRepaymentsBlock(loan) : ""}
      ${financierControls}
    </article>
  `;
}

function getPretStatusLabel(status) {
  const labels = {
    voting: "En vote",
    awaiting_financier: "Attente Financier",
    active: "En cours",
    defaulted: "Retard + intérêts",
    rejected: "Refusé",
    completed: "Remboursé",
  };
  return labels[status] || status;
}

function renderPrets() {
  const current = getCurrentMember();
  if (!current) return;
  if (isUserEditingForm()) return;
  refreshFinancierPayBoxes();

  processLoanStatusUpdates();
  renderPretSummary();
  renderInitiatePretPanel();
  renderPretNotifications();

  const votingLoans = prets.filter((loan) => !isLoanDeleted(loan) && loan.status === "voting");
  // Mode vote : polling accéléré (400 ms) pour quasi temps réel
  if (typeof window.potoSetVotingSyncBoost === "function") {
    window.potoSetVotingSyncBoost(votingLoans.length > 0 || prets.some((l) => !isLoanDeleted(l) && l.status === "awaiting_financier"));
  }
  const awaitingLoans = prets.filter((loan) => !isLoanDeleted(loan) && loan.status === "awaiting_financier");

  const activeLoans = prets.filter(
    (loan) =>
      !isLoanDeleted(loan) &&
      ["active", "defaulted", "completed", "rejected"].includes(loan.status)
  );

  if (pretVotingList) {
    renderLedgerInto(pretVotingList, {
      noun: "demande",
      emptyMeta: "Aucune demande en vote",
      emptyText: "Aucune demande en vote.",
      rowIdPrefix: "loan",
      rows: votingLoans.map((loan) => loanToLedgerRow(loan, "voting")),
      heroActions: buildVotingHeroActionsHtml(votingLoans),
    });
  }

  if (financierPretPanel && pretFinancierList) {
    financierPretPanel.hidden = !canDecidePrets();
    renderLedgerInto(pretFinancierList, {
      noun: "demande",
      emptyMeta: "Aucune demande en attente",
      emptyText: "Aucune demande en attente.",
      rowIdPrefix: "loan",
      rows: awaitingLoans.map((loan) => loanToLedgerRow(loan, "financier")),
    });
  }

  if (pretActiveList) {
    const visibleActive = activeLoans.filter((loan) => {
      if (canDecidePrets()) return true;
      return loan.borrowerId === current.id;
    });

    if (pretActiveTitle) {
      pretActiveTitle.textContent = canDecidePrets() ? "Prêts en cours et historique" : "Mes prêts";
    }

    renderLedgerInto(pretActiveList, {
      noun: "prêt",
      emptyMeta: "Aucun prêt en cours",
      emptyText: "Aucun prêt pour le moment.",
      rowIdPrefix: "loan",
      rows: visibleActive
        .map((loan) =>
          loanToLedgerRow(
            loan,
            loan.status === "active" || loan.status === "defaulted" ? "history" : "history"
          )
        )
        .sort((a, b) => {
          if (a.settled !== b.settled) return a.settled ? 1 : -1;
          return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
        }),
    });
  }

  highlightLoanFromNotification();

  // Si l'admin regarde la gestion des prêts, rafraîchir aussi
  if (isAdminWorkspace() && activeAdminSub === "prets") {
    renderAdminPrets();
  }
}

function buildAdminRequestDateCell(loan) {
  const requestDate = getLoanRequestDate(loan);
  const label = formatAdaptiveDate(requestDate);
  if (!canManagePretsActions() || !loan) return escapeHtml(label);
  if (loanDateEditingId === loan.id) {
    const value = toDateInputValue(requestDate);
    return `<input type="date" class="pret-request-date-input" data-loan-id="${escapeHtml(loan.id)}" value="${escapeHtml(value)}" aria-label="Modifier la date de demande" />`;
  }
  return `<button type="button" class="pret-date-cell-btn" data-loan-id="${escapeHtml(loan.id)}">${escapeHtml(label)}</button>`;
}

function buildAdminPretActionsHtml(loan) {
  const balance = getLoanBalance(loan);
  const dueDates = getLoanDueDates(loan);
  const isOpen = loan.status === "active" || loan.status === "defaulted";
  // Accès admin/financier : supprimer aussi les prêts accordés, soldés ou refusés de l'historique
  const canDeleteHistory =
    canManagePretsActions() &&
    !isLoanDeleted(loan) &&
    ["active", "defaulted", "completed", "rejected"].includes(loan.status);
  return `
    <div class="amende-admin-actions">
      ${
        dueDates && isOpen
          ? `<p class="pret-due-dates">${escapeHtml(formatLoanDueDatesLabel(loan, true))}</p>`
          : ""
      }
      ${
        canManagePretsActions() && isOpen && balance > 0
          ? `<div class="pret-repay-form">
              <input type="number" class="pret-repay-input" data-loan-id="${loan.id}" min="0.5" step="0.5" max="${balance}" placeholder="Montant" inputmode="decimal" aria-label="Montant remboursé, reste ${formatEuro(balance)}" />
              <button type="button" class="btn-primary btn-pret-repay" data-loan-id="${loan.id}">Valider</button>
            </div>`
          : ""
      }
      ${buildLoanRepaymentsBlock(loan)}
      ${buildFinancierActions(loan, { showDelete: false })}
      ${
        canDeleteHistory
          ? `<button type="button" class="btn-pret-delete" data-loan-id="${escapeHtml(loan.id)}">Supprimer</button>`
          : ""
      }
    </div>
  `;
}


/** Boutons Oui / Non pour la bannière « Total à régler » (demandes en vote) */
function buildVotingHeroActionsHtml(loans) {
  const current = getCurrentMember();
  if (!current || !Array.isArray(loans) || !loans.length) return "";

  const blocks = loans
    .filter((loan) => loan && !isLoanDeleted(loan) && loan.status === "voting")
    .map((loan) => {
      if (loan.borrowerId === current.id) {
        return `<p class="pret-hero-vote-note">Ta demande — en attente des votes</p>`;
      }
      const votesMap = loan.votes && typeof loan.votes === "object" ? loan.votes : {};
      const myVote = votesMap[current.id];
      if (myVote === "yes" || myVote === "no") {
        return `<p class="pret-my-vote pret-hero-my-vote">Votre vote : <strong>${myVote === "yes" ? "Oui" : "Non"}</strong></p>`;
      }
      return `<div class="pret-vote-actions pret-vote-actions-hero" data-loan-id="${escapeHtml(loan.id)}">
        <button type="button" class="btn-pret-yes" data-loan-id="${escapeHtml(loan.id)}" data-vote="yes">Oui</button>
        <button type="button" class="btn-pret-no" data-loan-id="${escapeHtml(loan.id)}" data-vote="no">Non</button>
      </div>`;
    })
    .filter(Boolean);

  return blocks.join("");
}

function buildPretVoteActionsHtml(loan, mode) {
  const current = getCurrentMember();
  const stats = getVoteStats(loan);
  const canVote = current && current.id !== loan.borrowerId;
  const votesMap = loan?.votes && typeof loan.votes === "object" ? loan.votes : {};
  const myVote = current ? votesMap[current.id] : null;
  const votersList = buildVotersBreakdownHtml(loan);
  if (mode === "voting") {
    // Boutons Oui/Non : dans la bannière haut (Total à régler), pas ici
    return `
      <div class="amende-admin-actions">
        <p class="pret-vote-inline">${stats.yesCount} oui · ${stats.noCount} non · ${stats.pendingCount} en attente · ${formatRemainingTime(loan.deadlineAt)}</p>
        ${votersList}
        ${myVote ? `<p class="pret-my-vote">Votre vote : <strong>${myVote === "yes" ? "Oui" : "Non"}</strong></p>` : ""}
        ${buildFinancierActions(loan)}
      </div>`;
  }
  return `
    <div class="amende-admin-actions">
      <p class="pret-vote-inline">${stats.yesCount} oui · ${stats.noCount} non${loan.autoApprovedByTimeout ? " · délai dépassé" : ""}</p>
      ${votersList}
      ${buildFinancierActions(loan)}
    </div>`;
}

function loanToLedgerRow(loan, mode) {
  const repaid = Math.round((Number(loan.totalRepaid) || 0) * 100) / 100;
  const isRejected = loan.status === "rejected";
  const remaining = mode === "voting" || mode === "financier" || isRejected
    ? mode === "voting" || mode === "financier"
      ? Math.round((Number(loan.amount) || 0) * 100) / 100
      : 0
    : Math.round((getLoanBalance(loan) || 0) * 100) / 100;
  const original = Math.round((Number(loan.amount) || 0) * 100) / 100;
  const member = getMemberById(loan.borrowerId);
  const note = String(loan.note || "").trim();
  const settled = mode === "history" && (isRejected || loan.status === "completed" || remaining <= 0);
  let actions = "";
  if (mode === "voting" || mode === "financier") actions = buildPretVoteActionsHtml(loan, mode);
  else actions = buildAdminPretActionsHtml(loan);
  const chipClass =
    loan.status === "rejected" ? "is-rejected" : settled ? "is-paid" : "is-open";
  return {
    id: loan.id,
    domId: `loan-${loan.id}`,
    date: getLoanRequestDate(loan),
    type: "pret",
    detail: note ? `${member?.name || "—"} — ${note}` : member?.name || "—",
    original,
    repaid: mode === "voting" || mode === "financier" ? 0 : repaid,
    remaining,
    settled,
    statusLabel: getPretStatusLabel(loan.status),
    chipClass,
    actions,
    sortAt: getLoanRequestDate(loan),
  };
}

function buildAdminPretLedgerRows() {
  return prets
    .filter(
      (loan) =>
        !isLoanDeleted(loan) &&
        ["active", "defaulted", "completed", "rejected"].includes(loan.status)
    )
    .map((loan) => {
      const repaid = Math.round((Number(loan.totalRepaid) || 0) * 100) / 100;
      const isRejected = loan.status === "rejected";
      const remaining = isRejected ? 0 : Math.round((getLoanBalance(loan) || 0) * 100) / 100;
      const original = Math.round((Number(loan.amount) || 0) * 100) / 100;
      const member = getMemberById(loan.borrowerId);
      const note = String(loan.note || "").trim();
      const settled = isRejected || loan.status === "completed" || remaining <= 0;
      return {
        loan,
        id: loan.id,
        date: getLoanRequestDate(loan),
        type: "pret",
        detail: note ? `${member?.name || "—"} — ${note}` : member?.name || "—",
        original,
        repaid,
        remaining,
        settled,
        statusLabel: getPretStatusLabel(loan.status),
        sortAt: getLoanRequestDate(loan),
      };
    })
    .sort((a, b) => {
      if (a.settled !== b.settled) return a.settled ? 1 : -1;
      return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
    });
}

function renderAdminPretLedger(force = false) {
  if (isLoanDateEditing() && !force) return;

  const body = document.getElementById("adminPretActiveList");
  const foot = document.getElementById("adminPretTableFoot");
  const hero = document.getElementById("adminPretHero");
  if (!body) return;

  const rows = buildAdminPretLedgerRows();
  const total = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const openCount = rows.filter((row) => !row.settled).length;
  renderLedgerHero(hero, {
    total,
    openCount,
    noun: "prêt",
    emptyMeta: "Aucun prêt en cours",
  });

  if (!rows.length) {
    body.innerHTML = `<tr class="amende-empty-row"><td colspan="8">Aucun prêt pour le moment.</td></tr>`;
    if (foot) foot.innerHTML = "";
    return;
  }

  body.innerHTML = rows
    .map((row) => {
      const repaid = Number(row.repaid) || 0;
      const remaining = Number(row.remaining) || 0;
      const chipClass =
        row.loan.status === "rejected" ? "is-rejected" : row.settled ? "is-paid" : "is-open";
      return `
        <tr id="loan-${escapeHtml(row.id)}" class="${row.settled ? "is-settled" : ""}">
          <td class="amende-col-date" data-label="Date de demande">${buildAdminRequestDateCell(row.loan)}</td>
          <td class="amende-col-type" data-label="Type">${escapeHtml(getAmendeTypeLabel(row.type))}</td>
          <td class="amende-col-detail" data-label="Détail">${escapeHtml(row.detail || "—")}</td>
          <td class="num amende-col-amount" data-label="Montant">${formatEuro(row.original)}</td>
          <td class="num amende-col-paid ${repaid > 0 ? "num-paid" : ""}" data-label="Déjà versé">${repaid > 0 ? formatEuro(repaid) : "—"}</td>
          <td class="num amende-col-remain num-remain ${remaining <= 0 ? "is-zero" : ""}" data-label="Reste">${formatEuro(remaining)}</td>
          <td class="amende-col-status" data-label="Statut">
            <span class="amende-chip ${chipClass}">${escapeHtml(row.statusLabel)}</span>
          </td>
          <td class="amende-col-actions" data-label="Actions">${buildAdminPretActionsHtml(row.loan)}</td>
        </tr>`;
    })
    .join("");

  if (foot) {
    const remainingTotal = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
    const repaidTotal = rows.reduce((sum, row) => sum + (Number(row.repaid) || 0), 0);
    const originalTotal = rows.reduce((sum, row) => sum + (Number(row.original) || 0), 0);
    foot.innerHTML = `
      <tr>
        <td colspan="3">Total</td>
        <td class="num">${formatEuro(originalTotal)}</td>
        <td class="num num-paid">${formatEuro(repaidTotal)}</td>
        <td class="num num-remain">${formatEuro(remainingTotal)}</td>
        <td colspan="2"></td>
      </tr>`;
  }
  scheduleFitTables();
}

function renderAdminPrets() {
  if (!hasRoleTabAccess("prets")) return;
  if (isUserEditingForm()) return;

  processLoanStatusUpdates();

  const summaryEl = document.getElementById("adminPretSummary");
  const votingEl = document.getElementById("adminPretVotingList");
  const awaitEl = document.getElementById("adminPretFinancierList");

  const caisseDisponible = getCaisseDisponible();
  const borrowable = getBorrowableAmount();
  const activeLoansLive = prets.filter(
    (loan) => !isLoanDeleted(loan) && (loan.status === "active" || loan.status === "defaulted")
  );
  const votingLoans = prets.filter((loan) => !isLoanDeleted(loan) && loan.status === "voting");
  const awaitingLoans = prets.filter((loan) => !isLoanDeleted(loan) && loan.status === "awaiting_financier");

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="pret-summary-card pret-summary-main">
        <span class="pret-summary-label">Caisse disponible</span>
        <strong>${formatEuro(caisseDisponible)}</strong>
      </div>
      <div class="pret-summary-card">
        <span class="pret-summary-label">Empruntable max</span>
        <strong>${formatEuro(borrowable)}</strong>
      </div>
      <div class="pret-summary-card">
        <span class="pret-summary-label">Prêts en cours</span>
        <strong>${activeLoansLive.length}</strong>
      </div>
      <div class="pret-summary-card">
        <span class="pret-summary-label">En vote / à valider</span>
        <strong>${votingLoans.length + awaitingLoans.length}</strong>
      </div>
    `;
  }

  if (votingEl) {
    renderLedgerInto(votingEl, {
      noun: "demande",
      emptyMeta: "Aucune demande en vote",
      emptyText: "Aucune demande en vote.",
      rowIdPrefix: "loan",
      rows: votingLoans.map((loan) => loanToLedgerRow(loan, "voting")),
      heroActions: buildVotingHeroActionsHtml(votingLoans),
    });
  }

  if (awaitEl) {
    renderLedgerInto(awaitEl, {
      noun: "demande",
      emptyMeta: "Aucune demande en attente",
      emptyText: "Aucune demande en attente de validation.",
      rowIdPrefix: "loan",
      rows: awaitingLoans.map((loan) => loanToLedgerRow(loan, "financier")),
    });
  }

  renderAdminPretLedger();
}


let auditLog = [];

function loadAuditLog() {
  const parsed = readSynced(AUDIT_LOG_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveAuditLog() {
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLog.slice(0, AUDIT_LOG_MAX)));
}

/** Journal des actions désactivé pour le moment (aucune trace enregistrée) */
function logAudit(action, detail = "") {
  return;
}

function loadLoginLog() {
  try {
    const parsed = readSynced(LOGIN_LOG_KEY, []);
    loginLog = Array.isArray(parsed) ? parsed : [];
  } catch {
    loginLog = [];
  }
  return loginLog;
}

function saveLoginLog() {
  try {
    localStorage.setItem(LOGIN_LOG_KEY, JSON.stringify(loginLog.slice(0, LOGIN_LOG_MAX)));
  } catch (err) {
    console.warn("login log save:", err);
  }
}

function recordLoginSession(member) {
  if (!member?.id && !member?.name) return;
  const now = new Date();
  const entry = {
    id: typeof generateId === "function" ? generateId() : String(Date.now()),
    memberId: member.id || null,
    memberName: member.name || "—",
    at: now.toISOString(),
    day: now.toISOString().slice(0, 10),
  };
  loadLoginLog();
  // Évite double enregistrement à quelques secondes d'intervalle
  const recent = loginLog.find(
    (r) =>
      r.memberId === entry.memberId &&
      r.day === entry.day &&
      Math.abs(new Date(r.at).getTime() - now.getTime()) < 60_000
  );
  if (recent) return;
  loginLog.unshift(entry);
  if (loginLog.length > LOGIN_LOG_MAX) loginLog = loginLog.slice(0, LOGIN_LOG_MAX);
  saveLoginLog();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
}

function getLoginLogForDay(day) {
  loadLoginLog();
  const d = String(day || "").slice(0, 10);
  return loginLog
    .filter((r) => (r.day || (r.at || "").slice(0, 10)) === d)
    .sort((a, b) => new Date(b.at) - new Date(a.at));
}

function formatLoginTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "—";
  }
}

function renderLoginLog() {
  const list = document.getElementById("loginLogList");
  const meta = document.getElementById("loginLogMeta");
  const dateInput = document.getElementById("loginLogDate");
  if (!list) return;
  if (!(isLoggedIn() && isOwnerMember(getCurrentMember()))) {
    list.innerHTML = `<p class="panel-desc">Accès réservé.</p>`;
    return;
  }
  let day = dateInput?.value;
  if (!day) {
    day = new Date().toISOString().slice(0, 10);
    if (dateInput) dateInput.value = day;
  }
  const rows = getLoginLogForDay(day);
  if (meta) {
    meta.textContent = rows.length
      ? `${rows.length} connexion${rows.length > 1 ? "s" : ""} le ${day.split("-").reverse().join("/")}`
      : `Aucune connexion enregistrée le ${day.split("-").reverse().join("/")}`;
  }
  if (!rows.length) {
    list.innerHTML = `<p class="panel-desc">Personne ne s'est connecté ce jour-là (ou pas encore de données).</p>`;
    return;
  }
  list.innerHTML = `
    <div class="amende-table-wrap login-log-wrap">
      <table class="amende-table login-log-table">
        <thead>
          <tr>
            <th>Heure</th>
            <th>Membre</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>
            <td>${escapeHtml(formatLoginTime(r.at))}</td>
            <td>${escapeHtml(r.memberName || "—")}</td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}


function renderAuditLog() {
  const list = document.getElementById("auditLogList");
  if (!list) return;
  list.innerHTML = "";
  const panel = document.getElementById("auditLogPanel");
  if (panel) panel.hidden = true;
  return;
  if (!auditLog.length) {
    list.innerHTML = `<p class="panel-desc">Aucune action enregistrée pour le moment.</p>`;
    return;
  }
  list.innerHTML = `
    <div class="amende-table-wrap audit-log-wrap">
      <table class="amende-table audit-log-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Par</th>
            <th>Action</th>
            <th>Détail</th>
          </tr>
        </thead>
        <tbody>
          ${auditLog
            .slice(0, 100)
            .map((row) => {
              const dateLabel =
                typeof formatAdaptiveDate === "function"
                  ? formatAdaptiveDate(row.at)
                  : formatDate((row.at || "").split("T")[0]);
              return `<tr>
                <td data-label="Date">${escapeHtml(dateLabel || "—")}</td>
                <td data-label="Par">${escapeHtml(row.actorName || "—")}</td>
                <td data-label="Action">${escapeHtml(row.action || "—")}</td>
                <td data-label="Détail">${escapeHtml(row.detail || "—")}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function loadEvenements() {
  const parsed = readSynced(EVENEMENTS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveEvenements(shouldRender = true) {
  // Horodatage global pour la fusion serveur
  const stamp = new Date().toISOString();
  evenements.forEach((evt) => {
    if (evt && typeof evt === "object" && !evt.updatedAt) evt.updatedAt = evt.createdAt || stamp;
  });
  localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));
  bumpLiveDataRevision();
  const flush = window.potoFlushSync || window.flushPotoServerSync;
  if (typeof flush === "function") {
    Promise.resolve(flush()).catch(() => {});
  }
  if (shouldRender) {
    renderEvenements();
    renderPrets();
    if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
    if (typeof renderFinance === "function") {
      try { renderFinance(); } catch { /* ignore */ }
    }
  }
}

function getEvenementTypeLabel(typeId) {
  return EVENEMENT_TYPES.find((t) => t.id === typeId)?.label || typeId;
}

/**
 * Peut gérer les événements (créer, paiements, remboursement).
 * UI de gestion uniquement dans Admin → Événements (onglet public en lecture seule).
 */
function canManageEvenements() {
  return canDo("evenements");
}

function getEvenementById(id) {
  return evenements.find((evt) => evt.id === id);
}

function getEvenementShare(evt) {
  return evt.sharePerMember || 0;
}

function getEvenementBeneficiaryId(evt) {
  return evt.beneficiaryMemberId || null;
}

function isEvenementBeneficiary(evt, memberId) {
  const beneficiaryId = getEvenementBeneficiaryId(evt);
  return Boolean(beneficiaryId && beneficiaryId === memberId);
}

function getEvenementCotisantCount(evt) {
  const beneficiaryId = getEvenementBeneficiaryId(evt);
  return beneficiaryId ? Math.max(members.length - 1, 0) : members.length;
}

function isEvenementPaid(evt, memberId) {
  if (isEvenementBeneficiary(evt, memberId)) return false;
  return Boolean(evt.payments?.[memberId]?.paid);
}

function getEvenementPaidCount(evt) {
  return members.filter(
    (member) => !isEvenementBeneficiary(evt, member.id) && isEvenementPaid(evt, member.id)
  ).length;
}

function getEvenementUnpaidMembers(evt) {
  return getSortedMembers().filter(
    (member) => !isEvenementBeneficiary(evt, member.id) && !isEvenementPaid(evt, member.id)
  );
}

function createEvenementDebts(evt) {
  // Les impayés d'événements restent dans l'onglet Événements (pas de ligne "dette" séparée).
  // On ne crée plus d'amende type "dette" pour éviter les doublons admin / synchro.
  return [];
}

function showEvenementSaveMessage(text, type = "success") {
  const targets = [evenementSaveMsg, document.getElementById("evenementSaveMsgPublic")].filter(Boolean);
  if (!targets.length) return;
  targets.forEach((el) => {
    el.textContent = text;
    el.className = `save-msg save-msg-${type}`;
    el.hidden = false;
  });
}

function createEvenement(title, shareAmount, description, beneficiaryMemberId) {
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent créer un événement.");
    return;
  }

  if (members.length === 0) {
    alert("Aucun membre enregistré.");
    return;
  }

  if (!beneficiaryMemberId) {
    alert("Sélectionnez le poto concerné par l'événement.");
    return;
  }

  const beneficiary = getMemberById(beneficiaryMemberId);
  if (!beneficiary) {
    alert("Membre invalide.");
    return;
  }

  const cotisantCount = members.length - 1;
  if (cotisantCount <= 0) {
    alert("Il faut au moins 2 membres pour créer un événement.");
    return;
  }

  const sharePerMember = Math.round(parseFloat(shareAmount) * 100) / 100;
  if (Number.isNaN(sharePerMember) || sharePerMember <= 0) {
    alert("Montant invalide.");
    return;
  }

  const current = getCurrentMember();
  const totalAmount = Math.round(sharePerMember * cotisantCount * 100) / 100;
  const payments = {};

  members.forEach((member) => {
    if (member.id !== beneficiaryMemberId) {
      payments[member.id] = { paid: false, paidAt: null, validatedBy: null };
    }
  });

  evenements.unshift({
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    beneficiaryMemberId,
    totalAmount,
    sharePerMember,
    memberCount: cotisantCount,
    payments,
    createdAt: new Date().toISOString(),
    createdBy: current?.id || null,
  });

  saveEvenements();
  evenementForm?.reset();
  document.getElementById("evenementFormPublic")?.reset();
  showEvenementSaveMessage(
    `Événement créé pour ${beneficiary.name} — ${formatEuro(sharePerMember)} par cotisant (total ${formatEuro(totalAmount)}).`
  );
}

function parseEvenementPaymentAmount(value) {
  const parsed = Math.round(parseFloat(value) * 100) / 100;
  if (Number.isNaN(parsed) || parsed <= 0) {
    alert("Montant invalide.");
    return null;
  }
  return parsed;
}

function setEvenementMemberPayment(evt, memberId, paidAmount) {
  if (!evt.payments) evt.payments = {};
  if (!evt.payments[memberId]) {
    evt.payments[memberId] = { paid: false, paidAt: null, validatedBy: null };
  }

  evt.payments[memberId] = {
    ...evt.payments[memberId],
    paid: true,
    paidAt: new Date().toISOString(),
    validatedBy: getCurrentMember()?.id || null,
    paidAmount,
  };

  delete evt.payments[memberId].convertedToDebt;
  delete evt.payments[memberId].debtCreatedAt;
  evt.updatedAt = new Date().toISOString();
}


async function markAllEvenementPaid(eventId) {
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent valider les paiements.");
    return;
  }
  const evt = getEvenementById(eventId);
  if (!evt) return;
  if (isEvenementClosed(evt) || isEvenementReimbursed(evt)) {
    alert("Cet événement est clôturé ou déjà remboursé.");
    return;
  }
  const share = getEvenementShare(evt);
  const unpaid = getSortedMembers().filter(
    (m) => !isEvenementBeneficiary(evt, m.id) && !isEvenementPaid(evt, m.id)
  );
  if (!unpaid.length) {
    alert("Tout le monde a déjà payé.");
    return;
  }
  const names = unpaid.map((m) => m.name).join(", ");
  if (
    !(await appConfirm(
      `Marquer ${unpaid.length} poto(s) comme payés à ${formatEuro(share)} chacun ?\n\n${names}`,
      "Paiement groupé"
    ))
  ) {
    return;
  }
  unpaid.forEach((m) => setEvenementMemberPayment(evt, m.id, share));
  logAudit(
    "Événement · paiement groupé",
    `${unpaid.length} paiements · ${evt.title} · ${formatEuro(share)}`
  );
  saveEvenements();
  showEvenementSaveMessage(
    `${unpaid.length} paiement(s) validés à ${formatEuro(share)}. Collecté : ${formatEuro(getEvenementCollectedAmount(evt))}.`
  );
}

function validateEvenementPayment(eventId, memberId, amountValue) {
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent valider un paiement.");
    return;
  }

  const evt = getEvenementById(eventId);
  const member = getMemberById(memberId);
  if (!evt || !member) return;

  if (isEvenementClosed(evt)) {
    alert("Cet événement est clôturé.");
    return;
  }

  if (isEvenementReimbursed(evt)) {
    alert("Cet événement a déjà été remboursé au poto.");
    return;
  }

  if (isEvenementBeneficiary(evt, memberId)) return;

  const defaultAmount = getEvenementShare(evt);
  const paidAmount = parseEvenementPaymentAmount(
    amountValue === undefined || amountValue === "" ? defaultAmount : amountValue
  );
  if (paidAmount === null) return;

  setEvenementMemberPayment(evt, memberId, paidAmount);

  logAudit(
    "Événement · paiement",
    `${member.name} a payé ${formatEuro(paidAmount)} — ${evt.title}`
  );
  saveEvenements();
  const potoReceivable = getEvenementPotoReceivable(evt);
  const extra =
    paidAmount > defaultAmount
      ? ` (+${formatEuro(paidAmount - defaultAmount)} de plus que les ${formatEuro(defaultAmount)} de cotisation)`
      : "";
  showEvenementSaveMessage(
    `Paiement validé pour ${member.name} — ${formatEuro(paidAmount)} enregistré${extra}. À percevoir par le poto : ${formatEuro(potoReceivable)}.`
  );
}

function updateEvenementPayment(eventId, memberId, amountValue) {
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent modifier un paiement.");
    return;
  }

  const evt = getEvenementById(eventId);
  const member = getMemberById(memberId);
  if (!evt || !member || !isEvenementPaid(evt, memberId)) return;

  if (isEvenementClosed(evt)) {
    alert("Cet événement est clôturé.");
    return;
  }

  if (isEvenementReimbursed(evt)) {
    alert("Cet événement a déjà été remboursé au poto.");
    return;
  }

  const paidAmount = parseEvenementPaymentAmount(amountValue);
  if (paidAmount === null) return;

  const previousAmount = getEvenementPaidAmount(evt, memberId);
  setEvenementMemberPayment(evt, memberId, paidAmount);

  saveEvenements();
  showEvenementSaveMessage(
    `Paiement de ${member.name} modifié : ${formatEuro(previousAmount)} → ${formatEuro(paidAmount)}. À percevoir par le poto : ${formatEuro(getEvenementPotoReceivable(evt))}.`
  );
}

function cancelEvenementPayment(eventId, memberId) {
  if (!canManageEvenements()) return;

  const evt = getEvenementById(eventId);
  const member = getMemberById(memberId);
  if (!evt || !member || !evt.payments[memberId]) return;

  if (isEvenementClosed(evt)) {
    alert("Cet événement est clôturé.");
    return;
  }

  if (isEvenementReimbursed(evt)) {
    alert("Cet événement a déjà été remboursé au poto.");
    return;
  }

  const previousAmount = getEvenementPaidAmount(evt, memberId);

  evt.payments[memberId] = {
    paid: false,
    paidAt: null,
    validatedBy: null,
    paidAmount: null,
  };

  if (evt) evt.updatedAt = new Date().toISOString();
  logAudit("Événement · annulation paiement", member?.name || memberId);
  saveEvenements();
  showEvenementSaveMessage(
    `Paiement annulé pour ${member.name}${previousAmount > 0 ? ` (${formatEuro(previousAmount)} retiré de la caisse)` : ""}.`
  );
}

async function closeEvenement(eventId) {
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent clôturer un événement.");
    return;
  }

  const evt = getEvenementById(eventId);
  if (!evt || isEvenementClosed(evt)) return;

  if (!isEvenementReimbursed(evt)) {
    alert("Remboursez d'abord le poto avant de clôturer l'événement.");
    return;
  }

  if (!(await appConfirm(`Clôturer « ${evt.title} » ?\nIl sera rangé discrètement sur le côté.`))) return;

  evt.closed = true;
  evt.closedAt = new Date().toISOString();
  evt.closedBy = getCurrentMember()?.id || null;

  saveEvenements();
  showEvenementSaveMessage(`Événement « ${evt.title} » clôturé.`);
}

async function reimburseEvenementToBeneficiary(eventId) {
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent rembourser le poto.");
    return;
  }

  const evt = getEvenementById(eventId);
  if (!evt || isEvenementReimbursed(evt)) return;

  const collected = getEvenementCollectedAmount(evt);
  const unpaidMembers = getEvenementUnpaidMembers(evt);
  const share = getEvenementShare(evt);
  const unpaidTotal = unpaidMembers.length * share;

  if (collected <= 0 && unpaidMembers.length === 0) {
    alert("Aucun paiement collecté et aucune cotisation en attente.");
    return;
  }

  const beneficiary = getMemberById(getEvenementBeneficiaryId(evt));
  let confirmMsg = collected > 0
    ? `Rembourser ${formatEuro(collected)} au poto ${beneficiary?.name || ""} ?\nCe montant sera déduit de la caisse brute.`
    : `Finaliser l'événement pour ${beneficiary?.name || "le poto"} ?\nAucun montant à rembourser (${formatEuro(0)} collecté).`;

  if (unpaidMembers.length > 0) {
    const names = unpaidMembers.map((member) => member.name).join(", ");
    confirmMsg += `\n\n${unpaidMembers.length} membre(s) n'ont pas payé (${formatEuro(unpaidTotal)}) :\n${names}\n→ dettes enregistrées dans Mes dettes et amendes.\n→ ${formatEuro(unpaidTotal)} déduit de la caisse brute et disponible.`;
  }

  if (!(await appConfirm(confirmMsg))) return;

  const debtMembers = createEvenementDebts(evt);

  evt.reimbursedToBeneficiary = true;
  evt.reimbursedAt = new Date().toISOString();
  evt.reimbursedBy = getCurrentMember()?.id || null;
  evt.reimbursedAmount = collected;
  evt.caisseDebtDeduction = unpaidTotal;

  saveAmendes(false);
  logAudit("Événement · remboursement", evt?.title || eventId);
  saveEvenements();

  let message = collected > 0
    ? `Remboursé ${formatEuro(collected)} à ${beneficiary?.name || "le poto"} — déduit de la caisse brute.`
    : `Événement finalisé pour ${beneficiary?.name || "le poto"}.`;

  if (debtMembers.length > 0) {
    message += ` ${debtMembers.length} dette(s) enregistrée(s) — ${formatEuro(unpaidTotal)} déduit de la caisse.`;
  }

  renderAmendes();
  showEvenementSaveMessage(message);
}

async function deleteEvenement(eventId) {
  if (!canDo("evenements")) {
    alert("Pas l'accès pour supprimer un événement.");
    return;
  }
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent supprimer un événement.");
    return;
  }

  const evt = getEvenementById(eventId);
  if (!evt) return;

  const relatedDettes = amendes.filter(
    (amende) => amende.evenementId === eventId
  );

  const confirmMsg = relatedDettes.length
    ? `Supprimer l'événement « ${evt.title} » ?\n\nIl disparaîtra chez tous les potos (en cours et paiements).\n${relatedDettes.length} dette(s) événement liée(s) seront aussi supprimées.`
    : `Supprimer l'événement « ${evt.title} » ?\n\nIl disparaîtra chez tous les potos là où il était en cours, y compris les paiements.`;

  if (!(await appConfirm(confirmMsg))) return;

  amendes = amendes.filter((amende) => amende.evenementId !== eventId);
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));

  evenements = evenements.filter((item) => item.id !== eventId);
  saveEvenements(false);
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }

  renderAmendes();
  renderEvenements();
  renderPrets();
  renderFinanceDashboard();

  const extra = relatedDettes.length
    ? ` ${relatedDettes.length} dette(s) liée(s) retirée(s).`
    : "";
  showEvenementSaveMessage(`Événement supprimé pour tout le groupe.${extra}`);
}

async function resetClosedEvenements() {
  if (!requireGroupAdmin("réinitialiser les événements clôturés")) return;

  const closedEvents = evenements.filter((evt) => isEvenementClosed(evt));
  if (closedEvents.length === 0) {
    alert("Aucun événement clôturé à réinitialiser.");
    return;
  }

  if (
    !(await appConfirm(
      `Supprimer définitivement ${closedEvents.length} événement(s) clôturé(s) ?\n\nLa colonne « Clôturés » sera vidée. Cette action est irréversible.`
    ))
  ) {
    return;
  }

  const closedIds = new Set(closedEvents.map((evt) => evt.id));

  amendes = amendes.filter(
    (amende) => !(isDetteAmende(amende) && amende.evenementId && closedIds.has(amende.evenementId))
  );
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));

  evenements = evenements.filter((evt) => !isEvenementClosed(evt));
  saveEvenements();
  renderAmendes();
  showEvenementSaveMessage(`${closedEvents.length} événement(s) clôturé(s) réinitialisé(s).`);
}

