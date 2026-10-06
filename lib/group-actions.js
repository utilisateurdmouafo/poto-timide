const LOAN_VOTE_HOURS = 24;
const CAISSE_RESERVE_PER_MEMBER = 20;
const LOAN_INTEREST_RATE = 0.1;
const REPAYMENT_MONTH1_RATIO = 0.8;
const OPEN_BORROWER_STATUSES = new Set(["voting", "awaiting_financier", "active", "defaulted"]);
const CAISSE_LOAN_STATUSES = new Set(["active", "defaulted", "completed"]);

function amount(value) {
  const parsed = Math.round(Number(String(value ?? "").replace(",", ".")) * 100) / 100;
  return Number.isFinite(parsed) ? parsed : null;
}

function sum(list, selector) {
  return (Array.isArray(list) ? list : []).reduce((total, item) => total + selector(item), 0);
}

function arrayData(data, key) {
  return Array.isArray(data[key]) ? [...data[key]] : [];
}

function caisseAvailable(data, loans) {
  const members = (Array.isArray(data["poto-timide-members"]) ? data["poto-timide-members"] : [])
    .filter((member) => member && member.kind !== "nouveau");
  const finesCaisse = arrayData(data, "poto-timide-amendes-caisse");
  const fines = sum(finesCaisse, (entry) => (entry && !entry.deletedAt ? Number(entry.amount) || 0 : 0));
  const annualFund = data["poto-timide-fond-caisse-annuel"] || {};
  const years = annualFund.years && typeof annualFund.years === "object" ? annualFund.years : annualFund;
  const annualTotal = sum(Object.values(years), (year) => {
    if (typeof year === "number") return Number(year) || 0;
    if (!year || typeof year !== "object") return 0;
    if (year.payments && typeof year.payments === "object") {
      return sum(Object.values(year.payments), (payment) =>
        payment && typeof payment === "object"
          ? (payment.paid ? Number(payment.paidAmount ?? payment.amount) || 0 : 0)
          : (payment ? Number(year.amountPerMember) || 0 : 0),
      );
    }
    return Number(year.totalPaid ?? year.amount) || 0;
  });
  const events = arrayData(data, "poto-timide-evenements");
  const eventDebtDeductions = sum(events, (event) => Number(event?.caisseDebtDeduction) || 0);
  const otherMoney = arrayData(data, "poto-timide-autre-argent");
  const otherTotal = sum(otherMoney, (entry) => {
    if (!entry || entry.deletedAt) return 0;
    const value = Number(entry.amount) || 0;
    return entry.type === "retrait" || value < 0 ? -Math.abs(value) : Math.max(0, value);
  },
  );
  const base =
    Math.max(
      0,
      (Number(data["poto-timide-fond-caisse"]) || 0) +
        annualTotal +
        fines -
        eventDebtDeductions,
    ) +
    otherTotal;
  const loanImpact = sum(loans, (loan) => {
    if (!loan || loan.deletedAt || !CAISSE_LOAN_STATUSES.has(loan.status)) return 0;
    return -(Number(loan.amount) || 0) + (Number(loan.totalRepaid) || 0);
  });
  return Math.max(0, base + loanImpact);
}

function assert(condition, message, status = 400) {
  if (condition) return;
  const error = new Error(message);
  error.status = status;
  throw error;
}

function purgeMemberFromTournee(data, memberId) {
  for (const yearData of Object.values(data?.years || {})) {
    if (!yearData || typeof yearData !== "object") continue;
    for (const key of Object.keys(yearData)) {
      const value = yearData[key];
      if (key === "partners" && value && typeof value === "object") {
        delete value[memberId];
        for (const [otherId, monthPartners] of Object.entries(value)) {
          for (const [monthKey, partnerId] of Object.entries(monthPartners || {})) {
            if (partnerId === memberId) delete monthPartners[monthKey];
          }
          if (!Object.keys(monthPartners || {}).length) delete value[otherId];
        }
        if (!Object.keys(value).length) delete yearData[key];
      } else if (["bouffeOk", "receptionOk", "ristourneOk", "receptionDates"].includes(key)) {
        if (value?.[memberId]) {
          delete value[memberId];
          if (!Object.keys(value).length) delete yearData[key];
        }
      } else if (key === "reception" || key === "ristourne") {
        for (const monthKey of Object.keys(value || {})) {
          if (!Array.isArray(value[monthKey])) continue;
          value[monthKey] = value[monthKey].filter((id) => id !== memberId);
          if (!value[monthKey].length) delete value[monthKey];
        }
        if (!Object.keys(value || {}).length) delete yearData[key];
      } else if (!Number.isNaN(Number(key)) && Array.isArray(value)) {
        yearData[key] = value.filter((id) => id !== memberId);
        if (!yearData[key].length) delete yearData[key];
      }
    }
  }
}

function applyGroupAction(data, actor, action, now = new Date().toISOString(), id = () => crypto.randomUUID()) {
  const loans = arrayData(data, "poto-timide-prets");
  const fines = arrayData(data, "poto-timide-amendes");
  const fineCash = arrayData(data, "poto-timide-amendes-caisse");
  const members = Array.isArray(data["poto-timide-members"]) ? data["poto-timide-members"] : [];
  const memberById = new Map(members.map((member) => [String(member.id), member]));
  const actorMember = memberById.get(String(actor.id));
  assert(actorMember, "Membre introuvable.", 403);

  let changedKeys = [];
  let result;
  const updateList = (list, key, next) => {
    data[key] = next;
    changedKeys.push(key);
  };

  if (action?.domain === "member" && action.type === "delete") {
    assert(actor.canManageMembers, "Seuls les gestionnaires autorisés peuvent supprimer des membres.", 403);
    const memberId = String(action.memberId || "");
    assert(memberById.has(memberId), "Membre introuvable.", 404);
    assert(
      memberId !== String(actor.ownerId || ""),
      "Le propriétaire du site ne peut pas être supprimé.",
      403,
    );

    const events = arrayData(data, "poto-timide-evenements");
    const removedEventIds = new Set();
    const remainingEvents = [];
    for (const event of events) {
      if (String(event?.beneficiaryMemberId) === memberId) {
        removedEventIds.add(String(event.id));
        continue;
      }
      if (event?.payments?.[memberId]) delete event.payments[memberId];
      if (String(event?.createdBy) === memberId) event.createdBy = null;
      remainingEvents.push(event);
    }

    const roles = { ...(data["poto-timide-roles"] || {}) };
    for (const [roleId, assignedMemberId] of Object.entries(roles)) {
      if (String(assignedMemberId) === memberId) delete roles[roleId];
    }
    data["poto-timide-roles"] = roles;

    const cotisations = { ...(data["poto-timide-cotisations"] || {}) };
    delete cotisations[memberId];
    data["poto-timide-cotisations"] = cotisations;

    const tournee = data["poto-timide-tournee"] || { years: {} };
    purgeMemberFromTournee(tournee, memberId);
    data["poto-timide-tournee"] = tournee;

    const annualFund = data["poto-timide-fond-caisse-annuel"] || {};
    for (const yearData of Object.values(annualFund.years || {})) {
      if (yearData?.payments) delete yearData.payments[memberId];
    }
    data["poto-timide-fond-caisse-annuel"] = annualFund;

    const adminValue = data["poto-timide-admin-ids"];
    const adminIds = Array.isArray(adminValue)
      ? adminValue
      : Array.isArray(adminValue?.ids)
        ? adminValue.ids
        : [];
    data["poto-timide-admin-ids"] = Array.isArray(adminValue)
      ? adminIds.filter((value) => String(value) !== memberId)
      : {
          ...(adminValue || {}),
          ids: adminIds.filter((value) => String(value) !== memberId),
          updatedAt: now,
        };

    updateList(members, "poto-timide-members", members.filter((member) => String(member.id) !== memberId));
    updateList(fines, "poto-timide-amendes", fines.filter(
      (fine) =>
        String(fine?.memberId) !== memberId &&
        !removedEventIds.has(String(fine?.evenementId || fine?.eventId || "")),
    ));
    updateList(fineCash, "poto-timide-amendes-caisse", fineCash.filter(
      (entry) => String(entry?.memberId) !== memberId,
    ));
    updateList(loans, "poto-timide-prets", loans
      .filter((loan) => String(loan?.borrowerId) !== memberId)
      .map((loan) => {
        const votes = { ...(loan.votes || {}) };
        delete votes[memberId];
        return { ...loan, votes };
      }));
    updateList(events, "poto-timide-evenements", remainingEvents);
    for (const [key, list] of [
      ["poto-timide-notifications", arrayData(data, "poto-timide-notifications")],
      ["poto-timide-autre-argent", arrayData(data, "poto-timide-autre-argent")],
      ["poto-timide-ancienne-tournee-dettes", arrayData(data, "poto-timide-ancienne-tournee-dettes")],
    ]) {
      updateList(list, key, list.filter((item) => String(item?.memberId) !== memberId));
    }
    changedKeys.push(
      "poto-timide-roles",
      "poto-timide-cotisations",
      "poto-timide-tournee",
      "poto-timide-admin-ids",
      "poto-timide-fond-caisse-annuel",
    );
    result = { memberId, removedEventIds: [...removedEventIds] };
  } else if (action?.domain === "event") {
    assert(actor.canManageEvents, "Seuls les gestionnaires autorisés peuvent modifier les événements.", 403);
    const events = arrayData(data, "poto-timide-evenements");
    const groupMembers = members.filter((member) => member && member.kind !== "nouveau");
    if (action.type === "create") {
      const title = String(action.title || "").trim();
      const note = String(action.description || "").trim();
      const beneficiaryMemberId = String(action.beneficiaryMemberId || "");
      const beneficiary = memberById.get(beneficiaryMemberId);
      const sharePerMember = amount(action.sharePerMember);
      assert(title.length > 0 && title.length <= 120, "Le titre est obligatoire (120 caractères maximum).");
      assert(note.length <= 1000, "La description est trop longue.");
      assert(beneficiary && beneficiary.kind !== "nouveau", "Membre bénéficiaire invalide.", 404);
      const cotisantCount = groupMembers.filter((member) => member.id !== beneficiaryMemberId).length;
      assert(cotisantCount > 0, "Il faut au moins deux membres pour créer un événement.");
      assert(sharePerMember !== null && sharePerMember > 0, "Montant invalide.");
      const payments = Object.fromEntries(
        groupMembers
          .filter((member) => member.id !== beneficiaryMemberId)
          .map((member) => [member.id, { paid: false, paidAt: null, validatedBy: null }]),
      );
      result = {
        id: id(),
        title,
        description: note,
        beneficiaryMemberId,
        totalAmount: Math.round(sharePerMember * cotisantCount * 100) / 100,
        sharePerMember,
        memberCount: cotisantCount,
        payments,
        createdAt: now,
        updatedAt: now,
        createdBy: actor.id,
      };
      updateList(events, "poto-timide-evenements", [result, ...events]);
    } else if (action.type === "reset-closed") {
      assert(actor.isAdmin, "Seul un administrateur peut réinitialiser les événements clôturés.", 403);
      const closedEvents = events.filter((event) => event && !event.deletedAt && event.closed);
      assert(closedEvents.length > 0, "Aucun événement clôturé à réinitialiser.", 409);
      const closedIds = new Set(closedEvents.map((event) => event.id));
      const deletedAt = now;
      const nextEvents = events.map((event) =>
        closedIds.has(event?.id) ? { ...event, deletedAt, updatedAt: deletedAt } : event,
      );
      const nextFines = fines.map((fine) =>
        fine &&
        !fine.deletedAt &&
        fine.type === "dette" &&
        closedIds.has(fine.evenementId || fine.eventId)
          ? { ...fine, amount: 0, deletedAt, updatedAt: deletedAt }
          : fine,
      );
      updateList(nextEvents, "poto-timide-evenements", nextEvents);
      if (nextFines.some((fine, index) => fine !== fines[index])) {
        data["poto-timide-amendes"] = nextFines;
        changedKeys.push("poto-timide-amendes");
      }
      result = { deletedCount: closedEvents.length };
    } else {
      const eventId = String(action.eventId || "");
      const index = events.findIndex((event) => event?.id === eventId && !event.deletedAt);
      assert(index >= 0, "Événement introuvable.", 404);
      const event = { ...events[index], payments: { ...(events[index].payments || {}) } };
      const beneficiaryId = String(event.beneficiaryMemberId || "");
      const eventMembers = groupMembers.filter((member) => member.id !== beneficiaryId);
      const collected = Math.round(
        eventMembers.reduce((total, member) => {
          const payment = event.payments[member.id];
          if (!payment?.paid) return total;
          return total + (Number(payment.paidAmount ?? event.sharePerMember) || 0);
        }, 0) * 100,
      ) / 100;
      const unpaidMembers = eventMembers.filter((member) => !event.payments[member.id]?.paid);
      if (action.type === "payment" || action.type === "update-payment") {
        assert(!event.closed, "Cet événement est clôturé.", 409);
        assert(!event.reimbursedToBeneficiary, "Cet événement a déjà été remboursé au poto.", 409);
        const memberId = String(action.memberId || "");
        const member = memberById.get(memberId);
        assert(member && member.kind !== "nouveau", "Membre introuvable.", 404);
        assert(memberId !== beneficiaryId, "Le bénéficiaire ne cotise pas à son propre événement.");
        assert(
          action.type === "payment"
            ? !event.payments[memberId]?.paid
            : Boolean(event.payments[memberId]?.paid),
          action.type === "payment" ? "Ce paiement a déjà été validé." : "Paiement introuvable.",
          409,
        );
        const paymentAmount = amount(action.amount);
        assert(paymentAmount !== null && paymentAmount > 0, "Montant invalide.");
        event.payments[memberId] = {
          ...event.payments[memberId],
          paid: true,
          paidAt: now,
          validatedBy: actor.id,
          paidAmount: paymentAmount,
        };
        delete event.payments[memberId].convertedToDebt;
        delete event.payments[memberId].debtCreatedAt;
      } else if (action.type === "cancel-payment") {
        assert(!event.closed, "Cet événement est clôturé.", 409);
        assert(!event.reimbursedToBeneficiary, "Cet événement a déjà été remboursé au poto.", 409);
        const memberId = String(action.memberId || "");
        assert(event.payments[memberId], "Paiement introuvable.", 404);
        event.payments[memberId] = {
          paid: false,
          paidAt: null,
          validatedBy: null,
          paidAmount: null,
        };
      } else if (action.type === "payment-bulk") {
        assert(!event.closed && !event.reimbursedToBeneficiary, "Cet événement est clôturé ou déjà remboursé.", 409);
        assert(unpaidMembers.length > 0, "Tout le monde a déjà payé.", 409);
        for (const member of unpaidMembers) {
          event.payments[member.id] = {
            ...event.payments[member.id],
            paid: true,
            paidAt: now,
            validatedBy: actor.id,
            paidAmount: Number(event.sharePerMember) || 0,
          };
        }
        result = { event, count: unpaidMembers.length };
      } else if (action.type === "reimburse") {
        assert(!event.closed, "Cet événement est clôturé.", 409);
        assert(!event.reimbursedToBeneficiary, "Cet événement a déjà été remboursé au poto.", 409);
        const share = Number(event.sharePerMember) || 0;
        const unpaidTotal = Math.round(unpaidMembers.length * share * 100) / 100;
        assert(collected > 0 || unpaidMembers.length > 0, "Aucun paiement collecté et aucune cotisation en attente.", 409);
        event.reimbursedToBeneficiary = true;
        event.reimbursedAt = now;
        event.reimbursedBy = actor.id;
        event.reimbursedAmount = collected;
        event.caisseDebtDeduction = unpaidTotal;
        const debts = [];
        for (const member of unpaidMembers) {
          const current = event.payments[member.id] || {};
          if (current.debtDismissed) continue;
          event.payments[member.id] = { ...current, convertedToDebt: true, debtCreatedAt: now, debtAmount: share };
          debts.push({
            id: id(),
            memberId: member.id,
            type: "dette",
            evenementId: event.id,
            amount: share,
            originalAmount: share,
            repaidAmount: 0,
            note: event.title,
            date: now,
            createdAt: now,
            updatedAt: now,
            createdBy: actor.id,
          });
        }
        if (debts.length) updateList(fines, "poto-timide-amendes", [...debts, ...fines]);
        result =  { event, collected, unpaidCount: unpaidMembers.length, unpaidTotal };
      } else if (action.type === "close") {
        assert(!event.closed, "Cet événement est déjà clôturé.", 409);
        assert(event.reimbursedToBeneficiary, "Remboursez d'abord le poto avant de clôturer l'événement.", 409);
        event.closed = true;
        event.closedAt = now;
        event.closedBy = actor.id;
      } else if (action.type === "delete") {
        const deletedFines = fines.map((fine) =>
          fine &&
          !fine.deletedAt &&
          fine.type === "dette" &&
          (fine.evenementId || fine.eventId) === eventId
            ? { ...fine, amount: 0, deletedAt: now, updatedAt: now }
            : fine,
        );
        if (deletedFines.some((fine, fineIndex) => fine !== fines[fineIndex])) {
          data["poto-timide-amendes"] = deletedFines;
          changedKeys.push("poto-timide-amendes");
        }
        event.deletedAt = now;
      } else if (action.type !== "payment-bulk") {
        assert(false, "Opération d’événement inconnue.");
      }
      event.updatedAt = now;
      events[index] = event;
      updateList(events, "poto-timide-evenements", events);
      if (action.type !== "payment-bulk" && action.type !== "reimburse") result = event;
      if (action.type === "payment-bulk" || action.type === "reimburse") {
        result.event = event;
      }
    }
  } else if (action?.domain === "old-debt") {
    assert(actor.canManageFines, "Accès refusé pour gérer les dettes d’ancienne tournée.", 403);
    const debts = arrayData(data, "poto-timide-ancienne-tournee-dettes");
    if (action.type === "add") {
      const memberId = String(action.memberId || "");
      assert(memberById.has(memberId), "Membre introuvable.", 404);
      const debtAmount = amount(action.amount);
      assert(debtAmount !== null && debtAmount > 0, "Montant invalide.");
      const note = String(action.note || "").trim();
      assert(note.length <= 500, "Le motif est trop long.");
      result = {
        id: id(),
        memberId,
        amount: debtAmount,
        originalAmount: debtAmount,
        repaidAmount: 0,
        repayments: [],
        note,
        createdAt: now,
        updatedAt: now,
        createdBy: actor.id,
      };
      updateList(debts, "poto-timide-ancienne-tournee-dettes", [result, ...debts]);
    } else {
      const entryId = String(action.entryId || "");
      const index = debts.findIndex((entry) => entry?.id === entryId && !entry.deletedAt);
      assert(index >= 0, "Dette d’ancienne tournée introuvable.", 404);
      const debt = { ...debts[index] };
      if (action.type === "adjust-remaining") {
        const remaining = amount(action.amount);
        assert(remaining !== null && remaining >= 0, "Montant invalide (0 ou plus).");
        const original = Math.round(
          (Number(debt.originalAmount) || Number(debt.amount) || 0) * 100,
        ) / 100;
        const previous = Math.round((Number(debt.amount) || 0) * 100) / 100;
        debt.amount = remaining;
        debt.originalAmount = Math.max(original, remaining);
        debt.repaidAmount = Math.max(
          0,
          Math.round((Math.max(original, previous) - remaining) * 100) / 100,
        );
        debt.updatedAt = now;
        if (remaining <= 0) debt.settledAt = now;
        else delete debt.settledAt;
      } else if (action.type === "repay") {
        const paid = amount(action.amount);
        const remaining = Math.round((Number(debt.amount) || 0) * 100) / 100;
        assert(paid !== null && paid > 0 && paid <= remaining, `Montant invalide. Reste dû : ${remaining.toFixed(2)} €.`);
        debt.originalAmount = Number(debt.originalAmount) || remaining + (Number(debt.repaidAmount) || 0);
        debt.repaidAmount = Math.round(((Number(debt.repaidAmount) || 0) + paid) * 100) / 100;
        debt.amount = Math.max(0, Math.round((remaining - paid) * 100) / 100);
        debt.updatedAt = now;
        debt.repayments = Array.isArray(debt.repayments) ? [...debt.repayments] : [];
        debt.repayments.unshift({ id: id(), amount: paid, createdAt: now, createdBy: actor.id });
        const cashEntry = {
          id: id(),
          memberId: debt.memberId,
          amount: paid,
          type: "don",
          motif: "Remboursement dette ancienne tournée",
          note:
            debt.amount === 0
              ? "Remboursement dette ancienne tournée (soldée)"
              : `Remboursement partiel dette ancienne tournée (${paid.toFixed(2)} €)`,
          createdAt: now,
          updatedAt: now,
          createdBy: actor.id,
          sourceAncienneTourneeDetteId: debt.id,
        };
        const otherMoney = arrayData(data, "poto-timide-autre-argent");
        updateList(otherMoney, "poto-timide-autre-argent", [cashEntry, ...otherMoney]);
        changedKeys.push("poto-timide-autre-argent");
      } else if (action.type === "delete") {
        debt.originalAmount = Number(debt.originalAmount) || Number(debt.amount) || 0;
        debt.repaidAmount = Number(debt.repaidAmount) || 0;
        debt.amount = 0;
        debt.deletedAt = now;
        debt.updatedAt = now;
      } else {
        assert(false, "Opération de dette d’ancienne tournée inconnue.");
      }
      debts[index] = debt;
      updateList(debts, "poto-timide-ancienne-tournee-dettes", debts);
      result = debt;
    }
  } else if (action?.domain === "cash") {
    assert(actor.canManageFund, "Seul le Financier ou un administrateur peut modifier la caisse.", 403);
    if (action.type === "set-base" || action.type === "reset-base") {
      const value = action.type === "reset-base" ? 0 : amount(action.amount);
      assert(value !== null && value >= 0, "Montant invalide.");
      data["poto-timide-fond-caisse"] = value;
      changedKeys.push("poto-timide-fond-caisse");
      result = value;
      if (action.type === "set-base") {
        appendNotifications(data, members, now, id, {
          type: "financier_fond",
          tab: "finance",
          title: "Fond de caisse",
          message: `${actorMember.name} a modifié le fond de caisse de départ : ${value.toFixed(2)} €.`,
        });
        changedKeys.push("poto-timide-notifications");
      }
    } else {
    const otherMoney = arrayData(data, "poto-timide-autre-argent");
    if (action.type === "add" || action.type === "withdraw") {
      const memberId = String(action.memberId || "");
      const member =
        memberId === "groupe"
          ? { id: "groupe", name: "Le groupe" }
          : memberById.get(memberId);
      assert(member, "Membre introuvable.", 404);
      assert(action.type !== "add" || memberId !== "groupe", "Choisis le membre qui a fait le don ou l’aide.");
      const value = amount(action.amount);
      assert(value !== null && value > 0, "Montant invalide.");
      const motif = String(action.motif || "").trim();
      const note = String(action.note || "").trim();
      assert(motif.length <= 120 && note.length <= 500, "Le motif ou le détail est trop long.");
      if (action.type === "withdraw") {
        const available = caisseAvailable(data, loans);
        assert(value <= available + 1e-9, `Impossible de retirer ${value.toFixed(2)} € : la caisse disponible n’a que ${available.toFixed(2)} €.`, 409);
      }
      const fallback = action.type === "add" ? "Don ou aide" : "Sortie";
      const motifLabel = motif || fallback;
      const row = {
        id: id(),
        memberId: member.id,
        amount: action.type === "withdraw" ? -value : value,
        type: action.type === "withdraw" ? "retrait" : "don",
        motif: motifLabel,
        note: motif && note ? `${motif} — ${note}` : motif || note || fallback,
        createdAt: now,
        updatedAt: now,
        createdBy: actor.id,
      };
      updateList(otherMoney, "poto-timide-autre-argent", [row, ...otherMoney]);
      appendNotifications(data, members, now, id, {
        type: "financier_caisse",
        tab: "finance",
        title: "Caisse",
        message:
          action.type === "withdraw"
            ? `${actorMember.name} a retiré ${value.toFixed(2)} € de la caisse (${member.name} — ${motifLabel}).`
            : `${actorMember.name} a ajouté ${value.toFixed(2)} € à la caisse (don ou aide de ${member.name}).`,
      });
      changedKeys.push("poto-timide-notifications");
      result = row;
    } else if (action.type === "delete") {
      const entryId = String(action.entryId || "");
      const index = otherMoney.findIndex((entry) => entry?.id === entryId && !entry.deletedAt);
      assert(index >= 0, "Mouvement de caisse introuvable.", 404);
      const entry = { ...otherMoney[index], deletedAt: now, updatedAt: now };
      otherMoney[index] = entry;
      updateList(otherMoney, "poto-timide-autre-argent", otherMoney);
      result = entry;
    } else {
      assert(false, "Opération de caisse inconnue.");
    }
    }
  } else if (action?.domain === "capital") {
    assert(actor.canManageFund, "Seul le Financier ou un administrateur peut modifier l’argent dehors.", 403);
    const entries = arrayData(data, "poto-timide-capital-hors-groupe");
    if (action.type === "add") {
      const label = String(action.label || "").trim() || "Ex-membre / créance";
      const value = amount(action.amount);
      assert(label.length <= 160, "Le libellé est trop long.");
      assert(value !== null && value > 0, "Montant invalide.");
      result = { id: id(), label, amount: value, createdAt: now, updatedAt: now };
      updateList(entries, "poto-timide-capital-hors-groupe", [result, ...entries]);
      appendNotifications(data, members, now, id, {
        type: "capital_hors_groupe",
        tab: "prets",
        title: "Argent dehors",
        message: `${actorMember.name} a enregistré ${value.toFixed(2)} € dehors (${label}).`,
      });
      changedKeys.push("poto-timide-notifications");
    } else if (action.type === "delete") {
      const entryId = String(action.entryId || "");
      const index = entries.findIndex((entry) => entry?.id === entryId && !entry.deletedAt);
      assert(index >= 0, "Créance hors groupe introuvable.", 404);
      const entry = { ...entries[index], deletedAt: now, updatedAt: now };
      entries[index] = entry;
      updateList(entries, "poto-timide-capital-hors-groupe", entries);
      result = entry;
    } else {
      assert(false, "Opération d’argent dehors inconnue.");
    }
  } else if (action?.domain === "fund") {
    assert(actor.canManageFund, "Seul le Financier ou un administrateur peut modifier le fond de caisse.", 403);
    const year = String(action.year || "");
    assert(/^\d{4}$/.test(year), "Année de fond de caisse invalide.");
    const fund = data["poto-timide-fond-caisse-annuel"] || {};
    const years = fund.years && typeof fund.years === "object" ? { ...fund.years } : { ...fund };
    let yearData = years[year];
    const saveFund = () => {
      data["poto-timide-fond-caisse-annuel"] = { ...fund, years };
      changedKeys.push("poto-timide-fond-caisse-annuel");
    };
    if (action.type === "set-annual-amount") {
      const annualAmount = amount(action.amount);
      assert(annualAmount !== null && annualAmount >= 0, "Montant invalide.");
      yearData = yearData && typeof yearData === "object" ? { ...yearData } : {
        createdAt: now,
        createdBy: actor.id,
        payments: {},
      };
      yearData.amountPerMember = annualAmount;
      yearData.updatedAt = now;
      yearData.updatedBy = actor.id;
      years[year] = yearData;
      saveFund();
      result = yearData;
    } else if (action.type === "delete-annual") {
      assert(yearData && Number(yearData.amountPerMember) > 0, "Année de fond de caisse introuvable.", 404);
      delete years[year];
      saveFund();
      result = { year, deleted: true };
    } else {
      assert(yearData && typeof yearData === "object", "Année de fond de caisse introuvable.", 404);
      const payments = { ...(yearData.payments || {}) };
      const memberId = String(action.memberId || "");
      const payment = payments[memberId];
      const member = memberById.get(memberId);
      const amountPerMember = Number(yearData.amountPerMember) || 0;
      if (action.type === "pay") {
        assert(member && member.kind !== "nouveau", "Membre introuvable.", 404);
        assert(amountPerMember > 0, "Aucun fond de caisse défini pour cette année.");
        assert(!payment?.convertedToDebt, "Ce reste a déjà été converti en dette.", 409);
        const due = Math.max(
          0,
          Math.round((amountPerMember - (Number(payment?.paidAmount) || 0)) * 100) / 100,
        );
        const paid = amount(action.amount);
        assert(paid !== null && paid > 0 && paid <= due, `Montant invalide. Reste dû : ${due.toFixed(2)} €.`, 409);
        const history = Array.isArray(payment?.history) ? [...payment.history] : [];
        const row = { id: id(), amount: paid, createdAt: now, createdBy: actor.id };
        history.unshift(row);
        payments[memberId] = {
          ...(payment || {}),
          paidAmount: Math.round(((Number(payment?.paidAmount) || 0) + paid) * 100) / 100,
          history,
          updatedAt: now,
        };
        yearData = { ...yearData, payments, updatedAt: now };
        years[year] = yearData;
        saveFund();
        appendNotifications(data, members, now, id, {
          type: "financier_fond",
          tab: "finance",
          title: "Fond de caisse",
          message: `${actorMember.name} a encaissé ${paid.toFixed(2)} € de fond de caisse ${year} pour ${member.name}.`,
        });
        changedKeys.push("poto-timide-notifications");
        result = {
          year,
          memberId,
          payment: row,
          paidAmount: payments[memberId].paidAmount,
          due: Math.max(0, Math.round((amountPerMember - payments[memberId].paidAmount) * 100) / 100),
        };
      } else if (action.type === "cancel-payment") {
        assert(member && payment, "Versement de fond de caisse introuvable.", 404);
        const history = Array.isArray(payment.history) ? [...payment.history] : [];
        const paymentId = String(action.paymentId || "");
        const index = paymentId ? history.findIndex((item) => String(item.id) === paymentId) : 0;
        assert(!paymentId || index >= 0, "Versement introuvable.", 404);
        const row = index >= 0 ? history[index] : null;
        const cancelledAmount = amount(row?.amount ?? payment.paidAmount);
        assert(cancelledAmount !== null && cancelledAmount > 0, "Aucun versement à annuler.", 409);
        if (row) history.splice(index, 1);
        else history.length = 0;
        const paidAmount = Math.max(
          0,
          Math.round(((Number(payment.paidAmount) || 0) - cancelledAmount) * 100) / 100,
        );
        if (paidAmount <= 0.001) delete payments[memberId];
        else payments[memberId] = { ...payment, paidAmount, history, updatedAt: now };
        yearData = { ...yearData, payments, updatedAt: now };
        years[year] = yearData;
        saveFund();
        result = {
          year,
          memberId,
          cancelledAmount,
          paidAmount,
          due: Math.max(0, Math.round((amountPerMember - paidAmount) * 100) / 100),
        };
      } else if (action.type === "adjust-remaining") {
        assert(member, "Membre introuvable.", 404);
        assert(amountPerMember > 0, "Aucun fond de caisse défini pour cette année.");
        const remaining = amount(action.amount);
        assert(remaining !== null && remaining >= 0 && remaining <= amountPerMember, "Le reste doit être compris entre 0 et le montant annuel.");
        payments[memberId] = {
          ...(payment || { paidAmount: 0, history: [] }),
          paidAmount: Math.round((amountPerMember - remaining) * 100) / 100,
          updatedAt: now,
        };
        yearData = { ...yearData, payments, updatedAt: now };
        years[year] = yearData;
        saveFund();
        result = { year, memberId, remaining, paidAmount: payments[memberId].paidAmount };
      } else if (action.type === "convert-annual-debt") {
        const payments = { ...(yearData.payments || {}) };
        assert(amountPerMember > 0, "Aucun fond de caisse défini pour cette année.");
        const debtors = members
          .filter((person) => person && person.kind !== "nouveau" && person.id !== "groupe")
          .map((person) => {
            const current = payments[person.id] || {};
            const due = current.convertedToDebt
              ? 0
              : Math.max(0, Math.round((amountPerMember - (Number(current.paidAmount) || 0)) * 100) / 100);
            return { member: person, payment: current, due };
          })
          .filter(({ due }) => due > 0);
        assert(debtors.length > 0, "Tout le monde a déjà versé ou le reste est déjà passé en dette.", 409);
        const created = debtors.map(({ member: person, payment: current, due }) => {
          const roundedDue = Math.round(due * 100) / 100;
          payments[person.id] = {
            ...current,
            convertedToDebt: true,
            convertedAt: now,
            convertedAmount: roundedDue,
            updatedAt: now,
          };
          return {
            id: id(),
            memberId: person.id,
            type: "contribution",
            amount: roundedDue,
            originalAmount: roundedDue,
            repaidAmount: 0,
            note: `Fond de caisse ${year} — reste non versé`,
            date: now,
            createdAt: now,
            updatedAt: now,
            createdBy: actor.id,
            fromFondCaisseYear: year,
            collective: true,
          };
        });
        years[year] = { ...yearData, payments, updatedAt: now };
        saveFund();
        updateList(fines, "poto-timide-amendes", [...created, ...fines]);
        appendNotifications(data, members, now, id, {
          type: "fund_annual_debt",
          tab: "amendes",
          title: "Fond → dette",
          message: `${actorMember.name} a passé en dette le reste de fond ${year} (${created.length} membre${created.length > 1 ? "s" : ""}, ${sum(created, (fine) => fine.amount).toFixed(2)} €).`,
        });
        changedKeys.push("poto-timide-notifications");
        result = created;
      } else {
        assert(false, "Opération de fond de caisse inconnue.");
      }
    }
  } else if (action?.domain === "loan") {
    assert(actor.canManageLoans || action.type === "vote" || action.type === "request", "Accès refusé.", 403);
    if (action.type === "request") {
      const requested = amount(action.amount);
      const note = String(action.note || "").trim();
      assert(requested !== null && requested > 0, "Montant invalide.");
      assert(note.length >= 3 && note.length <= 120, "Le motif doit contenir de 3 à 120 caractères.");
      assert(actorMember.kind !== "nouveau", "Seuls les membres du groupe peuvent demander un prêt.", 403);
      assert(!loans.some((loan) => !loan.deletedAt && OPEN_BORROWER_STATUSES.has(loan.status) && loan.borrowerId === actor.id), "Vous avez déjà un prêt ou une demande en cours.", 409);
      assert(!loans.some((loan) => !loan.deletedAt && ["voting", "awaiting_financier"].includes(loan.status)), "Une demande est déjà en cours de vote ou de validation.", 409);
      const ban = loans
        .filter((loan) => !loan.deletedAt && loan.borrowerId === actor.id && loan.loanBanUntil)
        .map((loan) => new Date(loan.loanBanUntil).getTime())
        .filter((time) => Number.isFinite(time))
        .sort((a, b) => b - a)[0];
      assert(!ban || ban <= new Date(now).getTime(), "Vous ne pouvez pas encore demander un prêt.", 403);
      const formerTourDebt = sum(arrayData(data, "poto-timide-ancienne-tournee-dettes"), (entry) =>
        entry && !entry.deletedAt && entry.memberId === actor.id ? Number(entry.amount) || 0 : 0,
      );
      assert(formerTourDebt <= 0, "Remboursez votre dette d’ancienne tournée avant de demander un prêt.", 403);
      const borrowable = Math.max(
        0,
        (caisseAvailable(data, loans) - CAISSE_RESERVE_PER_MEMBER * members.filter((member) => member.kind !== "nouveau").length) / 2,
      );
      assert(requested <= borrowable, `Montant trop élevé. Empruntable : ${borrowable.toFixed(2)} €.`, 409);
      const loan = {
        id: id(),
        borrowerId: actor.id,
        amount: requested,
        note,
        status: "voting",
        createdAt: now,
        updatedAt: now,
        deadlineAt: new Date(new Date(now).getTime() + LOAN_VOTE_HOURS * 60 * 60 * 1000).toISOString(),
        votes: {},
        financierDecision: null,
        financierDecidedAt: null,
        approvedAt: null,
        totalRepaid: 0,
        repayments: [],
        interestApplied: false,
        interestAmount: 0,
        firstMonthEvaluated: false,
        sanctionLevel: null,
        sanctionAppliedAt: null,
        repaymentRatioAtSanction: null,
        loanBanUntil: null,
        autoApprovedByTimeout: false,
      };
      updateList(loans, "poto-timide-prets", [loan, ...loans]);
      result = loan;
      appendNotifications(data, members, now, id, {
        type: "loan_initiated",
        loanId: loan.id,
        tab: "prets",
        title: "Nouveau prêt",
        message: `${actorMember.name} a initié un prêt de ${requested.toFixed(2)} €. Votez Oui ou Non sous 24 h.`,
      });
      changedKeys.push("poto-timide-notifications");
    } else {
      const loanId = String(action.loanId || "");
      const index = loans.findIndex((loan) => loan?.id === loanId && !loan.deletedAt);
      assert(index >= 0, "Prêt introuvable.", 404);
      const loan = { ...loans[index], votes: { ...(loans[index].votes || {}) }, repayments: [...(loans[index].repayments || [])] };

      if (action.type === "vote") {
        assert(loan.status === "voting", "Cette demande n’est plus ouverte au vote.", 409);
        assert(new Date(now).getTime() < new Date(loan.deadlineAt).getTime(), "Le délai de vote est expiré.", 409);
        assert(loan.borrowerId !== actor.id && actorMember.kind !== "nouveau", "Vous ne pouvez pas voter pour cette demande.", 403);
        assert(!loan.votes[actor.id], "Vous avez déjà voté.", 409);
        assert(action.vote === "yes" || action.vote === "no", "Vote invalide.");
        loan.votes[actor.id] = action.vote;
        const voters = members.filter((member) => member && member.kind !== "nouveau" && member.id !== loan.borrowerId);
        const unanimous = voters.length > 0 && voters.every((member) => loan.votes[member.id] === "yes");
        if (unanimous) {
          loan.status = "awaiting_financier";
          loan.autoApprovedByTimeout = false;
          const notifications = arrayData(data, "poto-timide-notifications").filter(
            (notification) => notification.loanId !== loan.id || notification.memberId === loan.borrowerId,
          );
          appendFinancierNotifications(data, members, now, id, loan, notifications);
          changedKeys.push("poto-timide-notifications");
        } else {
          data["poto-timide-notifications"] = arrayData(data, "poto-timide-notifications").filter(
            (notification) =>
              !(notification.memberId === actor.id && notification.loanId === loan.id && notification.type === "loan_vote"),
          );
          changedKeys.push("poto-timide-notifications");
        }
      } else if (action.type === "decide") {
        assert(actor.canManageLoans, "Seul le Financier ou un administrateur peut valider un prêt.", 403);
        assert(["voting", "awaiting_financier"].includes(loan.status), "La demande a déjà été traitée.", 409);
        assert(action.decision === "approved" || action.decision === "rejected", "Décision invalide.");
        if (action.decision === "approved") {
          const balance = caisseAvailable(data, loans);
          const borrowable = Math.max(0, (balance - CAISSE_RESERVE_PER_MEMBER * members.filter((member) => member.kind !== "nouveau").length) / 2);
          assert(Number(loan.amount) <= borrowable, `Fonds insuffisants. Empruntable : ${borrowable.toFixed(2)} €.`, 409);
          loan.status = "active";
          loan.approvedAt = now;
        } else {
          loan.status = "rejected";
        }
        loan.financierDecision = action.decision;
        loan.financierDecidedAt = now;
        const borrower = memberById.get(String(loan.borrowerId));
        const approved = action.decision === "approved";
        appendNotifications(data, members, now, id, {
          type: approved ? "loan_approved" : "loan_rejected",
          loanId: loan.id,
          tab: "prets",
          title: approved ? "Prêt accordé" : "Prêt refusé",
          message: `${actorMember.name} a ${approved ? "accordé" : "refusé"} le prêt de ${borrower?.name || "un membre"} (${Number(loan.amount).toFixed(2)} €).`,
        });
        changedKeys.push("poto-timide-notifications");
      } else if (action.type === "repay" || action.type === "settle") {
        assert(actor.canManageLoans, "Seul le Financier ou un administrateur peut enregistrer un remboursement.", 403);
        assert(["active", "defaulted"].includes(loan.status), "Ce prêt ne peut pas recevoir de remboursement.", 409);
        const paid = amount(action.amount);
        const totalRepaid = Math.round(sum(loan.repayments, (repayment) => Number(repayment.amount) || 0) * 100) / 100;
        const remaining = Math.round((Number(loan.amount) - totalRepaid + (Number(loan.interestAmount) || 0)) * 100) / 100;
        assert(paid !== null && paid > 0 && paid <= remaining, `Montant invalide. Reste dû : ${remaining.toFixed(2)} €.`);
        loan.repayments.push({ id: id(), amount: paid, date: now, recordedBy: actor.id });
        loan.totalRepaid = Math.round(sum(loan.repayments, (repayment) => Number(repayment.amount) || 0) * 100) / 100;
        if (loan.totalRepaid >= Number(loan.amount)) {
          loan.status = "completed";
          loan.interestApplied = false;
          loan.interestAmount = 0;
        }
        const borrower = memberById.get(String(loan.borrowerId));
        appendNotifications(data, members, now, id, {
          type: loan.status === "completed" ? "loan_completed" : "financier_repay",
          loanId: loan.id,
          tab: "prets",
          title: loan.status === "completed" ? "Prêt remboursé" : "Remboursement",
          message: loan.status === "completed"
            ? `Le prêt de ${borrower?.name || "un membre"} (${Number(loan.amount).toFixed(2)} €) est entièrement remboursé.`
            : `${actorMember.name} a enregistré un remboursement de ${paid.toFixed(2)} € pour ${borrower?.name || "un membre"}.`,
        });
        changedKeys.push("poto-timide-notifications");
      } else if (action.type === "undo-repayment") {
        assert(actor.canManageLoans, "Seul le Financier ou un administrateur peut annuler un remboursement.", 403);
        const repaymentIndex = loan.repayments.findIndex((repayment) => repayment.id === action.repaymentId);
        assert(repaymentIndex >= 0, "Remboursement introuvable.", 404);
        loan.repayments.splice(repaymentIndex, 1);
        loan.totalRepaid = Math.round(sum(loan.repayments, (repayment) => Number(repayment.amount) || 0) * 100) / 100;
        if (loan.status === "completed" && loan.totalRepaid < Number(loan.amount)) {
          loan.status = loan.interestApplied || loan.interestAmount ? "defaulted" : "active";
        }
      } else if (action.type === "update-date") {
        assert(actor.canManageLoans, "Seul le Financier ou un administrateur peut modifier la date de demande.", 403);
        const ymd = String(action.date || "");
        assert(/^\d{4}-\d{2}-\d{2}$/.test(ymd), "Date invalide.");
        const [year, month, day] = ymd.split("-").map(Number);
        const dateCheck = new Date(Date.UTC(year, month - 1, day));
        assert(dateCheck.getUTCFullYear() === year && dateCheck.getUTCMonth() === month - 1 && dateCheck.getUTCDate() === day, "Date invalide.");
        const withDate = (previous) => {
          if (!previous) return previous;
          const raw = String(previous);
          const time = raw.includes("T") ? raw.slice(raw.indexOf("T") + 1) : "12:00:00.000Z";
          const updated = new Date(`${ymd}T${time}`);
          assert(Number.isFinite(updated.getTime()), "Date de prêt invalide.");
          return updated.toISOString();
        };
        loan.createdAt = withDate(loan.createdAt);
        loan.approvedAt = withDate(loan.approvedAt);
        loan.financierDecidedAt = withDate(loan.financierDecidedAt);
      } else if (action.type === "delete") {
        assert(actor.canManageLoans, "Accès refusé.", 403);
        loan.deletedAt = now;
        loan.status = "rejected";
        data["poto-timide-notifications"] = arrayData(data, "poto-timide-notifications").filter((notification) => notification.loanId !== loan.id);
        changedKeys.push("poto-timide-notifications");
      } else {
        assert(false, "Opération de prêt inconnue.");
      }

      loan.updatedAt = now;
      loans[index] = loan;
      updateList(loans, "poto-timide-prets", loans);
      result = loan;
    }
  } else if (action?.domain === "fine") {
    assert(actor.canManageFines, "Accès refusé.", 403);
    if (action.type === "add-bulk") {
      const fineAmount = amount(action.amount);
      const note = String(action.note || "").trim();
      const memberIds = [...new Set((Array.isArray(action.memberIds) ? action.memberIds : []).map(String))];
      assert(fineAmount !== null && fineAmount > 0, "Le montant doit être supérieur à 0.");
      assert(note.length > 0 && note.length <= 120, "Le motif est obligatoire (120 caractères maximum).");
      assert(memberIds.length > 0 && memberIds.length <= members.length, "Sélection de membres invalide.");
      const targets = memberIds
        .map((memberId) => memberById.get(memberId))
        .filter((member) => member && member.id !== "groupe" && member.kind !== "nouveau");
      assert(targets.length === memberIds.length, "Un ou plusieurs membres sélectionnés sont introuvables.");
      const created = targets.map((member) => ({
        id: id(),
        memberId: member.id,
        type: "contribution",
        amount: fineAmount,
        originalAmount: fineAmount,
        repaidAmount: 0,
        note,
        date: now,
        createdAt: now,
        updatedAt: now,
        createdBy: actor.id,
        collective: true,
      }));
      updateList(fines, "poto-timide-amendes", [...created, ...fines]);
      result = created;
      appendNotifications(data, members, now, id, {
        type: "fine_collective",
        tab: "amendes",
        title: "Contribution groupe",
        message: `${actorMember.name} a ajouté une contribution de ${fineAmount.toFixed(2)} € pour ${created.length} membre${created.length > 1 ? "s" : ""} : ${note}.`,
      });
      changedKeys.push("poto-timide-notifications");
    } else if (action.type === "add") {
      const memberId = String(action.memberId || "");
      const fineAmount = amount(action.amount);
      const note = String(action.note || "").trim();
      assert(memberById.has(memberId), "Membre introuvable.", 404);
      assert(fineAmount !== null && fineAmount > 0, "Le montant doit être supérieur à 0.");
      assert(note.length > 0 && note.length <= 120, "Le motif est obligatoire (120 caractères maximum).");
      assert(["absence", "retard", "bavardage", "sanctions", "ex-tournee"].includes(action.fineType), "Type d’amende invalide.");
      result = { id: id(), memberId, type: String(action.fineType || "absence"), amount: fineAmount, originalAmount: fineAmount, repaidAmount: 0, note, date: now, createdAt: now, updatedAt: now };
      updateList(fines, "poto-timide-amendes", [result, ...fines]);
      appendFineNotification(data, members, now, id, actorMember, result, "ajoutée");
      changedKeys.push("poto-timide-notifications");
    } else {
      const fineId = String(action.fineId || "");
      const index = fines.findIndex((fine) => fine?.id === fineId && !fine.deletedAt);
      assert(index >= 0, "Amende introuvable.", 404);
      const fine = { ...fines[index] };
      if (action.type === "adjust-remaining") {
        const nextAmount = amount(action.amount);
        assert(nextAmount !== null && nextAmount >= 0, "Montant invalide (0 ou plus).");
        const previousAmount = Math.round((Number(fine.amount) || 0) * 100) / 100;
        const originalAmount = Math.round(
          (Number(fine.originalAmount) || previousAmount) * 100,
        ) / 100;
        fine.amount = nextAmount;
        fine.originalAmount = Math.max(originalAmount, nextAmount);
        fine.repaidAmount = Math.max(
          Number(fine.repaidAmount) || 0,
          Math.max(0, Math.round((Math.max(originalAmount, previousAmount) - nextAmount) * 100) / 100),
        );
        fine.updatedAt = now;
        if (nextAmount === 0) {
          fine.settledAt = now;
        } else {
          delete fine.settledAt;
        }
      } else if (action.type === "edit") {
        const fineAmount = amount(action.amount);
        assert(memberById.has(String(action.memberId || "")), "Membre introuvable.", 404);
        assert(fineAmount !== null && fineAmount > 0, "Montant invalide.");
        const note = String(action.note || "").trim();
        assert(note.length > 0 && note.length <= 120, "Le motif est obligatoire.");
        assert(!["dette", "evenement", "ex-tournee", "ancienne-tournee"].includes(action.fineType), "Ce type de dette est géré dans son espace dédié.");
        fine.memberId = String(action.memberId);
        fine.type = String(action.fineType);
        fine.amount = fineAmount;
        fine.note = note;
      } else if (action.type === "repay" || action.type === "settle") {
        const paid = action.type === "settle" ? amount(fine.amount) : amount(action.amount);
        assert(paid !== null && paid > 0 && paid <= (Number(fine.amount) || 0), `Montant invalide. Reste dû : ${(Number(fine.amount) || 0).toFixed(2)} €.`);
        fine.originalAmount = Number(fine.originalAmount) || (Number(fine.amount) || 0) + (Number(fine.repaidAmount) || 0);
        fine.repaidAmount = Math.round(((Number(fine.repaidAmount) || 0) + paid) * 100) / 100;
        fine.amount = Math.round(((Number(fine.amount) || 0) - paid) * 100) / 100;
        if (fine.amount <= 0) {
          fine.amount = 0;
          fine.settledAt = now;
        }
        const entry = { id: id(), sourceAmendeId: fine.id, memberId: fine.memberId, type: fine.type, amount: paid, note: fine.note || "", paidAt: now, createdAt: now, updatedAt: now, validatedBy: actor.id };
        updateList(fineCash, "poto-timide-amendes-caisse", [entry, ...fineCash]);
        appendFineNotification(data, members, now, id, actorMember, fine, "encaissée");
        changedKeys.push("poto-timide-notifications");
      } else if (action.type === "undo-repay") {
        assert(actor.canManageFines, "Accès refusé.", 403);
        const cashIndex = fineCash.findIndex((entry) => entry?.id === action.cashId && !entry.deletedAt);
        assert(cashIndex >= 0, "Encaissement introuvable.", 404);
        const [entry] = fineCash.splice(cashIndex, 1);
        assert(entry.sourceAmendeId === fine.id, "Cet encaissement ne correspond pas à cette amende.", 409);
        const paid = Number(entry.amount) || 0;
        fine.amount = Math.round(((Number(fine.amount) || 0) + paid) * 100) / 100;
        fine.repaidAmount = Math.max(0, Math.round(((Number(fine.repaidAmount) || 0) - paid) * 100) / 100);
        delete fine.settledAt;
        updateList(fineCash, "poto-timide-amendes-caisse", fineCash);
        changedKeys.push("poto-timide-amendes-caisse");
      } else if (action.type === "delete") {
        fine.originalAmount =
          Number(fine.originalAmount) ||
          (Number(fine.amount) || 0) + (Number(fine.repaidAmount) || 0);
        fine.deletedAt = now;
        fine.amount = 0;
        fine.repaidAmount = 0;
        const eventId = String(fine.evenementId || fine.eventId || "");
        if (fine.type === "dette" && eventId) {
          const events = arrayData(data, "poto-timide-evenements");
          const eventIndex = events.findIndex((event) => String(event?.id) === eventId);
          if (eventIndex >= 0) {
            const event = { ...events[eventIndex], payments: { ...(events[eventIndex].payments || {}) } };
            const payment = { ...(event.payments[fine.memberId] || {}) };
            delete payment.convertedToDebt;
            delete payment.debtCreatedAt;
            payment.debtDismissed = true;
            payment.debtDismissedAt = now;
            event.payments[fine.memberId] = payment;
            event.updatedAt = now;
            events[eventIndex] = event;
            updateList(events, "poto-timide-evenements", events);
          }
        }
      } else {
        assert(false, "Opération d’amende inconnue.");
      }
      fine.updatedAt = now;
      fines[index] = fine;
      updateList(fines, "poto-timide-amendes", fines);
      if (action.type === "delete") {
        appendFineNotification(data, members, now, id, actorMember, fine, "supprimée");
        changedKeys.push("poto-timide-notifications");
      }
      result = fine;
    }

  } else {
    assert(false, "Domaine d’opération inconnu.");
  }

  const uniqueChangedKeys = [...new Set(changedKeys)];
  return { data: Object.fromEntries(uniqueChangedKeys.map((key) => [key, data[key]])), changedKeys: uniqueChangedKeys, result };
}

function appendNotifications(data, members, now, id, notification) {
  const notifications = arrayData(data, "poto-timide-notifications");
  const newRows = members
    .filter((member) => member && member.kind !== "nouveau")
    .map((member) => ({
      id: id(),
      memberId: member.id,
      type: notification.type,
      loanId: notification.loanId,
      message: notification.message,
      tab: notification.tab,
      title: notification.title,
      read: false,
      createdAt: now,
      updatedAt: now,
    }));
  data["poto-timide-notifications"] = [...newRows, ...notifications].slice(0, 1000);
}

function appendFineNotification(data, members, now, id, actor, fine, verb) {
  const notifications = arrayData(data, "poto-timide-notifications");
  const person = members.find((member) => member.id === fine.memberId);
  const message = `${actor.name} a ${verb} une amende de ${(Number(fine.originalAmount || fine.amount) || 0).toFixed(2)} € pour ${person?.name || "un membre"}.`;
  const rows = members
    .filter((member) => member && member.kind !== "nouveau")
    .map((member) => ({
      id: id(),
      memberId: member.id,
      type: "amende",
      loanId: "",
      item: fine.id,
      tab: "amendes",
      title: "Dettes & amendes",
      message,
      read: false,
      createdAt: now,
      updatedAt: now,
    }));
  data["poto-timide-notifications"] = [...rows, ...notifications].slice(0, 1000);
}

function appendFinancierNotifications(data, members, now, id, loan, current = arrayData(data, "poto-timide-notifications")) {
  const roles = data["poto-timide-roles"] || {};
  const adminValue = data["poto-timide-admin-ids"];
  const adminIds = Array.isArray(adminValue) ? adminValue : Array.isArray(adminValue?.ids) ? adminValue.ids : [];
  const recipients = new Set([...adminIds, roles.tresorier].filter(Boolean));
  const borrower = members.find((member) => member.id === loan.borrowerId);
  const amountText = (Number(loan.amount) || 0).toFixed(2);
  const message = loan.autoApprovedByTimeout
    ? `Délai de 24 h écoulé pour le prêt de ${borrower?.name || "un membre"} (${amountText} €). Validation finale requise.`
    : `Tous les membres ont voté Oui pour le prêt de ${borrower?.name || "un membre"} (${amountText} €). Validation finale requise.`;
  const rows = [...recipients].map((memberId) => ({
    id: id(),
    memberId,
    type: "loan_financier",
    loanId: loan.id,
    message,
    tab: "prets",
    title: "Prêt à valider",
    read: false,
    createdAt: now,
    updatedAt: now,
  }));
  data["poto-timide-notifications"] = [...rows, ...current].slice(0, 1000);
}

const crypto = require("crypto");

function parisDateParts(instant) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(instant).map((part) => [part.type, part.value]),
  );
}

function parisYmd(instant) {
  const parts = parisDateParts(instant);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addMonthsYmd(ymd, months) {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  date.setUTCMonth(date.getUTCMonth() + months);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function parisDateTimeMs(ymd, hour, minute, second = 0, millisecond = 0) {
  const [year, month, day] = ymd.split("-").map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(utcGuess)).map((part) => [part.type, Number(part.value)]),
  );
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, millisecond);
  return utcGuess - (asUtc - utcGuess);
}

function advanceLoanStatuses(data, now = new Date().toISOString()) {
  const loans = arrayData(data, "poto-timide-prets");
  const members = Array.isArray(data["poto-timide-members"]) ? data["poto-timide-members"] : [];
  const notifications = arrayData(data, "poto-timide-notifications");
  const roles = data["poto-timide-roles"] || {};
  const adminIds = data["poto-timide-admin-ids"];
  const admins = Array.isArray(adminIds) ? adminIds : Array.isArray(adminIds?.ids) ? adminIds.ids : [];
  const recipients = new Set([...admins, roles.tresorier].filter(Boolean));
  const nowMs = new Date(now).getTime();
  let changed = false;

  for (const loan of loans) {
    if (!loan || loan.deletedAt) continue;
    let loanChanged = false;

    if (
      loan.status === "voting" &&
      Number.isFinite(new Date(loan.deadlineAt).getTime()) &&
      nowMs >= new Date(loan.deadlineAt).getTime()
    ) {
      loan.status = "awaiting_financier";
      loan.autoApprovedByTimeout = true;
      loanChanged = true;
      const borrower = members.find((member) => member.id === loan.borrowerId);
      const message = `Délai de 24 h écoulé pour le prêt de ${borrower?.name || "un membre"} (${(Number(loan.amount) || 0).toFixed(2)} €). Validation finale requise.`;
      notifications.unshift(...[...recipients].map((memberId) => ({
        id: crypto.randomUUID(),
        memberId,
        type: "loan_financier",
        loanId: loan.id,
        message,
        tab: "prets",
        title: "Prêt à valider",
        read: false,
        createdAt: now,
        updatedAt: now,
      })));
    }

    if (!["active", "defaulted"].includes(loan.status)) {
      if (loanChanged) {
        loan.updatedAt = now;
        changed = true;
      }
      continue;
    }

    const totalRepaid = Math.round(
      (Array.isArray(loan.repayments) && loan.repayments.length
        ? sum(loan.repayments, (repayment) => Number(repayment?.amount) || 0)
        : Number(loan.totalRepaid) || 0) * 100,
    ) / 100;
    if (totalRepaid !== Number(loan.totalRepaid || 0)) {
      loan.totalRepaid = totalRepaid;
      loanChanged = true;
    }
    const principal = Math.round((Number(loan.amount) || 0) * 100) / 100;
    if (principal > 0 && totalRepaid >= principal) {
      if (loan.status !== "completed" || loan.interestApplied || Number(loan.interestAmount)) {
        loan.status = "completed";
        loan.interestApplied = false;
        loan.interestAmount = 0;
        loanChanged = true;
      }
    } else {
      const start = new Date(loan.approvedAt || loan.createdAt || "");
      if (Number.isFinite(start.getTime())) {
        const startYmd = parisYmd(start);
        const month1Ymd = addMonthsYmd(startYmd, 1);
        const month2Ymd = addMonthsYmd(startYmd, 2);
        const month1Deadline = parisDateTimeMs(month1Ymd, 23, 59, 59, 999);
        const month2Deadline = parisDateTimeMs(month2Ymd, 12, 0);
        const ratio = totalRepaid / Math.max(1, principal);
        let applySanction = false;

        if (nowMs > month1Deadline && !loan.firstMonthEvaluated) {
          loan.firstMonthEvaluated = true;
          loanChanged = true;
          applySanction = ratio < REPAYMENT_MONTH1_RATIO;
        } else if (nowMs > month2Deadline && !loan.interestApplied) {
          applySanction = true;
        }

        if (applySanction && !loan.interestApplied) {
          loan.interestApplied = true;
          loan.interestAmount = Math.round(principal * LOAN_INTEREST_RATE * 100) / 100;
          loan.sanctionAppliedAt = now;
          loan.repaymentRatioAtSanction = Math.round(ratio * 10000) / 10000;
          const banMonths = ratio >= 0.6 ? 0 : ratio >= 0.3 ? 5 : 10;
          loan.sanctionLevel = banMonths === 0
            ? "interest"
            : banMonths === 5
              ? "interest-and-half-tournee-ban"
              : "interest-and-full-tournee-ban";
          if (banMonths > 0) {
            loan.loanBanUntil = `${addMonthsYmd(parisYmd(new Date(now)), banMonths)}T23:59:59.999Z`;
          }
          loan.status = "defaulted";
          loanChanged = true;
          if (members.some((member) => member.id === loan.borrowerId)) {
            notifications.unshift({
              id: crypto.randomUUID(),
              memberId: loan.borrowerId,
              type: "loan_interest",
              loanId: loan.id,
              message: `Retard de remboursement : intérêts de 10 % appliqués sur le montant initial (${loan.interestAmount.toFixed(2)} €).`,
              tab: "prets",
              title: "Retard de prêt",
              read: false,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      }
    }

    if (loanChanged) {
      loan.updatedAt = now;
      changed = true;
    }
  }

  if (!changed) return { changed: false, data: null };
  data["poto-timide-notifications"] = notifications.slice(0, 1000);
  return {
    changed: true,
    data: {
      "poto-timide-prets": loans,
      "poto-timide-notifications": data["poto-timide-notifications"],
    },
  };
}

module.exports = { applyGroupAction, advanceLoanStatuses };
