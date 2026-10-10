const KEY_REQUIREMENTS = {
  "poto-timide-members": [["membres"]],
  "poto-timide-roles": [["bureau"]],
  "poto-timide-cotisations": [["tournee"]],
  "poto-timide-tournee": [["tournee"]],
  "poto-timide-amendes": [["amendes", "ancienne-tournee", "evenements"]],
  "poto-timide-amendes-caisse": [["action-only"]],
  "poto-timide-tab-permissions": [["admin"]],
  "poto-timide-prets": [["action-only"]],
  "poto-timide-notifications": [["authenticated"]],
  "poto-timide-evenements": [["evenements"]],
  "poto-timide-communication": [["authenticated"]],
  "poto-timide-loi": [["loi"]],
  "poto-timide-guide": [["loi"], ["communication"]],
  "poto-timide-admin-ids": [["admin"]],
  "poto-timide-autre-argent": [["action-only"]],
  "poto-timide-capital-hors-groupe": [["action-only"]],
  "poto-timide-ancienne-tournee-dettes": [["action-only"]],
  "poto-timide-finance": [["caisse"]],
  "poto-timide-fond-caisse": [["action-only"]],
  "poto-timide-fond-caisse-annuel": [["action-only"]],
  "poto-timide-financier-account": [["caisse"]],
  "poto-timide-data-revision": [["authenticated"]],
  "poto-timide-audit-log": [["admin"]],
  "poto-timide-login-log": [["admin"]],
  "poto-timide-messages": [["authenticated"]],
};

function canWriteSyncKey(key, actor) {
  if (KEY_REQUIREMENTS[key]?.some((alternatives) => alternatives.includes("action-only"))) return false;
  if (actor?.isAdmin) return true;
  const requirements = KEY_REQUIREMENTS[key];
  if (!requirements || !actor?.id) return false;
  return requirements.some((alternatives) =>
    alternatives.some(
      (tab) =>
        tab === "authenticated" ||
        (tab === "admin" && actor.isAdmin) ||
        (Array.isArray(actor.roleIds) &&
          actor.roleIds.some((roleId) => actor.permissions?.[tab]?.includes(roleId))),
    ),
  );
}

function hasSyncTabPermission(tab, actor) {
  return Boolean(
    actor?.isAdmin ||
      (actor?.id &&
        Array.isArray(actor.roleIds) &&
        actor.roleIds.some((roleId) => actor.permissions?.[tab]?.includes(roleId))),
  );
}

function validateMemberListSyncValue(incoming, existing) {
  if (!Array.isArray(incoming) || !Array.isArray(existing)) return false;
  const incomingIds = new Set(incoming.filter((member) => member?.id).map((member) => String(member.id)));
  return existing.every((member) => !member?.id || incomingIds.has(String(member.id)));
}

function validateFineSyncValue(incoming, existing, events = []) {
  if (!Array.isArray(incoming)) return false;
  const previousById = new Map(
    (Array.isArray(existing) ? existing : [])
      .filter((item) => item?.id)
      .map((item) => [String(item.id), item]),
  );
  const incomingIds = new Set(incoming.filter((item) => item?.id).map((item) => String(item.id)));
  if ([...previousById.keys()].some((id) => !incomingIds.has(id))) return false;
  return incoming.every((item) => {
    if (!item || typeof item !== "object" || !item.id) return false;
    const previous = previousById.get(String(item.id));
    if (!previous) {
      const eventId = String(item.evenementId || item.eventId || "");
      const event = events.find((row) => String(row?.id) === eventId && !row.deletedAt);
      return (
        item.type === "dette" &&
        typeof item.memberId === "string" &&
        Number.isFinite(Number(item.amount)) &&
        Number(item.amount) >= 0 &&
        Boolean(event && event.payments && Object.hasOwn(event.payments, item.memberId))
      );
    }
    if (JSON.stringify(previous) === JSON.stringify(item)) return true;
    return item.type === "dette" && previous.type === "dette";
  });
}

function validateMemberPurgeSyncValue(key, incoming, existing, removedMemberIds, removedEventIds = []) {
  if (!removedMemberIds.length) return false;
  const removed = new Set(removedMemberIds.map(String));
  const removedEvents = new Set(removedEventIds.map(String));
  if (key === "poto-timide-tournee") {
    if (!incoming || typeof incoming !== "object" || !existing || typeof existing !== "object") return false;
    const expected = JSON.parse(JSON.stringify(existing));
    const years = expected?.years;
    if (!years || typeof years !== "object") return false;
    for (const yearData of Object.values(years)) {
      if (!yearData || typeof yearData !== "object") continue;
      for (const memberId of removed) {
        for (const keyName of Object.keys(yearData)) {
          const value = yearData[keyName];
          if (keyName === "partners" && value && typeof value === "object") {
            delete value[memberId];
            Object.entries(value).forEach(([otherId, monthPartners]) => {
              Object.entries(monthPartners || {}).forEach(([monthKey, partnerId]) => {
                if (partnerId === memberId) delete monthPartners[monthKey];
              });
              if (!Object.keys(monthPartners || {}).length) delete value[otherId];
            });
            if (!Object.keys(value).length) delete yearData[keyName];
          } else if (
            ["bouffeOk", "receptionOk", "ristourneOk", "receptionDates"].includes(keyName)
          ) {
            if (value?.[memberId]) {
              delete value[memberId];
              if (!Object.keys(value).length) delete yearData[keyName];
            }
          } else if (["reception", "ristourne"].includes(keyName)) {
            Object.keys(value || {}).forEach((monthKey) => {
              if (!Array.isArray(value[monthKey])) return;
              value[monthKey] = value[monthKey].filter((id) => id !== memberId);
              if (!value[monthKey].length) delete value[monthKey];
            });
            if (!Object.keys(value || {}).length) delete yearData[keyName];
          } else if (!Number.isNaN(Number(keyName)) && Array.isArray(value)) {
            yearData[keyName] = value.filter((id) => id !== memberId);
            if (!yearData[keyName].length) delete yearData[keyName];
          }
        }
      }
    }
    const stableValue = (value) =>
      Array.isArray(value)
        ? value.map(stableValue)
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.keys(value)
                .sort()
                .map((property) => [property, stableValue(value[property])]),
            )
          : value;
    return JSON.stringify(stableValue(expected)) === JSON.stringify(stableValue(incoming));
  }
  if (!Array.isArray(incoming) || !Array.isArray(existing)) return false;
  const stableValue = (value) =>
    Array.isArray(value)
      ? value.map(stableValue)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((property) => [property, stableValue(value[property])]),
          )
        : value;
  const stableRows = (list) =>
    [...list]
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .map((item) => JSON.stringify(stableValue(item)));
  const matchesRows = (expected) => {
    const expectedRows = stableRows(expected);
    const incomingRows = stableRows(incoming);
    return (
      expectedRows.length === incomingRows.length &&
      expectedRows.every((value, index) => value === incomingRows[index])
    );
  };
  if (key === "poto-timide-amendes-caisse") {
    return matchesRows(existing.filter((item) => !removed.has(String(item?.memberId))));
  }
  if (key === "poto-timide-amendes") {
    const expected = existing.filter(
      (fine) =>
        !removed.has(String(fine?.memberId)) &&
        !removedEvents.has(String(fine?.evenementId || fine?.eventId || "")),
    );
    return matchesRows(expected);
  }
  if (key === "poto-timide-evenements") {
    const expected = existing
      .filter((event) => !removed.has(String(event?.beneficiaryMemberId)))
      .map((event) => {
        const next = { ...event, payments: { ...(event.payments || {}) } };
        for (const memberId of removed) {
          if (next.payments[memberId]) delete next.payments[memberId];
        }
        if (removed.has(String(next.createdBy))) next.createdBy = null;
        return next;
      });
    return matchesRows(expected);
  }
  if (
    key === "poto-timide-notifications" ||
    key === "poto-timide-autre-argent" ||
    key === "poto-timide-ancienne-tournee-dettes"
  ) {
    return matchesRows(existing.filter((item) => !removed.has(String(item?.memberId))));
  }
  if (key !== "poto-timide-prets") return false;
  const expected = existing
    .filter((loan) => !removed.has(String(loan?.borrowerId)))
    .map((loan) => {
      const next = { ...loan, votes: { ...(loan.votes || {}) } };
      for (const memberId of removed) delete next.votes[memberId];
      next.repayments = Array.isArray(next.repayments) ? next.repayments : [];
      if (next.repayments.length) {
        next.totalRepaid =
          Math.round(
            next.repayments.reduce(
              (total, repayment) => total + (Number(repayment?.amount) || 0),
              0,
            ) * 100,
          ) / 100;
      } else {
        next.totalRepaid = Math.round((Number(next.totalRepaid) || 0) * 100) / 100;
      }
      return next;
    });
  const expectedRows = stableRows(expected);
  const incomingRows = stableRows(incoming);
  return (
    expectedRows.length === incomingRows.length &&
    expectedRows.every((value, index) => value === incomingRows[index])
  );
}

function sameExcept(previous, next, allowedKeys) {
  const allowed = new Set(allowedKeys);
  const previousKeys = Object.keys(previous || {}).filter((key) => !allowed.has(key)).sort();
  const nextKeys = Object.keys(next || {}).filter((key) => !allowed.has(key)).sort();
  return (
    JSON.stringify(previousKeys) === JSON.stringify(nextKeys) &&
    previousKeys.every((key) => JSON.stringify(previous[key]) === JSON.stringify(next[key]))
  );
}

function validatePersonalSyncValue(key, incoming, existing, actorId, context = {}) {
  if (key === "poto-timide-communication") {
    if (!Array.isArray(incoming)) return false;
    const previousById = new Map(
      (Array.isArray(existing) ? existing : [])
        .filter((item) => item?.id)
        .map((item) => [String(item.id), item]),
    );
    // context.canManageCommunication : true → édition complète autorisée
    if (context.canManageCommunication) {
      return incoming.every((item) => item && item.id && typeof item === "object");
    }
    // Sinon : uniquement les accusés de lecture personnels
    return incoming.every((item) => {
      const previous = previousById.get(String(item?.id || ""));
      if (!previous) return false;
      const oldReadBy = previous.readBy && typeof previous.readBy === "object" ? previous.readBy : {};
      const newReadBy = item.readBy && typeof item.readBy === "object" ? item.readBy : {};
      const otherReaders = (readBy) =>
        Object.fromEntries(Object.entries(readBy).filter(([memberId]) => memberId !== String(actorId)));
      const actorReadAt = newReadBy[String(actorId)];
      return (
        JSON.stringify(otherReaders(oldReadBy)) === JSON.stringify(otherReaders(newReadBy)) &&
        (!oldReadBy[String(actorId)] || oldReadBy[String(actorId)] === actorReadAt) &&
        (!actorReadAt || Number.isFinite(Date.parse(actorReadAt))) &&
        sameExcept(previous, item, ["readBy", "readReceiptUpdatedAt"])
      );
    });
  }
  if (key !== "poto-timide-notifications" && key !== "poto-timide-messages") return true;
  if (!Array.isArray(incoming)) return false;
  const previousById = new Map(
    (Array.isArray(existing) ? existing : [])
      .filter((item) => item?.id)
      .map((item) => [String(item.id), item]),
  );

  return incoming.every((item) => {
    if (!item || typeof item !== "object" || !item.id) return false;
    const previous = previousById.get(String(item.id));
    if (key === "poto-timide-notifications") {
      if (!previous) {
        return (
          (String(item.memberId) === String(actorId) ||
            (item.type === "message" &&
              (context.messages || []).some(
                (message) =>
                  message?.id &&
                  String(message.id) === String(item.item || item.loanId) &&
                  String(message.fromId) === String(actorId) &&
                  String(message.toId) === String(item.memberId),
              ))) &&
          typeof item.read === "boolean" &&
          typeof item.message === "string" &&
          item.message.length <= 500
        );
      }
      if (String(previous.memberId) !== String(actorId)) {
        return JSON.stringify(item) === JSON.stringify(previous);
      }
      return (
        (item.read === undefined || typeof item.read === "boolean") &&
        (item.deletedAt === undefined || Number.isFinite(Date.parse(item.deletedAt))) &&
        sameExcept(previous, item, ["read", "deletedAt", "updatedAt"])
      );
    }

    if (!previous) {
      return (
        String(item.fromId) === String(actorId) &&
        String(item.toId || "") !== String(actorId) &&
        typeof item.text === "string" &&
        item.text.trim().length > 0 &&
        item.text.length <= 500
      );
    }
    if (String(previous.fromId) === String(actorId)) {
      return JSON.stringify(item) === JSON.stringify(previous);
    }
    if (String(previous.toId) !== String(actorId)) {
      return JSON.stringify(item) === JSON.stringify(previous);
    }
    return (
      (item.readAt === undefined || item.readAt === null || Number.isFinite(Date.parse(item.readAt))) &&
      sameExcept(previous, item, ["readAt", "updatedAt"])
    );
  });
}

module.exports = {
  canWriteSyncKey,
  hasSyncTabPermission,
  validateMemberListSyncValue,
  validateFineSyncValue,
  validatePersonalSyncValue,
};
