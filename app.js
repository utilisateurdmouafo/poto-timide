const STORAGE_KEY = "poto-timide-members";
const ROLES_KEY = "poto-timide-roles";
const COTISATIONS_KEY = "poto-timide-cotisations";
const TOURNEE_KEY = "poto-timide-tournee";
const TOURNEE_PARTNERS_KEY = "partners";
/** Membres ayant déjà « bouffé » / pris leur tournée (marqué OK par le Financier) */
const TOURNEE_BOUFFE_OK_KEY = "bouffeOk";
/** Date de réception choisie par membre (YYYY-MM-DD) — conservé, plus affiché */
const TOURNEE_RECEPTION_DATES_KEY = "receptionDates";
/** Ordre de réception / ristourne : { "8": [memberIds], ... } */
const TOURNEE_RECEPTION_KEY = "reception";
const TOURNEE_RISTOURNE_KEY = "ristourne";
const TOURNEE_META_KEYS = new Set([
  TOURNEE_PARTNERS_KEY,
  TOURNEE_BOUFFE_OK_KEY,
  TOURNEE_RECEPTION_DATES_KEY,
  TOURNEE_RECEPTION_KEY,
  TOURNEE_RISTOURNE_KEY,
]);
/** 10 mois de tournée : septembre → juin */
const TOURNEE_CYCLE_MONTHS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
const FULL_TOURNEE_COTISATION = 200;
const MONTH_SHORT_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
];
const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
/** Cycle de tournée : septembre → juin (rang 0 = septembre) */
const TOURNEE_CYCLE_START_MONTH = 8;
const AMENDES_KEY = "poto-timide-amendes";
const AMENDES_CAISSE_KEY = "poto-timide-amendes-caisse";
const TAB_PERMISSIONS_KEY = "poto-timide-tab-permissions";
const PRETS_KEY = "poto-timide-prets";
const NOTIFICATIONS_KEY = "poto-timide-notifications";
const PAYMENT_SIGNALS_KEY = "poto-timide-payment-signals";
const PAYMENT_SIGNAL_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const EVENEMENTS_KEY = "poto-timide-evenements";
const ADMIN_IDS_KEY = "poto-timide-admin-ids";
const AUTRE_ARGENT_KEY = "poto-timide-autre-argent";
const ANCIENNE_TOURNEE_DETTES_KEY = "poto-timide-ancienne-tournee-dettes";
const FOND_CAISSE_KEY = "poto-timide-fond-caisse";
const FOND_CAISSE_ANNUEL_KEY = "poto-timide-fond-caisse-annuel";
const FINANCIER_ACCOUNT_KEY = "poto-timide-financier-account";
const FINANCE_KEY = "poto-timide-finance";
const FINANCE_SUBTAB_KEY = "poto-timide-finance-subtab";
const SESSION_KEY = "poto-timide-session";
const ACTIVE_TAB_KEY = "poto-timide-active-tab";
const TAB_IDS = ["membres", "tournee", "prets", "evenements", "dettes", "amendes", "finance", "admin"];
const FINANCE_SUBTABS = ["caisse", "archives"];
const FINANCE_LIVE_DETTE_SUB = "dettes-amendes";
const FINANCE_CAISSE_SUB = "caisse";
const FINANCE_ARCHIVES_SUB = "archives";
const ADMIN_SUBTABS = ["membres", "bureau", "admins", "acces", "tournee", "ancienne-tournee", "caisse", "prets", "amendes", "evenements"];
const ADMIN_SUBTAB_KEY = "poto-timide-admin-subtab";
// Compat anciens noms de stockage
const GESTION_SUBTAB_KEY = ADMIN_SUBTAB_KEY;
const MAX_MEMBERS = 50;
const ADMIN_NAME = "Dario";
const DEFAULT_FOND_CAISSE = 0;
const CAISSE_RESERVE = 300;
const LOAN_VOTE_HOURS = 24;
const LOAN_INTEREST_RATE = 0.1;
const REPAYMENT_MONTH1_RATIO = 0.8;
const PENDING_VOTE_STATUSES = ["voting", "awaiting_financier"];
const BORROWER_ACTIVE_STATUSES = ["voting", "awaiting_financier", "active", "defaulted"];

const ROLES = [
  { id: "president", label: "Président", short: "Président" },
  { id: "vice-president", label: "Vice président", short: "V.-Prés." },
  { id: "censeur", label: "Censeur", short: "Censeur" },
  { id: "tresorier", label: "Financier", short: "Financier" },
  { id: "vice-tresorier", label: "Vice financier", short: "V.-Fin." },
  { id: "charge-affaires", label: "Chargé d'activité", short: "Chg. act." },
  { id: "vice-charge-affaires", label: "Vice chargé d'activité", short: "V.-Chg." },
];

const AMENDE_TYPES = [
  { id: "absence", label: "Absence" },
  { id: "retard", label: "Retard" },
  { id: "bavardage", label: "Bavardage" },
  { id: "sanctions", label: "Sanctions" },
];

const EVENEMENT_TYPES = [
  { id: "accouchement", label: "Accouchement" },
  { id: "visite_parent", label: "Visite parent" },
  { id: "autre", label: "Autre" },
];

const MANAGEABLE_TABS = [
  { id: "membres", label: "Membres" },
  { id: "bureau", label: "Bureau" },
  { id: "tournee", label: "Tournée" },
  { id: "ancienne-tournee", label: "Dette ancienne tournée" },
  { id: "caisse", label: "Caisse" },
  { id: "prets", label: "Prêts" },
  { id: "amendes", label: "Dettes & amendes" },
  { id: "evenements", label: "Événements" },
];

const DEFAULT_TAB_PERMISSIONS = {
  membres: [],
  bureau: [],
  tournee: [],
  "ancienne-tournee": ["tresorier"],
  caisse: ["tresorier"],
  prets: ["tresorier"],
  amendes: ["censeur", "tresorier"],
  evenements: ["tresorier"],
};

const DEFAULT_MEMBER_NAMES = [
  "Yves",
  "Quentin",
  "Donald",
  "Hugo",
  "Elysée",
  "Ferlin",
  "William",
  "Luc",
  "David",
  "Boris",
  "Prince",
  "Dario",
  "Jp",
  "Fabrice",
  "Vitran",
];

const memberForm = document.getElementById("memberForm");
const memberNameInput = document.getElementById("memberName");
const memberList = document.getElementById("memberList");
const onlineList = document.getElementById("onlineList");
const onlineCount = document.getElementById("onlineCount");
let onlineMembers = [];
let onlinePollTimer = null;
const memberCounter = document.getElementById("memberCounter");
const submitBtn = document.getElementById("submitBtn");
const limitMsg = document.getElementById("limitMsg");
const roleForm = document.getElementById("roleForm");
const roleMemberSelect = document.getElementById("roleMember");
const rolePostSelect = document.getElementById("rolePost");
const bureauList = document.getElementById("bureauList");
const bureauListGestion = document.getElementById("bureauListGestion");
const bureauAssignToggle = document.getElementById("bureauAssignToggle");
let bureauAssignOpen = false;
const memberListAdmin = document.getElementById("memberListAdmin");
const cotisationBody = document.getElementById("cotisationBody");
const cotisationTotal = document.getElementById("cotisationTotal");
const tourneeCotisationBody = document.getElementById("tourneeCotisationBody");
const tourneeYearSelect = document.getElementById("tourneeYear");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const userStatus = document.getElementById("userStatus");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const loginNameInput = document.getElementById("loginName");
const loginPasswordInput = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const changePasswordModal = document.getElementById("changePasswordModal");
const changePasswordForm = document.getElementById("changePasswordForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const changePasswordError = document.getElementById("changePasswordError");
const appEl = document.getElementById("app");
const saveCotisationsBtn = document.getElementById("saveCotisationsBtn");
const saveMsg = document.getElementById("saveMsg");
const tourneeInfoMsg = document.getElementById("tourneeInfoMsg");
const membresLockMsg = document.getElementById("membresLockMsg");
const adminSections = document.querySelectorAll(".admin-section");
const rolesPanel = document.getElementById("rolesPanel");
const addMemberPanel = document.getElementById("addMemberPanel");
const addAmendePanel = document.getElementById("addAmendePanel");
const amendeForm = document.getElementById("amendeForm");
const amendeMemberSelect = document.getElementById("amendeMember");
const amendeBody = document.getElementById("amendeBody");
const amendeSummary = document.getElementById("amendeSummary");
const amendeDetteWrap = document.getElementById("amendeDetteWrap");
const amendeDetteSubtitle = document.getElementById("amendeDetteSubtitle");
const amendeDetteSummary = document.getElementById("amendeDetteSummary");
const amendeDetteBody = document.getElementById("amendeDetteBody");
const amendeRegularWrap = document.getElementById("amendeRegularWrap");
const amendeRegularSummary = document.getElementById("amendeRegularSummary");
const amendeTitle = document.getElementById("amendeTitle");
const amendeSubtitle = document.getElementById("amendeSubtitle");
const detteTitle = document.getElementById("detteTitle");
const detteSubtitle = document.getElementById("detteSubtitle");
const detteSummary = document.getElementById("detteSummary");
const amendeFormTitle = document.getElementById("amendeFormTitle");
const amendeSubmitBtn = document.getElementById("amendeSubmitBtn");
const amendeCancelBtn = document.getElementById("amendeCancelBtn");
const amendeTypeSelect = document.getElementById("amendeType");
const amendeAmountInput = document.getElementById("amendeAmount");
const amendeNoteInput = document.getElementById("amendeNote");
const tabPermissionsPanel = document.getElementById("tabPermissionsPanel");
const tabPermissionsBody = document.getElementById("tabPermissionsBody");
const tabPermissionsTable = document.getElementById("tabPermissionsTable");
const saveTabPermissionsBtn = document.getElementById("saveTabPermissionsBtn");
const tabPermissionsMsg = document.getElementById("tabPermissionsMsg");
const pretSummary = document.getElementById("pretSummary");
const pretSaveMsg = document.getElementById("pretSaveMsg");
const pretNotificationsPanel = document.getElementById("pretNotificationsPanel");
const pretNotificationsList = document.getElementById("pretNotificationsList");
const pretForm = document.getElementById("pretForm");
const pretAmountInput = document.getElementById("pretAmount");
const pretNoteInput = document.getElementById("pretNote");
const pretVotingList = document.getElementById("pretVotingList");
const financierPretPanel = document.getElementById("financierPretPanel");
const pretFinancierList = document.getElementById("pretFinancierList");
const pretActiveList = document.getElementById("pretActiveList");
const pretActiveTitle = document.getElementById("pretActiveTitle");
const initiatePretPanel = document.getElementById("initiatePretPanel");
const pretLockMsg = document.getElementById("pretLockMsg");
const addEvenementPanel = document.getElementById("addEvenementPanel");
const evenementForm = document.getElementById("evenementForm");
const evenementTitleInput = document.getElementById("evenementTitle");
const evenementAmountInput = document.getElementById("evenementAmount");
const evenementDescInput = document.getElementById("evenementDesc");
const evenementMemberSelect = document.getElementById("evenementMember");
const resetClosedEvenementsBtn = document.getElementById("resetClosedEvenementsBtn");
const evenementList = document.getElementById("evenementList");
const evenementListTitle = document.getElementById("evenementListTitle");
const evenementListSubtitle = document.getElementById("evenementListSubtitle");
const evenementSaveMsg = document.getElementById("evenementSaveMsg");
const evenementMemberSummary = document.getElementById("evenementMemberSummary");
const adminRolesPanel = document.getElementById("adminRolesPanel");
const adminList = document.getElementById("adminList");
const adminForm = document.getElementById("adminForm");
const adminMemberSelect = document.getElementById("adminMemberSelect");
const tabBtnAutreArgent = document.getElementById("tabBtnAutreArgent");
const tabBtnTournee = document.getElementById("tabBtnTournee");
const tabBtnAdmin = document.getElementById("tabBtnAdmin");
const tabBtnGestion = tabBtnAdmin; // alias
const adminSubtabs = document.getElementById("adminSubtabs");
const gestionSubtabs = adminSubtabs; // alias
const autreArgentForm = document.getElementById("autreArgentForm");
const autreArgentMemberSelect = document.getElementById("autreArgentMember");
const autreArgentAmountInput = document.getElementById("autreArgentAmount");
const autreArgentNoteInput = document.getElementById("autreArgentNote");
const autreArgentMotifSelect = document.getElementById("autreArgentMotif");
const autreArgentWithdrawBtn = document.getElementById("autreArgentWithdrawBtn");
const ancienneTourneeForm = document.getElementById("ancienneTourneeForm");
const ancienneTourneeMemberSelect = document.getElementById("ancienneTourneeMember");
const ancienneTourneeAmountInput = document.getElementById("ancienneTourneeAmount");
const autreArgentCaisseDispoLive = document.getElementById("autreArgentCaisseDispoLive");
const autreArgentRetraitsTotal = document.getElementById("autreArgentRetraitsTotal");
const autreArgentList = document.getElementById("autreArgentList");
const autreArgentTotal = document.getElementById("autreArgentTotal");
const autreArgentSaveMsg = document.getElementById("autreArgentSaveMsg");
const autreArgentFormPanel = document.getElementById("autreArgentFormPanel");
const autreArgentListPanel = document.getElementById("autreArgentListPanel");
const fondCaissePanel = document.getElementById("fondCaissePanel");
const fondCaisseForm = document.getElementById("fondCaisseForm");
const fondCaisseAmountInput = document.getElementById("fondCaisseAmount");
const fondCaisseSaveMsg = document.getElementById("fondCaisseSaveMsg");
const resetFondCaisseBtn = document.getElementById("resetFondCaisseBtn");
const fondCaisseDisplay = document.getElementById("fondCaisseDisplay");
const fondCaisseDisplayFinancier = document.getElementById("fondCaisseDisplayFinancier");
const fondCaisseFormAdmin = document.getElementById("fondCaisseFormAdmin");
const fondCaisseAmountAdmin = document.getElementById("fondCaisseAmountAdmin");
const fondCaisseSaveMsgAdmin = document.getElementById("fondCaisseSaveMsgAdmin");
const resetFondCaisseBtnAdmin = document.getElementById("resetFondCaisseBtnAdmin");
const fondCaisseAnnuelForm = document.getElementById("fondCaisseAnnuelForm");
const fondCaisseAnnuelYearSelect = document.getElementById("fondCaisseAnnuelYear");
const fondCaisseAnnuelAmountInput = document.getElementById("fondCaisseAnnuelAmount");
const fondCaisseAnnuelSaveMsg = document.getElementById("fondCaisseAnnuelSaveMsg");
const fondCaisseAnnuelSummary = document.getElementById("fondCaisseAnnuelSummary");
const fondCaisseAnnuelList = document.getElementById("fondCaisseAnnuelList");
const fondCaisseAnnuelDeleteBtn = document.getElementById("fondCaisseAnnuelDeleteBtn");
const cotisationBodyPublic = document.getElementById("cotisationBodyPublic");
const cotisationTotalPublic = document.getElementById("cotisationTotalPublic");
const tourneeYearPublic = document.getElementById("tourneeYearPublic");
const simpleViewBanner = document.getElementById("simpleViewBanner");
const autreArgentCaisseTotal = document.getElementById("autreArgentCaisseTotal");
const financeDashboard = document.getElementById("financeDashboard");
const financeSubtabs = document.getElementById("financeSubtabs");
const financeSubcontent = document.getElementById("financeSubcontent");
const financeSubtitle = document.getElementById("financeSubtitle");
const financeDettesAmendes = document.getElementById("financeDettesAmendes");
const financeCaisse = document.getElementById("financeCaisse");
const financeSubCaisse = document.getElementById("financeSubCaisse");

let members = [];
let adminIds = [];
let roles = {};
let cotisations = {};
let cotisationsDraft = {};
let tourneeData = { years: {} };
let tourneeDraft = { years: {} };
let tourneeYear = String(new Date().getFullYear());
let tourneeSortKey = "month";
let tourneeSortDir = "asc";
let amendes = [];
let amendesCaisse = [];
let tabPermissions = {};
let prets = [];
let notifications = [];
let paymentSignals = [];
let evenements = [];
let autreArgent = [];
let ancienneTourneeDettes = [];
let fondCaisse = DEFAULT_FOND_CAISSE;
let fondCaisseAnnuel = { years: {} };
let financierAccount = { iban: "", holder: "", bank: "" };
let financeData = null;
let activeFinanceSub = FINANCE_ARCHIVES_SUB;
let activeAdminSub = "membres";
let activeGestionSub = "membres"; // alias
let editingAmendeId = null;
let appReady = false;

function getDefaultMembers() {
  const baseDate = "2025-01-18T00:00:00.000Z";
  return [...DEFAULT_MEMBER_NAMES]
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
    .map((name, index) => ({
      id: `default-${index + 1}`,
      name,
      createdAt: baseDate,
    }));
}

function migrateDariosToDario(list) {
  let changed = false;
  list.forEach((member) => {
    if (member.name.toLowerCase() === "darios") {
      member.name = "Dario";
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  return list;
}

function loadMembers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return migrateDariosToDario(JSON.parse(data));
  } catch {
    /* ignore corrupted storage */
  }

  const defaults = getDefaultMembers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function loadAdminIds() {
  try {
    const data = localStorage.getItem(ADMIN_IDS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore corrupted storage */
  }
  return [];
}

function saveAdminIds(shouldRender = true) {
  localStorage.setItem(ADMIN_IDS_KEY, JSON.stringify(adminIds));
  if (shouldRender) render();
}

function getOwnerMember() {
  return members.find((member) => member.name.toLowerCase() === ADMIN_NAME.toLowerCase()) || null;
}

function isOwnerMember(memberOrId) {
  const owner = getOwnerMember();
  if (!owner) return false;
  const memberId = typeof memberOrId === "string" ? memberOrId : memberOrId?.id;
  return memberId === owner.id;
}

function ensureDefaultAdmin() {
  adminIds = adminIds.filter((id) => members.some((member) => member.id === id));
  ensureOwnerAdmin();
  if (adminIds.length > 0) return;

  const owner = getOwnerMember();
  if (owner) {
    adminIds = [owner.id];
    saveAdminIds(false);
  }
}

function ensureOwnerAdmin() {
  const owner = getOwnerMember();
  if (!owner) return;
  if (!adminIds.includes(owner.id)) {
    adminIds = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
    saveAdminIds(false);
  }
}

function isMemberAdmin(memberId) {
  if (isOwnerMember(memberId)) return true;
  return adminIds.includes(memberId);
}

function loadAutreArgent() {
  try {
    const data = localStorage.getItem(AUTRE_ARGENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadAncienneTourneeDettes() {
  try {
    const data = localStorage.getItem(ANCIENNE_TOURNEE_DETTES_KEY);
    const raw = data ? JSON.parse(data) : [];
    if (Array.isArray(raw)) {
      return raw
        .filter((entry) => entry && entry.memberId && Number(entry.amount) > 0)
        .map((entry) => ({
          id: entry.id || generateId(),
          memberId: entry.memberId,
          amount: Number(entry.amount),
          originalAmount: Number(entry.originalAmount) > 0 ? Number(entry.originalAmount) : Number(entry.amount),
          repaidAmount: Number(entry.repaidAmount) || 0,
          repayments: Array.isArray(entry.repayments) ? entry.repayments : [],
          note: String(entry.note || ""),
          createdAt: entry.createdAt || new Date().toISOString(),
          createdBy: entry.createdBy || null,
        }));
    }
    if (raw && typeof raw === "object") {
      return Object.entries(raw)
        .filter(([, value]) => Number(value) > 0)
        .map(([memberId, amount]) => ({
          id: generateId(),
          memberId,
          amount: Number(amount),
          note: "",
          createdAt: new Date().toISOString(),
          createdBy: null,
        }));
    }
    return [];
  } catch {
    return [];
  }
}

function bumpLiveDataRevision() {
  localStorage.setItem("poto-timide-data-revision", JSON.stringify(Date.now()));
}

function saveAncienneTourneeDettes(shouldRender = true) {
  localStorage.setItem(ANCIENNE_TOURNEE_DETTES_KEY, JSON.stringify(ancienneTourneeDettes));
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  if (shouldRender) {
    renderAncienneTourneeDettesAdmin();
    renderAncienneTourneeMemberView();
  }
}

function getAncienneTourneeEntriesFor(memberId) {
  return ancienneTourneeDettes.filter((entry) => entry.memberId === memberId);
}

function getAncienneTourneeDette(memberId) {
  return getAncienneTourneeEntriesFor(memberId).reduce(
    (sum, entry) => sum + (Number(entry.amount) || 0),
    0
  );
}

function getAncienneTourneeRepaidAmount(entry) {
  return Number(entry?.repaidAmount) || 0;
}

function formatAncienneTourneeAmountHtml(entry) {
  const remaining = Number(entry.amount) || 0;
  const repaid = getAncienneTourneeRepaidAmount(entry);
  if (repaid > 0) {
    return `<strong>${formatEuro(remaining)}</strong><span class="ancienne-tournee-repaid-hint">déjà ${formatEuro(repaid)}</span>`;
  }
  return `<strong>${formatEuro(remaining)}</strong>`;
}

function buildAncienneTourneeRepayControls(entry) {
  if (!canRepayAncienneTourneeDette()) return "";
  const remaining = Number(entry.amount) || 0;
  return `
    <div class="ancienne-tournee-repay-controls">
      <label class="ancienne-tournee-repay-field">
        <input
          type="number"
          min="0.5"
          step="0.5"
          max="${remaining}"
          value="${remaining}"
          class="ancienne-tournee-repay-input"
          data-id="${escapeHtml(entry.id)}"
          inputmode="decimal"
          aria-label="Montant à rembourser, reste ${formatEuro(remaining)}"
        />
        <span aria-hidden="true">€</span>
      </label>
      <button type="button" class="btn-primary btn-ancienne-tournee-repay" data-id="${escapeHtml(entry.id)}">Rembourser</button>
    </div>
  `;
}

function loadFinance() {
  try {
    const data = localStorage.getItem(FINANCE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function ensureFinanceData() {
  if (financeData) return;
  financeData = loadFinance();
  // Explicit wipe — do not re-import historical Excel archive
  if (financeData && (financeData.cleared === true || financeData.source === "cleared")) {
    return;
  }
  if (financeData) return;

  try {
    const res = await fetch("/finance-vitran.json", { cache: "no-cache" });
    if (!res.ok) return;
    financeData = await res.json();
    localStorage.setItem(FINANCE_KEY, JSON.stringify(financeData));
  } catch (err) {
    console.warn("Chargement finance-vitran.json impossible.", err);
  }
}

function getFinanceSubtab() {
  const stored = localStorage.getItem(FINANCE_SUBTAB_KEY);
  // Anciens sous-onglets d'archives → regroupés
  if (
    stored === "cotisations" ||
    stored === "ancienne-tournee" ||
    stored === "amendes" ||
    stored === "prets" ||
    stored === "amendes-live" ||
    stored === "dettes" ||
    stored === FINANCE_LIVE_DETTE_SUB
  ) {
    return FINANCE_ARCHIVES_SUB;
  }
  if (stored === FINANCE_LIVE_DETTE_SUB || stored === "amendes-live" || stored === "dettes") {
    return FINANCE_ARCHIVES_SUB;
  }
  if (stored === FINANCE_CAISSE_SUB && !canAccessCaisse()) return FINANCE_ARCHIVES_SUB;
  return FINANCE_SUBTABS.includes(stored) ? stored : FINANCE_ARCHIVES_SUB;
}

function isFinanceDettesAmendesSub(subId = activeFinanceSub) {
  return subId === FINANCE_LIVE_DETTE_SUB;
}

function isFinanceCaisseSub(subId = activeFinanceSub) {
  return subId === FINANCE_CAISSE_SUB;
}

function showFinanceSub(subId) {
  if (subId === FINANCE_LIVE_DETTE_SUB) {
    showTab("dettes");
    return;
  }
  if (!FINANCE_SUBTABS.includes(subId)) subId = FINANCE_ARCHIVES_SUB;
  if (subId === FINANCE_CAISSE_SUB && !canAccessCaisse()) subId = FINANCE_ARCHIVES_SUB;
  activeFinanceSub = subId;
  localStorage.setItem(FINANCE_SUBTAB_KEY, subId);
  financeSubtabs?.querySelectorAll(".finance-subtab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.financeSub === subId);
  });
  renderFinanceSubcontent();
}

/** Totaux live Entrées / Sorties / Soldes (caisse réelle du groupe) */
function getFinanceLiveFlow() {
  const fond = getFondCaisse();
  const fondAnnuel = getTotalFondCaisseAnnuelVerse();
  const amendes = getTotalAmendesInCaisse();
  const dons = getTotalDonsOuAides();
  const retraits = getTotalRetraitsCaisse();
  const evenementsCollectes = evenements.reduce(
    (sum, evt) => sum + getEvenementCollectedAmount(evt),
    0
  );
  const remboursementsPrets = prets
    .filter((loan) => ["active", "defaulted", "completed"].includes(loan.status))
    .reduce((sum, loan) => sum + (loan.totalRepaid || 0), 0);

  const entrees = fond + fondAnnuel + amendes + dons + evenementsCollectes + remboursementsPrets;

  const pretsAccordes = prets
    .filter((loan) => ["active", "defaulted", "completed"].includes(loan.status))
    .reduce((sum, loan) => sum + loan.amount, 0);
  const evenementsRemises = evenements
    .filter((evt) => isEvenementReimbursed(evt))
    .reduce((sum, evt) => sum + (evt.reimbursedAmount ?? getEvenementCollectedAmount(evt)), 0);
  const dettesDeduites = getTotalEvenementDebtDeductions();

  const sorties = pretsAccordes + evenementsRemises + dettesDeduites + retraits;

  // Solde brut = tout l'argent réellement disponible du groupe
  // (caisse libre + cotisations événements encore en caisse)
  // = fond + amendes + dons + événements non remis − prêts sortis + remboursements
  const soldeDisponible = getCaisseDisponible();
  const evenementsEnCaisse = getTotalEvenementsInCaisse();
  const soldeBrute = soldeDisponible + evenementsEnCaisse;

  return {
    entrees,
    sorties,
    soldeDisponible,
    soldeBrute,
    evenementsEnCaisse,
    detailEntrees: { fond, fondAnnuel, amendes, dons, evenementsCollectes, remboursementsPrets },
    detailSorties: { pretsAccordes, evenementsRemises, dettesDeduites, retraits },
  };
}

function renderFinanceDashboard() {
  if (!financeDashboard) return;

  const flow = getFinanceLiveFlow();
  const dIn = flow.detailEntrees;
  const dOut = flow.detailSorties;

  const entreesNote = canViewFondCaisse()
    ? `Fond ${formatEuro(dIn.fond)} · Fond annuel ${formatEuro(dIn.fondAnnuel || 0)} · Amendes ${formatEuro(dIn.amendes)} · Dons ou aides ${formatEuro(dIn.dons)} · Événements ${formatEuro(dIn.evenementsCollectes)} · Remb. prêts ${formatEuro(dIn.remboursementsPrets)}`
    : `Fond annuel ${formatEuro(dIn.fondAnnuel || 0)} · Amendes ${formatEuro(dIn.amendes)} · Dons ou aides ${formatEuro(dIn.dons)} · Événements ${formatEuro(dIn.evenementsCollectes)} · Remb. prêts ${formatEuro(dIn.remboursementsPrets)}`;

  financeDashboard.innerHTML = `
    <div class="finance-stat finance-stat--in">
      <span class="finance-stat-label">Entrées</span>
      <strong>${formatEuro(flow.entrees)}</strong>
      <span class="finance-stat-note">${entreesNote}</span>
    </div>
    <div class="finance-stat finance-stat--out">
      <span class="finance-stat-label">Sorties</span>
      <strong>${formatEuro(flow.sorties)}</strong>
      <span class="finance-stat-note">Prêts ${formatEuro(dOut.pretsAccordes)} · Remb. potos ${formatEuro(dOut.evenementsRemises)} · Dettes ${formatEuro(dOut.dettesDeduites)} · Retraits ${formatEuro(dOut.retraits || 0)}</span>
    </div>
    <div class="finance-stat finance-stat--balance finance-stat--brute">
      <span class="finance-stat-label">Solde brut</span>
      <strong>${formatEuro(flow.soldeBrute)}</strong>
      <span class="finance-stat-note">Caisse disponible + événements (${formatEuro(flow.evenementsEnCaisse)})</span>
    </div>
    <div class="finance-stat finance-stat--balance">
      <span class="finance-stat-label">Solde disponible</span>
      <strong>${formatEuro(flow.soldeDisponible)}</strong>
      <span class="finance-stat-note">Argent libre pour les prêts</span>
    </div>
  `;
  if (financeSubtitle) {
    financeSubtitle.hidden = true;
    financeSubtitle.textContent = "";
  }
}

function renderFinanceCotisations() {
  const rows = financeData?.cotisations || [];
  const totals = financeData?.cotisationMemberTotals || [];
  const body = rows.length
    ? rows
        .map(
          (row, i) => `
        <tr style="--finance-row-i:${i}">
          <td>${escapeHtml(row.yearA?.month || "—")}</td>
          <td>${escapeHtml(row.yearA?.receivers || "—")}</td>
          <td>${escapeHtml(row.yearA?.eaters || "—")}</td>
          <td>${escapeHtml(row.yearB?.month || "—")}</td>
          <td>${escapeHtml(String(row.yearB?.receivers ?? "—"))}</td>
          <td>${escapeHtml(row.yearB?.eaters || "—")}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="finance-empty-cell">Aucune cotisation.</td></tr>`;

  const totalsBody = totals.length
    ? totals
        .map(
          (row) => `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td class="finance-td-amount">${formatEuro(row.amount || 0)}</td>
        </tr>`
        )
        .join("")
    : "";

  return `
    <div class="finance-section-head"><h3>Organisation des cotisations (tournées)</h3></div>
    <div class="finance-table-wrap">
      <table class="finance-table">
        <thead>
          <tr>
            <th colspan="3">Tournée A</th>
            <th colspan="3">Tournée B</th>
          </tr>
          <tr>
            <th>Mois</th><th>Reçoit</th><th>Bouffe</th>
            <th>Mois</th><th>Reçoit</th><th>Bouffe</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    ${
      totals.length
        ? `<div class="finance-section-head finance-section-head--sub"><h3>Totaux par membre</h3><span>Total général : ${formatEuro(financeData.cotisationTotal || 0)}</span></div>
    <div class="finance-table-wrap finance-table-wrap--compact">
      <table class="finance-table">
        <thead><tr><th>Membre</th><th class="finance-th-amount">Montant</th></tr></thead>
        <tbody>${totalsBody}</tbody>
      </table>
    </div>`
        : ""
    }`;
}

function renderFinanceAncienneTournee() {
  const membersRows = financeData?.ancienneTournee || [];
  if (!membersRows.length) return `<p class="finance-empty">Ancienne tournée indisponible.</p>`;

  const columnKeys = new Set();
  membersRows.forEach((row) => {
    Object.keys(row.columns || {}).forEach((key) => columnKeys.add(key));
  });
  const cols = [...columnKeys];

  const head = cols
    .map((col) => `<th colspan="3">${escapeHtml(col)}</th>`)
    .join("");
  const subHead = cols.map(() => `<th>Payé</th><th>Dû</th><th>Reste</th>`).join("");

  const body = membersRows
    .map((row, i) => {
      const fond = `<td>${row.fondPaid ?? "—"}</td><td>${row.fondDue ?? "—"}</td><td>${row.fondRest ?? "—"}</td>`;
      const cells = cols
        .map((col) => {
          const cell = row.columns?.[col] || {};
          return `<td>${cell.paid ?? "—"}</td><td>${cell.due ?? "—"}</td><td>${cell.rest ?? "—"}</td>`;
        })
        .join("");
      return `<tr style="--finance-row-i:${i}"><td class="finance-td-person">${escapeHtml(row.name)}</td>${fond}${cells}</tr>`;
    })
    .join("");

  return `
    <div class="finance-section-head"><h3>Ancienne tournée — soldes par membre</h3></div>
    <div class="finance-table-wrap finance-table-wrap--wide">
      <table class="finance-table finance-table--matrix">
        <thead>
          <tr><th rowspan="2">Membre</th><th colspan="3">Fond caisse</th>${head}</tr>
          <tr><th>Payé</th><th>Dû</th><th>Reste</th>${subHead}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function renderFinanceAmendes() {
  const block = financeData?.amendesHistorique;
  if (!block?.rows?.length) return `<p class="finance-empty">Amendes historiques indisponibles.</p>`;

  const headers = block.headers || [];
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = block.rows
    .map((row, i) => {
      const cells = headers
        .map((h) => {
          const val = row.values?.[h];
          return `<td>${val === undefined || val === null ? "—" : escapeHtml(String(val))}</td>`;
        })
        .join("");
      return `<tr style="--finance-row-i:${i}"><td class="finance-td-person">${escapeHtml(row.name)}</td>${cells}</tr>`;
    })
    .join("");

  return `
    <div class="finance-section-head"><h3>Amendes historiques (grille Excel)</h3></div>
    <div class="finance-table-wrap finance-table-wrap--wide">
      <table class="finance-table finance-table--matrix">
        <thead><tr><th>Membre</th>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function renderFinancePrets() {
  const rows = financeData?.pretsHistorique || [];
  const body = rows.length
    ? rows
        .map(
          (row, i) => `
        <tr style="--finance-row-i:${i}">
          <td class="finance-td-person">${escapeHtml(row.name)}</td>
          <td class="finance-td-amount">${formatEuro(row.amount || 0)}</td>
          <td>${row.start ? formatDate(String(row.start).split("T")[0]) : "—"}</td>
          <td>${row.end ? formatDate(String(row.end).split("T")[0]) : "—"}</td>
          <td>${row.remis ?? "—"}</td>
          <td>${escapeHtml(row.status || "—")}</td>
          <td>${row.order ?? "—"}</td>
          <td>${escapeHtml(row.nextBorrower || "—")}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="8" class="finance-empty-cell">Aucun prêt historique.</td></tr>`;

  return `
    <div class="finance-section-head"><h3>Prêts historiques</h3></div>
    <div class="finance-table-wrap">
      <table class="finance-table">
        <thead>
          <tr>
            <th>Emprunteur</th><th class="finance-th-amount">Montant</th><th>Début</th><th>Fin</th>
            <th>Remis</th><th>Statut</th><th>N°</th><th>Suivant</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function renderFinanceArchives() {
  if (!financeData || financeData.cleared === true || financeData.source === "cleared") {
    return `<p class="finance-empty">Aucun chiffre historique — archive réinitialisée.</p>`;
  }
  const parts = [
    renderFinanceCotisations(),
    renderFinanceAncienneTournee(),
    renderFinanceAmendes(),
    renderFinancePrets(),
  ];
  return `<div class="finance-archives-stack">${parts.join('<hr class="finance-archives-sep" />')}</div>`;
}

function renderFinanceSubcontent() {
  const showCaisse = isFinanceCaisseSub() && canAccessCaisse();
  const showArchives = !showCaisse;

  if (financeCaisse) financeCaisse.hidden = !showCaisse;
  if (financeSubcontent) financeSubcontent.hidden = !showArchives;

  if (showCaisse) {
    if (financeSubcontent) financeSubcontent.innerHTML = "";
    renderFondCaissePanel();
    renderAutreArgent();
    return;
  }

  if (!financeSubcontent) return;
  financeSubcontent.innerHTML = renderFinanceArchives();
}

function renderFinance() {
  activeFinanceSub = getFinanceSubtab();
  // Fond de caisse : uniquement Admin → Caisse
  if (financeSubCaisse) financeSubCaisse.hidden = true;
  if (financeSubtabs) financeSubtabs.hidden = true;
  if (activeFinanceSub === FINANCE_CAISSE_SUB || activeFinanceSub === FINANCE_LIVE_DETTE_SUB) {
    activeFinanceSub = FINANCE_ARCHIVES_SUB;
  }
  renderFinanceDashboard();
  financeSubtabs?.querySelectorAll(".finance-subtab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.financeSub === activeFinanceSub);
  });
  renderFinanceSubcontent();
}

function saveAutreArgent(shouldRender = true) {
  localStorage.setItem(AUTRE_ARGENT_KEY, JSON.stringify(autreArgent));
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  if (shouldRender) {
    renderAutreArgent();
    renderPrets();
    renderFinanceDashboard();
  }
}

function loadRoles() {
  try {
    const data = localStorage.getItem(ROLES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function loadCotisations() {
  try {
    const data = localStorage.getItem(COTISATIONS_KEY);
    const raw = data ? JSON.parse(data) : {};
    return normalizeCotisations(raw);
  } catch {
    return {};
  }
}

function normalizeCotisations(raw) {
  const normalized = {};
  members.forEach((member) => {
    if (raw[member.id] !== undefined && raw[member.id] !== null) {
      normalized[member.id] = raw[member.id];
    } else if (raw[member.name] !== undefined && raw[member.name] !== null) {
      normalized[member.id] = raw[member.name];
    }
  });
  return normalized;
}

function cloneMonthMemberMap(value) {
  const out = {};
  Object.entries(value || {}).forEach(([monthKey, ids]) => {
    out[monthKey] = Array.isArray(ids) ? [...ids] : [];
  });
  return out;
}

function cloneTourneeData(data) {
  const years = {};
  Object.entries(data.years || {}).forEach(([year, yearData]) => {
    years[year] = {};
    Object.entries(yearData || {}).forEach(([key, value]) => {
      if (key === TOURNEE_PARTNERS_KEY) {
        years[year][key] = {};
        Object.entries(value || {}).forEach(([memberId, monthPartners]) => {
          years[year][key][memberId] = { ...monthPartners };
        });
        return;
      }
      if (key === TOURNEE_RECEPTION_KEY || key === TOURNEE_RISTOURNE_KEY) {
        years[year][key] = cloneMonthMemberMap(value);
        return;
      }
      if (key === TOURNEE_BOUFFE_OK_KEY || key === TOURNEE_RECEPTION_DATES_KEY) {
        years[year][key] = { ...(value || {}) };
        return;
      }
      years[year][key] = Array.isArray(value) ? [...value] : value;
    });
  });
  return { years };
}

function normalizeTourneeMonthIds(memberIds) {
  if (!Array.isArray(memberIds)) return [];
  const validIds = new Set(members.map((member) => member.id));
  return memberIds.filter((id, index, list) => validIds.has(id) && list.indexOf(id) === index);
}

function normalizeMonthMemberMap(rawMap) {
  const out = {};
  if (!rawMap || typeof rawMap !== "object" || Array.isArray(rawMap)) return out;
  Object.entries(rawMap).forEach(([monthKey, ids]) => {
    const index = Number(monthKey);
    if (Number.isNaN(index) || index < 0 || index > 11) return;
    const normalized = normalizeTourneeMonthIds(ids);
    if (normalized.length > 0) out[String(index)] = normalized;
  });
  return out;
}

function inferPartnersFromMonths(months, partners = {}) {
  const inferred = {};
  Object.entries(partners).forEach(([memberId, monthMap]) => {
    inferred[memberId] = { ...monthMap };
  });

  Object.entries(months).forEach(([monthKey, memberIds]) => {
    const needing = memberIds.filter((memberId) => needsTourneePartner(memberId));
    if (needing.length === 2) {
      const [first, second] = needing;
      if (!inferred[first]?.[monthKey]) {
        inferred[first] = inferred[first] || {};
        inferred[first][monthKey] = second;
      }
      if (!inferred[second]?.[monthKey]) {
        inferred[second] = inferred[second] || {};
        inferred[second][monthKey] = first;
      }
    }
  });

  return inferred;
}

function normalizeTourneeData(raw) {
  const years = {};
  const source = raw?.years && typeof raw.years === "object" ? raw.years : {};

  Object.entries(source).forEach(([year, yearData]) => {
    if (!yearData || typeof yearData !== "object") return;
    const normalizedYear = {};
    const months = {};

    Object.entries(yearData).forEach(([monthIndex, memberIds]) => {
      if (TOURNEE_META_KEYS.has(monthIndex)) return;
      const index = Number(monthIndex);
      if (Number.isNaN(index) || index < 0 || index > 11) return;
      const normalizedIds = normalizeTourneeMonthIds(memberIds);
      if (normalizedIds.length > 0) {
        months[String(index)] = normalizedIds;
      }
    });

    Object.assign(normalizedYear, months);

    let reception = normalizeMonthMemberMap(yearData[TOURNEE_RECEPTION_KEY]);
    let ristourne = normalizeMonthMemberMap(yearData[TOURNEE_RISTOURNE_KEY]);
    // Ancien format : les tableaux par mois étaient l'ordre de réception
    if (Object.keys(reception).length === 0 && Object.keys(months).length > 0) {
      reception = { ...months };
    }
    if (Object.keys(reception).length > 0) {
      normalizedYear[TOURNEE_RECEPTION_KEY] = reception;
    }
    if (Object.keys(ristourne).length > 0) {
      normalizedYear[TOURNEE_RISTOURNE_KEY] = ristourne;
    }

    const existingPartners = yearData[TOURNEE_PARTNERS_KEY];
    const partners = inferPartnersFromMonths(
      Object.keys(reception).length ? reception : months,
      existingPartners || {}
    );
    if (Object.keys(partners).length > 0) {
      normalizedYear[TOURNEE_PARTNERS_KEY] = partners;
    }

    // OK tournée / bouffe déjà prise
    const rawBouffe = yearData[TOURNEE_BOUFFE_OK_KEY];
    if (rawBouffe && typeof rawBouffe === "object") {
      const validIds = new Set(members.map((m) => m.id));
      const bouffeOk = {};
      Object.entries(rawBouffe).forEach(([memberId, flag]) => {
        if (validIds.has(memberId) && flag) bouffeOk[memberId] = true;
      });
      if (Object.keys(bouffeOk).length > 0) {
        normalizedYear[TOURNEE_BOUFFE_OK_KEY] = bouffeOk;
      }
    }

    const rawReception = yearData[TOURNEE_RECEPTION_DATES_KEY];
    if (rawReception && typeof rawReception === "object") {
      const validIds = new Set(members.map((m) => m.id));
      const receptionDates = {};
      Object.entries(rawReception).forEach(([memberId, dateStr]) => {
        const valid = normalizeISODate(dateStr);
        if (validIds.has(memberId) && valid) receptionDates[memberId] = valid;
      });
      if (Object.keys(receptionDates).length > 0) {
        normalizedYear[TOURNEE_RECEPTION_DATES_KEY] = receptionDates;
      }
    }

    years[String(year)] = normalizedYear;
  });

  return { years };
}

/** Financier (ou admin en espace Admin) peut valider qu'un poto a déjà bouffé / pris sa tournée */
function canMarkTourneeBouffeOk() {
  if (!isLoggedIn()) return false;
  if (getMemberRole(getCurrentMember()?.id) === "tresorier") return true;
  return hasRoleTabAccess("tournee") && isAdminWorkspace();
}

function getTourneeBouffeOkMap(year = tourneeYear, useDraft = false) {
  const source = useDraft && canEditTourneePlanning() ? tourneeDraft : tourneeData;
  const yearRecord = source.years?.[year] || {};
  return yearRecord[TOURNEE_BOUFFE_OK_KEY] || {};
}

function isTourneeBouffeOk(memberId, year = tourneeYear, useDraft = false) {
  return Boolean(getTourneeBouffeOkMap(year, useDraft)[memberId]);
}

function setTourneeBouffeOk(memberId, isOk) {
  if (!canMarkTourneeBouffeOk()) {
    if (!isLoggedIn()) {
      alert("Veuillez vous connecter.");
      openLoginModal();
      return false;
    }
    alert("Seul le Financier (ou un administrateur) peut valider une tournée prise.");
    return false;
  }
  if (!memberId) return false;

  const year = tourneeYear;
  if (!tourneeData.years[year]) tourneeData.years[year] = {};
  if (!tourneeData.years[year][TOURNEE_BOUFFE_OK_KEY]) {
    tourneeData.years[year][TOURNEE_BOUFFE_OK_KEY] = {};
  }
  const map = tourneeData.years[year][TOURNEE_BOUFFE_OK_KEY];
  if (isOk) map[memberId] = true;
  else delete map[memberId];
  if (Object.keys(map).length === 0) delete tourneeData.years[year][TOURNEE_BOUFFE_OK_KEY];

  // Garder le brouillon admin aligné
  if (tourneeDraft?.years) {
    if (!tourneeDraft.years[year]) tourneeDraft.years[year] = {};
    if (!tourneeDraft.years[year][TOURNEE_BOUFFE_OK_KEY]) {
      tourneeDraft.years[year][TOURNEE_BOUFFE_OK_KEY] = {};
    }
    const draftMap = tourneeDraft.years[year][TOURNEE_BOUFFE_OK_KEY];
    if (isOk) draftMap[memberId] = true;
    else delete draftMap[memberId];
    if (Object.keys(draftMap).length === 0) {
      delete tourneeDraft.years[year][TOURNEE_BOUFFE_OK_KEY];
    }
  }

  saveTourneeData();
  renderTourneeTable();
  return true;
}

function toggleTourneeBouffeOk(memberId) {
  setTourneeBouffeOk(memberId, !isTourneeBouffeOk(memberId));
}

function loadTourneeData() {
  try {
    const data = localStorage.getItem(TOURNEE_KEY);
    const raw = data ? JSON.parse(data) : { years: {} };
    return normalizeTourneeData(raw);
  } catch {
    return { years: {} };
  }
}

function saveTourneeData() {
  localStorage.setItem(TOURNEE_KEY, JSON.stringify(tourneeData));
}

function getTourneeYearOptions() {
  const years = new Set(Object.keys(tourneeDraft.years || {}));
  years.add(String(new Date().getFullYear()));
  years.add(tourneeYear);
  return [...years].sort((a, b) => Number(b) - Number(a));
}

function ensureTourneeYearDraft(year) {
  if (!tourneeDraft.years[year]) {
    tourneeDraft.years[year] = {};
  }
  return tourneeDraft.years[year];
}

function getTourneeYearRecord(year, useDraft = canEditTourneePlanning()) {
  const source = useDraft ? tourneeDraft : tourneeData;
  return source.years?.[year] || {};
}

function getTourneeMonthAssignment(year, monthIndex, useDraft = canEditTourneePlanning()) {
  const yearRecord = getTourneeYearRecord(year, useDraft);
  const fromMap = yearRecord[TOURNEE_RECEPTION_KEY]?.[String(monthIndex)];
  if (Array.isArray(fromMap) && fromMap.length) {
    return normalizeTourneeMonthIds(fromMap);
  }
  return normalizeTourneeMonthIds(yearRecord[String(monthIndex)] || []);
}

function tourneeOrderKey(kind) {
  return kind === "ristourne" ? TOURNEE_RISTOURNE_KEY : TOURNEE_RECEPTION_KEY;
}

function getTourneeOrderIds(kind, monthIndex, useDraft = canEditTourneePlanning()) {
  const yearRecord = getTourneeYearRecord(tourneeYear, useDraft);
  const map = yearRecord[tourneeOrderKey(kind)] || {};
  const ids = normalizeTourneeMonthIds(map[String(monthIndex)] || []);
  if (ids.length || kind === "ristourne") return ids;
  return getTourneeMonthAssignment(tourneeYear, monthIndex, useDraft);
}

function setTourneeOrderDraft(kind, monthIndex, memberIds) {
  if (!canEditTourneePlanning()) return;
  const key = tourneeOrderKey(kind);
  const yearRecord = ensureTourneeYearDraft(tourneeYear);
  if (!yearRecord[key] || typeof yearRecord[key] !== "object") yearRecord[key] = {};
  const normalized = normalizeTourneeMonthIds(memberIds);
  if (normalized.length === 0) delete yearRecord[key][String(monthIndex)];
  else yearRecord[key][String(monthIndex)] = normalized;
}

function addTourneeOrderMember(kind, monthIndex, memberId) {
  if (!memberId) return;
  const current = getTourneeOrderIds(kind, monthIndex, true);
  if (current.includes(memberId)) return;
  setTourneeOrderDraft(kind, monthIndex, [...current, memberId]);
}

function removeTourneeOrderMember(kind, monthIndex, memberId) {
  const current = getTourneeOrderIds(kind, monthIndex, true);
  setTourneeOrderDraft(
    kind,
    monthIndex,
    current.filter((id) => id !== memberId)
  );
}

function getTourneePartnersMap(year, useDraft = canEditTourneePlanning()) {
  const yearRecord = getTourneeYearRecord(year, useDraft);
  return yearRecord[TOURNEE_PARTNERS_KEY] || {};
}

function ensureTourneePartnersDraft() {
  const yearRecord = ensureTourneeYearDraft(tourneeYear);
  if (!yearRecord[TOURNEE_PARTNERS_KEY]) {
    yearRecord[TOURNEE_PARTNERS_KEY] = {};
  }
  return yearRecord[TOURNEE_PARTNERS_KEY];
}

function normalizeISODate(value) {
  if (value == null) return "";
  const raw = String(value).trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";
  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "";
  }
  return raw;
}

function formatReceptionDate(dateStr) {
  const valid = normalizeISODate(dateStr);
  if (!valid) return "—";
  const [year, month, day] = valid.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReceptionMonthLabel(dateStr) {
  const valid = normalizeISODate(dateStr);
  if (!valid) return "";
  const monthIndex = Number(valid.slice(5, 7)) - 1;
  return MONTH_LABELS[monthIndex] || "";
}

function getTourneeReceptionDatesMap(year = tourneeYear, useDraft = canEditTourneePlanning()) {
  const yearRecord = getTourneeYearRecord(year, useDraft);
  return yearRecord[TOURNEE_RECEPTION_DATES_KEY] || {};
}

function getMemberReceptionDate(memberId, year = tourneeYear, useDraft = canEditTourneePlanning()) {
  return normalizeISODate(getTourneeReceptionDatesMap(year, useDraft)[memberId]);
}

function setMemberReceptionDate(memberId, dateStr) {
  if (!canEditTourneePlanning() || !memberId) return;
  const yearRecord = ensureTourneeYearDraft(tourneeYear);
  if (!yearRecord[TOURNEE_RECEPTION_DATES_KEY]) {
    yearRecord[TOURNEE_RECEPTION_DATES_KEY] = {};
  }
  const map = yearRecord[TOURNEE_RECEPTION_DATES_KEY];
  const valid = normalizeISODate(dateStr);
  if (valid) map[memberId] = valid;
  else delete map[memberId];
  if (Object.keys(map).length === 0) delete yearRecord[TOURNEE_RECEPTION_DATES_KEY];
}

function setTourneeMonthDraft(monthIndex, memberIds, shouldRender = true) {
  if (!canEditTourneePlanning()) return;
  const months = ensureTourneeYearDraft(tourneeYear);
  const normalized = normalizeTourneeMonthIds(memberIds);
  if (normalized.length === 0) {
    delete months[String(monthIndex)];
  } else {
    months[String(monthIndex)] = normalized;
  }
  if (shouldRender) renderTourneeTable();
}

function getTourneeMonthOrder() {
  return TOURNEE_CYCLE_MONTHS.slice();
}

function tourneeMonthRank(monthIndex) {
  return (Number(monthIndex) - TOURNEE_CYCLE_START_MONTH + 12) % 12;
}

function getMemberMonthIndices(year, memberId, useDraft = canEditTourneePlanning()) {
  const indices = [];
  getTourneeMonthOrder().forEach((index) => {
    const memberIds = getTourneeMonthAssignment(year, index, useDraft);
    if (memberIds.includes(memberId)) indices.push(index);
  });
  return indices;
}

function getMemberPartnerForMonth(year, memberId, monthIndex, useDraft = canEditTourneePlanning()) {
  const partners = getTourneePartnersMap(year, useDraft);
  return partners[memberId]?.[String(monthIndex)] || "";
}

function setMemberPartnerForMonth(memberId, monthIndex, partnerId) {
  const partners = ensureTourneePartnersDraft();
  const monthKey = String(monthIndex);

  if (!partnerId) {
    if (partners[memberId]) {
      delete partners[memberId][monthKey];
      if (Object.keys(partners[memberId]).length === 0) delete partners[memberId];
    }
    return;
  }

  if (!partners[memberId]) partners[memberId] = {};
  partners[memberId][monthKey] = partnerId;
}

function clearPartnerForMonth(memberId, monthIndex) {
  setMemberPartnerForMonth(memberId, monthIndex, "");
}

function removeMemberFromMonth(memberId, monthIndex) {
  const months = ensureTourneeYearDraft(tourneeYear);
  const monthKey = String(monthIndex);
  if (!months[monthKey]) return;
  const next = (Array.isArray(months[monthKey]) ? months[monthKey] : []).filter(
    (id) => id !== memberId
  );
  if (next.length === 0) delete months[monthKey];
  else months[monthKey] = next;
  clearPartnerForMonth(memberId, monthIndex);
}

function addMemberToMonth(memberId, monthIndex) {
  const months = ensureTourneeYearDraft(tourneeYear);
  const monthKey = String(monthIndex);
  // Always clone the array so months never share the same reference
  const current = Array.isArray(months[monthKey]) ? [...months[monthKey]] : [];
  if (!current.includes(memberId)) {
    current.push(memberId);
  }
  months[monthKey] = current;
}

function getCotisationAmount(memberId, source = getCotisationSource()) {
  const value = source[memberId];
  return typeof value === "number" && !Number.isNaN(value) ? value : 0;
}

function needsTourneePartner(memberId, source = getCotisationSource()) {
  return getCotisationAmount(memberId, source) < FULL_TOURNEE_COTISATION;
}

function canSelectAsBinome(candidateId, forMemberId) {
  return candidateId !== forMemberId;
}

function toggleMemberMonth(memberId, monthIndex, isActive) {
  if (!canEditTourneePlanning()) return;

  const parsedMonth = Number(monthIndex);
  if (Number.isNaN(parsedMonth) || !memberId) return;

  if (isActive) {
    addMemberToMonth(memberId, parsedMonth);
  } else {
    removeMemberFromMonth(memberId, parsedMonth);
  }

  // Update only this row visually — avoid full table rebuild side-effects
  updateTourneeRowMonths(memberId);
}

function findTourneeRowByMemberId(memberId) {
  if (!cotisationBody) return null;
  return [...cotisationBody.querySelectorAll("tr[data-member-id]")].find(
    (row) => row.dataset.memberId === memberId
  );
}

function updateTourneeRowMonths(memberId) {
  const row = findTourneeRowByMemberId(memberId);
  if (!row) {
    renderTourneeTable();
    return;
  }

  const monthIndices = getMemberMonthIndices(tourneeYear, memberId, true);
  const chipsWrap = row.querySelector(".tournee-month-chips");
  if (chipsWrap) {
    chipsWrap.querySelectorAll(".tournee-month-chip").forEach((chip) => {
      const idx = Number(chip.dataset.month);
      const active = monthIndices.includes(idx);
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  }
}

function assignMemberPartnerForMonth(memberId, monthIndex, partnerId) {
  if (!canManageTab("tournee") || !needsTourneePartner(memberId)) return;

  const parsedMonth = Number(monthIndex);
  const monthMembers = getTourneeMonthAssignment(tourneeYear, parsedMonth, true);
  if (!monthMembers.includes(memberId)) return;

  if (partnerId && !canSelectAsBinome(partnerId, memberId)) {
    renderTourneeTable();
    return;
  }

  setMemberPartnerForMonth(memberId, parsedMonth, partnerId || "");
  renderTourneeTable();
}

function buildTourneeMonthChips(memberId, selectedMonthIndices) {
  return getTourneeMonthOrder()
    .map((index) => {
      const label = MONTH_LABELS[index];
      const isActive = selectedMonthIndices.includes(index);
      const activeClass = isActive ? " is-active" : "";
      return `<button type="button" class="tournee-month-chip${activeClass}" data-member="${escapeHtml(memberId)}" data-month="${index}" title="${escapeHtml(label)} — cliquer pour assigner la ristourne" aria-pressed="${isActive}">${MONTH_SHORT_LABELS[index]}</button>`;
    })
    .join("");
}

function validateTourneeDraft() {
  return [];
}

function loadAmendes() {
  try {
    const data = localStorage.getItem(AMENDES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadAmendesCaisse() {
  try {
    const data = localStorage.getItem(AMENDES_CAISSE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAmendesCaisse() {
  localStorage.setItem(AMENDES_CAISSE_KEY, JSON.stringify(amendesCaisse));
}

function loadFondCaisse() {
  try {
    const data = localStorage.getItem(FOND_CAISSE_KEY);
    if (data == null || data === "") return DEFAULT_FOND_CAISSE;
    const value = JSON.parse(data);
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount) || amount < 0) return DEFAULT_FOND_CAISSE;
    return Math.round(amount * 100) / 100;
  } catch {
    return DEFAULT_FOND_CAISSE;
  }
}

function saveFondCaisse() {
  localStorage.setItem(FOND_CAISSE_KEY, JSON.stringify(fondCaisse));
}

function getFondCaisse() {
  return Number.isFinite(fondCaisse) && fondCaisse >= 0 ? fondCaisse : DEFAULT_FOND_CAISSE;
}

/** Fond de caisse de départ : visible/modifiable par admin ou accès Caisse */
function canViewFondCaisse() {
  return hasRoleTabAccess("caisse");
}

function canEditFondCaisse() {
  return hasRoleTabAccess("caisse");
}

function requireFondCaisseEditor(actionLabel) {
  if (!isLoggedIn()) {
    alert("Veuillez vous connecter avec votre nom.");
    openLoginModal();
    return false;
  }
  if (canEditFondCaisse()) return true;
  alert(`Seul un administrateur peut ${actionLabel}.`);
  return false;
}

function showFondCaisseSaveMessage(text, type = "success") {
  [fondCaisseSaveMsg, fondCaisseSaveMsgAdmin].forEach((el) => {
    if (!el) return;
    el.textContent = text;
    el.className = `save-msg save-msg-${type}`;
    el.hidden = false;
  });
}

function syncFondCaisseInputs() {
  const value = String(getFondCaisse());
  [fondCaisseAmountInput, fondCaisseAmountAdmin].forEach((input) => {
    if (input && document.activeElement !== input) {
      input.value = value;
    }
  });
  if (fondCaisseDisplayFinancier) {
    fondCaisseDisplayFinancier.textContent = formatEuro(getFondCaisse());
  }
}

function setFondCaisseAmount(amount) {
  if (!requireFondCaisseEditor("modifier le fond de caisse de départ")) return false;

  const parsed = Math.round(parseFloat(amount) * 100) / 100;
  if (Number.isNaN(parsed) || parsed < 0) {
    alert("Montant invalide. Entrez un nombre positif ou zéro.");
    return false;
  }

  fondCaisse = parsed;
  saveFondCaisse();
  syncFondCaisseInputs();
  showFondCaisseSaveMessage(
    `Fond de caisse de départ enregistré : ${formatEuro(fondCaisse)}. Caisse brute : ${formatEuro(getCaisseBrute())}.`
  );
  renderAutreArgent();
  if (document.getElementById("tab-prets")?.classList.contains("active")) {
    renderPrets();
  }
  return true;
}

async function resetFondCaisse() {
  if (!requireFondCaisseEditor("réinitialiser le fond de caisse de départ")) return false;

  const current = getFondCaisse();
  if (
    !(await appConfirm(
      `Réinitialiser le fond de caisse de départ à ${formatEuro(DEFAULT_FOND_CAISSE)} ?\n` +
        `Montant actuel : ${formatEuro(current)}.`
    ))
  ) {
    return false;
  }

  fondCaisse = DEFAULT_FOND_CAISSE;
  saveFondCaisse();
  syncFondCaisseInputs();
  showFondCaisseSaveMessage(
    `Fond de caisse de départ réinitialisé à ${formatEuro(DEFAULT_FOND_CAISSE)}. Caisse brute : ${formatEuro(getCaisseBrute())}.`
  );
  renderAutreArgent();
  if (document.getElementById("tab-prets")?.classList.contains("active")) {
    renderPrets();
  }
  return true;
}

function loadFinancierAccount() {
  try {
    const data = localStorage.getItem(FINANCIER_ACCOUNT_KEY);
    const raw = data ? JSON.parse(data) : null;
    if (!raw || typeof raw !== "object") return { iban: "", holder: "", bank: "" };
    return {
      iban: String(raw.iban || "").trim(),
      holder: String(raw.holder || "").trim(),
      bank: String(raw.bank || "").trim(),
    };
  } catch {
    return { iban: "", holder: "", bank: "" };
  }
}

function saveFinancierAccount() {
  localStorage.setItem(FINANCIER_ACCOUNT_KEY, JSON.stringify(financierAccount));
}

function formatIbanDisplay(iban) {
  const compact = String(iban || "").replace(/\s+/g, "").toUpperCase();
  return compact.replace(/(.{4})/g, "$1 ").trim();
}

function fillFinancierAccountForm() {
  const iban = document.getElementById("financierAccountIban");
  const holder = document.getElementById("financierAccountHolder");
  const bank = document.getElementById("financierAccountBank");
  if (iban) iban.value = formatIbanDisplay(financierAccount.iban);
  if (holder) holder.value = financierAccount.holder || "";
  if (bank) bank.value = financierAccount.bank || "";
}

function saveFinancierAccountFromForm() {
  if (!requireTabAccess("caisse", "enregistrer le compte bancaire")) return;
  const iban = String(document.getElementById("financierAccountIban")?.value || "")
    .replace(/\s+/g, "")
    .toUpperCase();
  if (iban.length < 8) {
    alert("Indique un numéro de compte valide.");
    return;
  }
  financierAccount = {
    iban,
    holder: String(document.getElementById("financierAccountHolder")?.value || "").trim(),
    bank: String(document.getElementById("financierAccountBank")?.value || "").trim(),
  };
  saveFinancierAccount();
  const msg = document.getElementById("financierAccountSaveMsg");
  if (msg) {
    msg.textContent = "Compte bancaire enregistré.";
    msg.className = "save-msg save-msg-success";
    msg.hidden = false;
  }
  renderMesDettes();
}

function buildDetteRepayHint() {
  const iban = formatIbanDisplay(financierAccount.iban);
  if (!iban) {
    return "Les remboursements se font chez le Financier. Le numéro de compte n’est pas encore renseigné.";
  }
  const extra = [
    financierAccount.holder ? escapeHtml(financierAccount.holder) : "",
    financierAccount.bank ? escapeHtml(financierAccount.bank) : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return `Les remboursements se font chez le Financier au numéro de compte suivant : <strong class="financier-iban">${escapeHtml(iban)}</strong>${
    extra ? ` <span class="financier-iban-meta">(${extra})</span>` : ""
  }.`;
}

function renderFondCaissePanel() {
  // Panel Finance (ancien accès Financier) : plus affiché — fond réservé à Admin
  if (fondCaissePanel) fondCaissePanel.hidden = true;
  if (canEditFondCaisse()) syncFondCaisseInputs();
  fillFinancierAccountForm();
  renderFondCaisseAnnuel();
}

function loadFondCaisseAnnuel() {
  try {
    const data = localStorage.getItem(FOND_CAISSE_ANNUEL_KEY);
    const raw = data ? JSON.parse(data) : null;
    if (raw && raw.years && typeof raw.years === "object") {
      return { years: raw.years };
    }
    return { years: {} };
  } catch {
    return { years: {} };
  }
}

function saveFondCaisseAnnuel(shouldRender = true) {
  localStorage.setItem(FOND_CAISSE_ANNUEL_KEY, JSON.stringify(fondCaisseAnnuel));
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  if (shouldRender) renderFondCaisseAnnuel();
}

function getFondCaisseAnnuelYear() {
  const selected = fondCaisseAnnuelYearSelect?.value;
  if (selected) return String(selected);
  return String(new Date().getFullYear());
}

function getFondCaisseAnnuelYearOptions() {
  const current = new Date().getFullYear();
  const years = new Set([current - 1, current, current + 1]);
  Object.keys(fondCaisseAnnuel.years || {}).forEach((year) => {
    const n = Number(year);
    if (Number.isFinite(n)) years.add(n);
  });
  return [...years].sort((a, b) => b - a).map(String);
}

function ensureFondCaisseAnnuelYear(year) {
  const key = String(year);
  if (!fondCaisseAnnuel.years) fondCaisseAnnuel.years = {};
  if (!fondCaisseAnnuel.years[key]) {
    fondCaisseAnnuel.years[key] = {
      amountPerMember: 0,
      createdAt: new Date().toISOString(),
      createdBy: getCurrentMember()?.id || null,
      payments: {},
    };
  }
  if (!fondCaisseAnnuel.years[key].payments) {
    fondCaisseAnnuel.years[key].payments = {};
  }
  return fondCaisseAnnuel.years[key];
}

function getFondCaisseAnnuelPaid(year, memberId) {
  const paid = Number(fondCaisseAnnuel.years?.[String(year)]?.payments?.[memberId]?.paidAmount);
  return Number.isFinite(paid) && paid > 0 ? paid : 0;
}

function getFondCaisseAnnuelDue(year, memberId) {
  const amount = Number(fondCaisseAnnuel.years?.[String(year)]?.amountPerMember) || 0;
  return Math.max(0, Math.round((amount - getFondCaisseAnnuelPaid(year, memberId)) * 100) / 100);
}

function getTotalFondCaisseAnnuelVerse() {
  let total = 0;
  Object.values(fondCaisseAnnuel.years || {}).forEach((yearData) => {
    Object.values(yearData.payments || {}).forEach((payment) => {
      total += Number(payment?.paidAmount) || 0;
    });
  });
  return Math.round(total * 100) / 100;
}

function getFondCaisseAnnuelYearTotals(year) {
  const yearData = fondCaisseAnnuel.years?.[String(year)];
  const amountPerMember = Number(yearData?.amountPerMember) || 0;
  const memberCount = getSortedMembers().length;
  const expected = Math.round(amountPerMember * memberCount * 100) / 100;
  const paid = getSortedMembers().reduce(
    (sum, member) => sum + getFondCaisseAnnuelPaid(year, member.id),
    0
  );
  const remaining = Math.max(0, Math.round((expected - paid) * 100) / 100);
  return { amountPerMember, memberCount, expected, paid, remaining };
}

function setFondCaisseAnnuelAmount(year, amount) {
  if (!canManageCaisseArgent() && !canEditFondCaisse()) {
    alert("Seul le Financier ou un administrateur peut définir le fond de caisse.");
    return;
  }

  const parsed = Math.round(parseFloat(amount) * 100) / 100;
  if (Number.isNaN(parsed) || parsed < 0) {
    alert("Montant invalide.");
    return;
  }

  const yearData = ensureFondCaisseAnnuelYear(year);
  yearData.amountPerMember = parsed;
  yearData.updatedAt = new Date().toISOString();
  yearData.updatedBy = getCurrentMember()?.id || null;
  saveFondCaisseAnnuel();
  renderAutreArgent();
  renderFinanceDashboard();

  if (fondCaisseAnnuelSaveMsg) {
    const totals = getFondCaisseAnnuelYearTotals(year);
    fondCaisseAnnuelSaveMsg.textContent =
      parsed > 0
        ? `${formatEuro(parsed)} par poto pour ${year} — ${totals.memberCount} potos, ${formatEuro(totals.expected)} au total.`
        : `Fond de caisse ${year} remis à 0.`;
    fondCaisseAnnuelSaveMsg.className = "save-msg save-msg-success";
    fondCaisseAnnuelSaveMsg.hidden = false;
  }
}

async function deleteFondCaisseAnnuel(year) {
  if (!canManageCaisseArgent() && !canEditFondCaisse()) {
    alert("Seul le Financier ou un administrateur peut supprimer le fond de caisse.");
    return;
  }

  const key = String(year || getFondCaisseAnnuelYear());
  const yearData = fondCaisseAnnuel.years?.[key];
  const amountPerMember = Number(yearData?.amountPerMember) || 0;
  if (!yearData || amountPerMember <= 0) {
    alert(`Aucun fond de caisse à supprimer pour ${key}.`);
    return;
  }

  const totals = getFondCaisseAnnuelYearTotals(key);
  let message = `Supprimer le fond de caisse ${key} (${formatEuro(amountPerMember)} par poto) ?\nPlus personne n'aura à le verser.`;
  if (totals.paid > 0) {
    message += `\n\n${formatEuro(totals.paid)} déjà versés seront retirés de la caisse.`;
  }
  if (!(await appConfirm(message))) return;

  delete fondCaisseAnnuel.years[key];
  saveFondCaisseAnnuel();
  renderAutreArgent();
  renderFinanceDashboard();
  renderPrets();

  if (fondCaisseAnnuelSaveMsg) {
    fondCaisseAnnuelSaveMsg.textContent =
      totals.paid > 0
        ? `Fond ${key} supprimé — ${formatEuro(totals.paid)} retiré de la caisse.`
        : `Fond de caisse ${key} supprimé.`;
    fondCaisseAnnuelSaveMsg.className = "save-msg save-msg-success";
    fondCaisseAnnuelSaveMsg.hidden = false;
  }
}

async function payFondCaisseAnnuel(year, memberId, amountValue) {
  if (!canManageCaisseArgent()) {
    alert("Seul le Financier ou un administrateur peut encaisser un fond de caisse.");
    return;
  }

  const member = getMemberById(memberId);
  if (!member) return;

  const due = getFondCaisseAnnuelDue(year, memberId);
  if (due <= 0) {
    alert(`${member.name} a déjà versé son fond de caisse ${year}.`);
    return;
  }

  const raw = amountValue == null || String(amountValue).trim() === ""
    ? String(due)
    : String(amountValue).trim().replace(",", ".");
  const payAmount = Math.round(parseFloat(raw) * 100) / 100;
  if (Number.isNaN(payAmount) || payAmount <= 0) {
    alert("Montant invalide.");
    return;
  }
  if (payAmount > due) {
    alert(`Impossible : il reste ${formatEuro(due)} pour ${member.name}.`);
    return;
  }

  const nextDue = Math.round((due - payAmount) * 100) / 100;
  const isPartial = nextDue > 0;
  if (
    !(await appConfirm(
      isPartial
        ? `Versement de ${formatEuro(payAmount)} pour ${member.name} ?\nIl restera ${formatEuro(nextDue)} à payer.\n${formatEuro(payAmount)} entre dans la caisse.`
        : `Verser ${formatEuro(payAmount)} pour ${member.name} ?\nFond ${year} soldé — le montant entre dans la caisse.`
    ))
  ) {
    return;
  }

  const yearData = ensureFondCaisseAnnuelYear(year);
  if (!yearData.payments[memberId]) {
    yearData.payments[memberId] = { paidAmount: 0, history: [] };
  }
  yearData.payments[memberId].paidAmount =
    Math.round((getFondCaisseAnnuelPaid(year, memberId) + payAmount) * 100) / 100;
  yearData.payments[memberId].updatedAt = new Date().toISOString();
  if (!Array.isArray(yearData.payments[memberId].history)) {
    yearData.payments[memberId].history = [];
  }
  yearData.payments[memberId].history.unshift({
    id: generateId(),
    amount: payAmount,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentMember()?.id || null,
  });

  saveFondCaisseAnnuel();
  renderAutreArgent();
  renderFinanceDashboard();

  alert(
    isPartial
      ? `Versement comptabilisé — ${formatEuro(payAmount)} en caisse.\nReste dû pour ${member.name} : ${formatEuro(nextDue)}\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
      : `Fond ${year} soldé pour ${member.name} — ${formatEuro(payAmount)} en caisse.\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
  );
}

async function cancelFondCaisseAnnuelPayment(year, memberId, paymentId) {
  if (!canManageCaisseArgent()) {
    alert("Seul le Financier ou un administrateur peut annuler un versement.");
    return;
  }

  const member = getMemberById(memberId);
  const yearData = fondCaisseAnnuel.years?.[String(year)];
  const record = yearData?.payments?.[memberId];
  if (!record) return;

  const history = Array.isArray(record.history) ? record.history : [];
  const item = paymentId
    ? history.find((entry) => entry.id === paymentId)
    : history[0];

  let cancelAmount = Number(item?.amount);
  if (!item) {
    cancelAmount = Number(record.paidAmount) || 0;
  }
  cancelAmount = Math.round((Number(cancelAmount) || 0) * 100) / 100;
  if (cancelAmount <= 0) return;

  const memberName = member?.name || "ce poto";
  if (
    !(await appConfirm(
      `Annuler le versement de ${formatEuro(cancelAmount)} (${memberName}) ?\nCe montant sortira de la caisse et reviendra dans son reste dû.`
    ))
  ) {
    return;
  }

  if (item) {
    record.history = history.filter((entry) => entry.id !== item.id);
  } else {
    record.history = [];
  }

  record.paidAmount = Math.max(
    0,
    Math.round(((Number(record.paidAmount) || 0) - cancelAmount) * 100) / 100
  );
  record.updatedAt = new Date().toISOString();

  if (record.paidAmount <= 0.001) {
    delete yearData.payments[memberId];
  }

  saveFondCaisseAnnuel();
  renderAutreArgent();
  renderFinanceDashboard();

  const due = getFondCaisseAnnuelDue(year, memberId);
  alert(
    `Versement annulé — ${formatEuro(cancelAmount)} retiré de la caisse.\nReste dû pour ${memberName} : ${formatEuro(due)}\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
  );
}

function renderFondCaisseAnnuel() {
  const panel = document.getElementById("fondCaisseAnnuelPanel");
  if (!panel) return;

  const canOperate = canManageCaisseArgent() || canEditFondCaisse();
  panel.hidden = !canOperate;
  if (!canOperate) return;

  const yearOptions = getFondCaisseAnnuelYearOptions();
  const selectedYear = yearOptions.includes(getFondCaisseAnnuelYear())
    ? getFondCaisseAnnuelYear()
    : yearOptions[0];

  if (fondCaisseAnnuelYearSelect) {
    fondCaisseAnnuelYearSelect.innerHTML = yearOptions
      .map((year) => `<option value="${year}" ${year === selectedYear ? "selected" : ""}>${year}</option>`)
      .join("");
  }

  const yearData = fondCaisseAnnuel.years?.[selectedYear];
  const amountPerMember = Number(yearData?.amountPerMember) || 0;
  if (fondCaisseAnnuelAmountInput && document.activeElement !== fondCaisseAnnuelAmountInput) {
    fondCaisseAnnuelAmountInput.value = amountPerMember || "";
  }

  const totals = getFondCaisseAnnuelYearTotals(selectedYear);
  if (fondCaisseAnnuelSummary) {
    fondCaisseAnnuelSummary.textContent = amountPerMember > 0
      ? `${totals.memberCount} potos × ${formatEuro(amountPerMember)} = ${formatEuro(totals.expected)} · Versé ${formatEuro(totals.paid)} · Reste ${formatEuro(totals.remaining)} · paiements en plusieurs fois`
      : "Indique le montant que chaque poto doit verser cette année. Il pourra payer en plusieurs fois.";
  }
  if (fondCaisseAnnuelDeleteBtn) {
    fondCaisseAnnuelDeleteBtn.hidden = amountPerMember <= 0;
  }

  if (!fondCaisseAnnuelList) return;

  if (amountPerMember <= 0 || totals.memberCount === 0) {
    fondCaisseAnnuelList.innerHTML = "";
    return;
  }

  fondCaisseAnnuelList.innerHTML = getSortedMembers()
    .map((member) => {
      const paid = getFondCaisseAnnuelPaid(selectedYear, member.id);
      const due = getFondCaisseAnnuelDue(selectedYear, member.id);
      const solded = due <= 0;
      const history = yearData?.payments?.[member.id]?.history || [];
      const versementCount = history.length || (paid > 0 ? 1 : 0);
      const historyHtml = history.length
        ? `<div class="fond-caisse-annuel-history">${history
            .map(
              (item) => `
            <span class="fond-caisse-annuel-chip">
              ${formatEuro(item.amount)} · ${formatFriendlyDate(item.createdAt)}
              <button type="button" class="fond-caisse-annuel-undo" data-year="${selectedYear}" data-member-id="${escapeHtml(member.id)}" data-payment-id="${escapeHtml(item.id)}" title="Annuler ce versement">Annuler</button>
            </span>`
            )
            .join("")}</div>`
        : "";
      const hint = solded
        ? `soldé${versementCount > 1 ? ` · ${versementCount} versements` : ""}`
        : paid > 0
          ? `déjà ${formatEuro(paid)}${versementCount > 1 ? ` · ${versementCount} versements` : " · 1 versement"} · reste ${formatEuro(due)}`
          : `à verser · ${formatEuro(amountPerMember)} · plusieurs fois possible`;
      return `
        <article class="ancienne-tournee-row fond-caisse-annuel-row${solded ? " is-paid" : ""}">
          <div class="fond-caisse-annuel-main">
            <span class="ancienne-tournee-row-poto">${escapeHtml(member.name)}</span>
            <span class="ancienne-tournee-repaid-hint">${escapeHtml(hint)}</span>
            ${historyHtml}
          </div>
          <span class="ancienne-tournee-row-amount">
            <strong>${solded ? formatEuro(paid) : formatEuro(due)}</strong>
            <span class="ancienne-tournee-repaid-hint">${solded ? "versé" : "reste"}</span>
          </span>
          ${
            solded
              ? `<div class="ancienne-tournee-repay-controls">
                  <span class="fond-caisse-annuel-done">OK</span>
                  <button type="button" class="btn-secondary fond-caisse-annuel-undo" data-year="${selectedYear}" data-member-id="${escapeHtml(member.id)}" title="Annuler le dernier versement">Annuler le dernier</button>
                </div>`
              : `<div class="ancienne-tournee-repay-controls">
                  <label class="ancienne-tournee-repay-field">
                    <input type="number" min="0.5" step="0.5" max="${due}" placeholder="${due}" class="fond-caisse-annuel-pay-input" data-member-id="${escapeHtml(member.id)}" data-year="${selectedYear}" inputmode="decimal" aria-label="Montant de ce versement pour ${escapeHtml(member.name)}, reste ${due} euros" />
                    <span aria-hidden="true">€</span>
                  </label>
                  <button type="button" class="btn-primary btn-fond-caisse-annuel-pay" data-member-id="${escapeHtml(member.id)}" data-year="${selectedYear}">Verser</button>
                </div>`
          }
        </article>
      `;
    })
    .join("");
}

function loadTabPermissions() {
  try {
    const data = localStorage.getItem(TAB_PERMISSIONS_KEY);
    const stored = data ? JSON.parse(data) : {};
    const merged = { ...DEFAULT_TAB_PERMISSIONS };

    MANAGEABLE_TABS.forEach((tab) => {
      if (Array.isArray(stored[tab.id])) {
        merged[tab.id] = stored[tab.id].filter((roleId) =>
          ROLES.some((role) => role.id === roleId)
        );
      }
    });

    return merged;
  } catch {
    return { ...DEFAULT_TAB_PERMISSIONS };
  }
}

function saveTabPermissionsData() {
  localStorage.setItem(TAB_PERMISSIONS_KEY, JSON.stringify(tabPermissions));
}

function getTabLabel(tabId) {
  return MANAGEABLE_TABS.find((tab) => tab.id === tabId)?.label || tabId;
}

function getTabAllowedRoles(tabId) {
  return tabPermissions[tabId] || [];
}

/** Onglet principal actuellement affiché */
function getActiveMainTab() {
  const activeBtn = document.querySelector(".tab.active[data-tab]");
  if (activeBtn?.dataset?.tab) return activeBtn.dataset.tab;
  const activeContent = document.querySelector(".tab-content.active");
  if (activeContent?.id?.startsWith("tab-")) return activeContent.id.slice(4);
  return "membres";
}

/**
 * Espace Admin = uniquement l'onglet Admin.
 * C'est là que l'admin configure le groupe.
 */
function isAdminWorkspace() {
  return canAccessAdminTab() && getActiveMainTab() === "admin";
}

/**
 * Vue compte simple : usage quotidien + tests.
 * Hors de l'onglet Admin, chacun voit/agit comme un membre simple.
 */
function isSimpleAccountView() {
  if (!canAccessAdminTab()) return true;
  return !isAdminWorkspace();
}

function hasRoleTabAccess(tabId) {
  if (isGroupAdmin()) return true;
  const member = getCurrentMember();
  if (!member) return false;
  const memberRole = getMemberRole(member.id);
  if (!memberRole) return false;
  return getTabAllowedRoles(tabId).includes(memberRole);
}

function canAccessAdminSub(subId) {
  if (isGroupAdmin()) return true;
  if (subId === "admins" || subId === "acces") return false;
  if (subId === "caisse") return isFinancierPoste() || hasRoleTabAccess("caisse");
  if (subId === "ancienne-tournee") return isFinancierPoste() || hasRoleTabAccess("ancienne-tournee");
  if (subId === "prets") return isFinancierPoste() || hasRoleTabAccess("prets");
  return hasRoleTabAccess(subId);
}

function getAllowedAdminSubs() {
  return ADMIN_SUBTABS.filter((id) => canAccessAdminSub(id));
}

function canEditTourneePlanning() {
  return isAdminWorkspace() && activeAdminSub === "tournee" && hasRoleTabAccess("tournee");
}

function canAccessTourneeTab() {
  return true;
}

function canAccessAdminTab() {
  if (!isLoggedIn()) return false;
  if (isGroupAdmin()) return true;
  if (isFinancierPoste()) return true;
  return MANAGEABLE_TABS.some((tab) => hasRoleTabAccess(tab.id));
}

function canAccessGestionTab() {
  return canAccessAdminTab();
}

function canAccessCaisse() {
  if (!isAdminWorkspace() || activeAdminSub !== "caisse") return false;
  return isGroupAdmin() || isFinancierPoste() || hasRoleTabAccess("caisse");
}

function canManageCaisseArgent() {
  return isGroupAdmin() || isFinancierPoste() || hasRoleTabAccess("caisse");
}

function getAdminSubtab() {
  const stored = localStorage.getItem(ADMIN_SUBTAB_KEY);
  const requested = stored === "equipe" ? "bureau" : stored;
  const allowed = getAllowedAdminSubs();
  if (allowed.includes(requested)) return requested;
  return allowed[0] || "membres";
}

function getGestionSubtab() {
  return getAdminSubtab();
}

function updateAdminSubtabVisibility() {
  document.querySelectorAll("[data-admin-sub]").forEach((btn) => {
    const key = btn.dataset.adminSub;
    if (!key) return;
    btn.hidden = !canAccessAdminSub(key);
  });
}

function showAdminSub(subId) {
  if (!ADMIN_SUBTABS.includes(subId) || !canAccessAdminSub(subId)) {
    subId = getAdminSubtab();
  }
  activeAdminSub = subId;
  activeGestionSub = subId;
  localStorage.setItem(ADMIN_SUBTAB_KEY, subId);
  updateAdminSubtabVisibility();

  const root = document.getElementById("tab-admin");
  const tabButtons = root
    ? root.querySelectorAll("[data-admin-sub]")
    : adminSubtabs?.querySelectorAll("[data-admin-sub]");

  tabButtons?.forEach((btn) => {
    const key = btn.dataset.adminSub;
    if (!key) return;
    btn.classList.toggle("active", key === subId);
    btn.setAttribute("aria-selected", String(key === subId));
    if (key === subId) {
      btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  });

  const panels = root
    ? root.querySelectorAll(".gestion-subpanel[data-admin-panel]")
    : document.querySelectorAll(".gestion-subpanel[data-admin-panel]");

  panels.forEach((panel) => {
    const id = panel.dataset.adminPanel;
    const isActive = id === subId;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });

  if (subId === "membres") renderMemberList();
  if (subId === "bureau") renderBureau();
  if (subId === "admins") renderAdminList();
  if (subId === "acces") renderTabPermissionsPanel();
  if (subId === "tournee") {
    if (canEditTourneePlanning()) {
      cotisationsDraft = { ...cotisations };
      tourneeDraft = cloneTourneeData(tourneeData);
    }
    renderTourneeTable();
  }
  if (subId === "ancienne-tournee") {
    renderAncienneTourneeDettesAdmin();
  }
  if (subId === "caisse") {
    renderFondCaissePanel();
    renderAutreArgent();
  }
  if (subId === "prets") {
    renderAdminPrets();
  }
  if (subId === "amendes") {
    renderAmendes();
    renderAmendesAdminHistory();
  }
  if (subId === "evenements") {
    renderEvenements();
  }
  highlightNotificationItem();
}

function showGestionSub(subId) {
  if (subId === "equipe") subId = "bureau";
  showAdminSub(subId);
}

function renderAdmin() {
  activeAdminSub = getAdminSubtab();
  showAdminSub(activeAdminSub);
}

function renderGestion() {
  renderAdmin();
}

function canManageTab(tabId) {
  // Les manipulations se font uniquement dans l'onglet Admin
  if (isSimpleAccountView()) return false;
  if (isGroupAdmin()) return true;
  return hasRoleTabAccess(tabId);
}

function saveAmendes(shouldRender = true) {
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));
  if (shouldRender) {
    renderAmendes();
    renderAmendesAdminHistory();
    renderPrets();
  }
}

function getAmendeTypeLabel(typeId) {
  if (typeId === "dette") return "Dette événement";
  return AMENDE_TYPES.find((t) => t.id === typeId)?.label || typeId;
}

function isDetteAmende(amende) {
  return amende?.type === "dette";
}

function getRegularAmendes(amendesList) {
  return amendesList.filter((amende) => !isDetteAmende(amende));
}

function getDetteAmendes() {
  return amendes.filter((amende) => isDetteAmende(amende));
}

function resetEvenementDettes() {
  const removedDettes = amendes.filter((amende) => isDetteAmende(amende)).length;

  amendes = amendes.filter((amende) => !isDetteAmende(amende));
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));

  evenements.forEach((evt) => {
    delete evt.caisseDebtDeduction;

    if (!evt.payments) return;

    Object.keys(evt.payments).forEach((memberId) => {
      const payment = evt.payments[memberId];
      if (!payment) return;

      delete payment.convertedToDebt;
      delete payment.debtCreatedAt;

      if (payment.debtRepaidAt) {
        payment.paid = false;
        payment.paidAt = null;
        payment.validatedBy = null;
        payment.paidAmount = null;
        delete payment.debtRepaidAt;
      }
    });
  });

  localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));

  return removedDettes;
}

function reloadFromStorage() {
  members = loadMembers();
  roles = loadRoles();
  cotisations = loadCotisations();
  amendes = loadAmendes();
  amendesCaisse = loadAmendesCaisse();
  tabPermissions = loadTabPermissions();
  prets = loadPrets();
  notifications = loadNotifications();
  paymentSignals = loadPaymentSignals();
  evenements = loadEvenements();
  autreArgent = loadAutreArgent();
  ancienneTourneeDettes = loadAncienneTourneeDettes();
  fondCaisse = loadFondCaisse();
  fondCaisseAnnuel = loadFondCaisseAnnuel();
  financierAccount = loadFinancierAccount();
  financeData = loadFinance();
  adminIds = loadAdminIds();
  ensureDefaultAdmin();
  tourneeData = loadTourneeData();
  if (canEditTourneePlanning()) {
    cotisationsDraft = { ...cotisations };
    tourneeDraft = cloneTourneeData(tourneeData);
  }
}

function saveMembers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  render();
}

function saveRoles() {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  render();
}

function saveCotisations() {
  localStorage.setItem(COTISATIONS_KEY, JSON.stringify(cotisations));
}

function getSession() {
  if (!authState.loggedIn || !authState.member) return null;
  return {
    memberId: authState.member.id,
    memberName: authState.member.name,
    isAdmin: authState.member.isAdmin,
  };
}

function setSession(member) {
  authState.loggedIn = true;
  authState.member = {
    id: member.id,
    name: member.name,
    isAdmin: isMemberAdmin(member.id),
  };
}

function clearSession() {
  authState.loggedIn = false;
  authState.member = null;
  authState.mustChangePassword = false;
}

function isLoggedIn() {
  return authState.loggedIn && !authState.mustChangePassword;
}

function isAuthenticated() {
  return authState.loggedIn;
}

function getCurrentMember() {
  if (!authState.loggedIn || !authState.member) return null;
  return (
    getMemberById(authState.member.id) ||
    members.find((m) => m.name.toLowerCase() === authState.member.name.toLowerCase())
  );
}

function isGroupAdmin() {
  const member = getCurrentMember();
  return !!member && isMemberAdmin(member.id);
}

function isFinancier() {
  const member = getCurrentMember();
  if (!member) return false;
  // En vue compte simple, l'admin n'est Financier que s'il a le poste
  if (isGroupAdmin() && isSimpleAccountView()) {
    return getMemberRole(member.id) === "tresorier";
  }
  return isGroupAdmin() || getMemberRole(member.id) === "tresorier";
}

function canDecidePrets() {
  return isFinancier();
}

function openLoginModal() {
  loginError.hidden = true;
  loginForm.reset();
  const remembered = typeof getRememberedLoginName === "function" ? getRememberedLoginName() : "";
  if (remembered && loginNameInput) {
    loginNameInput.value = remembered;
  }
  loginModal.classList.add("open");
  appEl.classList.add("app-blurred");
  loginNameInput.focus();
}

function closeLoginModal() {
  if (!isAuthenticated()) return;
  if (authState.mustChangePassword) return;
  loginModal.classList.remove("open");
  appEl.classList.remove("app-blurred");
}

function openChangePasswordModal() {
  changePasswordError.hidden = true;
  changePasswordForm.reset();
  changePasswordModal.classList.add("open");
  appEl.classList.add("app-blurred");
  currentPasswordInput.focus();
}

function closeChangePasswordModal() {
  if (authState.mustChangePassword) return;
  changePasswordModal.classList.remove("open");
  if (isAuthenticated()) {
    appEl.classList.remove("app-blurred");
  }
}

const confirmModal = document.getElementById("confirmModal");
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalDesc = document.getElementById("confirmModalDesc");
const confirmModalOk = document.getElementById("confirmModalOk");
const confirmModalCancel = document.getElementById("confirmModalCancel");
const confirmModalQueue = [];

function isAppDialogOpen() {
  return confirmModalQueue.length > 0;
}

function presentConfirmModal() {
  const item = confirmModalQueue[0];
  if (!item || !confirmModal) return;
  const {
    title = "Confirmation",
    message = "",
    okLabel = "OK",
    cancelLabel = "Annuler",
    showCancel = true,
  } = item.opts;
  if (confirmModalTitle) confirmModalTitle.textContent = title;
  if (confirmModalDesc) confirmModalDesc.textContent = message;
  if (confirmModalOk) confirmModalOk.textContent = okLabel;
  if (confirmModalCancel) {
    confirmModalCancel.textContent = cancelLabel;
    confirmModalCancel.hidden = !showCancel;
  }
  confirmModal.classList.add("open");
  appEl.classList.add("app-blurred");
  confirmModalOk?.focus();
}

function closeConfirmModal(result) {
  const item = confirmModalQueue.shift();
  const showCancel = item?.opts?.showCancel !== false;
  confirmModal?.classList.remove("open");
  if (
    !confirmModalQueue.length &&
    !loginModal?.classList.contains("open") &&
    !changePasswordModal?.classList.contains("open")
  ) {
    appEl.classList.remove("app-blurred");
  }
  if (item?.resolve) item.resolve(showCancel ? Boolean(result) : true);
  if (confirmModalQueue.length) presentConfirmModal();
}

function openConfirmModal(opts = {}) {
  return new Promise((resolve) => {
    confirmModalQueue.push({ opts, resolve });
    if (confirmModalQueue.length === 1) presentConfirmModal();
  });
}

function appConfirm(message, title = "Confirmation") {
  return openConfirmModal({
    title,
    message: String(message ?? ""),
    okLabel: "OK",
    cancelLabel: "Annuler",
    showCancel: true,
  });
}

function appAlert(message, title = "Poto Timide") {
  return openConfirmModal({
    title,
    message: String(message ?? ""),
    okLabel: "OK",
    showCancel: false,
  });
}

window.alert = (message) => {
  appAlert(message);
};

confirmModalOk?.addEventListener("click", () => closeConfirmModal(true));
confirmModalCancel?.addEventListener("click", () => closeConfirmModal(false));
confirmModal?.addEventListener("click", (e) => {
  if (e.target !== confirmModal) return;
  closeConfirmModal(confirmModalQueue[0]?.opts?.showCancel === false);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!confirmModal?.classList.contains("open")) return;
  e.preventDefault();
  closeConfirmModal(confirmModalQueue[0]?.opts?.showCancel === false);
});

function bindFormEnterKey(form, inputs, onSubmit) {
  if (!form) return;
  const fields = inputs.filter(Boolean);
  if (fields.length === 0) return;

  form.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing || e.repeat) return;
    const target = e.target;
    if (!(target instanceof HTMLInputElement) || !fields.includes(target)) return;

    const index = fields.indexOf(target);
    const nextField = index < fields.length - 1 ? fields[index + 1] : null;

    if (nextField && !nextField.value.trim()) {
      e.preventDefault();
      nextField.focus();
      return;
    }

    e.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit();
      return;
    }
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  });
}

function setupLoginForm() {
  if (!loginForm) return;

  const submitLogin = () => {
    loginMember(loginNameInput?.value ?? "", loginPasswordInput?.value ?? "");
  };

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    submitLogin();
  });

  loginForm.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing || e.repeat) return;
    const target = e.target;
    if (target !== loginNameInput && target !== loginPasswordInput) return;

    if (target === loginNameInput && loginPasswordInput && !loginPasswordInput.value.trim()) {
      e.preventDefault();
      loginPasswordInput.focus();
      return;
    }

    e.preventDefault();
    submitLogin();
  });
}

async function loginMember(name, password) {
  loginError.hidden = true;
  try {
    await apiLogin(name.trim(), password);
    await loadDataFromServer();
    if (typeof potoPullSharedUpdates === "function") await potoPullSharedUpdates();
    reloadFromStorage();
    if (typeof potoStartPeriodicSync === "function") potoStartPeriodicSync();
    startOnlinePolling();
    ensureDefaultAdmin();
    if (authState.member) {
      authState.member.isAdmin = isMemberAdmin(authState.member.id);
    }

    loginModal.classList.remove("open");

    if (authState.mustChangePassword) {
      openChangePasswordModal();
    } else {
      appEl.classList.remove("app-blurred");
    }

    updateSessionUI();
    render();
    maybeShowInstallBanner();
    pushSetupStarted = false;
    setupPushNotifications();
    applyNotificationDeepLink();
    return true;
  } catch (err) {
    loginError.textContent = err.message || "Identifiant ou mot de passe incorrect.";
    loginError.hidden = false;
    return false;
  }
}

async function changeMemberPassword(currentPassword, newPassword, confirmPassword) {
  changePasswordError.hidden = true;

  if (newPassword !== confirmPassword) {
    changePasswordError.textContent = "Les mots de passe ne correspondent pas.";
    changePasswordError.hidden = false;
    return false;
  }

  try {
    await apiChangePassword(currentPassword, newPassword);
    changePasswordModal.classList.remove("open");
    appEl.classList.remove("app-blurred");
    updateSessionUI();
    render();
    return true;
  } catch (err) {
    changePasswordError.textContent = err.message || "Impossible de changer le mot de passe.";
    changePasswordError.hidden = false;
    return false;
  }
}

async function resetMemberPassword(memberId) {
  const member = getMemberById(memberId);
  if (!member || !isGroupAdmin()) return;

  if (isOwnerMember(memberId) && !isOwnerMember(getCurrentMember())) {
    alert("Le mot de passe du propriétaire ne peut pas être réinitialisé par un autre admin.");
    return;
  }

  if (
    !(await appConfirm(
      `Réinitialiser le mot de passe de ${member.name} à 1234 ?\nIl devra le changer à la prochaine connexion.`
    ))
  ) {
    return;
  }

  try {
    await apiResetMemberPassword(memberId);
    alert(`Mot de passe de ${member.name} réinitialisé à 1234.`);
  } catch (err) {
    alert(err.message || "Échec de la réinitialisation.");
  }
}

async function logoutMember() {
  cancelEditAmende();
  stopOnlinePolling();
  onlineMembers = [];
  renderOnlineList();
  try {
    if (typeof potoFlushSync === "function") await potoFlushSync();
    await apiLogout();
  } catch {
    /* ignore */
  }
  clearSession();
  cotisationsDraft = { ...cotisations };
  tourneeDraft = cloneTourneeData(tourneeData);
  saveMsg.hidden = true;
  changePasswordModal.classList.remove("open");
  updateSessionUI();
  render();
  openLoginModal();
}

function updateSessionUI() {
  const loggedIn = isAuthenticated();
  const canUseApp = isLoggedIn();
  const isAdmin = isGroupAdmin();
  const current = getCurrentMember();

  if (loggedIn && current) {
    const roleId = getMemberRole(current.id);
    const roleLabel = roleId ? getRoleLabel(roleId) : null;

    if (isAdmin) {
      userStatus.innerHTML = `<span class="badge-crown" aria-hidden="true">👑</span> Administrateur : ${escapeHtml(current.name)}`;
    } else if (roleLabel) {
      userStatus.textContent = `Connecté : ${current.name} (${roleLabel})`;
    } else {
      userStatus.textContent = `Connecté : ${current.name}`;
    }

    userStatus.classList.toggle("admin-active", isAdmin);
    userStatus.classList.toggle("member-active", !isAdmin);
  } else {
    userStatus.textContent = "Non connecté";
    userStatus.classList.remove("admin-active", "member-active");
  }

  if (loginBtn) {
    loginBtn.hidden = loggedIn;
    loginBtn.setAttribute("aria-hidden", loggedIn ? "true" : "false");
  }
  if (logoutBtn) {
    logoutBtn.hidden = !loggedIn;
    logoutBtn.setAttribute("aria-hidden", loggedIn ? "false" : "true");
  }
  document.body.classList.toggle("is-logged-in", loggedIn);
  if (loggedIn) updatePretTabBadge();

  // Pas de bannière / messages « vue simple » pour les membres
  if (simpleViewBanner) simpleViewBanner.hidden = true;

  if (saveCotisationsBtn) saveCotisationsBtn.hidden = !canEditTourneePlanning();
  if (tourneeInfoMsg) tourneeInfoMsg.hidden = true;
  const tourneeEditHint = document.getElementById("tourneeEditHint");
  if (tourneeEditHint) {
    tourneeEditHint.hidden = true;
    tourneeEditHint.textContent = "";
  }
  if (membresLockMsg) {
    membresLockMsg.hidden = true;
    membresLockMsg.textContent = "";
  }

  // Onglet Admin : administrateur ou personne avec un accès métier
  if (tabBtnAdmin) tabBtnAdmin.hidden = !canAccessAdminTab();
  if (tabBtnGestion) tabBtnGestion.hidden = !canAccessAdminTab();
  if (tabBtnTournee) tabBtnTournee.hidden = false;
  if (tabBtnAutreArgent) tabBtnAutreArgent.hidden = true;

  // Fond de caisse : pas dans Finance public
  if (financeSubCaisse) financeSubCaisse.hidden = true;

  if (rolesPanel) rolesPanel.hidden = !hasRoleTabAccess("bureau");
  if (addMemberPanel) addMemberPanel.hidden = !hasRoleTabAccess("membres");
  if (tabPermissionsPanel) tabPermissionsPanel.hidden = !isAdmin;
  if (adminRolesPanel) adminRolesPanel.hidden = !isAdmin;

  if (addAmendePanel) addAmendePanel.hidden = !canManageTab("amendes");
  if (addEvenementPanel) addEvenementPanel.hidden = !canManageTab("evenements");

  if (fondCaissePanel) fondCaissePanel.hidden = true;
  const fondAdminPanel = document.getElementById("fondCaissePanelAdmin");
  if (fondAdminPanel) fondAdminPanel.hidden = !hasRoleTabAccess("caisse");
  if (autreArgentFormPanel) autreArgentFormPanel.hidden = !canManageCaisseArgent();
  if (autreArgentListPanel) autreArgentListPanel.hidden = !canManageCaisseArgent();

  addMemberPanel?.classList.toggle("locked", !hasRoleTabAccess("membres"));
  rolesPanel?.classList.toggle("locked", !hasRoleTabAccess("bureau"));
  adminRolesPanel?.classList.toggle("locked", !isAdmin);
  tabPermissionsPanel?.classList.toggle("locked", !isAdmin);

  if (canAccessAdminTab() && document.getElementById("tab-admin")?.classList.contains("active")) {
    showAdminSub(activeAdminSub || getAdminSubtab());
  }
}

function requireGroupAdmin(actionLabel) {
  if (!isLoggedIn()) {
    alert("Veuillez vous connecter avec votre nom.");
    openLoginModal();
    return false;
  }
  if (isGroupAdmin()) return true;
  alert(`Seul un administrateur du groupe peut ${actionLabel}.`);
  return false;
}

function requireTabAccess(tabId, actionLabel) {
  if (!isLoggedIn()) {
    alert("Veuillez vous connecter avec votre nom.");
    openLoginModal();
    return false;
  }
  if (isSimpleAccountView()) {
    alert(`Cette action se fait dans l'onglet Admin.`);
    return false;
  }
  if (hasRoleTabAccess(tabId)) return true;
  alert(`Vous n'avez pas l'autorisation de ${actionLabel} pour l'onglet « ${getTabLabel(tabId)} ».`);
  return false;
}

function showSaveMessage(text, type = "success") {
  saveMsg.textContent = text;
  saveMsg.className = `save-msg save-msg-${type}`;
  saveMsg.hidden = false;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFriendlyDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(String(dateStr).split("T")[0] + "T12:00:00");
  if (Number.isNaN(date.getTime())) return formatDate(dateStr);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday - startDate) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays > 1 && diffDays < 7) return `Il y a ${diffDays} jours`;
  return formatDate(String(dateStr).split("T")[0]);
}

function getRoleLabel(roleId) {
  return ROLES.find((r) => r.id === roleId)?.label || roleId;
}

function getMemberRole(memberId) {
  return Object.entries(roles).find(([, id]) => id === memberId)?.[0] || null;
}

function getMemberById(id) {
  const raw = String(id || "").trim();
  if (!raw) return null;
  if (raw.toLowerCase() === "groupe" || raw.toLowerCase() === "le groupe") {
    return { id: "groupe", name: "Le groupe" };
  }
  return members.find((m) => m.id === raw) || null;
}

function compareMemberNames(a, b) {
  return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
}

function getSortedMembers() {
  return [...members].sort(compareMemberNames);
}

function isLimitReached() {
  return members.length >= MAX_MEMBERS;
}

function updateFormState() {
  const full = isLimitReached();
  const canMembers = hasRoleTabAccess("membres");
  const canBureau = hasRoleTabAccess("bureau");
  const isAdmin = isGroupAdmin();
  memberNameInput.disabled = full || !canMembers;
  submitBtn.disabled = full || !canMembers;
  limitMsg.hidden = !full;
  roleMemberSelect.disabled = !canBureau;
  rolePostSelect.disabled = !canBureau;
  const roleSubmit = roleForm?.querySelector('button[type="submit"]');
  if (roleSubmit) roleSubmit.disabled = !canBureau;
  if (adminMemberSelect) adminMemberSelect.disabled = !isAdmin;
  if (adminForm) {
    const adminSubmit = adminForm.querySelector('button[type="submit"]');
    if (adminSubmit) adminSubmit.disabled = !isAdmin;
  }
}

function updateMemberSelects() {
  const options = `<option value="">— Choisir un membre —</option>`;

  roleMemberSelect.innerHTML = options;
  amendeMemberSelect.innerHTML = options;
  if (evenementMemberSelect) evenementMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option>`;
  if (adminMemberSelect) adminMemberSelect.innerHTML = `<option value="">— Choisir un membre —</option>`;
  if (autreArgentMemberSelect) {
    autreArgentMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option><option value="groupe">Le groupe</option>`;
  }
  if (ancienneTourneeMemberSelect) {
    ancienneTourneeMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option>`;
  }

  getSortedMembers().forEach((member) => {
    const currentRole = getMemberRole(member.id);
    const label = currentRole
      ? `${member.name} (${getRoleLabel(currentRole)})`
      : member.name;

    const roleOption = document.createElement("option");
    roleOption.value = member.id;
    roleOption.textContent = label;
    roleMemberSelect.appendChild(roleOption);

    const amendeOption = document.createElement("option");
    amendeOption.value = member.id;
    amendeOption.textContent = member.name;
    amendeMemberSelect.appendChild(amendeOption);

    if (evenementMemberSelect) {
      const evenementOption = document.createElement("option");
      evenementOption.value = member.id;
      evenementOption.textContent = member.name;
      evenementMemberSelect.appendChild(evenementOption);
    }

    if (adminMemberSelect && !isMemberAdmin(member.id)) {
      const adminOption = document.createElement("option");
      adminOption.value = member.id;
      adminOption.textContent = member.name;
      adminMemberSelect.appendChild(adminOption);
    }

    if (autreArgentMemberSelect) {
      const autreOption = document.createElement("option");
      autreOption.value = member.id;
      autreOption.textContent = member.name;
      autreArgentMemberSelect.appendChild(autreOption);
    }

    if (ancienneTourneeMemberSelect) {
      const detteOption = document.createElement("option");
      detteOption.value = member.id;
      detteOption.textContent = member.name;
      ancienneTourneeMemberSelect.appendChild(detteOption);
    }
  });
}

function renderAdminList() {
  if (!adminList) return;

  if (adminIds.length === 0) {
    adminList.innerHTML = `<li class="empty">Aucun administrateur.</li>`;
    return;
  }

  adminList.innerHTML = [...adminIds]
    .sort((idA, idB) => {
      const nameA = getMemberById(idA)?.name || "";
      const nameB = getMemberById(idB)?.name || "";
      return nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
    })
    .map((id) => {
      const member = getMemberById(id);
      if (!member) return "";

      const isOwner = isOwnerMember(member);
      const canRemove = adminIds.length > 1 && !isOwner;
      return `
        <li class="admin-item">
          <div>
            <p class="admin-item-name">${escapeHtml(member.name)}${isOwner ? ' <span class="tag-admin">Propriétaire</span>' : ""}</p>
            <p class="admin-item-meta">${isOwner ? "Créateur du site — droits permanents" : "Accès complet au groupe"}</p>
          </div>
          ${
            isOwner
              ? `<span class="admin-only-note">Protégé</span>`
              : canRemove
                ? `<button type="button" class="btn-clear btn-remove-admin" data-id="${member.id}">Retirer</button>`
                : `<span class="admin-only-note">Unique</span>`
          }
        </li>
      `;
    })
    .join("");

  adminList.querySelectorAll(".btn-remove-admin").forEach((btn) => {
    btn.addEventListener("click", () => removeAdmin(btn.dataset.id));
  });
}

function assignAdmin(memberId) {
  if (!requireGroupAdmin("nommer un administrateur")) return;

  const member = getMemberById(memberId);
  if (!member) return;

  if (isMemberAdmin(memberId)) {
    alert("Ce membre est déjà administrateur.");
    return;
  }

  adminIds.push(memberId);
  saveAdminIds();
  if (adminForm) adminForm.reset();
}

async function removeAdmin(memberId) {
  if (!requireGroupAdmin("retirer un administrateur")) return;

  if (isOwnerMember(memberId)) {
    alert("Le propriétaire du site ne peut pas perdre ses droits administrateur.");
    return;
  }

  if (adminIds.length <= 1) {
    alert("Il doit rester au moins un administrateur.");
    return;
  }

  const member = getMemberById(memberId);
  if (!member) return;

  if (!(await appConfirm(`Retirer les droits administrateur de « ${member.name} » ?`))) return;

  adminIds = adminIds.filter((id) => id !== memberId);
  saveAdminIds();

  const current = getCurrentMember();
  if (current?.id === memberId) {
    updateSessionUI();
  }
}

function renderTabPermissionsPanel() {
  if (!tabPermissionsTable || !tabPermissionsBody) return;

  const headerRow = tabPermissionsTable.querySelector("thead tr");
  headerRow.innerHTML = `
    <th class="permissions-tab-col">Onglet</th>
    ${ROLES.map((role) => `<th>${escapeHtml(role.label)}</th>`).join("")}
  `;

  tabPermissionsBody.innerHTML = MANAGEABLE_TABS.map((tab) => {
    const roleCells = ROLES.map((role) => {
      const checked = getTabAllowedRoles(tab.id).includes(role.id);
      return `
        <td>
          <input
            type="checkbox"
            class="tab-perm-checkbox"
            data-tab="${tab.id}"
            data-role="${role.id}"
            ${checked ? "checked" : ""}
            ${isGroupAdmin() ? "" : "disabled"}
          />
        </td>
      `;
    }).join("");

    return `
      <tr>
        <td class="permissions-tab-col">${escapeHtml(tab.label)}</td>
        ${roleCells}
      </tr>
    `;
  }).join("");
}

function saveTabPermissionsFromUI() {
  if (!requireGroupAdmin("configurer les accès aux onglets")) return;

  const nextPermissions = {};
  MANAGEABLE_TABS.forEach((tab) => {
    nextPermissions[tab.id] = [];
  });

  tabPermissionsBody.querySelectorAll(".tab-perm-checkbox:checked").forEach((checkbox) => {
    const tabId = checkbox.dataset.tab;
    const roleId = checkbox.dataset.role;
    if (nextPermissions[tabId] && !nextPermissions[tabId].includes(roleId)) {
      nextPermissions[tabId].push(roleId);
    }
  });

  tabPermissions = nextPermissions;
  saveTabPermissionsData();

  tabPermissionsMsg.textContent = "Accès aux onglets enregistrés.";
  tabPermissionsMsg.className = "save-msg save-msg-success";
  tabPermissionsMsg.hidden = false;

  updateSessionUI();
  updateAdminSubtabVisibility();
  renderTourneeTable();
  renderAmendes();
  renderPrets();
  renderEvenements();
}

function buildBureauHtml(allowClear) {
  const canBureau = hasRoleTabAccess("bureau");
  const visibleRoles = canBureau || allowClear ? ROLES : ROLES.filter((role) => roles[role.id]);

  if (visibleRoles.length === 0) {
    return `<li class="bureau-empty">Aucun poste attribué.</li>`;
  }

  return visibleRoles
    .map((role) => {
      const memberId = roles[role.id];
      const member = memberId ? getMemberById(memberId) : null;
      const canClear = allowClear && member && canBureau;
      const shortRole = role.short || role.label;
      return `
        <li class="bureau-card${member ? "" : " is-vacant"}" title="${escapeHtml(role.label)}${member ? " — " + escapeHtml(member.name) : " — vacant"}">
          <div class="bureau-card-body">
            <span class="bureau-card-role">${escapeHtml(shortRole)}</span>
            <span class="bureau-card-name">${member ? escapeHtml(member.name) : "—"}</span>
          </div>
          ${
            canClear
              ? `<button type="button" class="btn-bureau-clear" data-role="${role.id}" title="Retirer — ${escapeHtml(role.label)}">×</button>`
              : ""
          }
        </li>
      `;
    })
    .join("");
}

function bindBureauClearButtons(listEl) {
  if (!listEl) return;
  listEl.querySelectorAll(".btn-bureau-clear").forEach((btn) => {
    btn.addEventListener("click", () => clearRole(btn.dataset.role));
  });
}

function renderBureau() {
  if (bureauList) {
    bureauList.innerHTML = buildBureauHtml(false);
  }
  if (bureauListGestion) {
    bureauListGestion.innerHTML = buildBureauHtml(true);
    bindBureauClearButtons(bureauListGestion);
  }
}

function fillMemberList(listEl, { withAdminActions }) {
  if (!listEl) return;
  listEl.innerHTML = "";

  if (members.length === 0) {
    listEl.innerHTML = `<li class="empty">Aucun membre pour le moment.</li>`;
    return;
  }

  const currentMember = getCurrentMember();
  const showActions = withAdminActions && hasRoleTabAccess("membres");

  getSortedMembers().forEach((member, index) => {
    const roleId = getMemberRole(member.id);
    const memberIsAdmin = isMemberAdmin(member.id);
    const isCurrentUser = currentMember?.id === member.id;
    const isOnline = isMemberOnline(member.id);

    const li = document.createElement("li");
    li.className = `member-item${isCurrentUser ? " member-current" : ""}${isOnline ? " member-online" : ""}`;
    li.innerHTML = `
      <div class="member-info">
        <span class="member-avatar${isOnline ? " member-avatar-online" : ""}">${escapeHtml(getInitials(member.name))}</span>
        <div class="member-text">
          <p class="member-name" title="${escapeHtml(member.name)} — ${formatEuro(getMemberCotisationAmount(member.id))} / mois">
            <span class="member-num">#${index + 1}</span>
            ${escapeHtml(member.name)}
            <span class="member-cotisation">: ${formatEuro(getMemberCotisationAmount(member.id))}</span>
            ${memberIsAdmin ? '<span class="tag-admin">Admin</span>' : ""}
            ${isCurrentUser ? '<span class="tag-you">Vous</span>' : ""}
            ${isOnline ? '<span class="tag-online">En ligne</span>' : ""}
          </p>
          <p class="member-date">
            ${roleId ? `<span class="role-badge">${escapeHtml(getRoleLabel(roleId))}</span>` : "Membre"}
          </p>
        </div>
      </div>
      ${
        showActions
          ? `<div class="member-right">
              <div class="member-actions">
                ${
                  isOwnerMember(member)
                    ? `<span class="admin-only-note">Propriétaire</span>`
                    : `<button type="button" class="btn-clear btn-reset-pwd" data-id="${member.id}" title="Réinitialiser le mot de passe">MDP</button>
                       <button class="btn-delete" data-id="${member.id}" title="Supprimer">×</button>`
                }
              </div>
            </div>`
          : ""
      }
    `;

    const resetPwdBtn = li.querySelector(".btn-reset-pwd");
    if (resetPwdBtn) {
      resetPwdBtn.addEventListener("click", () => resetMemberPassword(member.id));
    }

    const deleteBtn = li.querySelector(".btn-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteMember(member.id));
    }
    listEl.appendChild(li);
  });
}

function renderMemberList() {
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
  const canMarkOk = kind === "ristourne" && canMarkTourneeBouffeOk();
  if (!memberIds.length) {
    return `<span class="tournee-order-empty">—</span>`;
  }

  return `<div class="tournee-order-readout">
    ${memberIds
      .map((id) => {
        const member = getMemberById(id);
        if (!member) return "";
        const bouffeOk = kind === "ristourne" && isTourneeBouffeOk(id, tourneeYear, false);
        const isYou = currentMember?.id === id;
        return `<span class="tournee-person${bouffeOk ? " is-ok" : ""}${isYou ? " is-you" : ""}">
          ${escapeHtml(formatTourneePersonLabel(id, withAmount))}
          ${isYou ? '<span class="tag-you">Vous</span>' : ""}
          ${bouffeOk ? '<span class="tag-bouffe-ok" title="Tournée déjà prise">OK</span>' : ""}
          ${
            canMarkOk
              ? `<button type="button" class="btn-bouffe-ok${bouffeOk ? " is-done" : ""}" data-member-id="${escapeHtml(id)}" title="${bouffeOk ? "Retirer la validation" : "Valider : a déjà bouffé / pris sa tournée"}">${bouffeOk ? "Retirer OK" : "OK"}</button>`
              : ""
          }
        </span>`;
      })
      .join("")}
  </div>`;
}

function buildTourneeOrderEditor(kind, monthIndex, memberIds) {
  const withAmount = kind === "ristourne";
  const selected = new Set(memberIds);
  const chips = memberIds
    .map((id) => {
      const member = getMemberById(id);
      if (!member) return "";
      return `<span class="tournee-order-chip">
        ${escapeHtml(formatTourneePersonLabel(id, withAmount))}
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
}

function resolveLegacyTab(tabId) {
  if (!tabId) return null;
  if (tabId === "dettes-amendes" || tabId === "ancienne-tournee") return "dettes";
  if (tabId === "amendes" || tabId === "dettes") return tabId;
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

  return "membres";
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

function showTab(tabId) {
  const resolved = resolveLegacyTab(tabId);
  if (resolved) tabId = resolved;

  if (!TAB_IDS.includes(tabId)) tabId = "membres";
  if (tabId === "admin" && !canAccessAdminTab()) tabId = "membres";
  if (tabId === "finance" && activeFinanceSub === FINANCE_CAISSE_SUB && !canAccessCaisse()) {
    activeFinanceSub = FINANCE_ARCHIVES_SUB;
  }

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  tabContents.forEach((content) => {
    content.classList.toggle("active", content.id === `tab-${tabId}`);
  });
  document.querySelector(`.tab[data-tab="${tabId}"]`)?.scrollIntoView({
    inline: "center",
    block: "nearest",
    behavior: "smooth",
  });

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

  if (tabId === "prets") {
    reloadFromStorage();
    renderPrets();
    markPretNotificationsRead();
  }

  if (tabId === "evenements") {
    reloadFromStorage();
    renderEvenements();
  }

  if (tabId === "dettes") {
    reloadFromStorage();
    renderMesDettes();
  }

  if (tabId === "amendes") {
    reloadFromStorage();
    renderMesAmendes();
  }

  if (tabId === "finance") {
    reloadFromStorage();
    if (isGroupAdmin() && activeFinanceSub === FINANCE_CAISSE_SUB) {
      activeFinanceSub = FINANCE_ARCHIVES_SUB;
      localStorage.setItem(FINANCE_SUBTAB_KEY, FINANCE_ARCHIVES_SUB);
    }
    renderFinance();
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
    .filter((a) => a.memberId === memberId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAllAmendes() {
  return [...amendes].sort((a, b) => new Date(b.date) - new Date(a.date));
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
  if (!isLoggedIn()) return false;
  if (!isAdminWorkspace()) return false;
  if (isGroupAdmin()) return true;
  return hasRoleTabAccess("amendes");
}

function canRepayAmende(amende) {
  if (!amende) return false;
  return canManageAmendesActions();
}

function buildAmendeActionControls(amende, { showEdit = false } = {}) {
  if (!canManageAmendesActions()) return "";
  const remaining = Number(amende.amount) || 0;
  return `
    <div class="pret-repay-form amende-action-controls" data-amende-id="${amende.id}">
      ${
        showEdit && !isDetteAmende(amende)
          ? `<button type="button" class="btn-amende-edit" data-id="${amende.id}">Modifier</button>`
          : ""
      }
      <label class="amende-repay-field">
        <span>Ce versement</span>
        <input type="number" min="0.5" step="0.5" max="${remaining}" class="amende-repay-input pret-repay-input" data-id="${amende.id}" inputmode="decimal" placeholder="ex. 10" aria-label="Montant de ce versement, reste ${remaining} euros" />
        <span>€</span>
      </label>
      <button type="button" class="btn-primary btn-amende-repay" data-id="${amende.id}">Rembourser</button>
      <button type="button" class="btn-secondary btn-amende-delete" data-id="${amende.id}">Supprimer</button>
    </div>
  `;
}

function buildDetteCard(amende, { showMember = false, showEdit = false, index = 0 } = {}) {
  const copy = getDetteCardCopy(amende);
  const memberName = getMemberById(amende.memberId)?.name || "—";
  const repaid = Number(amende.repaidAmount) || 0;
  const metaParts = [
    showMember ? memberName : "",
    formatFriendlyDate(amende.date),
    copy.extra,
    repaid > 0 ? `déjà ${formatEuro(repaid)}` : "",
  ].filter(Boolean);

  const kind = isDetteAmende(amende) ? "dette" : "amende";
  const signalLabel = copy.title || getAmendeTypeLabel(amende.type);
  return `
    <article class="dette-card type-${escapeHtml(amende.type)}" id="amende-${escapeHtml(amende.id)}" style="--i: ${index}">
      ${getAmendeTypeBadge(amende.type)}
      <div class="dette-card-main">
        <p class="dette-card-title">${escapeHtml(copy.title)}</p>
        <p class="dette-card-meta">${escapeHtml(metaParts.join(" · "))}</p>
      </div>
      <strong class="dette-card-amount">${formatEuro(amende.amount)}</strong>
      ${buildPaymentSignalControls(kind, amende.id, amende.amount, signalLabel, amende.memberId)}
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
  if (ancienneTourneeForm) {
    const formPanel = ancienneTourneeForm.closest("section");
    if (formPanel) formPanel.hidden = !hasRoleTabAccess("ancienne-tournee");
  }
  if (!body) return;

  const total = ancienneTourneeDettes.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  if (totalEl) totalEl.textContent = formatEuro(total);

  if (!ancienneTourneeDettes.length) {
    body.innerHTML = `<tr><td colspan="4" class="empty-cell">Aucune dette enregistrée.</td></tr>`;
    return;
  }

  body.innerHTML = [...ancienneTourneeDettes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((entry) => {
      const member = getMemberById(entry.memberId);
      return `
        <tr id="admin-ancienne-${escapeHtml(entry.id)}">
          <td>${formatDate(String(entry.createdAt).split("T")[0])}</td>
          <td>${escapeHtml(member?.name || "—")}</td>
          <td class="ancienne-tournee-amount-cell">${formatAncienneTourneeAmountHtml(entry)}</td>
          <td>
            <div class="ancienne-tournee-actions">
              ${buildPaymentSignalStatusHtml(getLatestPaymentSignal("ancienne-tournee", entry.id, entry.memberId))}
              <button type="button" class="btn-secondary btn-ancienne-tournee-add" data-member-id="${escapeHtml(entry.memberId)}">Ajouter</button>
              <button type="button" class="btn-secondary btn-ancienne-tournee-delete" data-id="${escapeHtml(entry.id)}">Supprimer dette</button>
              ${buildAncienneTourneeRepayControls(entry)}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
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
        ${buildPaymentSignalControls("evenement", item.id, item.amount, item.title, memberId)}
      </article>`
    )
    .join("");
  return items;
}

function renderAncienneTourneeMemberView() {
  const body = document.getElementById("ancienneTourneeMemberBody");
  const totalEl = document.getElementById("ancienneTourneeMemberTotal");
  const wrap = document.getElementById("detteAncienneWrap");
  const current = getCurrentMember();
  if (!body) return [];

  if (!current) {
    if (wrap) wrap.hidden = true;
    body.innerHTML = "";
    if (totalEl) totalEl.textContent = formatEuro(0);
    return [];
  }

  const entries = getAncienneTourneeEntriesFor(current.id).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const total = getAncienneTourneeDette(current.id);
  if (totalEl) totalEl.textContent = formatEuro(total);

  if (!entries.length) {
    if (wrap) wrap.hidden = true;
    body.innerHTML = "";
    return [];
  }

  if (wrap) wrap.hidden = false;

  body.innerHTML = entries
    .map((entry) => {
      return `
      <article class="ancienne-tournee-row" id="ancienne-${escapeHtml(entry.id)}">
        <span class="ancienne-tournee-row-date">${formatDate(String(entry.createdAt).split("T")[0])}</span>
        <span class="ancienne-tournee-row-amount">${formatAncienneTourneeAmountHtml(entry)}</span>
        ${buildPaymentSignalControls("ancienne-tournee", entry.id, entry.amount, "Dette ancienne tournée", entry.memberId)}
      </article>`;
    })
    .join("");
  return entries;
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

  ancienneTourneeDettes.unshift({
    id: generateId(),
    memberId: member.id,
    amount: parsedAmount,
    originalAmount: parsedAmount,
    repaidAmount: 0,
    repayments: [],
    createdAt: new Date().toISOString(),
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
  if (!requireTabAccess("ancienne-tournee", "supprimer une dette d'ancienne tournée")) return;
  const entry = ancienneTourneeDettes.find((item) => item.id === entryId);
  if (!entry) return;
  const member = getMemberById(entry.memberId);
  if (!(await appConfirm(`Supprimer la dette de ${formatEuro(entry.amount)} de ${member?.name || "ce poto"} ?`))) {
    return;
  }
  ancienneTourneeDettes = ancienneTourneeDettes.filter((item) => item.id !== entryId);
  saveAncienneTourneeDettes();
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
    ancienneTourneeDettes = ancienneTourneeDettes.filter((item) => item.id !== entryId);
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
    const repaid = Math.round((Number(amende.repaidAmount) || 0) * 100) / 100;
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

function renderAmendeTable(rows) {
  if (!amendeBody) return;
  const foot = document.getElementById("amendeTableFoot");
  const remainingTotal = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const repaidTotal = rows.reduce((sum, row) => sum + (Number(row.repaid) || 0), 0);
  const originalTotal = rows.reduce((sum, row) => sum + (Number(row.original) || 0), 0);

  if (amendeRegularWrap) amendeRegularWrap.hidden = false;

  if (!rows.length) {
    amendeBody.innerHTML = `<tr class="amende-empty-row"><td colspan="7">Aucune amende pour le moment.</td></tr>`;
    if (foot) foot.innerHTML = "";
    return;
  }

  amendeBody.innerHTML = rows
    .map((row) => {
      const repaid = Number(row.repaid) || 0;
      const remaining = Number(row.remaining) || 0;
      const original = Number(row.original) || remaining + repaid;
      return `
        <tr id="amende-${escapeHtml(row.id)}" class="${row.settled ? "is-settled" : ""}">
          <td class="amende-col-date" data-label="Date">${escapeHtml(formatFriendlyDate(row.date))}</td>
          <td class="amende-col-type" data-label="Type">${escapeHtml(getAmendeTypeLabel(row.type))}</td>
          <td class="amende-col-detail" data-label="Détail">${escapeHtml(row.detail || "—")}</td>
          <td class="num amende-col-amount" data-label="Montant">${formatEuro(original)}</td>
          <td class="num amende-col-paid ${repaid > 0 ? "num-paid" : ""}" data-label="Déjà versé">${repaid > 0 ? formatEuro(repaid) : "—"}</td>
          <td class="num amende-col-remain num-remain ${remaining <= 0 ? "is-zero" : ""}" data-label="Reste">${formatEuro(remaining)}</td>
          <td class="amende-col-status" data-label="Statut">
            <span class="amende-chip ${row.settled ? "is-paid" : "is-open"}">${row.settled ? "Soldée" : "En cours"}</span>
          </td>
        </tr>`;
    })
    .join("");

  if (foot) {
    foot.innerHTML = `
      <tr>
        <td colspan="3">Total</td>
        <td class="num">${formatEuro(originalTotal)}</td>
        <td class="num num-paid">${formatEuro(repaidTotal)}</td>
        <td class="num num-remain">${formatEuro(remainingTotal)}</td>
        <td></td>
      </tr>`;
  }
}

function renderMesDettes() {
  const current = getCurrentMember();
  if (!current) return;
  const detteAmendes = getAmendesForMember(current.id).filter((amende) => isDetteAmende(amende));
  const ancienneEntries = renderAncienneTourneeMemberView();
  const openEvents = renderOpenEvenementDebts(current.id);
  const ancienneTotal = getAncienneTourneeDette(current.id);
  const openTotal = openEvents.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const eventDebtTotal = detteAmendes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const allItems = [
    ...detteAmendes,
    ...openEvents,
    ...ancienneEntries.map((entry) => ({ amount: entry.amount })),
  ];
  if (detteTitle) detteTitle.textContent = "Mes dettes";
  if (detteSubtitle) {
    detteSubtitle.hidden = false;
    detteSubtitle.innerHTML = buildDetteRepayHint();
  }
  renderDebtDashboard(detteSummary, allItems, "Tu n'as aucune dette pour le moment.", () => {
    const chips = [];
    if (detteAmendes.length) chips.push(`<span class="dette-pill type-dette">Dettes événements · ${formatEuro(eventDebtTotal)}</span>`);
    if (openEvents.length) chips.push(`<span class="dette-pill type-dette">À payer · ${formatEuro(openTotal)}</span>`);
    if (ancienneTotal > 0) chips.push(`<span class="dette-pill type-absence">Ancienne tournée · ${formatEuro(ancienneTotal)}</span>`);
    return chips;
  });
  renderDetteBanner(detteAmendes, false);
}

function renderMesAmendes() {
  const current = getCurrentMember();
  if (!current) return;
  const rows = buildMesAmendesRows(current.id);
  const total = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const openCount = rows.filter((row) => !row.settled).length;
  if (amendeTitle) amendeTitle.textContent = "Mes amendes";
  if (amendeSubtitle) {
    amendeSubtitle.hidden = false;
    amendeSubtitle.textContent = `Pour ${current.name} — consultation uniquement.`;
  }
  if (amendeSummary) {
    amendeSummary.className = `amende-hero ${total > 0 ? "is-due" : "is-clear"}`;
    amendeSummary.innerHTML = total > 0
      ? `
        <div class="amende-hero-copy">
          <p class="amende-hero-kicker">Total à régler</p>
          <strong class="amende-hero-amount">${formatEuro(total)}</strong>
          <p class="amende-hero-meta">${openCount} amende${openCount > 1 ? "s" : ""} en cours</p>
        </div>`
      : `
        <span class="amende-hero-mark" aria-hidden="true">✓</span>
        <div class="amende-hero-copy">
          <p class="amende-hero-kicker">Tout est à jour</p>
          <strong class="amende-hero-amount">0 €</strong>
          <p class="amende-hero-meta">Aucune amende à régler</p>
        </div>`;
  }
  renderAmendeTable(rows);
}

function renderAmendes() {
  renderMesDettes();
  renderMesAmendes();
}

function parseAmendeAmount(amount) {
  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
    alert("Montant invalide.");
    return null;
  }
  return parsedAmount;
}

function addAmende(memberId, type, amount, note) {
  if (!requireTabAccess("amendes", "ajouter des amendes")) return;

  const member = getMemberById(memberId);
  if (!member) return;

  const parsedAmount = parseAmendeAmount(amount);
  if (parsedAmount === null) return;

  amendes.unshift({
    id: generateId(),
    memberId,
    type,
    amount: parsedAmount,
    originalAmount: parsedAmount,
    repaidAmount: 0,
    note: note.trim(),
    date: new Date().toISOString(),
  });

  saveAmendes();
  amendeForm.reset();
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
    note: note.trim(),
  };

  saveAmendes();
  cancelEditAmende();
}

function applyDetteRemoval(amende, { restoreCaisse = false, markEventPaid = false, restoreAmount = null } = {}) {
  if (!isDetteAmende(amende) || !amende.evenementId) return false;

  const evt = getEvenementById(amende.evenementId);
  if (!evt) return false;
  const amount = restoreAmount != null ? Number(restoreAmount) : Number(amende.amount) || 0;

  if (evt.payments?.[amende.memberId]) {
    if (markEventPaid) {
      evt.payments[amende.memberId].paid = true;
      evt.payments[amende.memberId].paidAt = new Date().toISOString();
      evt.payments[amende.memberId].validatedBy = getCurrentMember()?.id || null;
      evt.payments[amende.memberId].paidAmount =
        (Number(evt.payments[amende.memberId].paidAmount) || 0) + amount;
      evt.payments[amende.memberId].debtRepaidAt = new Date().toISOString();
      delete evt.payments[amende.memberId].convertedToDebt;
      delete evt.payments[amende.memberId].debtCreatedAt;
    }
  }

  if (restoreCaisse && evt.caisseDebtDeduction) {
    evt.caisseDebtDeduction = Math.max(0, evt.caisseDebtDeduction - amount);
  }

  return true;
}

function validateDettePayment(amendeId) {
  repayAmende(amendeId);
}

function creditAmendeToCaisse(amende) {
  amendesCaisse.unshift({
    id: generateId(),
    sourceAmendeId: amende.id,
    memberId: amende.memberId,
    type: amende.type,
    amount: amende.amount,
    note: amende.note || "",
    paidAt: new Date().toISOString(),
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
        ? `Rembourser ${formatEuro(payAmount)} (${typeLabel.toLowerCase()} de ${member?.name || "ce poto"}) ?\nL'amende sera soldée et ${formatEuro(payAmount)} ira dans la caisse.`
        : `Rembourser ${formatEuro(payAmount)} sur ${formatEuro(remaining)} (${member?.name || "ce poto"}) ?\nIl restera ${formatEuro(nextRemaining)}.\n${formatEuro(payAmount)} ira dans la caisse.`
    ))
  ) {
    return;
  }

  if (editingAmendeId === id) cancelEditAmende();

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

  if (!amende.originalAmount) {
    amende.originalAmount = Math.round((remaining + (Number(amende.repaidAmount) || 0)) * 100) / 100;
  }
  amende.repaidAmount = Math.round(((Number(amende.repaidAmount) || 0) + payAmount) * 100) / 100;
  if (isFull && isDetteAmende(amende)) {
    amendes = amendes.filter((item) => item.id !== id);
  } else if (isFull) {
    amende.amount = 0;
    amende.settledAt = new Date().toISOString();
  } else {
    amende.amount = nextRemaining;
    delete amende.settledAt;
  }

  saveAmendes();
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  renderEvenements();
  renderFinanceDashboard();

  alert(
    isFull
      ? `Amende soldée — ${formatEuro(payAmount)} ajouté à la caisse.\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
      : `Remboursement enregistré — ${formatEuro(payAmount)} en caisse.\nReste dû : ${formatEuro(nextRemaining)}\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
  );
}

function validateAmendePayment(id) {
  repayAmende(id);
}

function deleteAmende(id) {
  deleteAmendeRecord(id);
}

async function deleteAmendeRecord(id) {
  if (!requireTabAccess("amendes", "supprimer une amende")) return;

  const amende = getAmendeById(id);
  if (!amende) return;

  const member = getMemberById(amende.memberId);
  const memberName = member?.name || "ce poto";
  if (
    !(await appConfirm(
      `Supprimer ${getAmendeTypeLabel(amende.type).toLowerCase()} de ${memberName} (${formatEuro(amende.amount)}) ?\nElle ne sera pas ajoutée à la caisse.`
    ))
  ) {
    return;
  }

  if (editingAmendeId === id) cancelEditAmende();

  if (isDetteAmende(amende)) {
    applyDetteRemoval(amende, { restoreCaisse: false, markEventPaid: false });
    localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));
  }

  amendes = amendes.filter((item) => item.id !== id);
  saveAmendes();
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  renderEvenements();
  renderFinanceDashboard();
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
  if (!openEl || !paidEl) return;

  const canSee = hasRoleTabAccess("amendes");
  if (panel) panel.hidden = !canSee;
  if (!canSee) {
    openEl.innerHTML = "";
    paidEl.innerHTML = "";
    return;
  }

  const openList = amendes
    .filter((amende) => (Number(amende.amount) || 0) > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const paidList = [...amendesCaisse].sort(
    (a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0)
  );

  openEl.innerHTML = openList.length
    ? openList
        .map((amende) => {
          const member = getMemberById(amende.memberId);
          return `
            <article class="ancienne-tournee-row amende-history-row" id="admin-amende-${escapeHtml(amende.id)}">
              <span class="ancienne-tournee-row-date">${formatFriendlyDate(amende.date)}</span>
              <span class="ancienne-tournee-row-poto">${escapeHtml(member?.name || "—")}</span>
              ${getAmendeTypeBadge(amende.type)}
              <span class="amende-history-note">${escapeHtml(amende.note || "—")}</span>
              <strong class="ancienne-tournee-row-amount">${formatEuro(amende.amount)}</strong>
              ${buildPaymentSignalStatusHtml(getLatestPaymentSignal(isDetteAmende(amende) ? "dette" : "amende", amende.id, amende.memberId))}
              ${buildAmendeActionControls(amende, { showEdit: true })}
            </article>
          `;
        })
        .join("")
    : `<p class="empty-cell">Aucune amende en cours.</p>`;

  paidEl.innerHTML = paidList.length
    ? paidList
        .map((entry) => {
          const member = getMemberById(entry.memberId);
          return `
            <article class="ancienne-tournee-row amende-history-row is-paid">
              <span class="ancienne-tournee-row-date">${formatFriendlyDate(entry.paidAt)}</span>
              <span class="ancienne-tournee-row-poto">${escapeHtml(member?.name || "—")}</span>
              ${getAmendeTypeBadge(entry.type)}
              <span class="amende-history-note">${escapeHtml(entry.note || "—")}</span>
              <strong class="ancienne-tournee-row-amount">${formatEuro(entry.amount)}</strong>
              <div class="ancienne-tournee-repay-controls amende-history-actions">
                <span class="fond-caisse-annuel-done">Encaissée</span>
                <button type="button" class="btn-secondary btn-amende-undo" data-id="${entry.id}">Annuler</button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="empty-cell">Aucun encaissement pour le moment.</p>`;
}

function loadPrets() {
  try {
    const data = localStorage.getItem(PRETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadNotifications() {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadPaymentSignals() {
  try {
    const data = localStorage.getItem(PAYMENT_SIGNALS_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePaymentSignals() {
  localStorage.setItem(PAYMENT_SIGNALS_KEY, JSON.stringify(paymentSignals));
}

function getLatestPaymentSignal(kind, itemId, memberId) {
  return paymentSignals.find(
    (signal) => signal.kind === kind && signal.itemId === itemId && signal.memberId === memberId
  ) || null;
}

function canOfferPaymentSignal(signal) {
  if (!signal) return true;
  if (signal.status === "will_pay") return true;
  const created = new Date(signal.createdAt).getTime();
  return Number.isFinite(created) && Date.now() - created >= PAYMENT_SIGNAL_COOLDOWN_MS;
}

function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return formatDate(String(iso).split("T")[0]);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(iso.split("T")[0])} · ${hh}h${mm}`;
}

function formatPaymentSignalStatus(signal) {
  if (!signal) return "";
  const label = signal.status === "paid" ? "Virement envoyé" : "Virement annoncé";
  return `${label} · ${formatDateTime(signal.createdAt)}`;
}

function buildPaymentSignalStatusHtml(signal) {
  if (!signal) return "";
  return `<p class="payment-signal-status payment-signal-${escapeHtml(signal.status)}">${escapeHtml(formatPaymentSignalStatus(signal))}${
    signal.note ? ` — ${escapeHtml(signal.note)}` : ""
  }</p>`;
}

function memberHasTabAccess(memberId, tabId) {
  if (isMemberAdmin(memberId)) return true;
  const role = getMemberRole(memberId);
  if (!role) return false;
  return getTabAllowedRoles(tabId).includes(role);
}

function getPaymentSignalRecipients(kind) {
  const tabByKind = {
    amende: "amendes",
    dette: "amendes",
    pret: "prets",
    "ancienne-tournee": "ancienne-tournee",
    evenement: "evenements",
  };
  const tabId = tabByKind[kind] || "caisse";
  const ids = new Set();
  if (roles.tresorier) ids.add(roles.tresorier);
  (adminIds || []).forEach((id) => ids.add(id));
  members.forEach((member) => {
    if (memberHasTabAccess(member.id, tabId)) ids.add(member.id);
  });
  const current = getCurrentMember();
  if (current) ids.delete(current.id);
  return [...ids].filter(Boolean);
}

function paymentSignalAdminTarget(kind) {
  if (kind === "pret") return { tab: "admin", admin: "prets" };
  if (kind === "ancienne-tournee") return { tab: "admin", admin: "ancienne-tournee" };
  if (kind === "evenement") return { tab: "admin", admin: "evenements" };
  return { tab: "admin", admin: "amendes" };
}

function paymentSignalElementId(kind, itemId) {
  if (kind === "pret") return `loan-${itemId}`;
  if (kind === "ancienne-tournee") return `ancienne-${itemId}`;
  if (kind === "evenement") return `evenement-${itemId}`;
  return `amende-${itemId}`;
}

function buildPaymentSignalControls(kind, itemId, amount, label, memberId) {
  const current = getCurrentMember();
  const signal = getLatestPaymentSignal(kind, itemId, memberId);
  const statusHtml = buildPaymentSignalStatusHtml(signal);
  const isOwner = current && current.id === memberId;
  if (!isOwner || isAdminWorkspace() || !canOfferPaymentSignal(signal)) {
    return statusHtml;
  }
  return `
    ${statusHtml}
    <button
      type="button"
      class="btn-secondary btn-payment-signal"
      data-kind="${escapeHtml(kind)}"
      data-item-id="${escapeHtml(itemId)}"
      data-amount="${escapeHtml(String(amount))}"
      data-label="${escapeHtml(label)}"
    >Prévenir le Financier</button>
  `;
}

let pendingPaymentSignal = null;

function openPaymentSignalModal({ kind, itemId, amount, label }) {
  const overlay = document.getElementById("paymentSignalModal");
  const summary = document.getElementById("paymentSignalSummary");
  const noteInput = document.getElementById("paymentSignalNote");
  if (!overlay) return;
  pendingPaymentSignal = { kind, itemId, amount: Number(amount) || 0, label: label || "paiement" };
  if (summary) {
    summary.textContent = `${label || "Paiement"} · ${formatEuro(pendingPaymentSignal.amount)}`;
  }
  if (noteInput) noteInput.value = "";
  overlay.classList.add("open");
}

function closePaymentSignalModal() {
  document.getElementById("paymentSignalModal")?.classList.remove("open");
  pendingPaymentSignal = null;
}

function sendPaymentSignal(status) {
  const current = getCurrentMember();
  if (!current || !pendingPaymentSignal) return;
  const { kind, itemId, amount, label } = pendingPaymentSignal;
  const existing = getLatestPaymentSignal(kind, itemId, current.id);
  if (existing) {
    const age = Date.now() - new Date(existing.createdAt).getTime();
    const upgradingToPaid = existing.status === "will_pay" && status === "paid";
    if (!upgradingToPaid && Number.isFinite(age) && age < PAYMENT_SIGNAL_COOLDOWN_MS) {
      alert("Le Financier a déjà été prévenu. Tu pourras renvoyer dans 12 h, ou dire « J'ai fait le virement » si c'est fait.");
      return;
    }
  }

  const note = String(document.getElementById("paymentSignalNote")?.value || "").trim().slice(0, 120);
  const signal = {
    id: generateId(),
    kind,
    itemId,
    memberId: current.id,
    amount,
    label,
    status,
    note,
    createdAt: new Date().toISOString(),
  };
  paymentSignals = paymentSignals.filter(
    (item) => !(item.kind === kind && item.itemId === itemId && item.memberId === current.id)
  );
  paymentSignals.unshift(signal);
  savePaymentSignals();

  const recipients = getPaymentSignalRecipients(kind);
  if (!recipients.length) {
    alert("Aucun Financier ou admin à prévenir pour le moment. Le signal est quand même enregistré.");
    closePaymentSignalModal();
    render();
    return;
  }

  const verb = status === "paid" ? "a viré" : "va virer";
  const title = status === "paid" ? "Virement envoyé" : "Virement à venir";
  const body = `${current.name} ${verb} ${formatEuro(amount)} (${label})${note ? ` — ${note}` : ""}`;
  const target = paymentSignalAdminTarget(kind);
  const url = `/?tab=${target.tab}&admin=${target.admin}&item=${encodeURIComponent(itemId)}`;

  recipients.forEach((memberId) => {
    addNotification(memberId, "payment_signal", itemId, body);
    if (notifications[0]) {
      notifications[0].kind = kind;
      notifications[0].admin = target.admin;
    }
    queuePushMessage(memberId, {
      title,
      body,
      url,
      tab: target.tab,
      admin: target.admin,
      loanId: kind === "pret" ? itemId : "",
      item: itemId,
      tag: `pay-${kind}-${itemId}`,
    });
  });
  saveNotifications(false);
  closePaymentSignalModal();
  render();
}

function savePrets(shouldRender = true) {
  localStorage.setItem(PRETS_KEY, JSON.stringify(prets));
  if (shouldRender) renderPrets();
}

function saveNotifications(shouldRender = true) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  if (shouldRender) renderPrets();
  flushPushMessages();
}

function getTotalAmendesInCaisse() {
  return amendesCaisse.reduce((sum, entry) => sum + entry.amount, 0);
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

/**
 * Caisse disponible : fond + amendes + dons − prêts sortis + remboursements.
 * Sert aux prêts (argent libre).
 */
function getCaisseDisponible() {
  return Math.max(0, getCaisseBase() + getTotalAutreArgent() + getLoansCashImpact());
}

/** Caisse total = caisse disponible + prêts sortis */
function getCaisseTotal() {
  return getCaisseDisponible() + getLoansCapitalOut();
}

function getPendingVoteLoan() {
  return prets.find((loan) => PENDING_VOTE_STATUSES.includes(loan.status)) || null;
}

function getBorrowerActiveLoan(memberId) {
  return prets.find((loan) => loan.borrowerId === memberId && BORROWER_ACTIVE_STATUSES.includes(loan.status)) || null;
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
  return prets.filter((loan) => loan.status === "active" || loan.status === "defaulted");
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
  return getSortedMembers().filter((member) => member.id !== borrowerId);
}

function getVoteStats(loan) {
  const voters = getLoanVoters(loan.borrowerId);
  let yesCount = 0;
  let noCount = 0;

  voters.forEach((voter) => {
    const vote = loan.votes[voter.id];
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

function getLoanById(id) {
  return prets.find((loan) => loan.id === id);
}

function getLoanBalance(loan) {
  const base = Math.max(0, loan.amount - (loan.totalRepaid || 0));
  return base + (loan.interestAmount || 0);
}

function getLoanDueDates(loan) {
  if (!loan.approvedAt) return null;
  const approved = new Date(loan.approvedAt);
  const month1 = new Date(approved);
  month1.setMonth(month1.getMonth() + 1);
  const month2 = new Date(approved);
  month2.setMonth(month2.getMonth() + 2);
  return { month1, month2 };
}

const pendingPushMessages = [];

function queuePushMessage(memberId, payload) {
  const current = getCurrentMember();
  if (!memberId || current?.id === memberId) return;
  const tab = payload.tab || "prets";
  const loanId = payload.loanId || "";
  const admin = payload.admin || "";
  const item = payload.item || "";
  const urlParams = new URLSearchParams();
  urlParams.set("tab", tab);
  if (admin) urlParams.set("admin", admin);
  if (loanId) urlParams.set("loan", loanId);
  if (item) urlParams.set("item", item);
  pendingPushMessages.push({
    memberId,
    title: payload.title || "Poto Timide",
    body: payload.body || "",
    url: payload.url || `/?${urlParams.toString()}`,
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
  notifications.unshift({
    id: generateId(),
    memberId,
    type,
    loanId,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
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

  getSortedMembers().forEach((member) => {
    if (member.id === loan.borrowerId) {
      upsertLoanNotification(
        member.id,
        loan.id,
        "loan_pending",
        `Demande en cours — votre prêt de ${amountLabel} est en vote.`
      );
      return;
    }

    addNotification(
      member.id,
      "loan_vote",
      loan.id,
      `${borrowerName} demande un prêt de ${amountLabel}. Votez Oui ou Non sous 24 h.`
    );
    queuePushMessage(member.id, {
      title: "Nouveau prêt à voter",
      body: `${borrowerName} demande un prêt de ${amountLabel}. Votez Oui ou Non sous 24 h.`,
      tab: "prets",
      loanId: loan.id,
      tag: `loan-vote-${loan.id}`,
    });
  });
}

function notifyFinancierForLoan(loan) {
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
  upsertLoanNotification(loan.borrowerId, loan.id, type, message);
}

function processLoanStatusUpdates() {
  const now = Date.now();
  let changed = false;

  prets.forEach((loan) => {
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
  saveNotifications(false);
  savePrets();
  pretForm.reset();
}

function votePret(loanId, vote) {
  const current = getCurrentMember();
  if (!current) return;

  const loan = getLoanById(loanId);
  if (!loan || loan.status !== "voting") return;
  if (loan.borrowerId === current.id) return;

  loan.votes[current.id] = vote === "yes" ? "yes" : "no";
  confirmVoterNotification(loan, current.id);

  const stats = getVoteStats(loan);
  if (stats.unanimousYes) {
    loan.status = "awaiting_financier";
    loan.autoApprovedByTimeout = false;
    finalizeVotePhaseNotifications(loan);
    notifyFinancierForLoan(loan);
    saveNotifications(false);
  } else {
    saveNotifications(false);
  }

  savePrets();
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
    updateLoanNotificationsOnDecision(loan, "approved");
  } else {
    loan.status = "rejected";
    loan.financierDecision = "rejected";
    loan.financierDecidedAt = new Date().toISOString();
    updateLoanNotificationsOnDecision(loan, "rejected");
  }

  saveNotifications(false);
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
  loan.repayments.push({
    id: generateId(),
    amount: parsedAmount,
    date: new Date().toISOString(),
    recordedBy: current?.id || null,
  });
  syncLoanRepaidFromHistory(loan);

  if (loan.status === "completed") {
    notifyBorrower(loan, "loan_completed", `Votre prêt de ${formatEuro(loan.amount)} est entièrement remboursé.`);
    saveNotifications(false);
  }

  savePrets();
  showPretSaveMessage(
    `${formatEuro(parsedAmount)} retournés dans la caisse. Caisse disponible : ${formatEuro(getCaisseDisponible())}.`
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

async function deletePret(loanId) {
  if (!canManagePretsActions()) {
    alert("Seul le Financier ou un administrateur peut supprimer un prêt.");
    return;
  }

  const loan = getLoanById(loanId);
  if (!loan) return;

  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "ce membre";

  if (
    !(await appConfirm(
      `Supprimer définitivement le prêt de ${borrowerName} (${formatEuro(loan.amount)}) ?`
    ))
  ) {
    return;
  }

  prets = prets.filter((item) => item.id !== loanId);
  notifications = notifications.filter((notif) => notif.loanId !== loanId);

  if (borrower) {
    addNotification(
      borrower.id,
      "loan_deleted",
      loanId,
      `Votre demande de prêt de ${formatEuro(loan.amount)} a été supprimée par le Financier.`
    );
  }

  saveNotifications(false);
  savePrets();
  if (typeof window.flushPotoServerSync === "function") {
    window.flushPotoServerSync();
  }
}

function isPretNotification(notif) {
  return Boolean(notif.loanId) || (notif.type && notif.type.startsWith("loan_")) || notif.type === "payment_signal";
}

function isPersonalNotificationFor(notif, memberId) {
  if (!notif || notif.memberId !== memberId) return false;
  if (notif.type === "payment_signal") return true;
  if (!isPretNotification(notif)) return false;

  if (notif.type === "loan_vote") return true;
  if (notif.type === "loan_financier") return true;

  if (
    notif.type === "loan_pending" ||
    notif.type === "loan_approved" ||
    notif.type === "loan_rejected" ||
    notif.type === "loan_deleted"
  ) {
    const loan = notif.loanId ? getLoanById(notif.loanId) : null;
    if (loan) return loan.borrowerId === memberId;
    return true;
  }

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

function deleteOwnNotification(notificationId) {
  const current = getCurrentMember();
  if (!current || !notificationId) return;

  const notif = notifications.find((item) => item.id === notificationId);
  if (!notif || notif.memberId !== current.id) {
    alert("Tu ne peux supprimer que tes propres notifications.");
    return;
  }

  notifications = notifications.filter((item) => item.id !== notificationId);
  saveNotifications(false);
  renderPretNotifications();
}

async function deleteAllOwnNotifications() {
  const current = getCurrentMember();
  if (!current) return;

  const mine = getPretNotificationsForMember(current.id);
  if (!mine.length) return;
  if (!(await appConfirm(`Supprimer tes ${mine.length} notification${mine.length > 1 ? "s" : ""} ?`))) return;

  notifications = notifications.filter((item) => item.memberId !== current.id);
  saveNotifications(false);
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
  const pendingVote = getPendingVoteLoan();
  const activeLoans = prets.filter((loan) => loan.status === "active" || loan.status === "defaulted");
  const activePretLabel = activeLoans.length === 1 ? "1 prêt" : `${activeLoans.length} prêts`;
  const activeTotal = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeLoansDetails = [...activeLoans]
    .sort((loanA, loanB) => {
      const nameA = getMemberById(loanA.borrowerId)?.name || "";
      const nameB = getMemberById(loanB.borrowerId)?.name || "";
      return nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
    })
    .map(
      (loan) => `
      <span class="pret-active-detail-item">
        <span class="pret-active-detail-name">${escapeHtml(getMemberById(loan.borrowerId)?.name || "—")}</span>
        <span class="pret-active-detail-amount">${formatEuro(loan.amount)}</span>
      </span>
    `
    )
    .join("");

  const fond = getFondCaisse();

  const evenementsTotal = getTotalEvenementsInCaisse();
  const donsTotal = getTotalAutreArgent();
  const amendesTotal = getTotalAmendesInCaisse();
  const loansOut = getLoansCapitalOut();
  const loansImpact = getLoansCashImpact();

  const fondCard = canViewFondCaisse()
    ? `<div class="pret-summary-card">
        <span class="pret-summary-label">Fond de caisse de départ</span>
        <strong>${formatEuro(fond)}</strong>
      </div>`
    : "";

  pretSummary.innerHTML = `
    <div class="pret-summary-card pret-summary-main">
      <span class="pret-summary-label">Argent empruntable</span>
      <strong class="pret-summary-amount">${formatEuro(borrowable)}</strong>
      <span class="pret-summary-formula">(Caisse disponible − ${formatEuro(CAISSE_RESERVE)}) ÷ 2</span>
    </div>
    <div class="pret-summary-card">
      <span class="pret-summary-label">Caisse disponible</span>
      <strong>${formatEuro(caisseDisponible)}</strong>
      <span class="pret-summary-formula">Amendes + dons ou aides − prêts sortis + remboursements</span>
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
      <span class="pret-summary-formula">Caisse disponible ${formatEuro(caisseDisponible)} + prêts ${formatEuro(loansOut)}</span>
    </div>
    ${
      pendingVote
        ? `<div class="pret-summary-card pret-summary-locked">
            <span class="pret-summary-label">Demande en vote</span>
            <strong>${escapeHtml(getMemberById(pendingVote.borrowerId)?.name || "—")}</strong>
            <span class="pret-summary-formula">${escapeHtml(getPretStatusLabel(pendingVote.status))} · ${formatEuro(pendingVote.amount)}</span>
          </div>`
        : ""
    }
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
  if (canDecidePrets()) return true;
  return isAdminWorkspace() && hasRoleTabAccess("prets");
}

function buildFinancierActions(loan) {
  if (!canManagePretsActions()) return "";

  const canApproveReject = PENDING_FINANCIER_STATUSES.includes(loan.status);

  return `
    <div class="pret-financier-controls">
      ${
        canApproveReject
          ? `<button type="button" class="btn-primary btn-pret-approve" data-loan-id="${loan.id}">Oui — Accorder</button>
             <button type="button" class="btn-secondary btn-pret-reject" data-loan-id="${loan.id}">Refuser</button>`
          : ""
      }
      <button type="button" class="btn-pret-delete" data-loan-id="${loan.id}">Supprimer</button>
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
    const myVote = current ? loan.votes[current.id] : null;
    voteSection = `
      <div class="pret-vote-stats">
        <span class="pret-stat pret-stat-yes">${stats.yesCount} Oui</span>
        <span class="pret-stat pret-stat-no">${stats.noCount} Non</span>
        <span class="pret-stat pret-stat-pending">${stats.pendingCount} en attente</span>
        <span class="pret-stat">Objectif : ${stats.voters.length}/${stats.voters.length} Oui</span>
      </div>
      <p class="pret-deadline">${formatRemainingTime(loan.deadlineAt)}</p>
      ${
        canVote && !myVote
          ? `<div class="pret-vote-actions">
              <button type="button" class="btn-pret-yes" data-loan-id="${loan.id}" data-vote="yes">Voter Oui</button>
              <button type="button" class="btn-pret-no" data-loan-id="${loan.id}" data-vote="no">Voter Non</button>
            </div>`
          : myVote
            ? `<p class="pret-my-vote">Votre vote : <strong>${myVote === "yes" ? "Oui" : "Non"}</strong></p>`
            : ""
      }
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
          ? `<p class="pret-due-dates">Échéance 80 % : ${formatDate(dueDates.month1.toISOString().split("T")[0])} · Solde : ${formatDate(dueDates.month2.toISOString().split("T")[0])}</p>`
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
      <p class="pret-loan-date">Demandé le ${formatDate(loan.createdAt.split("T")[0])}</p>
      ${voteSection}
      ${financierSection}
      ${activeSection}
      ${
        mode === "active" && balance > 0
          ? `<p class="pret-balance">Reste à payer : <strong>${formatEuro(balance)}</strong></p>
             ${buildPaymentSignalControls("pret", loan.id, balance, "Prêt à rembourser", loan.borrowerId)}`
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

  processLoanStatusUpdates();
  renderPretSummary();
  renderInitiatePretPanel();
  renderPretNotifications();

  const votingLoans = prets.filter((loan) => loan.status === "voting");
  const awaitingLoans = prets.filter((loan) => loan.status === "awaiting_financier");

  const activeLoans = prets.filter((loan) => ["active", "defaulted", "completed", "rejected"].includes(loan.status));

  if (pretVotingList) {
    pretVotingList.innerHTML = votingLoans.length
      ? votingLoans.map((loan) => buildLoanCard(loan, "voting")).join("")
      : `<p class="pret-empty">Aucune demande en vote.</p>`;
  }

  if (financierPretPanel && pretFinancierList) {
    financierPretPanel.hidden = !canDecidePrets();
    pretFinancierList.innerHTML = awaitingLoans.length
      ? awaitingLoans.map((loan) => buildLoanCard(loan, "financier")).join("")
      : `<p class="pret-empty">Aucune demande en attente.</p>`;
  }

  if (pretActiveList) {
    const visibleActive = activeLoans.filter((loan) => {
      if (canDecidePrets()) return true;
      return loan.borrowerId === current.id;
    });

    if (pretActiveTitle) {
      pretActiveTitle.textContent = canDecidePrets() ? "Prêts en cours et historique" : "Mes prêts";
    }

    pretActiveList.innerHTML = visibleActive.length
      ? visibleActive
          .map((loan) => {
            if (loan.status === "active" || loan.status === "defaulted") {
              return buildLoanCard(loan, "active");
            }
            return buildLoanCard(loan, "history");
          })
          .join("")
      : `<p class="pret-empty">Aucun prêt pour le moment.</p>`;
  }

  highlightLoanFromNotification();

  // Si l'admin regarde la gestion des prêts, rafraîchir aussi
  if (isAdminWorkspace() && activeAdminSub === "prets") {
    renderAdminPrets();
  }
}

function renderAdminPrets() {
  if (!hasRoleTabAccess("prets")) return;

  processLoanStatusUpdates();

  const summaryEl = document.getElementById("adminPretSummary");
  const votingEl = document.getElementById("adminPretVotingList");
  const awaitEl = document.getElementById("adminPretFinancierList");
  const activeEl = document.getElementById("adminPretActiveList");

  const caisseDisponible = getCaisseDisponible();
  const borrowable = getBorrowableAmount();
  const activeLoansLive = prets.filter((loan) => loan.status === "active" || loan.status === "defaulted");
  const votingLoans = prets.filter((loan) => loan.status === "voting");
  const awaitingLoans = prets.filter((loan) => loan.status === "awaiting_financier");
  const historyLoans = prets.filter((loan) =>
    ["active", "defaulted", "completed", "rejected"].includes(loan.status)
  );

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
    votingEl.innerHTML = votingLoans.length
      ? votingLoans.map((loan) => buildLoanCard(loan, "voting")).join("")
      : `<p class="pret-empty">Aucune demande en vote.</p>`;
  }

  if (awaitEl) {
    awaitEl.innerHTML = awaitingLoans.length
      ? awaitingLoans.map((loan) => buildLoanCard(loan, "financier")).join("")
      : `<p class="pret-empty">Aucune demande en attente de validation.</p>`;
  }

  if (activeEl) {
    activeEl.innerHTML = historyLoans.length
      ? historyLoans
          .map((loan) => {
            if (loan.status === "active" || loan.status === "defaulted") {
              return buildLoanCard(loan, "active");
            }
            return buildLoanCard(loan, "history");
          })
          .join("")
      : `<p class="pret-empty">Aucun prêt pour le moment.</p>`;
  }
}

function loadEvenements() {
  try {
    const data = localStorage.getItem(EVENEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveEvenements(shouldRender = true) {
  localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));
  if (shouldRender) {
    renderEvenements();
    renderPrets();
  }
}

function getEvenementTypeLabel(typeId) {
  return EVENEMENT_TYPES.find((t) => t.id === typeId)?.label || typeId;
}

function canManageEvenements() {
  return canManageTab("evenements");
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
  const share = getEvenementShare(evt);
  if (share <= 0) return [];

  const beneficiary = getMemberById(getEvenementBeneficiaryId(evt));
  const unpaidMembers = getEvenementUnpaidMembers(evt);
  const created = [];

  unpaidMembers.forEach((member) => {
    const alreadyExists = amendes.some(
      (amende) =>
        isDetteAmende(amende) &&
        amende.evenementId === evt.id &&
        amende.memberId === member.id
    );
    if (alreadyExists) return;

    const note = `Événement : ${evt.title}${beneficiary ? ` — Poto : ${beneficiary.name}` : ""}`;

    amendes.unshift({
      id: generateId(),
      memberId: member.id,
      type: "dette",
      amount: share,
      note,
      date: new Date().toISOString(),
      evenementId: evt.id,
      createdFromEvenement: true,
    });

    if (!evt.payments[member.id]) {
      evt.payments[member.id] = { paid: false, paidAt: null, validatedBy: null };
    }

    evt.payments[member.id].convertedToDebt = true;
    evt.payments[member.id].debtCreatedAt = new Date().toISOString();

    created.push(member);
  });

  return created;
}

function showEvenementSaveMessage(text, type = "success") {
  if (!evenementSaveMsg) return;
  evenementSaveMsg.textContent = text;
  evenementSaveMsg.className = `save-msg save-msg-${type}`;
  evenementSaveMsg.hidden = false;
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
  evenementForm.reset();
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
                 }
                 ${
                   !myPaid
                     ? buildPaymentSignalControls("evenement", evt.id, share, evt.title || "Événement", current.id)
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

  const memberRows = getSortedMembers()
    .map((member, index) => {
      const isBeneficiary = isEvenementBeneficiary(evt, member.id);
      const paid = isEvenementPaid(evt, member.id);
      const paidAmount = getEvenementPaidAmount(evt, member.id);
      const convertedToDebt = reimbursed && Boolean(evt.payments?.[member.id]?.convertedToDebt);
      const isCurrentUser = current?.id === member.id;

      return `
        <tr class="${isCurrentUser ? "row-current" : ""}">
          <td>
            <span class="table-num">#${index + 1}</span>
            ${escapeHtml(member.name)}
            ${isCurrentUser ? '<span class="tag-you">Vous</span>' : ""}
            ${isBeneficiary ? '<span class="tag-beneficiary">Poto concerné</span>' : ""}
          </td>
          <td>${isBeneficiary ? "—" : formatEuro(share)}</td>
          <td>
            ${
              isBeneficiary
                ? "—"
                : paid
                  ? `<strong>${formatEuro(paidAmount)}</strong>${paidAmount > share ? `<span class="evenement-extra-tag">+${formatEuro(paidAmount - share)}</span>` : ""}`
                  : convertedToDebt
                    ? formatEuro(share)
                    : "—"
            }
          </td>
          <td>
            ${
              isBeneficiary
                ? '<span class="evenement-status evenement-exempt">Ne cotise pas</span>'
                : convertedToDebt
                  ? '<span class="evenement-status evenement-debt">Dette</span>'
                  : `<span class="evenement-status ${paid ? "evenement-paid" : "evenement-unpaid"}">
                      ${paid ? "Payé" : "À payer"}
                    </span>`
            }
          </td>
          <td>
            ${
              isBeneficiary
                ? "—"
                : convertedToDebt
                  ? '<span class="evenement-debt-hint">Dettes et amendes</span>'
                  : buildEvenementPaymentActions(evt, member, canManage, reimbursed)
            }
          </td>
        </tr>
      `;
    })
    .join("");

  const collected = getEvenementCollectedAmount(evt);
  const potoReceivable = getEvenementPotoReceivable(evt);
  const potoBonus = Math.max(0, Math.round((collected - evt.totalAmount) * 100) / 100);
  const inCaisse = reimbursed ? 0 : collected;
  const unpaidCount = getEvenementUnpaidMembers(evt).length;

  const beneficiaryMeta = beneficiary
    ? `Pour <strong>${escapeHtml(beneficiary.name)}</strong> · `
    : "";

  return `
    <article class="evenement-card" id="admin-evenement-${escapeHtml(evt.id)}">
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
                  ? `<strong>${escapeHtml(beneficiary?.name || "Le poto")}</strong> percevra <strong>${formatEuro(potoReceivable)}</strong> — à remettre depuis la caisse brute.`
                  : unpaidCount > 0
                    ? "Aucun paiement collecté — les impayés seront enregistrés comme dettes."
                    : "Finaliser l'événement."
              }</p>
              <button type="button" class="btn-primary btn-evenement-reimburse" data-event-id="${evt.id}">Rembourser au poto</button>
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
      <div class="table-wrap">
        <table class="cotisation-table evenement-table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Cotisation</th>
              <th>Montant payé</th>
              <th>Statut</th>
              ${canManage ? "<th>Action</th>" : ""}
            </tr>
          </thead>
          <tbody>${memberRows}</tbody>
        </table>
      </div>
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

function renderEvenementListInto(listEl, { manage = false } = {}) {
  if (!listEl) return;

  if (evenements.length === 0) {
    listEl.innerHTML = `<p class="pret-empty">Aucun événement pour le moment.</p>`;
    return;
  }

  const activeEvents = evenements.filter((evt) => !isEvenementClosed(evt));
  const closedEvents = evenements.filter((evt) => isEvenementClosed(evt));

  const activeHtml = activeEvents.length
    ? activeEvents.map((evt) => buildEvenementCard(evt, { manage })).join("")
    : `<p class="pret-empty evenement-empty-active">Aucun événement en cours.</p>`;

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

  listEl.innerHTML = `
    <div class="evenement-layout${closedEvents.length ? " evenement-layout-has-closed" : ""}">
      <div class="evenement-list-active">${activeHtml}</div>
      ${closedHtml}
    </div>
  `;
}

function renderEvenements() {
  const current = getCurrentMember();
  if (!current) return;

  const canManage = canManageEvenements();

  if (evenementListTitle) {
    evenementListTitle.textContent = `Mes événements — ${current.name}`;
  }
  if (evenementListSubtitle) {
    evenementListSubtitle.hidden = true;
    evenementListSubtitle.textContent = "";
  }

  if (evenementMemberSummary) {
    if (evenements.length > 0) {
      evenementMemberSummary.hidden = false;
      evenementMemberSummary.innerHTML = buildEvenementMemberSummary(current);
    } else {
      evenementMemberSummary.hidden = true;
      evenementMemberSummary.innerHTML = "";
    }
  }

  if (resetClosedEvenementsBtn) {
    const closedCount = evenements.filter((evt) => isEvenementClosed(evt)).length;
    resetClosedEvenementsBtn.hidden = !canManage || !isGroupAdmin() || closedCount === 0;
    resetClosedEvenementsBtn.textContent =
      closedCount > 0
        ? `Réinitialiser les clôturés (${closedCount})`
        : "Réinitialiser les clôturés";
  }

  renderEvenementListInto(evenementList, { manage: false });
  renderEvenementListInto(document.getElementById("evenementAdminList"), { manage: canManage });
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
  renderAdminList();
  if (canAccessCaisse()) renderAutreArgent();
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
  if (autreArgentForm) autreArgentForm.reset();
  showAutreArgentSaveMessage(
    `${formatEuro(parsedAmount)} retiré de la caisse disponible (${member.name} — ${motifLabel}).`
  );
  autreArgentListPanel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function deleteAutreArgent(entryId) {
  if (!requireCaisseArgentAccess("supprimer une entrée d'autre argent")) return;

  const entry = autreArgent.find((item) => item.id === entryId);
  if (!entry) return;

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

  autreArgent = autreArgent.filter((item) => item.id !== entryId);
  saveAutreArgent();
  showAutreArgentSaveMessage(
    isWithdraw
      ? "Retrait supprimé — le montant est remis dans la caisse disponible."
      : "Entrée supprimée — montant retiré de la caisse disponible."
  );
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

  autreArgentList.innerHTML = autreArgent.length
    ? [...autreArgent]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((entry) => {
          const member = getMemberById(entry.memberId);
          const isWithdraw = isAutreArgentRetrait(entry);
          const typeLabel = isWithdraw ? "Retrait" : "Don ou aide";
          return `
            <tr class="${isWithdraw ? "autre-argent-retrait" : "autre-argent-entree"}">
              <td>${formatDate(entry.createdAt.split("T")[0])}</td>
              <td><span class="autre-argent-type ${isWithdraw ? "is-out" : "is-in"}">${escapeHtml(typeLabel)}</span></td>
              <td>${escapeHtml(member?.name || "Le groupe")}</td>
              <td>${entry.note ? escapeHtml(entry.note) : isWithdraw ? "Sortie" : "Don ou aide"}</td>
              <td><strong>${isWithdraw ? "− " : "+ "}${formatEuro(Math.abs(getEntryAmount(entry)))}</strong></td>
              <td>
                <button type="button" class="btn-secondary btn-autre-argent-delete" data-id="${escapeHtml(entry.id)}">Supprimer</button>
              </td>
            </tr>
          `;
        })
        .join("")
    : `
      <tr>
        <td colspan="6" class="empty-cell">Aucun mouvement pour le moment.</td>
      </tr>
    `;
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

async function clearRole(roleId) {
  if (!requireTabAccess("bureau", "modifier le bureau")) return;

  const member = getMemberById(roles[roleId]);
  if (!member) return;

  if (await appConfirm(`Retirer « ${member.name} » du poste de ${getRoleLabel(roleId)} ?`)) {
    delete roles[roleId];
    saveRoles();
  }
}

async function addMember(name) {
  if (!requireTabAccess("membres", "ajouter des membres")) return;

  const trimmed = name.trim();
  if (!trimmed) return;

  if (isLimitReached()) {
    alert(`Maximum de ${MAX_MEMBERS} membres atteint.`);
    return;
  }

  if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
    alert("Ce membre existe déjà.");
    return;
  }

  const newMember = {
    id: generateId(),
    name: trimmed,
    createdAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveMembers();

  if (authState.loggedIn) {
    try {
      if (typeof potoFlushSync === "function") await potoFlushSync();
      const result = await apiEnsureMemberUser(newMember.id);
      if (result?.created) {
        alert(`${trimmed} peut se connecter avec le mot de passe : 1234`);
      }
    } catch (err) {
      console.warn("Compte non créé immédiatement :", err.message);
      alert(
        `Membre ajouté, mais le compte n'a pas pu être créé tout de suite.\nRéessayez ou réinitialisez le mot de passe depuis la liste.`
      );
    }
  } else {
    alert(
      `${trimmed} est enregistré localement. Connectez-vous en admin pour activer son compte (mot de passe : 1234).`
    );
  }

  memberForm.reset();
  memberNameInput.focus();
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

    if (key === TOURNEE_BOUFFE_OK_KEY || key === TOURNEE_RECEPTION_DATES_KEY) {
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
  localStorage.setItem(ADMIN_IDS_KEY, JSON.stringify(adminIds));
  localStorage.setItem(AUTRE_ARGENT_KEY, JSON.stringify(autreArgent));
  localStorage.setItem(ANCIENNE_TOURNEE_DETTES_KEY, JSON.stringify(ancienneTourneeDettes));
  localStorage.setItem(FOND_CAISSE_ANNUEL_KEY, JSON.stringify(fondCaisseAnnuel));
}

async function deleteMember(id) {
  if (!requireTabAccess("membres", "supprimer des membres")) return;

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
  addMember(memberNameInput.value);
});

roleForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const memberId = roleMemberSelect.value;
  const roleId = rolePostSelect.value;
  if (!memberId || !roleId) return;
  assignRole(memberId, roleId);
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

financeSubtabs?.addEventListener("click", (e) => {
  const btn = e.target.closest(".finance-subtab");
  if (!btn?.dataset.financeSub) return;
  showFinanceSub(btn.dataset.financeSub);
});

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

// Financier / Admin : marquer OK (tournée déjà prise / bouffe)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-bouffe-ok");
  if (!btn) return;
  e.preventDefault();
  const memberId = btn.dataset.memberId;
  if (memberId) toggleTourneeBouffeOk(memberId);
});

saveTabPermissionsBtn?.addEventListener("click", saveTabPermissionsFromUI);

amendeForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const payload = {
    memberId: amendeMemberSelect.value,
    type: amendeTypeSelect.value,
    amount: amendeAmountInput.value,
    note: amendeNoteInput.value,
  };

  if (editingAmendeId) {
    updateAmende(editingAmendeId, payload.memberId, payload.type, payload.amount, payload.note);
  } else {
    addAmende(payload.memberId, payload.type, payload.amount, payload.note);
  }
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
  if (item.dataset.type === "payment_signal") {
    openFromNotification({
      tab: "admin",
      admin: item.dataset.admin || "amendes",
      item: item.dataset.loanId || "",
      loanId: item.dataset.admin === "prets" ? item.dataset.loanId : "",
    });
    return;
  }
  const loanId = item.dataset.loanId;
  if (loanId) openFromNotification({ tab: "prets", loanId });
});

document.getElementById("pretNotificationsClearBtn")?.addEventListener("click", deleteAllOwnNotifications);

document.addEventListener("click", (e) => {
  const signalBtn = e.target.closest(".btn-payment-signal");
  if (!signalBtn) return;
  openPaymentSignalModal({
    kind: signalBtn.dataset.kind,
    itemId: signalBtn.dataset.itemId,
    amount: signalBtn.dataset.amount,
    label: signalBtn.dataset.label,
  });
});

document.getElementById("paymentSignalCancel")?.addEventListener("click", () => closePaymentSignalModal());
document.getElementById("paymentSignalWillPay")?.addEventListener("click", () => sendPaymentSignal("will_pay"));
document.getElementById("paymentSignalPaid")?.addEventListener("click", () => sendPaymentSignal("paid"));
document.getElementById("paymentSignalModal")?.addEventListener("click", (e) => {
  if (e.target.id === "paymentSignalModal") closePaymentSignalModal();
});
document.getElementById("paymentSignalForm")?.addEventListener("submit", (e) => e.preventDefault());

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
  const row = btn.closest(".fond-caisse-annuel-row");
  const input = row?.querySelector(".fond-caisse-annuel-pay-input");
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

  if (yesBtn) votePret(yesBtn.dataset.loanId, "yes");
  if (noBtn) votePret(noBtn.dataset.loanId, "no");

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

document.getElementById("tab-prets")?.addEventListener("click", handlePretActionClick);
document.getElementById("tab-admin")?.addEventListener("click", handlePretActionClick);

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
  if (deleteBtn) deleteAncienneTourneeDette(deleteBtn.dataset.id);
}

function handleAncienneTourneeKeydown(e) {
  if (e.key !== "Enter") return;
  const input = e.target.closest(".ancienne-tournee-repay-input");
  if (!input) return;
  e.preventDefault();
  repayAncienneTourneeDette(input.dataset.id, input.value);
}

document.getElementById("adminSub-ancienne-tournee")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("tab-dettes")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("adminSub-ancienne-tournee")?.addEventListener("keydown", handleAncienneTourneeKeydown);
document.getElementById("tab-dettes")?.addEventListener("keydown", handleAncienneTourneeKeydown);

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

  try {
    await checkServerSession();
  } catch (err) {
    console.error(err);
    reloadFromStorage();
    openLoginModal();
    loginError.textContent =
      "Serveur indisponible — vos données locales sont conservées. Reconnectez-vous.";
    loginError.hidden = false;
    appReady = true;
    updateSessionUI();
    render();
    showTab(getSavedTab());
    return;
  }

  if (authState.loggedIn) {
    await restoreLoggedInApp();
  } else {
    openLoginModal();
  }

  window.potoOnServerDataPulled = () => {
    reloadFromStorage();
    updatePretTabBadge();
    renderAncienneTourneeMemberView();
    renderAncienneTourneeDettesAdmin();
    renderEvenements();
    renderAmendes();
    renderFinanceDashboard();
    renderFondCaisseAnnuel();
    if (document.getElementById("tab-prets")?.classList.contains("active")) {
      renderPrets();
    }
    if (document.getElementById("tab-dettes")?.classList.contains("active")) {
      renderMesDettes();
    }
    if (document.getElementById("tab-amendes")?.classList.contains("active")) {
      renderMesAmendes();
    }
    if (document.getElementById("tab-admin")?.classList.contains("active")) {
      if (activeAdminSub === "ancienne-tournee") renderAncienneTourneeDettesAdmin();
      if (activeAdminSub === "caisse") {
        renderFondCaissePanel();
        renderAutreArgent();
      }
    }
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
  if (tab) sessionStorage.setItem("poto-open-tab", tab);
  if (loan) sessionStorage.setItem("poto-open-loan", loan);
}

function openFromNotification({ tab = "prets", admin = "", loanId = "", item = "" } = {}) {
  if (admin) sessionStorage.setItem("poto-open-admin", admin);
  if (item) sessionStorage.setItem("poto-open-item", item);
  if (tab) {
    sessionStorage.setItem("poto-open-tab", tab);
    showTab(tab);
  }
  if (admin && tab === "admin") showAdminSub(admin);
  if (loanId) {
    sessionStorage.setItem("poto-open-loan", loanId);
    highlightLoanFromNotification();
  }
  highlightNotificationItem();
}

function applyNotificationDeepLink() {
  const params = new URLSearchParams(location.search);
  const tab = sessionStorage.getItem("poto-open-tab") || params.get("tab");
  const admin = sessionStorage.getItem("poto-open-admin") || params.get("admin");
  const item = sessionStorage.getItem("poto-open-item") || params.get("item");
  const loanId = sessionStorage.getItem("poto-open-loan") || params.get("loan");
  if (admin) sessionStorage.setItem("poto-open-admin", admin);
  if (item) sessionStorage.setItem("poto-open-item", item);
  if (tab) {
    sessionStorage.removeItem("poto-open-tab");
    showTab(tab);
  }
  if (admin && (tab === "admin" || getActiveMainTab() === "admin")) {
    sessionStorage.removeItem("poto-open-admin");
    showAdminSub(admin);
  }
  if (loanId) {
    sessionStorage.setItem("poto-open-loan", loanId);
    highlightLoanFromNotification();
  }
  highlightNotificationItem();
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
    document.getElementById(`loan-${item}`);
  if (!target) return;
  sessionStorage.removeItem("poto-open-item");
  target.classList.add("is-notif-target");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => target.classList.remove("is-notif-target"), 4000);
}

function highlightLoanFromNotification() {
  const loanId = sessionStorage.getItem("poto-open-loan") || new URLSearchParams(location.search).get("loan");
  if (!loanId) return;
  const card = document.getElementById(`loan-${loanId}`);
  const fallback = document.getElementById("pretVotingList");
  const target = card || fallback;
  if (!target) return;
  sessionStorage.removeItem("poto-open-loan");
  target.classList.add("is-notif-target");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => target.classList.remove("is-notif-target"), 4000);
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

initApp();