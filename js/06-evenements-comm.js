function getMemberEvenementTotals(memberId) {
  let totalPaid = 0;
  let totalRemaining = 0;
  let cotisantEvents = 0;

  evenements.forEach((evt) => {
    if (isEvenementBeneficiary(evt, memberId)) return;

    const share = getEvenementShare(evt);

    cotisantEvents += 1;

    if (isEvenementPaid(evt, memberId)) {
      totalPaid += getEvenementPaidAmount(evt, memberId);
    } else {
      totalRemaining += share;
    }
  });

  return { totalPaid, totalRemaining, cotisantEvents };
}

function buildEvenementMemberSummary(member) {
  const { totalPaid, totalRemaining, cotisantEvents } = getMemberEvenementTotals(member.id);

  if (evenements.length === 0) return "";

  if (cotisantEvents === 0) {
    return `
      <div class="evenement-member-summary evenement-member-summary-exempt">
        <div class="evenement-summary-stat">
          <span>Total payé</span>
          <strong>—</strong>
        </div>
        <div class="evenement-summary-stat">
          <span>Reste à payer</span>
          <strong>—</strong>
        </div>
        <p class="evenement-summary-note">Vous êtes le poto concerné — vous ne cotisez pas.</p>
      </div>
    `;
  }

  return `
    <div class="evenement-member-summary">
      <div class="evenement-summary-stat evenement-summary-paid">
        <span>Total payé</span>
        <strong>${formatEuro(totalPaid)}</strong>
      </div>
      <div class="evenement-summary-stat evenement-summary-remaining">
        <span>Reste à payer</span>
        <strong>${formatEuro(totalRemaining)}</strong>
      </div>
    </div>
  `;
}

function buildEvenementMemberCard(evt, current) {
  const share = getEvenementShare(evt);
  const isCurrentBeneficiary = isEvenementBeneficiary(evt, current.id);
  const myPaid = isEvenementPaid(evt, current.id);
  const myPaidAmount = getEvenementPaidAmount(evt, current.id);
  const convertedToDebt =
    isEvenementReimbursed(evt) && Boolean(evt.payments?.[current.id]?.convertedToDebt);
  const beneficiary = getMemberById(getEvenementBeneficiaryId(evt));
  const potoReceivable = getEvenementPotoReceivable(evt);
  const reimbursed = isEvenementReimbursed(evt);

  return `
    <article class="evenement-card evenement-card-member" id="evenement-${escapeHtml(evt.id)}">
      <div class="evenement-head">
        <div>
          <h3>${escapeHtml(evt.title)}</h3>
          ${
            beneficiary
              ? `<p class="evenement-poto">Poto concerné : <strong>${escapeHtml(beneficiary.name)}</strong>${isCurrentBeneficiary ? ' <span class="tag-you">Vous</span>' : ""}</p>`
              : ""
          }
          ${evt.description ? `<p class="evenement-desc">${escapeHtml(evt.description)}</p>` : ""}
          <p class="evenement-meta">Créé le ${formatDate(evt.createdAt.split("T")[0])}</p>
          ${
            beneficiary
              ? `<p class="evenement-poto-receivable${reimbursed ? " evenement-poto-receivable-done" : ""}">
                  ${reimbursed ? "Perçu par le poto" : "À percevoir par le poto"} <strong>${escapeHtml(beneficiary.name)}</strong> :
                  <strong class="evenement-poto-receivable-amount">${formatEuro(potoReceivable)}</strong>
                </p>`
              : ""
          }
        </div>
      </div>
      <div class="evenement-my-contribution">
        ${
          isCurrentBeneficiary
            ? `<p class="evenement-contribution-label">Votre cotisation</p>
               <p class="evenement-my-status evenement-my-exempt">Vous ne cotisez pas</p>`
            : convertedToDebt
              ? `<p class="evenement-contribution-label">Votre cotisation</p>
                 <div class="evenement-contribution-amount">
                   <strong>${formatEuro(share)}</strong>
                   <span class="evenement-status evenement-debt">Dette</span>
                 </div>
                 <p class="evenement-debt-note">Voir le détail dans l'onglet Mes dettes.</p>`
              : `<p class="evenement-contribution-label">Votre cotisation</p>
                 <div class="evenement-contribution-amount">
                   <strong>${formatEuro(share)}</strong>
                   <span class="evenement-status ${myPaid ? "evenement-paid" : "evenement-unpaid"}">
                     ${
                       myPaid
                         ? `Payé ${formatEuro(myPaidAmount)}${myPaidAmount > share ? " +" : ""}`
                         : "À payer"
                     }
                   </span>
                 </div>
                 ${
                   myPaid && myPaidAmount > share
                     ? `<p class="evenement-extra-note">+${formatEuro(myPaidAmount - share)} de plus que la cotisation.</p>`
                     : ""
                 }`
        }
      </div>
    </article>
  `;
}

function buildEvenementPaymentActions(evt, member, canManage, reimbursed) {
  if (!canManage || reimbursed || isEvenementBeneficiary(evt, member.id)) return "—";

  const share = getEvenementShare(evt);
  const paid = isEvenementPaid(evt, member.id);
  const currentAmount = paid ? getEvenementPaidAmount(evt, member.id) : share;

  if (paid) {
    return `
      <div class="evenement-pay-actions">
        <label class="evenement-pay-label">
          Versé (€)
          <input
            type="number"
            class="evenement-pay-input"
            data-event-id="${evt.id}"
            data-member-id="${member.id}"
            min="0.5"
            step="0.5"
            value="${currentAmount}"
            title="Montant réellement versé — peut dépasser la cotisation de ${formatEuro(share)}"
          />
        </label>
        <button type="button" class="btn-secondary btn-evenement-edit-pay" data-event-id="${evt.id}" data-member-id="${member.id}">Modifier</button>
        <button type="button" class="btn-secondary btn-evenement-unpay" data-event-id="${evt.id}" data-member-id="${member.id}">Annuler</button>
      </div>
    `;
  }

  return `
    <div class="evenement-pay-actions">
      <label class="evenement-pay-label">
        Versé (€)
        <input
          type="number"
          class="evenement-pay-input"
          data-event-id="${evt.id}"
          data-member-id="${member.id}"
          min="0.5"
          step="0.5"
          value="${share}"
          placeholder="${share}"
          title="Saisissez le montant réel — ex. 20 si la cotisation est 10"
        />
      </label>
      <button type="button" class="btn-primary btn-evenement-pay" data-event-id="${evt.id}" data-member-id="${member.id}">Valider</button>
    </div>
  `;
}

function buildEvenementManagerCard(evt, current) {
  const canManage = canManageEvenements();
  const paidCount = getEvenementPaidCount(evt);
  const cotisantCount = getEvenementCotisantCount(evt);
  const share = getEvenementShare(evt);
  const beneficiary = getMemberById(getEvenementBeneficiaryId(evt));

  const reimbursed = isEvenementReimbursed(evt);

  // Cotisants uniquement (hors bénéficiaire)
  const cotisants = getSortedMembers().filter((m) => !isEvenementBeneficiary(evt, m.id));
  const unpaidMembers = cotisants.filter((m) => {
    if (reimbursed && evt.payments?.[m.id]?.convertedToDebt) return false;
    return !isEvenementPaid(evt, m.id);
  });
  const paidMembers = cotisants.filter((m) => isEvenementPaid(evt, m.id));

  const unpaidOptions = unpaidMembers
    .map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)}</option>`)
    .join("");
  const paidOptions = paidMembers
    .map((m) => {
      const amt = getEvenementPaidAmount(evt, m.id);
      return `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)} — ${formatEuro(amt)}</option>`;
    })
    .join("");

  const paidChips = paidMembers.length
    ? paidMembers
        .map((m) => {
          const amt = getEvenementPaidAmount(evt, m.id);
          return `<span class="evenement-paid-chip">${escapeHtml(m.name)} · ${formatEuro(amt)}</span>`;
        })
        .join("")
    : `<span class="evenement-paid-empty">Personne n'a encore payé</span>`;

  const paymentPanel = canManage && !reimbursed
    ? `
      <div class="evenement-pay-panel">
        <div class="evenement-pay-block">
          <div class="evenement-pay-row">
            <label class="evenement-pay-select-label">
              Poto
              <select class="evenement-pay-select" data-event-id="${escapeHtml(evt.id)}" data-role="pay">
                <option value="">— Choisir —</option>
                ${unpaidOptions || '<option value="" disabled>Tous ont payé</option>'}
              </select>
            </label>
            <label class="evenement-pay-label">
              Versé (€)
              <input type="number" class="evenement-pay-input evenement-pay-input-single" data-event-id="${escapeHtml(evt.id)}" min="0.5" step="0.5" value="${share}" placeholder="${share}" />
            </label>
            <button type="button" class="btn-primary btn-evenement-pay-selected" data-event-id="${escapeHtml(evt.id)}">Valider</button>
            ${
              unpaidMembers.length > 0
                ? `<button type="button" class="btn-secondary btn-evenement-pay-all" data-event-id="${escapeHtml(evt.id)}" title="Marquer tous les impayés à ${formatEuro(share)}">
                    Tous payés (${unpaidMembers.length})
                  </button>`
                : ""
            }
          </div>
        </div>
        ${
          paidMembers.length
            ? `<div class="evenement-pay-block evenement-pay-block-paid">
                <div class="evenement-paid-chips">${paidChips}</div>
                <div class="evenement-pay-row">
                  <label class="evenement-pay-select-label">
                    Annuler
                    <select class="evenement-pay-select" data-event-id="${escapeHtml(evt.id)}" data-role="unpay">
                      <option value="">— Choisir —</option>
                      ${paidOptions}
                    </select>
                  </label>
                  <button type="button" class="btn-secondary btn-evenement-unpay-selected" data-event-id="${escapeHtml(evt.id)}">Annuler</button>
                </div>
              </div>`
            : ""
        }
      </div>`
    : canManage && reimbursed
      ? `<div class="evenement-pay-panel"><p class="panel-desc">Événement remboursé — paiements figés.</p>
          <div class="evenement-paid-chips">${paidChips}</div></div>`
      : `<div class="evenement-pay-panel"><div class="evenement-paid-chips">${paidChips}</div></div>`;

  const collected = getEvenementCollectedAmount(evt);
  const potoReceivable = getEvenementPotoReceivable(evt);
  const potoBonus = Math.max(0, Math.round((collected - evt.totalAmount) * 100) / 100);
  const inCaisse = reimbursed ? 0 : collected;
  const unpaidCount = getEvenementUnpaidMembers(evt).length;

  const beneficiaryMeta = beneficiary
    ? `Pour <strong>${escapeHtml(beneficiary.name)}</strong> · `
    : "";

  return `
    <article class="evenement-card evenement-card-admin" id="admin-evenement-${escapeHtml(evt.id)}">
      <div class="evenement-head">
        <div>
          ${evt.type ? `<span class="evenement-type-badge type-${evt.type}">${escapeHtml(getEvenementTypeLabel(evt.type))}</span>` : ""}
          <h3>${escapeHtml(evt.title)}</h3>
          ${evt.description ? `<p class="evenement-desc">${escapeHtml(evt.description)}</p>` : ""}
          <p class="evenement-meta">Créé le ${formatDate(evt.createdAt.split("T")[0])} · ${beneficiaryMeta}${paidCount}/${cotisantCount} ont payé${reimbursed ? " · Remboursé au poto" : ""}</p>
        </div>
        ${
          canManage
            ? `<button type="button" class="btn-pret-delete btn-evenement-delete" data-event-id="${evt.id}">Supprimer</button>`
            : ""
        }
      </div>
      <div class="evenement-totals">
        <div class="evenement-totals-poto">
          <span>${reimbursed ? "Perçu par le poto" : "À percevoir par le poto"}</span>
          <strong>${formatEuro(potoReceivable)}</strong>
          ${beneficiary ? `<span class="evenement-poto-receivable-name">${escapeHtml(beneficiary.name)}</span>` : ""}
          ${
            !reimbursed && potoBonus > 0
              ? `<span class="evenement-poto-bonus">+${formatEuro(potoBonus)} de dons en plus (objectif ${formatEuro(evt.totalAmount)})</span>`
              : ""
          }
        </div>
        <div><span>Objectif cotisations</span><strong>${formatEuro(evt.totalAmount)}</strong></div>
        <div><span>Par cotisant</span><strong>${formatEuro(share)}</strong></div>
        <div><span>Collecté</span><strong>${formatEuro(collected)}</strong></div>
        <div><span>En caisse</span><strong>${formatEuro(inCaisse)}</strong></div>
      </div>
      ${
        canManage && !reimbursed && (collected > 0 || unpaidCount > 0)
          ? `<div class="evenement-reimburse-row">
              <p>${
                collected > 0
                  ? `<strong>${formatEuro(potoReceivable)}</strong> → ${escapeHtml(beneficiary?.name || "poto")}`
                  : unpaidCount > 0
                    ? "0 collecté — impayés → dettes"
                    : "Finaliser"
              }</p>
              <button type="button" class="btn-primary btn-evenement-reimburse" data-event-id="${evt.id}">Rembourser</button>
            </div>`
          : ""
      }
      ${
        reimbursed
          ? canManage && !isEvenementClosed(evt)
            ? `<div class="evenement-close-row">
                <p class="evenement-reimbursed-msg">Remboursé au poto le ${formatDate(evt.reimbursedAt.split("T")[0])} — ${formatEuro(evt.reimbursedAmount || collected)}</p>
                <button type="button" class="btn-secondary btn-evenement-close" data-event-id="${evt.id}">Clôturer</button>
              </div>`
            : `<p class="evenement-reimbursed-msg">Remboursé au poto le ${formatDate(evt.reimbursedAt.split("T")[0])} — ${formatEuro(evt.reimbursedAmount || collected)} (déduit de la caisse brute)</p>`
          : ""
      }
      ${paymentPanel}
    </article>
  `;
}

function buildEvenementCard(evt, { manage = false } = {}) {
  const current = getCurrentMember();
  if (!current) return "";
  if (manage) return buildEvenementManagerCard(evt, current);
  return buildEvenementMemberCard(evt, current);
}

function buildEvenementClosedChip(evt) {
  const beneficiary = getMemberById(getEvenementBeneficiaryId(evt));
  const closedDate = evt.closedAt ? formatDate(evt.closedAt.split("T")[0]) : "";

  return `
    <div class="evenement-closed-chip" title="${escapeHtml(evt.title)}">
      <span class="evenement-closed-badge">Clôturé</span>
      <span class="evenement-closed-chip-title">${escapeHtml(evt.title)}</span>
      ${beneficiary ? `<span class="evenement-closed-chip-meta">${escapeHtml(beneficiary.name)}</span>` : ""}
      ${closedDate ? `<span class="evenement-closed-chip-date">${closedDate}</span>` : ""}
    </div>
  `;
}

function buildMemberEvenementLedgerRows(current) {
  return evenements
    .filter((evt) => !isEvenementClosed(evt))
    .map((evt) => {
      const share = getEvenementShare(evt);
      const isBen = isEvenementBeneficiary(evt, current.id);
      const convertedToDebt =
        isEvenementReimbursed(evt) && Boolean(evt.payments?.[current.id]?.convertedToDebt);
      const paid = isEvenementPaid(evt, current.id);
      const paidAmount = getEvenementPaidAmount(evt, current.id);
      if (isBen) {
        return {
          id: evt.id,
          domId: `evenement-${evt.id}`,
          date: evt.createdAt,
          type: evt.type || "evenement",
          typeLabel: getEvenementTypeLabel(evt.type) || "Événement",
          detail: evt.title || "Événement",
          original: 0,
          repaid: 0,
          remaining: 0,
          settled: true,
          statusLabel: "Exempt",
          chipClass: "is-paid",
        };
      }
      const hasOpenDette = amendes.some(
        (a) =>
          isDetteAmende(a) &&
          !isAmendeDeleted(a) &&
          a.evenementId === evt.id &&
          a.memberId === current.id &&
          (Number(a.amount) || 0) > 0
      );
      if (convertedToDebt && hasOpenDette) {
        return {
          id: evt.id,
          domId: `evenement-${evt.id}`,
          date: evt.createdAt,
          type: "dette",
          detail: evt.title || "Événement",
          original: share,
          repaid: 0,
          remaining: share,
          settled: false,
          statusLabel: "Dette",
          chipClass: "is-open",
          actions: `<p class="evenement-debt-note">Voir Dettes & amendes.</p>`,
        };
      }
      return {
        id: evt.id,
        domId: `evenement-${evt.id}`,
        date: evt.createdAt,
        type: evt.type || "evenement",
        typeLabel: getEvenementTypeLabel(evt.type) || "Événement",
        detail: evt.title || "Événement",
        original: share,
        repaid: paid ? paidAmount : 0,
        remaining: paid ? 0 : share,
        settled: paid,
        statusLabel: paid ? "Payé" : "À payer",
        chipClass: paid ? "is-paid" : "is-open",
        actions: "",
      };
    });
}

function buildAdminEvenementLedgerRows() {
  const canManage = canManageEvenements();
  const current = getCurrentMember();
  return evenements
    .filter((evt) => !isEvenementClosed(evt))
    .map((evt) => {
      const share = getEvenementShare(evt);
      const collected = getEvenementCollectedAmount(evt);
      const expected = Number(evt.totalAmount) || 0;
      const remaining = Math.max(0, Math.round((expected - collected) * 100) / 100);
      const reimbursed = isEvenementReimbursed(evt);
      const beneficiary = getMemberById(getEvenementBeneficiaryId(evt));
      const actions = `
        <div class="amende-admin-actions">
          ${
            canManage && !reimbursed
              ? `<button type="button" class="btn-primary btn-evenement-reimburse" data-event-id="${evt.id}">Rembourser au poto</button>`
              : ""
          }
          ${
            canManage && reimbursed && !isEvenementClosed(evt)
              ? `<button type="button" class="btn-secondary btn-evenement-close" data-event-id="${evt.id}">Clôturer</button>`
              : ""
          }
          ${
            canManage
              ? `<button type="button" class="btn-pret-delete btn-evenement-delete" data-event-id="${evt.id}">Supprimer</button>`
              : ""
          }
        </div>`;
      return {
        id: evt.id,
        domId: `admin-evenement-${evt.id}`,
        date: evt.createdAt,
        type: evt.type || "evenement",
        typeLabel: getEvenementTypeLabel(evt.type) || "Événement",
        detail: `${evt.title || "Événement"}${beneficiary ? ` — ${beneficiary.name}` : ""}`,
        original: expected,
        repaid: collected,
        remaining: reimbursed ? 0 : remaining,
        settled: reimbursed || remaining <= 0,
        statusLabel: reimbursed ? "Remboursé au poto" : remaining <= 0 ? "Collecté" : "En cours",
        chipClass: reimbursed || remaining <= 0 ? "is-paid" : "is-open",
        actions,
        extraRow: buildEvenementManagerCard(evt, current)
          .replace(/id="admin-evenement-[^"]+"/, "")
          .replace(/class="evenement-card"/, 'class="evenement-card evenement-card-embedded"'),
      };
    });
}

function renderEvenementListInto(listEl, { manage = false } = {}) {
  if (!listEl) return;
  const current = getCurrentMember();
  if (!current) return;

  if (evenements.length === 0) {
    listEl.innerHTML = `<p class="communication-empty">Aucun événement pour le moment.</p>`;
    return;
  }

  const closedEvents = evenements.filter((evt) => isEvenementClosed(evt));

  // Mode gestion : cartes complètes (paiements visibles aussi sur mobile)
  if (manage) {
    const openEvents = evenements.filter((evt) => !isEvenementClosed(evt));
    const cards = openEvents.map((evt) => buildEvenementManagerCard(evt, current)).join("");
    const closedHtml = closedEvents.length
      ? `<aside class="evenement-closed-aside" aria-label="Événements clôturés">
          <p class="evenement-closed-label">Clôturés</p>
          <div class="evenement-closed-list">
            ${closedEvents.map((evt) => buildEvenementClosedChip(evt)).join("")}
          </div>
        </aside>`
      : "";
    listEl.innerHTML =
      (cards || `<p class="communication-empty">Aucun événement en cours.</p>`) + closedHtml;
    return;
  }

  const rows = buildMemberEvenementLedgerRows(current);
  const ledger = buildLedgerSectionHtml({
    noun: manage ? "événement" : "cotisation",
    emptyMeta: manage ? "Aucun événement en cours" : "Rien à payer",
    emptyText: "Aucun événement en cours.",
    rowIdPrefix: manage ? "admin-evenement" : "evenement",
    rows,
  });
  const closedHtml = closedEvents.length
    ? `
      <aside class="evenement-closed-aside" aria-label="Événements clôturés">
        <p class="evenement-closed-label">Clôturés</p>
        <div class="evenement-closed-list">
          ${closedEvents.map((evt) => buildEvenementClosedChip(evt)).join("")}
        </div>
      </aside>
    `
    : "";

  listEl.innerHTML = `${ledger}${closedHtml}`;
}

function fillEvenementMemberSelect(selectEl) {
  if (!selectEl) return;
  const currentVal = selectEl.value;
  const options = ['<option value="">— Choisir le poto —</option>']
    .concat(
      getSortedMembers().map(
        (m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)}</option>`
      )
    )
    .join("");
  selectEl.innerHTML = options;
  if (currentVal && [...selectEl.options].some((o) => o.value === currentVal)) {
    selectEl.value = currentVal;
  }
}

function renderEvenements() {
  const current = getCurrentMember();
  if (!current) return;

  const canManage = canManageEvenements();
  // Onglet public Événements = lecture seule uniquement
  const createPublic = document.getElementById("evenementCreatePanelPublic");
  if (createPublic) createPublic.hidden = true;
  if (canManage) {
    fillEvenementMemberSelect(document.getElementById("evenementMember"));
  }
  if (addEvenementPanel) addEvenementPanel.hidden = !canManage;

  if (evenementListTitle) {
    evenementListTitle.textContent = `Mes événements — ${current.name}`;
  }
  if (evenementListSubtitle) {
    evenementListSubtitle.hidden = false;
    evenementListSubtitle.textContent =
      "Lecture seule. La création et les paiements se gèrent dans Admin → Événements.";
  }

  if (evenementMemberSummary) {
    evenementMemberSummary.hidden = true;
    evenementMemberSummary.innerHTML = "";
  }

  if (resetClosedEvenementsBtn) {
    const closedCount = evenements.filter((evt) => isEvenementClosed(evt)).length;
    resetClosedEvenementsBtn.hidden = !canManage || !isGroupAdmin() || closedCount === 0;
    resetClosedEvenementsBtn.textContent =
      closedCount > 0
        ? `Réinitialiser les clôturés (${closedCount})`
        : "Réinitialiser les clôturés";
  }

  // Public : lecture seule — Admin : gestion complète (cartes visibles aussi sur mobile)
  renderEvenementListInto(evenementList, { manage: false });
  renderEvenementListInto(document.getElementById("evenementAdminList"), { manage: canManage });
  refreshFinancierPayBoxes();
  scheduleFitTables();
}

function loadCommunicationPosts() {
  const parsed = readSynced(COMMUNICATION_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

async function saveCommunicationPosts() {
  localStorage.setItem(COMMUNICATION_KEY, JSON.stringify(communicationPosts));
  bumpLiveDataRevision();
  if (typeof potoFlushSync !== "function") return false;
  let ok = await potoFlushSync();
  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    ok = await potoFlushSync();
  }
  if (ok) communicationPosts = loadCommunicationPosts();
  return ok;
}

function loadCommunicationSubtab() {
  const stored = localStorage.getItem(COMMUNICATION_SUBTAB_KEY);
  if (COMMUNICATION_KINDS.some((kind) => kind.id === stored)) return stored;
  return "communique";
}

function getCommunicationKind(kindId) {
  return COMMUNICATION_KINDS.find((kind) => kind.id === kindId) || COMMUNICATION_KINDS[0];
}

function canPublishCommunication() {
  return canManageTab("communication");
}


const DEFAULT_GUIDE_ARTICLES = [
  {
    id: "guide-default-1",
    title: "1. Bienvenue — à quoi sert le site",
    body: "Poto Timide est l'espace privé du groupe : prêts, tournée, caisse, événements, amendes et communication. Chaque membre se connecte avec son compte. Les chiffres se synchronisent entre tous les appareils.",
    order: 1,
  },
  {
    id: "guide-default-2",
    title: "2. Réunion (tableau de bord)",
    body: "L'onglet Réunion résume l'essentiel : caisse disponible, max empruntable, votes en cours, prêts, événements, amendes et ex tournée. Le « Total à verser » est ce que TOI tu dois encore (événement + amende + ex tournée). Clique sur un KPI pour ouvrir la page concernée. Les Prêts renvoient vers Finance → Historique.",
    order: 2,
  },
  {
    id: "guide-default-3",
    title: "3. Membres & Bureau",
    body: "La liste des potos et le bureau. Un compteur affiche le nombre total de membres. Les « nouveaux » n'ont accès qu'à La loi tant qu'ils ne sont pas membres du groupe.",
    order: 3,
  },
  {
    id: "guide-default-4",
    title: "4. Tournée — réception et ristourne",
    body: "Planning septembre → juin : ordre de réception et ordre de ristourne. Un admin ou le financier peut mettre « OK » quand la personne a reçu sa tournée ou sa ristourne. Les OK se synchronisent sur tous les appareils.",
    order: 4,
  },
  {
    id: "guide-default-5",
    title: "5. Prêts et votes",
    body: "Pour demander un prêt : montant + motif obligatoire. Les membres votent Oui / Non. Quand le vote est clos et accepté, le prêt devient actif. Les remboursements se font chez le Financier. L'historique complet des prêts se trouve aussi dans Finance → Archives.",
    order: 5,
  },
  {
    id: "guide-default-6",
    title: "6. Événements",
    body: "Un événement a un titre, un montant par personne et un poto bénéficiaire. Chaque membre doit payer sa part. L'admin valide les paiements. Les impayés restent visibles jusqu'au règlement.",
    order: 6,
  },
  {
    id: "guide-default-7",
    title: "7. Dettes & amendes",
    body: "Amendes et dettes d'ex tournée sont gérées au même endroit. En admin : une ligne (personne + type + montant + motif obligatoire) pour ajouter. Les suppressions sont synchronisées. Les dettes d'événement se suivent dans l'onglet Événements.",
    order: 7,
  },
  {
    id: "guide-default-8",
    title: "8. Finance",
    body: "Tableau de bord de la caisse (disponible, totale, prêts dehors…). L'historique finance liste les mouvements et les prêts en lecture seule. La sous-partie Caisse est réservée aux personnes autorisées (financier / accès).",
    order: 8,
  },
  {
    id: "guide-default-9",
    title: "9. La loi",
    body: "Règlement du groupe en lecture seule pour tous. Recherche par mot : seules les phrases qui contiennent le mot s'affichent ; un clic ouvre l'article entier. Seuls les autorisés (Admin → Accès → La loi) peuvent ajouter, modifier ou supprimer des articles.",
    order: 9,
  },
  {
    id: "guide-default-10",
    title: "10. Communication",
    body: "Communiqués, ordre du jour et rapports de réunion. Un like sur un rapport prouve que le membre l'a lu. Le Guide site (cet onglet) explique le fonctionnement de l'application, sur le même modèle que La loi.",
    order: 10,
  },
  {
    id: "guide-default-11",
    title: "11. Admin et accès",
    body: "L'onglet Admin regroupe la gestion : membres, accès par onglet, tournée, caisse, prêts, amendes, événements, communication, loi et sauvegarde. Chaque droit se donne dans Admin → Accès. Le développeur (Dario) peut être exclu des notifications de modification.",
    order: 11,
  },
  {
    id: "guide-default-12",
    title: "12. Application mobile et notifications",
    body: "Le site peut s'installer comme application (PWA) sur Android. Les notifications poussent vers l'onglet concerné. Sur iPhone, l'installation passe par « Sur l'écran d'accueil » depuis Safari.",
    order: 12,
  },
];

function loadLoiArticles() {
  const parsed = readSynced(LOI_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

async function saveLoiArticles() {
  localStorage.setItem(LOI_KEY, JSON.stringify(loiArticles));
  if (typeof bumpLiveDataRevision === "function") bumpLiveDataRevision();
  if (typeof potoFlushSync !== "function") return false;
  let ok = await potoFlushSync();
  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    ok = await potoFlushSync();
  }
  if (ok) loiArticles = loadLoiArticles();
  return ok;
}


function loadGuideArticles() {
  const parsed = readSynced(GUIDE_KEY, []);
  let list = Array.isArray(parsed) ? parsed : [];
  // Premier chargement : injecter le guide par défaut si vide
  if (!list.length) {
    const now = new Date().toISOString();
    list = DEFAULT_GUIDE_ARTICLES.map((a) => ({
      ...a,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      deletedAt: null,
    }));
    try {
      localStorage.setItem(GUIDE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  return list;
}

async function saveGuideArticles() {
  localStorage.setItem(GUIDE_KEY, JSON.stringify(guideArticles));
  if (typeof bumpLiveDataRevision === "function") bumpLiveDataRevision();
  if (typeof potoFlushSync !== "function") return false;
  let ok = await potoFlushSync();
  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    ok = await potoFlushSync();
  }
  if (ok) guideArticles = loadGuideArticles();
  return ok;
}

function canManageGuide() {
  return canDo("communication") || canDo("loi");
}

function getVisibleGuideArticles() {
  return [...guideArticles]
    .filter((item) => item && !item.deletedAt)
    .sort((a, b) => {
      const oa = Number(a.order) || 0;
      const ob = Number(b.order) || 0;
      if (oa !== ob) return oa - ob;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
}

function searchGuidePhrases(items, query) {
  if (typeof searchLoiPhrases === "function") return searchLoiPhrases(items, query);
  return null;
}

function buildGuideCardHtml(item, { manage = false } = {}) {
  const title = escapeHtml(item.title || "Sans titre");
  const body = escapeHtml(item.body || "").replace(/\n/g, "<br>");
  const actions = manage
    ? `<div class="loi-card-actions">
        <button type="button" class="btn-secondary btn-guide-edit" data-guide-id="${escapeHtml(item.id)}">Modifier</button>
        <button type="button" class="btn-pret-delete btn-guide-delete" data-guide-id="${escapeHtml(item.id)}">Supprimer</button>
      </div>`
    : "";
  return `
    <article class="loi-card guide-card" id="guide-${escapeHtml(item.id)}">
      <h3 class="loi-card-title">${title}</h3>
      <div class="loi-card-body">${body}</div>
      ${actions}
    </article>`;
}

function renderGuideList(target, { manage = false } = {}) {
  if (!target) return;
  const items = getVisibleGuideArticles();
  const q = manage
    ? String(document.getElementById("guideSearchInputAdmin")?.value || guideSearchQuery || "").trim()
    : String(document.getElementById("guideSearchInput")?.value || guideSearchQuery || "").trim();
  const meta = manage
    ? document.getElementById("guideSearchMetaAdmin")
    : document.getElementById("guideSearchMeta");

  const search = searchLoiPhrases(items, q);
  if (search === null) {
    if (meta) {
      meta.hidden = true;
      meta.textContent = "";
    }
    if (!items.length) {
      target.innerHTML = `<p class="panel-desc">Aucun article dans le guide pour le moment.</p>`;
      return;
    }
    target.innerHTML = items.map((item) => buildGuideCardHtml(item, { manage })).join("");
    return;
  }

  const phraseCount = search.reduce(
    (n, r) => n + r.phrases.length + (r.titleMatch ? 1 : 0),
    0
  );
  if (meta) {
    meta.hidden = false;
    meta.textContent =
      search.length === 0
        ? `Aucun résultat pour « ${q} »`
        : `${phraseCount} phrase${phraseCount > 1 ? "s" : ""} dans ${search.length} article${search.length > 1 ? "s" : ""}`;
  }
  if (!search.length) {
    target.innerHTML = `<p class="panel-desc">Aucune phrase ne contient « ${escapeHtml(q)} ».</p>`;
    return;
  }
  target.innerHTML = search
    .map((r) => {
      // Réutilise le rendu recherche de La loi, en adaptant les data-*
      return buildLoiSearchResultHtml(r, q)
        .replace(/data-loi-open-id=/g, "data-guide-open-id=")
        .replace(/id="loi-search-/g, 'id="guide-search-')
        .replace(/loi-card/g, "loi-card guide-card");
    })
    .join("");
}

function renderGuidePanels() {
  const memberList = document.getElementById("guideList");
  const adminList = document.getElementById("guideAdminList");
  const composer = document.getElementById("guideComposer");
  if (composer) composer.hidden = !canManageGuide();
  renderGuideList(memberList, { manage: false });
  renderGuideList(adminList, { manage: true });
}

function cancelEditGuide() {
  editingGuideId = null;
  document.getElementById("guideForm")?.reset();
  const cancelBtn = document.getElementById("guideCancelBtn");
  if (cancelBtn) cancelBtn.hidden = true;
  const titleEl = document.getElementById("guideComposerTitle");
  if (titleEl) titleEl.textContent = "Ajouter un article du guide";
  const submitBtn = document.getElementById("guideSubmitBtn");
  if (submitBtn) submitBtn.textContent = "Enregistrer";
}

async function submitGuideForm(e) {
  e?.preventDefault?.();
  if (!canManageGuide()) {
    alert("Vous n'avez pas l'autorisation de modifier le guide.");
    return;
  }
  const title = String(document.getElementById("guideTitle")?.value || "").trim();
  const body = String(document.getElementById("guideBody")?.value || "").trim();
  if (!title || !body) {
    alert("Titre et contenu obligatoires.");
    return;
  }
  const now = new Date().toISOString();
  const current = getCurrentMember();
  if (editingGuideId) {
    const item = guideArticles.find((a) => a.id === editingGuideId);
    if (!item || item.deletedAt) {
      alert("Article introuvable.");
      cancelEditGuide();
      return;
    }
    item.title = title;
    item.body = body;
    item.updatedAt = now;
    item.updatedBy = current?.id || null;
  } else {
    guideArticles.unshift({
      id: generateId(),
      title,
      body,
      order: getVisibleGuideArticles().length + 1,
      createdAt: now,
      updatedAt: now,
      createdBy: current?.id || null,
      deletedAt: null,
    });
  }
  const ok = await saveGuideArticles();
  const msg = document.getElementById("guideSaveMsg");
  if (msg) {
    msg.hidden = false;
    msg.className = ok ? "save-msg save-msg-success" : "save-msg save-msg-error";
    msg.textContent = ok
      ? editingGuideId
        ? "Article mis à jour."
        : "Article ajouté."
      : "Enregistré en local — synchro en cours…";
  }
  cancelEditGuide();
  renderGuidePanels();
  if (typeof renderCommunication === "function") renderCommunication();
}

function startEditGuide(id) {
  const item = guideArticles.find((a) => a.id === id && !a.deletedAt);
  if (!item) return;
  editingGuideId = id;
  const titleInput = document.getElementById("guideTitle");
  const bodyInput = document.getElementById("guideBody");
  if (titleInput) titleInput.value = item.title || "";
  if (bodyInput) bodyInput.value = item.body || "";
  const cancelBtn = document.getElementById("guideCancelBtn");
  if (cancelBtn) cancelBtn.hidden = false;
  const titleEl = document.getElementById("guideComposerTitle");
  if (titleEl) titleEl.textContent = "Modifier l'article";
  const submitBtn = document.getElementById("guideSubmitBtn");
  if (submitBtn) submitBtn.textContent = "Mettre à jour";
  document.getElementById("guideComposer")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteGuideArticle(id) {
  const item = guideArticles.find((a) => a.id === id);
  if (!item || item.deletedAt) return;
  if (!(await appConfirm("Supprimer cet article du guide ?"))) return;
  item.deletedAt = new Date().toISOString();
  item.updatedAt = item.deletedAt;
  await saveGuideArticles();
  if (editingGuideId === id) cancelEditGuide();
  renderGuidePanels();
}

function handleGuideSearchInput() {
  guideSearchQuery = String(
    document.getElementById("guideSearchInput")?.value ||
      document.getElementById("guideSearchInputAdmin")?.value ||
      ""
  );
  renderGuidePanels();
}

function openGuideArticleFromSearch(id) {
  if (!id) return;
  guideSearchQuery = "";
  const inp = document.getElementById("guideSearchInput");
  const inpA = document.getElementById("guideSearchInputAdmin");
  if (inp) inp.value = "";
  if (inpA) inpA.value = "";
  renderGuidePanels();
  requestAnimationFrame(() => {
    const target = document.getElementById(`guide-${id}`);
    if (!target) return;
    target.classList.add("loi-card-focus");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => target.classList.remove("loi-card-focus"), 2800);
  });
}

function canManageLoi() {
  // Édition uniquement pour admin ou postes autorisés (via Admin → Accès → La loi)
  if (!isLoggedIn()) return false;
  if (isGroupAdmin()) return true;
  return hasRoleTabAccess("loi");
}

function getVisibleLoiArticles() {
  return [...loiArticles]
    .filter((item) => item && !item.deletedAt)
    .sort((a, b) => {
      const oa = Number(a.order) || 0;
      const ob = Number(b.order) || 0;
      if (oa !== ob) return oa - ob;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
}

function normalizeLoiSearchText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Découpe le texte en phrases (points, ! ?, retours ligne) */
function splitLoiSentences(text) {
  const raw = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!raw) return [];
  const parts = raw
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [raw];
}

function highlightLoiMatch(sentence, query) {
  const safe = escapeHtml(sentence);
  const q = String(query || "").trim();
  if (!q) return safe;
  try {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped})`, "gi");
    return safe.replace(re, '<mark class="loi-search-hit">$1</mark>');
  } catch {
    return safe;
  }
}

/**
 * Recherche : ne garde que les phrases contenant le mot.
 * Retourne null si pas de requête, sinon des extraits.
 */
function searchLoiPhrases(items, query) {
  const q = normalizeLoiSearchText(query).trim();
  if (!q) return null;

  const results = [];
  items.forEach((item) => {
    const title = String(item.title || "");
    const body = String(item.body || "");
    const titleMatch = normalizeLoiSearchText(title).includes(q);
    const phrases = splitLoiSentences(body).filter((sentence) =>
      normalizeLoiSearchText(sentence).includes(q)
    );
    if (titleMatch || phrases.length) {
      results.push({ article: item, titleMatch, phrases });
    }
  });
  return results;
}

function buildLoiCardHtml(item, { manage = false } = {}) {
  const title = escapeHtml(item.title || "Sans titre");
  const body = escapeHtml(item.body || "").replace(/\n/g, "<br>");
  const actions = manage
    ? `<div class="loi-card-actions">
        <button type="button" class="btn-secondary btn-loi-edit" data-loi-id="${escapeHtml(item.id)}">Modifier</button>
        <button type="button" class="btn-pret-delete btn-loi-delete" data-loi-id="${escapeHtml(item.id)}">Supprimer</button>
      </div>`
    : "";
  return `
    <article class="loi-card" id="loi-${escapeHtml(item.id)}">
      <h3 class="loi-card-title">${title}</h3>
      <div class="loi-card-body">${body}</div>
      ${actions}
    </article>`;
}

/** Résultat de recherche : uniquement les phrases où apparaît le mot (cliquable → article entier) */
function buildLoiSearchResultHtml(result, query) {
  const item = result.article;
  const titleHtml = result.titleMatch
    ? highlightLoiMatch(item.title || "Sans titre", query)
    : escapeHtml(item.title || "Sans titre");
  const phraseBlocks =
    result.phrases.length > 0
      ? result.phrases
          .map((p) => `<p class="loi-search-phrase">${highlightLoiMatch(p, query)}</p>`)
          .join("")
      : result.titleMatch
        ? `<p class="loi-search-phrase loi-search-phrase-title-only">Mot trouvé dans le titre de l'article.</p>`
        : "";
  return `
    <article
      class="loi-card loi-card-search"
      id="loi-search-${escapeHtml(item.id)}"
      data-loi-open-id="${escapeHtml(item.id)}"
      role="button"
      tabindex="0"
      title="Voir l'article entier"
    >
      <h3 class="loi-card-title">${titleHtml}</h3>
      <div class="loi-card-body loi-search-excerpts">${phraseBlocks}</div>
      <p class="loi-search-open-hint">Cliquer pour voir l'article entier →</p>
    </article>`;
}

/** Ouvre l'article complet depuis un résultat de recherche */
function openLoiArticleFromSearch(articleId) {
  if (!articleId) return;
  // Quitter le mode recherche pour réafficher tous les articles
  loiSearchQuery = "";
  if (loiSearchInput) loiSearchInput.value = "";
  renderLoiList();
  // Faire défiler jusqu'à l'article et le mettre en évidence
  requestAnimationFrame(() => {
    const target = document.getElementById(`loi-${articleId}`);
    if (!target) return;
    target.classList.add("loi-card-focus");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => target.classList.remove("loi-card-focus"), 2800);
  });
}

function handleLoiMemberListClick(e) {
  const openCard = e.target.closest("[data-loi-open-id]");
  if (!openCard || !loiList?.contains(openCard)) return;
  e.preventDefault();
  openLoiArticleFromSearch(openCard.dataset.loiOpenId);
}

function cancelEditLoi() {
  editingLoiId = null;
  loiForm?.reset();
  if (loiCancelBtn) loiCancelBtn.hidden = true;
  if (loiSubmitBtn) loiSubmitBtn.textContent = "Enregistrer";
  if (loiComposerTitle) loiComposerTitle.textContent = "Ajouter un article";
}

/** Onglet membre : lecture seule + recherche par phrases */
function renderLoiList() {
  if (!loiList) return;
  const all = getVisibleLoiArticles();
  const query = String(loiSearchQuery || "").trim();
  const searchResults = searchLoiPhrases(all, query);

  if (!all.length) {
    if (loiSearchMeta) {
      loiSearchMeta.hidden = true;
      loiSearchMeta.textContent = "";
    }
    loiList.innerHTML = `<p class="panel-desc">Aucun article pour le moment.</p>`;
    return;
  }

  // Pas de recherche : afficher les articles complets
  if (!searchResults) {
    if (loiSearchMeta) {
      loiSearchMeta.hidden = true;
      loiSearchMeta.textContent = "";
    }
    loiList.innerHTML = all.map((item) => buildLoiCardHtml(item, { manage: false })).join("");
    return;
  }

  const phraseCount = searchResults.reduce((n, r) => n + r.phrases.length + (r.titleMatch ? 1 : 0), 0);
  if (loiSearchMeta) {
    loiSearchMeta.hidden = false;
    loiSearchMeta.textContent =
      searchResults.length === 0
        ? `Aucun résultat pour « ${query} »`
        : `${phraseCount} phrase${phraseCount > 1 ? "s" : ""} trouvée${phraseCount > 1 ? "s" : ""} dans ${searchResults.length} article${searchResults.length > 1 ? "s" : ""}`;
  }

  if (!searchResults.length) {
    loiList.innerHTML = `<p class="panel-desc">Aucune phrase ne contient « ${escapeHtml(query)} ».</p>`;
    return;
  }

  loiList.innerHTML = searchResults.map((r) => buildLoiSearchResultHtml(r, query)).join("");
}

function renderLoi() {
  // Lecture seule — jamais de formulaire d'édition ici
  if (loiSearchInput && loiSearchQuery === "" && loiSearchInput.value) {
    loiSearchQuery = loiSearchInput.value;
  }
  renderLoiList();
}

/** Admin → La loi : édition réservée aux autorisés */
function renderLoiAdmin() {
  if (!canManageLoi()) {
    if (loiComposer) loiComposer.hidden = true;
    if (loiAdminList) {
      loiAdminList.innerHTML =
        `<p class="panel-desc">Tu n'as pas l'accès pour gérer La loi. Un admin peut t'accorder cet accès dans Admin → Accès.</p>`;
    }
    return;
  }
  if (loiComposer) loiComposer.hidden = false;
  if (!loiAdminList) return;
  const items = getVisibleLoiArticles();
  if (!items.length) {
    loiAdminList.innerHTML = `<p class="panel-desc">Aucun article. Ajoute le premier ci-dessus.</p>`;
    return;
  }
  loiAdminList.innerHTML = items.map((item) => buildLoiCardHtml(item, { manage: true })).join("");
}

async function submitLoiForm(e) {
  e?.preventDefault?.();
  if (!canManageLoi()) {
    alert("Vous n'avez pas l'autorisation de modifier La loi. Cet accès se gère dans Admin → Accès.");
    return;
  }
  const title = String(loiTitleInput?.value || "").trim();
  const body = String(loiBodyInput?.value || "").trim();
  if (!title || !body) {
    alert("Titre et contenu obligatoires.");
    return;
  }
  const now = new Date().toISOString();
  const current = getCurrentMember();
  if (editingLoiId) {
    const item = loiArticles.find((a) => a.id === editingLoiId);
    if (!item || item.deletedAt) {
      alert("Article introuvable.");
      cancelEditLoi();
      return;
    }
    item.title = title;
    item.body = body;
    item.updatedAt = now;
    item.updatedBy = current?.id || null;
  } else {
    loiArticles.unshift({
      id: generateId(),
      title,
      body,
      order: getVisibleLoiArticles().length + 1,
      createdAt: now,
      updatedAt: now,
      createdBy: current?.id || null,
      deletedAt: null,
    });
  }
  const ok = await saveLoiArticles();
  if (loiSaveMsg) {
    loiSaveMsg.hidden = false;
    loiSaveMsg.className = ok ? "save-msg save-msg-success" : "save-msg save-msg-error";
    loiSaveMsg.textContent = ok
      ? editingLoiId
        ? "Article mis à jour."
        : "Article ajouté."
      : "Enregistré ici, synchronisation serveur en cours…";
  }
  cancelEditLoi();
  renderLoiAdmin();
  renderLoi();
}

function startEditLoi(id) {
  if (!canManageLoi()) return;
  const item = loiArticles.find((a) => a.id === id && !a.deletedAt);
  if (!item) return;
  editingLoiId = id;
  if (loiTitleInput) loiTitleInput.value = item.title || "";
  if (loiBodyInput) loiBodyInput.value = item.body || "";
  if (loiCancelBtn) loiCancelBtn.hidden = false;
  if (loiSubmitBtn) loiSubmitBtn.textContent = "Enregistrer les modifications";
  if (loiComposerTitle) loiComposerTitle.textContent = "Modifier l'article";
  loiComposer?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteLoiArticle(id) {
  if (!canManageLoi()) return;
  const item = loiArticles.find((a) => a.id === id);
  if (!item || item.deletedAt) return;
  if (!(await appConfirm(`Supprimer l'article « ${item.title || "Sans titre"} » ?`))) return;
  const now = new Date().toISOString();
  item.deletedAt = now;
  item.updatedAt = now;
  if (editingLoiId === id) cancelEditLoi();
  await saveLoiArticles();
  renderLoiAdmin();
  renderLoi();
}

function handleLoiListClick(e) {
  const editBtn = e.target.closest(".btn-loi-edit");
  const deleteBtn = e.target.closest(".btn-loi-delete");
  if (editBtn) {
    startEditLoi(editBtn.dataset.loiId);
    return;
  }
  if (deleteBtn) {
    deleteLoiArticle(deleteBtn.dataset.loiId);
  }
}

function handleLoiSearchInput() {
  loiSearchQuery = String(loiSearchInput?.value || "");
  renderLoiList();
}


function getPostReadBy(post) {
  return post?.readBy && typeof post.readBy === "object" && !Array.isArray(post.readBy)
    ? post.readBy
    : {};
}

function mergePostReadBy(a, b) {
  return { ...getPostReadBy(a), ...getPostReadBy(b) };
}

function getRapportReaders(post) {
  const readBy = getPostReadBy(post);
  return Object.keys(readBy)
    .map((id) => {
      const m = getMemberById(id);
      return m ? { id, name: m.name, at: readBy[id] } : null;
    })
    .filter(Boolean)
    .sort((x, y) => String(x.name).localeCompare(String(y.name), "fr", { sensitivity: "base" }));
}

function getRapportReadStats(post) {
  const readers = getRapportReaders(post);
  const groupMembers = typeof getGroupMembers === "function" ? getGroupMembers() : getSortedMembers();
  // Membres du groupe (hors "nouveau"), sauf l'auteur si on veut — on compte tous les membres groupe
  const expected = groupMembers.filter((m) => !(typeof isNouveauMember === 'function' && isNouveauMember(m)));
  const expectedIds = new Set(expected.map((m) => m.id));
  const readIds = new Set(readers.map((r) => r.id));
  const readCount = [...expectedIds].filter((id) => readIds.has(id)).length;
  const pending = expected.filter((m) => !readIds.has(m.id));
  return { readers, expected, readCount, total: expected.length, pending };
}

async function markCommunicationRead(postId) {
  if (!isLoggedIn()) {
    alert("Connecte-toi pour confirmer la lecture.");
    openLoginModal?.();
    return;
  }
  if (shouldSuppressDevNotifications?.()) {
    // Dario peut aussi marquer lu s'il veut — on laisse faire
  }
  const current = getCurrentMember();
  if (!current || isNouveauMember?.(current)) {
    alert("Seuls les membres du groupe peuvent confirmer la lecture.");
    return;
  }
  const post = communicationPosts.find((p) => p.id === postId && !p.deletedAt);
  if (!post || post.kind !== "rapport") return;
  if (!post.readBy || typeof post.readBy !== "object") post.readBy = {};
  if (post.readBy[current.id]) {
    showToast?.("Tu as déjà confirmé la lecture.", "info");
    return;
  }
  post.readBy[current.id] = new Date().toISOString();
  // Ne pas toucher updatedAt du contenu — sinon LWW écrase les lectures des autres
  // On pousse quand même le post avec readBy fusionné côté serveur
  post.readReceiptUpdatedAt = new Date().toISOString();
  await saveCommunicationPosts();
  renderCommunication();
  showToast?.("Lecture confirmée — merci.", "success");
}

function buildRapportReadReceiptHtml(post, { manage = false } = {}) {
  if (post.kind !== "rapport") return "";
  const current = getCurrentMember();
  const stats = getRapportReadStats(post);
  const hasRead = current && getPostReadBy(post)[current.id];
  const canRead =
    current &&
    isLoggedIn() &&
    !(typeof isNouveauMember === "function" && isNouveauMember(current));

  const names = stats.readers.map((r) => escapeHtml(r.name)).join(", ");
  const pendingNames = stats.pending.map((m) => escapeHtml(m.name)).join(", ");

  return `
    <div class="comm-read-receipt" data-post-id="${escapeHtml(post.id)}">
      <div class="comm-read-row">
        ${
          canRead
            ? hasRead
              ? `<span class="comm-read-done">✓ Tu as lu</span>`
              : `<button type="button" class="btn-primary btn-comm-read" data-id="${escapeHtml(post.id)}">J'ai lu le rapport</button>`
            : `<span class="comm-read-hint">Connecte-toi pour confirmer</span>`
        }
        <span class="comm-read-count">${stats.readCount}/${stats.total} ont lu</span>
      </div>
      ${buildReunionProgressBar([
        { value: stats.readCount, color: "#059669", label: "Lu" },
        { value: Math.max(0, stats.total - stats.readCount), color: "#e2e8f0", label: "Pas encore" },
      ])}
      ${
        manage || stats.readCount > 0
          ? `<details class="comm-read-details">
              <summary>Voir qui a lu (${stats.readCount})</summary>
              <p class="comm-read-names">${names || "Personne pour le moment."}</p>
              ${
                manage && stats.pending.length
                  ? `<p class="comm-read-pending"><strong>Pas encore :</strong> ${pendingNames}</p>`
                  : ""
              }
            </details>`
          : ""
      }
    </div>`;
}

function canManageCommunicationPost(post) {
  return Boolean(post) && !post.deletedAt && canPublishCommunication();
}

function getCommunicationPostsForKind(kindId) {
  return communicationPosts
    .filter((post) => post.kind === kindId && !post.deletedAt)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function renderCommunicationSubtabCounts() {
  COMMUNICATION_KINDS.forEach((kind) => {
    document.querySelectorAll(`[data-comm-sub="${kind.id}"]`).forEach((btn) => {
      let countEl = btn.querySelector(".comm-count");
      if (kind.id === "guide") {
        const count =
          typeof getVisibleGuideArticles === "function" ? getVisibleGuideArticles().length : 0;
        if (!countEl) {
          countEl = document.createElement("span");
          countEl.className = "comm-count";
          btn.appendChild(countEl);
        }
        countEl.textContent = count > 0 ? String(count) : "";
        countEl.hidden = count <= 0;
        return;
      }
      const count = getCommunicationPostsForKind(kind.id).length;
      if (!countEl) {
        countEl = document.createElement("span");
        countEl.className = "comm-count";
        btn.appendChild(countEl);
      }
      countEl.textContent = count > 0 ? String(count) : "";
      countEl.hidden = count <= 0;
    });
  });
}

function cancelEditCommunication() {
  editingCommunicationId = null;
  communicationForm?.reset();
  if (communicationCancelBtn) communicationCancelBtn.hidden = true;
  if (communicationSubmitBtn) communicationSubmitBtn.textContent = "Publier";
}

function showCommunicationSub(kindId) {
  if (!COMMUNICATION_KINDS.some((kind) => kind.id === kindId)) kindId = "communique";
  activeCommunicationSub = kindId;
  localStorage.setItem(COMMUNICATION_SUBTAB_KEY, kindId);
  cancelEditCommunication();
  renderCommunication();
}

function renderCommunicationComposer() {
  const kind = getCommunicationKind(activeCommunicationSub);
  const canPublish = canPublishCommunication();
  if (communicationComposer) communicationComposer.hidden = !canPublish;
  if (communicationLockMsg) communicationLockMsg.hidden = true;
  if (communicationComposerTitle) {
    communicationComposerTitle.textContent = editingCommunicationId
      ? `Modifier ce ${kind.singular}`
      : kind.composerTitle;
  }
  if (communicationTitleInput) communicationTitleInput.placeholder = kind.titlePlaceholder;
  if (communicationBodyInput) communicationBodyInput.placeholder = kind.bodyPlaceholder;
  if (communicationSubmitBtn && !editingCommunicationId) {
    communicationSubmitBtn.textContent = "Publier";
  }
}

function renderCommunicationList(target, { manage = false } = {}) {
  if (!target) return;
  const kind = getCommunicationKind(activeCommunicationSub);
  const posts = getCommunicationPostsForKind(kind.id);
  if (!posts.length) {
    const others = COMMUNICATION_KINDS.filter((item) => item.id !== kind.id)
      .map((item) => {
        const count = getCommunicationPostsForKind(item.id).length;
        return count > 0 ? `${item.label} (${count})` : "";
      })
      .filter(Boolean);
    const hint = others.length
      ? ` Regarde ${others.join(" ou ")}.`
      : "";
    target.innerHTML = `<p class="communication-empty">Aucun ${escapeHtml(kind.singular)} publié pour le moment.${escapeHtml(hint)}</p>`;
    return;
  }
  target.innerHTML = posts
    .map((post) => {
      const author = getMemberById(post.createdBy);
      const dateLabel = formatFriendlyDate(post.updatedAt || post.createdAt);
      return `
        <article class="communication-card" id="${manage ? "admin-" : ""}comm-${escapeHtml(post.id)}">
          <div class="communication-card-head">
            <h3>${escapeHtml(post.title)}</h3>
            <p class="communication-card-meta">${escapeHtml(dateLabel)}${author ? ` · ${escapeHtml(author.name)}` : ""}</p>
          </div>
          <div class="communication-card-body">${escapeHtml(post.body)}</div>
          ${buildRapportReadReceiptHtml(post, { manage })}
          ${
            manage && canManageCommunicationPost(post)
              ? `<div class="communication-card-actions">
                  <button type="button" class="btn-secondary btn-comm-edit" data-id="${escapeHtml(post.id)}">Modifier</button>
                  <button type="button" class="btn-secondary btn-comm-delete" data-id="${escapeHtml(post.id)}">Supprimer</button>
                </div>`
              : ""
          }
        </article>`;
    })
    .join("");
}

function focusCommunicationCursor() {
  requestAnimationFrame(() => {
    const root =
      isAdminWorkspace() && activeAdminSub === "communication"
        ? document.getElementById("adminSub-communication")
        : document.getElementById("tab-communication");
    const btn = root?.querySelector(`[data-comm-sub="${activeCommunicationSub}"]`);
    btn?.focus();
    if (
      isAdminWorkspace() &&
      activeAdminSub === "communication" &&
      canPublishCommunication() &&
      communicationTitleInput &&
      !communicationComposer?.hidden
    ) {
      communicationTitleInput.focus();
    }
  });
}

function isCommunicationGuideSub() {
  return activeCommunicationSub === "guide" || getCommunicationKind(activeCommunicationSub)?.id === "guide";
}

function renderCommunicationGuidePanels() {
  const show = isCommunicationGuideSub();
  const panel = document.getElementById("communicationGuidePanel");
  const panelAdmin = document.getElementById("communicationGuidePanelAdmin");
  if (panel) panel.hidden = !show;
  if (panelAdmin) panelAdmin.hidden = !show;
  if (communicationList) communicationList.hidden = show;
  if (typeof communicationAdminList !== "undefined" && communicationAdminList) {
    communicationAdminList.hidden = show;
  }
  // Compositeur posts communication caché sur le guide (formulaire guide à part)
  if (communicationComposer) {
    if (show) communicationComposer.hidden = true;
  }
  if (show && typeof renderGuidePanels === "function") {
    renderGuidePanels();
  }
}

function renderCommunication() {
  try {
    document.querySelectorAll("[data-comm-sub]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.commSub === activeCommunicationSub);
    });
    renderCommunicationSubtabCounts();
    if (isCommunicationGuideSub()) {
      renderCommunicationGuidePanels();
      return;
    }
    renderCommunicationGuidePanels();
    renderCommunicationComposer();
    renderCommunicationList(communicationList, { manage: false });
    renderCommunicationList(communicationAdminList, { manage: true });
  } catch (err) {
    console.warn("Affichage Communication impossible :", err);
  }
}

async function publishCommunication() {
  if (!requireTabAccess("communication", "publier dans Communication")) return;
  if (isCommunicationGuideSub()) {
    // Le guide a son propre formulaire
    return;
  }
  const title = String(communicationTitleInput?.value || "").trim();
  const body = String(communicationBodyInput?.value || "").trim();
  if (!title || !body) {
    alert("Indique un titre et un texte.");
    return;
  }
  const kind = getCommunicationKind(activeCommunicationSub);
  const now = new Date().toISOString();
  const wasEdit = Boolean(editingCommunicationId);
  if (editingCommunicationId) {
    const post = communicationPosts.find((item) => item.id === editingCommunicationId);
    if (!canManageCommunicationPost(post) || post.deletedAt) return;
    post.title = title;
    post.body = body;
    post.updatedAt = now;
    post.updatedBy = getCurrentMember()?.id || null;
  } else {
    communicationPosts.unshift({
      id: generateId(),
      kind: kind.id,
      title,
      body,
      createdAt: now,
      updatedAt: now,
      createdBy: getCurrentMember()?.id || null,
    });
  }
  const synced = await saveCommunicationPosts();
  cancelEditCommunication();
  renderCommunication();
  if (communicationSaveMsg) {
    const label = `${kind.singular[0].toUpperCase()}${kind.singular.slice(1)}`;
    communicationSaveMsg.textContent = synced
      ? wasEdit
        ? `${label} enregistré en ligne.`
        : `${label} publié en ligne. Visible sur tous les appareils.`
      : `${label} enregistré ici. Connexion trop lente : réessaie dans un instant pour le voir ailleurs.`;
    communicationSaveMsg.className = synced ? "save-msg save-msg-success" : "save-msg save-msg-error";
    communicationSaveMsg.hidden = false;
  }
}

function startEditCommunication(id) {
  if (!requireTabAccess("communication", "modifier une publication")) return;
  const post = communicationPosts.find((item) => item.id === id);
  if (!canManageCommunicationPost(post)) return;
  activeCommunicationSub = post.kind;
  editingCommunicationId = id;
  if (communicationTitleInput) communicationTitleInput.value = post.title || "";
  if (communicationBodyInput) communicationBodyInput.value = post.body || "";
  if (communicationCancelBtn) communicationCancelBtn.hidden = false;
  if (communicationSubmitBtn) communicationSubmitBtn.textContent = "Enregistrer";
  renderCommunication();
  communicationComposer?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteCommunication(id) {
  if (!canDo("communication")) {
    alert("Pas l'accès pour supprimer.");
    return;
  }
  const post = communicationPosts.find((item) => item.id === id);
  if (!canManageCommunicationPost(post) || post.deletedAt) return;
  if (!(await appConfirm(`Supprimer « ${post.title} » ?`))) return;
  const now = new Date().toISOString();
  post.deletedAt = now;
  post.updatedAt = now;
  if (editingCommunicationId === id) cancelEditCommunication();
  await saveCommunicationPosts();
  renderCommunication();
}

function render() {
  memberCounter.textContent = `${members.length} / ${MAX_MEMBERS} membres`;
  updateSessionUI();
  updateFormState();
  updateMemberSelects();
  renderTabPermissionsPanel();
  renderBureau();
  renderMemberList();
  renderOnlineList();
  renderTourneeTable();
  renderAmendes();
  renderEvenements();
  renderCommunication();
  renderAdminList();
  if (canAccessCaisse()) renderAutreArgent();
  refreshFinancierPayBoxes();
}

function showAutreArgentSaveMessage(text, type = "success") {
  if (!autreArgentSaveMsg) return;
  autreArgentSaveMsg.textContent = text;
  autreArgentSaveMsg.className = `save-msg save-msg-${type}`;
  autreArgentSaveMsg.hidden = false;
}

function resolveAutreArgentMember(memberId, { allowGroupe = false } = {}) {
  const raw = String(memberId || "").trim();
  if (allowGroupe && (!raw || raw.toLowerCase() === "groupe" || raw.toLowerCase() === "le groupe")) {
    return { id: "groupe", name: "Le groupe" };
  }
  return getMemberById(raw);
}

function buildAutreArgentNote(motif, detail, fallback) {
  const motifLabel = String(motif || "").trim();
  const extra = String(detail || "").trim();
  if (motifLabel && extra) return `${motifLabel} — ${extra}`;
  return motifLabel || extra || fallback || "";
}

function requireCaisseArgentAccess(actionLabel) {
  if (!isLoggedIn()) {
    alert("Veuillez vous connecter avec votre nom.");
    openLoginModal();
    return false;
  }
  if (canManageCaisseArgent()) return true;
  alert(`Seul le Financier ou un administrateur peut ${actionLabel}.`);
  return false;
}

function addAutreArgent(memberId, amount, note, motif) {
  if (!requireCaisseArgentAccess("enregistrer de l'autre argent")) return;

  const member = resolveAutreArgentMember(memberId);
  if (!member || member.id === "groupe") {
    alert("Choisis le poto qui donne ou aide.");
    return;
  }

  const parsedAmount = parseAutreArgentAmount(amount);
  if (parsedAmount == null) {
    alert("Montant invalide.");
    return;
  }

  autreArgent.unshift({
    id: generateId(),
    memberId: member.id,
    amount: parsedAmount,
    type: "don",
    motif: String(motif || "").trim() || "Don ou aide",
    note: buildAutreArgentNote(motif, note, "Don ou aide"),
    createdAt: new Date().toISOString(),
    createdBy: getCurrentMember()?.id || null,
  });

  saveAutreArgent();
  notifyAllMembers(
    "financier_caisse",
    `${getActorLabel()} a ajouté ${formatEuro(parsedAmount)} à la caisse (don ou aide de ${member.name}).`,
    { tab: "finance", title: "Caisse" }
  );
  if (autreArgentForm) autreArgentForm.reset();
  showAutreArgentSaveMessage(
    `${formatEuro(parsedAmount)} de ${member.name} ajouté à la caisse disponible.`
  );
  autreArgentListPanel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function withdrawAutreArgent(memberId, amount, note, motif) {
  if (!requireCaisseArgentAccess("faire un retrait d'argent")) return;

  const member = resolveAutreArgentMember(memberId, { allowGroupe: true }) || {
    id: "groupe",
    name: "Le groupe",
  };

  const parsedAmount = parseAutreArgentAmount(amount);
  if (parsedAmount == null) {
    alert("Indique le montant à retirer de la caisse disponible.");
    return;
  }

  const caisseDispo = getCaisseDisponible();
  if (parsedAmount > caisseDispo + 1e-9) {
    alert(
      `Impossible de retirer ${formatEuro(parsedAmount)} : la caisse disponible n'a que ${formatEuro(caisseDispo)}.`
    );
    return;
  }

  const motifLabel = String(motif || "").trim() || "Sortie";

  autreArgent.unshift({
    id: generateId(),
    memberId: member.id,
    amount: -parsedAmount,
    type: "retrait",
    motif: motifLabel,
    note: buildAutreArgentNote(motifLabel, note, "Sortie"),
    createdAt: new Date().toISOString(),
    createdBy: getCurrentMember()?.id || null,
  });

  saveAutreArgent();
  notifyAllMembers(
    "financier_caisse",
    `${getActorLabel()} a retiré ${formatEuro(parsedAmount)} de la caisse (${member.name} — ${motifLabel}).`,
    { tab: "finance", title: "Caisse" }
  );
  if (autreArgentForm) autreArgentForm.reset();
  showAutreArgentSaveMessage(
    `${formatEuro(parsedAmount)} retiré de la caisse disponible (${member.name} — ${motifLabel}).`
  );
  autreArgentListPanel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function deleteAutreArgent(entryId) {
  if (!requireLogin()) return;
  // Accès large : admin / financier / rôle caisse
  if (!(typeof canDo === "function" ? canDo("caisse") : canManageCaisseArgent())) {
    alert("Pas l'accès pour supprimer.");
    return;
  }

  const id = String(entryId || "");
  const entry = autreArgent.find((item) => item && String(item.id) === id && !item.deletedAt);
  if (!entry) {
    // déjà parti : rafraîchir l'UI
    if (typeof renderAutreArgent === "function") renderAutreArgent();
    return;
  }

  const member =
    entry.memberId === "groupe"
      ? { name: "Le groupe" }
      : getMemberById(entry.memberId);
  const isWithdraw = isAutreArgentRetrait(entry);
  const absAmount = Math.abs(getEntryAmount(entry));
  const actionLabel = isWithdraw ? "ce retrait" : "cette entrée";
  if (
    !(await appConfirm(
      `Supprimer ${actionLabel} de ${formatEuro(absAmount)} (${member?.name || "ce membre"}) ?`
    ))
  ) {
    return;
  }

  const now = new Date().toISOString();
  // Soft-delete pour que la synchro ne ramène pas la ligne
  entry.deletedAt = now;
  entry.updatedAt = now;
  autreArgent = autreArgent.map((item) =>
    String(item.id) === id ? { ...item, deletedAt: now, updatedAt: now } : item
  );

  // Retrait immédiat du DOM
  document.querySelectorAll(`.btn-autre-argent-delete[data-id="${CSS.escape(id)}"]`).forEach((btn) => {
    btn.closest("tr, .amende-history-row, article, li")?.remove();
  });

  saveAutreArgent(true);
  if (typeof bumpLiveDataRevision === "function") bumpLiveDataRevision();
  if (typeof renderAutreArgent === "function") renderAutreArgent();
  if (typeof renderFondCaissePanel === "function") renderFondCaissePanel();
  if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
  showAutreArgentSaveMessage(
    isWithdraw
      ? "Retrait supprimé — le montant est remis dans la caisse disponible."
      : "Entrée supprimée — montant retiré de la caisse disponible."
  );
  try {
    if (typeof potoFlushSync === "function") await potoFlushSync();
  } catch (e) {
    console.warn("sync deleteAutreArgent", e);
  }
}


/** Tableau historique : Date | Type | Détail | Montant | Déjà payé | Reste | Statut | Actions?
 *  Si repaid/remaining = null → tiret (mouvements sans suivi de solde, ex. sorties caisse)
 */
function buildCaisseHistoryTableHtml(rows, { emptyText = "Aucun mouvement.", hasActions = false } = {}) {
  const withActions = hasActions || rows.some((row) => row.actions);
  const colCount = withActions ? 8 : 7;

  const cellPaidRemain = (value) => {
    if (value === null || value === undefined) return "—";
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return formatEuro(n);
  };

  const body = rows.length
    ? rows
        .map((row) => {
          const dateLabel =
            (typeof formatAdaptiveDate === "function" ? formatAdaptiveDate(row.date) : "") ||
            (row.date ? formatDate(row.date) : "—");
          const typeLabel = row.typeLabel || row.type || "—";
          const statusClass = row.chipClass || (row.settled ? "is-paid" : "is-open");
          const hasPaidTrack = row.repaid !== null && row.repaid !== undefined;
          const hasRemainTrack = row.remaining !== null && row.remaining !== undefined;
          const repaid = hasPaidTrack ? Number(row.repaid) || 0 : null;
          const remaining = hasRemainTrack ? Number(row.remaining) || 0 : null;
          const paidClass = repaid !== null && repaid > 0 ? "num-paid" : "";
          const remainClass =
            remaining === null ? "" : remaining <= 0 ? "num-remain is-zero" : "num-remain";
          return `<tr id="caisse-hist-${escapeHtml(String(row.id || ""))}" class="${row.settled ? "is-settled" : ""}">
            <td class="amende-col-date" data-label="Date">${escapeHtml(dateLabel || "—")}</td>
            <td class="amende-col-type" data-label="Type">${escapeHtml(typeLabel)}</td>
            <td class="amende-col-detail" data-label="Détail">${escapeHtml(row.detail || "—")}</td>
            <td class="num amende-col-amount" data-label="Montant">${formatEuro(row.original || 0)}</td>
            <td class="num amende-col-paid ${paidClass}" data-label="Déjà payé">${cellPaidRemain(repaid)}</td>
            <td class="num amende-col-remain ${remainClass}" data-label="Reste">${cellPaidRemain(remaining)}</td>
            <td class="amende-col-status" data-label="Statut">
              <span class="amende-chip ${statusClass}">${escapeHtml(row.statusLabel || "—")}</span>
            </td>
            ${withActions ? `<td class="amende-col-actions" data-label="Actions">${row.actions || "—"}</td>` : ""}
          </tr>`;
        })
        .join("")
    : `<tr class="amende-empty-row"><td colspan="${colCount}">${escapeHtml(emptyText)}</td></tr>`;

  const tracked = rows.filter((r) => r.repaid !== null && r.repaid !== undefined);
  const originalTotal = rows.reduce((s, r) => s + (Number(r.original) || 0), 0);
  const repaidTotal = tracked.reduce((s, r) => s + (Number(r.repaid) || 0), 0);
  const remainingTotal = tracked.reduce((s, r) => s + (Number(r.remaining) || 0), 0);
  const foot = rows.length
    ? `<tr>
        <td colspan="3">Total</td>
        <td class="num">${formatEuro(originalTotal)}</td>
        <td class="num num-paid">${tracked.length ? formatEuro(repaidTotal) : "—"}</td>
        <td class="num num-remain">${tracked.length ? formatEuro(remainingTotal) : "—"}</td>
        <td${withActions ? ' colspan="2"' : ""}></td>
      </tr>`
    : "";

  return `
    <div class="amende-table-wrap">
      <table class="amende-table caisse-history-table${withActions ? " amende-table-admin" : ""}">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Détail</th>
            <th class="num">Montant</th>
            <th class="num"><span class="th-full">Déjà payé</span><span class="th-short">Payé</span></th>
            <th class="num">Reste</th>
            <th>Statut</th>
            ${withActions ? "<th>Actions</th>" : ""}
          </tr>
        </thead>
        <tbody>${body}</tbody>
        <tfoot>${foot}</tfoot>
      </table>
    </div>`;
}

/** Lignes de l'historique caisse (dons / retraits) — withActions=false = lecture seule */
function buildAutreArgentHistoryRows(withActions = false) {
  return [...autreArgent]
    .filter((entry) => entry && !entry.deletedAt)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map((entry) => {
      const member = getMemberById(entry.memberId);
      const isWithdraw = isAutreArgentRetrait(entry);
      const amount = Math.abs(getEntryAmount(entry));
      return {
        id: entry.id,
        date: entry.createdAt,
        typeLabel: isWithdraw ? "Retrait" : "Don ou aide",
        type: isWithdraw ? "dette" : "cotisation",
        detail: `${member?.name || "Le groupe"}${entry.note ? ` — ${entry.note}` : ""}`,
        original: amount,
        // Pas de suivi payé/reste pour dons et sorties → tiret dans le tableau
        repaid: null,
        remaining: null,
        settled: !isWithdraw,
        statusLabel: isWithdraw ? "Sortie" : "Entrée",
        chipClass: isWithdraw ? "is-rejected" : "is-paid",
        actions: withActions
          ? `<button type="button" class="btn-secondary btn-autre-argent-delete" data-id="${escapeHtml(entry.id)}">Supprimer</button>`
          : "",
      };
    });
}

function renderAutreArgent() {
  renderFondCaissePanel();

  const fond = getFondCaisse();
  const contributions = getTotalDonsOuAides();
  const retraits = getTotalRetraitsCaisse();
  const caisseDispo = getCaisseDisponible();

  if (!canManageCaisseArgent()) {
    if (autreArgentFormPanel) autreArgentFormPanel.hidden = true;
    if (autreArgentListPanel) autreArgentListPanel.hidden = true;
    return;
  }

  if (autreArgentFormPanel) autreArgentFormPanel.hidden = false;
  if (autreArgentListPanel) autreArgentListPanel.hidden = false;

  // Fond de départ : visible uniquement admin (ce panel est déjà admin-only)
  if (fondCaisseDisplay) fondCaisseDisplay.textContent = formatEuro(fond);
  const fondAnnuelVerseEl = document.getElementById("fondCaisseAnnuelVerseDisplay");
  if (fondAnnuelVerseEl) fondAnnuelVerseEl.textContent = formatEuro(getTotalFondCaisseAnnuelVerse());
  if (autreArgentTotal) autreArgentTotal.textContent = formatEuro(contributions);
  if (autreArgentRetraitsTotal) autreArgentRetraitsTotal.textContent = formatEuro(retraits);
  if (autreArgentCaisseTotal) autreArgentCaisseTotal.textContent = formatEuro(caisseDispo);
  if (autreArgentCaisseDispoLive) autreArgentCaisseDispoLive.textContent = formatEuro(caisseDispo);

  if (!autreArgentList) return;

  autreArgentList.innerHTML = buildCaisseHistoryTableHtml(buildAutreArgentHistoryRows(true), {
    emptyText: "Aucun mouvement pour le moment.",
    hasActions: true,
  });
}

/** Historique caisse en lecture seule pour l'onglet Finance (tous les membres) */
function renderFinanceCaisseHistorique() {
  const rows = buildAutreArgentHistoryRows(false);
  const dons = getTotalDonsOuAides();
  const retraits = getTotalRetraitsCaisse();
  const summary = `
    <p class="panel-desc finance-caisse-hist-summary">
      Dons ou aides : <strong>${formatEuro(dons)}</strong>
      · Retraits : <strong>${formatEuro(retraits)}</strong>
      · Caisse disponible : <strong>${formatEuro(getCaisseDisponible())}</strong>
    </p>`;
  return `
    <div class="amende-ledger finance-caisse-historique">
      <h3 class="finance-ledger-title">Historique caisse</h3>
      ${summary}
      ${buildCaisseHistoryTableHtml(rows, {
        emptyText: "Aucun mouvement de caisse pour le moment.",
        hasActions: false,
      })}
    </div>`;
}

async function assignRole(memberId, roleId) {
  if (!requireTabAccess("bureau", "nommer les membres du bureau")) return;

  const member = getMemberById(memberId);
  if (!member) return;

  const previousMemberId = roles[roleId];
  const previousRoleOfMember = getMemberRole(memberId);

  if (previousRoleOfMember && previousRoleOfMember !== roleId) {
    delete roles[previousRoleOfMember];
  }

  if (previousMemberId && previousMemberId !== memberId) {
    const previousMember = getMemberById(previousMemberId);
    const msg = previousMember
      ? `« ${previousMember.name} » occupe déjà ce poste. Le remplacer par « ${member.name} » ?`
      : `Attribuer ce poste à « ${member.name} » ?`;

    if (!(await appConfirm(msg))) return;
  }

  Object.keys(roles).forEach((key) => {
    if (roles[key] === memberId) delete roles[key];
  });

  roles[roleId] = memberId;
  saveRoles();
  roleForm.reset();
  updateSessionUI();
  renderBureau();
}

