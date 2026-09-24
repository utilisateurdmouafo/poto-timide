const STORAGE_KEY = "poto-timide-members";
const ROLES_KEY = "poto-timide-roles";
const COTISATIONS_KEY = "poto-timide-cotisations";
const TOURNEE_KEY = "poto-timide-tournee";
const TOURNEE_PARTNERS_KEY = "partners";
/** Membres ayant déjà « bouffé » / pris leur tournée (legacy → migré vers receptionOk) */
const TOURNEE_BOUFFE_OK_KEY = "bouffeOk";
/** OK : le poto a reçu sa tournée */
const TOURNEE_RECEPTION_OK_KEY = "receptionOk";
/** OK : le poto a reçu sa ristourne */
const TOURNEE_RISTOURNE_OK_KEY = "ristourneOk";
/** Date de réception choisie par membre (YYYY-MM-DD) — conservé, plus affiché */
const TOURNEE_RECEPTION_DATES_KEY = "receptionDates";
/** Ordre de réception / ristourne : { "8": [memberIds], ... } */
const TOURNEE_RECEPTION_KEY = "reception";
const TOURNEE_RISTOURNE_KEY = "ristourne";
const TOURNEE_META_KEYS = new Set([
  TOURNEE_PARTNERS_KEY,
  TOURNEE_BOUFFE_OK_KEY,
  TOURNEE_RECEPTION_OK_KEY,
  TOURNEE_RISTOURNE_OK_KEY,
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

const EVENEMENTS_KEY = "poto-timide-evenements";
const COMMUNICATION_KEY = "poto-timide-communication";
const AUDIT_LOG_KEY = "poto-timide-audit-log";
const AUDIT_LOG_MAX = 250;
const LOGIN_LOG_KEY = "poto-timide-login-log";
const LOGIN_LOG_MAX = 2000;
let loginLog = [];
const COMMUNICATION_SUBTAB_KEY = "poto-timide-communication-subtab";
const ADMIN_IDS_KEY = "poto-timide-admin-ids";
const AUTRE_ARGENT_KEY = "poto-timide-autre-argent";
const ANCIENNE_TOURNEE_DETTES_KEY = "poto-timide-ancienne-tournee-dettes";
const FOND_CAISSE_KEY = "poto-timide-fond-caisse";
const CAPITAL_HORS_GROUPE_KEY = "poto-timide-capital-hors-groupe";
const FOND_CAISSE_ANNUEL_KEY = "poto-timide-fond-caisse-annuel";
const FINANCIER_ACCOUNT_KEY = "poto-timide-financier-account";
const FINANCE_KEY = "poto-timide-finance";
const FINANCE_SUBTAB_KEY = "poto-timide-finance-subtab";
const SESSION_KEY = "poto-timide-session";
const ACTIVE_TAB_KEY = "poto-timide-active-tab";
const TAB_IDS = ["reunion", "communication", "membres", "tournee", "prets", "evenements", "amendes", "finance", "loi", "admin"];
const LOI_KEY = "poto-timide-loi";
const GUIDE_KEY = "poto-timide-guide";
const COMMUNICATION_KINDS = [
  {
    id: "communique",
    label: "Communiqué",
    singular: "communiqué",
    composerTitle: "Publier un communiqué",
    titlePlaceholder: "Ex : Information aux potos",
    bodyPlaceholder: "Texte du communiqué…",
  },
  {
    id: "ordre-du-jour",
    label: "Ordre du jour",
    singular: "ordre du jour",
    composerTitle: "Publier l'ordre du jour",
    titlePlaceholder: "Ex : Réunion du 12 avril",
    bodyPlaceholder: "1. Accueil\n2. Point caisse\n3. …",
  },
  {
    id: "rapport",
    label: "Rapports de réunions",
    singular: "rapport",
    composerTitle: "Publier un rapport de réunion",
    titlePlaceholder: "Ex : Réunion du 15 mars",
    bodyPlaceholder: "Compte rendu : présents, décisions, suites à donner…",
  },
  {
    id: "guide",
    label: "Guide site",
    singular: "article du guide",
    composerTitle: "Ajouter un article du guide",
    titlePlaceholder: "Ex : Comment demander un prêt",
    bodyPlaceholder: "Explications pour les membres…",
  },
];
const FINANCE_SUBTABS = ["caisse", "archives"];
const FINANCE_LIVE_DETTE_SUB = "dettes-amendes";
const FINANCE_CAISSE_SUB = "caisse";
const FINANCE_ARCHIVES_SUB = "archives";
const ADMIN_SUBTABS = ["membres", "admins", "acces", "tournee", "caisse", "prets", "amendes", "evenements", "communication", "loi", "sauvegarde", "connexions"];
const ADMIN_HUB_ITEMS = [
  { id: "membres", label: "Membres & Bureau", tone: "navy" },
  { id: "admins", label: "Admins", tone: "navy" },
  { id: "acces", label: "Accès", tone: "teal" },
  { id: "tournee", label: "Tournée", tone: "green" },
  { id: "caisse", label: "Caisse", tone: "teal" },
  { id: "prets", label: "Prêts", tone: "warn" },
  { id: "amendes", label: "Dettes & amendes", tone: "danger" },
  { id: "evenements", label: "Événements", tone: "warn" },
  { id: "communication", label: "Communication", tone: "navy" },
  { id: "loi", label: "La loi", tone: "navy" },
  { id: "sauvegarde", label: "Sauvegarde", tone: "navy" },
  { id: "connexions", label: "Connexions", tone: "teal" },
];
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
  { id: "membres", label: "Membres & Bureau" },
  { id: "tournee", label: "Tournée" },
  { id: "caisse", label: "Caisse" },
  { id: "prets", label: "Prêts" },
  { id: "amendes", label: "Dettes & amendes" },
  { id: "evenements", label: "Événements" },
  { id: "communication", label: "Communication" },
  { id: "loi", label: "La loi" },
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
  communication: ["president", "vice-president"],
  loi: [],
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
const memberKindSelect = document.getElementById("memberKind");
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
const detteBody = document.getElementById("detteBody");
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
const communicationSubtabs = document.getElementById("communicationSubtabs");
const communicationForm = document.getElementById("communicationForm");
const communicationTitleInput = document.getElementById("communicationTitle");
const communicationBodyInput = document.getElementById("communicationBody");
const communicationSubmitBtn = document.getElementById("communicationSubmitBtn");
const communicationCancelBtn = document.getElementById("communicationCancelBtn");
const communicationComposer = document.getElementById("communicationComposer");
const communicationComposerTitle = document.getElementById("communicationComposerTitle");
const communicationList = document.getElementById("communicationList");
const communicationAdminList = document.getElementById("communicationAdminList");
const adminCommunicationSubtabs = document.getElementById("adminCommunicationSubtabs");
const communicationLockMsg = document.getElementById("communicationLockMsg");
const communicationSaveMsg = document.getElementById("communicationSaveMsg");
const loiForm = document.getElementById("loiForm");
const loiTitleInput = document.getElementById("loiTitle");
const loiBodyInput = document.getElementById("loiBody");
const loiSubmitBtn = document.getElementById("loiSubmitBtn");
const loiCancelBtn = document.getElementById("loiCancelBtn");
const loiComposer = document.getElementById("loiComposer");
const loiComposerTitle = document.getElementById("loiComposerTitle");
const loiList = document.getElementById("loiList");
const loiAdminList = document.getElementById("loiAdminList");
const loiSearchInput = document.getElementById("loiSearchInput");
const loiSearchMeta = document.getElementById("loiSearchMeta");
const loiSaveMsg = document.getElementById("loiSaveMsg");
let loiSearchQuery = "";
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
let evenements = [];
let communicationPosts = [];
let loiArticles = [];
let guideArticles = [];
let editingGuideId = null;
let guideSearchQuery = "";
let editingLoiId = null;
let activeCommunicationSub = "communique";
let editingCommunicationId = null;
let autreArgent = [];
let capitalHorsGroupe = [];
let ancienneTourneeDettes = [];
let fondCaisse = DEFAULT_FOND_CAISSE;
let fondCaisseAnnuel = { years: {} };
const DEFAULT_FINANCIER_ACCOUNT = {
  iban: "BE76063676212495",
  holder: "Quenton Fozing",
  bank: "ING",
};
let financierAccount = { ...DEFAULT_FINANCIER_ACCOUNT };
let financeData = null;
let activeFinanceSub = FINANCE_ARCHIVES_SUB;
let activeAdminSub = null; // null = hub admin
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

function unwrapSynced(parsed, fallback) {
  if (parsed == null) return fallback;
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    Object.prototype.hasOwnProperty.call(parsed, "data") &&
    parsed.updatedAt
  ) {
    return parsed.data;
  }
  return parsed;
}

function readSynced(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === "") return fallback;
    return unwrapSynced(JSON.parse(raw), fallback);
  } catch {
    return fallback;
  }
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
    const parsed = readSynced(STORAGE_KEY, null);
    if (Array.isArray(parsed)) return migrateDariosToDario(parsed);
  } catch {
    /* ignore corrupted storage */
  }
  return getDefaultMembers();
}

function loadAdminIds() {
  try {
    const parsed = readSynced(ADMIN_IDS_KEY, []);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.ids)) return parsed.ids;
  } catch {
    /* ignore corrupted storage */
  }
  return [];
}

function saveAdminIds(shouldRender = true) {
  localStorage.setItem(
    ADMIN_IDS_KEY,
    JSON.stringify({
      ids: adminIds,
      updatedAt: new Date().toISOString(),
    })
  );
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
  if (members.length) {
    adminIds = adminIds.filter((id) => members.some((member) => member.id === id));
  }
  ensureOwnerAdmin();
}

function ensureOwnerAdmin() {
  const owner = getOwnerMember();
  if (!owner) return;
  if (!adminIds.includes(owner.id)) {
    adminIds = [owner.id, ...adminIds.filter((id) => id !== owner.id)];
  }
}

function isMemberAdmin(memberId) {
  if (isOwnerMember(memberId)) return true;
  return adminIds.includes(memberId);
}

function loadAutreArgent() {
  const parsed = readSynced(AUTRE_ARGENT_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function loadAncienneTourneeDettes() {
  try {
    const raw = readSynced(ANCIENNE_TOURNEE_DETTES_KEY, []);
    if (Array.isArray(raw)) {
      // Garder les tombstones (deletedAt) pour la synchro merge-by-id
      return raw
        .filter((entry) => entry && entry.memberId && entry.id)
        .map((entry) => {
          const amount = Number(entry.amount) || 0;
          const repaid = Number(entry.repaidAmount) || 0;
          const original =
            Number(entry.originalAmount) > 0
              ? Number(entry.originalAmount)
              : amount + repaid || amount;
          const out = {
            id: String(entry.id),
            memberId: entry.memberId,
            amount: entry.deletedAt ? 0 : amount,
            originalAmount: original,
            repaidAmount: repaid,
            repayments: Array.isArray(entry.repayments) ? entry.repayments : [],
            note: String(entry.note || ""),
            createdAt: entry.createdAt || new Date().toISOString(),
            createdBy: entry.createdBy || null,
            updatedAt: entry.updatedAt || entry.deletedAt || entry.createdAt || null,
          };
          if (entry.deletedAt) {
            out.deletedAt = entry.deletedAt;
            out.amount = 0;
          }
          return out;
        });
    }
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return Object.entries(raw)
        .filter(([, value]) => Number(value) > 0)
        .map(([memberId, amount]) => ({
          id: generateId(),
          memberId,
          amount: Number(amount),
          originalAmount: Number(amount),
          repaidAmount: 0,
          repayments: [],
          note: "",
          createdAt: new Date().toISOString(),
          createdBy: null,
          updatedAt: new Date().toISOString(),
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
    renderAmendes();
    renderMesDettes();
    if (typeof renderExTournee === "function") renderExTournee();
    if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
    if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  }
}

function getAncienneTourneeEntriesFor(memberId) {
  return ancienneTourneeDettes.filter(
    (entry) => entry.memberId === memberId && !entry.deletedAt
  );
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
  const parsed = readSynced(FINANCE_KEY, null);
  return parsed && typeof parsed === "object" ? parsed : null;
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
    .filter((loan) => !isLoanDeleted(loan) && ["active", "defaulted", "completed"].includes(loan.status))
    .reduce((sum, loan) => sum + (loan.totalRepaid || 0), 0);

  const entrees = fond + fondAnnuel + amendes + dons + evenementsCollectes + remboursementsPrets;

  const pretsAccordes = prets
    .filter((loan) => !isLoanDeleted(loan) && ["active", "defaulted", "completed"].includes(loan.status))
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

function buildLedgerDataRowHtml(row, rowIdPrefix, hasActions) {
  const repaid = Number(row.repaid) || 0;
  const remaining = Number(row.remaining) || 0;
  const original = Number(row.original) || remaining + repaid;
  const dateText = row.dateLabel || formatAdaptiveDate(row.date);
  const statusLabel = row.statusLabel || (row.settled ? "Soldée" : "En cours");
  const chipClass = row.chipClass || (row.settled ? "is-paid" : "is-open");
  const rowId = row.domId || `${rowIdPrefix}-${row.id}`;
  const extraRow = row.extraRow
    ? `<tr class="amende-detail-row${row.extraRowManage ? " amende-detail-row-manage" : ""}"><td colspan="${hasActions ? 8 : 7}">${row.extraRow}</td></tr>`
    : "";
  return `
    <tr id="${escapeHtml(String(rowId))}" class="${row.settled ? "is-settled" : ""} ${row.rowClass || ""}">
      <td class="amende-col-date" data-label="Date">${escapeHtml(dateText)}</td>
      <td class="amende-col-type" data-label="Type">${escapeHtml(row.typeLabel || getAmendeTypeLabel(row.type))}</td>
      <td class="amende-col-detail" data-label="Détail">${escapeHtml(row.detail || "—")}</td>
      <td class="num amende-col-amount" data-label="Montant">${formatEuro(original)}</td>
      <td class="num amende-col-paid ${repaid > 0 ? "num-paid" : ""}" data-label="Déjà versé">${repaid > 0 ? formatEuro(repaid) : "—"}</td>
      <td class="num amende-col-remain num-remain ${remaining <= 0 ? "is-zero" : ""}" data-label="Reste">${formatEuro(remaining)}</td>
      <td class="amende-col-status" data-label="Statut">
        <span class="amende-chip ${chipClass}">${escapeHtml(statusLabel)}</span>
      </td>
      ${hasActions ? `<td class="amende-col-actions" data-label="Actions">${row.actions || "—"}</td>` : ""}
    </tr>${extraRow}`;
}

function buildLedgerFootHtml(rows, hasActions) {
  if (!rows.length) return "";
  const remainingTotal = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const repaidTotal = rows.reduce((sum, row) => sum + (Number(row.repaid) || 0), 0);
  const originalTotal = rows.reduce((sum, row) => sum + (Number(row.original) || 0), 0);
  return `
    <tr>
      <td colspan="3">Total</td>
      <td class="num">${formatEuro(originalTotal)}</td>
      <td class="num num-paid">${formatEuro(repaidTotal)}</td>
      <td class="num num-remain">${formatEuro(remainingTotal)}</td>
      <td${hasActions ? ' colspan="2"' : ""}></td>
    </tr>`;
}

function buildLedgerHeroHtml({ total, openCount, noun, emptyMeta }) {
  const plural = openCount > 1 ? "s" : "";
  if (total > 0) {
    return `
      <div class="amende-hero is-due">
        <div class="amende-hero-copy">
          <p class="amende-hero-kicker">Total à régler</p>
          <strong class="amende-hero-amount">${formatEuro(total)}</strong>
          <p class="amende-hero-meta">${openCount} ${noun}${plural} en cours</p>
        </div>
      </div>`;
  }
  return `
    <div class="amende-hero is-clear">
      <span class="amende-hero-mark" aria-hidden="true">✓</span>
      <div class="amende-hero-copy">
        <p class="amende-hero-kicker">Tout est à jour</p>
        <strong class="amende-hero-amount">0 €</strong>
        <p class="amende-hero-meta">${escapeHtml(emptyMeta)}</p>
      </div>
    </div>`;
}

function buildLedgerTableHtml(rows, { emptyText, rowIdPrefix, hasActions }) {
  const withActions = hasActions || rows.some((row) => row.actions || row.extraRow);
  const colCount = withActions ? 8 : 7;
  const body = rows.length
    ? rows.map((row) => buildLedgerDataRowHtml(row, rowIdPrefix, withActions)).join("")
    : `<tr class="amende-empty-row"><td colspan="${colCount}">${escapeHtml(emptyText)}</td></tr>`;
  const foot = buildLedgerFootHtml(rows, withActions);
  return `
    <div class="amende-table-wrap">
      <table class="amende-table${withActions ? " amende-table-admin" : ""}">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Détail</th>
            <th class="num">Montant</th>
            <th class="num"><span class="th-full">Déjà versé</span><span class="th-short">Versé</span></th>
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

function buildLedgerSectionHtml({ title, noun, emptyMeta, emptyText, rows, rowIdPrefix, hideTitle }) {
  const total = rows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const openCount = rows.filter((row) => !row.settled).length;
  return `
    <div class="amende-ledger">
      ${title && !hideTitle ? `<h3 class="finance-ledger-title">${escapeHtml(title)}</h3>` : ""}
      ${buildLedgerHeroHtml({ total, openCount, noun, emptyMeta })}
      ${buildLedgerTableHtml(rows, { emptyText, rowIdPrefix })}
    </div>`;
}

function getTableWrapScroll(container) {
  if (!container) return 0;
  // Le wrap peut être le container lui-même ou un enfant
  if (container.classList?.contains("amende-table-wrap") ||
      container.classList?.contains("table-wrap") ||
      container.classList?.contains("dette-table-wrap") ||
      container.classList?.contains("finance-table-wrap")) {
    return container.scrollLeft || 0;
  }
  const wrap = container.querySelector?.(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap");
  return wrap ? wrap.scrollLeft || 0 : 0;
}

function setTableWrapScroll(container, left) {
  if (!container || !left) return;
  const apply = () => {
    if (container.classList?.contains("amende-table-wrap") ||
        container.classList?.contains("table-wrap") ||
        container.classList?.contains("dette-table-wrap") ||
        container.classList?.contains("finance-table-wrap")) {
      container.scrollLeft = left;
      return;
    }
    const wrap = container.querySelector?.(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap");
    if (wrap) wrap.scrollLeft = left;
  };
  apply();
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
}

function renderLedgerInto(container, options) {
  if (!container) return;
  const nextHtml = buildLedgerSectionHtml(options);
  // Évite de recréer le DOM (et de perdre le scroll) si rien n'a changé
  if (container.dataset.ledgerHtml === nextHtml) return;
  const savedScroll = getTableWrapScroll(container);
  container.innerHTML = nextHtml;
  container.dataset.ledgerHtml = nextHtml;
  setTableWrapScroll(container, savedScroll);
  scheduleFitTables();
}

function buildFinanceAncienneTourneeRows() {
  return [...ancienneTourneeDettes]
    .filter((entry) => entry && !entry.deletedAt)
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
}

function buildFinanceAmendeRows() {
  return getRegularAmendes([...amendes])
    .map((amende) => {
      const remaining = Math.round((Number(amende.amount) || 0) * 100) / 100;
      const repaid = getAmendeRepaidAmount(amende);
      const original = Math.round(
        (Number(amende.originalAmount) || remaining + repaid) * 100
      ) / 100;
      const member = getMemberById(amende.memberId);
      const note = getAmendeDetailText(amende);
      const detail = note && note !== "—"
        ? `${member?.name || "—"} — ${note}`
        : member?.name || "—";
      return {
        id: amende.id,
        date: amende.date,
        type: amende.type,
        detail,
        original,
        repaid,
        remaining,
        settled: remaining <= 0,
        sortAt: amende.settledAt || amende.date,
      };
    })
    .sort((a, b) => {
      if (a.settled !== b.settled) return a.settled ? 1 : -1;
      return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
    });
}

function buildFinancePretRows() {
  return prets
    .filter((loan) => !isLoanDeleted(loan) && ["active", "defaulted", "completed"].includes(loan.status))
    .map((loan) => {
      const repaid = Math.round((Number(loan.totalRepaid) || 0) * 100) / 100;
      const remaining = Math.round((getLoanBalance(loan) || 0) * 100) / 100;
      const original = Math.round((Number(loan.amount) || 0) * 100) / 100;
      const member = getMemberById(loan.borrowerId);
      return {
        id: loan.id,
        date: getLoanRequestDate(loan),
        type: "pret",
        detail: member?.name || "—",
        original,
        repaid,
        remaining,
        settled: loan.status === "completed" || remaining <= 0,
        sortAt: getLoanRequestDate(loan),
      };
    })
    .sort((a, b) => {
      if (a.settled !== b.settled) return a.settled ? 1 : -1;
      return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
    });
}

function renderFinanceAncienneTournee() {
  return buildLedgerSectionHtml({
    title: "Ancienne tournée",
    noun: "dette",
    emptyMeta: "Aucune dette d'ancienne tournée",
    emptyText: "Aucune dette d'ancienne tournée.",
    rows: buildFinanceAncienneTourneeRows(),
    rowIdPrefix: "finance-ancienne",
  });
}

function renderFinanceAmendes() {
  return buildLedgerSectionHtml({
    title: "Amendes",
    noun: "amende",
    emptyMeta: "Aucune amende à régler",
    emptyText: "Aucune dette ni amende pour le moment.",
    rows: buildFinanceAmendeRows(),
    rowIdPrefix: "finance-amende",
  });
}

function renderFinancePrets() {
  return buildLedgerSectionHtml({
    title: "Prêts",
    noun: "prêt",
    emptyMeta: "Aucun prêt en cours",
    emptyText: "Aucun prêt pour le moment.",
    rows: buildFinancePretRows(),
    rowIdPrefix: "finance-pret",
  });
}

/** Lignes unifiées caisse + prêts pour l'historique finance (lecture seule) */
function buildFinanceHistoryRows() {
  const caisseRows = buildAutreArgentHistoryRows(false).map((row) => ({
    id: `caisse-${row.id}`,
    date: row.date,
    typeLabel: row.typeLabel || "Caisse",
    detail: row.detail || "—",
    original: row.original || 0,
    repaid: null,
    remaining: null,
    statusLabel: row.statusLabel || "—",
    chipClass: row.chipClass || "",
    settled: row.settled,
    sortAt: row.date,
  }));

  const pretRows = buildFinancePretRows().map((row) => {
    const loan = getLoanById(row.id);
    const note = String(loan?.note || "").trim();
    const detail = note ? `${row.detail} — ${note}` : row.detail;
    return {
      id: `pret-${row.id}`,
      date: row.date,
      typeLabel: "Prêt",
      detail,
      original: row.original || 0,
      repaid: row.repaid ?? 0,
      remaining: row.remaining ?? 0,
      statusLabel: row.settled
        ? "Soldé"
        : getPretStatusLabel(loan?.status || "active"),
      chipClass: row.settled ? "is-paid" : row.remaining > 0 ? "is-open" : "is-paid",
      settled: row.settled,
      sortAt: row.sortAt || row.date,
    };
  });

  return [...caisseRows, ...pretRows].sort(
    (a, b) => new Date(b.sortAt || 0) - new Date(a.sortAt || 0)
  );
}

function renderFinanceArchives() {
  // Un seul historique finance : caisse + prêts (lecture seule)
  const rows = buildFinanceHistoryRows();
  const dons = getTotalDonsOuAides();
  const retraits = getTotalRetraitsCaisse();
  const pretsOut = getLoansCapitalOut();
  const summary = `
    <p class="panel-desc finance-caisse-hist-summary">
      Dons ou aides : <strong>${formatEuro(dons)}</strong>
      · Retraits : <strong>${formatEuro(retraits)}</strong>
      · Prêts dehors : <strong>${formatEuro(pretsOut)}</strong>
      · Caisse disponible : <strong>${formatEuro(getCaisseDisponible())}</strong>
    </p>`;
  return `
    <div class="amende-ledger finance-caisse-historique">
      <h3 class="finance-ledger-title">Historique finance</h3>
      ${summary}
      ${buildCaisseHistoryTableHtml(rows, {
        emptyText: "Aucun mouvement financier pour le moment.",
        hasActions: false,
      })}
    </div>`;
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
  refreshFinancierPayBoxes();
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
    const raw = readSynced(ROLES_KEY, {});
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const { updatedAt, ...rolesOnly } = raw;
    return rolesOnly;
  } catch {
    return {};
  }
}

function loadCotisations() {
  try {
    const raw = readSynced(COTISATIONS_KEY, {});
    return normalizeCotisations(raw && typeof raw === "object" ? raw : {});
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
  Object.entries((data && data.years) || {}).forEach(([year, yearData]) => {
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
      if (
        key === TOURNEE_BOUFFE_OK_KEY ||
        key === TOURNEE_RECEPTION_OK_KEY ||
        key === TOURNEE_RISTOURNE_OK_KEY ||
        key === TOURNEE_RECEPTION_DATES_KEY
      ) {
        years[year][key] = { ...(value || {}) };
        return;
      }
      years[year][key] = Array.isArray(value) ? [...value] : value;
    });
  });
  const out = { years };
  if (data && data.updatedAt) out.updatedAt = data.updatedAt;
  return out;
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

    // OK réception / ristourne (memberId → true)
    // Ne pas jeter les OK si la liste membres n'est pas encore chargée
    const validIds = new Set((members || []).map((m) => m.id));
    const normalizeOkMap = (raw) => {
      if (!raw || typeof raw !== "object") return {};
      const out = {};
      Object.entries(raw).forEach(([memberId, flag]) => {
        if (!flag) return;
        // Garder l'OK même si le membre n'est pas encore dans la liste (évite perte au reload)
        if (validIds.size === 0 || validIds.has(memberId)) out[memberId] = true;
        else out[memberId] = true;
      });
      return out;
    };
    let receptionOk = normalizeOkMap(yearData[TOURNEE_RECEPTION_OK_KEY]);
    let ristourneOk = normalizeOkMap(yearData[TOURNEE_RISTOURNE_OK_KEY]);
    // Compat : ancien bouffeOk → réception OK s'il n'y a pas encore de receptionOk
    const legacyBouffe = normalizeOkMap(yearData[TOURNEE_BOUFFE_OK_KEY]);
    if (Object.keys(receptionOk).length === 0 && Object.keys(legacyBouffe).length > 0) {
      receptionOk = { ...legacyBouffe };
    }
    // Si seulement bouffeOk existait sur la colonne ristourne auparavant, aussi en ristourne
    if (Object.keys(ristourneOk).length === 0 && Object.keys(legacyBouffe).length > 0 && Object.keys(yearData[TOURNEE_RECEPTION_OK_KEY] || {}).length === 0) {
      // ne pas tout copier en double si on a déjà migré reception — laisser admin décider
    }
    if (Object.keys(receptionOk).length > 0) normalizedYear[TOURNEE_RECEPTION_OK_KEY] = receptionOk;
    if (Object.keys(ristourneOk).length > 0) normalizedYear[TOURNEE_RISTOURNE_OK_KEY] = ristourneOk;
    if (Object.keys(legacyBouffe).length > 0) normalizedYear[TOURNEE_BOUFFE_OK_KEY] = legacyBouffe;

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

  const out = { years };
  if (raw && raw.updatedAt) out.updatedAt = raw.updatedAt;
  return out;
}

/** Financier / admin / accès Tournée : peut cocher OK réception ou ristourne */
function canMarkTourneeBouffeOk() {
  if (!isLoggedIn()) return false;
  if (isGroupAdmin() && isAdminWorkspace()) return true;
  if (getMemberRole(getCurrentMember()?.id) === "tresorier") return true;
  return hasRoleTabAccess("tournee") && isAdminWorkspace();
}

function getTourneeOkStorageKey(kind) {
  return kind === "ristourne" ? TOURNEE_RISTOURNE_OK_KEY : TOURNEE_RECEPTION_OK_KEY;
}

function getTourneeOkMap(kind, year = tourneeYear, useDraft = false) {
  const source = useDraft && canEditTourneePlanning() ? tourneeDraft : tourneeData;
  const yearRecord = source.years?.[year] || {};
  const key = getTourneeOkStorageKey(kind);
  const map = yearRecord[key] || {};
  // Compat legacy bouffeOk → réception
  if (kind === "reception" && Object.keys(map).length === 0) {
    return yearRecord[TOURNEE_BOUFFE_OK_KEY] || {};
  }
  return map;
}

function isTourneeMarkOk(kind, memberId, year = tourneeYear, useDraft = false) {
  return Boolean(getTourneeOkMap(kind, year, useDraft)[memberId]);
}

function isTourneeBouffeOk(memberId, year = tourneeYear, useDraft = false) {
  return isTourneeMarkOk("reception", memberId, year, useDraft);
}

function setTourneeMarkOk(kind, memberId, isOk) {
  if (!canMarkTourneeBouffeOk()) {
    if (!isLoggedIn()) {
      alert("Veuillez vous connecter.");
      openLoginModal();
      return false;
    }
    alert("Seul le Financier ou un administrateur (accès Tournée) peut valider un OK.");
    return false;
  }
  if (!memberId) return false;
  if (kind !== "reception" && kind !== "ristourne") return false;

  const year = tourneeYear;
  const key = getTourneeOkStorageKey(kind);
  if (!tourneeData.years[year]) tourneeData.years[year] = {};
  if (!tourneeData.years[year][key]) tourneeData.years[year][key] = {};
  const map = tourneeData.years[year][key];
  if (isOk) map[memberId] = true;
  else delete map[memberId];
  if (Object.keys(map).length === 0) delete tourneeData.years[year][key];

  if (tourneeDraft?.years) {
    if (!tourneeDraft.years[year]) tourneeDraft.years[year] = {};
    if (!tourneeDraft.years[year][key]) tourneeDraft.years[year][key] = {};
    const draftMap = tourneeDraft.years[year][key];
    if (isOk) draftMap[memberId] = true;
    else delete draftMap[memberId];
    if (Object.keys(draftMap).length === 0) delete tourneeDraft.years[year][key];
  }

  tourneeData.updatedAt = new Date().toISOString();
  saveTourneeData();
  renderTourneeTable();
  const flush = window.potoFlushSync || window.flushPotoServerSync;
  if (typeof flush === "function") {
    Promise.resolve(flush())
      .then((ok) => {
        if (!ok) return flush();
      })
      .then(() => {
        // Après envoi serveur, recharger pour confirmer l'OK
        if (typeof reloadFromStorage === "function") reloadFromStorage();
        renderTourneeTable();
      })
      .catch(() => {});
  }
  return true;
}

function toggleTourneeMarkOk(kind, memberId) {
  setTourneeMarkOk(kind, memberId, !isTourneeMarkOk(kind, memberId));
}

function toggleTourneeBouffeOk(memberId) {
  toggleTourneeMarkOk("reception", memberId);
}

function loadTourneeData() {
  try {
    const raw = readSynced(TOURNEE_KEY, { years: {} });
    return normalizeTourneeData(raw && typeof raw === "object" ? raw : { years: {} });
  } catch {
    return { years: {} };
  }
}

function saveTourneeData() {
  tourneeData = tourneeData && typeof tourneeData === "object" ? tourneeData : { years: {} };
  tourneeData.updatedAt = new Date().toISOString();
  localStorage.setItem(TOURNEE_KEY, JSON.stringify(tourneeData));
  // Forcer file d'attente synchro (OK visibles sur les autres appareils)
  try {
    const raw = localStorage.getItem(TOURNEE_KEY);
    if (raw && window.queueServerSync) window.queueServerSync(TOURNEE_KEY, raw);
  } catch {
    /* ignore */
  }
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
  const parsed = readSynced(AMENDES_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function loadAmendesCaisse() {
  const parsed = readSynced(AMENDES_CAISSE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveAmendesCaisse() {
  localStorage.setItem(AMENDES_CAISSE_KEY, JSON.stringify(amendesCaisse));
}

function getAmendeCaissePaid(amendeId) {
  if (!amendeId) return 0;
  return amendesCaisse
    .filter((entry) => entry.sourceAmendeId === amendeId)
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
}

function getAmendeRepaidAmount(amende) {
  const stored = Number(amende?.repaidAmount) || 0;
  const fromCaisse = getAmendeCaissePaid(amende?.id);
  return Math.round(Math.max(stored, fromCaisse) * 100) / 100;
}

function loadFondCaisse() {
  try {
    const value = readSynced(FOND_CAISSE_KEY, DEFAULT_FOND_CAISSE);
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
  notifyAllMembers(
    "financier_fond",
    `${getActorLabel()} a modifié le fond de caisse de départ : ${formatEuro(fondCaisse)}.`,
    { tab: "finance", title: "Fond de caisse" }
  );
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

function normalizeFinancierAccount(raw) {
  const iban = String(raw?.iban || "").replace(/\s+/g, "").toUpperCase();
  if (!iban) return { ...DEFAULT_FINANCIER_ACCOUNT };
  return {
    iban,
    holder: String(raw?.holder || "").trim(),
    bank: String(raw?.bank || "").trim(),
  };
}

function loadFinancierAccount() {
  try {
    const raw = readSynced(FINANCIER_ACCOUNT_KEY, null);
    return normalizeFinancierAccount(raw && typeof raw === "object" ? raw : null);
  } catch {
    return { ...DEFAULT_FINANCIER_ACCOUNT };
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
  notifyAllMembers(
    "financier_account",
    `${getActorLabel()} a mis à jour le compte bancaire du Financier.`,
    { tab: "finance", title: "Compte Financier" }
  );
  const msg = document.getElementById("financierAccountSaveMsg");
  if (msg) {
    msg.textContent = "Compte bancaire enregistré.";
    msg.className = "save-msg save-msg-success";
    msg.hidden = false;
  }
  renderMesDettes();
  renderMesAmendes();
  renderEvenements();
  renderPrets();
  renderFinance();
  refreshFinancierPayBoxes();
}

function getFinancierAccountMeta() {
  return [financierAccount.holder, financierAccount.bank].filter(Boolean).join(" · ");
}

function buildFinancierPayBox(intro) {
  const iban = formatIbanDisplay(financierAccount.iban);
  const text =
    intro || "Les paiements et remboursements se font chez le Financier au numéro de compte suivant :";
  if (!iban) {
    return `<aside class="financier-pay-box">
      <p class="financier-pay-intro">${escapeHtml(text)} Le numéro n’est pas encore renseigné.</p>
    </aside>`;
  }
  const extra = getFinancierAccountMeta();
  return `<aside class="financier-pay-box">
    <p class="financier-pay-intro">${escapeHtml(text)}</p>
    <p class="financier-pay-account">
      <strong class="financier-iban">${escapeHtml(iban)}</strong>
      ${extra ? `<span class="financier-iban-meta">${escapeHtml(extra)}</span>` : ""}
    </p>
  </aside>`;
}

function buildFinancierPayInline() {
  const iban = formatIbanDisplay(financierAccount.iban);
  if (!iban) return "";
  const extra = getFinancierAccountMeta();
  return `<p class="financier-pay-inline">Virement chez le Financier : <strong class="financier-iban">${escapeHtml(iban)}</strong>${
    extra ? ` <span class="financier-iban-meta">(${escapeHtml(extra)})</span>` : ""
  }</p>`;
}

function buildDetteRepayHint() {
  const iban = formatIbanDisplay(financierAccount.iban);
  if (!iban) {
    return "Les remboursements se font chez le Financier. Le numéro de compte n’est pas encore renseigné.";
  }
  const extra = getFinancierAccountMeta();
  return `Les remboursements se font chez le Financier au numéro de compte suivant : <strong class="financier-iban">${escapeHtml(iban)}</strong>${
    extra ? ` <span class="financier-iban-meta">(${escapeHtml(extra)})</span>` : ""
  }.`;
}

function refreshFinancierPayBoxes() {
  document.querySelectorAll("[data-financier-pay]").forEach((el) => {
    const intro = el.getAttribute("data-financier-pay") || "";
    el.innerHTML = buildFinancierPayBox(intro);
    el.hidden = false;
  });
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
    const raw = readSynced(FOND_CAISSE_ANNUEL_KEY, null);
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
  notifyAllMembers(
    "financier_fond",
    `${getActorLabel()} a encaissé ${formatEuro(payAmount)} de fond de caisse ${year} pour ${member.name}.`,
    { tab: "finance", title: "Fond de caisse" }
  );
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

  const rows = getSortedMembers().map((member) => {
    const paid = getFondCaisseAnnuelPaid(selectedYear, member.id);
    const due = getFondCaisseAnnuelDue(selectedYear, member.id);
    const solded = due <= 0;
    const history = yearData?.payments?.[member.id]?.history || [];
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
    const actions = solded
      ? `<div class="amende-admin-actions">
          ${historyHtml}
          <button type="button" class="btn-secondary fond-caisse-annuel-undo" data-year="${selectedYear}" data-member-id="${escapeHtml(member.id)}" title="Annuler le dernier versement">Annuler le dernier</button>
        </div>`
      : `<div class="amende-admin-actions">
          ${historyHtml}
          <div class="pret-repay-form">
            <input type="number" min="0.5" step="0.5" max="${due}" placeholder="${due}" class="fond-caisse-annuel-pay-input" data-member-id="${escapeHtml(member.id)}" data-year="${selectedYear}" inputmode="decimal" aria-label="Montant de ce versement pour ${escapeHtml(member.name)}, reste ${due} euros" />
            <button type="button" class="btn-primary btn-fond-caisse-annuel-pay" data-member-id="${escapeHtml(member.id)}" data-year="${selectedYear}">Verser</button>
          </div>
        </div>`;
    return {
      id: member.id,
      dateLabel: String(selectedYear),
      type: "cotisation",
      typeLabel: "Fond de caisse",
      detail: member.name,
      original: amountPerMember,
      repaid: paid,
      remaining: due,
      settled: solded,
      actions,
    };
  });

  renderLedgerInto(fondCaisseAnnuelList, {
    noun: "poto",
    emptyMeta: "Tout le monde a versé",
    emptyText: "Aucun poto.",
    rowIdPrefix: "fond-annuel",
    rows,
  });
}

function loadTabPermissions() {
  try {
    const storedRaw = readSynced(TAB_PERMISSIONS_KEY, {});
    const stored = storedRaw && typeof storedRaw === "object" && !Array.isArray(storedRaw) ? storedRaw : {};
    const merged = { ...DEFAULT_TAB_PERMISSIONS };

    MANAGEABLE_TABS.forEach((tab) => {
      if (Array.isArray(stored[tab.id])) {
        merged[tab.id] = stored[tab.id].filter((roleId) =>
          ROLES.some((role) => role.id === roleId)
        );
      }
    });

    if (
      Array.isArray(merged.communication) &&
      merged.communication.length === 1 &&
      merged.communication[0] === "president"
    ) {
      merged.communication = ["president", "vice-president"];
    }

    return merged;
  } catch {
    return { ...DEFAULT_TAB_PERMISSIONS };
  }
}

function saveTabPermissionsData() {
  tabPermissions = { ...tabPermissions, updatedAt: new Date().toISOString() };
  localStorage.setItem(TAB_PERMISSIONS_KEY, JSON.stringify(tabPermissions));
}

