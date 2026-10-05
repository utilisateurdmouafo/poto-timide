const test = require("node:test");
const assert = require("node:assert/strict");
const { applyGroupAction, advanceLoanStatuses } = require("../lib/group-actions");

const now = "2026-10-05T12:00:00.000Z";
const members = [
  { id: "a", name: "Alice" },
  { id: "b", name: "Boris" },
  { id: "c", name: "Chloé" },
];

function fixture() {
  return {
    "poto-timide-members": members,
    "poto-timide-fond-caisse": 1000,
    "poto-timide-fond-caisse-annuel": {},
    "poto-timide-amendes": [],
    "poto-timide-amendes-caisse": [],
    "poto-timide-autre-argent": [],
    "poto-timide-evenements": [],
    "poto-timide-prets": [],
    "poto-timide-notifications": [],
  };
}

function deterministicIds() {
  let counter = 0;
  return () => `generated-${++counter}`;
}

function action(data, actor, payload) {
  return applyGroupAction(data, actor, payload, now, deterministicIds());
}

test("member deletion purges linked data server-side and protects the site owner", () => {
  const data = fixture();
  data["poto-timide-members"] = [
    ...members,
    { id: "owner", name: "Dario" },
  ];
  data["poto-timide-roles"] = { tresorier: "b", secretaire: "a" };
  data["poto-timide-cotisations"] = { b: { paid: true }, a: { paid: true } };
  data["poto-timide-tournee"] = {
    years: { 2026: { partners: { a: { "1": "b" } }, reception: { "1": ["a", "b"] } } },
  };
  data["poto-timide-amendes"] = [
    { id: "fine-member", memberId: "b", amount: 10 },
    { id: "fine-event", memberId: "a", evenementId: "event-b", amount: 20 },
  ];
  data["poto-timide-amendes-caisse"] = [{ id: "cash-b", memberId: "b", amount: 10 }];
  data["poto-timide-evenements"] = [
    { id: "event-b", beneficiaryMemberId: "b", payments: {} },
    { id: "event-a", beneficiaryMemberId: "a", createdBy: "b", payments: { b: { paid: true } } },
  ];
  data["poto-timide-prets"] = [
    { id: "loan-b", borrowerId: "b", votes: {} },
    { id: "loan-a", borrowerId: "a", votes: { b: true, c: false } },
  ];
  data["poto-timide-notifications"] = [{ id: "notice-b", memberId: "b" }];
  data["poto-timide-admin-ids"] = { ids: ["b", "owner"] };
  data["poto-timide-autre-argent"] = [{ id: "money-b", memberId: "b" }];
  data["poto-timide-ancienne-tournee-dettes"] = [{ id: "debt-b", memberId: "b" }];
  data["poto-timide-fond-caisse-annuel"] = {
    years: { 2026: { payments: { b: { paid: true }, a: { paid: true } } } },
  };

  const result = action(data, { id: "a", canManageMembers: true, ownerId: "owner" }, {
    domain: "member",
    type: "delete",
    memberId: "b",
  });

  assert.deepEqual(result.changedKeys.includes("poto-timide-prets"), true);
  assert.deepEqual(data["poto-timide-members"].map((member) => member.id), ["a", "c", "owner"]);
  assert.deepEqual(data["poto-timide-roles"], { secretaire: "a" });
  assert.deepEqual(data["poto-timide-cotisations"], { a: { paid: true } });
  assert.deepEqual(data["poto-timide-tournee"].years[2026].reception["1"], ["a"]);
  assert.equal(data["poto-timide-tournee"].years[2026].partners, undefined);
  assert.deepEqual(data["poto-timide-amendes"], []);
  assert.deepEqual(data["poto-timide-evenements"], [
    { id: "event-a", beneficiaryMemberId: "a", createdBy: null, payments: {} },
  ]);
  assert.deepEqual(data["poto-timide-prets"], [{ id: "loan-a", borrowerId: "a", votes: { c: false } }]);
  assert.deepEqual(data["poto-timide-admin-ids"].ids, ["owner"]);
  assert.deepEqual(data["poto-timide-fond-caisse-annuel"].years[2026].payments, { a: { paid: true } });
  assert.throws(
    () => action(data, { id: "a", canManageMembers: true, ownerId: "owner" }, {
      domain: "member",
      type: "delete",
      memberId: "owner",
    }),
    { status: 403 },
  );
  assert.throws(
    () => action(data, { id: "a", canManageMembers: false, ownerId: "owner" }, {
      domain: "member",
      type: "delete",
      memberId: "c",
    }),
    { status: 403 },
  );
});

test("cash deposits and withdrawals are validated, persisted and notified server-side", () => {
  const data = fixture();
  data["poto-timide-fond-caisse"] = 100;
  const manager = { id: "a", canManageFund: true };

  const deposit = action(data, manager, {
    domain: "cash",
    type: "add",
    memberId: "b",
    amount: "25.50",
    motif: "Don",
    note: "Pour la caisse",
  }).result;
  assert.equal(deposit.amount, 25.5);
  assert.equal(deposit.note, "Don — Pour la caisse");
  assert.equal(data["poto-timide-notifications"].length, members.length);

  const withdrawal = action(data, manager, {
    domain: "cash",
    type: "withdraw",
    memberId: "groupe",
    amount: "40",
    motif: "Achat",
  }).result;
  assert.equal(withdrawal.amount, -40);
  assert.equal(withdrawal.note, "Achat");
  assert.throws(
    () => action(data, manager, {
      domain: "cash",
      type: "withdraw",
      memberId: "groupe",
      amount: 1000,
    }),
    { status: 409 },
  );
  assert.throws(
    () => action(data, { id: "a", canManageFund: false }, {
      domain: "cash",
      type: "add",
      memberId: "b",
      amount: 1,
    }),
    { status: 403 },
  );

  const removed = action(data, manager, {
    domain: "cash",
    type: "delete",
    entryId: deposit.id,
  }).result;
  assert.equal(removed.deletedAt, now);
  assert.equal(data["poto-timide-autre-argent"][0].deletedAt, now);
});

test("cash base amount is validated and updated only by an authorized server action", () => {
  const data = fixture();
  const manager = { id: "a", canManageFund: true };
  assert.equal(
    action(data, manager, { domain: "cash", type: "set-base", amount: "432.10" }).result,
    432.1,
  );
  assert.equal(data["poto-timide-fond-caisse"], 432.1);
  assert.equal(data["poto-timide-notifications"].length, members.length);
  assert.equal(
    action(data, manager, { domain: "cash", type: "reset-base" }).result,
    0,
  );
  assert.equal(data["poto-timide-fond-caisse"], 0);
  assert.throws(
    () => action(data, manager, { domain: "cash", type: "set-base", amount: -1 }),
    { status: 400 },
  );
  assert.throws(
    () => action(data, { id: "a", canManageFund: false }, {
      domain: "cash",
      type: "set-base",
      amount: 50,
    }),
    { status: 403 },
  );
});

test("capital outside the group is created and deleted through authorized actions", () => {
  const data = fixture();
  const manager = { id: "a", canManageFund: true };
  const entry = action(data, manager, {
    domain: "capital",
    type: "add",
    label: "Ancien membre",
    amount: "125.75",
  }).result;
  assert.equal(entry.amount, 125.75);
  assert.equal(data["poto-timide-capital-hors-groupe"][0].id, entry.id);
  assert.equal(data["poto-timide-notifications"].length, members.length);
  assert.throws(
    () => action(data, { id: "a", canManageFund: false }, {
      domain: "capital",
      type: "add",
      label: "Refusé",
      amount: 20,
    }),
    { status: 403 },
  );
  const removed = action(data, manager, {
    domain: "capital",
    type: "delete",
    entryId: entry.id,
  }).result;
  assert.equal(removed.deletedAt, now);
});

test("legacy-tournee debts and repayments are server-owned and atomically update cash", () => {
  const data = fixture();
  const manager = { id: "a", canManageFines: true };
  const debt = action(data, manager, {
    domain: "old-debt",
    type: "add",
    memberId: "b",
    amount: 80,
    note: "Ancienne tournée",
  }).result;
  const partial = action(data, manager, {
    domain: "old-debt",
    type: "repay",
    entryId: debt.id,
    amount: 30,
  }).result;
  assert.equal(partial.amount, 50);
  assert.equal(partial.repaidAmount, 30);
  assert.equal(data["poto-timide-autre-argent"][0].amount, 30);
  assert.equal(data["poto-timide-autre-argent"][0].sourceAncienneTourneeDetteId, debt.id);
  assert.throws(
    () => action(data, manager, {
      domain: "old-debt",
      type: "repay",
      entryId: debt.id,
      amount: 51,
    }),
    /Montant invalide/,
  );
  const adjusted = action(data, manager, {
    domain: "old-debt",
    type: "adjust-remaining",
    entryId: debt.id,
    amount: 20,
  }).result;
  assert.equal(adjusted.amount, 20);
  assert.equal(adjusted.repaidAmount, 60);
  const removed = action(data, manager, {
    domain: "old-debt",
    type: "delete",
    entryId: debt.id,
  }).result;
  assert.equal(removed.amount, 0);
  assert.equal(removed.deletedAt, now);
  assert.throws(
    () => action(data, { id: "a", canManageFines: false }, {
      domain: "old-debt",
      type: "add",
      memberId: "b",
      amount: 1,
    }),
    { status: 403 },
  );
});

test("loan requests, votes, decisions and repayments are validated and computed server-side", () => {
  const data = fixture();
  const borrower = { id: "a", canManageLoans: false, canManageFines: false };
  const financier = { id: "b", canManageLoans: true, canManageFines: true };
  const firstVote = { id: "b", canManageLoans: false, canManageFines: false };
  const secondVote = { id: "c", canManageLoans: false, canManageFines: false };

  const created = action(data, borrower, {
    domain: "loan",
    type: "request",
    amount: "100",
    note: "Besoin urgent",
  }).result;
  assert.equal(created.status, "voting");
  assert.equal(new Date(created.deadlineAt).getTime() - new Date(now).getTime(), 24 * 60 * 60 * 1000);
  assert.equal(data["poto-timide-prets"][0].amount, 100);

  assert.throws(
    () => action(data, borrower, { domain: "loan", type: "request", amount: 100, note: "Doublon" }),
    { status: 409 },
  );
  assert.throws(
    () => action(data, borrower, { domain: "loan", type: "vote", loanId: created.id, vote: "yes" }),
    { status: 403 },
  );
  action(data, firstVote, { domain: "loan", type: "vote", loanId: created.id, vote: "yes" });
  action(data, secondVote, { domain: "loan", type: "vote", loanId: created.id, vote: "yes" });
  assert.equal(data["poto-timide-prets"][0].status, "awaiting_financier");

  action(data, financier, { domain: "loan", type: "decide", loanId: created.id, decision: "approved" });
  const payment = action(data, financier, { domain: "loan", type: "repay", loanId: created.id, amount: 35 }).result;
  assert.equal(payment.totalRepaid, 35);
  assert.equal(payment.repayments.length, 1);

  const repaymentId = payment.repayments[0].id;
  const restored = action(data, financier, {
    domain: "loan",
    type: "undo-repayment",
    loanId: created.id,
    repaymentId,
  }).result;
  assert.equal(restored.totalRepaid, 0);
  assert.equal(restored.status, "active");
});

test("loan action rejects excess repayment and unauthorized financial decisions", () => {
  const data = fixture();
  const loan = {
    id: "loan-1",
    borrowerId: "a",
    amount: 100,
    status: "active",
    repayments: [],
    totalRepaid: 0,
  };
  data["poto-timide-prets"].push(loan);

  assert.throws(
    () => action(data, { id: "b", canManageLoans: false }, {
      domain: "loan",
      type: "repay",
      loanId: loan.id,
      amount: 101,
    }),
    { status: 403 },
  );
  assert.throws(
    () => action(data, { id: "b", canManageLoans: true }, {
      domain: "loan",
      type: "repay",
      loanId: loan.id,
      amount: 101,
    }),
    /Montant invalide/,
  );
});

test("fine creation, edit, partial settlement, undo and deletion update server-owned ledgers", () => {
  const data = fixture();
  const administrator = { id: "a", canManageLoans: true, canManageFines: true };
  const created = action(data, administrator, {
    domain: "fine",
    type: "add",
    memberId: "b",
    fineType: "absence",
    amount: 50,
    note: "Absence non justifiée",
  }).result;
  assert.equal(created.amount, 50);

  action(data, administrator, {
    domain: "fine",
    type: "edit",
    fineId: created.id,
    memberId: "c",
    fineType: "retard",
    amount: 60,
    note: "Retard réunion",
  });
  assert.equal(data["poto-timide-amendes"][0].memberId, "c");

  const paid = action(data, administrator, {
    domain: "fine",
    type: "repay",
    fineId: created.id,
    amount: 20,
  }).result;
  assert.equal(paid.amount, 40);
  assert.equal(paid.repaidAmount, 20);
  assert.equal(data["poto-timide-amendes-caisse"][0].amount, 20);

  action(data, administrator, {
    domain: "fine",
    type: "undo-repay",
    fineId: created.id,
    cashId: data["poto-timide-amendes-caisse"][0].id,
  });
  assert.equal(data["poto-timide-amendes"][0].amount, 60);
  assert.equal(data["poto-timide-amendes"][0].repaidAmount, 0);
  assert.equal(data["poto-timide-amendes-caisse"].length, 0);

  const deleted = action(data, administrator, {
    domain: "fine",
    type: "delete",
    fineId: created.id,
  }).result;
  assert.ok(deleted.deletedAt);
  assert.equal(deleted.amount, 0);
});

test("fine operations reject invalid amounts and unauthorized actors", () => {
  const data = fixture();
  assert.throws(
    () => action(data, { id: "a", canManageFines: false }, {
      domain: "fine",
      type: "add",
      memberId: "b",
      fineType: "absence",
      amount: 10,
      note: "Motif",
    }),
    { status: 403 },
  );
  assert.throws(
    () => action(data, { id: "a", canManageFines: true }, {
      domain: "fine",
      type: "add",
      memberId: "b",
      fineType: "absence",
      amount: 0,
      note: "Motif",
    }),
    /supérieur à 0/,
  );
});

test("deleting an event debt clears its conversion flag through the server action", () => {
  const data = fixture();
  data["poto-timide-evenements"] = [{
    id: "event-1",
    payments: {
      b: { paid: false, convertedToDebt: true, debtCreatedAt: now },
    },
  }];
  data["poto-timide-amendes"] = [{
    id: "event-debt",
    memberId: "b",
    type: "dette",
    amount: 25,
    evenementId: "event-1",
  }];

  const deleted = action(data, { id: "a", canManageFines: true }, {
    domain: "fine",
    type: "delete",
    fineId: "event-debt",
  });

  assert.ok(deleted.changedKeys.includes("poto-timide-evenements"));
  assert.equal(deleted.result.deletedAt, now);
  assert.equal(deleted.data["poto-timide-evenements"][0].payments.b.convertedToDebt, undefined);
  assert.equal(deleted.data["poto-timide-evenements"][0].payments.b.debtCreatedAt, undefined);
  assert.equal(deleted.data["poto-timide-evenements"][0].payments.b.debtDismissed, true);
  assert.equal(deleted.data["poto-timide-evenements"][0].payments.b.debtDismissedAt, now);
});

test("fine remaining-balance adjustments are computed by the backend", () => {
  const data = fixture();
  const administrator = { id: "a", canManageLoans: true, canManageFines: true };
  const created = action(data, administrator, {
    domain: "fine",
    type: "add",
    memberId: "b",
    fineType: "absence",
    amount: 40,
    note: "Retard",
  }).result;

  const adjusted = action(data, administrator, {
    domain: "fine",
    type: "adjust-remaining",
    fineId: created.id,
    amount: 25,
  }).result;
  assert.equal(adjusted.amount, 25);
  assert.equal(adjusted.originalAmount, 40);
  assert.equal(adjusted.repaidAmount, 15);

  const settled = action(data, administrator, {
    domain: "fine",
    type: "adjust-remaining",
    fineId: created.id,
    amount: 0,
  }).result;
  assert.equal(settled.amount, 0);
  assert.equal(settled.settledAt, now);
});

test("collective contributions are created and notified by the backend", () => {
  const data = fixture();
  const administrator = { id: "a", canManageLoans: true, canManageFines: true };
  const created = action(data, administrator, {
    domain: "fine",
    type: "add-bulk",
    memberIds: ["b", "c", "b"],
    amount: 15,
    note: "Contribution exceptionnelle",
  }).result;

  assert.equal(created.length, 2);
  assert.deepEqual(created.map((fine) => fine.memberId), ["b", "c"]);
  assert.ok(created.every((fine) => fine.type === "contribution" && fine.collective));
  assert.equal(data["poto-timide-notifications"][0].type, "fine_collective");
  assert.throws(
    () => action(data, administrator, {
      domain: "fine",
      type: "add-bulk",
      memberIds: ["unknown"],
      amount: 15,
      note: "Contribution exceptionnelle",
    }),
    /introuvables/,
  );
});

test("annual fund debt conversion is calculated once by the backend", () => {
  const data = fixture();
  data["poto-timide-fond-caisse-annuel"] = {
    years: {
      "2026": {
        amountPerMember: 100,
        payments: {
          b: { paidAmount: 25, history: [] },
          c: { paidAmount: 0, convertedToDebt: true },
        },
      },
    },
  };
  const financier = { id: "a", canManageFund: true, canManageFines: false };

  const result = action(data, financier, {
    domain: "fund",
    type: "convert-annual-debt",
    year: "2026",
  });
  assert.deepEqual(result.changedKeys, [
    "poto-timide-fond-caisse-annuel",
    "poto-timide-amendes",
    "poto-timide-notifications",
  ]);
  assert.equal(result.result.length, 2);
  assert.deepEqual(result.result.map((fine) => fine.memberId), ["a", "b"]);
  assert.deepEqual(result.result.map((fine) => fine.amount), [100, 75]);
  assert.equal(data["poto-timide-fond-caisse-annuel"].years["2026"].payments.b.convertedToDebt, true);
  assert.throws(
    () => action(data, financier, { domain: "fund", type: "convert-annual-debt", year: "2026" }),
    /Tout le monde a déjà versé/,
  );
});

test("annual fund setup, payments, cancellation, adjustments and deletion are computed server-side", () => {
  const data = fixture();
  const manager = { id: "a", canManageFund: true };

  const created = action(data, manager, {
    domain: "fund",
    type: "set-annual-amount",
    year: "2026",
    amount: 100,
  }).result;
  assert.equal(created.amountPerMember, 100);
  assert.equal(created.updatedBy, "a");

  const payment = action(data, manager, {
    domain: "fund",
    type: "pay",
    year: "2026",
    memberId: "b",
    amount: 30,
  }).result;
  assert.equal(payment.paidAmount, 30);
  assert.equal(payment.due, 70);
  assert.equal(data["poto-timide-notifications"].length, members.length);

  assert.throws(
    () => action(data, manager, {
      domain: "fund",
      type: "pay",
      year: "2026",
      memberId: "b",
      amount: 71,
    }),
    { status: 409 },
  );
  assert.throws(
    () => action(data, manager, {
      domain: "fund",
      type: "cancel-payment",
      year: "2026",
      memberId: "b",
      paymentId: "unknown",
    }),
    { status: 404 },
  );

  const cancelled = action(data, manager, {
    domain: "fund",
    type: "cancel-payment",
    year: "2026",
    memberId: "b",
    paymentId: payment.payment.id,
  }).result;
  assert.equal(cancelled.cancelledAmount, 30);
  assert.equal(cancelled.paidAmount, 0);
  assert.equal(cancelled.due, 100);
  assert.equal(data["poto-timide-fond-caisse-annuel"].years["2026"].payments.b, undefined);

  const adjusted = action(data, manager, {
    domain: "fund",
    type: "adjust-remaining",
    year: "2026",
    memberId: "b",
    amount: 20,
  }).result;
  assert.equal(adjusted.remaining, 20);
  assert.equal(adjusted.paidAmount, 80);
  assert.throws(
    () => action(data, manager, {
      domain: "fund",
      type: "adjust-remaining",
      year: "2026",
      memberId: "b",
      amount: 101,
    }),
    /compris entre 0 et le montant annuel/,
  );

  const deleted = action(data, manager, {
    domain: "fund",
    type: "delete-annual",
    year: "2026",
  }).result;
  assert.equal(deleted.deleted, true);
  assert.equal(data["poto-timide-fond-caisse-annuel"].years["2026"], undefined);
  assert.throws(
    () => action(data, { id: "a", canManageFund: false }, {
      domain: "fund",
      type: "set-annual-amount",
      year: "2027",
      amount: 50,
    }),
    { status: 403 },
  );
});

test("annual fund debt conversion denies actors without fund permission", () => {
  const data = fixture();
  data["poto-timide-fond-caisse-annuel"] = { years: { "2026": { amountPerMember: 100, payments: {} } } };
  assert.throws(
    () => action(data, { id: "a", canManageFund: false }, {
      domain: "fund",
      type: "convert-annual-debt",
      year: "2026",
    }),
    { status: 403 },
  );
});

test("event lifecycle, payments, reimbursement and closing are computed by the backend", () => {
  const data = fixture();
  const manager = { id: "a", canManageEvents: true, isAdmin: true };
  const created = action(data, manager, {
    domain: "event",
    type: "create",
    title: "Réunion du groupe",
    description: "Repas collectif",
    beneficiaryMemberId: "a",
    sharePerMember: 10,
  }).result;
  assert.equal(created.memberCount, 2);
  assert.equal(created.totalAmount, 20);
  assert.deepEqual(Object.keys(created.payments).sort(), ["b", "c"]);

  action(data, manager, {
    domain: "event",
    type: "payment",
    eventId: created.id,
    memberId: "b",
    amount: 10,
  });
  assert.throws(
    () => action(data, manager, {
      domain: "event",
      type: "payment",
      eventId: created.id,
      memberId: "b",
      amount: 10,
    }),
    /déjà été validé/,
  );
  action(data, manager, {
    domain: "event",
    type: "update-payment",
    eventId: created.id,
    memberId: "b",
    amount: 15,
  });
  action(data, manager, {
    domain: "event",
    type: "payment-bulk",
    eventId: created.id,
  });
  const reimbursed = action(data, manager, {
    domain: "event",
    type: "reimburse",
    eventId: created.id,
  }).result;
  assert.equal(reimbursed.collected, 25);
  assert.equal(reimbursed.unpaidCount, 0);
  assert.equal(data["poto-timide-evenements"][0].reimbursedAmount, 25);

  action(data, manager, { domain: "event", type: "close", eventId: created.id });
  assert.equal(data["poto-timide-evenements"][0].closed, true);
});

test("event reimbursement computes unpaid deduction and requires event permissions", () => {
  const data = fixture();
  const event = {
    id: "event-1",
    title: "Cotisation",
    beneficiaryMemberId: "a",
    sharePerMember: 10,
    payments: { b: { paid: false }, c: { paid: false } },
  };
  data["poto-timide-evenements"] = [event];
  assert.throws(
    () => action(data, { id: "a", canManageEvents: false }, {
      domain: "event",
      type: "reimburse",
      eventId: event.id,
    }),
    { status: 403 },
  );
  const result = action(data, { id: "a", canManageEvents: true }, {
    domain: "event",
    type: "reimburse",
    eventId: event.id,
  }).result;
  assert.equal(result.collected, 0);
  assert.equal(result.unpaidCount, 2);
  assert.equal(result.unpaidTotal, 20);
  assert.equal(data["poto-timide-evenements"][0].caisseDebtDeduction, 20);
});

test("expired loan votes are advanced by the backend once and notify the financier", () => {
  const data = fixture();
  data["poto-timide-roles"] = { tresorier: "b" };
  data["poto-timide-prets"] = [{
    id: "expired-loan",
    borrowerId: "a",
    amount: 100,
    status: "voting",
    deadlineAt: "2026-10-05T11:59:59.000Z",
    votes: {},
  }];

  const advanced = advanceLoanStatuses(data, now);
  assert.equal(advanced.changed, true);
  assert.equal(data["poto-timide-prets"][0].status, "awaiting_financier");
  assert.equal(data["poto-timide-prets"][0].autoApprovedByTimeout, true);
  assert.equal(data["poto-timide-notifications"][0].memberId, "b");
  assert.equal(advanceLoanStatuses(data, now).changed, false);
});

test("loan sanctions and interest are calculated by the backend", () => {
  const data = fixture();
  data["poto-timide-prets"] = [{
    id: "late-loan",
    borrowerId: "a",
    amount: 100,
    totalRepaid: 20,
    repayments: [{ amount: 20 }],
    status: "active",
    createdAt: "2026-08-05T10:00:00.000Z",
    approvedAt: "2026-08-05T10:00:00.000Z",
  }];

  const advanced = advanceLoanStatuses(data, "2026-09-06T10:00:00.000Z");
  const loan = data["poto-timide-prets"][0];
  assert.equal(advanced.changed, true);
  assert.equal(loan.status, "defaulted");
  assert.equal(loan.interestAmount, 10);
  assert.equal(loan.sanctionLevel, "interest-and-full-tournee-ban");
  assert.equal(loan.firstMonthEvaluated, true);
  assert.ok(loan.loanBanUntil);
  assert.equal(data["poto-timide-notifications"][0].type, "loan_interest");
  assert.equal(advanceLoanStatuses(data, "2026-09-06T10:00:00.000Z").changed, false);
});

test("fully repaid loan principal completes without late interest", () => {
  const data = fixture();
  data["poto-timide-prets"] = [{
    id: "repaid-loan",
    borrowerId: "a",
    amount: 100,
    totalRepaid: 100,
    repayments: [{ amount: 100 }],
    status: "active",
    createdAt: "2026-08-05T10:00:00.000Z",
    approvedAt: "2026-08-05T10:00:00.000Z",
  }];

  const advanced = advanceLoanStatuses(data, "2026-09-06T10:00:00.000Z");
  assert.equal(advanced.changed, true);
  assert.equal(data["poto-timide-prets"][0].status, "completed");
  assert.equal(data["poto-timide-prets"][0].interestAmount, 0);
  assert.equal(data["poto-timide-notifications"].length, 0);
});

test("loan with at least 80 percent repaid waits for the final deadline before interest", () => {
  const data = fixture();
  data["poto-timide-prets"] = [{
    id: "mostly-repaid-loan",
    borrowerId: "a",
    amount: 100,
    totalRepaid: 80,
    repayments: [{ amount: 80 }],
    status: "active",
    createdAt: "2026-08-05T10:00:00.000Z",
    approvedAt: "2026-08-05T10:00:00.000Z",
  }];

  advanceLoanStatuses(data, "2026-09-06T10:00:00.000Z");
  assert.equal(data["poto-timide-prets"][0].firstMonthEvaluated, true);
  assert.equal(data["poto-timide-prets"][0].interestApplied, undefined);

  const advanced = advanceLoanStatuses(data, "2026-10-06T10:00:00.000Z");
  assert.equal(advanced.changed, true);
  assert.equal(data["poto-timide-prets"][0].status, "defaulted");
  assert.equal(data["poto-timide-prets"][0].sanctionLevel, "interest");
});

test("loan without repayment entries preserves its legacy total repaid", () => {
  const data = fixture();
  data["poto-timide-prets"] = [{
    id: "legacy-loan",
    borrowerId: "a",
    amount: 100,
    totalRepaid: 80,
    repayments: [],
    status: "active",
    createdAt: "2026-08-05T10:00:00.000Z",
    approvedAt: "2026-08-05T10:00:00.000Z",
  }];

  advanceLoanStatuses(data, "2026-09-06T10:00:00.000Z");
  assert.equal(data["poto-timide-prets"][0].totalRepaid, 80);
  assert.equal(data["poto-timide-prets"][0].status, "active");
  assert.equal(data["poto-timide-prets"][0].interestApplied, undefined);
});

test("loan request-date changes retain their time of day and reject malformed dates", () => {
  const data = fixture();
  data["poto-timide-prets"] = [{
    id: "dated-loan",
    borrowerId: "b",
    amount: 100,
    status: "active",
    createdAt: "2026-08-12T15:42:13.000Z",
    approvedAt: "2026-08-13T09:30:00.000Z",
    financierDecidedAt: "2026-08-13T09:30:00.000Z",
    repayments: [],
  }];
  const result = action(data, { id: "a", canManageLoans: true }, {
    domain: "loan",
    type: "update-date",
    loanId: "dated-loan",
    date: "2026-09-01",
  }).result;
  assert.equal(result.createdAt, "2026-09-01T15:42:13.000Z");
  assert.equal(result.approvedAt, "2026-09-01T09:30:00.000Z");
  assert.throws(
    () => action(data, { id: "a", canManageLoans: true }, {
      domain: "loan",
      type: "update-date",
      loanId: "dated-loan",
      date: "2026-13-45",
    }),
    /Date invalide/,
  );
});
