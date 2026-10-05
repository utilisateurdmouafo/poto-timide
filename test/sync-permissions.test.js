const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canWriteSyncKey,
  validateFineSyncValue,
  validateMemberListSyncValue,
  validatePersonalSyncValue,
} = require("../lib/sync-permissions");

const treasurer = {
  id: "member-1",
  isAdmin: false,
  roleIds: ["tresorier"],
  permissions: {
    caisse: ["tresorier"],
    prets: ["tresorier"],
    amendes: ["tresorier"],
    evenements: ["tresorier"],
  },
};

test("legacy sync writes require the role assigned to each data domain", () => {
  assert.equal(canWriteSyncKey("poto-timide-prets", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-autre-argent", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-capital-hors-groupe", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-fond-caisse", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-ancienne-tournee-dettes", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-fond-caisse-annuel", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-evenements", treasurer), true);
  assert.equal(canWriteSyncKey("poto-timide-members", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-tab-permissions", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-admin-ids", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-login-log", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-notifications", treasurer), true);
  assert.equal(canWriteSyncKey("poto-timide-unknown", treasurer), false);
  assert.equal(canWriteSyncKey("poto-timide-members", { id: "owner", isAdmin: true }), true);
  assert.equal(canWriteSyncKey("poto-timide-prets", { ...treasurer, isAdmin: true }), false);
  assert.equal(canWriteSyncKey("poto-timide-autre-argent", { ...treasurer, isAdmin: true }), false);
  assert.equal(
    canWriteSyncKey("poto-timide-capital-hors-groupe", { ...treasurer, isAdmin: true }),
    false,
  );
  assert.equal(
    canWriteSyncKey("poto-timide-fond-caisse", { ...treasurer, isAdmin: true }),
    false,
  );
  assert.equal(
    canWriteSyncKey("poto-timide-ancienne-tournee-dettes", { ...treasurer, isAdmin: true }),
    false,
  );
  assert.equal(
    canWriteSyncKey("poto-timide-fond-caisse-annuel", { ...treasurer, isAdmin: true }),
    false,
  );
  assert.equal(canWriteSyncKey("poto-timide-amendes-caisse", { ...treasurer, isAdmin: true }), false);
});

test("guide sync permission matches both roles allowed by the guide UI", () => {
  const communicationsManager = {
    id: "member-2",
    isAdmin: false,
    roleIds: ["communication"],
    permissions: { communication: ["communication"] },
  };
  const loiManager = {
    id: "member-3",
    isAdmin: false,
    roleIds: ["loi"],
    permissions: { loi: ["loi"] },
  };

  assert.equal(canWriteSyncKey("poto-timide-guide", communicationsManager), true);
  assert.equal(canWriteSyncKey("poto-timide-guide", loiManager), true);
});

test("legacy sync cannot add or change ordinary fines", () => {
  const existing = [{ id: "fine", type: "absence", amount: 20, memberId: "member-1" }];
  assert.equal(
    validateFineSyncValue([{ ...existing[0], amount: 0 }], existing),
    false,
  );
  assert.equal(
    validateFineSyncValue([...existing, { id: "new-fine", type: "contribution", amount: 10, memberId: "member-1" }], existing),
    false,
  );
  const eventDebt = {
    id: "event-debt",
    type: "dette",
    amount: 20,
    memberId: "member-1",
    evenementId: "event-1",
  };
  const events = [{ id: "event-1", payments: { "member-1": { paid: false } } }];
  assert.equal(validateFineSyncValue([eventDebt], [], events), true);
  assert.equal(validateFineSyncValue([{ ...eventDebt, evenementId: "not-an-event" }], [], events), false);
});

test("legacy member sync cannot delete members outside the server action", () => {
  const existing = [{ id: "member-1" }, { id: "member-2" }];
  assert.equal(validateMemberListSyncValue([...existing, { id: "member-3" }], existing), true);
  assert.equal(validateMemberListSyncValue([existing[0]], existing), false);
  assert.equal(validateMemberListSyncValue({}, existing), false);
});

test("notification sync permits only the authenticated member to update their notifications", () => {
  const existing = [
    { id: "own", memberId: "member-1", read: false, message: "Own notification" },
    { id: "other", memberId: "member-2", read: false, message: "Private notification" },
  ];
  const ownRead = [
    { ...existing[0], read: true, updatedAt: "2026-10-05T12:00:00.000Z" },
    existing[1],
  ];
  const otherChanged = [
    existing[0],
    { ...existing[1], read: true },
  ];

  assert.equal(validatePersonalSyncValue("poto-timide-notifications", ownRead, existing, "member-1"), true);
  assert.equal(validatePersonalSyncValue("poto-timide-notifications", otherChanged, existing, "member-1"), false);
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-notifications",
      [...existing, { id: "spoof", memberId: "member-2" }],
      existing,
      "member-1",
    ),
    false,
  );
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-notifications",
      [...existing, { id: "message-notice", memberId: "member-2", type: "message", item: "msg-1", read: false, message: "New message" }],
      existing,
      "member-1",
      { messages: [{ id: "msg-1", fromId: "member-1", toId: "member-2", text: "Hello" }] },
    ),
    true,
  );
});

test("message sync only permits sending as self and recipients to mark messages read", () => {
  const existing = [
    { id: "sent", fromId: "member-1", toId: "member-2", text: "Hello", readAt: null },
    { id: "received", fromId: "member-2", toId: "member-1", text: "Hi", readAt: null },
  ];

  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-messages",
      [...existing, { id: "new", fromId: "member-1", toId: "member-2", text: "Again" }],
      existing,
      "member-1",
    ),
    true,
  );
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-messages",
      [...existing, { id: "spoof", fromId: "member-2", toId: "member-1", text: "Spoof" }],
      existing,
      "member-1",
    ),
    false,
  );
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-messages",
      [existing[0], { ...existing[1], readAt: "2026-10-05T12:00:00.000Z" }],
      existing,
      "member-1",
    ),
    true,
  );
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-messages",
      [{ ...existing[0], text: "Edited" }, existing[1]],
      existing,
      "member-1",
    ),
    false,
  );
});

test("message sync rejects empty bodies and self-messages", () => {
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-messages",
      [{ id: "empty", fromId: "member-1", toId: "member-2", text: "  " }],
      [],
      "member-1",
    ),
    false,
  );
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-messages",
      [{ id: "self", fromId: "member-1", toId: "member-1", text: "Hello" }],
      [],
      "member-1",
    ),
    false,
  );
});

test("members can only add their own report read receipt", () => {
  const existing = [{
    id: "report",
    title: "Compte rendu",
    readBy: { "member-2": "2026-10-05T12:00:00.000Z" },
  }];
  const selfReceipt = [{
    ...existing[0],
    readBy: {
      ...existing[0].readBy,
      "member-1": "2026-10-05T13:00:00.000Z",
    },
    readReceiptUpdatedAt: "2026-10-05T13:00:00.000Z",
  }];
  const forgedReceipt = [{
    ...selfReceipt[0],
    readBy: {
      ...selfReceipt[0].readBy,
      "member-3": "2026-10-05T13:00:00.000Z",
    },
  }];

  assert.equal(
    canWriteSyncKey("poto-timide-communication", { id: "member-1" }),
    true,
  );
  assert.equal(
    validatePersonalSyncValue("poto-timide-communication", selfReceipt, existing, "member-1"),
    true,
  );
  assert.equal(
    validatePersonalSyncValue("poto-timide-communication", forgedReceipt, existing, "member-1"),
    false,
  );
  assert.equal(
    validatePersonalSyncValue(
      "poto-timide-communication",
      [{ ...existing[0], title: "Falsified" }],
      existing,
      "member-1",
    ),
    false,
  );
});
