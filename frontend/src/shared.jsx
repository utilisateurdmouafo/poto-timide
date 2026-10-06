import { createContext, useContext, useId, useState } from "react";

export const KEYS = {
  members: "poto-timide-members",
  roles: "poto-timide-roles",
  cotisations: "poto-timide-cotisations",
  fines: "poto-timide-amendes",
  fineCash: "poto-timide-amendes-caisse",
  loans: "poto-timide-prets",
  events: "poto-timide-evenements",
  oldDebts: "poto-timide-ancienne-tournee-dettes",
  cashEntries: "poto-timide-autre-argent",
  capital: "poto-timide-capital-hors-groupe",
  fund: "poto-timide-fond-caisse",
  annualFund: "poto-timide-fond-caisse-annuel",
  tournee: "poto-timide-tournee",
  communication: "poto-timide-communication",
  guide: "poto-timide-guide",
  law: "poto-timide-loi",
  messages: "poto-timide-messages",
  auditLog: "poto-timide-audit-log",
  permissions: "poto-timide-tab-permissions",
  adminIds: "poto-timide-admin-ids",
  account: "poto-timide-financier-account",
  notifications: "poto-timide-notifications",
};

export const NAV = [
  ["reunion", "Réunion", "▣"],
  ["prets", "Prêts", "↔"],
  ["evenements", "Événements", "✦"],
  ["amendes", "Dettes & amendes", "≡"],
  ["finance", "Finance", "€"],
  ["admin", "Admin", "⛨"],
];
export const APP_TABS = ["reunion", "membres", "tournee", "prets", "evenements", "communication", "notifications", "loi", "amendes", "finance", "fond-caisse", "admin"];
export const AdminTableContext = createContext(false);
export const TOURNEE_MONTHS = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
export const LOAN_RESERVE_PER_MEMBER = 20;
export const COMMUNICATION_CATEGORIES = [
  ["communique", "Communiqué"],
  ["agenda", "Ordre du jour"],
  ["rapport", "Rapports de réunions"],
  ["guide-site", "Guide site"],
  ["divers", "Divers potos"],
];
export const communicationCategoryOf = (entry) => {
  const category = entry.category || entry.kind;
  return COMMUNICATION_CATEGORIES.some(([id]) => id === category) ? category : "communique";
};

export const ADMIN_SECTIONS = [
  ["membres", "Membres & Bureau"],
  ["admins", "Admins"],
  ["acces", "Accès"],
  ["tournee", "Tournée"],
  ["caisse", "Caisse"],
  ["prets", "Prêts"],
  ["amendes", "Dettes & amendes"],
  ["evenements", "Événements"],
  ["communication", "Communication"],
  ["loi", "La loi"],
  ["sauvegarde", "Sauvegarde"],
  ["connexions", "Connexions"],
];

export function allowedAdminSections(data, session, fullAccess) {
  const sections = ADMIN_SECTIONS.map(([id]) => id);
  if (!session) return [];
  const isOwner = Boolean(session.isAdmin);
  if (fullAccess) return sections;
  const roleIds = Object.entries(data[KEYS.roles] || {}).filter(([, memberId]) => String(memberId) === String(session.id)).map(([roleId]) => roleId);
  const permissions = data[KEYS.permissions] || {};
  const hasTab = (...tabs) => tabs.some((tab) => roleIds.some((roleId) => Array.isArray(permissions[tab]) && permissions[tab].includes(roleId)));
  const financier = roleIds.includes("tresorier");
  const rules = {
    membres: hasTab("membres", "bureau"),
    tournee: hasTab("tournee"),
    caisse: financier || hasTab("caisse", "finance"),
    prets: financier || hasTab("prets"),
    amendes: financier || hasTab("amendes", "ancienne-tournee"),
    evenements: hasTab("evenements"),
    communication: hasTab("communication"),
    loi: hasTab("loi"),
    connexions: isOwner,
  };
  return sections.filter((id) => rules[id]);
}

export const EMPTY = {
  [KEYS.members]: [],
  [KEYS.roles]: {},
  [KEYS.fines]: [],
  [KEYS.fineCash]: [],
  [KEYS.loans]: [],
  [KEYS.events]: [],
  [KEYS.oldDebts]: [],
  [KEYS.cashEntries]: [],
  [KEYS.capital]: [],
  [KEYS.annualFund]: { years: {} },
  [KEYS.tournee]: { years: {} },
  [KEYS.permissions]: {},
  [KEYS.notifications]: [],
  [KEYS.communication]: [],
  [KEYS.guide]: [],
  [KEYS.law]: [],
  [KEYS.messages]: [],
  [KEYS.auditLog]: [],
};

export const money = (value) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);
export const formatIban = (value) => String(value || "").replace(/\s+/g, "").replace(/.{1,4}/g, "$& ").trim();
export const wholeMoney = (value) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(value) || 0);
export const date = (value) =>
  value ? new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(new Date(value)) : "—";
export const active = (row) => row && !row.deletedAt;
export const list = (data, key) => (Array.isArray(data[key]) ? data[key] : []);
export const byNewest = (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
export const loanPaid = (loan) =>
  (Array.isArray(loan.repayments) && loan.repayments.length
    ? loan.repayments.reduce((total, row) => total + (Number(row.amount) || 0), 0)
    : Number(loan.totalRepaid)) || 0;
export const loanRemaining = (loan) =>
  Math.max(0, (Number(loan.amount) || 0) + (Number(loan.interestAmount) || 0) - loanPaid(loan));
export const fineOriginal = (row) => Number(row.originalAmount) || (Number(row.amount) || 0) + (Number(row.repaidAmount) || 0);
export const loanCapital = (loan) => Math.max(0, (Number(loan.amount) || 0) - loanPaid(loan));
export const isEventFine = (fine) => Boolean(fine.evenementId || fine.eventId) || fine.type === "dette";

const sumRows = (rows, pick) => rows.reduce((total, row) => total + (Number(pick(row)) || 0), 0);
const eventPaidAmount = (event, memberId, payment) => (payment?.paid && String(memberId) !== String(event.beneficiaryMemberId) ? Number(payment.paidAmount ?? event.sharePerMember) || 0 : 0);

export function cashFigures(data, members) {
  const events = list(data, KEYS.events).filter(active);
  const loans = list(data, KEYS.loans).filter(active);
  const activeLoans = loans.filter((loan) => ["active", "defaulted"].includes(loan.status));
  const annualPaid = sumRows(Object.values(data[KEYS.annualFund]?.years || {}), (year) => sumRows(Object.values(year?.payments || {}), (payment) => payment?.paidAmount));
  const fineIncome = sumRows(list(data, KEYS.fineCash).filter(active), (row) => row.amount);
  const cashNet = sumRows(list(data, KEYS.cashEntries).filter(active), (row) => row.amount);
  const eventDeduction = sumRows(events, (event) => event.caisseDebtDeduction);
  const loansImpact = loans.filter((loan) => ["active", "defaulted", "completed"].includes(loan.status)).reduce((total, loan) => total - (Number(loan.amount) || 0) + loanPaid(loan), 0);
  const fund = Number(data[KEYS.fund]) || 0;
  const available = Math.max(0, fund + annualPaid + fineIncome - eventDeduction + cashNet + loansImpact);
  const eventsInCash = events.filter((event) => !event.reimbursedToBeneficiary)
    .reduce((total, event) => total + Object.entries(event.payments || {}).reduce((sum, [memberId, payment]) => sum + eventPaidAmount(event, memberId, payment), 0), 0);
  const loansCapital = sumRows(activeLoans, loanCapital);
  const capitalOutside = sumRows(list(data, KEYS.capital).filter(active), (row) => Math.max(0, Number(row.amount) || 0));
  const reserve = LOAN_RESERVE_PER_MEMBER * members.filter((person) => person.kind !== "nouveau").length;
  return {
    fund, available, eventsInCash, activeLoans, loansCapital, capitalOutside, reserve,
    brute: available + eventsInCash,
    outside: loansCapital + capitalOutside,
    total: available + loansCapital + capitalOutside,
    borrowable: Math.max(0, (available - reserve) / 2),
  };
}

export function memberEventRows(data, memberId) {
  return list(data, KEYS.events).filter(active).flatMap((event) => {
    const payment = event.payments?.[memberId];
    if (String(event.beneficiaryMemberId) === String(memberId) || event.reimbursedToBeneficiary) return [];
    const share = Number(event.sharePerMember) || 0;
    const paid = payment?.paid ? Number(payment.paidAmount ?? share) || 0 : 0;
    if (payment?.convertedToDebt) return [];
    if (!payment?.paid && event.closed) return [];
    const total = Number(payment?.debtAmount) || share;
    return [{ id: `${event.id}:${memberId}`, createdAt: event.createdAt, title: event.title, amount: paid || total, paid, remaining: payment?.paid ? 0 : total }];
  });
}

export async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.error || (response.status === 404
      ? `Route ${path} introuvable. Redémarrez Express depuis ce projet pour charger ses routes API.`
      : `Erreur serveur (${response.status})`);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}

export function Button({ children, variant = "secondary", className = "", ...props }) {
  return <button className={`button button-${variant} ${className}`} type="button" {...props}>{children}</button>;
}

export function Field({ label, name, type = "text", required = true, value, options, multiple = false, min, max, step, placeholder }) {
  const id = `field-${useId()}-${name}`;
  const common = { id, name, required, defaultValue: value, min, max, step, placeholder, multiple };
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {options ? (
        <select {...common}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select>
      ) : type === "textarea" ? (
        <textarea {...common} rows="3" />
      ) : (
        <input {...common} type={type} />
      )}
    </label>
  );
}

export function Form({ title, fields, submitLabel = "Enregistrer", onSubmit, className = "" }) {
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      const values = Object.fromEntries(new FormData(form));
      form.querySelectorAll("select[multiple]").forEach((select) => {
        values[select.name] = Array.from(select.selectedOptions, (option) => option.value);
      });
      const result = await onSubmit(values);
      if (result !== false) form.reset();
    } catch {
      // The page-level action handler presents the server error.
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={`panel form-panel ${className}`} onSubmit={submit}>
      {title && <h3>{title}</h3>}
      <div className="form-grid">{fields.map((field) => <Field key={field.name} {...field} />)}</div>
      <button className="button button-primary" disabled={busy}>{busy ? "En cours…" : submitLabel}</button>
    </form>
  );
}

export function Table({ columns, rows, empty = "Aucune donnée pour le moment.", footer, className = "" }) {
  const useAdminStyle = useContext(AdminTableContext);
  if (useAdminStyle) return <AdminTable columns={columns} rows={rows} empty={empty} footer={footer} className={className} />;
  const align = tableColumnAlignment;
  return (
    <div className={`table-wrap ${className}`.trim()}>
      <table>
        <thead><tr>{columns.map((column) => <th className={align(column) ? `table-${align(column)}` : ""} key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row) => <tr key={row.id}>{columns.map((column) => <TableCell column={column} row={row} align={align} key={column.key} />)}</tr>) : (
            <tr><td className="empty-cell" colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
        {footer?.length > 0 && <TableFooter columns={columns} footer={footer} align={align} />}
      </table>
    </div>
  );
}

export function AdminTable({ columns, rows, empty = "Aucune donnée pour le moment.", footer, className = "" }) {
  const align = tableColumnAlignment;
  return (
    <div className={`table-wrap admin-table-wrap ${className}`.trim()}>
      <table>
        <thead><tr>{columns.map((column) => <th className={align(column) ? `table-${align(column)}` : ""} key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <TableCell column={column} row={row} align={align} key={column.key} />)}</tr>) : (
            <tr><td className="empty-cell" colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
        {footer?.length > 0 && <TableFooter columns={columns} footer={footer} align={align} />}
      </table>
    </div>
  );
}

export function TableCell({ column, row, align }) {
  const content = column.render ? column.render(row) : row[column.key] ?? "—";
  const classes = [align(column) ? `table-${align(column)}` : "", content === "—" ? "table-dash" : ""].filter(Boolean).join(" ");
  return <td className={classes} data-label={typeof column.label === "string" ? column.label : undefined}>{content}</td>;
}

export function tableColumnAlignment(column) {
  return column.align || (
    /montant|reste|versé|payé|dû|cotisation|participation|collecté|total/i.test(column.label) ||
    ["amount", "due", "paid", "remaining", "repaid", "original", "required"].includes(column.key)
      ? "right"
      : ""
  );
}

export function TableFooter({ columns, footer, align }) {
  return <tfoot><tr>{footer.map((cell, index) => {
    const item = cell && typeof cell === "object" && "content" in cell
      ? cell
      : { content: cell };
    const columnIndex = footer.slice(0, index).reduce((count, previous) => count + (
      previous && typeof previous === "object" && "content" in previous
        ? Number(previous.colSpan) || 1
        : 1
    ), 0);
    const column = columns[columnIndex];
    const alignment = item.align || (column ? align(column) : "");
    return <td className={alignment ? `table-${alignment}` : ""} data-label={column && !item.colSpan && typeof column.label === "string" ? column.label : undefined} colSpan={item.colSpan} key={index}>{item.content ?? ""}</td>;
  })}</tr></tfoot>;
}

export function Stat({ label, value, note, tone = "" }) {
  return <article className={`stat ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>;
}

export function MemberChips({ ids, members, flags = {}, amounts, empty }) {
  if (!ids?.length) return <span className="muted">{empty}</span>;
  return <div className="member-chips">{ids.map((id) => {
    const person = members.find((member) => String(member.id) === String(id));
    return <span className="member-chip" key={id}>{person?.name || "Membre"}{(flags?.[id] === true || flags?.[id]?.ok) && <small>Validé</small>}{amounts && <small>{money((Number(amounts[id]) || 0) * 12)}</small>}</span>;
  })}</div>;
}

export const ROLE_NAMES = {
  president: "Président",
  "vice-president": "Vice-président",
  tresorier: "Financier",
  "vice-tresorier": "Vice-financier",
  censeur: "Censeur",
  "charge-affaires": "Chargé d’activité",
  "vice-charge-affaires": "Vice chargé d’activité",
};

export const FINE_NAMES = { absence: "Absence", retard: "Retard", bavardage: "Bavardage", sanctions: "Sanction", contribution: "Contribution", dette: "Événement", "ex-tournee": "Ex tournée" };

export function OrderEditor({ label, idSuffix, ids, members, amounts, onChange }) {
  const selected = new Set(ids);
  const fieldId = `add-${label.replaceAll(" ", "-")}-${idSuffix}`;
  return <div className="order-editor">
    <span className="order-editor-label">{label}</span>
    <label className="sr-only" htmlFor={fieldId}>Ajouter un membre à l’ordre</label>
    <select id={fieldId} value="" onChange={(event) => {
      const memberId = event.target.value;
      if (memberId && !selected.has(memberId)) onChange([...ids, memberId]);
    }}>
      <option value="">Ajouter un membre…</option>
      {members.filter((member) => !selected.has(member.id)).map((member) => <option key={member.id} value={member.id}>{member.name}{amounts ? ` · ${money((Number(amounts[member.id]) || 0) * 12)}` : ""}</option>)}
    </select>
    <div className="order-items">{ids.map((id, index) => {
      const person = members.find((member) => String(member.id) === String(id));
      return <div className="order-item" key={id}>
        <span className="order-rank">{index + 1}</span><strong>{person?.name || "Membre"}</strong>{amounts && <small>{money((Number(amounts[id]) || 0) * 12)}</small>}
        <div className="row-actions">
          <Button aria-label={`Monter ${person?.name || "le membre"}`} disabled={index === 0} onClick={() => { const next = [...ids]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>↑</Button>
          <Button aria-label={`Descendre ${person?.name || "le membre"}`} disabled={index === ids.length - 1} onClick={() => { const next = [...ids]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); }}>↓</Button>
          <Button variant="danger" aria-label={`Retirer ${person?.name || "le membre"}`} onClick={() => onChange(ids.filter((value) => value !== id))}>×</Button>
        </div>
      </div>;
    })}{!ids.length && <span className="muted">Aucun membre dans cet ordre.</span>}</div>
  </div>;
}

export function MiniAmountAction({ label, max, onSubmit }) {
  const [amount, setAmount] = useState(Number(max) || "");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try { await onSubmit(Number(amount)); } catch { /* The page-level action handler presents the server error. */ } finally { setBusy(false); }
  }
  return <form className="mini-form" onSubmit={submit}><input aria-label={`${label} montant`} type="number" min="0.01" max={max} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /><button className="button button-primary" disabled={busy}>{label}</button></form>;
}

export function PromptNumberAction({ label, initial, min = 0, onSubmit }) {
  return <Button onClick={async () => {
    const value = prompt(`${label} (€) :`, String(initial ?? ""));
    if (value === null) return;
    const parsed = Number(value.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < min) {
      alert(`Montant invalide. Minimum : ${money(min)}.`);
      return;
    }
    await onSubmit(parsed);
  }}>{label}</Button>;
}

export function LoanDateAction({ loan, runAction }) {
  const currentDate = String(loan.createdAt || "").slice(0, 10);
  const [value, setValue] = useState(currentDate);
  return <form className="mini-form" onSubmit={(event) => {
    event.preventDefault();
    runAction({ domain: "loan", type: "update-date", loanId: loan.id, date: value }, "Date de demande modifiée.");
  }}><input aria-label="Date de demande de prêt" type="date" value={value} onChange={(event) => setValue(event.target.value)} required /><button className="button">Date</button></form>;
}

export function PageHeading({ eyebrow, title, description }) {
  return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>;
}

export function PanelTitle({ title, meta }) {
  return <div className="panel-heading"><h2>{title}</h2>{meta && <span>{meta}</span>}</div>;
}

export function addMonthsYmd(iso, months) {
  const base = new Date(iso);
  if (Number.isNaN(base.getTime())) return null;
  const next = new Date(base.getFullYear(), base.getMonth() + months, base.getDate(), 12);
  return `${String(next.getDate()).padStart(2, "0")}/${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export function loanDueLabel(loan) {
  const start = loan.approvedAt || loan.createdAt;
  const first = addMonthsYmd(start, 1);
  const second = addMonthsYmd(start, 2);
  return first && second ? `80% ${first} · Solde ${second}` : "";
}

export function Status({ value }) {
  const tone = /^(payé|soldé|clôturé|remboursé|oui|entrée)(?:$|[\s·])/i.test(value)
    ? "status-success"
    : /^retard \+ intérêts/i.test(value)
      ? "status-pending"
    : /retard|refus|non|passé en dette|sortie/i.test(value)
      ? "status-danger"
      : /à payer|partiel|payer|en cours|ouvert|en vote|attente|à valider/i.test(value)
        ? "status-pending"
        : "";
  return <span className={`status ${tone}`}>{value}</span>;
}

export function EmptyPanel({ message }) {
  return <div className="empty-panel"><span className="empty-icon">◌</span><p>{message}</p></div>;
}
