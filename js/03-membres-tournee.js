function renderMemberList() {
  const totalEl = document.getElementById("memberTotalCount");
  const groupCount = getGroupMembers().length;
  const nouveauCount = getAllAccountsSorted().filter((m) => isNouveauMember(m)).length;
  if (totalEl) totalEl.textContent = String(groupCount);
  if (memberCounter) {
    memberCounter.textContent =
      nouveauCount > 0
        ? `${groupCount} membres · ${nouveauCount} nouveau${nouveauCount > 1 ? "x" : ""} / ${MAX_MEMBERS}`
        : `${groupCount} / ${MAX_MEMBERS} membres`;
  }
  fillMemberList(memberList, { withAdminActions: false });
  fillMemberList(memberListAdmin, { withAdminActions: true });
}

function isMemberOnline(memberId) {
  return onlineMembers.some((person) => person.id === memberId);
}

function renderOnlineList() {
  if (onlineCount) onlineCount.textContent = String(onlineMembers.length);
  if (!onlineList) return;

  if (onlineMembers.length === 0) {
    onlineList.innerHTML = `<li class="online-empty">Personne n'est connecté pour le moment.</li>`;
    return;
  }

  const currentMember = getCurrentMember();
  onlineList.innerHTML = onlineMembers
    .map((person) => {
      const isYou = currentMember?.id === person.id;
      return `
        <li class="online-item${isYou ? " online-item-you" : ""}">
          <span class="online-dot" aria-hidden="true"></span>
          <span class="online-avatar">${escapeHtml(getInitials(person.name))}</span>
          <span class="online-name">${escapeHtml(person.name)}</span>
          ${isYou ? '<span class="tag-you">Vous</span>' : ""}
        </li>
      `;
    })
    .join("");
}

async function refreshOnlineMembers() {
  if (!authState.loggedIn || typeof apiFetchOnline !== "function") return;
  try {
    onlineMembers = await apiFetchOnline();
    renderOnlineList();
    if (document.getElementById("tab-membres")?.classList.contains("active")) {
      fillMemberList(memberList, { withAdminActions: false });
    }
  } catch {
    /* ignore */
  }
}

function startOnlinePolling() {
  stopOnlinePolling();
  refreshOnlineMembers();
  onlinePollTimer = setInterval(refreshOnlineMembers, 8000);
}

function stopOnlinePolling() {
  if (onlinePollTimer) {
    clearInterval(onlinePollTimer);
    onlinePollTimer = null;
  }
}

function formatEuro(amount) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getCotisationSource() {
  if (canEditTourneePlanning()) return cotisationsDraft;
  cotisations = loadCotisations();
  return cotisations;
}

function getCotisation(memberId) {
  const source = getCotisationSource();
  const value = source[memberId];
  return value === undefined || value === null ? "" : value;
}

function getMemberCotisationAmount(memberId) {
  const source = canEditTourneePlanning() ? cotisationsDraft : cotisations;
  const value = source?.[memberId];
  return typeof value === "number" && !Number.isNaN(value) ? value : 0;
}

function setCotisationDraft(memberId, value) {
  if (!canEditTourneePlanning()) return;

  if (value === "" || value === null || Number.isNaN(value)) {
    delete cotisationsDraft[memberId];
  } else {
    cotisationsDraft[memberId] = Math.max(0, value);
  }
  updateCotisationTotal();
}

function updateCotisationTotal() {
  const source = getCotisationSource();
  const total = members.reduce((sum, member) => {
    const amount = source[member.id];
    return sum + (typeof amount === "number" ? amount : 0);
  }, 0);
  if (cotisationTotal) cotisationTotal.textContent = formatEuro(total);
}

function saveCotisationsData() {
  if (!canEditTourneePlanning()) {
    if (!isLoggedIn()) {
      alert("Veuillez vous connecter avec votre nom.");
      openLoginModal();
      return;
    }
    alert("Seul un administrateur peut enregistrer la tournée.");
    return;
  }

  const tourneeIssues = validateTourneeDraft();
  if (tourneeIssues.length > 0) {
    showSaveMessage(tourneeIssues[0], "error");
    return;
  }

  cotisations = { ...cotisationsDraft };
  tourneeData = cloneTourneeData(tourneeDraft);
  saveCotisations();
  saveTourneeData();
  showSaveMessage("Tournée et cotisations enregistrées.");
}

function getTourneeMonthSortValue(memberId, useDraft = canEditTourneePlanning()) {
  const monthIndices = getMemberMonthIndices(tourneeYear, memberId, useDraft);
  if (monthIndices.length === 0) return 99;
  return Math.min(...monthIndices.map(tourneeMonthRank));
}

function getTourneeMonthSortLabel(memberId, useDraft = canEditTourneePlanning()) {
  const monthIndices = getMemberMonthIndices(tourneeYear, memberId, useDraft);
  if (monthIndices.length === 0) return "\uFFFF";
  return monthIndices.map((index) => MONTH_LABELS[index]).join(", ");
}

function getTourneeReceptionSortValue(memberId, useDraft = canEditTourneePlanning()) {
  return getMemberReceptionDate(memberId, tourneeYear, useDraft) || "9999-99-99";
}

function getTourneeSortedMembers(useDraft = canEditTourneePlanning()) {
  const sorted = [...members];
  const direction = tourneeSortDir === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    let comparison = 0;

    if (tourneeSortKey === "name") {
      comparison = compareMemberNames(a, b);
    } else if (tourneeSortKey === "month") {
      comparison =
        getTourneeMonthSortValue(a.id, useDraft) - getTourneeMonthSortValue(b.id, useDraft);
      if (comparison === 0) {
        comparison = getTourneeMonthSortLabel(a.id, useDraft).localeCompare(
          getTourneeMonthSortLabel(b.id, useDraft),
          "fr",
          { sensitivity: "base" }
        );
      }
    } else if (tourneeSortKey === "reception") {
      comparison =
        getTourneeReceptionSortValue(a.id, useDraft).localeCompare(
          getTourneeReceptionSortValue(b.id, useDraft)
        );
    }

    if (comparison === 0) {
      comparison = compareMemberNames(a, b);
    }

    return comparison * direction;
  });

  return sorted;
}

function updateTourneeSortHeaders() {
  document.querySelectorAll(".tournee-sort-btn").forEach((button) => {
    const isActive = button.dataset.sort === tourneeSortKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-sort", isActive ? (tourneeSortDir === "asc" ? "ascending" : "descending") : "none");

    const indicator = button.querySelector(".tournee-sort-indicator");
    if (indicator) {
      indicator.textContent = isActive ? (tourneeSortDir === "asc" ? "▲" : "▼") : "";
    }
  });
}

function fillTourneeYearSelect(selectEl, allowEdit) {
  if (!selectEl) return;
  const years = getTourneeYearOptions();
  if (!years.includes(tourneeYear)) {
    tourneeYear = String(new Date().getFullYear());
  }
  selectEl.innerHTML = years
    .map((year) => `<option value="${year}"${year === tourneeYear ? " selected" : ""}>${year}</option>`)
    .join("");
  selectEl.disabled = !allowEdit && years.length <= 1;
}

function renderTourneeYearSelect() {
  const canEdit = canEditTourneePlanning();
  fillTourneeYearSelect(tourneeYearSelect, canEdit);
  fillTourneeYearSelect(tourneeYearPublic, false);
}

function getRistournePayout(memberId) {
  return getMemberCotisationAmount(memberId) * TOURNEE_CYCLE_MONTHS.length;
}

function formatTourneePersonLabel(memberId, withAmount) {
  const member = getMemberById(memberId);
  if (!member) return "";
  if (!withAmount) return member.name;
  return `${member.name} (${formatEuro(getRistournePayout(memberId))})`;
}

function buildTourneeOrderReadout(kind, memberIds) {
  const currentMember = getCurrentMember();
  const withAmount = kind === "ristourne";
  const okLabel = kind === "ristourne" ? "Ristourne reçue" : "Tournée reçue";
  // Lecture seule publique : badge OK seulement (pas de bouton)
  if (!memberIds.length) {
    return `<span class="tournee-order-empty">—</span>`;
  }

  return `<div class="tournee-order-readout">
    ${memberIds
      .map((id) => {
        const member = getMemberById(id);
        if (!member) return "";
        const markedOk = isTourneeMarkOk(kind, id, tourneeYear, false);
        const isYou = currentMember?.id === id;
        return `<span class="tournee-person${markedOk ? " is-ok" : ""}${isYou ? " is-you" : ""}">
          ${markedOk ? `<span class="tag-bouffe-ok" title="${okLabel}">OK</span>` : ""}
          ${escapeHtml(formatTourneePersonLabel(id, withAmount))}
          ${isYou ? '<span class="tag-you">Vous</span>' : ""}
        </span>`;
      })
      .join("")}
  </div>`;
}

function buildTourneeOrderEditor(kind, monthIndex, memberIds) {
  const withAmount = kind === "ristourne";
  const selected = new Set(memberIds);
  const canMarkOk = canMarkTourneeBouffeOk();
  const okLabel = kind === "ristourne" ? "ristourne reçue" : "tournée reçue";
  const chips = memberIds
    .map((id) => {
      const member = getMemberById(id);
      if (!member) return "";
      const markedOk = isTourneeMarkOk(kind, id, tourneeYear, true);
      return `<span class="tournee-order-chip${markedOk ? " is-ok" : ""}">
        ${markedOk ? `<span class="tag-bouffe-ok" title="${okLabel}">OK</span>` : ""}
        ${escapeHtml(formatTourneePersonLabel(id, withAmount))}
        ${
          canMarkOk
            ? `<button type="button" class="btn-bouffe-ok${markedOk ? " is-done" : ""}" data-kind="${escapeHtml(kind)}" data-member-id="${escapeHtml(id)}" title="${markedOk ? `Retirer OK (${okLabel})` : `Valider : ${okLabel}`}">${markedOk ? "Retirer OK" : "OK"}</button>`
            : ""
        }
        <button type="button" class="tournee-order-remove" data-kind="${escapeHtml(kind)}" data-month="${monthIndex}" data-member="${escapeHtml(id)}" aria-label="Retirer ${escapeHtml(member.name)}">×</button>
      </span>`;
    })
    .join("");

  const options = [...members]
    .sort(compareMemberNames)
    .filter((member) => !selected.has(member.id))
    .map(
      (member) =>
        `<option value="${escapeHtml(member.id)}">${escapeHtml(member.name)}</option>`
    )
    .join("");

  return `<div class="tournee-order-edit">
    <div class="tournee-order-chips">${chips || '<span class="tournee-order-empty">Personne</span>'}</div>
    <select class="tournee-order-add" data-kind="${escapeHtml(kind)}" data-month="${monthIndex}" aria-label="Ajouter un poto">
      <option value="">Ajouter un poto…</option>
      ${options}
    </select>
  </div>`;
}

function fillTourneeBody(bodyEl, canEditTournee) {
  if (!bodyEl) return;
  bodyEl.innerHTML = "";

  const months = getTourneeMonthOrder();
  months.forEach((monthIndex, index) => {
    const tr = document.createElement("tr");
    const receptionIds = getTourneeOrderIds("reception", monthIndex, canEditTournee);
    const ristourneIds = getTourneeOrderIds("ristourne", monthIndex, canEditTournee);
    tr.dataset.month = String(monthIndex);

    tr.innerHTML = `
      <td class="tournee-num-cell">${index + 1}</td>
      <td class="tournee-month-cell">${escapeHtml(MONTH_LABELS[monthIndex])}</td>
      <td>
        ${
          canEditTournee
            ? buildTourneeOrderEditor("reception", monthIndex, receptionIds)
            : buildTourneeOrderReadout("reception", receptionIds)
        }
      </td>
      <td>
        ${
          canEditTournee
            ? buildTourneeOrderEditor("ristourne", monthIndex, ristourneIds)
            : buildTourneeOrderReadout("ristourne", ristourneIds)
        }
      </td>
    `;
    bodyEl.appendChild(tr);
  });
}

function fillTourneeCotisationsTable() {
  if (!tourneeCotisationBody) return;
  tourneeCotisationBody.innerHTML = "";

  if (members.length === 0) {
    tourneeCotisationBody.innerHTML = `
      <tr><td colspan="2" class="empty-cell">Aucun membre enregistré.</td></tr>
    `;
    if (cotisationTotal) cotisationTotal.textContent = formatEuro(0);
    return;
  }

  [...members]
    .sort(compareMemberNames)
    .forEach((member) => {
      const tr = document.createElement("tr");
      const amount = getCotisation(member.id);
      tr.innerHTML = `
        <td>${escapeHtml(member.name)}</td>
        <td>
          <div class="amount-input-wrap">
            <input
              type="number"
              class="amount-input"
              data-id="${member.id}"
              min="0"
              step="0.5"
              placeholder="0"
              value="${amount === "" ? "" : amount}"
            />
            <span class="amount-suffix">€</span>
          </div>
        </td>
      `;
      const amountInput = tr.querySelector(".amount-input");
      const applyCotisationDraft = () => {
        if (amountInput.value === "") {
          setCotisationDraft(member.id, "");
          updateCotisationTotal();
          return;
        }
        const parsed = parseFloat(amountInput.value);
        if (!Number.isNaN(parsed)) {
          setCotisationDraft(member.id, parsed);
          updateCotisationTotal();
        }
      };
      amountInput.addEventListener("input", applyCotisationDraft);
      amountInput.addEventListener("change", applyCotisationDraft);
      tourneeCotisationBody.appendChild(tr);
    });

  updateCotisationTotal();
}

function renderTourneeTable() {
  renderTourneeYearSelect();
  const canEdit = canEditTourneePlanning();
  fillTourneeBody(cotisationBody, canEdit);
  fillTourneeBody(cotisationBodyPublic, false);
  const cotisationsBlock = document.getElementById("tourneeCotisationsBlock");
  if (cotisationsBlock) cotisationsBlock.hidden = !canEdit;
  if (canEdit) fillTourneeCotisationsTable();
  refreshFinancierPayBoxes();
  scheduleFitTables();
}

function resolveLegacyTab(tabId) {
  if (!tabId) return null;
  if (tabId === "dettes-amendes" || tabId === "ancienne-tournee" || tabId === "ex-tournee" || tabId === "dettes") return "amendes";
  if (tabId === "dettes") return "amendes";
  if (tabId === "amendes") return tabId;
  if (tabId === "autre-argent" || tabId === "caisse") {
    activeFinanceSub = FINANCE_CAISSE_SUB;
    localStorage.setItem(FINANCE_SUBTAB_KEY, FINANCE_CAISSE_SUB);
    return "finance";
  }
  if (tabId === "gestion") return "admin";
  if (TAB_IDS.includes(tabId)) return tabId;
  return null;
}

function getSavedTab() {
  const queryTab = new URLSearchParams(location.search).get("tab");
  const fromQuery = resolveLegacyTab(queryTab);
  if (fromQuery) return fromQuery;

  const hashTab = location.hash.replace(/^#/, "");
  const fromHash = resolveLegacyTab(hashTab);
  if (fromHash) return fromHash;

  const storedTab = sessionStorage.getItem(ACTIVE_TAB_KEY);
  const fromStored = resolveLegacyTab(storedTab);
  if (fromStored) return fromStored;

  return "reunion";
}

function persistActiveTab(tabId) {
  sessionStorage.setItem(ACTIVE_TAB_KEY, tabId);
  const hash = `#${tabId}`;
  if (location.hash !== hash) {
    history.replaceState(null, "", hash);
  }
}

function canAccessAutreArgentTab() {
  return canAccessCaisse();
}


function buildReunionProgressBar(segments) {
  const total = segments.reduce((s, x) => s + Math.max(0, Number(x.value) || 0), 0) || 1;
  const parts = segments
    .filter((x) => (Number(x.value) || 0) > 0)
    .map((x) => {
      const pct = Math.max(0.8, Math.round(((Number(x.value) || 0) / total) * 1000) / 10);
      return `<span class="reunion-bar-seg" style="width:${pct}%;background:${x.color}" title="${escapeHtml(String(x.label || ""))}: ${x.value}"></span>`;
    })
    .join("");
  return `<div class="reunion-bar" role="img" aria-label="Progression">${parts || `<span class="reunion-bar-seg" style="width:100%;background:#e2e8f0"></span>`}</div>`;
}

function buildReunionHBarChart(rows, color) {
  if (!rows.length) return `<p class="reunion-pct">—</p>`;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const w = 420;
  const rowH = 26;
  const h = rows.length * rowH + 6;
  const labelW = 96;
  const barMax = w - labelW - 72;
  const bars = rows
    .map((r, i) => {
      const y = 4 + i * rowH;
      const bw = Math.max(r.value > 0 ? 3 : 0, Math.round((r.value / max) * barMax));
      return `
        <text x="0" y="${y + 12}" class="reunion-chart-label">${escapeHtml(r.label)}</text>
        <rect x="${labelW}" y="${y}" width="${bw}" height="14" rx="4" fill="${r.color || color || "#0e7490"}"></rect>
        <text x="${labelW + bw + 5}" y="${y + 12}" class="reunion-chart-value">${escapeHtml(r.display || formatEuro(r.value))}</text>
      `;
    })
    .join("");
  return `<svg class="reunion-chart-svg" viewBox="0 0 ${w} ${h}" role="img">${bars}</svg>`;
}


/** Reste dû amende classique (hors dette événement, hors supprimées) */
function getOpenAmendeRemaining(amende) {
  if (!amende || (typeof isAmendeDeleted === "function" && isAmendeDeleted(amende))) return 0;
  if (typeof isDetteAmende === "function" && isDetteAmende(amende)) return 0;
  return Math.max(0, Math.round((Number(amende.amount) || 0) * 100) / 100);
}

/** Reste dû dette événement */
function getOpenDetteEventRemaining(amende) {
  if (!amende || (typeof isAmendeDeleted === "function" && isAmendeDeleted(amende))) return 0;
  if (typeof isDetteAmende !== "function" || !isDetteAmende(amende)) return 0;
  return Math.max(0, Math.round((Number(amende.amount) || 0) * 100) / 100);
}

/** Reste dû ex tournée (amount = reste après remboursement) */
function getOpenExTourneeRemaining(entry) {
  if (!entry || entry.deletedAt) return 0;
  return Math.max(0, Math.round((Number(entry.amount) || 0) * 100) / 100);
}

/** Totaux synchronisés pour Réunion / tableaux */
function getTotalsDettesAmendes() {
  const list = Array.isArray(amendes) ? amendes : [];
  const ancienne = Array.isArray(ancienneTourneeDettes) ? ancienneTourneeDettes : [];
  let amendesDue = 0;
  list.forEach((a) => {
    amendesDue += getOpenAmendeRemaining(a);
  });
  // Dettes événement = impayés sur événements ouverts (pas de ligne amende type dette)
  let dettesDue = 0;
  if (typeof getReunionDettesEventOpen === "function") {
    getReunionDettesEventOpen().forEach((item) => {
      dettesDue += Math.max(0, Number(item.amount) || 0);
    });
  }
  let exDue = 0;
  ancienne.forEach((e) => {
    exDue += getOpenExTourneeRemaining(e);
  });
  return {
    amendesDue: Math.round(amendesDue * 100) / 100,
    dettesDue: Math.round(dettesDue * 100) / 100,
    exDue: Math.round(exDue * 100) / 100,
    totalDue: Math.round((amendesDue + dettesDue + exDue) * 100) / 100,
  };
}

function getReunionDettesEventOpen() {
  // Impayés événements (plus de lignes "dette" séparées)
  const items = [];
  (Array.isArray(evenements) ? evenements : []).forEach((evt) => {
    if (!evt || isEvenementClosed(evt) || isEvenementReimbursed(evt)) return;
    getSortedMembers().forEach((m) => {
      if (isEvenementBeneficiary(evt, m.id)) return;
      if (isEvenementPaid(evt, m.id)) return;
      items.push({
        id: `${evt.id}-${m.id}`,
        memberId: m.id,
        evenementId: evt.id,
        amount: getEvenementShare(evt),
      });
    });
  });
  return items;
}

function getReunionAmendesOpen() {
  const list = Array.isArray(amendes) ? amendes : [];
  return list.filter((a) => getOpenAmendeRemaining(a) > 0.001);
}

function getReunionExTourneeOpen() {
  const list = Array.isArray(ancienneTourneeDettes) ? ancienneTourneeDettes : [];
  return list
    .filter((e) => getOpenExTourneeRemaining(e) > 0.001)
    .map((e) => ({ ...e, remaining: getOpenExTourneeRemaining(e) }));
}

function getReunionEventsOpen() {
  return (Array.isArray(evenements) ? evenements : []).filter(
    (e) => e && !isEvenementClosed(e) && !isEvenementReimbursed(e)
  );
}

function buildReunionDashboardHtml() {
  try {
    const caisseDispo = typeof getCaisseDisponible === "function" ? getCaisseDisponible() : 0;
    const caisseTotal = typeof getCaisseTotal === "function" ? getCaisseTotal() : 0;
    const caisseBrute = typeof getCaisseBrute === "function" ? getCaisseBrute() : caisseDispo;
    const maxEmpruntable = typeof getBorrowableAmount === "function" ? getBorrowableAmount() : 0;
    const eventsIn = typeof getTotalEvenementsInCaisse === "function" ? getTotalEvenementsInCaisse() : 0;

    const votingLoans = (Array.isArray(prets) ? prets : []).filter(
      (l) => l && !isLoanDeleted(l) && l.status === "voting"
    );
    const activeLoans = (Array.isArray(prets) ? prets : []).filter(
      (l) => l && !isLoanDeleted(l) && ["active", "defaulted"].includes(l.status)
    );
    const openEvents = getReunionEventsOpen();
    const openAmendes = getReunionAmendesOpen();
    const openEx = getReunionExTourneeOpen();
    const totalsDA =
      typeof getTotalsDettesAmendes === "function"
        ? getTotalsDettesAmendes()
        : { amendesDue: 0, dettesDue: 0, exDue: 0, totalDue: 0 };
    const eventsUnpaidPeople = openEvents.reduce((s, evt) => {
      const unpaid = getSortedMembers().filter(
        (m) => !isEvenementBeneficiary(evt, m.id) && !isEvenementPaid(evt, m.id)
      );
      return s + unpaid.length;
    }, 0);
    const loansCapital = activeLoans.reduce(
      (s, l) =>
        s +
        (typeof getLoanBalance === "function"
          ? getLoanBalance(l)
          : Math.max(0, (Number(l.amount) || 0) - (Number(l.totalRepaid) || 0))),
      0
    );

    // Total à verser = ce que TOI tu dois encore (événement + amende + ex tournée)
    const me = typeof getCurrentMember === "function" ? getCurrentMember() : null;
    const totalAVerser =
      me && typeof getMemberPersonalDue === "function" ? getMemberPersonalDue(me.id) : 0;

    const countAmendes = openAmendes.length;
    const countEx = openEx.length;
    const kpis = [
      { go: "finance", label: "Disponible", value: formatEuro(caisseDispo), tone: "teal" },
      { go: "prets", label: "Max empruntable", value: formatEuro(maxEmpruntable), tone: "green" },
      { go: "finance", label: "Totale", value: formatEuro(caisseTotal), tone: "navy" },
      { go: "prets", label: "Votes", value: String(votingLoans.length), tone: votingLoans.length ? "warn" : "navy" },
      { go: "finance", label: "Prêts", value: String(activeLoans.length), tone: activeLoans.length ? "warn" : "navy" },
      {
        go: "evenements",
        label: "Événements",
        value: String(openEvents.length),
        tone: openEvents.length ? "warn" : "navy",
      },
      {
        go: "amendes",
        label: "Amendes",
        value: String(countAmendes),
        tone: countAmendes > 0 ? "danger" : "navy",
      },
      {
        go: "amendes",
        label: "Ex tournée",
        value: String(countEx),
        tone: countEx > 0 ? "danger" : "navy",
      },
      {
        go: "amendes",
        label: "Total à verser",
        value: formatEuro(totalAVerser),
        tone: totalAVerser > 0 ? "danger" : "navy",
      },
    ];

    const kpiHtml = `<div class="reunion-kpi-grid">${kpis
      .map(
        (k) => `<button type="button" class="reunion-kpi reunion-kpi-${k.tone}" data-reunion-go="${k.go}">
        <span>${escapeHtml(k.label)}</span><strong>${escapeHtml(k.value)}</strong>
      </button>`
      )
      .join("")}</div>`;

    // Votes
    let voteHtml = "";
    if (votingLoans.length) {
      voteHtml = votingLoans
        .map((loan) => {
          const borrower = getMemberById(loan.borrowerId);
          const stats =
            typeof getVoteStats === "function"
              ? getVoteStats(loan)
              : { yesCount: 0, noCount: 0, pendingCount: 0, voters: [] };
          const totalVoters =
            (stats.voters && stats.voters.length) ||
            stats.yesCount + stats.noCount + stats.pendingCount ||
            1;
          const pctDone = Math.round(((stats.yesCount + stats.noCount) / totalVoters) * 100);
          return `<button type="button" class="reunion-block reunion-link" data-reunion-go="prets">
            <h3>Vote · ${escapeHtml(borrower?.name || "?")} · ${formatEuro(loan.amount)}</h3>
            ${buildReunionProgressBar([
              { value: stats.yesCount, color: "#059669", label: "Oui" },
              { value: stats.noCount, color: "#dc2626", label: "Non" },
              { value: stats.pendingCount, color: "#cbd5e1", label: "Attente" },
            ])}
            <p class="reunion-pct">${pctDone}% · O ${stats.yesCount} · N ${stats.noCount} · A ${stats.pendingCount}</p>
          </button>`;
        })
        .join("");
    }

    // Prêts — montant prêté seulement
    const loansChart = buildReunionHBarChart(
      activeLoans.map((loan) => {
        const remaining =
          typeof getLoanBalance === "function"
            ? getLoanBalance(loan)
            : Math.max(0, (Number(loan.amount) || 0) - (Number(loan.totalRepaid) || 0));
        return {
          label: getMemberById(loan.borrowerId)?.name || "?",
          value: remaining,
        };
      }),
      "#d97706"
    );

    // Événements
    let eventsHtml = "";
    if (openEvents.length) {
      eventsHtml = openEvents
        .map((evt) => {
          const paidCount = getEvenementPaidCount(evt);
          const cotisantCount = getEvenementCotisantCount(evt) || 1;
          const collected = getEvenementCollectedAmount(evt);
          const beneficiary = getMemberById(getEvenementBeneficiaryId(evt));
          return `<button type="button" class="reunion-block reunion-link" data-reunion-go="evenements">
            <h3>${escapeHtml(evt.title)}${beneficiary ? ` · ${escapeHtml(beneficiary.name)}` : ""}</h3>
            ${buildReunionProgressBar([
              { value: paidCount, color: "#2563eb", label: "Payé" },
              { value: Math.max(0, cotisantCount - paidCount), color: "#e2e8f0", label: "Reste" },
            ])}
            <p class="reunion-pct">${paidCount}/${cotisantCount} · ${formatEuro(collected)}</p>
          </button>`;
        })
        .join("");
    }

    // Pas de blocs Caisse / Amendes / Ex tournée en bas : déjà dans les KPI (évite les doublons)
    return `
    ${kpiHtml}
    ${voteHtml}
    <button type="button" class="reunion-block reunion-link reunion-chart-only" data-reunion-go="finance">
      <h3>Prêts en cours — reste dû (${activeLoans.length}) · ${formatEuro(loansCapital)}</h3>
      <div class="reunion-chart-wrap">${loansChart}</div>
    </button>
    ${eventsHtml || `<button type="button" class="reunion-block reunion-link reunion-muted" data-reunion-go="evenements"><h3>Événements</h3><p class="reunion-pct">Aucun ouvert · ${eventsUnpaidPeople} impayé(s) suivi</p></button>`}
  `;
  } catch (err) {
    console.warn("Mode réunion:", err);
    return `<div class="reunion-block"><p class="reunion-list">Impossible d'afficher le mode réunion. Recharge (Ctrl+F5).</p></div>`;
  }
}


document.getElementById("reunionDashboard")?.addEventListener("click", (e) => {
  const go = e.target.closest("[data-reunion-go]");
  if (!go) return;
  const tab = go.getAttribute("data-reunion-go");
  if (!tab) return;
  // Prêts (KPI / graphique) → Finance → Historique (liste de tous les prêts)
  if (tab === "finance") {
    if (typeof FINANCE_ARCHIVES_SUB !== "undefined") {
      activeFinanceSub = FINANCE_ARCHIVES_SUB;
      try {
        localStorage.setItem(FINANCE_SUBTAB_KEY, FINANCE_ARCHIVES_SUB);
      } catch {
        /* ignore */
      }
    }
    showTab("finance");
    const scrollToPretsList = () => {
      const el =
        document.querySelector(".finance-caisse-historique") ||
        document.querySelector(".finance-ledger-title") ||
        document.getElementById("financeSubcontent");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    requestAnimationFrame(() => {
      scrollToPretsList();
      setTimeout(scrollToPretsList, 120);
    });
    return;
  }
  showTab(tab);
});

document.getElementById("loginLogDate")?.addEventListener("change", () => {
  if (typeof renderLoginLog === "function") renderLoginLog({ pull: false });
});

document.addEventListener("click", (e) => {
  const back = e.target.closest("[data-go-reunion]");
  if (back) {
    e.preventDefault();
    showTab("reunion");
    return;
  }
  const adminBack = e.target.closest("[data-go-admin-hub]");
  if (adminBack) {
    e.preventDefault();
    showAdminHub();
    return;
  }
  const adminGo = e.target.closest("[data-admin-go]");
  if (adminGo) {
    e.preventDefault();
    const id = adminGo.getAttribute("data-admin-go");
    if (id) showAdminSub(id);
  }
});

function refreshReunionIfActive() {
  try {
    if (document.getElementById("tab-reunion")?.classList.contains("active")) {
      renderReunion();
    }
  } catch (err) {
    console.warn("refreshReunion:", err);
  }
}

function renderReunion() {
  const root = document.getElementById("reunionDashboard");
  if (!root) {
    console.warn("reunionDashboard introuvable dans le HTML");
    return;
  }
  try {
    root.innerHTML = buildReunionDashboardHtml();
  } catch (err) {
    console.warn("renderReunion:", err);
    root.innerHTML =
      `<div class="reunion-block"><p class="reunion-list">Erreur affichage réunion. Recharge (Ctrl+F5).</p></div>`;
  }
}

function showTab(tabId) {
  const resolved = resolveLegacyTab(tabId);
  if (resolved) tabId = resolved;
  if (tabId === "ex-tournee" || tabId === "dettes") tabId = "amendes";

  if (!TAB_IDS.includes(tabId)) tabId = "reunion";
  // Compte "nouveau" : forcer La loi uniquement
  if (isNouveauMember(getCurrentMember()) && tabId !== "loi") {
    tabId = "loi";
  }
  if (tabId === "admin" && !canAccessAdminTab()) tabId = "reunion";
  if (tabId === "finance" && activeFinanceSub === FINANCE_CAISSE_SUB && !canAccessCaisse()) {
    activeFinanceSub = FINANCE_ARCHIVES_SUB;
  }

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  tabContents.forEach((content) => {
    content.classList.toggle("active", content.id === `tab-${tabId}`);
  });
  if (!document.body.classList.contains("app-menu-open") && window.innerWidth > 900) {
    document.querySelector(`.tab[data-tab="${tabId}"]`)?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }
  closeAppMenu();
  if (tabId !== "admin") closeAdminMenu();
  syncAdminMenuToggle();

  if (tabId === "reunion") {
    reloadFromStorage();
    renderReunion();
  }

  if (tabId === "membres") {
    renderBureau();
    renderMemberList();
    renderOnlineList();
    refreshOnlineMembers();
  }

  if (tabId === "tournee") {
    reloadFromStorage();
    renderTourneeTable();
  }

  if (tabId === "ex-tournee") {
    tabId = "amendes";
  }

  if (tabId === "prets") {
    reloadFromStorage();
    renderPrets();
    markPretNotificationsRead();
  }

  if (tabId === "evenements") {
    reloadFromStorage();
    renderEvenements();
  }

  if (tabId === "communication") {
    reloadFromStorage();
    activeCommunicationSub = "communique";
    renderCommunication();
    focusCommunicationCursor();
  }

  if (tabId === "amendes") {
    reloadFromStorage();
    renderAmendes();
  }

  if (tabId === "finance") {
    reloadFromStorage();
    if (isGroupAdmin() && activeFinanceSub === FINANCE_CAISSE_SUB) {
      activeFinanceSub = FINANCE_ARCHIVES_SUB;
      localStorage.setItem(FINANCE_SUBTAB_KEY, FINANCE_ARCHIVES_SUB);
    }
    renderFinance();
  }

  if (tabId === "loi") {
    reloadFromStorage();
    renderLoi();
  }

  if (tabId === "admin") {
    reloadFromStorage();
    renderAdmin();
  }

  persistActiveTab(tabId);
  updateSessionUI();
  highlightNotificationItem();
}

function getAmendesForMember(memberId) {
  return amendes
    .filter((a) => a.memberId === memberId && !isAmendeDeleted(a))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function getAllAmendes() {
  return [...amendes]
    .filter((a) => !isAmendeDeleted(a))
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
}

function getAmendeById(id) {
  return amendes.find((a) => a.id === id);
}

function updateAmendeFormMode() {
  const isEdit = Boolean(editingAmendeId);
  if (amendeFormTitle) {
    amendeFormTitle.textContent = isEdit ? "Modifier une amende" : "Ajouter une amende";
  }
  if (amendeSubmitBtn) {
    amendeSubmitBtn.textContent = isEdit ? "Enregistrer" : "Ajouter l'amende";
  }
  if (amendeCancelBtn) amendeCancelBtn.hidden = !isEdit;
}

function cancelEditAmende() {
  editingAmendeId = null;
  amendeForm.reset();
  updateAmendeFormMode();
}

function startEditAmende(id) {
  if (!requireTabAccess("amendes", "modifier des amendes")) return;

  const amende = getAmendeById(id);
  if (!amende) return;

  if (isDetteAmende(amende)) {
    alert("Les dettes événements sont créées automatiquement. Supprimez la dette si le membre a payé.");
    return;
  }

  editingAmendeId = id;
  amendeMemberSelect.value = amende.memberId;
  amendeTypeSelect.value = amende.type;
  amendeAmountInput.value = amende.amount;
  amendeNoteInput.value = amende.note || "";
  updateAmendeFormMode();

  addAmendePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getAmendeTypeBadge(typeId) {
  const label = getAmendeTypeLabel(typeId);
  return `<span class="dette-type-badge type-${typeId}">${escapeHtml(label)}</span>`;
}

function getDetteCardCopy(amende) {
  const note = String(amende.note || "").trim();
  if (isDetteAmende(amende)) {
    const eventMatch = note.match(/Événement\s*:\s*([^—]+)/i);
    const potoMatch = note.match(/Poto\s*:\s*(.+)$/i);
    return {
      title: eventMatch ? eventMatch[1].trim() : note || "Dette événement",
      extra: potoMatch ? `Poto ${potoMatch[1].trim()}` : "",
    };
  }
  return {
    title: note || getAmendeTypeLabel(amende.type),
    extra: "",
  };
}

function canManageAmendesActions() {
  return canDo("amendes");
}

function canRepayAmende(amende) {
  if (!amende) return false;
  return canManageAmendesActions();
}

function buildAmendeActionControls(amende, { showEdit = false } = {}) {
  if (!canManageAmendesActions()) return "";
  const remaining = Number(amende.amount) || 0;
  const repaid = getAmendeRepaidAmount(amende);
  if (remaining <= 0) return "";
  return `
    <div class="pret-repay-form amende-action-controls" data-amende-id="${amende.id}">
      ${
        showEdit && !isDetteAmende(amende)
          ? `<button type="button" class="btn-amende-edit" data-id="${amende.id}">Modifier</button>`
          : ""
      }
      ${repaid > 0 ? `<p class="amende-repaid-hint">Déjà versé ${formatEuro(repaid)}</p>` : ""}
      <label class="amende-repay-field">
        <span>Montant reçu</span>
        <input type="number" min="0.5" step="0.5" max="${remaining}" value="${remaining}" class="amende-repay-input pret-repay-input" data-id="${amende.id}" inputmode="decimal" placeholder="ex. 10" aria-label="Montant à valider, reste ${remaining} euros" />
        <span>€</span>
      </label>
      <button type="button" class="btn-primary btn-amende-repay" data-id="${amende.id}">Valider</button>
      <button type="button" class="btn-secondary btn-amende-delete" data-id="${amende.id}">Supprimer</button>
    </div>
  `;
}

function buildDetteCard(amende, { showMember = false, showEdit = false, index = 0 } = {}) {
  const copy = getDetteCardCopy(amende);
  const memberName = getMemberById(amende.memberId)?.name || "—";
  const repaid = getAmendeRepaidAmount(amende);
  const metaParts = [
    showMember ? memberName : "",
    formatFriendlyDate(amende.date),
    copy.extra,
    repaid > 0 ? `déjà ${formatEuro(repaid)}` : "",
  ].filter(Boolean);

  return `
    <article class="dette-card type-${escapeHtml(amende.type)}" id="amende-${escapeHtml(amende.id)}" style="--i: ${index}">
      ${getAmendeTypeBadge(amende.type)}
      <div class="dette-card-main">
        <p class="dette-card-title">${escapeHtml(copy.title)}</p>
        <p class="dette-card-meta">${escapeHtml(metaParts.join(" · "))}</p>
      </div>
      <strong class="dette-card-amount">${formatEuro(amende.amount)}</strong>
      ${buildAmendeActionControls(amende, { showEdit })}
    </article>
  `;
}

function renderDetteBanner(detteList, showAllMembers = false) {
  if (!amendeDetteWrap || !amendeDetteBody) return;

  const showEdit = showAllMembers && canManageTab("amendes");
  const total = detteList.reduce((sum, amende) => sum + amende.amount, 0);

  if (detteList.length === 0) {
    amendeDetteWrap.hidden = true;
    amendeDetteBody.innerHTML = "";
    if (amendeDetteSummary) amendeDetteSummary.innerHTML = "";
    return;
  }

  amendeDetteWrap.hidden = false;

  if (amendeDetteSubtitle) {
    amendeDetteSubtitle.textContent = showAllMembers
      ? "Cotisations non payées — un clic pour les remettre en caisse."
      : "Tes cotisations d'événement encore ouvertes.";
  }

  if (amendeDetteSummary) {
    amendeDetteSummary.innerHTML = `
      <span class="dette-group-total-count">${detteList.length}</span>
      <strong>${formatEuro(total)}</strong>
    `;
  }

  amendeDetteBody.innerHTML = detteList
    .map((amende, index) =>
      buildDetteCard(amende, { showMember: showAllMembers, showEdit, index })
    )
    .join("");
}

function renderAncienneTourneeDettesAdmin() {
  const body = document.getElementById("ancienneTourneeBody");
  const totalEl = document.getElementById("ancienneTourneeTotal");
  const exPanel = document.getElementById("adminExTourneePanel");
  if (exPanel) {
    exPanel.hidden = !(
      canManageTab("amendes") ||
      hasRoleTabAccess("ancienne-tournee") ||
      (typeof isFinancierPoste === "function" && isFinancierPoste()) ||
      isGroupAdmin()
    );
  }
  if (!body) return;

  const rows = [...ancienneTourneeDettes]
    .filter((entry) => entry && !entry.deletedAt)
    .map((entry) => {
      const remaining = Math.round((Number(entry.amount) || 0) * 100) / 100;
      const repaid = Math.round((Number(entry.repaidAmount) || 0) * 100) / 100;
      const original = Math.round((Number(entry.originalAmount) || remaining + repaid) * 100) / 100;
      const member = getMemberById(entry.memberId);
      return {
        id: entry.id,
        domId: `admin-ancienne-${entry.id}`,
        date: entry.createdAt,
        type: "ancienne-tournee",
        detail: member?.name || "—",
        original,
        repaid,
        remaining,
        settled: remaining <= 0,
        actions: remaining > 0
          ? `<div class="amende-admin-actions">
              <button type="button" class="btn-secondary btn-ancienne-tournee-add" data-member-id="${escapeHtml(entry.memberId)}">Ajouter</button>
              <button type="button" class="btn-secondary btn-ancienne-tournee-delete" data-id="${escapeHtml(entry.id)}" onclick="event.preventDefault();event.stopPropagation();window.deleteAncienneTourneeDette && window.deleteAncienneTourneeDette('${escapeHtml(entry.id)}');return false;">Supprimer dette</button>
              ${buildAncienneTourneeRepayControls(entry)}
            </div>`
          : "",
        sortAt: entry.createdAt,
      };
    })
    .sort((a, b) => {
      if (a.settled !== b.settled) return a.settled ? 1 : -1;
      return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
    });

  const total = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  if (totalEl) totalEl.textContent = formatEuro(total);

  renderLedgerInto(body, {
    noun: "dette",
    emptyMeta: "Aucune dette enregistrée",
    emptyText: "Aucune dette enregistrée.",
    rowIdPrefix: "admin-ancienne",
    rows,
  });
}

function getOpenEvenementDebtsForMember(memberId) {
  return evenements
    .filter((evt) => {
      if (isEvenementBeneficiary(evt, memberId)) return false;
      if (isEvenementPaid(evt, memberId)) return false;
      if (evt.payments?.[memberId]?.convertedToDebt) return false;
      return true;
    })
    .map((evt) => ({
      id: evt.id,
      title: evt.title || "Événement",
      amount: getEvenementShare(evt),
      createdAt: evt.createdAt,
    }));
}

function renderOpenEvenementDebts(memberId) {
  const wrap = document.getElementById("detteOpenEvenementWrap");
  const body = document.getElementById("detteOpenEvenementBody");
  const summary = document.getElementById("detteOpenEvenementSummary");
  if (!wrap || !body) return [];
  const items = getOpenEvenementDebtsForMember(memberId);
  if (!items.length) {
    wrap.hidden = true;
    body.innerHTML = "";
    if (summary) summary.innerHTML = "";
    return items;
  }
  wrap.hidden = false;
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  if (summary) {
    summary.innerHTML = `<span class="dette-group-total-count">${items.length}</span><strong>${formatEuro(total)}</strong>`;
  }
  body.innerHTML = items
    .map(
      (item, index) => `
      <article class="dette-card type-dette" id="dette-evenement-${escapeHtml(item.id)}" style="--i: ${index}">
        <span class="dette-pill type-dette">Événement</span>
        <div class="dette-card-main">
          <p class="dette-card-title">${escapeHtml(item.title)}</p>
          <p class="dette-card-meta">${item.createdAt ? escapeHtml(formatFriendlyDate(item.createdAt)) : "À payer"}</p>
        </div>
        <strong class="dette-card-amount">${formatEuro(item.amount)}</strong>
      </article>`
    )
    .join("");
  return items;
}

function renderAncienneTourneeMemberView() {
  const current = getCurrentMember();
  if (!current) return [];
  return getAncienneTourneeEntriesFor(current.id);
}

/** Onglet Ex tournée : toutes les dettes d'ancienne tournée, lecture seule */
function renderExTournee() {
  // Onglet fusionné dans Dettes & amendes
  if (typeof renderAmendes === "function") {
    try { renderAmendes(); } catch { /* ignore */ }
  }
  const container = document.getElementById("exTourneeList");
  if (!container) return;

  const rows = [...ancienneTourneeDettes]
    .map((entry) => {
      const remaining = Math.round((Number(entry.amount) || 0) * 100) / 100;
      const repaid = Math.round((Number(entry.repaidAmount) || 0) * 100) / 100;
      const original = Math.round(
        (Number(entry.originalAmount) || remaining + repaid) * 100
      ) / 100;
      const member = getMemberById(entry.memberId);
      return {
        id: entry.id,
        date: entry.createdAt,
        type: "ancienne-tournee",
        detail: member?.name || "—",
        original,
        repaid,
        remaining,
        settled: remaining <= 0,
        sortAt: entry.createdAt,
      };
    })
    .sort((a, b) => {
      if (a.settled !== b.settled) return a.settled ? 1 : -1;
      return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
    });

  renderLedgerInto(container, {
    title: "Dettes ancienne tournée",
    noun: "dette",
    emptyMeta: "Aucune dette d'ancienne tournée",
    emptyText: "Aucune dette d'ancienne tournée pour le moment.",
    rows,
    rowIdPrefix: "ex-tournee",
    hideTitle: true,
  });
}

function isFinancierPoste() {
  const member = getCurrentMember();
  return !!member && getMemberRole(member.id) === "tresorier";
}

function canRepayAncienneTourneeDette() {
  return isLoggedIn() && (isFinancierPoste() || hasRoleTabAccess("ancienne-tournee"));
}

function addAncienneTourneeDette(memberId, amount) {
  if (!requireTabAccess("ancienne-tournee", "ajouter une dette d'ancienne tournée")) return;

  const member = getMemberById(memberId);
  if (!member || member.id === "groupe") {
    alert("Choisis le poto concerné.");
    return;
  }

  const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Montant invalide.");
    return;
  }

  const nowAt = new Date().toISOString();
  ancienneTourneeDettes.unshift({
    id: generateId(),
    memberId: member.id,
    amount: parsedAmount,
    originalAmount: parsedAmount,
    repaidAmount: 0,
    repayments: [],
    note: "",
    createdAt: nowAt,
    updatedAt: nowAt,
    createdBy: getCurrentMember()?.id || null,
  });

  saveAncienneTourneeDettes();
  if (ancienneTourneeForm) ancienneTourneeForm.reset();
  const msg = document.getElementById("ancienneTourneeSaveMsg");
  if (msg) {
    msg.textContent = `${formatEuro(parsedAmount)} ajoutés à la dette de ${member.name}.`;
    msg.className = "save-msg save-msg-success";
    msg.hidden = false;
  }
}

async function deleteAncienneTourneeDette(entryId) {
  entryId = String(entryId || "").trim();
  if (!entryId) return;

  if (!isLoggedIn()) {
    alert("Connecte-toi pour supprimer.");
    return;
  }
  const canDelete =
    isGroupAdmin() ||
    (typeof canAddDettesAmendesUnified === "function" && canAddDettesAmendesUnified()) ||
    (typeof isFinancierPoste === "function" && isFinancierPoste()) ||
    hasRoleTabAccess("ancienne-tournee") ||
    hasRoleTabAccess("amendes");
  if (!canDelete) {
    alert("Tu n'as pas l'accès pour supprimer une dette d'ex tournée.");
    return;
  }

  const idx = ancienneTourneeDettes.findIndex(
    (item) => item && String(item.id) === entryId && !item.deletedAt
  );
  if (idx < 0) {
    // déjà partie
    const body = document.getElementById("ancienneTourneeBody");
    if (body) body.dataset.ledgerHtml = "";
    if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
    renderAmendes();
    return;
  }

  const entry = ancienneTourneeDettes[idx];
  const member = getMemberById(entry.memberId);
  const memberName = member?.name || "ce poto";
  const amountLabel = formatEuro(entry.amount);

  if (!(await appConfirm(`Supprimer la dette de ${amountLabel} de ${memberName} ?`))) {
    return;
  }

  const now = new Date().toISOString();
  // Tombstone pour la synchro + retrait de la liste active
  const tombstone = {
    id: entry.id,
    memberId: entry.memberId,
    amount: 0,
    originalAmount: entry.originalAmount || entry.amount,
    repaidAmount: entry.repaidAmount || 0,
    note: entry.note || "",
    deletedAt: now,
    updatedAt: now,
    createdAt: entry.createdAt || now,
  };
  ancienneTourneeDettes.splice(idx, 1, tombstone);

  // UI immédiate
  document.getElementById(`admin-ancienne-${entryId}`)?.remove();
  document.querySelectorAll(`[data-id="${entryId}"]`).forEach((el) => {
    el.closest("tr, .amende-history-row, article, .dette-card")?.remove();
  });
  const body = document.getElementById("ancienneTourneeBody");
  if (body) body.dataset.ledgerHtml = "";

  localStorage.setItem(ANCIENNE_TOURNEE_DETTES_KEY, JSON.stringify(ancienneTourneeDettes));
  bumpLiveDataRevision();

  if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
  renderAmendes();
  if (typeof renderMesDettes === "function") renderMesDettes();
  if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
  if (typeof renderReunion === "function") renderReunion();
  showToast?.(`Dette ex tournée de ${memberName} (${amountLabel}) supprimée.`, "success");

  // Sync forcée
  try {
    const raw = localStorage.getItem(ANCIENNE_TOURNEE_DETTES_KEY);
    if (raw && window.queueServerSync) window.queueServerSync(ANCIENNE_TOURNEE_DETTES_KEY, raw);
  } catch {
    /* ignore */
  }
  if (typeof potoFlushSync === "function") {
    try {
      await potoFlushSync();
    } catch {
      /* ignore */
    }
  }
}

async function repayAncienneTourneeDette(entryId, amountValue) {
  const entry = ancienneTourneeDettes.find((item) => item.id === entryId);
  if (!entry) return;

  if (!canRepayAncienneTourneeDette()) {
    alert("Seuls le Financier ou un poste autorisé peuvent rembourser une dette d'ancienne tournée.");
    return;
  }

  const remaining = Math.round((Number(entry.amount) || 0) * 100) / 100;
  if (remaining <= 0) return;

  const raw = amountValue == null || String(amountValue).trim() === ""
    ? String(remaining)
    : String(amountValue).trim().replace(",", ".");
  const payAmount = Math.round(parseFloat(raw) * 100) / 100;
  if (Number.isNaN(payAmount) || payAmount <= 0) {
    alert("Montant invalide.");
    return;
  }
  if (payAmount > remaining) {
    alert(`Impossible de rembourser ${formatEuro(payAmount)} : il reste ${formatEuro(remaining)}.`);
    return;
  }

  const member = getMemberById(entry.memberId);
  const memberName = member?.name || "ce poto";
  const nextRemaining = Math.round((remaining - payAmount) * 100) / 100;
  const isFull = nextRemaining <= 0;
  if (
    !(await appConfirm(
      isFull
        ? `Rembourser ${formatEuro(payAmount)} (${memberName}) ?\nLa dette sera soldée et ${formatEuro(payAmount)} ira dans la caisse disponible.`
        : `Rembourser ${formatEuro(payAmount)} sur ${formatEuro(remaining)} (${memberName}) ?\nIl restera ${formatEuro(nextRemaining)}.\n${formatEuro(payAmount)} ira dans la caisse disponible.`
    ))
  ) {
    return;
  }

  autreArgent.unshift({
    id: generateId(),
    memberId: entry.memberId,
    amount: payAmount,
    type: "don",
    motif: "Remboursement dette ancienne tournée",
    note: isFull
      ? "Remboursement dette ancienne tournée (soldée)"
      : `Remboursement partiel dette ancienne tournée (${formatEuro(payAmount)})`,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentMember()?.id || null,
  });
  saveAutreArgent(false);

  if (!entry.originalAmount) entry.originalAmount = remaining;
  entry.repaidAmount = Math.round(((Number(entry.repaidAmount) || 0) + payAmount) * 100) / 100;
  if (!Array.isArray(entry.repayments)) entry.repayments = [];
  entry.repayments.unshift({
    id: generateId(),
    amount: payAmount,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentMember()?.id || null,
  });

  if (isFull) {
    entry.amount = 0;
  } else {
    entry.amount = nextRemaining;
  }

  saveAncienneTourneeDettes();
  renderAutreArgent();
  renderPrets();
  renderFinanceDashboard();

  const msg = document.getElementById("ancienneTourneeSaveMsg");
  if (msg) {
    msg.textContent = isFull
      ? `${formatEuro(payAmount)} de ${memberName} — dette soldée, ajouté à la caisse disponible.`
      : `${formatEuro(payAmount)} de ${memberName} ajouté à la caisse. Reste ${formatEuro(nextRemaining)}.`;
    msg.className = "save-msg save-msg-success";
    msg.hidden = false;
  }

  alert(
    isFull
      ? `Dette soldée — ${formatEuro(payAmount)} ajouté à la caisse disponible.\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
      : `Remboursement partiel comptabilisé — ${formatEuro(payAmount)} en caisse.\nReste dû : ${formatEuro(nextRemaining)}\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
  );
}

function renderDebtDashboard(target, items, emptyMeta, chipBuilder) {
  if (!target) return;
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const lineCount = items.length;

  if (total <= 0 && lineCount === 0) {
    target.innerHTML = `
      <div class="dette-status dette-status--clear">
        <span class="dette-status-mark" aria-hidden="true">✓</span>
        <div class="dette-status-copy">
          <p class="dette-status-kicker">Tout est à jour</p>
          <strong class="dette-status-title">Rien à régler</strong>
          <p class="dette-status-meta">${escapeHtml(emptyMeta)}</p>
        </div>
      </div>
    `;
    return;
  }

  const chips = typeof chipBuilder === "function" ? chipBuilder(items) : [];
  target.innerHTML = `
    <div class="dette-status dette-status--due">
      <div class="dette-status-copy">
        <p class="dette-status-kicker">À régler</p>
        <strong class="dette-status-amount">${formatEuro(total)}</strong>
        <p class="dette-status-meta">${lineCount} ligne${lineCount > 1 ? "s" : ""} en cours</p>
      </div>
      ${chips.length ? `<div class="dette-pills">${chips.join("")}</div>` : ""}
    </div>
  `;
}

function getAmendeDetailText(amende) {
  const copy = getDetteCardCopy(amende);
  const typeLabel = getAmendeTypeLabel(amende.type);
  if (copy.title && copy.title !== typeLabel) return copy.title;
  return String(amende.note || "").trim() || "—";
}

function buildMesAmendesRows(memberId) {
  const open = getRegularAmendes(getAmendesForMember(memberId));
  const openIds = new Set(open.map((amende) => amende.id));
  const rows = open.map((amende) => {
    const remaining = Math.round((Number(amende.amount) || 0) * 100) / 100;
    const repaid = getAmendeRepaidAmount(amende);
    const original = Math.round(
      (Number(amende.originalAmount) || remaining + repaid) * 100
    ) / 100;
    return {
      id: amende.id,
      date: amende.date,
      type: amende.type,
      detail: getAmendeDetailText(amende),
      original,
      repaid,
      remaining,
      settled: remaining <= 0,
      sortAt: amende.settledAt || amende.date,
    };
  });

  const paidGroups = new Map();
  amendesCaisse
    .filter((entry) => entry.memberId === memberId && entry.type !== "dette")
    .forEach((entry) => {
      const key = entry.sourceAmendeId || `caisse-${entry.id}`;
      if (entry.sourceAmendeId && openIds.has(entry.sourceAmendeId)) return;
      if (!paidGroups.has(key)) paidGroups.set(key, []);
      paidGroups.get(key).push(entry);
    });

  paidGroups.forEach((entries, key) => {
    const repaid = Math.round(
      entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0) * 100
    ) / 100;
    const chronological = [...entries].sort(
      (a, b) => new Date(a.paidAt || 0) - new Date(b.paidAt || 0)
    );
    const first = chronological[0];
    const last = chronological[chronological.length - 1];
    rows.push({
      id: key,
      date: first?.paidAt || last?.paidAt,
      type: last?.type || "sanctions",
      detail: last?.note || getAmendeTypeLabel(last?.type),
      original: repaid,
      repaid,
      remaining: 0,
      settled: true,
      sortAt: last?.paidAt,
    });
  });

  rows.sort((a, b) => {
    if (a.settled !== b.settled) return a.settled ? 1 : -1;
    return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
  });
  return rows;
}

function renderLedgerHero(el, { total, openCount, noun, emptyMeta }) {
  if (!el) return;
  const plural = openCount > 1 ? "s" : "";
  el.className = `amende-hero ${total > 0 ? "is-due" : "is-clear"}`;
  el.innerHTML = total > 0
    ? `
      <div class="amende-hero-copy">
        <p class="amende-hero-kicker">Total à régler</p>
        <strong class="amende-hero-amount">${formatEuro(total)}</strong>
        <p class="amende-hero-meta">${openCount} ${noun}${plural} en cours</p>
      </div>`
    : `
      <span class="amende-hero-mark" aria-hidden="true">✓</span>
      <div class="amende-hero-copy">
        <p class="amende-hero-kicker">Tout est à jour</p>
        <strong class="amende-hero-amount">0 €</strong>
        <p class="amende-hero-meta">${escapeHtml(emptyMeta)}</p>
      </div>`;
}

function renderLedgerTable(rows, { body, foot, wrap, emptyText, rowIdPrefix }) {
  if (!body) return;

  if (wrap) wrap.hidden = false;

  if (!rows.length) {
    body.innerHTML = `<tr class="amende-empty-row"><td colspan="7">${escapeHtml(emptyText)}</td></tr>`;
    if (foot) foot.innerHTML = "";
    return;
  }

  body.innerHTML = rows.map((row) => buildLedgerDataRowHtml(row, rowIdPrefix, false)).join("");

  if (foot) {
    foot.innerHTML = buildLedgerFootHtml(rows, false);
  }
  scheduleFitTables();
}

function buildMesDettesRows(memberId) {
  // Cohérence des onglets :
  // - prêts → onglet Prêts
  // - cotisations d'événements ouvertes → onglet Événements
  // - ici : dettes converties + ancienne tournée
  const rows = [];

  getAmendesForMember(memberId)
    .filter((amende) => isDetteAmende(amende))
    .forEach((amende) => {
      const remaining = Math.round((Number(amende.amount) || 0) * 100) / 100;
      const repaid = getAmendeRepaidAmount(amende);
      const original = Math.round(
        (Number(amende.originalAmount) || remaining + repaid) * 100
      ) / 100;
      rows.push({
        id: amende.id,
        date: amende.date,
        type: "dette",
        detail: getAmendeDetailText(amende),
        original,
        repaid,
        remaining,
        settled: remaining <= 0,
        sortAt: amende.settledAt || amende.date,
      });
    });

  getAncienneTourneeEntriesFor(memberId).forEach((entry) => {
    const remaining = Math.round((Number(entry.amount) || 0) * 100) / 100;
    const repaid = Math.round((Number(entry.repaidAmount) || 0) * 100) / 100;
    const original = Math.round(
      (Number(entry.originalAmount) || remaining + repaid) * 100
    ) / 100;
    rows.push({
      id: entry.id,
      date: entry.createdAt,
      type: "ancienne-tournee",
      detail: String(entry.note || "").trim() || "Ex tournée",
      original,
      repaid,
      remaining,
      settled: remaining <= 0,
      sortAt: entry.createdAt,
    });
  });

  rows.sort((a, b) => {
    if (a.settled !== b.settled) return a.settled ? 1 : -1;
    return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
  });
  return rows;
}

function renderAmendeTable(rows) {
  renderLedgerTable(rows, {
    body: amendeBody,
    foot: document.getElementById("amendeTableFoot"),
    wrap: amendeRegularWrap,
    emptyText: "Aucune amende pour le moment.",
    rowIdPrefix: "amende",
  });
}

function renderDetteTable(rows) {
  renderLedgerTable(rows, {
    body: detteBody,
    foot: document.getElementById("detteTableFoot"),
    wrap: document.getElementById("detteRegularWrap"),
    emptyText: "Aucune dette pour le moment.",
    rowIdPrefix: "dette",
  });
}

function buildMesDettesAmendesRows(memberId) {
  const rows = [
    ...buildMesAmendesRows(memberId),
    ...buildMesDettesRows(memberId),
  ];
  rows.sort((a, b) => {
    if (a.settled !== b.settled) return a.settled ? 1 : -1;
    return new Date(b.sortAt || b.date || 0) - new Date(a.sortAt || a.date || 0);
  });
  return rows;
}

function renderMesDettes() {
  // Alias : un seul tableau avec les amendes
  renderMesAmendes();
}

function renderMesAmendes() {
  const current = getCurrentMember();
  if (!current) return;
  const rows = buildMesDettesAmendesRows(current.id);
  const total = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const openCount = rows.filter((row) => !row.settled).length;
  if (amendeTitle) amendeTitle.textContent = "Dettes & amendes";
  if (amendeSubtitle) {
    amendeSubtitle.hidden = false;
    amendeSubtitle.textContent = `Pour ${current.name} — amendes, dettes d’événements et dettes d’ex tournée (hors prêts).`;
  }
  renderLedgerHero(amendeSummary, {
    total,
    openCount,
    noun: "ligne",
    emptyMeta: "Rien à régler pour le moment",
  });
  renderAmendeTable(rows);
  // Ancien bloc dettes retiré du HTML : ne rien rendre ailleurs
  if (detteBody) detteBody.innerHTML = "";
  const detteFoot = document.getElementById("detteTableFoot");
  if (detteFoot) detteFoot.innerHTML = "";
  if (detteSummary) detteSummary.innerHTML = "";
}

function renderAmendes() {
  renderMesAmendes();
  refreshFinancierPayBoxes();
}

function parseAmendeAmount(amount) {
  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
    alert("Montant invalide.");
    return null;
  }
  return parsedAmount;
}


window.deleteAncienneTourneeDette = deleteAncienneTourneeDette;

function canAddDettesAmendesUnified() {
  if (!isLoggedIn()) return false;
  if (isGroupAdmin()) return true;
  return (
    hasRoleTabAccess("amendes") ||
    hasRoleTabAccess("ancienne-tournee") ||
    (typeof isFinancierPoste === "function" && isFinancierPoste())
  );
}

/** Ajout unifié : amende | ex tournée — motif obligatoire, sync par id (pas de dette manuelle) */
async function submitUnifiedDettesAmendesLine({ memberId, type, amount, note }) {
  if (!canAddDettesAmendesUnified()) {
    alert("Tu n'as pas l'accès pour ajouter une ligne.");
    return false;
  }
  const motif = String(note || "").trim();
  if (!motif) {
    alert("Le motif est obligatoire.");
    return false;
  }
  const member = getMemberById(memberId);
  if (!member || member.id === "groupe") {
    alert("Choisis la personne.");
    return false;
  }
  const parsedAmount = Math.round(parseFloat(String(amount).replace(",", ".")) * 100) / 100;
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Montant invalide.");
    return false;
  }

  const now = new Date().toISOString();
  const kind = String(type || "").trim();

  if (kind === "dette" || kind === "evenement") {
    alert(
      "Les dettes d’événements se créent automatiquement quand un événement n’est pas payé.\nTu ne peux pas en ajouter manuellement ici."
    );
    return false;
  }

  if (kind === "ex-tournee" || kind === "ancienne-tournee") {
    ancienneTourneeDettes.unshift({
      id: generateId(),
      memberId: member.id,
      amount: parsedAmount,
      originalAmount: parsedAmount,
      repaidAmount: 0,
      repayments: [],
      note: motif,
      createdAt: now,
      updatedAt: now,
      createdBy: getCurrentMember()?.id || null,
    });
    saveAncienneTourneeDettes();
    if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
  } else {
    // absence, retard, bavardage, sanctions uniquement
    const allowed = new Set(["absence", "retard", "bavardage", "sanctions"]);
    const amendeType = allowed.has(kind) ? kind : "sanctions";
    amendes.unshift({
      id: generateId(),
      memberId: member.id,
      type: amendeType,
      amount: parsedAmount,
      originalAmount: parsedAmount,
      repaidAmount: 0,
      note: motif,
      date: now,
      createdAt: now,
      updatedAt: now,
    });
    saveAmendes();
  }

  if (typeof potoFlushSync === "function") {
    try {
      await potoFlushSync();
    } catch {
      /* ignore */
    }
  }
  renderAmendes();
  renderAmendesAdminHistory();
  if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  showToast?.(
    `${formatEuro(parsedAmount)} ajouté pour ${member.name} (${getAmendeTypeLabel(kind === "ex-tournee" ? "ancienne-tournee" : kind)}).`,
    "success"
  );
  return true;
}

