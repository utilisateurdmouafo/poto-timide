const API_SYNC_KEYS = new Set([
  "poto-timide-members",
  "poto-timide-roles",
  "poto-timide-cotisations",
  "poto-timide-tournee",
  "poto-timide-amendes",
  "poto-timide-amendes-caisse",
  "poto-timide-tab-permissions",
  "poto-timide-prets",
  "poto-timide-notifications",
  "poto-timide-evenements",
  "poto-timide-communication",
  "poto-timide-loi",
  "poto-timide-guide",
  "poto-timide-admin-ids",
  "poto-timide-autre-argent",
  "poto-timide-capital-hors-groupe",
  "poto-timide-ancienne-tournee-dettes",
  "poto-timide-finance",
  "poto-timide-fond-caisse",
  "poto-timide-fond-caisse-annuel",
  "poto-timide-financier-account",
  "poto-timide-data-revision",
  "poto-timide-audit-log",
  "poto-timide-login-log",
]);

const LAST_USER_KEY = "poto-last-user";
const SESSION_HINT_KEY = "poto-timide-session";

let authState = {
  loggedIn: false,
  member: null,
  mustChangePassword: false,
};

let syncTimer = null;
let pendingSyncPayload = {};
let inFlightSyncPayload = {};
let periodicSyncTimer = null;
let nativeSetItem = null;
let syncing = false;

function rawSetItem(key, value) {
  const fn = nativeSetItem || localStorage.setItem.bind(localStorage);
  fn.call(localStorage, key, value);
}
function getLocalDataPayload() {
  const payload = {};
  API_SYNC_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      payload[key] = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  });
  return payload;
}

function itemTimestamp(item) {
  const raw = item?.updatedAt || item?.deletedAt || item?.createdAt || item?.date || 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

function mergeById(existing, incoming) {
  const map = new Map();
  const add = (item) => {
    if (!item || typeof item !== "object" || !item.id) return;
    const id = String(item.id);
    const prev = map.get(id);
    if (!prev) {
      map.set(id, { ...item, id });
      return;
    }
    const itemNewer = itemTimestamp(item) >= itemTimestamp(prev);
    const winner = itemNewer ? item : prev;
    const loser = itemNewer ? prev : item;
    const merged = { ...loser, ...winner, id };

    // Suppression sticky : dès qu'un côté a deletedAt, on ne le perd JAMAIS
    const prevDel = prev.deletedAt ? new Date(prev.deletedAt).getTime() || 0 : 0;
    const nextDel = item.deletedAt ? new Date(item.deletedAt).getTime() || 0 : 0;
    if (prevDel || nextDel) {
      const delAt =
        nextDel >= prevDel && nextDel > 0
          ? item.deletedAt
          : prev.deletedAt || item.deletedAt;
      merged.deletedAt = delAt;
      merged.amount = 0;
      const delT = new Date(delAt).getTime() || 0;
      const winT = itemTimestamp(merged);
      if (delT >= winT) {
        merged.updatedAt = delAt;
      } else {
        merged.updatedAt = merged.updatedAt || delAt;
      }
    }
    map.set(id, merged);
  };
  (Array.isArray(existing) ? existing : []).forEach(add);
  (Array.isArray(incoming) ? incoming : []).forEach(add);
  return [...map.values()].sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
}

function loanStatusRank(status) {
  const ranks = {
    voting: 1,
    awaiting_financier: 2,
    active: 3,
    defaulted: 3,
    completed: 4,
    rejected: 4,
  };
  return ranks[status] || 0;
}

function mergeLoanVotes(a, b) {
  const votes = {};
  if (a && typeof a === "object") Object.assign(votes, a);
  if (b && typeof b === "object") Object.assign(votes, b);
  return votes;
}

/** Union des remboursements par id (ne jamais perdre un paiement synchronisé) */
function mergeLoanRepayments(a, b) {
  const map = new Map();
  const addList = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((repay) => {
      if (!repay || typeof repay !== "object") return;
      const key = repay.id || `${repay.date || ""}-${repay.amount || 0}-${repay.recordedBy || ""}`;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, { ...repay, id: repay.id || key });
        return;
      }
      const prevT = new Date(prev.date || 0).getTime() || 0;
      const nextT = new Date(repay.date || 0).getTime() || 0;
      map.set(key, nextT >= prevT ? { ...prev, ...repay, id: prev.id || repay.id || key } : prev);
    });
  };
  addList(a);
  addList(b);
  return [...map.values()].sort((x, y) => {
    const tx = new Date(x.date || 0).getTime() || 0;
    const ty = new Date(y.date || 0).getTime() || 0;
    return ty - tx;
  });
}

function recomputeLoanRepaid(loan) {
  if (!loan || typeof loan !== "object") return loan;
  const list = Array.isArray(loan.repayments) ? loan.repayments : [];
  loan.totalRepaid =
    Math.round(list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) * 100) / 100;
  return loan;
}

/** Fusion intelligente des prêts : votes + remboursements + statut le plus avancé */
function mergeLoansPreferringNewer(existing, incoming) {
  const existingList = Array.isArray(existing) ? existing : [];
  const incomingList = Array.isArray(incoming) ? incoming : [];
  const map = new Map();

  const add = (loan) => {
    if (!loan || typeof loan !== "object" || !loan.id) return;
    const prev = map.get(loan.id);
    if (!prev) {
      const seeded = {
        ...loan,
        votes: mergeLoanVotes(null, loan.votes),
        repayments: mergeLoanRepayments(null, loan.repayments),
      };
      map.set(loan.id, recomputeLoanRepaid(seeded));
      return;
    }

    const prevTime = new Date(prev.updatedAt || prev.deletedAt || prev.createdAt || 0).getTime() || 0;
    const nextTime = new Date(loan.updatedAt || loan.deletedAt || loan.createdAt || 0).getTime() || 0;
    const preferIncoming = nextTime >= prevTime;
    const base = preferIncoming ? loan : prev;
    const other = preferIncoming ? prev : loan;

    // Soft-delete collant : dès qu'un côté a deletedAt, on ne le perd jamais
    // (évite qu'un vote/remboursement plus récent fasse réapparaître le prêt)
    const prevDel = prev.deletedAt ? new Date(prev.deletedAt).getTime() || 0 : 0;
    const nextDel = loan.deletedAt ? new Date(loan.deletedAt).getTime() || 0 : 0;
    const newerDeleted =
      nextDel >= prevDel && nextDel > 0
        ? loan.deletedAt
        : prevDel > 0
          ? prev.deletedAt
          : null;

    let status = base.status;
    if (!newerDeleted && loanStatusRank(other.status) > loanStatusRank(base.status)) {
      status = other.status;
    }
    if (newerDeleted) status = "rejected";

    const mergedUpdatedAt =
      nextTime >= prevTime
        ? loan.updatedAt || loan.deletedAt || prev.updatedAt || new Date().toISOString()
        : prev.updatedAt || prev.deletedAt || loan.updatedAt || new Date().toISOString();
    const finalUpdatedAt =
      newerDeleted && new Date(mergedUpdatedAt).getTime() < new Date(newerDeleted).getTime()
        ? newerDeleted
        : mergedUpdatedAt;

    const merged = {
      ...other,
      ...base,
      status,
      votes: mergeLoanVotes(prev.votes, loan.votes),
      repayments: mergeLoanRepayments(prev.repayments, loan.repayments),
      deletedAt: newerDeleted || null,
      updatedAt: finalUpdatedAt,
    };
    map.set(loan.id, recomputeLoanRepaid(merged));
  };

  existingList.forEach(add);
  incomingList.forEach(add);

  return [...map.values()].sort((a, b) => {
    const ta = new Date(a.updatedAt || a.deletedAt || a.createdAt || 0).getTime() || 0;
    const tb = new Date(b.updatedAt || b.deletedAt || b.createdAt || 0).getTime() || 0;
    return tb - ta;
  });
}

function unwrapLocalSynced(value) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, "data") &&
    value.updatedAt
  ) {
    return value.data;
  }
  return value;
}

function objectUpdatedAtMs(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  const time = new Date(value.updatedAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}


function mergeTourneeOkMapsClient(a, b) {
  const norm = (v) => {
    if (v === true || v === 1 || v === "true") return { ok: true, at: "1970-01-01T00:00:00.000Z" };
    if (v && typeof v === "object" && ("ok" in v || "at" in v))
      return { ok: Boolean(v.ok), at: String(v.at || "1970-01-01T00:00:00.000Z") };
    return null;
  };
  const out = {};
  const ids = new Set([
    ...Object.keys(a && typeof a === "object" ? a : {}),
    ...Object.keys(b && typeof b === "object" ? b : {}),
  ]);
  ids.forEach((id) => {
    const ea = norm(a?.[id]);
    const eb = norm(b?.[id]);
    if (!ea && !eb) return;
    if (!ea) { out[id] = eb; return; }
    if (!eb) { out[id] = ea; return; }
    const ta = new Date(ea.at).getTime() || 0;
    const tb = new Date(eb.at).getTime() || 0;
    out[id] = ta >= tb ? ea : eb;
  });
  return out;
}

function mergeTourneeDataClient(local, incoming) {
  const a = local && typeof local === "object" ? local : { years: {} };
  const b = incoming && typeof incoming === "object" ? incoming : { years: {} };
  const yearsA = a.years && typeof a.years === "object" ? a.years : {};
  const yearsB = b.years && typeof b.years === "object" ? b.years : {};
  const yearKeys = new Set([...Object.keys(yearsA), ...Object.keys(yearsB)]);
  const years = {};
  yearKeys.forEach((y) => {
    const base = yearsA[y] && typeof yearsA[y] === "object" ? { ...yearsA[y] } : {};
    const inc = yearsB[y] && typeof yearsB[y] === "object" ? yearsB[y] : {};
    const out = { ...base, ...inc };
    for (const key of ["receptionOk", "ristourneOk", "bouffeOk"]) {
      if (base[key] || inc[key]) {
        out[key] = mergeTourneeOkMapsClient(base[key], inc[key]);
        if (!Object.keys(out[key]).length) delete out[key];
      }
    }
    for (const key of ["reception", "ristourne"]) {
      if (inc[key] && typeof inc[key] === "object" && Object.keys(inc[key]).length > 0) out[key] = inc[key];
      else if (base[key]) out[key] = base[key];
    }
    if (inc.partners && typeof inc.partners === "object") out.partners = inc.partners;
    else if (base.partners) out.partners = base.partners;
    years[y] = out;
  });
  const tA = new Date(a.updatedAt || 0).getTime() || 0;
  const tB = new Date(b.updatedAt || 0).getTime() || 0;
  return {
    years,
    updatedAt: new Date(Math.max(tA, tB, Date.now())).toISOString(),
  };
}


function mergeEvenementPaymentsClient(a, b) {
  const out = {};
  const add = (src) => {
    if (!src || typeof src !== "object") return;
    Object.entries(src).forEach(([memberId, pay]) => {
      if (!pay || typeof pay !== "object") return;
      const prev = out[memberId];
      if (!prev) {
        out[memberId] = { ...pay };
        return;
      }
      let merged;
      if (pay.paid && !prev.paid) merged = { ...pay };
      else if (prev.paid && !pay.paid) merged = { ...prev };
      else {
        const prevT = new Date(prev.paidAt || prev.debtDismissedAt || prev.debtCreatedAt || 0).getTime() || 0;
        const nextT = new Date(pay.paidAt || pay.debtDismissedAt || pay.debtCreatedAt || 0).getTime() || 0;
        merged = nextT >= prevT ? { ...prev, ...pay } : { ...pay, ...prev };
      }
      if (prev.debtDismissed || pay.debtDismissed) {
        merged.debtDismissed = true;
        merged.debtDismissedAt =
          pay.debtDismissedAt || prev.debtDismissedAt || new Date().toISOString();
        delete merged.convertedToDebt;
        delete merged.debtCreatedAt;
      }
      out[memberId] = merged;
    });
  };
  add(a);
  add(b);
  return out;
}

function mergeEvenementsWithPaymentsClient(local, incoming) {
  const map = new Map();
  const add = (evt) => {
    if (!evt || typeof evt !== "object" || !evt.id) return;
    const prev = map.get(evt.id);
    if (!prev) {
      map.set(evt.id, { ...evt, payments: { ...(evt.payments || {}) } });
      return;
    }
    const prevT = new Date(prev.updatedAt || prev.createdAt || 0).getTime() || 0;
    const nextT = new Date(evt.updatedAt || evt.createdAt || 0).getTime() || 0;
    const base = nextT >= prevT ? evt : prev;
    const other = nextT >= prevT ? prev : evt;
    map.set(evt.id, {
      ...other,
      ...base,
      payments: mergeEvenementPaymentsClient(prev.payments, evt.payments),
      updatedAt: new Date(Math.max(prevT, nextT, Date.now())).toISOString(),
    });
  };
  (Array.isArray(local) ? local : []).forEach(add);
  (Array.isArray(incoming) ? incoming : []).forEach(add);
  return [...map.values()];
}

function writeServerDataToLocal(serverData) {
  Object.entries(serverData || {}).forEach(([key, value]) => {
    if (!API_SYNC_KEYS.has(key)) return;
    if (Object.prototype.hasOwnProperty.call(pendingSyncPayload, key)) return;
    if (Object.prototype.hasOwnProperty.call(inFlightSyncPayload, key)) return;
    try {
      if (
        key === "poto-timide-communication" ||
        key === "poto-timide-notifications" ||
        key === "poto-timide-loi" ||
        key === "poto-timide-capital-hors-groupe" ||
        key === "poto-timide-amendes" ||
        key === "poto-timide-amendes-caisse" ||
        key === "poto-timide-ancienne-tournee-dettes" ||
        key === "poto-timide-autre-argent" ||
        key === "poto-timide-members"
      ) {
        const raw = localStorage.getItem(key);
        let local = [];
        try {
          local = raw ? unwrapLocalSynced(JSON.parse(raw)) : [];
        } catch {
          local = [];
        }
        const incoming = unwrapLocalSynced(value);
        value = mergeById(
          Array.isArray(local) ? local : [],
          Array.isArray(incoming) ? incoming : []
        );
      }
      if (key === "poto-timide-prets") {
        const raw = localStorage.getItem(key);
        const local = raw ? unwrapLocalSynced(JSON.parse(raw)) : [];
        const incoming = unwrapLocalSynced(value);
        value = mergeLoansPreferringNewer(Array.isArray(local) ? local : [], Array.isArray(incoming) ? incoming : []);
      }
      if (key === "poto-timide-evenements") {
        const raw = localStorage.getItem(key);
        let local = [];
        try {
          local = raw ? unwrapLocalSynced(JSON.parse(raw)) : [];
        } catch {
          local = [];
        }
        const incoming = unwrapLocalSynced(value);
        value = mergeEvenementsWithPaymentsClient(
          Array.isArray(local) ? local : [],
          Array.isArray(incoming) ? incoming : []
        );
      }
      if (key === "poto-timide-tournee") {
        const raw = localStorage.getItem(key);
        let local = { years: {} };
        try {
          local = raw ? unwrapLocalSynced(JSON.parse(raw)) : { years: {} };
        } catch {
          local = { years: {} };
        }
        const incoming = unwrapLocalSynced(value) || { years: {} };
        value = mergeTourneeDataClient(local, incoming);
      }
      // Accès / rôles / admins : ne pas écraser une version locale plus récente
      if (
        key === "poto-timide-tab-permissions" ||
        key === "poto-timide-roles" ||
        key === "poto-timide-admin-ids"
      ) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const local = unwrapLocalSynced(JSON.parse(raw));
            const incoming = unwrapLocalSynced(value);
            if (objectUpdatedAtMs(local) > objectUpdatedAtMs(incoming)) {
              value = local;
            } else {
              value = incoming;
            }
          } catch {
            /* keep server value */
          }
        }
      }
      rawSetItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("Impossible d'écrire la clé locale", key, err);
    }
  });
}
