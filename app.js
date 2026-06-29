const STORAGE_KEY = "poto-timide-members";
const ROLES_KEY = "poto-timide-roles";
const COTISATIONS_KEY = "poto-timide-cotisations";
const TOURNEE_KEY = "poto-timide-tournee";
const TOURNEE_PARTNERS_KEY = "partners";
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
const AMENDES_KEY = "poto-timide-amendes";
const AMENDES_CAISSE_KEY = "poto-timide-amendes-caisse";
const TAB_PERMISSIONS_KEY = "poto-timide-tab-permissions";
const PRETS_KEY = "poto-timide-prets";
const NOTIFICATIONS_KEY = "poto-timide-notifications";
const EVENEMENTS_KEY = "poto-timide-evenements";
const ADMIN_IDS_KEY = "poto-timide-admin-ids";
const AUTRE_ARGENT_KEY = "poto-timide-autre-argent";
const SESSION_KEY = "poto-timide-session";
const ACTIVE_TAB_KEY = "poto-timide-active-tab";
const TAB_IDS = ["membres", "tournee", "amendes", "prets", "evenements", "autre-argent"];
const MAX_MEMBERS = 50;
const ADMIN_NAME = "Dario";
const FOND_CAISSE = 1000;
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
  { id: "amendes", label: "Mes dettes et amendes" },
  { id: "tournee", label: "Organisation de la tournée" },
  { id: "prets", label: "Prêt" },
  { id: "evenements", label: "Événements" },
];

const DEFAULT_TAB_PERMISSIONS = {
  amendes: ["censeur", "tresorier"],
  tournee: [],
  prets: ["tresorier"],
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
const memberCounter = document.getElementById("memberCounter");
const submitBtn = document.getElementById("submitBtn");
const limitMsg = document.getElementById("limitMsg");
const roleForm = document.getElementById("roleForm");
const roleMemberSelect = document.getElementById("roleMember");
const rolePostSelect = document.getElementById("rolePost");
const bureauList = document.getElementById("bureauList");
const bureauAssignToggle = document.getElementById("bureauAssignToggle");
let bureauAssignOpen = false;
const cotisationBody = document.getElementById("cotisationBody");
const cotisationTotal = document.getElementById("cotisationTotal");
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
const amendeDetteMemberCol = document.getElementById("amendeDetteMemberCol");
const amendeDetteActionsCol = document.getElementById("amendeDetteActionsCol");
const amendeDetteTotal = document.getElementById("amendeDetteTotal");
const amendeDetteTotalLabel = document.getElementById("amendeDetteTotalLabel");
const amendeDetteTotalActionsSpacer = document.getElementById("amendeDetteTotalActionsSpacer");
const amendeTitle = document.getElementById("amendeTitle");
const amendeSubtitle = document.getElementById("amendeSubtitle");
const amendeMemberCol = document.getElementById("amendeMemberCol");
const amendeTotalSpacer = document.getElementById("amendeTotalSpacer");
const amendeActionsCol = document.getElementById("amendeActionsCol");
const amendeTotalActionsSpacer = document.getElementById("amendeTotalActionsSpacer");
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
const autreArgentForm = document.getElementById("autreArgentForm");
const autreArgentMemberSelect = document.getElementById("autreArgentMember");
const autreArgentAmountInput = document.getElementById("autreArgentAmount");
const autreArgentNoteInput = document.getElementById("autreArgentNote");
const autreArgentList = document.getElementById("autreArgentList");
const autreArgentTotal = document.getElementById("autreArgentTotal");
const autreArgentSaveMsg = document.getElementById("autreArgentSaveMsg");

let members = [];
let adminIds = [];
let roles = {};
let cotisations = {};
let cotisationsDraft = {};
let tourneeData = { years: {} };
let tourneeDraft = { years: {} };
let tourneeYear = String(new Date().getFullYear());
let tourneeSortKey = "name";
let tourneeSortDir = "asc";
let amendes = [];
let amendesCaisse = [];
let tabPermissions = {};
let prets = [];
let notifications = [];
let evenements = [];
let autreArgent = [];
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

function saveAutreArgent(shouldRender = true) {
  localStorage.setItem(AUTRE_ARGENT_KEY, JSON.stringify(autreArgent));
  if (shouldRender) {
    renderAutreArgent();
    renderPrets();
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
      if (monthIndex === TOURNEE_PARTNERS_KEY) return;
      const index = Number(monthIndex);
      if (Number.isNaN(index) || index < 0 || index > 11) return;
      const normalizedIds = normalizeTourneeMonthIds(memberIds);
      if (normalizedIds.length > 0) {
        months[String(index)] = normalizedIds;
      }
    });

    Object.assign(normalizedYear, months);
    const existingPartners = yearData[TOURNEE_PARTNERS_KEY];
    const partners = inferPartnersFromMonths(months, existingPartners || {});
    if (Object.keys(partners).length > 0) {
      normalizedYear[TOURNEE_PARTNERS_KEY] = partners;
    }

    years[String(year)] = normalizedYear;
  });

  return { years };
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

function getTourneeYearRecord(year, useDraft = canManageTab("tournee")) {
  const source = useDraft ? tourneeDraft : tourneeData;
  return source.years?.[year] || {};
}

function getTourneeMonthAssignment(year, monthIndex, useDraft = canManageTab("tournee")) {
  const yearRecord = getTourneeYearRecord(year, useDraft);
  return normalizeTourneeMonthIds(yearRecord[String(monthIndex)] || []);
}

function getTourneePartnersMap(year, useDraft = canManageTab("tournee")) {
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

function setTourneeMonthDraft(monthIndex, memberIds, shouldRender = true) {
  if (!canManageTab("tournee")) return;
  const months = ensureTourneeYearDraft(tourneeYear);
  const normalized = normalizeTourneeMonthIds(memberIds);
  if (normalized.length === 0) {
    delete months[String(monthIndex)];
  } else {
    months[String(monthIndex)] = normalized;
  }
  if (shouldRender) renderTourneeTable();
}

function getMemberMonthIndices(year, memberId, useDraft = canManageTab("tournee")) {
  const indices = [];
  for (let index = 0; index < 12; index += 1) {
    const memberIds = getTourneeMonthAssignment(year, index, useDraft);
    if (memberIds.includes(memberId)) indices.push(index);
  }
  return indices;
}

function getMemberPartnerForMonth(year, memberId, monthIndex, useDraft = canManageTab("tournee")) {
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
  months[monthKey] = months[monthKey].filter((id) => id !== memberId);
  if (months[monthKey].length === 0) delete months[monthKey];
  clearPartnerForMonth(memberId, monthIndex);
}

function addMemberToMonth(memberId, monthIndex) {
  const months = ensureTourneeYearDraft(tourneeYear);
  const monthKey = String(monthIndex);
  if (!months[monthKey]) months[monthKey] = [];
  if (!months[monthKey].includes(memberId)) {
    months[monthKey].push(memberId);
  }
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
  if (!canManageTab("tournee")) return;

  const parsedMonth = Number(monthIndex);
  if (Number.isNaN(parsedMonth)) return;

  if (isActive) {
    addMemberToMonth(memberId, parsedMonth);
  } else {
    removeMemberFromMonth(memberId, parsedMonth);
  }

  renderTourneeTable();
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

function getMonthReceiversLabel(monthIndex, useDraft = canManageTab("tournee")) {
  const memberIds = getTourneeMonthAssignment(tourneeYear, monthIndex, useDraft);
  if (memberIds.length === 0) return "";

  return memberIds
    .map((id) => getMemberById(id))
    .filter(Boolean)
    .sort(compareMemberNames)
    .map((member) => `${member.name} ${MONTH_SHORT_LABELS[monthIndex]}`)
    .join(" · ");
}

function getMemberTourneeStatuses(memberId, useDraft = canManageTab("tournee")) {
  const monthIndices = getMemberMonthIndices(tourneeYear, memberId, useDraft);
  if (monthIndices.length === 0) {
    return [{ level: "empty", label: "Non assigné" }];
  }

  return monthIndices.map((monthIndex) => ({
    level: "ok",
    label: getMonthReceiversLabel(monthIndex, useDraft),
  }));
}

function buildTourneeMonthChips(memberId, selectedMonthIndices) {
  return MONTH_LABELS.map((label, index) => {
    const isActive = selectedMonthIndices.includes(index);
    const activeClass = isActive ? " is-active" : "";
    return `<button type="button" class="tournee-month-chip${activeClass}" data-member="${memberId}" data-month="${index}" title="${escapeHtml(label)}" aria-pressed="${isActive}">${MONTH_SHORT_LABELS[index]}</button>`;
  }).join("");
}

function buildTourneeStatusList(statuses) {
  return statuses
    .map(
      (status) =>
        `<span class="tournee-status tournee-status-${status.level}">${escapeHtml(status.label)}</span>`
    )
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

function canManageTab(tabId) {
  if (isGroupAdmin()) return true;

  const member = getCurrentMember();
  if (!member) return false;

  const memberRole = getMemberRole(member.id);
  if (!memberRole) return false;

  return getTabAllowedRoles(tabId).includes(memberRole);
}

function saveAmendes(shouldRender = true) {
  localStorage.setItem(AMENDES_KEY, JSON.stringify(amendes));
  if (shouldRender) {
    renderAmendes();
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
  evenements = loadEvenements();
  autreArgent = loadAutreArgent();
  adminIds = loadAdminIds();
  ensureDefaultAdmin();
  tourneeData = loadTourneeData();
  if (canManageTab("tournee")) {
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
  return isGroupAdmin() || getMemberRole(member.id) === "tresorier";
}

function canDecidePrets() {
  return isFinancier();
}

function openLoginModal() {
  loginError.hidden = true;
  loginForm.reset();
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

async function loginMember(name, password) {
  loginError.hidden = true;
  try {
    await apiLogin(name.trim(), password);
    await loadDataFromServer();
    reloadFromStorage();
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
    !confirm(
      `Réinitialiser le mot de passe de ${member.name} à 1234 ?\nIl devra le changer à la prochaine connexion.`
    )
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
  try {
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
      userStatus.textContent = `Administrateur : ${current.name}`;
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

  loginBtn.hidden = loggedIn;
  logoutBtn.hidden = !loggedIn;

  saveCotisationsBtn.hidden = !canManageTab("tournee");
  tourneeInfoMsg.hidden = canManageTab("tournee");
  membresLockMsg.hidden = isAdmin;

  if (bureauAssignToggle) bureauAssignToggle.hidden = !isAdmin;
  if (rolesPanel) {
    if (!isAdmin) {
      rolesPanel.hidden = true;
      bureauAssignOpen = false;
    } else {
      rolesPanel.hidden = !bureauAssignOpen;
    }
    if (bureauAssignToggle) {
      bureauAssignToggle.textContent = bureauAssignOpen ? "Fermer" : "Attribuer";
      bureauAssignToggle.setAttribute("aria-expanded", String(bureauAssignOpen));
    }
  }
  if (addMemberPanel) addMemberPanel.hidden = !isAdmin;
  if (tabPermissionsPanel) tabPermissionsPanel.hidden = !isAdmin;
  if (adminRolesPanel) adminRolesPanel.hidden = !isAdmin;
  if (tabBtnAutreArgent) tabBtnAutreArgent.hidden = !isAdmin;
  if (addAmendePanel) addAmendePanel.hidden = !canManageTab("amendes");
  if (addEvenementPanel) addEvenementPanel.hidden = !canManageTab("evenements");

  adminSections.forEach((section) => {
    if (section === rolesPanel || section === addMemberPanel || section === adminRolesPanel) return;
    section.classList.toggle("locked", !isAdmin);
  });
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
  if (canManageTab(tabId)) return true;
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

function getRoleLabel(roleId) {
  return ROLES.find((r) => r.id === roleId)?.label || roleId;
}

function getMemberRole(memberId) {
  return Object.entries(roles).find(([, id]) => id === memberId)?.[0] || null;
}

function getMemberById(id) {
  return members.find((m) => m.id === id);
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
  const isAdmin = isGroupAdmin();
  memberNameInput.disabled = full || !isAdmin;
  submitBtn.disabled = full || !isAdmin;
  limitMsg.hidden = !full;
  roleMemberSelect.disabled = !isAdmin;
  rolePostSelect.disabled = !isAdmin;
  roleForm.querySelector('button[type="submit"]').disabled = !isAdmin;
  if (adminMemberSelect) adminMemberSelect.disabled = !isAdmin;
  if (adminForm) adminForm.querySelector('button[type="submit"]').disabled = !isAdmin;
}

function updateMemberSelects() {
  const options = `<option value="">— Choisir un membre —</option>`;

  roleMemberSelect.innerHTML = options;
  amendeMemberSelect.innerHTML = options;
  if (evenementMemberSelect) evenementMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option>`;
  if (adminMemberSelect) adminMemberSelect.innerHTML = `<option value="">— Choisir un membre —</option>`;
  if (autreArgentMemberSelect) autreArgentMemberSelect.innerHTML = `<option value="">— Choisir le poto —</option>`;

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

function removeAdmin(memberId) {
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

  if (!confirm(`Retirer les droits administrateur de « ${member.name} » ?`)) return;

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
  renderTourneeTable();
  renderAmendes();
  renderPrets();
  renderEvenements();
}

function renderBureau() {
  const isAdmin = isGroupAdmin();
  const visibleRoles = isAdmin ? ROLES : ROLES.filter((role) => roles[role.id]);

  if (visibleRoles.length === 0) {
    bureauList.innerHTML = `<li class="bureau-empty">Aucun poste attribué.</li>`;
    return;
  }

  bureauList.innerHTML = visibleRoles
    .map((role) => {
      const memberId = roles[role.id];
      const member = memberId ? getMemberById(memberId) : null;
      const canClear = member && isAdmin;

      return `
        <li class="bureau-card${member ? "" : " is-vacant"}">
          <div class="bureau-card-body">
            <span class="bureau-card-name">${member ? escapeHtml(member.name) : "—"}</span>
            <span class="bureau-card-role">${escapeHtml(role.label)}</span>
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

  bureauList.querySelectorAll(".btn-bureau-clear").forEach((btn) => {
    btn.addEventListener("click", () => clearRole(btn.dataset.role));
  });
}

function renderMemberList() {
  memberList.innerHTML = "";

  if (members.length === 0) {
    memberList.innerHTML = `<li class="empty">Aucun membre pour le moment.</li>`;
    return;
  }

  const currentMember = getCurrentMember();

  getSortedMembers().forEach((member, index) => {
    const roleId = getMemberRole(member.id);
    const memberIsAdmin = isMemberAdmin(member.id);
    const isCurrentUser = currentMember?.id === member.id;

    const li = document.createElement("li");
    li.className = `member-item${isCurrentUser ? " member-current" : ""}`;
    li.innerHTML = `
      <div class="member-info">
        <span class="member-avatar">${escapeHtml(getInitials(member.name))}</span>
        <div>
          <p class="member-name">
            ${escapeHtml(member.name)}
            ${memberIsAdmin ? '<span class="tag-admin">Admin</span>' : ""}
            ${isCurrentUser ? '<span class="tag-you">Vous</span>' : ""}
          </p>
          <p class="member-date">
            ${roleId ? `<span class="role-badge">${escapeHtml(getRoleLabel(roleId))}</span>` : "Membre"}
            · Ajouté le ${formatDate(member.createdAt)}
          </p>
        </div>
      </div>
      <div class="member-right">
        <span class="member-num">#${index + 1}</span>
        ${
          isGroupAdmin()
            ? `${isOwnerMember(member)
                ? `<span class="admin-only-note">Propriétaire</span>`
                : `<button type="button" class="btn-clear btn-reset-pwd" data-id="${member.id}" title="Réinitialiser le mot de passe">Réinit. MDP</button>
                   <button class="btn-delete" data-id="${member.id}" title="Supprimer">Supprimer</button>`}`
            : ""
        }
      </div>
    `;

    const resetPwdBtn = li.querySelector(".btn-reset-pwd");
    if (resetPwdBtn) {
      resetPwdBtn.addEventListener("click", () => resetMemberPassword(member.id));
    }

    const deleteBtn = li.querySelector(".btn-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteMember(member.id));
    }
    memberList.appendChild(li);
  });
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
  if (canManageTab("tournee")) return cotisationsDraft;
  cotisations = loadCotisations();
  return cotisations;
}

function getCotisation(memberId) {
  const source = getCotisationSource();
  const value = source[memberId];
  return value === undefined || value === null ? "" : value;
}

function setCotisationDraft(memberId, value) {
  if (!canManageTab("tournee")) return;

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
  cotisationTotal.textContent = formatEuro(total);
}

function saveCotisationsData() {
  if (!requireTabAccess("tournee", "enregistrer les cotisations")) return;

  const tourneeIssues = validateTourneeDraft();
  if (tourneeIssues.length > 0) {
    showSaveMessage(tourneeIssues[0], "error");
    return;
  }

  cotisations = { ...cotisationsDraft };
  tourneeData = cloneTourneeData(tourneeDraft);
  saveCotisations();
  saveTourneeData();
  showSaveMessage("Cotisations et planning de tournée enregistrés.");
}

function getTourneeStatusSortValue(memberId, useDraft = canManageTab("tournee")) {
  const statuses = getMemberTourneeStatuses(memberId, useDraft);
  if (statuses.length === 1 && statuses[0].level === "empty") {
    return "\uFFFF";
  }
  return statuses
    .map((status) => status.label)
    .join(" · ")
    .toLocaleLowerCase("fr");
}

function getTourneeMonthSortValue(memberId, useDraft = canManageTab("tournee")) {
  const monthIndices = getMemberMonthIndices(tourneeYear, memberId, useDraft);
  if (monthIndices.length === 0) return 99;
  return Math.min(...monthIndices);
}

function getTourneeMonthSortLabel(memberId, useDraft = canManageTab("tournee")) {
  const monthIndices = getMemberMonthIndices(tourneeYear, memberId, useDraft);
  if (monthIndices.length === 0) return "\uFFFF";
  return monthIndices.map((index) => MONTH_LABELS[index]).join(", ");
}

function getTourneeSortedMembers(useDraft = canManageTab("tournee")) {
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
    } else if (tourneeSortKey === "status") {
      comparison = getTourneeStatusSortValue(a.id, useDraft).localeCompare(
        getTourneeStatusSortValue(b.id, useDraft),
        "fr",
        { sensitivity: "base" }
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

function renderTourneeYearSelect() {
  if (!tourneeYearSelect) return;

  const years = getTourneeYearOptions();
  if (!years.includes(tourneeYear)) {
    tourneeYear = String(new Date().getFullYear());
  }

  tourneeYearSelect.innerHTML = years
    .map((year) => `<option value="${year}"${year === tourneeYear ? " selected" : ""}>${year}</option>`)
    .join("");

  tourneeYearSelect.disabled = !canManageTab("tournee") && years.length <= 1;
}

function renderTourneeTable() {
  renderTourneeYearSelect();
  updateTourneeSortHeaders();
  if (!cotisationBody) return;

  cotisationBody.innerHTML = "";

  if (members.length === 0) {
    cotisationBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-cell">Aucun membre enregistré.</td>
      </tr>
    `;
    cotisationTotal.textContent = formatEuro(0);
    return;
  }

  const canEditTournee = canManageTab("tournee");
  const currentMember = getCurrentMember();

  getTourneeSortedMembers(canEditTournee).forEach((member, index) => {
    const tr = document.createElement("tr");
    const amount = getCotisation(member.id);
    const isCurrentUser = currentMember?.id === member.id;
    const monthIndices = getMemberMonthIndices(tourneeYear, member.id, canEditTournee);
    const statuses = getMemberTourneeStatuses(member.id, canEditTournee);
    const monthLabel = monthIndices.length
      ? monthIndices.map((monthIndex) => MONTH_LABELS[monthIndex]).join(", ")
      : "—";

    if (isCurrentUser) tr.classList.add("row-current");

    tr.innerHTML = `
      <td>
        <span class="table-num">#${index + 1}</span>
        ${escapeHtml(member.name)}
        ${isCurrentUser ? '<span class="tag-you">Vous</span>' : ""}
      </td>
      <td>
        ${
          canEditTournee
            ? `<div class="amount-input-wrap">
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
              </div>`
            : `<span class="amount-readonly">${amount === "" ? "—" : formatEuro(amount)}</span>`
        }
      </td>
      <td>
        ${
          canEditTournee
            ? `<div class="tournee-month-chips" role="group" aria-label="Mois de tournée ${escapeHtml(member.name)}">
                ${buildTourneeMonthChips(member.id, monthIndices)}
              </div>`
            : `<span class="amount-readonly tournee-member-months">${escapeHtml(monthLabel)}</span>`
        }
      </td>
      <td><div class="tournee-status-list">${buildTourneeStatusList(statuses)}</div></td>
    `;

    if (canEditTournee) {
      const amountInput = tr.querySelector(".amount-input");
      const applyCotisationDraft = () => {
        if (amountInput.value === "") {
          setCotisationDraft(member.id, "");
          return;
        }
        const parsed = parseFloat(amountInput.value);
        if (!Number.isNaN(parsed)) {
          setCotisationDraft(member.id, parsed);
        }
      };

      amountInput.addEventListener("input", applyCotisationDraft);

      tr.querySelectorAll(".tournee-month-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const monthIndex = Number(chip.dataset.month);
          const willActivate = !chip.classList.contains("is-active");
          toggleMemberMonth(member.id, monthIndex, willActivate);
        });
      });
    }

    cotisationBody.appendChild(tr);
  });

  updateCotisationTotal();
}

function getSavedTab() {
  const hashTab = location.hash.replace(/^#/, "");
  if (TAB_IDS.includes(hashTab)) return hashTab;

  const storedTab = sessionStorage.getItem(ACTIVE_TAB_KEY);
  if (TAB_IDS.includes(storedTab)) return storedTab;

  return "membres";
}

function persistActiveTab(tabId) {
  sessionStorage.setItem(ACTIVE_TAB_KEY, tabId);
  const hash = `#${tabId}`;
  if (location.hash !== hash) {
    history.replaceState(null, "", hash);
  }
}

function showTab(tabId) {
  if (!TAB_IDS.includes(tabId)) tabId = "membres";
  if (tabId === "autre-argent" && !isGroupAdmin()) tabId = "membres";

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  tabContents.forEach((content) => {
    content.classList.toggle("active", content.id === `tab-${tabId}`);
  });

  if (tabId === "tournee") {
    reloadFromStorage();
    renderTourneeTable();
  }

  if (tabId === "amendes") {
    reloadFromStorage();
    renderAmendes();
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

  if (tabId === "autre-argent") {
    reloadFromStorage();
    renderAutreArgent();
  }

  persistActiveTab(tabId);
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

function renderDetteBanner(detteList, showAllMembers = false) {
  if (!amendeDetteWrap || !amendeDetteBody) return;

  const showActions = showAllMembers && canManageTab("amendes");
  const total = detteList.reduce((sum, amende) => sum + amende.amount, 0);

  if (amendeDetteMemberCol) amendeDetteMemberCol.hidden = !showAllMembers;
  if (amendeDetteActionsCol) amendeDetteActionsCol.hidden = !showActions;
  if (amendeDetteTotalActionsSpacer) amendeDetteTotalActionsSpacer.hidden = !showActions;
  if (amendeDetteTotalLabel) {
    amendeDetteTotalLabel.colSpan = showAllMembers ? 3 : 2;
  }

  if (detteList.length === 0) {
    amendeDetteWrap.hidden = true;
    amendeDetteBody.innerHTML = "";
    if (amendeDetteSummary) amendeDetteSummary.innerHTML = "";
    if (amendeDetteTotal) amendeDetteTotal.textContent = formatEuro(0);
    return;
  }

  amendeDetteWrap.hidden = false;

  if (amendeDetteSubtitle) {
    amendeDetteSubtitle.textContent = showAllMembers
      ? "Cotisations non payées après remboursement au poto — validez le paiement pour remettre le montant dans la caisse."
      : "Vos cotisations événements non payées — à régler auprès du groupe.";
  }

  if (amendeDetteSummary) {
    amendeDetteSummary.innerHTML = `
      <div class="amende-dette-summary-card">
        <span class="amende-dette-summary-label">Total dettes</span>
        <strong class="amende-dette-summary-amount">${formatEuro(total)}</strong>
        <span class="amende-dette-summary-count">${detteList.length} dette${detteList.length > 1 ? "s" : ""}</span>
      </div>
    `;
  }

  amendeDetteBody.innerHTML = detteList
    .map((amende) => {
      const memberName = showAllMembers
        ? `<td class="amende-col-text amende-member-name">${escapeHtml(getMemberById(amende.memberId)?.name || "—")}</td>`
        : "";

      const actionsCell = showActions
        ? `<td class="amende-actions">
            <button type="button" class="btn-primary btn-dette-pay" data-id="${amende.id}">Valider paiement</button>
          </td>`
        : "";

      return `
        <tr>
          ${memberName}
          <td class="amende-col-text">${formatDate(amende.date.split("T")[0])}</td>
          <td class="amende-col-text amende-dette-detail">${escapeHtml(amende.note || "Dette événement")}</td>
          <td class="amende-row-total amende-dette-amount">${formatEuro(amende.amount)}</td>
          ${actionsCell}
        </tr>
      `;
    })
    .join("");

  if (amendeDetteTotal) amendeDetteTotal.textContent = formatEuro(total);
}

function renderAmendeSummary(memberAmendes) {
  const totals = { absence: 0, retard: 0, bavardage: 0, sanctions: 0 };
  const counts = { absence: 0, retard: 0, bavardage: 0, sanctions: 0 };

  memberAmendes.forEach((a) => {
    if (totals[a.type] !== undefined) {
      totals[a.type] += a.amount;
      counts[a.type] += 1;
    }
  });

  amendeSummary.innerHTML = AMENDE_TYPES.map((type) => {
    const count = counts[type.id];
    const total = totals[type.id];
    return `
      <div class="amende-summary-card type-${type.id}">
        <span class="amende-summary-label">${type.label}</span>
        <strong>${count} amende${count > 1 ? "s" : ""}</strong>
        <span class="amende-summary-amount">${formatEuro(total)}</span>
      </div>
    `;
  }).join("");
}

function renderAmendeTable(amendesList, showAllMembers = false) {
  const totals = { absence: 0, retard: 0, bavardage: 0, sanctions: 0 };
  const showActions = showAllMembers && canManageTab("amendes");
  const colCount = showAllMembers ? (showActions ? 8 : 7) : 6;

  if (amendeMemberCol) amendeMemberCol.hidden = !showAllMembers;
  if (amendeTotalSpacer) amendeTotalSpacer.hidden = !showAllMembers;
  if (amendeActionsCol) amendeActionsCol.hidden = !showActions;
  if (amendeTotalActionsSpacer) amendeTotalActionsSpacer.hidden = !showActions;

  amendeBody.innerHTML = "";

  if (amendesList.length === 0) {
    amendeBody.innerHTML = `
      <tr>
        <td colspan="${colCount}" class="empty-cell">Aucune amende pour le moment.</td>
      </tr>
    `;
  } else {
    amendesList.forEach((amende) => {
      totals[amende.type] = (totals[amende.type] || 0) + amende.amount;

      const cells = AMENDE_TYPES.map((type) => {
        if (amende.type === type.id) {
          const note = amende.note ? `<span class="amende-note">${escapeHtml(amende.note)}</span>` : "";
          return `<td class="amende-hit">${formatEuro(amende.amount)}${note}</td>`;
        }
        return `<td class="amende-empty">—</td>`;
      }).join("");

      const memberName = showAllMembers
        ? `<td class="amende-col-text amende-member-name">${escapeHtml(getMemberById(amende.memberId)?.name || "—")}</td>`
        : "";

      const actionsCell = showActions
        ? `<td class="amende-actions">
            <button type="button" class="btn-amende-edit" data-id="${amende.id}" title="Modifier">Modifier</button>
            <button type="button" class="btn-primary btn-amende-pay" data-id="${amende.id}" title="Valider le paiement">Valider paiement</button>
          </td>`
        : "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        ${memberName}
        <td class="amende-col-text">${formatDate(amende.date.split("T")[0])}</td>
        ${cells}
        <td class="amende-row-total">${formatEuro(amende.amount)}</td>
        ${actionsCell}
      `;
      amendeBody.appendChild(tr);
    });
  }

  document.getElementById("totalAbsence").textContent =
    totals.absence > 0 ? formatEuro(totals.absence) : "—";
  document.getElementById("totalRetard").textContent =
    totals.retard > 0 ? formatEuro(totals.retard) : "—";
  document.getElementById("totalBavardage").textContent =
    totals.bavardage > 0 ? formatEuro(totals.bavardage) : "—";
  document.getElementById("totalSanctions").textContent =
    totals.sanctions > 0 ? formatEuro(totals.sanctions) : "—";

  const grandTotal = Object.values(totals).reduce((sum, n) => sum + n, 0);
  document.getElementById("amendeGrandTotal").textContent = formatEuro(grandTotal);
}

function renderAmendes() {
  const current = getCurrentMember();
  if (!current) return;

  const canManage = canManageTab("amendes");

  if (canManage) {
    amendeTitle.textContent = "Dettes et amendes du groupe";
    amendeSubtitle.textContent = isGroupAdmin()
      ? "Vue globale — dettes événements et amendes de tous les membres."
      : "Vue globale — gestion des dettes et amendes du groupe.";
    const allAmendes = getAllAmendes().sort((a, b) => {
      const nameA = getMemberById(a.memberId)?.name || "";
      const nameB = getMemberById(b.memberId)?.name || "";
      const cmp = nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
      if (cmp !== 0) return cmp;
      return new Date(b.date) - new Date(a.date);
    });
    const regularAmendes = getRegularAmendes(allAmendes);
    const detteAmendes = getDetteAmendes().sort((a, b) => {
      const nameA = getMemberById(a.memberId)?.name || "";
      const nameB = getMemberById(b.memberId)?.name || "";
      const cmp = nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
      if (cmp !== 0) return cmp;
      return new Date(b.date) - new Date(a.date);
    });
    renderAmendeSummary(regularAmendes);
    renderDetteBanner(detteAmendes, true);
    renderAmendeTable(regularAmendes, true);
  } else {
    amendeTitle.textContent = `Mes dettes et amendes — ${current.name}`;
    amendeSubtitle.textContent = "Vos dettes événements et amendes par type.";
    const memberAmendes = getAmendesForMember(current.id);
    const regularAmendes = getRegularAmendes(memberAmendes);
    const detteAmendes = memberAmendes.filter((amende) => isDetteAmende(amende));
    renderAmendeSummary(regularAmendes);
    renderDetteBanner(detteAmendes, false);
    renderAmendeTable(regularAmendes, false);
  }
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

function applyDetteRemoval(amende, { restoreCaisse = false, markEventPaid = false } = {}) {
  if (!isDetteAmende(amende) || !amende.evenementId) return false;

  const evt = getEvenementById(amende.evenementId);
  if (!evt) return false;

  if (evt.payments?.[amende.memberId]) {
    if (markEventPaid) {
      evt.payments[amende.memberId].paid = true;
      evt.payments[amende.memberId].paidAt = new Date().toISOString();
      evt.payments[amende.memberId].validatedBy = getCurrentMember()?.id || null;
      evt.payments[amende.memberId].paidAmount = amende.amount;
      evt.payments[amende.memberId].debtRepaidAt = new Date().toISOString();
    }

    delete evt.payments[amende.memberId].convertedToDebt;
    delete evt.payments[amende.memberId].debtCreatedAt;
  }

  if (restoreCaisse && evt.caisseDebtDeduction) {
    evt.caisseDebtDeduction = Math.max(0, evt.caisseDebtDeduction - amende.amount);
  }

  return true;
}

function validateDettePayment(amendeId) {
  if (!requireTabAccess("amendes", "valider un paiement de dette")) return;

  const amende = getAmendeById(amendeId);
  if (!amende || !isDetteAmende(amende)) return;

  const member = getMemberById(amende.memberId);
  const memberName = member?.name || "ce membre";

  if (
    !confirm(
      `Confirmer le remboursement de la dette de ${memberName} (${formatEuro(amende.amount)}) ?\nLe montant retournera dans la caisse brute et disponible.`
    )
  ) {
    return;
  }

  applyDetteRemoval(amende, { restoreCaisse: true, markEventPaid: true });
  localStorage.setItem(EVENEMENTS_KEY, JSON.stringify(evenements));

  amendes = amendes.filter((a) => a.id !== amendeId);
  saveAmendes();
  renderEvenements();

  alert(
    `Dette de ${memberName} validée — ${formatEuro(amende.amount)} retourné dans la caisse.\nCaisse disponible : ${formatEuro(getCaisseDisponible())} · Caisse brute : ${formatEuro(getCaisseBrute())}`
  );
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

function validateAmendePayment(id) {
  if (!requireTabAccess("amendes", "valider le paiement d'une amende")) return;

  const amende = getAmendeById(id);
  if (!amende) return;

  if (isDetteAmende(amende)) {
    validateDettePayment(id);
    return;
  }

  const member = getMemberById(amende.memberId);
  const typeLabel = getAmendeTypeLabel(amende.type);
  const memberName = member ? member.name : "ce membre";

  if (
    !confirm(
      `Confirmer le paiement de ${memberName} (${typeLabel}, ${formatEuro(amende.amount)}) ?\n\nL'amende sera retirée et ${formatEuro(amende.amount)} sera ajouté à la caisse brute et disponible.`
    )
  ) {
    return;
  }

  if (editingAmendeId === id) cancelEditAmende();

  creditAmendeToCaisse(amende);
  amendes = amendes.filter((a) => a.id !== id);
  saveAmendes();

  alert(
    `Paiement validé pour ${memberName} — ${formatEuro(amende.amount)} ajouté à la caisse.\nCaisse disponible : ${formatEuro(getCaisseDisponible())} · Caisse brute : ${formatEuro(getCaisseBrute())}`
  );
}

function deleteAmende(id) {
  validateAmendePayment(id);
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

function savePrets(shouldRender = true) {
  localStorage.setItem(PRETS_KEY, JSON.stringify(prets));
  if (shouldRender) renderPrets();
}

function saveNotifications(shouldRender = true) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  if (shouldRender) renderPrets();
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
  return Math.max(
    0,
    FOND_CAISSE + getTotalAmendesInCaisse() - getTotalEvenementDebtDeductions()
  );
}

function getTotalAutreArgent() {
  return autreArgent.reduce((sum, entry) => sum + entry.amount, 0);
}

function getCaisseBrute() {
  return getCaisseBase() + getTotalEvenementsInCaisse() + getTotalAutreArgent();
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

function getCaisseDisponible() {
  return getCaisseBrute();
}

function showPretSaveMessage(text, type = "success") {
  if (!pretSaveMsg) return;
  pretSaveMsg.textContent = text;
  pretSaveMsg.className = `save-msg save-msg-${type}`;
  pretSaveMsg.hidden = false;
}

function getBorrowableAmount() {
  const caisse = getCaisseBrute();
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
  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "Un membre";

  if (decision === "approved") {
    const dueDates = getLoanDueDates(loan);
    const dueLabel = dueDates
      ? formatDate(dueDates.month1.toISOString().split("T")[0])
      : "—";

    upsertLoanNotification(
      loan.borrowerId,
      loan.id,
      "loan_approved",
      `Prêt accordé — ${formatEuro(loan.amount)}. Remboursez 80 % avant le ${dueLabel}.`
    );

    notifications.forEach((notif) => {
      if (notif.loanId !== loan.id || notif.memberId === loan.borrowerId) return;
      notif.type = "loan_approved";
      notif.message = `Prêt accordé pour ${borrowerName} (${formatEuro(loan.amount)}).`;
      notif.read = false;
      notif.createdAt = new Date().toISOString();
    });
  } else {
    upsertLoanNotification(
      loan.borrowerId,
      loan.id,
      "loan_rejected",
      `Prêt refusé — votre demande de ${formatEuro(loan.amount)} a été refusée par le Financier.`
    );

    notifications.forEach((notif) => {
      if (notif.loanId !== loan.id || notif.memberId === loan.borrowerId) return;
      notif.type = "loan_rejected";
      notif.message = `Prêt refusé pour ${borrowerName} (${formatEuro(loan.amount)}).`;
      notif.read = false;
      notif.createdAt = new Date().toISOString();
    });
  }
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

function confirmVoterNotification(loan, memberId, vote) {
  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "un membre";
  const voteLabel = vote === "yes" ? "Oui" : "Non";

  notifications = notifications.filter(
    (notif) =>
      !(notif.memberId === memberId && notif.loanId === loan.id && notif.type === "loan_vote")
  );

  upsertLoanNotification(
    memberId,
    loan.id,
    "loan_voted",
    `Vous avez voté ${voteLabel} pour le prêt de ${borrowerName}.`
  );
}

function notifyLoanVoters(loan) {
  const borrower = getMemberById(loan.borrowerId);
  getLoanVoters(loan.borrowerId).forEach((voter) => {
    addNotification(
      voter.id,
      "loan_vote",
      loan.id,
      `${borrower?.name || "Un membre"} demande un prêt de ${formatEuro(loan.amount)}. Votez Oui ou Non sous 24 h.`
    );
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
      notifyBorrower(
        loan,
        "loan_interest",
        `Retard de remboursement : intérêts de 10 % appliqués (${formatEuro(loan.interestAmount)}).`
      );
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
  notifyLoanVoters(loan);
  upsertLoanNotification(
    current.id,
    loan.id,
    "loan_pending",
    `Demande en cours — votre prêt de ${formatEuro(parsedAmount)} est en vote.`
  );
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
  confirmVoterNotification(loan, current.id, vote);

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
  if (!canDecidePrets()) {
    alert("Seul le Financier peut valider les prêts.");
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

function recordRepayment(loanId, amount) {
  if (!canDecidePrets()) {
    alert("Seul le Financier peut enregistrer un remboursement.");
    return;
  }

  const loan = getLoanById(loanId);
  if (!loan || !["active", "defaulted"].includes(loan.status)) return;

  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Montant invalide.");
    return;
  }

  const current = getCurrentMember();
  loan.totalRepaid = Math.round(((loan.totalRepaid || 0) + parsedAmount) * 100) / 100;
  loan.repayments.push({
    amount: parsedAmount,
    date: new Date().toISOString(),
    recordedBy: current?.id || null,
  });

  if (getLoanBalance(loan) <= 0) {
    loan.status = "completed";
    notifyBorrower(loan, "loan_completed", `Votre prêt de ${formatEuro(loan.amount)} est entièrement remboursé.`);
    saveNotifications(false);
  }

  savePrets();
  showPretSaveMessage(
    `${formatEuro(parsedAmount)} retournés dans la caisse. Caisse disponible : ${formatEuro(getCaisseDisponible())}.`
  );
}

function deletePret(loanId) {
  if (!canDecidePrets()) {
    alert("Seul le Financier peut supprimer un prêt.");
    return;
  }

  const loan = getLoanById(loanId);
  if (!loan) return;

  const borrower = getMemberById(loan.borrowerId);
  const borrowerName = borrower?.name || "ce membre";

  if (
    !confirm(
      `Supprimer définitivement le prêt de ${borrowerName} (${formatEuro(loan.amount)}) ?`
    )
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
}

function isPretNotification(notif) {
  return Boolean(notif.loanId) || (notif.type && notif.type.startsWith("loan_"));
}

function getPretNotificationsForMember(memberId) {
  return notifications.filter((notif) => notif.memberId === memberId && isPretNotification(notif));
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

  pretSummary.innerHTML = `
    <div class="pret-summary-card pret-summary-main">
      <span class="pret-summary-label">Argent empruntable</span>
      <strong class="pret-summary-amount">${formatEuro(borrowable)}</strong>
      <span class="pret-summary-formula">(Caisse brute − ${formatEuro(CAISSE_RESERVE)}) ÷ 2</span>
    </div>
    <div class="pret-summary-card">
      <span class="pret-summary-label">Caisse disponible</span>
      <strong>${formatEuro(caisseDisponible)}</strong>
      <span class="pret-summary-formula">Fond + amendes + événements + autre argent</span>
    </div>
    <div class="pret-summary-card">
      <span class="pret-summary-label">Caisse brute</span>
      <strong>${formatEuro(caisseBrute)}</strong>
      <span class="pret-summary-formula">Fond + amendes + événements + autre argent</span>
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
    ${
      activeLoans.length > 0
        ? `<div class="pret-summary-card">
            <span class="pret-summary-label">Prêt accordé actif · ${activePretLabel}</span>
            <strong class="pret-summary-amount">${formatEuro(activeTotal)}</strong>
            <div class="pret-active-details">${activeLoansDetails}</div>
          </div>`
        : ""
    }
  `;
}

function renderPretNotifications() {
  const current = getCurrentMember();
  if (!current) return;

  const mine = getPretNotificationsForMember(current.id).slice(0, 20);

  if (pretNotificationsPanel) {
    pretNotificationsPanel.hidden = mine.length === 0;
  }

  if (!pretNotificationsList || mine.length === 0) return;

  pretNotificationsList.innerHTML = mine
    .map(
      (notif) => `
      <li class="pret-notif-item${notif.read ? "" : " pret-notif-unread"}">
        <p>${escapeHtml(notif.message)}</p>
        <span class="pret-notif-date">${formatDate(notif.createdAt.split("T")[0])}</span>
      </li>
    `
    )
    .join("");
}

function buildFinancierActions(loan) {
  if (!canDecidePrets()) return "";

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
        canDecidePrets()
          ? `<p class="pret-financier-msg">En tant que Financier, vous pouvez accorder ce prêt à tout moment.</p>`
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
            ? "Délai de 24 h écoulé — le Financier peut accorder ou refuser."
            : loan.status === "voting"
              ? "Vote en cours — le Financier peut accorder à tout moment."
              : "Tous les membres ont voté Oui — le Financier peut accorder."
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
        canDecidePrets()
          ? `<div class="pret-repay-form">
              <input type="number" class="pret-repay-input" data-loan-id="${loan.id}" min="1" step="1" placeholder="Montant remboursé" />
              <button type="button" class="btn-primary btn-pret-repay" data-loan-id="${loan.id}">Enregistrer remboursement</button>
            </div>`
          : ""
      }
    `;
  }

  return `
    <article class="pret-loan-card pret-status-${loan.status}">
      <div class="pret-loan-head">
        <h3>${escapeHtml(borrower?.name || "Membre")} — ${formatEuro(loan.amount)}</h3>
        <span class="pret-loan-status">${getPretStatusLabel(loan.status)}</span>
      </div>
      ${loan.note ? `<p class="pret-loan-note">${escapeHtml(loan.note)}</p>` : ""}
      <p class="pret-loan-date">Demandé le ${formatDate(loan.createdAt.split("T")[0])}</p>
      ${voteSection}
      ${financierSection}
      ${activeSection}
      ${mode === "active" && balance > 0 ? `<p class="pret-balance">Reste à payer : <strong>${formatEuro(balance)}</strong></p>` : ""}
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
      : `<p class="pret-empty">Aucune demande en attente. Les prêts en vote peuvent être accordés directement depuis « Demandes en vote ».</p>`;
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

function closeEvenement(eventId) {
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

  if (!confirm(`Clôturer « ${evt.title} » ?\nIl sera rangé discrètement sur le côté.`)) return;

  evt.closed = true;
  evt.closedAt = new Date().toISOString();
  evt.closedBy = getCurrentMember()?.id || null;

  saveEvenements();
  showEvenementSaveMessage(`Événement « ${evt.title} » clôturé.`);
}

function reimburseEvenementToBeneficiary(eventId) {
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

  if (!confirm(confirmMsg)) return;

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

function deleteEvenement(eventId) {
  if (!canManageEvenements()) {
    alert("Seuls les gestionnaires autorisés peuvent supprimer un événement.");
    return;
  }

  const evt = getEvenementById(eventId);
  if (!evt) return;

  if (!confirm(`Supprimer l'événement « ${evt.title} » ?`)) return;

  evenements = evenements.filter((item) => item.id !== eventId);
  saveEvenements();
  showEvenementSaveMessage("Événement supprimé.");
}

function resetClosedEvenements() {
  if (!requireGroupAdmin("réinitialiser les événements clôturés")) return;

  const closedEvents = evenements.filter((evt) => isEvenementClosed(evt));
  if (closedEvents.length === 0) {
    alert("Aucun événement clôturé à réinitialiser.");
    return;
  }

  if (
    !confirm(
      `Supprimer définitivement ${closedEvents.length} événement(s) clôturé(s) ?\n\nLa colonne « Clôturés » sera vidée. Cette action est irréversible.`
    )
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
    <article class="evenement-card evenement-card-member">
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
                 <p class="evenement-debt-note">Voir le détail dans Mes dettes et amendes → Dettes événements.</p>`
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
    <article class="evenement-card">
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

function buildEvenementCard(evt) {
  const current = getCurrentMember();
  if (!current) return "";

  if (canManageEvenements()) {
    return buildEvenementManagerCard(evt, current);
  }

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

function renderEvenements() {
  const current = getCurrentMember();
  if (!current) return;

  const canManage = canManageEvenements();

  if (evenementListTitle) {
    evenementListTitle.textContent = canManage ? "Événements du groupe" : `Mes événements — ${current.name}`;
  }
  if (evenementListSubtitle) {
    evenementListSubtitle.textContent = canManage
      ? "Cotisation de base par membre — saisissez le montant réellement versé (ex. 20 € si la cotisation est 10 €). Le total pour le poto suit les montants saisis."
      : "Récapitulatif de vos cotisations — total payé et reste à payer.";
  }

  if (evenementMemberSummary) {
    if (!canManage && evenements.length > 0) {
      evenementMemberSummary.hidden = false;
      evenementMemberSummary.innerHTML = buildEvenementMemberSummary(current);
    } else {
      evenementMemberSummary.hidden = true;
      evenementMemberSummary.innerHTML = "";
    }
  }

  if (resetClosedEvenementsBtn) {
    const closedCount = evenements.filter((evt) => isEvenementClosed(evt)).length;
    resetClosedEvenementsBtn.hidden = !isGroupAdmin() || closedCount === 0;
    resetClosedEvenementsBtn.textContent =
      closedCount > 0
        ? `Réinitialiser les clôturés (${closedCount})`
        : "Réinitialiser les clôturés";
  }

  if (!evenementList) return;

  if (evenements.length === 0) {
    evenementList.innerHTML = `<p class="pret-empty">Aucun événement pour le moment.</p>`;
    return;
  }

  const activeEvents = evenements.filter((evt) => !isEvenementClosed(evt));
  const closedEvents = evenements.filter((evt) => isEvenementClosed(evt));

  const activeHtml = activeEvents.length
    ? activeEvents.map((evt) => buildEvenementCard(evt)).join("")
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

  evenementList.innerHTML = `
    <div class="evenement-layout${closedEvents.length ? " evenement-layout-has-closed" : ""}">
      <div class="evenement-list-active">${activeHtml}</div>
      ${closedHtml}
    </div>
  `;
}

function render() {
  memberCounter.textContent = `${members.length} / ${MAX_MEMBERS} membres`;
  updateSessionUI();
  updateFormState();
  updateMemberSelects();
  renderTabPermissionsPanel();
  renderBureau();
  renderMemberList();
  renderTourneeTable();
  renderAmendes();
  renderEvenements();
  renderAdminList();
  if (isGroupAdmin()) renderAutreArgent();
}

function showAutreArgentSaveMessage(text, type = "success") {
  if (!autreArgentSaveMsg) return;
  autreArgentSaveMsg.textContent = text;
  autreArgentSaveMsg.className = `save-msg save-msg-${type}`;
  autreArgentSaveMsg.hidden = false;
}

function addAutreArgent(memberId, amount, note) {
  if (!requireGroupAdmin("enregistrer de l'autre argent")) return;

  const member = getMemberById(memberId);
  if (!member) {
    alert("Membre invalide.");
    return;
  }

  const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Montant invalide.");
    return;
  }

  autreArgent.unshift({
    id: generateId(),
    memberId,
    amount: parsedAmount,
    note: note.trim(),
    createdAt: new Date().toISOString(),
    createdBy: getCurrentMember()?.id || null,
  });

  saveAutreArgent();
  if (autreArgentForm) autreArgentForm.reset();
  showAutreArgentSaveMessage(
    `${formatEuro(parsedAmount)} de ${member.name} ajouté à la caisse brute.`
  );
}

function deleteAutreArgent(entryId) {
  if (!requireGroupAdmin("supprimer une entrée d'autre argent")) return;

  const entry = autreArgent.find((item) => item.id === entryId);
  if (!entry) return;

  const member = getMemberById(entry.memberId);
  if (!confirm(`Supprimer la contribution de ${formatEuro(entry.amount)} de ${member?.name || "ce membre"} ?`)) {
    return;
  }

  autreArgent = autreArgent.filter((item) => item.id !== entryId);
  saveAutreArgent();
  showAutreArgentSaveMessage("Entrée supprimée — montant retiré de la caisse brute.");
}

function renderAutreArgent() {
  if (!isGroupAdmin() || !autreArgentList) return;

  const total = getTotalAutreArgent();
  if (autreArgentTotal) autreArgentTotal.textContent = formatEuro(total);

  autreArgentList.innerHTML = autreArgent.length
    ? [...autreArgent]
        .sort((a, b) => {
          const nameA = getMemberById(a.memberId)?.name || "";
          const nameB = getMemberById(b.memberId)?.name || "";
          const cmp = nameA.localeCompare(nameB, "fr", { sensitivity: "base" });
          if (cmp !== 0) return cmp;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .map((entry) => {
          const member = getMemberById(entry.memberId);
          return `
            <tr>
              <td>${formatDate(entry.createdAt.split("T")[0])}</td>
              <td>${escapeHtml(member?.name || "—")}</td>
              <td>${entry.note ? escapeHtml(entry.note) : "—"}</td>
              <td><strong>${formatEuro(entry.amount)}</strong></td>
              <td>
                <button type="button" class="btn-delete btn-autre-argent-delete" data-id="${entry.id}">Supprimer</button>
              </td>
            </tr>
          `;
        })
        .join("")
    : `
      <tr>
        <td colspan="5" class="empty-cell">Aucune contribution pour le moment.</td>
      </tr>
    `;
}

function assignRole(memberId, roleId) {
  if (!requireGroupAdmin("nommer les membres de l'équipe administrative")) return;

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

    if (!confirm(msg)) return;
  }

  Object.keys(roles).forEach((key) => {
    if (roles[key] === memberId) delete roles[key];
  });

  roles[roleId] = memberId;
  saveRoles();
  roleForm.reset();
  bureauAssignOpen = false;
  updateSessionUI();
}

function clearRole(roleId) {
  if (!requireGroupAdmin("modifier l'équipe administrative")) return;

  const member = getMemberById(roles[roleId]);
  if (!member) return;

  if (confirm(`Retirer « ${member.name} » du poste de ${getRoleLabel(roleId)} ?`)) {
    delete roles[roleId];
    saveRoles();
  }
}

function addMember(name) {
  if (!requireGroupAdmin("ajouter des membres")) return;

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

  members.push({
    id: generateId(),
    name: trimmed,
    createdAt: new Date().toISOString(),
  });

  saveMembers();
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
}

function deleteMember(id) {
  if (!requireGroupAdmin("supprimer des membres")) return;

  const member = members.find((m) => m.id === id);
  if (!member) return;

  if (isOwnerMember(member)) {
    alert("Le propriétaire du site ne peut pas être supprimé.");
    return;
  }

  if (
    !confirm(
      `Supprimer le membre « ${member.name} » ?\n\nIl sera retiré de la tournée, des cotisations, amendes, événements, prêts et de toutes les autres données.`
    )
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

memberForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addMember(memberNameInput.value);
});

roleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const memberId = roleMemberSelect.value;
  const roleId = rolePostSelect.value;
  if (!memberId || !roleId) return;
  assignRole(memberId, roleId);
});

bureauAssignToggle?.addEventListener("click", () => {
  bureauAssignOpen = !bureauAssignOpen;
  updateSessionUI();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

loginBtn.addEventListener("click", openLoginModal);
logoutBtn.addEventListener("click", logoutMember);

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loginMember(loginNameInput.value, loginPasswordInput.value);
});

changePasswordForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  changeMemberPassword(
    currentPasswordInput.value,
    newPasswordInput.value,
    confirmPasswordInput.value
  );
});

saveCotisationsBtn.addEventListener("click", saveCotisationsData);

tourneeYearSelect?.addEventListener("change", () => {
  tourneeYear = tourneeYearSelect.value;
  renderTourneeTable();
});
saveTabPermissionsBtn?.addEventListener("click", saveTabPermissionsFromUI);

amendeForm.addEventListener("submit", (e) => {
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

amendeBody.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-amende-edit");
  const payBtn = e.target.closest(".btn-amende-pay");

  if (editBtn) startEditAmende(editBtn.dataset.id);
  if (payBtn) validateAmendePayment(payBtn.dataset.id);
});

amendeDetteBody?.addEventListener("click", (e) => {
  const payBtn = e.target.closest(".btn-dette-pay");
  if (payBtn) validateDettePayment(payBtn.dataset.id);
});

pretForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  initiatePret(pretAmountInput.value, pretNoteInput.value);
});

document.getElementById("tab-prets")?.addEventListener("click", (e) => {
  const yesBtn = e.target.closest(".btn-pret-yes");
  const noBtn = e.target.closest(".btn-pret-no");
  const approveBtn = e.target.closest(".btn-pret-approve");
  const rejectBtn = e.target.closest(".btn-pret-reject");
  const repayBtn = e.target.closest(".btn-pret-repay");
  const deletePretBtn = e.target.closest(".btn-pret-delete");

  if (yesBtn) votePret(yesBtn.dataset.loanId, "yes");
  if (noBtn) votePret(noBtn.dataset.loanId, "no");

  if (approveBtn) {
    const borrower = getMemberById(getLoanById(approveBtn.dataset.loanId)?.borrowerId);
    if (confirm(`Accorder immédiatement le prêt de ${borrower?.name || "ce membre"} ?`)) {
      financierDecidePret(approveBtn.dataset.loanId, "approved");
    }
  }

  if (rejectBtn) {
    if (confirm("Refuser cette demande de prêt ?")) {
      financierDecidePret(rejectBtn.dataset.loanId, "rejected");
    }
  }

  if (repayBtn) {
    const input = document.querySelector(`.pret-repay-input[data-loan-id="${repayBtn.dataset.loanId}"]`);
    if (input) recordRepayment(repayBtn.dataset.loanId, input.value);
  }

  if (deletePretBtn) deletePret(deletePretBtn.dataset.loanId);
});

adminForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  assignAdmin(adminMemberSelect?.value);
});

autreArgentForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  addAutreArgent(
    autreArgentMemberSelect?.value,
    autreArgentAmountInput?.value,
    autreArgentNoteInput?.value
  );
});

document.getElementById("tab-autre-argent")?.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".btn-autre-argent-delete");
  if (deleteBtn) deleteAutreArgent(deleteBtn.dataset.id);
});

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

document.getElementById("tab-evenements")?.addEventListener("click", (e) => {
  const payBtn = e.target.closest(".btn-evenement-pay");
  const editPayBtn = e.target.closest(".btn-evenement-edit-pay");
  const unpayBtn = e.target.closest(".btn-evenement-unpay");
  const deleteBtn = e.target.closest(".btn-evenement-delete");
  const reimburseBtn = e.target.closest(".btn-evenement-reimburse");
  const closeBtn = e.target.closest(".btn-evenement-close");

  const getPayInputValue = (eventId, memberId) =>
    document.querySelector(
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
});

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

async function initApp() {
  try {
    await checkServerSession();

    if (authState.loggedIn) {
      await loadDataFromServer();
      reloadFromStorage();
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
    } else {
      openLoginModal();
    }
  } catch (err) {
    console.error(err);
    openLoginModal();
    loginError.textContent = "Serveur indisponible. Relancez l'application.";
    loginError.hidden = false;
  }

  appReady = true;
  updateSessionUI();
  render();
  showTab(getSavedTab());
}

initApp();