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
const ADMIN_SUBTABS = ["membres", "admins", "acces", "tournee", "caisse", "prets", "amendes", "evenements", "communication", "loi", "sauvegarde"];
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
  return "reunion";
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
  if (subId === "admins" || subId === "acces" || subId === "sauvegarde") return false;
  if (subId === "membres") return hasRoleTabAccess("membres") || hasRoleTabAccess("bureau");
  if (subId === "caisse") return isFinancierPoste() || hasRoleTabAccess("caisse");
  if (subId === "amendes") {
    return (
      isGroupAdmin() ||
      hasRoleTabAccess("amendes") ||
      hasRoleTabAccess("ancienne-tournee") ||
      isFinancierPoste()
    );
  }
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
  let requested = stored === "equipe" || stored === "bureau" ? "membres" : stored;
  if (requested === "ancienne-tournee") requested = "amendes";
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

function getAdminHubLabel(subId) {
  const item = ADMIN_HUB_ITEMS.find((x) => x.id === subId);
  return item?.label || subId || "Admin";
}

function renderAdminHub() {
  const grid = document.getElementById("adminHubGrid");
  if (!grid) {
    console.warn("adminHubGrid introuvable");
    return;
  }
  const hubItems =
    typeof ADMIN_HUB_ITEMS !== "undefined" && Array.isArray(ADMIN_HUB_ITEMS)
      ? ADMIN_HUB_ITEMS
      : ADMIN_SUBTABS.map((id) => ({ id, label: id, tone: "navy" }));
  let allowed = [];
  try {
    allowed = typeof getAllowedAdminSubs === "function" ? getAllowedAdminSubs() : ADMIN_SUBTABS.slice();
  } catch (err) {
    console.warn("getAllowedAdminSubs:", err);
    allowed = ADMIN_SUBTABS.slice();
  }
  // Si aucun filtre (ou admin groupe) : tout afficher
  let items = hubItems.filter((item) => allowed.includes(item.id));
  if (!items.length && typeof isGroupAdmin === "function" && isGroupAdmin()) {
    items = hubItems.slice();
  }
  if (!items.length) {
    items = hubItems.slice(); // fallback visible pour débloquer l'UI
  }
  grid.innerHTML = items
    .map(
      (item) =>
        `<button type="button" class="reunion-kpi reunion-kpi-${escapeHtml(item.tone || "navy")} admin-hub-btn" data-admin-go="${escapeHtml(item.id)}">
        <span class="admin-hub-label">${escapeHtml(item.label)}</span>
      </button>`
    )
    .join("");
}

/** Tableau de bord admin (comme Réunion) — aucune sous-page visible */
function showAdminHub() {
  activeAdminSub = null;
  activeGestionSub = null;
  try {
    localStorage.removeItem(ADMIN_SUBTAB_KEY);
  } catch {
    /* ignore */
  }

  const hub = document.getElementById("adminHub");
  const backBar = document.getElementById("adminBackBar");
  const subcontent = document.getElementById("adminSubcontent");
  const desc = document.getElementById("adminHubDesc");
  const label = document.getElementById("adminCurrentSubLabel");

  if (hub) {
    hub.hidden = false;
    hub.style.display = "";
  }
  if (backBar) backBar.hidden = true;
  if (subcontent) {
    subcontent.hidden = true;
    subcontent.style.display = "none";
  }
  if (desc) {
    desc.hidden = false;
    desc.textContent = "Choisis une section à gérer.";
  }
  if (label) {
    label.hidden = true;
    label.textContent = "";
  }

  document.querySelectorAll("#tab-admin .gestion-subpanel[data-admin-panel]").forEach((panel) => {
    panel.classList.remove("is-active");
    panel.hidden = true;
  });

  renderAdminHub();
  closeAdminMenu();
}

function showAdminSub(subId) {
  if (subId === "hub" || subId === "home" || !subId) {
    showAdminHub();
    return;
  }
  if (subId === "bureau" || subId === "equipe") subId = "membres";
  if (subId === "ancienne-tournee") subId = "amendes";
  if (!ADMIN_SUBTABS.includes(subId) || !canAccessAdminSub(subId)) {
    const allowed = getAllowedAdminSubs();
    if (!allowed.length) {
      showAdminHub();
      return;
    }
    subId = allowed.includes(getAdminSubtab()) ? getAdminSubtab() : allowed[0];
  }

  activeAdminSub = subId;
  activeGestionSub = subId;
  localStorage.setItem(ADMIN_SUBTAB_KEY, subId);

  const hub = document.getElementById("adminHub");
  const backBar = document.getElementById("adminBackBar");
  const backLabel = document.getElementById("adminBackLabel");
  const subcontent = document.getElementById("adminSubcontent");
  const desc = document.getElementById("adminHubDesc");
  const label = document.getElementById("adminCurrentSubLabel");

  if (hub) {
    hub.hidden = true;
    hub.style.display = "none";
  }
  if (backBar) backBar.hidden = false;
  if (backLabel) backLabel.textContent = getAdminHubLabel(subId);
  if (subcontent) {
    subcontent.hidden = false;
    subcontent.style.display = "";
  }
  if (desc) desc.hidden = true;
  if (label) {
    label.hidden = false;
    label.textContent = getAdminHubLabel(subId);
  }

  document.querySelectorAll("#tab-admin .gestion-subpanel[data-admin-panel]").forEach((panel) => {
    const match = panel.dataset.adminPanel === subId;
    panel.classList.toggle("is-active", match);
    panel.hidden = !match;
  });

  // Rendu ciblé de la section
  if (subId === "membres") {
    if (addMemberPanel) {
      addMemberPanel.hidden = !(isGroupAdmin() || hasRoleTabAccess("membres"));
      addMemberPanel.classList.toggle("locked", !(isGroupAdmin() || hasRoleTabAccess("membres")));
    }
    if (rolesPanel) {
      rolesPanel.hidden = !(isGroupAdmin() || hasRoleTabAccess("bureau"));
      rolesPanel.classList.toggle("locked", !(isGroupAdmin() || hasRoleTabAccess("bureau")));
    }
    if (typeof updateFormState === "function") updateFormState();
    if (typeof renderBureau === "function") renderBureau();
    if (typeof renderMemberList === "function") renderMemberList();
    if (typeof renderAdminList === "function") renderAdminList();
  }
  if (subId === "admins") {
    if (typeof renderAdminList === "function") renderAdminList();
  }
  if (subId === "acces" && typeof renderTabPermissionsPanel === "function") renderTabPermissionsPanel();
  if (subId === "tournee" && typeof renderTourneeTable === "function") renderTourneeTable();
  if (subId === "caisse") {
    if (typeof renderFondCaissePanel === "function") renderFondCaissePanel();
    if (typeof renderAutreArgent === "function") renderAutreArgent();
  }
  if (subId === "prets" && typeof renderAdminPrets === "function") renderAdminPrets();
  if (subId === "amendes") {
    if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
    if (typeof renderAmendesAdminHistory === "function") renderAmendesAdminHistory();
  }
  if (subId === "evenements" && typeof renderEvenements === "function") renderEvenements();
  if (subId === "communication" && typeof renderCommunication === "function") renderCommunication();
  if (subId === "loi" && typeof renderLoiAdmin === "function") renderLoiAdmin();
  if (subId === "sauvegarde" && typeof renderAuditLog === "function") renderAuditLog();

  closeAdminMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showGestionSub(subId) {
  if (subId === "equipe" || subId === "bureau") subId = "membres";
  showAdminSub(subId);
}

function renderAdmin() {
  // Toujours le hub sauf deep-link notif (sessionStorage poto-open-admin)
  let deep = null;
  try {
    deep = sessionStorage.getItem("poto-open-admin");
    if (deep) sessionStorage.removeItem("poto-open-admin");
  } catch {
    deep = null;
  }
  // Ne pas relire localStorage ADMIN_SUBTAB_KEY (sinon retour auto sur Membres)
  try {
    localStorage.removeItem(ADMIN_SUBTAB_KEY);
  } catch {
    /* ignore */
  }
  if (deep && ADMIN_SUBTABS.includes(deep) && canAccessAdminSub(deep)) {
    showAdminSub(deep);
  } else {
    activeAdminSub = null;
    showAdminHub();
  }
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
    if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
    if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  }
}

function getAmendeTypeLabel(typeId) {
  if (typeId === "dette") return "Dette événement";
  if (typeId === "evenement") return "Événement";
  if (typeId === "ancienne-tournee" || typeId === "ex-tournee") return "Ex tournée";
  if (typeId === "cotisation") return "Cotisation";
  if (typeId === "pret") return "Prêt";
  return AMENDE_TYPES.find((t) => t.id === typeId)?.label || typeId;
}


/** Supprime en dur (tombstone) toutes les dettes événement historiques — source = onglet Événements */
function purgeEvenementDettesAmendes() {
  let changed = false;
  const now = new Date().toISOString();
  (Array.isArray(amendes) ? amendes : []).forEach((a) => {
    if (!a || a.type !== "dette" || a.deletedAt) return;
    a.deletedAt = now;
    a.updatedAt = now;
    a.amount = 0;
    changed = true;
  });
  if (changed) {
    try {
      localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));
    } catch {
      /* ignore */
    }
  }
  return changed;
}

function isDetteAmende(amende) {
  return amende?.type === "dette";
}

function isAmendeDeleted(amende) {
  return Boolean(amende?.deletedAt);
}

function getRegularAmendes(amendesList) {
  return (amendesList || []).filter((amende) => !isDetteAmende(amende) && !isAmendeDeleted(amende));
}

function getDetteAmendes() {
  return amendes.filter((amende) => isDetteAmende(amende) && !isAmendeDeleted(amende));
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
  if (typeof purgeEvenementDettesAmendes === "function") purgeEvenementDettesAmendes();
  amendesCaisse = loadAmendesCaisse();
  tabPermissions = loadTabPermissions();
  prets = loadPrets();
  // Réappliquer les votes faits sur cet appareil (évite le "comme si je n'avais pas voté")
  if (typeof applyPendingLocalVotesToPrets === "function" && applyPendingLocalVotesToPrets()) {
    try {
      localStorage.setItem(PRETS_KEY, JSON.stringify(prets));
    } catch {
      /* ignore */
    }
  }
  notifications = loadNotifications();
  evenements = loadEvenements();
  auditLog = loadAuditLog();
  communicationPosts = loadCommunicationPosts();
  activeCommunicationSub = loadCommunicationSubtab();
  loiArticles = loadLoiArticles();
  guideArticles = loadGuideArticles();
  autreArgent = loadAutreArgent();
  capitalHorsGroupe = loadCapitalHorsGroupe();
  ancienneTourneeDettes = loadAncienneTourneeDettes();
  fondCaisse = loadFondCaisse();
  fondCaisseAnnuel = loadFondCaisseAnnuel();
  financierAccount = loadFinancierAccount();
  financeData = loadFinance();
  adminIds = loadAdminIds();
  ensureDefaultAdmin();
  tourneeData = loadTourneeData();
  // Toujours réaligner le draft (sinon les OK disparaissent à l'affichage admin)
  tourneeDraft = cloneTourneeData(tourneeData);
  if (canEditTourneePlanning()) {
    cotisationsDraft = { ...cotisations };
  }
}

function saveMembers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  render();
}

function saveRoles() {
  localStorage.setItem(ROLES_KEY, JSON.stringify({ ...roles, updatedAt: new Date().toISOString() }));
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

function isNavPreview() {
  const preview = new URLSearchParams(location.search).get("preview");
  return preview === "nav" || preview === "menu";
}

function hasSessionHint() {
  try {
    const hint = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return Boolean(hint?.memberId);
  } catch {
    return false;
  }
}

function applySessionHint() {
  try {
    const hint = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!hint?.memberId) return false;
    authState = {
      loggedIn: true,
      member: { id: hint.memberId, name: hint.memberName || "" },
      mustChangePassword: false,
    };
    return true;
  } catch {
    return false;
  }
}

function revealApp(loggedIn) {
  document.documentElement.classList.toggle("has-session", Boolean(loggedIn));
  document.documentElement.classList.toggle("needs-login", !loggedIn);
}

function openLoginModal() {
  if (isNavPreview()) return;
  revealApp(false);
  closeAppMenu();
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

/** Toast non bloquant (remplace la plupart des alert) */
function showToast(message, type = "info", options = {}) {
  const host = document.getElementById("toastHost");
  const text = String(message ?? "").trim();
  if (!text) return;

  if (!host) {
    // Fallback ultime
    try {
      openConfirmModal({
        title: options.title || "Poto Timide",
        message: text,
        okLabel: "OK",
        showCancel: false,
      });
    } catch {
      /* ignore */
    }
    return;
  }

  const duration = options.duration ?? (type === "error" ? 5500 : type === "success" ? 3200 : 4200);
  const icons = { success: "✓", error: "!", info: "i", warn: "!" };
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icons[type] || "i"}</span>
    <div class="toast-body"></div>
    <button type="button" class="toast-close" aria-label="Fermer">×</button>
  `;
  el.querySelector(".toast-body").textContent = text;

  const remove = () => {
    if (el.classList.contains("is-leaving")) return;
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 220);
  };
  el.querySelector(".toast-close")?.addEventListener("click", remove);
  host.appendChild(el);
  // Max 4 toasts
  while (host.children.length > 4) host.firstElementChild?.remove();
  if (duration > 0) setTimeout(remove, duration);
}

function showToastSuccess(message, opts) {
  showToast(message, "success", opts);
}
function showToastError(message, opts) {
  showToast(message, "error", opts);
}
function showToastInfo(message, opts) {
  showToast(message, "info", opts);
}
function showToastWarn(message, opts) {
  showToast(message, "warn", opts);
}

/**
 * Remplace alert() : toast non bloquant.
 * Type auto : erreur si le texte ressemble à un refus / invalide.
 */
function appAlert(message, title = "Poto Timide") {
  const text = String(message ?? "");
  const lower = text.toLowerCase();
  let type = "info";
  if (
    /invalide|impossible|erreur|refusé|refus|interdit|seul |seuls |veuillez|obligatoire|trop |maximum|aucun |pas (pu|encore|autoris)/i.test(
      lower
    )
  ) {
    type = "error";
  } else if (/enregistr|validé|ajouté|supprimé|publié|succès|ok —|remboursé|à jour/i.test(lower)) {
    type = "success";
  } else if (/attention|déjà|attendre|encore en vote/i.test(lower)) {
    type = "warn";
  }
  showToast(text, type, { title });
}

// Toutes les alert() natives → toast
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
  if (loginForm?.dataset.busy === "1") return false;

  const submitBtn = loginForm?.querySelector('button[type="submit"]');
  const submitLabel = submitBtn?.textContent;
  loginError.hidden = true;
  if (loginForm) loginForm.dataset.busy = "1";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Connexion…";
  }

  try {
    try {
      await apiLogin(name.trim(), password);
    } catch (err) {
      loginError.textContent = err.message || "Identifiant ou mot de passe incorrect.";
      loginError.hidden = false;
      return false;
    }

    loginModal.classList.remove("open");
    revealApp(true);
    if (authState.mustChangePassword) {
      openChangePasswordModal();
    } else {
      appEl.classList.remove("app-blurred");
    }
    updateSessionUI();

    try {
      await loadDataFromServer();
    } catch (err) {
      console.warn("Chargement des données après connexion :", err);
    }

    try {
      reloadFromStorage();
      if (typeof potoStartPeriodicSync === "function") potoStartPeriodicSync();
      startOnlinePolling();
      ensureDefaultAdmin();
      if (authState.member) {
        authState.member.isAdmin = isMemberAdmin(authState.member.id);
      }
      updateSessionUI();
      render();
      maybeShowInstallBanner();
      pushSetupStarted = false;
      setupPushNotifications();
      applyNotificationDeepLink();
    } catch (err) {
      console.warn("Affichage après connexion :", err);
      appEl.classList.remove("app-blurred");
      updateSessionUI();
      try {
        render();
      } catch (renderErr) {
        console.warn("Rendu après connexion :", renderErr);
      }
    }
    return true;
  } finally {
    if (loginForm) delete loginForm.dataset.busy;
    if (submitBtn) {
      submitBtn.disabled = false;
      if (submitLabel) submitBtn.textContent = submitLabel;
    }
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

function canAccessMainTab(tabId) {
  if (!isLoggedIn()) return false;
  if (isNouveauMember(getCurrentMember())) {
    return tabId === "loi";
  }
  return true;
}

/** Restreint la navigation pour un compte "nouveau" (La loi seulement) */
function applyNouveauTabRestrictions() {
  const isNouveau = isNouveauMember(getCurrentMember());
  document.querySelectorAll(".tab[data-tab]").forEach((btn) => {
    const tabId = btn.dataset.tab;
    if (!tabId) return;
    if (isNouveau) {
      btn.hidden = tabId !== "loi";
    } else if (tabId === "admin" || tabId === "gestion") {
      // géré ailleurs
    } else {
      // réafficher les onglets standards (sauf admin géré au-dessus)
      if (tabId !== "admin") btn.hidden = false;
    }
  });
  if (isNouveau) {
    if (tabBtnAdmin) tabBtnAdmin.hidden = true;
    if (tabBtnGestion) tabBtnGestion.hidden = true;
    const active = document.querySelector(".tab-content.active");
    if (active && active.id !== "tab-loi") {
      showTab("loi");
    }
  }
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

  // Nouveau (invité) : uniquement l'onglet La loi
  applyNouveauTabRestrictions();

  // Fond de caisse : pas dans Finance public
  if (financeSubCaisse) financeSubCaisse.hidden = true;

  if (rolesPanel) rolesPanel.hidden = !hasRoleTabAccess("bureau");
  if (addMemberPanel) addMemberPanel.hidden = !hasRoleTabAccess("membres");
  if (tabPermissionsPanel) tabPermissionsPanel.hidden = !isAdmin;
  if (adminRolesPanel) adminRolesPanel.hidden = !isAdmin;

  if (addAmendePanel) addAmendePanel.hidden = !canAddDettesAmendesUnified();
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

  // Ne pas forcer une sous-page : hub si aucune sélection
  if (canAccessAdminTab() && document.getElementById("tab-admin")?.classList.contains("active")) {
    if (activeAdminSub && ADMIN_SUBTABS.includes(activeAdminSub)) {
      showAdminSub(activeAdminSub);
    } else {
      showAdminHub();
    }
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

function formatCompactDate(dateStr) {
  const date = new Date(String(dateStr || "").split("T")[0] + "T12:00:00");
  if (Number.isNaN(date.getTime())) return formatFriendlyDate(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function formatAdaptiveDate(dateStr) {
  if (typeof window !== "undefined" && window.innerWidth <= 900) return formatCompactDate(dateStr);
  return formatFriendlyDate(dateStr);
}

function fitTablesToScreen(scope) {
  // Plus de réduction (scale) : on garde une taille lisible
  // et on permet le défilement horizontal (swipe gauche/droite).
  if (typeof isUserEditingForm === "function" && isUserEditingForm()) return;
  if (typeof isLoanDateEditing === "function" && isLoanDateEditing()) return;
  const root = scope && scope.querySelectorAll ? scope : document;
  root.querySelectorAll(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap").forEach((wrap) => {
    const table = wrap.querySelector("table");
    if (!table) return;

    // Annuler tout ancien scale / hauteur forcée
    table.style.transform = "";
    table.style.transformOrigin = "";
    table.style.width = "max-content";
    table.style.minWidth = "max-content";
    wrap.style.height = "";
  });
}

let lastFitViewportWidth = 0;
function scheduleFitTables() {
  fitTablesToScreen();
}

function toDateInputValue(iso) {
  const raw = String(iso || "");
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function combineDateWithTime(ymd, previousIso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd || ""))) return null;
  const previous = String(previousIso || "");
  const timePart = previous.includes("T") ? previous.slice(previous.indexOf("T") + 1) : "12:00:00.000Z";
  const next = `${ymd}T${timePart}`;
  if (Number.isNaN(new Date(next).getTime())) return null;
  return next;
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

function isNouveauMember(memberOrId) {
  if (!memberOrId) return false;
  const member = typeof memberOrId === "string" ? getMemberById(memberOrId) : memberOrId;
  return Boolean(member && member.kind === "nouveau");
}

/** Membres du groupe (exclut les "nouveaux" invités La loi) */
/** Tous les comptes (membres + nouveaux), triés */
function getAllAccountsSorted() {
  return [...members].sort(compareMemberNames);
}

/** Membres du groupe uniquement (sans les comptes "nouveau") */
function getGroupMembers() {
  return getAllAccountsSorted().filter((m) => !isNouveauMember(m));
}

/** Alias historique : membres du groupe (pas les invités La loi) */
function getSortedMembers() {
  return getGroupMembers();
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

async function assignAdmin(memberId) {
  if (!requireGroupAdmin("nommer un administrateur")) return;

  const member = getMemberById(memberId);
  if (!member) return;

  if (isMemberAdmin(memberId)) {
    alert("Ce membre est déjà administrateur.");
    return;
  }

  adminIds.push(memberId);
  saveAdminIds();
  if (typeof potoFlushSync === "function") await potoFlushSync();
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
  if (typeof potoFlushSync === "function") await potoFlushSync();

  const current = getCurrentMember();
  if (current?.id === memberId) {
    updateSessionUI();
  }
}

let tabPermissionsSaving = false;
let tabPermissionsTouchAt = 0;

function collectTabPermissionsFromUI() {
  const nextPermissions = {};
  MANAGEABLE_TABS.forEach((tab) => {
    nextPermissions[tab.id] = [];
  });
  tabPermissionsBody?.querySelectorAll(".tab-perm-checkbox:checked").forEach((checkbox) => {
    const tabId = checkbox.dataset.tab;
    const roleId = checkbox.dataset.role;
    if (nextPermissions[tabId] && !nextPermissions[tabId].includes(roleId)) {
      nextPermissions[tabId].push(roleId);
    }
  });
  return nextPermissions;
}

function renderTabPermissionsPanel() {
  if (!tabPermissionsTable || !tabPermissionsBody) return;
  // Ne pas reconstruire le tableau si l'utilisateur vient de cocher une case
  if (tabPermissionsSaving) return;
  if (Date.now() - tabPermissionsTouchAt < 4000) return;

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

async function saveTabPermissionsFromUI(options = {}) {
  const { silent = false } = options;
  if (!requireGroupAdmin("configurer les accès aux onglets")) return;

  const nextPermissions = collectTabPermissionsFromUI();
  tabPermissions = nextPermissions;
  saveTabPermissionsData();
  tabPermissionsTouchAt = Date.now();

  if (!silent && tabPermissionsMsg) {
    tabPermissionsMsg.textContent = "Enregistrement des accès…";
    tabPermissionsMsg.className = "save-msg";
    tabPermissionsMsg.hidden = false;
  }

  tabPermissionsSaving = true;
  try {
    const flushed = typeof potoFlushSync === "function" ? await potoFlushSync() : true;
    if (!flushed) {
      if (tabPermissionsMsg) {
        tabPermissionsMsg.textContent = "Accès enregistrés ici, mais pas encore sur le serveur. Réessaie.";
        tabPermissionsMsg.className = "save-msg save-msg-error";
        tabPermissionsMsg.hidden = false;
      }
      return;
    }

    if (tabPermissionsMsg) {
      tabPermissionsMsg.textContent = silent ? "Accès mis à jour." : "Accès aux onglets enregistrés.";
      tabPermissionsMsg.className = "save-msg save-msg-success";
      tabPermissionsMsg.hidden = false;
    }

    updateSessionUI();
    updateAdminSubtabVisibility();
  } finally {
    tabPermissionsSaving = false;
    tabPermissionsTouchAt = Date.now();
  }
}

async function handleTabPermissionCheckboxChange(e) {
  const checkbox = e.target.closest?.(".tab-perm-checkbox");
  if (!checkbox || !tabPermissionsBody?.contains(checkbox)) return;
  if (!isGroupAdmin()) {
    checkbox.checked = !checkbox.checked;
    return;
  }
  tabPermissionsTouchAt = Date.now();
  // Enregistrement immédiat au clic — la case reste cochée
  await saveTabPermissionsFromUI({ silent: true });
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

  // Liste publique : membres du groupe. Admin : tout le monde (y compris nouveaux).
  const source = withAdminActions ? getAllAccountsSorted() : getGroupMembers();

  if (source.length === 0) {
    listEl.innerHTML = `<li class="empty">${
      withAdminActions ? "Aucun compte pour le moment." : "Aucun membre pour le moment."
    }</li>`;
    return;
  }

  const currentMember = getCurrentMember();
  const showActions = withAdminActions && hasRoleTabAccess("membres");

  source.forEach((member, index) => {
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
            ${isNouveauMember(member) ? '<span class="tag-nouveau">Nouveau · La loi</span>' : ""}
            ${isCurrentUser ? '<span class="tag-you">Vous</span>' : ""}
            ${isOnline ? '<span class="tag-online">En ligne</span>' : ""}
          </p>
          <p class="member-date">
            ${
              isNouveauMember(member)
                ? '<span class="role-badge role-badge-nouveau">Nouveau — accès La loi</span>'
                : roleId
                  ? `<span class="role-badge">${escapeHtml(getRoleLabel(roleId))}</span>`
                  : "Membre du groupe"
            }
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

function addAmende(memberId, type, amount, note) {
  if (!requireTabAccess("amendes", "ajouter des amendes")) return;

  const member = getMemberById(memberId);
  if (!member) {
    alert("Membre introuvable.");
    return;
  }

  if (type === "dette" || type === "evenement") {
    alert(
      "Les dettes d’événements se créent automatiquement. Impossible de les ajouter à la main."
    );
    return;
  }

  const parsedAmount = parseAmendeAmount(amount);
  if (parsedAmount === null) return;
  if (parsedAmount <= 0) {
    alert("Le montant doit être supérieur à 0.");
    return;
  }

  const now = new Date().toISOString();
  amendes.unshift({
    id: generateId(),
    memberId,
    type: type || "absence",
    amount: parsedAmount,
    originalAmount: parsedAmount,
    repaidAmount: 0,
    note: String(note || "").trim(),
    date: now,
    createdAt: now,
    updatedAt: now,
  });

  saveAmendes();
  amendeForm?.reset();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  showToast?.(
    `Amende ${formatEuro(parsedAmount)} enregistrée pour ${member.name}.`,
    "success"
  );
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
    note: String(note || "").trim(),
    updatedAt: new Date().toISOString(),
  };

  saveAmendes();
  cancelEditAmende();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
}

function applyDetteRemoval(amende, { restoreCaisse = false, markEventPaid = false, restoreAmount = null, dismissDebt = false } = {}) {
  if (!isDetteAmende(amende) || !amende.evenementId) return false;

  const evt = getEvenementById(amende.evenementId);
  if (!evt) return false;
  const amount = restoreAmount != null ? Number(restoreAmount) : Number(amende.amount) || 0;

  if (!evt.payments) evt.payments = {};
  if (!evt.payments[amende.memberId]) {
    evt.payments[amende.memberId] = { paid: false, paidAt: null, validatedBy: null };
  }
  const payment = evt.payments[amende.memberId];

  if (markEventPaid) {
    payment.paid = true;
    payment.paidAt = new Date().toISOString();
    payment.validatedBy = getCurrentMember()?.id || null;
    payment.paidAmount = (Number(payment.paidAmount) || 0) + amount;
    payment.debtRepaidAt = new Date().toISOString();
  }

  // Toujours lever le flag dette événement à la suppression / remboursement
  // sinon la dette est recréée ou reste affichée comme "Dette"
  delete payment.convertedToDebt;
  delete payment.debtCreatedAt;
  if (dismissDebt || (!markEventPaid && amount === 0)) {
    payment.debtDismissed = true;
    payment.debtDismissedAt = new Date().toISOString();
  }

  if (restoreCaisse && evt.caisseDebtDeduction) {
    evt.caisseDebtDeduction = Math.max(0, evt.caisseDebtDeduction - amount);
  }

  evt.updatedAt = new Date().toISOString();
  return true;
}

function validateDettePayment(amendeId) {
  repayAmende(amendeId);
}

function creditAmendeToCaisse(amende) {
  const now = new Date().toISOString();
  amendesCaisse.unshift({
    id: generateId(),
    sourceAmendeId: amende.id,
    memberId: amende.memberId,
    type: amende.type,
    amount: amende.amount,
    note: amende.note || "",
    paidAt: now,
    createdAt: now,
    updatedAt: now,
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
        ? `Valider ${formatEuro(payAmount)} (${typeLabel.toLowerCase()} de ${member?.name || "ce poto"}) ?\nL'amende sera soldée, le montant ira dans Déjà versé et dans la caisse.`
        : `Valider ${formatEuro(payAmount)} sur ${formatEuro(remaining)} (${member?.name || "ce poto"}) ?\nDéjà versé sera mis à jour.\nIl restera ${formatEuro(nextRemaining)}.\n${formatEuro(payAmount)} ira dans la caisse.`
    ))
  ) {
    return;
  }

  if (editingAmendeId === id) cancelEditAmende();

  if (!amende.originalAmount) {
    amende.originalAmount = Math.round((remaining + getAmendeRepaidAmount(amende)) * 100) / 100;
  }

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

  amende.repaidAmount = Math.round(((Number(amende.repaidAmount) || 0) + payAmount) * 100) / 100;
  if (isFull) {
    amende.amount = 0;
    amende.settledAt = new Date().toISOString();
  } else {
    amende.amount = nextRemaining;
    delete amende.settledAt;
  }
  amende.updatedAt = new Date().toISOString();

  saveAmendes();
  bumpLiveDataRevision();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  renderEvenements();
  renderFinanceDashboard();
  renderMesAmendes();
  renderMesDettes();

  const shownRepaid = getAmendeById(id) ? getAmendeRepaidAmount(getAmendeById(id)) : payAmount;
  alert(
    isFull
      ? `Versement validé — ${formatEuro(payAmount)} dans Déjà versé, amende soldée.\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
      : `Versement validé — ${formatEuro(payAmount)} ajouté à Déjà versé (total ${formatEuro(shownRepaid)}).\nReste dû : ${formatEuro(nextRemaining)}\nCaisse disponible : ${formatEuro(getCaisseDisponible())}`
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
      isDetteAmende(amende)
        ? `Supprimer la dette de ${memberName} (${formatEuro(amende.amount)}) ?\nElle ne sera pas ajoutée à la caisse.`
        : `Supprimer ${getAmendeTypeLabel(amende.type).toLowerCase()} de ${memberName} (${formatEuro(amende.amount)}) ?\nElle ne sera pas ajoutée à la caisse.`
    ))
  ) {
    return;
  }

  if (editingAmendeId === id) cancelEditAmende();

  const wasDette = isDetteAmende(amende);
  if (wasDette) {
    applyDetteRemoval(amende, {
      restoreCaisse: false,
      markEventPaid: false,
      dismissDebt: true,
      restoreAmount: 0,
    });
    localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));
  }

  // Soft-delete + UI immédiate + flush serveur
  const now = new Date().toISOString();
  amende.deletedAt = now;
  amende.updatedAt = now;
  amende.amount = 0;
  // Retrait immédiat du DOM (avant confirm réseau)
  document.getElementById(`amende-${id}`)?.remove();
  document.getElementById(`admin-amende-${id}`)?.remove();
  document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`).forEach((el) => {
    const row = el.closest("tr, .amende-history-row, .dette-card, article");
    if (row) row.remove();
  });
  saveAmendes();
  bumpLiveDataRevision();
  renderAmendes();
  renderAmendesAdminHistory();
  renderEvenements();
  renderFinanceDashboard();
  if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  showToast?.(wasDette ? `Dette de ${memberName} supprimée.` : `Amende de ${memberName} supprimée.`, "success");
  // Forcer envoi amendes + événements (dette) avant tout pull
  try {
    const aRaw = localStorage.getItem(AMENDES_KEY);
    const qs = window.queueServerSync || (typeof queueServerSync === "function" ? queueServerSync : null);
    if (aRaw && qs) qs(AMENDES_KEY, aRaw);
    const eRaw = localStorage.getItem(EVENEMENTS_KEY);
    if (eRaw && wasDette && qs) qs(EVENEMENTS_KEY, eRaw);
  } catch { /* ignore */ }
  if (typeof potoFlushSync === "function") {
    try {
      await potoFlushSync();
    } catch {
      /* ignore */
    }
  }
  renderAmendes();
  renderAmendesAdminHistory();
  renderEvenements();
  renderFinanceDashboard();
  if (typeof renderReunion === "function") renderReunion();
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
  if (!openEl) return;

  const canSee = hasRoleTabAccess("amendes");
  if (panel) panel.hidden = !canSee;
  if (!canSee) {
    openEl.innerHTML = "";
    if (paidEl) paidEl.innerHTML = "";
    return;
  }

  const openRows = amendes
    .filter((amende) => !isAmendeDeleted(amende))
    .filter((amende) => !isDetteAmende(amende))
    .filter((amende) => (Number(amende.amount) || 0) > 0 || getAmendeRepaidAmount(amende) > 0)
    .map((amende) => {
      const remaining = Math.round((Number(amende.amount) || 0) * 100) / 100;
      const repaid = getAmendeRepaidAmount(amende);
      const original = Math.round((Number(amende.originalAmount) || remaining + repaid) * 100) / 100;
      const member = getMemberById(amende.memberId);
      const note = getAmendeDetailText(amende);
      return {
        id: amende.id,
        domId: `admin-amende-${amende.id}`,
        date: amende.date,
        type: amende.type,
        detail: note && note !== "—" ? `${member?.name || "—"} — ${note}` : member?.name || "—",
        original,
        repaid,
        remaining,
        settled: remaining <= 0,
        actions: remaining > 0
          ? buildAmendeActionControls(amende, { showEdit: true })
          : "",
        sortAt: amende.settledAt || amende.date,
      };
    });

  const paidRows = [...amendesCaisse]
    .filter((entry) => !openRows.some((row) => row.id === entry.sourceAmendeId))
    .map((entry) => {
      const member = getMemberById(entry.memberId);
      const amount = Number(entry.amount) || 0;
      return {
        id: entry.id,
        date: entry.paidAt,
        type: entry.type || "sanctions",
        detail: entry.note ? `${member?.name || "—"} — ${entry.note}` : member?.name || "—",
        original: amount,
        repaid: amount,
        remaining: 0,
        settled: true,
        statusLabel: "Encaissée",
        chipClass: "is-paid",
        actions: `<button type="button" class="btn-secondary btn-amende-undo" data-id="${entry.id}">Annuler</button>`,
        sortAt: entry.paidAt,
      };
    });

  const rows = [...openRows, ...paidRows].sort((a, b) => {
    if (a.settled !== b.settled) return a.settled ? 1 : -1;
    return new Date(b.sortAt || 0) - new Date(a.sortAt || 0);
  });

  renderLedgerInto(openEl, {
    noun: "amende",
    emptyMeta: "Aucune amende en cours",
    emptyText: "Aucune amende pour le moment.",
    rowIdPrefix: "admin-amende",
    rows,
  });
  if (paidEl) paidEl.innerHTML = "";
}

function loadPrets() {
  const parsed = readSynced(PRETS_KEY, []);
  if (!Array.isArray(parsed)) return [];
  // Recalcule totalRepaid depuis l'historique pour rester cohérent après sync
  return parsed.map((loan) => {
    if (!loan || typeof loan !== "object") return loan;
    if (!Array.isArray(loan.repayments)) loan.repayments = [];
    const fromHistory =
      Math.round(
        loan.repayments.reduce((sum, r) => sum + (Number(r?.amount) || 0), 0) * 100
      ) / 100;
    if (fromHistory > 0 || loan.repayments.length > 0) {
      loan.totalRepaid = fromHistory;
    } else {
      loan.totalRepaid = Math.round((Number(loan.totalRepaid) || 0) * 100) / 100;
    }
    return loan;
  });
}

function loadNotifications() {
  const parsed = readSynced(NOTIFICATIONS_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function savePrets(shouldRender = true) {
  localStorage.setItem(PRETS_KEY, JSON.stringify(prets));
  if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();
  if (!shouldRender) return;
  renderPrets();
  renderMesDettes();
  if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
}

function saveNotifications(shouldRender = true) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  if (shouldRender) renderPrets();
  flushPushMessages();
}

function getTotalAmendesInCaisse() {
  return amendesCaisse.reduce((sum, entry) => {
    if (!entry || entry.deletedAt) return sum;
    return sum + (Number(entry.amount) || 0);
  }, 0);
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
    if (isLoanDeleted(loan)) return sum;
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

/** Argent dehors hors groupe (ex-membre, prêt non récupéré, etc.) */
function loadCapitalHorsGroupe() {
  const parsed = readSynced(CAPITAL_HORS_GROUPE_KEY, []);
  if (!Array.isArray(parsed)) return [];
  // Garder les tombes (deletedAt) pour la synchro, le total ignore les supprimés
  return parsed.filter((e) => e && e.id);
}

function saveCapitalHorsGroupe(shouldRender = true) {
  localStorage.setItem(CAPITAL_HORS_GROUPE_KEY, JSON.stringify(capitalHorsGroupe));
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  if (shouldRender) {
    renderCapitalHorsGroupeAdmin();
    renderPrets();
    renderFinanceDashboard();
    if (typeof renderAutreArgent === "function") renderAutreArgent();
  }
}

function getCapitalHorsGroupeTotal() {
  return capitalHorsGroupe.reduce((sum, entry) => {
    if (!entry || entry.deletedAt) return sum;
    return sum + Math.max(0, Number(entry.amount) || 0);
  }, 0);
}

/** Capital total dehors = prêts en cours + argent hors groupe */
function getTotalCapitalOut() {
  return getLoansCapitalOut() + getCapitalHorsGroupeTotal();
}

/**
 * Caisse disponible : fond + amendes + dons − prêts sortis (membres) + remboursements.
 * L'argent "hors groupe" (ex-membres) n'y figure pas : il n'est plus en caisse.
 * Sert aux prêts (argent libre).
 */
function getCaisseDisponible() {
  return Math.max(0, getCaisseBase() + getTotalAutreArgent() + getLoansCashImpact());
}

/**
 * Caisse total = argent encore en caisse + prêts sortis + créances hors groupe (ex-membres).
 * Les 850 € d'un ex-membre augmentent bien ce total sans être "disponibles".
 */
function getCaisseTotal() {
  return getCaisseDisponible() + getLoansCapitalOut() + getCapitalHorsGroupeTotal();
}

function addCapitalHorsGroupe(label, amount) {
  if (!canEditFondCaisse() && !canManageCaisseArgent()) {
    alert("Seul un administrateur (accès Caisse) peut ajouter de l'argent dehors.");
    return false;
  }
  const parsed = Math.round(parseFloat(amount) * 100) / 100;
  if (Number.isNaN(parsed) || parsed <= 0) {
    alert("Montant invalide.");
    return false;
  }
  const name = String(label || "").trim() || "Ex-membre / créance";
  capitalHorsGroupe.unshift({
    id: generateId(),
    label: name,
    amount: parsed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  saveCapitalHorsGroupe();
  notifyAllMembers(
    "capital_hors_groupe",
    `${getActorLabel()} a enregistré ${formatEuro(parsed)} dehors (${name}).`,
    { tab: "prets", title: "Argent dehors" }
  );
  return true;
}

async function deleteCapitalHorsGroupe(id) {
  if (!canEditFondCaisse() && !canManageCaisseArgent()) {
    alert("Seul un administrateur (accès Caisse) peut supprimer cette ligne.");
    return false;
  }
  const entry = capitalHorsGroupe.find((e) => e.id === id);
  if (!entry) return false;
  if (!(await appConfirm(`Retirer « ${entry.label} » (${formatEuro(entry.amount)}) de l'argent dehors ?`))) {
    return false;
  }
  const now = new Date().toISOString();
  entry.deletedAt = now;
  entry.updatedAt = now;
  saveCapitalHorsGroupe();
  return true;
}

function renderCapitalHorsGroupeAdmin() {
  const list = document.getElementById("capitalHorsGroupeList");
  const totalEl = document.getElementById("capitalHorsGroupeTotal");
  if (totalEl) totalEl.textContent = formatEuro(getCapitalHorsGroupeTotal());
  if (!list) return;
  const items = capitalHorsGroupe.filter((e) => e && !e.deletedAt);
  if (!items.length) {
    list.innerHTML = `<p class="panel-desc">Aucune créance hors groupe pour le moment.</p>`;
    return;
  }
  list.innerHTML = items
    .map(
      (e) => `
      <div class="capital-hors-item">
        <div>
          <strong>${escapeHtml(e.label || "—")}</strong>
          <span class="panel-desc">${formatEuro(e.amount)} · ${formatDate((e.createdAt || "").split("T")[0] || "")}</span>
        </div>
        <button type="button" class="btn-pret-delete btn-capital-hors-delete" data-id="${escapeHtml(e.id)}">Supprimer</button>
      </div>`
    )
    .join("");
}

function getPendingVoteLoan() {
  return (
    prets.find(
      (loan) => !isLoanDeleted(loan) && PENDING_VOTE_STATUSES.includes(loan.status)
    ) || null
  );
}

function getBorrowerActiveLoan(memberId) {
  return (
    prets.find(
      (loan) =>
        !isLoanDeleted(loan) &&
        loan.borrowerId === memberId &&
        BORROWER_ACTIVE_STATUSES.includes(loan.status)
    ) || null
  );
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
  return prets.filter(
    (loan) => !isLoanDeleted(loan) && (loan.status === "active" || loan.status === "defaulted")
  );
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
  // Seuls les vrais membres du groupe votent (pas les "nouveaux")
  return getGroupMembers().filter((member) => member.id !== borrowerId);
}

function getVoteStats(loan) {
  const voters = getLoanVoters(loan.borrowerId);
  let yesCount = 0;
  let noCount = 0;
  const votes = loan?.votes && typeof loan.votes === "object" ? loan.votes : {};

  voters.forEach((voter) => {
    const vote = votes[voter.id];
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

/** Liste nominative des votes (Oui / Non / en attente) — pour Admin et suivi */
function buildVotersBreakdownHtml(loan) {
  const stats = getVoteStats(loan);
  const votes = loan?.votes && typeof loan.votes === "object" ? loan.votes : {};
  const yes = [];
  const no = [];
  const pending = [];
  stats.voters.forEach((v) => {
    const choice = votes[v.id];
    if (choice === "yes") yes.push(v.name);
    else if (choice === "no") no.push(v.name);
    else pending.push(v.name);
  });
  const line = (label, names, cls) => {
    if (!names.length) return "";
    return `<div class="pret-voters-line pret-voters-${cls}">
      <span class="pret-voters-label">${label} (${names.length})</span>
      <span class="pret-voters-names">${names.map((n) => escapeHtml(n)).join(", ")}</span>
    </div>`;
  };
  return `<div class="pret-voters-box" data-loan-id="${escapeHtml(loan.id || "")}">
    ${line("Oui", yes, "yes")}
    ${line("Non", no, "no")}
    ${line("En attente", pending, "pending")}
  </div>`;
}

function getLoanById(id) {
  return prets.find((loan) => loan.id === id);
}

function getLoanBalance(loan) {
  const base = Math.max(0, loan.amount - (loan.totalRepaid || 0));
  return base + (loan.interestAmount || 0);
}

function addMonthsYmd(ymd, months) {
  const [year, month, day] = String(ymd || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setMonth(date.getMonth() + months);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getLoanDueDates(loan) {
  const base = toDateInputValue(getLoanRequestDate(loan));
  if (!base) return null;
  const month1Ymd = addMonthsYmd(base, 1);
  const month2Ymd = addMonthsYmd(base, 2);
  if (!month1Ymd || !month2Ymd) return null;
  return {
    month1: new Date(`${month1Ymd}T12:00:00`),
    month2: new Date(`${month2Ymd}T12:00:00`),
    month1Ymd,
    month2Ymd,
  };
}

function formatLoanDueDatesLabel(loan, compact = false) {
  const dueDates = getLoanDueDates(loan);
  if (!dueDates) return "";
  if (compact) {
    const short = (ymd) => {
      const parts = String(ymd).split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : ymd;
    };
    return `80% ${short(dueDates.month1Ymd)} · Solde ${short(dueDates.month2Ymd)}`;
  }
  return `Échéance 80 % : ${formatDate(`${dueDates.month1Ymd}T12:00:00`)} · Solde : ${formatDate(`${dueDates.month2Ymd}T12:00:00`)}`;
}

function getLoanRequestDate(loan) {
  return loan?.createdAt || loan?.approvedAt || "";
}

let loanDateEditingId = null;
let loanDateSaving = false;
let loanDateIgnoreBlurUntil = 0;

function isLoanDateEditing() {
  return Boolean(loanDateEditingId);
}

function isUserEditingForm() {
  if (isLoanDateEditing()) return true;
  const el = document.activeElement;
  if (!el) return false;
  const tag = (el.tagName || "").toUpperCase();
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = (el.type || "").toLowerCase();
    if (type === "button" || type === "submit" || type === "checkbox" || type === "radio" || type === "hidden") {
      return false;
    }
    return true;
  }
  return Boolean(el.isContentEditable);
}

function stopLoanDateEdit() {
  loanDateEditingId = null;
}

function startLoanDateEdit(loanId) {
  if (!loanId || !canManagePretsActions()) return;
  loanDateEditingId = loanId;
  renderAdminPretLedger(true);
  const input = [...document.querySelectorAll(".pret-request-date-input")].find(
    (el) => el.dataset.loanId === loanId
  );
  if (!input) return;
  loanDateIgnoreBlurUntil = Date.now() + 500;
  input.focus();
  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
    } catch {
      /* picker déjà ouvert ou non supporté */
    }
  }
}

async function updateLoanRequestDate(loanId, ymd) {
  if (!canManagePretsActions()) {
    alert("Seul le Financier ou un administrateur peut modifier la date de demande.");
    return false;
  }

  const loan = getLoanById(loanId);
  if (!loan) return false;

  const nextCreated = combineDateWithTime(ymd, loan.createdAt);
  if (!nextCreated) {
    alert("Date invalide.");
    return false;
  }
  if (toDateInputValue(getLoanRequestDate(loan)) === ymd) {
    stopLoanDateEdit();
    renderAdminPretLedger(true);
    return true;
  }

  loan.createdAt = nextCreated;
  if (loan.approvedAt) loan.approvedAt = combineDateWithTime(ymd, loan.approvedAt) || loan.approvedAt;
  if (loan.financierDecidedAt) {
    loan.financierDecidedAt = combineDateWithTime(ymd, loan.financierDecidedAt) || loan.financierDecidedAt;
  }
  loan.updatedAt = new Date().toISOString();
  if (loan.status === "active" || loan.status === "defaulted" || loan.status === "completed") {
    const dueDates = getLoanDueDates(loan);
    const dueLabel = dueDates ? formatDate(`${dueDates.month1Ymd}T12:00:00`) : "—";
    upsertLoanNotification(
      loan.borrowerId,
      loan.id,
      "loan_approved",
      `Prêt accordé — ${formatEuro(loan.amount)}. Remboursez 80 % avant le ${dueLabel}.`
    );
    saveNotifications(false);
  }
  savePrets(false);
  try {
    localStorage.setItem("poto-timide-data-revision", JSON.stringify(Date.now()));
  } catch {
    /* ignore */
  }

  const flush = window.flushPotoServerSync || window.potoFlushSync;
  if (typeof flush === "function") {
    try {
      await flush();
    } catch (err) {
      console.warn("Synchronisation de la date de prêt :", err);
    }
  }

  stopLoanDateEdit();
  renderPrets();
  renderMesDettes();
  if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
  showPretSaveMessage(`Date de demande mise à jour : ${formatFriendlyDate(ymd)}.`);
  return true;
}

window.potoIsLoanDateEditing = isLoanDateEditing;
window.potoIsUserEditingForm = isUserEditingForm;

const pendingPushMessages = [];
/** Domaine public : le clic notif ouvre ce site (prod) */
const PUBLIC_APP_ORIGIN = "https://pototimide.com";

function buildNotificationDeepLinkUrl({ tab = "prets", admin = "", loanId = "", item = "" } = {}) {
  const params = new URLSearchParams();
  if (tab) params.set("tab", tab);
  if (admin) params.set("admin", admin);
  if (loanId) params.set("loan", loanId);
  if (item) params.set("item", item);
  let origin = PUBLIC_APP_ORIGIN;
  try {
    if (typeof location !== "undefined" && location.hostname) {
      if (/localhost|127\.0\.0\.1/.test(location.hostname)) {
        origin = location.origin;
      } else if (location.hostname.includes("pototimide")) {
        origin = location.origin;
      } else {
        // Render ou autre → renvoyer vers le domaine public
        origin = PUBLIC_APP_ORIGIN;
      }
    }
  } catch {
    /* keep PUBLIC_APP_ORIGIN */
  }
  return `${origin}/?${params.toString()}`;
}

function queuePushMessage(memberId, payload) {
  const current = getCurrentMember();
  if (!memberId || current?.id === memberId) return;
  if (shouldSuppressDevNotifications()) return;
  const tab = payload.tab || "prets";
  const loanId = payload.loanId || "";
  const admin = payload.admin || "";
  const item = payload.item || "";
  const url =
    payload.url || buildNotificationDeepLinkUrl({ tab, admin, loanId, item });
  pendingPushMessages.push({
    memberId,
    title: payload.title || "Poto Timide",
    body: payload.body || "",
    url,
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
  const now = new Date().toISOString();
  notifications.unshift({
    id: generateId(),
    memberId,
    type,
    loanId: loanId || "",
    message,
    read: false,
    createdAt: now,
    updatedAt: now,
  });
}

function getActorLabel() {
  return getCurrentMember()?.name || "Le Financier";
}

/** Dario (développeur / owner) : aucune notif in-app ni push quand c'est lui qui agit */
function shouldSuppressDevNotifications() {
  const current = getCurrentMember();
  if (!current) return false;
  if (typeof isOwnerMember === "function" && isOwnerMember(current)) return true;
  const name = String(current.name || "").trim().toLowerCase();
  if (name === String(ADMIN_NAME || "Dario").toLowerCase()) return true;
  return false;
}


function notifyAllMembers(type, message, extras = {}) {
  if (shouldSuppressDevNotifications()) return;
  const { loanId = "", tab = "prets", title = "Poto Timide" } = extras;
  getSortedMembers().forEach((member) => {
    addNotification(member.id, type, loanId, message);
    queuePushMessage(member.id, {
      title,
      body: message,
      tab,
      loanId,
      tag: `${type}-${loanId || generateId()}`,
    });
  });
  saveNotifications(false);
  if (typeof window.flushPotoServerSync === "function") {
    window.flushPotoServerSync();
  }
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
  if (shouldSuppressDevNotifications()) return;
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
  notifyAllMembers(
    "loan_initiated",
    `${borrowerName} a initié un prêt de ${amountLabel}. Votez Oui ou Non sous 24 h.`,
    { loanId: loan.id, tab: "prets", title: "Nouveau prêt" }
  );
}

function notifyFinancierForLoan(loan) {
  if (shouldSuppressDevNotifications()) return;
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
  if (shouldSuppressDevNotifications()) return;
  upsertLoanNotification(loan.borrowerId, loan.id, type, message);
}

function processLoanStatusUpdates() {
  const now = Date.now();
  let changed = false;

  prets.forEach((loan) => {
    if (isLoanDeleted(loan)) return;
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

  const motif = String(note || "").trim();
  if (motif.length < 3) {
    alert("Le motif est obligatoire (au moins 3 caractères).");
    pretNoteInput?.focus();
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
    updatedAt: createdAt.toISOString(),
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
  logAudit("Prêt · demande", `${current.name} demande ${formatEuro(parsedAmount)}${motif ? ` — ${motif}` : ""}`);
  savePrets();
  pretForm.reset();
}

/** Votes locaux non encore confirmés par le serveur — ne jamais les perdre au pull */
const pendingLocalVotes = new Map(); // loanId -> { [memberId]: "yes"|"no", at: iso }

function rememberLocalVote(loanId, memberId, choice) {
  if (!loanId || !memberId) return;
  const prev = pendingLocalVotes.get(loanId) || {};
  pendingLocalVotes.set(loanId, {
    ...prev,
    [memberId]: choice,
    at: new Date().toISOString(),
  });
}

/** Réapplique les votes locaux après un reload / pull (évite les boutons qui réapparaissent) */
function applyPendingLocalVotesToPrets() {
  if (!pendingLocalVotes.size || !Array.isArray(prets)) return false;
  let changed = false;
  pendingLocalVotes.forEach((voteMap, loanId) => {
    const loan = prets.find((l) => l && l.id === loanId && !isLoanDeleted(l));
    if (!loan) return;
    if (!loan.votes || typeof loan.votes !== "object") loan.votes = {};
    Object.entries(voteMap).forEach(([memberId, choice]) => {
      if (memberId === "at") return;
      if (choice !== "yes" && choice !== "no") return;
      if (loan.votes[memberId] !== choice) {
        loan.votes[memberId] = choice;
        changed = true;
      }
    });
    if (changed) {
      const at = voteMap.at || new Date().toISOString();
      if (!loan.updatedAt || new Date(at).getTime() >= new Date(loan.updatedAt).getTime()) {
        loan.updatedAt = at;
      }
    }
  });
  return changed;
}

function clearConfirmedLocalVotes() {
  pendingLocalVotes.forEach((voteMap, loanId) => {
    const loan = prets.find((l) => l && l.id === loanId);
    if (!loan || !loan.votes) return;
    let allPresent = true;
    Object.entries(voteMap).forEach(([memberId, choice]) => {
      if (memberId === "at") return;
      if (loan.votes[memberId] !== choice) allPresent = false;
    });
    if (allPresent) pendingLocalVotes.delete(loanId);
  });
}

async function votePret(loanId, vote) {
  const current = getCurrentMember();
  if (!current) return;

  const loan = getLoanById(loanId);
  if (!loan || loan.status !== "voting") return;
  if (loan.borrowerId === current.id) return;

  // Déjà voté → on ne propose plus les boutons
  if (!loan.votes || typeof loan.votes !== "object") loan.votes = {};
  if (loan.votes[current.id] === "yes" || loan.votes[current.id] === "no") {
    rememberLocalVote(loanId, current.id, loan.votes[current.id]);
    renderPrets();
    return;
  }

  const choice = vote === "yes" ? "yes" : "no";
  loan.votes[current.id] = choice;
  loan.updatedAt = new Date().toISOString();
  rememberLocalVote(loanId, current.id, choice);
  logAudit("Prêt · vote", `${current.name} vote ${choice === "yes" ? "Oui" : "Non"}`);
  confirmVoterNotification(loan, current.id);

  const stats = getVoteStats(loan);
  if (stats.unanimousYes) {
    loan.status = "awaiting_financier";
    loan.autoApprovedByTimeout = false;
    loan.updatedAt = new Date().toISOString();
    finalizeVotePhaseNotifications(loan);
    notifyFinancierForLoan(loan);
    saveNotifications(false);
  } else {
    saveNotifications(false);
  }

  // Affichage immédiat + forcer une synchro prioritaires des prêts
  savePrets();
  renderPrets();
  if (typeof renderAdminPrets === "function" && isAdminWorkspace?.() && activeAdminSub === "prets") {
    try { renderAdminPrets(); } catch { /* ignore */ }
  }

  // Sync serveur avec retries + réapplication si un pull a écrasé
  const flush = window.potoFlushSync || window.flushPotoServerSync;
  if (typeof flush !== "function") return;

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const live = getLoanById(loanId);
      if (live) {
        if (!live.votes || typeof live.votes !== "object") live.votes = {};
        if (live.votes[current.id] !== choice) {
          live.votes[current.id] = choice;
          live.updatedAt = new Date().toISOString();
          rememberLocalVote(loanId, current.id, choice);
          savePrets(false);
        }
      }
      const ok = await flush();
      if (ok) {
        clearConfirmedLocalVotes();
        // Tirer immédiatement les votes des autres
        if (typeof window.potoPullSharedUpdates === "function") {
          await window.potoPullSharedUpdates();
        }
        renderPrets();
        return;
      }
    } catch (err) {
      console.warn("Synchronisation du vote échouée, nouvel essai…", err);
    }
    await new Promise((r) => setTimeout(r, 250 + attempt * 200));
  }
  console.warn("Vote enregistré localement mais sync serveur non confirmée.");
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
    loan.updatedAt = loan.financierDecidedAt;
    updateLoanNotificationsOnDecision(loan, "approved");
  } else {
    loan.status = "rejected";
    loan.financierDecision = "rejected";
    loan.financierDecidedAt = new Date().toISOString();
    loan.updatedAt = loan.financierDecidedAt;
    updateLoanNotificationsOnDecision(loan, "rejected");
  }

  const actor = getActorLabel();
  const action = decision === "approved" ? "accordé" : "refusé";
  notifyAllMembers(
    decision === "approved" ? "loan_approved" : "loan_rejected",
    `${actor} a ${action} le prêt de ${borrower?.name || "un membre"} (${formatEuro(loan.amount)}).`,
    { loanId: loan.id, tab: "prets", title: decision === "approved" ? "Prêt accordé" : "Prêt refusé" }
  );
  logAudit(
    decision === "approved" ? "Prêt · accordé" : "Prêt · refusé",
    `${borrower?.name || "membre"} — ${formatEuro(loan.amount)}`
  );
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
  const now = new Date().toISOString();
  loan.repayments.push({
    id: generateId(),
    amount: parsedAmount,
    date: now,
    recordedBy: current?.id || null,
  });
  syncLoanRepaidFromHistory(loan);
  loan.updatedAt = now;

  const actor = getActorLabel();
  const borrower = getMemberById(loan.borrowerId);
  notifyAllMembers(
    "financier_repay",
    `${actor} a enregistré un remboursement de ${formatEuro(parsedAmount)} pour ${borrower?.name || "un membre"} (prêt ${formatEuro(loan.amount)}).`,
    { loanId: loan.id, tab: "prets", title: "Remboursement" }
  );
  if (loan.status === "completed") {
    notifyAllMembers(
      "loan_completed",
      `Le prêt de ${borrower?.name || "un membre"} (${formatEuro(loan.amount)}) est entièrement remboursé.`,
      { loanId: loan.id, tab: "prets", title: "Prêt remboursé" }
    );
  }

  logAudit(
    "Prêt · remboursement",
    `${borrower?.name || "membre"} — ${formatEuro(parsedAmount)} (prêt ${formatEuro(loan.amount)})`
  );
  savePrets();
  if (typeof potoFlushSync === "function") {
    Promise.resolve(potoFlushSync()).catch(() => {});
  }
  showPretSaveMessage(
    `${formatEuro(parsedAmount)} retournés dans la caisse. Reste sur ce prêt : ${formatEuro(getLoanBalance(loan))}. Prêts sortis : ${formatEuro(getLoansCapitalOut())}.`
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

function isLoanDeleted(loan) {
  return Boolean(loan?.deletedAt);
}

async function deletePret(loanId) {
  if (!canManagePretsActions()) {
    alert("Seul le Financier ou un administrateur peut supprimer un prêt.");
    return;
  }

  const loan = getLoanById(loanId);
  if (!loan || isLoanDeleted(loan)) return;

  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "ce membre";

  if (
    !(await appConfirm(
      `Supprimer définitivement le prêt de ${borrowerName} (${formatEuro(loan.amount)}) ?`
    ))
  ) {
    return;
  }

  // Soft-delete : on garde une tombe pour que la synchro ne ramène pas le prêt
  const now = new Date().toISOString();
  loan.deletedAt = now;
  loan.updatedAt = now;
  loan.status = "rejected";

  notifications = notifications.filter((notif) => notif.loanId !== loanId);

  notifyAllMembers(
    "loan_deleted",
    `${getActorLabel()} a supprimé le prêt de ${borrowerName} (${formatEuro(loan.amount)}).`,
    { loanId, tab: "prets", title: "Prêt supprimé" }
  );
  logAudit("Prêt · suppression", `Prêt ${loanId} supprimé`);
  savePrets();
  saveNotifications(false);
  try {
    if (typeof potoFlushSync === "function") await potoFlushSync();
    else if (typeof window.flushPotoServerSync === "function") await window.flushPotoServerSync();
  } catch (err) {
    console.warn("Sync suppression prêt échouée", err);
  }
  renderPrets();
  if (typeof renderAdminPrets === "function") renderAdminPrets();
}

function isPretNotification(notif) {
  if (!notif || notif.deletedAt) return false;
  const type = String(notif.type || "");
  return Boolean(notif.loanId) || type.startsWith("loan_") || type.startsWith("financier_");
}

function isPersonalNotificationFor(notif, memberId) {
  if (!notif || notif.memberId !== memberId || notif.deletedAt) return false;
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
  if (canDecidePrets()) return true;
  return isAdminWorkspace() && hasRoleTabAccess("prets");
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

/** Enregistre une action sensible (visible Admin → Sauvegarde) */
function logAudit(action, detail = "") {
  try {
    const actor = getCurrentMember();
    auditLog.unshift({
      id: generateId(),
      at: new Date().toISOString(),
      actorId: actor?.id || null,
      actorName: actor?.name || "Système",
      action: String(action || "").slice(0, 120),
      detail: String(detail || "").slice(0, 280),
    });
    if (auditLog.length > AUDIT_LOG_MAX) auditLog = auditLog.slice(0, AUDIT_LOG_MAX);
    saveAuditLog();
  } catch (err) {
    console.warn("Journal audit:", err);
  }
}

function renderAuditLog() {
  const list = document.getElementById("auditLogList");
  if (!list) return;
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
  if (!isLoggedIn()) return false;
  if (typeof isNouveauMember === "function" && isNouveauMember(getCurrentMember())) return false;
  if (isGroupAdmin()) return true;
  // Financier / poste avec accès événements
  if (typeof isFinancierPoste === "function" && isFinancierPoste()) return true;
  return hasRoleTabAccess("evenements");
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
  if (!isLoggedIn()) return false;
  if (isGroupAdmin()) return true;
  if (typeof canPublishCommunication === "function" && canPublishCommunication()) return true;
  return hasRoleTabAccess("communication");
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
  if (!item) return;
  if (!confirm("Supprimer cet article du guide ?")) return;
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
  if (!requireTabAccess("communication", "supprimer une publication")) return;
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

async function clearRole(roleId) {
  if (!requireTabAccess("bureau", "modifier le bureau")) return;

  const member = getMemberById(roles[roleId]);
  if (!member) return;

  if (await appConfirm(`Retirer « ${member.name} » du poste de ${getRoleLabel(roleId)} ?`)) {
    delete roles[roleId];
    saveRoles();
  }
}

async function addMember(name, kind = "member") {
  // Autoriser depuis Admin → Membres (workspace admin)
  if (!isLoggedIn()) {
    alert("Veuillez vous connecter avec votre nom.");
    openLoginModal();
    return;
  }
  if (!(isGroupAdmin() || hasRoleTabAccess("membres"))) {
    alert("Vous n'avez pas l'autorisation d'ajouter des membres.");
    return;
  }
  // Si on est dans Admin, on n'exige pas le test isSimpleAccountView
  if (!isAdminWorkspace() && isSimpleAccountView()) {
    alert("Cette action se fait dans l'onglet Admin → Membres & Bureau.");
    return;
  }

  const trimmed = String(name || "").trim();
  if (!trimmed) {
    alert("Indique un nom.");
    memberNameInput?.focus();
    return;
  }

  if (isLimitReached()) {
    alert(`Maximum de ${MAX_MEMBERS} membres atteint.`);
    return;
  }

  if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
    alert("Ce nom existe déjà.");
    return;
  }

  const accountKind = kind === "nouveau" ? "nouveau" : "member";
  const newMember = {
    id: generateId(),
    name: trimmed,
    kind: accountKind,
    createdAt: new Date().toISOString(),
  };

  members.push(newMember);
  saveMembers();

  const kindLabel =
    accountKind === "nouveau"
      ? "Nouveau (accès uniquement à l'onglet La loi)"
      : "Membre du groupe";

  if (authState.loggedIn) {
    try {
      if (typeof potoFlushSync === "function") await potoFlushSync();
      const result = await apiEnsureMemberUser(newMember.id);
      if (result?.created) {
        alert(
          `${trimmed} ajouté — ${kindLabel}.\nMot de passe : 1234`
        );
      } else {
        alert(`${trimmed} ajouté — ${kindLabel}.`);
      }
    } catch (err) {
      console.warn("Compte non créé immédiatement :", err.message);
      alert(
        `${trimmed} enregistré (${kindLabel}), mais le compte n'a pas pu être créé tout de suite.\nRéinitialisez le mot de passe depuis la liste.`
      );
    }
  } else {
    alert(
      `${trimmed} est enregistré localement (${kindLabel}). Connectez-vous en admin pour activer son compte (mot de passe : 1234).`
    );
  }

  memberForm?.reset();
  const kindEl = memberKindSelect || document.getElementById("memberKind");
  if (kindEl) kindEl.value = "member";
  memberNameInput?.focus();
  if (typeof renderMemberList === "function") renderMemberList();
  if (typeof renderBureau === "function") renderBureau();
  // Rester sur la page Membres admin
  if (isAdminWorkspace() && activeAdminSub === "membres" && typeof showAdminSub === "function") {
    showAdminSub("membres");
  }
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

    if (
      key === TOURNEE_BOUFFE_OK_KEY ||
      key === TOURNEE_RECEPTION_OK_KEY ||
      key === TOURNEE_RISTOURNE_OK_KEY ||
      key === TOURNEE_RECEPTION_DATES_KEY
    ) {
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
  saveAdminIds(false);
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
  const name = memberNameInput?.value || "";
  const kindEl = memberKindSelect || document.getElementById("memberKind");
  const kind = kindEl?.value || "member";
  addMember(name, kind);
});

roleForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const memberId = roleMemberSelect.value;
  const roleId = rolePostSelect.value;
  if (!memberId || !roleId) return;
  assignRole(memberId, roleId);
});

const menuToggle = document.getElementById("menuToggle");
const adminMenuToggle = document.getElementById("adminMenuToggle");
const appNavBackdrop = document.getElementById("appNavBackdrop");
const adminNavBackdrop = document.getElementById("adminNavBackdrop");
const adminNavHost = document.getElementById("adminNavHost");
const adminSubtabsMount = document.getElementById("adminSubtabsMount");
const adminCurrentSubLabel = document.getElementById("adminCurrentSubLabel");

function isPhoneNav() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function syncPhoneNavClass() {
  document.documentElement.classList.toggle("phone-nav", isPhoneNav());
}

function setMenuToggleIcon(open) {
  const icon = menuToggle?.querySelector(".menu-toggle-icon");
  if (icon) icon.textContent = open ? "✕" : "☰";
}

function setSubMenuToggleIcon(open) {
  const icon = adminMenuToggle?.querySelector(".menu-toggle-icon");
  if (icon) icon.textContent = open ? "✕" : "☰";
}

function isAdminTabActive() {
  return document.getElementById("tab-admin")?.classList.contains("active");
}

function placeAdminSubtabs() {
  if (!adminSubtabs || !adminNavHost || !adminSubtabsMount) return;
  const host = isPhoneNav() ? adminNavHost : adminSubtabsMount;
  if (adminSubtabs.parentElement !== host) host.appendChild(adminSubtabs);
}

function syncAdminMenuToggle() {
  // Navigation admin = hub (plus de 3 barres / sous-menu latéral)
  placeAdminSubtabs();
  if (adminMenuToggle) adminMenuToggle.hidden = true;
  document.documentElement.classList.remove("admin-tab-on");
  closeAdminMenu();
}

function setPanelInert(el, inert) {
  if (!el) return;
  if (inert) el.setAttribute("inert", "");
  else el.removeAttribute("inert");
}

function openAdminMenu() {
  if (!isPhoneNav()) return;
  if (adminMenuToggle?.hidden) return;
  placeAdminSubtabs();
  closeAppMenu();
  document.body.classList.add("admin-menu-open");
  adminMenuToggle?.setAttribute("aria-expanded", "true");
  adminMenuToggle?.setAttribute("aria-label", "Fermer le menu Admin");
  setSubMenuToggleIcon(true);
  setPanelInert(adminSubtabs, false);
}

function closeAdminMenu() {
  document.body.classList.remove("admin-menu-open");
  adminMenuToggle?.setAttribute("aria-expanded", "false");
  adminMenuToggle?.setAttribute("aria-label", "Ouvrir le menu Admin");
  setSubMenuToggleIcon(false);
  setPanelInert(adminSubtabs, isPhoneNav());
}

function openAppMenu() {
  if (!isPhoneNav()) return;
  closeAdminMenu();
  document.body.classList.add("app-menu-open");
  menuToggle?.setAttribute("aria-expanded", "true");
  menuToggle?.setAttribute("aria-label", "Fermer le menu");
  setMenuToggleIcon(true);
  setPanelInert(document.getElementById("appNav"), false);
}

function closeAppMenu() {
  document.body.classList.remove("app-menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  setMenuToggleIcon(false);
  setPanelInert(document.getElementById("appNav"), isPhoneNav());
}

function toggleAppMenu() {
  if (document.body.classList.contains("app-menu-open")) closeAppMenu();
  else openAppMenu();
}

function setupMenuSwipe() {
  const EDGE = 40;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let tracking = false;
  let mode = "";
  let committed = false;

  function drawerEl() {
    return document.getElementById("appNav");
  }

  function drawerWidth() {
    return drawerEl()?.offsetWidth || Math.min(window.innerWidth * 0.78, 296);
  }

  function loginBlocksSwipe() {
    return Boolean(loginModal?.classList.contains("open") || document.getElementById("changePasswordModal")?.classList.contains("open"));
  }

  function isHorizScrollable(el) {
    let node = el;
    while (node && node !== document.body) {
      if (node instanceof HTMLElement) {
        const style = getComputedStyle(node);
        if ((style.overflowX === "auto" || style.overflowX === "scroll") && node.scrollWidth > node.clientWidth + 12) {
          return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  function setProgress(progress) {
    const nav = drawerEl();
    if (!nav) return;
    const p = Math.max(0, Math.min(1, progress));
    nav.classList.add("menu-swiping");
    nav.style.visibility = p > 0.02 ? "visible" : "hidden";
    nav.style.pointerEvents = "none";
    nav.style.transform = `translateX(${((1 - p) * 110).toFixed(2)}%)`;
    if (appNavBackdrop) {
      appNavBackdrop.style.display = p > 0.02 ? "block" : "none";
      appNavBackdrop.style.opacity = String(p);
      appNavBackdrop.style.pointerEvents = "none";
    }
  }

  function clearSwipeStyles() {
    const nav = drawerEl();
    if (nav) {
      nav.classList.remove("menu-swiping");
      nav.style.visibility = "";
      nav.style.pointerEvents = "";
      nav.style.transform = "";
    }
    if (appNavBackdrop) {
      appNavBackdrop.style.display = "";
      appNavBackdrop.style.opacity = "";
      appNavBackdrop.style.pointerEvents = "";
    }
  }

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!isPhoneNav() || e.touches.length !== 1) return;
      if (loginBlocksSwipe()) return;
      if (document.body.classList.contains("admin-menu-open")) return;
      const target = e.target;
      if (target instanceof Element && target.closest("input, textarea, select")) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = touch.clientX;
      committed = false;
      const menuOpen = document.body.classList.contains("app-menu-open");
      if (menuOpen) {
        // Menu ouvert : ne pas bloquer le scroll vertical ; fermeture = swipe horizontal clair
        tracking = true;
        mode = "maybe-close";
        return;
      }
      if (isHorizScrollable(target)) {
        tracking = false;
        return;
      }
      if (startX >= window.innerWidth - EDGE) {
        tracking = true;
        mode = "open";
        return;
      }
      tracking = true;
      mode = "maybe-open";
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!tracking) return;
      const touch = e.touches[0];
      lastX = touch.clientX;
      const dx = lastX - startX;
      const dy = touch.clientY - startY;
      // Priorité au scroll vertical (menu + page)
      if (!committed && Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
        tracking = false;
        mode = "";
        clearSwipeStyles();
        return;
      }
      if (mode === "maybe-close") {
        if (Math.abs(dx) < 14) return;
        if (dx <= 0 || Math.abs(dx) < Math.abs(dy) + 6) {
          tracking = false;
          mode = "";
          return;
        }
        mode = "close";
      }
      if (mode === "maybe-open") {
        if (dx > -24) return;
        if (startX < window.innerWidth * 0.55) {
          tracking = false;
          return;
        }
        mode = "open";
      }
      if (mode !== "open" && mode !== "close") return;
      committed = true;
      if (e.cancelable) e.preventDefault();
      const width = drawerWidth();
      if (mode === "open") setProgress(Math.max(0, Math.min(1, -dx / width)));
      else if (mode === "close") setProgress(Math.max(0, Math.min(1, 1 - dx / width)));
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    () => {
      if (!tracking) return;
      const dx = lastX - startX;
      const width = drawerWidth();
      const wasOpening = mode === "open";
      const wasClosing = mode === "close";
      tracking = false;
      mode = "";
      if (!committed) return;
      if (wasOpening) {
        if (-dx > Math.min(56, width * 0.25)) {
          clearSwipeStyles();
          openAppMenu();
        } else {
          clearSwipeStyles();
          closeAppMenu();
        }
        return;
      }
      if (!wasClosing) return;
      if (dx > Math.min(48, width * 0.2)) {
        clearSwipeStyles();
        closeAppMenu();
      } else {
        clearSwipeStyles();
        openAppMenu();
      }
    },
    { passive: true }
  );
}

setupMenuSwipe();

menuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAppMenu();
});
adminMenuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (document.body.classList.contains("admin-menu-open")) closeAdminMenu();
  else openAdminMenu();
});
appNavBackdrop?.addEventListener("click", closeAppMenu);
adminNavBackdrop?.addEventListener("click", closeAdminMenu);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (document.body.classList.contains("admin-menu-open")) closeAdminMenu();
  else closeAppMenu();
});
syncPhoneNavClass();
syncAdminMenuToggle();
closeAppMenu();
closeAdminMenu();
window.addEventListener("resize", () => {
  syncPhoneNavClass();
  syncAdminMenuToggle();
  if (!isPhoneNav()) {
    closeAppMenu();
    closeAdminMenu();
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

financeSubtabs?.addEventListener("click", (e) => {
  const btn = e.target.closest(".finance-subtab");
  if (!btn?.dataset.financeSub) return;
  showFinanceSub(btn.dataset.financeSub);
});

function handleCommunicationSubClick(e) {
  const btn = e.target.closest("[data-comm-sub]");
  if (!btn?.dataset.commSub) return;
  showCommunicationSub(btn.dataset.commSub);
}

communicationSubtabs?.addEventListener("click", handleCommunicationSubClick);
adminCommunicationSubtabs?.addEventListener("click", handleCommunicationSubClick);

communicationForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  publishCommunication();
});

communicationCancelBtn?.addEventListener("click", () => {
  cancelEditCommunication();
  renderCommunication();
});

function handleCommunicationListClick(e) {
  const readBtn = e.target.closest(".btn-comm-read");
  if (readBtn) {
    markCommunicationRead(readBtn.dataset.id);
    return;
  }
  const editBtn = e.target.closest(".btn-comm-edit");
  if (editBtn) {
    startEditCommunication(editBtn.dataset.id);
    return;
  }
  const deleteBtn = e.target.closest(".btn-comm-delete");
  if (deleteBtn) deleteCommunication(deleteBtn.dataset.id);
}

communicationList?.addEventListener("click", handleCommunicationListClick);
communicationAdminList?.addEventListener("click", handleCommunicationListClick);

loiForm?.addEventListener("submit", submitLoiForm);
document.getElementById("guideForm")?.addEventListener("submit", submitGuideForm);
document.getElementById("guideCancelBtn")?.addEventListener("click", cancelEditGuide);
document.getElementById("guideSearchInput")?.addEventListener("input", handleGuideSearchInput);
document.getElementById("guideSearchInput")?.addEventListener("search", handleGuideSearchInput);
document.getElementById("guideSearchInputAdmin")?.addEventListener("input", handleGuideSearchInput);
document.getElementById("guideSearchInputAdmin")?.addEventListener("search", handleGuideSearchInput);
document.getElementById("guideList")?.addEventListener("click", (e) => {
  const openCard = e.target.closest("[data-guide-open-id]");
  if (openCard) {
    openGuideArticleFromSearch(openCard.getAttribute("data-guide-open-id"));
    return;
  }
});
document.getElementById("guideAdminList")?.addEventListener("click", (e) => {
  const openCard = e.target.closest("[data-guide-open-id]");
  if (openCard) {
    openGuideArticleFromSearch(openCard.getAttribute("data-guide-open-id"));
    return;
  }
  const editBtn = e.target.closest(".btn-guide-edit");
  if (editBtn) {
    startEditGuide(editBtn.getAttribute("data-guide-id"));
    return;
  }
  const delBtn = e.target.closest(".btn-guide-delete");
  if (delBtn) {
    deleteGuideArticle(delBtn.getAttribute("data-guide-id"));
  }
});
loiCancelBtn?.addEventListener("click", () => {
  cancelEditLoi();
  renderLoiAdmin();
});
loiAdminList?.addEventListener("click", handleLoiListClick);
loiList?.addEventListener("click", handleLoiMemberListClick);
loiList?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const openCard = e.target.closest?.("[data-loi-open-id]");
  if (!openCard || !loiList?.contains(openCard)) return;
  e.preventDefault();
  openLoiArticleFromSearch(openCard.dataset.loiOpenId);
});
loiSearchInput?.addEventListener("input", handleLoiSearchInput);
loiSearchInput?.addEventListener("search", handleLoiSearchInput);

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

// Admin / Financier : marquer OK réception ou ristourne
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-bouffe-ok");
  if (!btn) return;
  e.preventDefault();
  const memberId = btn.dataset.memberId;
  const kind = btn.dataset.kind === "ristourne" ? "ristourne" : "reception";
  if (memberId) toggleTourneeMarkOk(kind, memberId);
});



document.getElementById("capitalHorsGroupeForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const label = document.getElementById("capitalHorsGroupeLabel")?.value;
  const amount = document.getElementById("capitalHorsGroupeAmount")?.value;
  if (addCapitalHorsGroupe(label, amount)) {
    e.target.reset();
  }
});
document.getElementById("capitalHorsGroupeList")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-capital-hors-delete");
  if (btn?.dataset.id) deleteCapitalHorsGroupe(btn.dataset.id);
});

saveTabPermissionsBtn?.addEventListener("click", () => saveTabPermissionsFromUI({ silent: false }));
tabPermissionsBody?.addEventListener("change", handleTabPermissionCheckboxChange);

amendeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    memberId: amendeMemberSelect?.value,
    type: amendeTypeSelect?.value,
    amount: amendeAmountInput?.value,
    note: amendeNoteInput?.value,
  };

  if (editingAmendeId) {
    if (payload.type === "ex-tournee" || payload.type === "ancienne-tournee") {
      alert("Pour modifier une dette d'ex tournée, supprime-la puis rajoute-la.");
      return;
    }
    if (!String(payload.note || "").trim()) {
      alert("Le motif est obligatoire.");
      return;
    }
    updateAmende(editingAmendeId, payload.memberId, payload.type, payload.amount, payload.note);
    return;
  }

  const ok = await submitUnifiedDettesAmendesLine(payload);
  if (ok) amendeForm?.reset();
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
  const loanId = item.dataset.loanId;
  if (loanId) openFromNotification({ tab: "prets", loanId });
});

document.getElementById("pretNotificationsClearBtn")?.addEventListener("click", deleteAllOwnNotifications);

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
  const input =
    btn.closest("tr, .amende-admin-actions")?.querySelector(".fond-caisse-annuel-pay-input") ||
    document.querySelector(
      `.fond-caisse-annuel-pay-input[data-member-id="${btn.dataset.memberId}"][data-year="${btn.dataset.year}"]`
    );
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

  if (yesBtn || noBtn) {
    const btn = yesBtn || noBtn;
    if (btn.dataset.voting === "1") return; // anti double-clic
    const actions = btn.closest(".pret-vote-actions");
    if (actions) {
      actions.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
        b.dataset.voting = "1";
      });
    } else {
      btn.disabled = true;
      btn.dataset.voting = "1";
    }
    await votePret(btn.dataset.loanId, yesBtn ? "yes" : "no");
    return;
  }

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

function handlePretRequestDateChange(e) {
  const input = e.target.closest(".pret-request-date-input");
  if (!input || !input.value) return;
  loanDateSaving = true;
  Promise.resolve(updateLoanRequestDate(input.dataset.loanId, input.value)).finally(() => {
    loanDateSaving = false;
  });
}

function handlePretRequestDateClick(e) {
  const btn = e.target.closest(".pret-date-cell-btn");
  if (!btn) return;
  e.preventDefault();
  startLoanDateEdit(btn.dataset.loanId);
}

function handlePretRequestDateFocusOut(e) {
  const input = e.target.closest(".pret-request-date-input");
  if (!input) return;
  const loanId = input.dataset.loanId;
  const wait = Math.max(80, loanDateIgnoreBlurUntil - Date.now());
  setTimeout(() => {
    if (loanDateSaving) return;
    if (loanDateEditingId !== loanId) return;
    if (document.activeElement?.classList?.contains("pret-request-date-input")) return;
    stopLoanDateEdit();
    renderAdminPretLedger(true);
  }, wait);
}

document.getElementById("tab-prets")?.addEventListener("click", handlePretActionClick);
document.getElementById("tab-admin")?.addEventListener("click", handlePretActionClick);
document.getElementById("tab-prets")?.addEventListener("change", handlePretRequestDateChange);
document.getElementById("tab-admin")?.addEventListener("change", handlePretRequestDateChange);
document.getElementById("tab-admin")?.addEventListener("click", handlePretRequestDateClick);
document.getElementById("tab-admin")?.addEventListener("focusout", handlePretRequestDateFocusOut);

lastFitViewportWidth = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth === lastFitViewportWidth) return;
  lastFitViewportWidth = window.innerWidth;
  fitTablesToScreen();
});
window.addEventListener("orientationchange", () => {
  lastFitViewportWidth = 0;
  setTimeout(() => {
    lastFitViewportWidth = window.innerWidth;
    fitTablesToScreen();
  }, 250);
});

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
  if (deleteBtn) {
    e.preventDefault();
    e.stopPropagation();
    const id = deleteBtn.dataset.id || deleteBtn.getAttribute("data-id");
    if (id) deleteAncienneTourneeDette(id);
    return;
  }
}

function handleAncienneTourneeKeydown(e) {
  if (e.key !== "Enter") return;
  const input = e.target.closest(".ancienne-tournee-repay-input");
  if (!input) return;
  e.preventDefault();
  repayAncienneTourneeDette(input.dataset.id, input.value);
}

document.getElementById("adminSub-amendes")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("adminExTourneePanel")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("tab-amendes")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("tab-admin")?.addEventListener("click", handleAncienneTourneeActionClick);
document.getElementById("adminSub-amendes")?.addEventListener("keydown", handleAncienneTourneeKeydown);
document.getElementById("tab-amendes")?.addEventListener("keydown", handleAncienneTourneeKeydown);
document.getElementById("tab-admin")?.addEventListener("keydown", handleAncienneTourneeKeydown);

const BACKUP_KEY_LABELS = {
  members: "Membres",
  roles: "Bureau",
  cotisations: "Cotisations",
  tournee: "Tournée",
  amendes: "Amendes",
  "amendes-caisse": "Caisse amendes",
  "tab-permissions": "Accès",
  prets: "Prêts",
  notifications: "Notifications",
  evenements: "Événements",
  communication: "Communication",
  loi: "La loi",
  "admin-ids": "Administrateurs",
  "autre-argent": "Autre argent",
  "ancienne-tournee-dettes": "Dettes ancienne tournée",
  finance: "Finance",
  "fond-caisse": "Fond de caisse",
  "fond-caisse-annuel": "Fond annuel",
  "financier-account": "Compte financier",
  "data-revision": "Révision",
};

function showBackupMessage(text, isError = false) {
  const el = document.getElementById("backupSaveMsg");
  if (!el) return;
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("save-msg-success", Boolean(text) && !isError);
  el.classList.toggle("save-msg-error", Boolean(isError));
}

async function fetchBackupJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    throw new Error(body?.error || `Erreur ${res.status}`);
  }
  return body;
}

async function loadBackupPanel() {
  const card = document.getElementById("backupStatusCard");
  const list = document.getElementById("backupKeysList");
  showBackupMessage("");
  if (card) card.innerHTML = `<p class="backup-status-loading">Lecture de la base…</p>`;
  if (list) list.innerHTML = "";

  try {
    const status = await fetchBackupJson("/api/admin/db-status");
    const hostNote = status.independentOfHost
      ? "Les données sont dans Turso (cloud), indépendantes de Render. Pour publier sur un domaine, reconnectez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sur le nouveau serveur."
      : "Les données sont dans le fichier SQLite local. Téléchargez une sauvegarde complète avant de changer d'hébergeur, puis restaurez-la sur le nouveau serveur.";

    if (card) {
      card.innerHTML = `
        <p class="backup-status-kicker">${status.independentOfHost ? "Base cloud prête" : "Base locale"}</p>
        <h3>${status.label || "Base de données"}</h3>
        <p class="backup-status-copy">${hostNote}</p>
        <ul class="backup-status-stats">
          <li><strong>${status.memberCount}</strong> membres</li>
          <li><strong>${status.userCount}</strong> comptes</li>
          <li><strong>${status.keyCount}/${status.keyTotal}</strong> jeux de données</li>
          <li><strong>${status.pushCount}</strong> notifications push</li>
        </ul>
      `;
    }

    if (list) {
      list.innerHTML = (status.keys || [])
        .map((item) => {
          const label = BACKUP_KEY_LABELS[item.key] || item.key;
          const state = item.present ? `${item.items} enreg.` : "manquant";
          return `<div class="backup-key-row ${item.present ? "is-present" : "is-missing"}">
            <span>${label}</span>
            <strong>${state}</strong>
          </div>`;
        })
        .join("");
    }
  } catch (err) {
    if (card) {
      card.innerHTML = `<p class="backup-status-copy">Impossible de lire la base : ${err.message}</p>`;
    }
  }
}

async function downloadFullBackup() {
  showBackupMessage("");
  try {
    const dump = await fetchBackupJson("/api/admin/export");
    const stamp = String(dump.exportedAt || "").slice(0, 10) || "export";
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `poto-timide-sauvegarde-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showBackupMessage("Sauvegarde téléchargée. Gardez ce fichier hors ligne avant de changer d'hébergeur.");
  } catch (err) {
    showBackupMessage(err.message || "Téléchargement impossible.", true);
  }
}

async function restoreFullBackupFromFile(file) {
  if (!file) return;
  showBackupMessage("");

  let dump;
  try {
    dump = JSON.parse(await file.text());
  } catch {
    showBackupMessage("Fichier illisible. Choisissez une sauvegarde Poto Timide (.json).", true);
    return;
  }

  if (dump?.kind !== "poto-timide-full-dump") {
    showBackupMessage("Ce fichier n'est pas une sauvegarde Poto Timide.", true);
    return;
  }

  const confirmed = await appConfirm(
    "Cette restauration remplace les données actuelles par le fichier choisi (membres, tournée, amendes, prêts, communication, comptes). Continuer ?",
    "Restaurer la sauvegarde"
  );
  if (!confirmed) return;

  try {
    const result = await fetchBackupJson("/api/admin/import", {
      method: "POST",
      body: JSON.stringify({ confirm: "RESTAURER", dump }),
    });
    await appAlert(
      `Restauration enregistrée : ${result.keys} jeux de données, ${result.users} comptes. La page se recharge depuis la base.`,
      "Sauvegarde restaurée"
    );
    window.location.reload();
  } catch (err) {
    showBackupMessage(err.message || "Restauration impossible.", true);
  }
}

document.getElementById("backupDownloadBtn")?.addEventListener("click", () => {
  downloadFullBackup();
});

document.getElementById("backupImportInput")?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  restoreFullBackupFromFile(file);
});

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

document.getElementById("evenementFormPublic")?.addEventListener("submit", (e) => {
  e.preventDefault();
  createEvenement(
    document.getElementById("evenementTitlePublic")?.value,
    document.getElementById("evenementAmountPublic")?.value,
    document.getElementById("evenementDescPublic")?.value,
    document.getElementById("evenementMemberPublic")?.value
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
  const payAllBtn = e.target.closest(".btn-evenement-pay-all");
  if (payAllBtn) {
    markAllEvenementPaid(payAllBtn.dataset.eventId);
    return;
  }
  const paySelectedBtn = e.target.closest(".btn-evenement-pay-selected");
  if (paySelectedBtn) {
    const eventId = paySelectedBtn.dataset.eventId;
    const root = paySelectedBtn.closest(".evenement-card") || e.currentTarget;
    const select = root.querySelector(`.evenement-pay-select[data-event-id="${eventId}"][data-role="pay"]`);
    const input = root.querySelector(`.evenement-pay-input-single[data-event-id="${eventId}"]`);
    const memberId = select?.value;
    if (!memberId) {
      alert("Choisis un poto.");
      return;
    }
    validateEvenementPayment(eventId, memberId, input?.value);
  }
  const unpaySelectedBtn = e.target.closest(".btn-evenement-unpay-selected");
  if (unpaySelectedBtn) {
    const eventId = unpaySelectedBtn.dataset.eventId;
    const root = unpaySelectedBtn.closest(".evenement-card") || e.currentTarget;
    const select = root.querySelector(`.evenement-pay-select[data-event-id="${eventId}"][data-role="unpay"]`);
    const memberId = select?.value;
    if (!memberId) {
      alert("Choisis un poto déjà payé.");
      return;
    }
    cancelEvenementPayment(eventId, memberId);
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

  const hinted = applySessionHint();
  if (hinted) {
    revealApp(true);
    loginModal?.classList.remove("open");
    appEl?.classList.remove("app-blurred");
    updateSessionUI();
    render();
    showTab(getSavedTab());
  }

  try {
    await checkServerSession();
  } catch (err) {
    console.error(err);
    reloadFromStorage();
    if (!hinted) {
      revealApp(false);
      openLoginModal();
      loginError.textContent =
        "Serveur indisponible — vos données locales sont conservées. Reconnectez-vous.";
      loginError.hidden = false;
    }
    appReady = true;
    updateSessionUI();
    render();
    showTab(getSavedTab());
    return;
  }

  if (authState.loggedIn) {
    await restoreLoggedInApp();
    revealApp(true);
  } else {
    revealApp(false);
    openLoginModal();
  }

  window.potoOnServerDataPulled = () => {
    if (typeof window.potoIsUserEditingForm === "function" && window.potoIsUserEditingForm()) return;
    if (typeof window.potoIsLoanDateEditing === "function" && window.potoIsLoanDateEditing()) return;

    // Mémoriser scroll page + tableaux
    const pageScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollSnapshot = [];
    document.querySelectorAll(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap").forEach((wrap, index) => {
      if (wrap.scrollLeft > 0) {
        scrollSnapshot.push({
          index,
          left: wrap.scrollLeft,
          parentId: wrap.closest("[id]")?.id || "",
        });
      }
    });

    reloadFromStorage();
    updatePretTabBadge();

    const isActive = (id) => document.getElementById(id)?.classList.contains("active");
    const tabReunion = isActive("tab-reunion");
    const tabMembres = isActive("tab-membres");
    const tabTournee = isActive("tab-tournee");
    const tabPrets = isActive("tab-prets");
    const tabEvenements = isActive("tab-evenements");
    const tabAmendes = isActive("tab-amendes");
    const tabFinance = isActive("tab-finance");
    const tabLoi = isActive("tab-loi");
    const tabComm = isActive("tab-communication");
    const tabAdmin = isActive("tab-admin");

    // --- Toujours resynchroniser les vues dépendantes (légères) ---
    try {
      if (typeof renderCommunication === "function") renderCommunication();
      if (typeof renderEvenements === "function") renderEvenements();
      if (typeof renderAmendes === "function") renderAmendes();
      if (typeof renderMesDettes === "function") renderMesDettes();
      if (typeof renderFinanceDashboard === "function") renderFinanceDashboard();
      if (typeof renderFondCaisseAnnuel === "function") renderFondCaisseAnnuel();
      if (typeof renderAncienneTourneeMemberView === "function") renderAncienneTourneeMemberView();
      if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
    } catch (err) {
      console.warn("refresh données:", err);
    }

    // --- Onglet visible : refresh complet ---
    try {
      if (tabReunion && typeof renderReunion === "function") renderReunion();
      else if (typeof refreshReunionIfActive === "function") refreshReunionIfActive();

      if (tabMembres) {
        if (typeof renderBureau === "function") renderBureau();
        if (typeof renderMemberList === "function") renderMemberList();
        if (typeof renderOnlineList === "function") renderOnlineList();
        if (typeof renderAdminList === "function") renderAdminList();
      }

      if (tabTournee && typeof renderTourneeTable === "function") renderTourneeTable();

      if (tabPrets && typeof renderPrets === "function") renderPrets();

      if (tabEvenements && typeof renderEvenements === "function") renderEvenements();

      if (tabAmendes) {
        if (typeof renderAmendes === "function") renderAmendes();
        if (typeof renderMesAmendes === "function") renderMesAmendes();
        if (typeof renderMesDettes === "function") renderMesDettes();
      }

      if (tabFinance && typeof renderFinance === "function") renderFinance();
      else if (tabFinance && typeof renderFinanceDashboard === "function") renderFinanceDashboard();

      if (tabLoi && typeof renderLoi === "function") renderLoi();

      if (tabComm && typeof renderCommunication === "function") renderCommunication();
      if (tabComm && activeCommunicationSub === "guide" && typeof renderGuidePanels === "function") {
        renderGuidePanels();
      }

      if (tabAdmin) {
        if (typeof renderTourneeTable === "function" && activeAdminSub === "tournee") renderTourneeTable();
        if (activeAdminSub === "amendes" || activeAdminSub === "ancienne-tournee") {
          if (typeof renderAncienneTourneeDettesAdmin === "function") renderAncienneTourneeDettesAdmin();
          if (typeof renderAmendesAdminHistory === "function") renderAmendesAdminHistory();
        }
        if (activeAdminSub === "communication" && typeof renderCommunication === "function") renderCommunication();
        if (activeAdminSub === "prets" && typeof renderAdminPrets === "function") renderAdminPrets();
        if (activeAdminSub === "loi" && typeof renderLoiAdmin === "function") renderLoiAdmin();
        if (activeAdminSub === "acces" && typeof renderTabPermissionsPanel === "function") renderTabPermissionsPanel();
        if (activeAdminSub === "caisse") {
          if (typeof renderFondCaissePanel === "function") renderFondCaissePanel();
          if (typeof renderAutreArgent === "function") renderAutreArgent();
        }
        if (activeAdminSub === "evenements" && typeof renderEvenements === "function") renderEvenements();
        if (activeAdminSub === "membres") {
          if (typeof renderBureau === "function") renderBureau();
          if (typeof renderMemberList === "function") renderMemberList();
          if (typeof renderAdminList === "function") renderAdminList();
        }
        if (activeAdminSub === "admins" && typeof renderAdminList === "function") renderAdminList();
        if (activeAdminSub === "sauvegarde" && typeof renderAuditLog === "function") renderAuditLog();
      }
    } catch (err) {
      console.warn("refresh UI après pull:", err);
    }

    if (typeof scheduleFitTables === "function") scheduleFitTables();

    const restoreAll = () => {
      window.scrollTo(0, pageScrollY);
      const wraps = document.querySelectorAll(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap");
      scrollSnapshot.forEach(({ index, left, parentId }) => {
        let wrap = null;
        if (parentId) {
          const parent = document.getElementById(parentId);
          wrap = parent?.querySelector?.(".amende-table-wrap, .table-wrap, .dette-table-wrap, .finance-table-wrap") || null;
        }
        if (!wrap) wrap = wraps[index] || null;
        if (wrap) wrap.scrollLeft = left;
      });
    };
    restoreAll();
    requestAnimationFrame(() => {
      restoreAll();
      requestAnimationFrame(restoreAll);
    });
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

  if (isNavPreview()) {
    revealApp(true);
    loginModal?.classList.remove("open");
    appEl?.classList.remove("app-blurred");
    if (new URLSearchParams(location.search).get("preview") === "menu") openAppMenu();
  }
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
  const admin = params.get("admin");
  const item = params.get("item");
  if (tab) sessionStorage.setItem("poto-open-tab", tab);
  if (loan) sessionStorage.setItem("poto-open-loan", loan);
  if (admin) sessionStorage.setItem("poto-open-admin", admin);
  if (item) sessionStorage.setItem("poto-open-item", item);
}

function openFromNotification({ tab = "prets", admin = "", loanId = "", item = "" } = {}) {
  // Permettre un nouveau highlight à chaque clic notif
  loanHighlightConsumed = false;
  if (admin) sessionStorage.setItem("poto-open-admin", admin);
  if (item) sessionStorage.setItem("poto-open-item", item);
  if (tab) {
    sessionStorage.setItem("poto-open-tab", tab);
    showTab(tab);
  }
  if (admin && (tab === "admin" || getActiveMainTab() === "admin")) {
    showAdminSub(admin);
  }
  if (loanId) {
    sessionStorage.setItem("poto-open-loan", loanId);
  }
  // Plusieurs tentatives : le DOM peut ne pas être prêt juste après showTab
  const tryHighlight = () => {
    if (loanId) highlightLoanFromNotification();
    highlightNotificationItem();
  };
  tryHighlight();
  requestAnimationFrame(tryHighlight);
  setTimeout(tryHighlight, 250);
  setTimeout(tryHighlight, 800);
  setTimeout(tryHighlight, 1600);
}

function applyNotificationDeepLink() {
  const params = new URLSearchParams(location.search);
  const tab = sessionStorage.getItem("poto-open-tab") || params.get("tab");
  const admin = sessionStorage.getItem("poto-open-admin") || params.get("admin");
  const item = sessionStorage.getItem("poto-open-item") || params.get("item");
  const loanId = sessionStorage.getItem("poto-open-loan") || params.get("loan");
  if (!tab && !loanId && !item && !admin) return;
  openFromNotification({
    tab: tab || "prets",
    admin: admin || "",
    loanId: loanId || "",
    item: item || "",
  });
  sessionStorage.removeItem("poto-open-tab");
  sessionStorage.removeItem("poto-open-admin");
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
    document.getElementById(`loan-${item}`) ||
    document.getElementById(`ex-tournee-${item}`) ||
    document.getElementById(`loi-${item}`);
  if (!target) return;
  sessionStorage.removeItem("poto-open-item");
  target.classList.add("is-notif-target");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => target.classList.remove("is-notif-target"), 4000);
}

let loanHighlightConsumed = false;
function highlightLoanFromNotification() {
  // Une seule fois quand l'élément est trouvé (sinon on réessaie)
  if (loanHighlightConsumed) return;
  const loanId = sessionStorage.getItem("poto-open-loan") || new URLSearchParams(location.search).get("loan");
  if (!loanId) return;
  const card =
    document.getElementById(`loan-${loanId}`) ||
    document.querySelector(`[data-loan-id="${loanId}"]`);
  // Ne consommer que si on a vraiment la carte du prêt
  if (!card) return;
  loanHighlightConsumed = true;
  sessionStorage.removeItem("poto-open-loan");
  try {
    const url = new URL(location.href);
    let changed = false;
    ["loan", "tab", "admin", "item"].forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });
    if (changed) history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch {
    /* ignore */
  }
  card.classList.add("is-notif-target");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => card.classList.remove("is-notif-target"), 4000);
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