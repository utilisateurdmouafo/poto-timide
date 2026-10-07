import { useState } from "react";
import { KEYS, cashFigures, loanDueLabel, memberEventRows, loanCapital, isEventFine, TOURNEE_MONTHS, LOAN_RESERVE_PER_MEMBER, COMMUNICATION_CATEGORIES, communicationCategoryOf, money, formatIban, wholeMoney, date, active, list, byNewest, loanPaid, loanRemaining, fineOriginal, request, Button, Form, Table, Stat, MemberChips, ROLE_NAMES, FINE_NAMES, MiniAmountAction, PromptNumberAction, LoanDateAction, PageHeading, PanelTitle, Status, EmptyPanel } from "./shared.jsx";

/** Carte KPI cliquable — style Prêts (fond blanc, bordure colorée) */
function ReunionStripButton({ label, value, tone = "navy", onClick }) {
  return (
    <button
      type="button"
      className={`reunion-card reunion-card--kpi reunion-card--${tone}`}
      title={`Ouvrir ${label}`}
      onClick={onClick}
    >
      <span className="reunion-card__label">{label}</span>
      <strong className="reunion-card__value">{value}</strong>
    </button>
  );
}

/** Menu section cliquable — même style carte React que Prêts */
function ReunionHubButton({ label, tone = "navy", badge, onClick }) {
  return (
    <button
      type="button"
      className={`reunion-card reunion-card--hub reunion-card--${tone}`}
      onClick={onClick}
    >
      <span className="reunion-card__label">{label}</span>
      {badge != null && badge > 0 && (
        <span className="reunion-card__badge" aria-label={`${badge} non lues`}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

export function MeetingPage({ data, member, members, names, online, onlineMembers, isAdmin, can, unreadCount, navigate }) {
  const { available, activeLoans, total: totalCash, borrowable } = cashFigures(data, members);
  const myFines = list(data, KEYS.fines).filter((fine) => active(fine) && String(fine.memberId) === String(member.id)).reduce((sum, fine) => sum + Math.max(0, Number(fine.amount) || 0), 0);
  const myOldDebts = list(data, KEYS.oldDebts).filter((debt) => active(debt) && String(debt.memberId) === String(member.id)).reduce((sum, debt) => sum + Math.max(0, Number(debt.amount) || 0), 0);
  const myEventDebts = memberEventRows(data, member.id).reduce((sum, row) => sum + row.remaining, 0);
  const personalDue = myFines + myOldDebts + myEventDebts;
  const year = String(new Date().getFullYear());
  const annual = data[KEYS.annualFund]?.years?.[year] || {};
  const fundPaid = Number(annual.payments?.[member.id]?.paidAmount) || 0;
  const fundDue = Math.max(0, (Number(annual.amountPerMember) || 0) - fundPaid);

  const stripItems = [
    { label: "Empruntable", value: wholeMoney(borrowable), target: "prets", tone: "cyan" },
    { label: "Disponible", value: wholeMoney(available), target: "finance", tone: "sky" },
    { label: "Totale", value: wholeMoney(totalCash), target: "finance", tone: "indigo" },
    { label: "Prêts", value: String(activeLoans.length), target: "prets", tone: "green" },
    { label: "À verser", value: wholeMoney(personalDue), target: "amendes", tone: "rose" },
    { label: "Fond caisse", value: fundDue > 0 ? wholeMoney(fundDue) : annual.amountPerMember ? "OK" : "—", target: "fond-caisse", tone: "fund" },
    { label: "En ligne", value: `${online} / ${members.length}`, target: "membres", tone: "slate" },
  ];

  const menuItems = [
    { target: "communication", label: "Communication", tone: "navy" },
    { target: "membres", label: "Membres & Bureau", tone: "teal" },
    { target: "tournee", label: "Tournée", tone: "emerald" },
    { target: "prets", label: "Prêts", tone: "green" },
    { target: "fond-caisse", label: "Fond de caisse", tone: "fund" },
    { target: "evenements", label: "Événements", tone: "warn" },
    { target: "amendes", label: "Dettes & amendes", tone: "danger" },
    { target: "finance", label: "Finance", tone: "blue" },
    { target: "loi", label: "La loi", tone: "purple" },
    { target: "notifications", label: "Notifications", tone: "notif", badge: unreadCount },
    ...(isAdmin ? [{ target: "admin", label: "Admin", tone: "slate" }] : []),
  ];

  return (
    <div className="page-content reunion-page">
      <section className="panel reunion-panel">
        <header className="reunion-heading">
          <h1>Réunion</h1>
          <p>Tous les menus du site — clique pour ouvrir une section.</p>
        </header>

        <div className="reunion-strip stats-grid compact" role="group" aria-label="Indicateurs rapides">
          {stripItems.map((item) => (
            <ReunionStripButton
              key={item.label}
              label={item.label}
              value={item.value}
              tone={item.tone}
              onClick={() => navigate(item.target)}
            />
          ))}
        </div>

        <nav className="reunion-menu-hub" aria-label="Sections du groupe">
          {menuItems.map((item) => (
            <ReunionHubButton
              key={item.target}
              label={item.label}
              tone={item.tone}
              badge={item.badge}
              onClick={() => navigate(item.target)}
            />
          ))}
        </nav>
      </section>
    </div>
  );
}

export function MembersPage({ data, members, roles, online, onlineMembers, member, navigate }) {
  const names = Object.fromEntries(members.map((person) => [String(person.id), person.name]));

  return <div className="page-content">
    <PageHeading eyebrow="Le groupe" title="Membres" description="Retrouvez les membres et l’équipe administrative du groupe." />
    <div className="stats-grid compact"><Stat label="Membres" value={members.length} /><Stat label="Connectés" value={online} tone="stat-blue" /></div>
    <div className="content-grid">
      <section className="panel"><PanelTitle title="Connectés en ce moment" meta={`${online} en ligne`} />
        {onlineMembers?.length ? <div className="meeting-presence-list">{onlineMembers.map((person) => <span className="meeting-presence" key={person.id}><i />{person.name}{String(person.id) === String(member?.id) && <small>Vous</small>}</span>)}</div> : <p className="muted">Aucun membre connecté pour le moment.</p>}
      </section>

    </div>
    <section className="panel"><PanelTitle title="Équipe administrative" />
      <div className="bureau-grid">{Object.entries(ROLE_NAMES).map(([role, label]) => {
        const memberId = roles?.[role];
        const person = members.find((row) => String(row.id) === String(memberId));
        return person && <article className="bureau-card" key={role}><span className="eyebrow">{label}</span><strong>{person.name}</strong></article>;
      })}</div>
    </section>
    <section className="panel"><PanelTitle title="Liste des membres" meta={`${members.length} membres`} />
      <Table columns={[
        { key: "name", label: "Membre", render: (row) => <strong>{row.name}</strong> },
        { key: "kind", label: "Statut", render: (row) => row.kind === "nouveau" ? "Nouveau membre" : "Membre actif" },
        { key: "office", label: "Fonction", render: (row) => Object.entries(roles || {}).filter(([, id]) => String(id) === String(row.id)).map(([role]) => ROLE_NAMES[role] || role).join(", ") || "Membre" },
      ]} rows={members} />
    </section>
  </div>;
}

export function TourneePage({ data, members, canManage, saveData }) {
  const years = data[KEYS.tournee]?.years || {};
  const currentYear = String(new Date().getFullYear());
  const yearOptions = [...new Set([...Object.keys(years), String(Number(currentYear) - 1), currentYear, String(Number(currentYear) + 1)])].sort((a, b) => Number(b) - Number(a));
  const [year, setYear] = useState(currentYear);
  const record = years[year] || {};
  return <div className="page-content">
    <PageHeading eyebrow="Calendrier du groupe" title="Tournée" description="Consultez les ordres de réception et de ristourne du cycle septembre–juin." />
    {canManage && <TourneeAdmin data={data} members={members} saveData={saveData} />}
    {!canManage && <>
      <div className="year-select"><label htmlFor="public-tournee-year">Année</label><select id="public-tournee-year" value={year} onChange={(event) => setYear(event.target.value)}>{yearOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
      <section className="panel"><PanelTitle title="Organisation de la tournée" meta={`Année ${year}`} />
        <Table columns={[
          { key: "number", label: "N°", render: (row) => row.index + 1 },
          { key: "month", label: "Mois" },
          { key: "reception", label: "Ordre de réception", render: (row) => <MemberChips ids={record.reception?.[row.key] || []} members={members} flags={record.receptionOk} empty="Aucun membre défini." /> },
          { key: "ristourne", label: "Ordre de ristourne", render: (row) => <MemberChips ids={record.ristourne?.[row.key] || []} members={members} flags={record.ristourneOk} amounts={data[KEYS.cotisations] || {}} empty="Aucun membre défini." /> },
        ]} rows={TOURNEE_MONTHS.map((monthIndex, index) => ({ id: `tournee-${monthIndex}`, key: String(monthIndex), index, month: new Intl.DateTimeFormat("fr-BE", { month: "long" }).format(new Date(2020, monthIndex, 1)) }))} />
      </section>
    </>}
  </div>;
}

export function FundPage({ data, members, member }) {
  const years = data[KEYS.annualFund]?.years || {};
  const currentYear = new Date().getFullYear();
  const options = [...new Set([...Object.keys(years), String(currentYear - 1), String(currentYear), String(currentYear + 1)])].sort((a, b) => Number(b) - Number(a));
  const [year, setYear] = useState(String(currentYear));
  const record = years[year] || {};
  const amount = Number(record.amountPerMember) || 0;
  const paidTotal = members.reduce((sum, row) => sum + (Number(record.payments?.[row.id]?.paidAmount) || 0), 0);
  const expected = amount * members.length;
  return <div className="page-content">
    <PageHeading eyebrow="Suivi des cotisations" title="Fond de caisse" description="Consultez le fond de départ et l’état des versements annuels." />
    <div className="year-select"><label htmlFor="fund-year">Année</label><select id="fund-year" value={year} onChange={(event) => setYear(event.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="stats-grid compact">
      <Stat label="Fond de départ (groupe)" value={money(Number(data[KEYS.fund]) || 0)} />
      <Stat label={`Par membre · ${year}`} value={amount ? money(amount) : "—"} />
      <Stat label="Total attendu" value={money(expected)} />
      <Stat label="Versé · reste" value={`${money(paidTotal)} · ${money(Math.max(0, expected - paidTotal))}`} tone="stat-blue" />
    </div>
    <section className="panel"><PanelTitle title="Fond annuel de chacun" meta={`Année ${year}`} />
      <Table columns={[
        { key: "name", label: "Membre", render: (row) => <strong>{row.name}{String(row.id) === String(member.id) && <span className="you-tag">Vous</span>}</strong> },
        { key: "due", label: "Dû", render: () => money(amount) },
        { key: "paid", label: "Versé", render: (row) => money(record.payments?.[row.id]?.paidAmount) },
        { key: "remaining", label: "Reste", render: (row) => money(Math.max(0, amount - (Number(record.payments?.[row.id]?.paidAmount) || 0))) },
        { key: "status", label: "Statut", render: (row) => {
          const payment = record.payments?.[row.id] || {};
          const due = Math.max(0, amount - (Number(payment.paidAmount) || 0));
          return !amount ? "—" : payment.convertedToDebt ? <Status value="Passé en dette" /> : due <= 0 ? <Status value="Soldé" /> : <Status value="En cours" />;
        } },
      ]} rows={members} footer={[
        { content: <strong>Total</strong>, colSpan: 1 },
        money(amount * members.length),
        money(paidTotal),
        money(Math.max(0, amount * members.length - paidTotal)),
        "",
      ]} />
    </section>
  </div>;
}

export function LoansPage({ data, member, members, names, canManage, runAction, confirmAction }) {
  const loans = list(data, KEYS.loans).filter(active).sort(byNewest);
  const voting = loans.filter((loan) => loan.status === "voting");
  const awaiting = loans.filter((loan) => loan.status === "awaiting_financier");
  const activeLoans = loans.filter((loan) => ["active", "defaulted"].includes(loan.status) && (canManage || loan.borrowerId === member.id));
  const loansTable = loans.filter((loan) => ["active", "defaulted", "completed"].includes(loan.status) && (canManage || loan.borrowerId === member.id)).sort((a, b) => Number(b.status !== "completed") - Number(a.status !== "completed"));
  const history = loans.filter((loan) => loan.status === "rejected" && (canManage || loan.borrowerId === member.id));
  const groupActiveLoans = loans.filter((loan) => ["active", "defaulted"].includes(loan.status));
  const { available: availableCash, brute, eventsInCash, loansCapital, capitalOutside, outside, total: totalCash, fund, borrowable, reserve } = cashFigures(data, members);
  const me = members.find((person) => String(person.id) === String(member.id));
  const ownOpenLoan = loans.find((loan) => String(loan.borrowerId) === String(member.id) && ["voting", "awaiting_financier", "active", "defaulted"].includes(loan.status));
  const pendingVote = loans.find((loan) => ["voting", "awaiting_financier"].includes(loan.status));
  const banUntil = loans.filter((loan) => String(loan.borrowerId) === String(member.id) && loan.loanBanUntil).map((loan) => new Date(loan.loanBanUntil).getTime()).filter(Number.isFinite).sort((a, b) => b - a)[0];
  const oldDebt = list(data, KEYS.oldDebts).filter((row) => active(row) && String(row.memberId) === String(member.id)).reduce((sum, row) => sum + Math.max(0, Number(row.amount) || 0), 0);
  const lockMessage = !member.id ? ""
    : me?.kind === "nouveau" ? "Seuls les membres du groupe peuvent demander un prêt."
    : pendingVote ? `Demande en vote pour ${names[pendingVote.borrowerId] || "un membre"} (${(pendingVote.status === "voting" ? "en vote" : "à valider")}). Un nouveau prêt sera possible une fois accordé ou refusé.`
    : ownOpenLoan ? "Vous avez déjà un prêt en cours."
    : banUntil && Date.now() < banUntil ? `Vous êtes interdit de prêt jusqu’au ${date(banUntil)} (article 4.4).`
    : oldDebt > 0 ? `Vous avez une dette d’ancienne tournée (${money(oldDebt)}). Remboursez-la avant de faire un prêt.`
    : "";  const statusNames = { voting: "En vote", awaiting_financier: "À valider", active: "En cours", defaulted: "Retard + intérêts", completed: "Remboursé", rejected: "Refusé" };
  return (
    <div className="page-content">
      <PageHeading eyebrow="Gestion des prêts" title="Prêts" description="Demandez un prêt, participez aux votes et suivez les remboursements." />
      <div className="stats-grid compact">
        <Stat label="Demandes en vote" value={voting.length} />
        <Stat label="En attente du financier" value={awaiting.length} tone="stat-gold" />
        <Stat label="Prêts en cours" value={activeLoans.length} tone="stat-blue" />
        <Stat label="Reste à rembourser" value={money(activeLoans.reduce((sum, loan) => sum + loanRemaining(loan), 0))} tone="stat-red" />
      </div>
      <section className="panel"><PanelTitle title="Prêts du groupe" meta={`${groupActiveLoans.length} prêt${groupActiveLoans.length === 1 ? "" : "s"} en cours`} />
        <div className="stats-grid compact loan-capacity-grid">
          <Stat label="Argent empruntable" value={money(borrowable)} note={`(Caisse disponible − ${money(reserve)}) ÷ 2`} tone="stat-blue" />
          <Stat label="Caisse disponible" value={money(availableCash)} note="Amendes + dons − prêts sortis + remboursements" />
          <Stat label="Caisse brute" value={money(brute)} note={`Caisse disponible + événements (${money(eventsInCash)})`} />
          <Stat label={`Prêts sortis · ${groupActiveLoans.length} prêt${groupActiveLoans.length === 1 ? "" : "s"}`} value={money(loansCapital)} note="Capital encore dehors (prêt − remboursé)" tone="stat-gold" />
          <Stat label="Caisse total" value={money(totalCash)} note={`Caisse disponible ${money(availableCash)} + dehors ${money(outside)}`} tone="stat-blue" />
        </div>
        {groupActiveLoans.length > 0 && <div className="meeting-presence-list">{groupActiveLoans.map((loan) => <span className="meeting-presence loan-borrower" key={loan.id}>{names[loan.borrowerId] || "Membre"}<strong>{money(loanCapital(loan))}</strong><small>{loan.status === "defaulted" ? "En retard" : "En cours"}</small></span>)}</div>}
      </section>
      <section className="panel loan-request-panel"><PanelTitle title="Initier un prêt" />
        <p className="muted">Une demande en vote à la fois. Le plafond dépend de la caisse et de la réserve par membre.</p>
        {lockMessage && <p className="loan-lock-message" role="alert">{lockMessage}</p>}
        <fieldset className="loan-request-lock" disabled={Boolean(lockMessage)}>
          <Form className="inline-form" title="Demander un prêt" fields={[
            { name: "amount", label: `Montant (€) · maximum ${money(borrowable)}`, type: "number", min: "1", max: borrowable, step: "0.01" },
            { name: "note", label: "Motif", placeholder: "À quoi servira le prêt ?" },
          ]} submitLabel="Soumettre au vote" onSubmit={(values) => runAction({ domain: "loan", type: "request", amount: Number(values.amount), note: values.note }, "Demande envoyée au groupe.")} />
        </fieldset>
      </section>      <section className="panel"><PanelTitle title="Demandes soumises au vote" meta={`${voting.length} demande${voting.length === 1 ? "" : "s"}`} />
        <Table columns={[
          { key: "createdAt", label: "Date", render: (row) => date(row.createdAt) },
          { key: "type", label: "Type", render: () => "Prêt" },
          { key: "detail", label: "Détail", render: (row) => `${names[row.borrowerId] || "Membre"} — ${row.note || "Demande de prêt"}` },
          { key: "amount", label: "Montant", render: (row) => money(row.amount) },
          { key: "paid", label: "Déjà versé", render: () => "—" },
          { key: "remaining", label: "Reste", render: (row) => money(loanRemaining(row)) },
          { key: "status", label: "Statut", render: (row) => <div className="table-status"><Status value={statusNames[row.status] || row.status} /><small>{Object.values(row.votes || {}).filter((vote) => vote === "yes").length} oui · {Object.values(row.votes || {}).filter((vote) => vote === "no").length} non</small></div> },
          { key: "actions", label: "Actions", render: (row) => <div className="row-actions">{row.borrowerId !== member.id && !row.votes?.[member.id] && <><Button variant="primary" onClick={() => runAction({ domain: "loan", type: "vote", loanId: row.id, vote: "yes" }, "Vote enregistré.")}>Oui</Button><Button variant="danger" onClick={() => runAction({ domain: "loan", type: "vote", loanId: row.id, vote: "no" }, "Vote enregistré.")}>Non</Button></>}{canManage && <Button variant="danger" onClick={() => confirmAction({ domain: "loan", type: "delete", loanId: row.id }, "Supprimer cette demande de prêt ?")}>Supprimer</Button>}</div> },
        ]} rows={voting} empty="Aucune demande en vote." />
      </section>
      {canManage && awaiting.length > 0 && <section className="panel"><PanelTitle title="Validation du financier" />
        <Table columns={[
          { key: "createdAt", label: "Date", render: (row) => date(row.createdAt) },
          { key: "type", label: "Type", render: () => "Prêt" },
          { key: "detail", label: "Détail", render: (row) => `${names[row.borrowerId] || "Membre"} — ${row.note || "Demande de prêt"}` },
          { key: "amount", label: "Montant", render: (row) => money(row.amount) },
          { key: "paid", label: "Déjà versé", render: () => "—" },
          { key: "remaining", label: "Reste", render: (row) => money(loanRemaining(row)) },
          { key: "status", label: "Statut", render: (row) => <Status value={loanRemaining(row) <= 0 ? "Remboursé" : statusNames[row.status] || row.status} /> },
          { key: "actions", label: "Actions", render: (row) => <div className="row-actions"><Button variant="primary" onClick={() => runAction({ domain: "loan", type: "decide", loanId: row.id, decision: "approved" }, "Prêt accordé.")}>Accorder</Button><Button variant="danger" onClick={() => runAction({ domain: "loan", type: "decide", loanId: row.id, decision: "rejected" }, "Demande refusée.")}>Refuser</Button><Button variant="danger" onClick={() => confirmAction({ domain: "loan", type: "delete", loanId: row.id }, "Supprimer cette demande de prêt ?")}>Supprimer</Button></div> },
        ]} rows={awaiting} empty="Aucune demande en attente de validation." />
      </section>}
      <section className="panel"><PanelTitle title={canManage ? "Prêts à rembourser" : "Mes prêts"} />
        <Table columns={[
          { key: "createdAt", label: canManage ? "Date de demande" : "Date", render: (row) => date(row.createdAt) },
          { key: "type", label: "Type", render: () => "Prêt" },
          { key: "detail", label: "Détail", render: (row) => `${names[row.borrowerId] || "Membre"} — ${row.note || "Prêt"}` },
          { key: "amount", label: "Montant", render: (row) => money(row.amount) },
          { key: "repaid", label: "Déjà remboursé", render: (row) => money(loanPaid(row)) },
          { key: "remaining", label: "Reste", render: (row) => money(loanRemaining(row)) },
          { key: "status", label: "Statut", render: (row) => <Status value={statusNames[row.status] || row.status} /> },
          { key: "actions", label: "Actions", render: (row) => <div className="row-actions">{canManage && loanRemaining(row) > 0 && <small className="loan-due">{loanDueLabel(row)}</small>}{canManage && loanRemaining(row) > 0 && <MiniAmountAction label="Rembourser" max={loanRemaining(row)} onSubmit={(amount) => runAction({ domain: "loan", type: "repay", loanId: row.id, amount }, "Remboursement enregistré.")} />}{canManage && <LoanDateAction loan={row} runAction={runAction} />}{canManage && (row.repayments || []).map((repayment) => <Button key={repayment.id} onClick={() => confirmAction({ domain: "loan", type: "undo-repayment", loanId: row.id, repaymentId: repayment.id }, `Annuler le remboursement de ${money(repayment.amount)} ?`)}>Annuler {money(repayment.amount)}</Button>)}{canManage && <Button variant="danger" onClick={() => confirmAction({ domain: "loan", type: "delete", loanId: row.id }, "Supprimer ce prêt ?")}>Supprimer</Button>}</div> },
        ]} rows={loansTable} empty="Aucun prêt en cours." footer={[
          { content: <strong>Total à régler</strong>, colSpan: 3 },
          money(loansTable.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0)),
          money(loansTable.reduce((sum, loan) => sum + loanPaid(loan), 0)),
          money(loansTable.reduce((sum, loan) => sum + loanRemaining(loan), 0)),
          "",
          "",
        ]} />
      </section>
      {!!history.length && <section className="panel"><PanelTitle title="Historique des demandes" />
        <Table columns={[
          { key: "createdAt", label: "Date", render: (row) => date(row.createdAt) },
          { key: "type", label: "Type", render: () => "Prêt" },
          { key: "detail", label: "Détail", render: (row) => `${names[row.borrowerId] || "Membre"} — ${row.note || "Demande de prêt"}` },
          { key: "amount", label: "Montant", render: (row) => money(row.amount) },
          { key: "paid", label: "Déjà versé", render: (row) => money(loanPaid(row)) },
          { key: "remaining", label: "Reste", render: (row) => money(loanRemaining(row)) },
          { key: "status", label: "Statut", render: (row) => <Status value={statusNames[row.status] || row.status} /> },
          { key: "actions", label: "Actions", render: (row) => canManage ? <Button variant="danger" onClick={() => confirmAction({ domain: "loan", type: "delete", loanId: row.id }, "Supprimer cette demande de prêt ?")}>Supprimer</Button> : "—" },
        ]} rows={history} empty="Aucune demande refusée." /></section>}
    </div>
  );
}

export function EventsPage({ data, member, members, names, canManage, runAction, confirmAction }) {
  const events = list(data, KEYS.events).filter(active).sort(byNewest);
  if (!canManage) {
    const rows = memberEventRows(data, member.id).sort(byNewest);
    const pending = rows.filter((row) => row.remaining > 0);
    const totalDue = pending.reduce((sum, row) => sum + row.remaining, 0);
    return (
      <div className="page-content">
        <PageHeading eyebrow="Vie du groupe" title={`Mes événements — ${member.name}`} description="Lecture seule. La création et les paiements se gèrent dans Admin → Événements." />
        <div className="stats-grid compact"><Stat label="Total à régler" value={money(totalDue)} note={`${pending.length} cotisation${pending.length === 1 ? "" : "s"} en cours`} tone="stat-red" /></div>
        <section className="panel"><PanelTitle title="Mes cotisations" meta={`${rows.length} ligne${rows.length === 1 ? "" : "s"}`} />
          <Table columns={[
            { key: "createdAt", label: "Date", render: (row) => date(row.createdAt) },
            { key: "type", label: "Type", render: () => "Événement" },
            { key: "title", label: "Détail" },
            { key: "amount", label: "Montant", render: (row) => money(row.amount) },
            { key: "paid", label: "Déjà versé", render: (row) => row.paid > 0 ? money(row.paid) : "—" },
            { key: "remaining", label: "Reste", render: (row) => money(row.remaining) },
            { key: "status", label: "Statut", render: (row) => <Status value={row.remaining > 0 ? "À payer" : "Payé"} /> },
          ]} rows={rows} empty="Aucun événement en cours." footer={[
            { content: <strong>Total à régler</strong>, colSpan: 3 },
            money(rows.reduce((sum, row) => sum + row.amount, 0)),
            money(rows.reduce((sum, row) => sum + row.paid, 0)),
            money(totalDue),
            "",
          ]} />
        </section>
      </div>
    );
  }

  return (
    <div className="page-content">
      <PageHeading eyebrow="Vie du groupe" title="Événements" description="Suivez les participations, validez les versements et gérez les événements du groupe." />
      {canManage && <Form className="inline-form" title="Créer un événement" fields={[
        { name: "title", label: "Nom de l’événement" },
        { name: "beneficiaryMemberId", label: "Bénéficiaire", options: members.map((row) => [row.id, row.name]) },
        { name: "sharePerMember", label: "Participation par membre (€)", type: "number", min: "0.01", step: "0.01" },
        { name: "description", label: "Description", type: "textarea", required: false },
      ]} submitLabel="Créer l’événement" onSubmit={(values) => runAction({ domain: "event", type: "create", ...values, sharePerMember: Number(values.sharePerMember) }, "Événement créé.")} />}
      <div className="stats-grid compact">
        <Stat label="Événements ouverts" value={events.filter((event) => !event.closed).length} />
        <Stat label="Fonds collectés" value={money(events.reduce((sum, event) => sum + Object.values(event.payments || {}).reduce((subtotal, payment) => subtotal + (payment?.paid ? Number(payment.paidAmount ?? event.sharePerMember) || 0 : 0), 0), 0))} tone="stat-blue" />
        <Stat label="À collecter" value={money(events.filter((event) => !event.closed).reduce((sum, event) => sum + Object.values(event.payments || {}).filter((payment) => !payment?.paid).length * (Number(event.sharePerMember) || 0), 0))} tone="stat-gold" />
      </div>
      {events.map((event) => {
        const payments = Object.entries(event.payments || {});
        const unpaid = payments.filter(([, payment]) => !payment?.paid);
        const collected = payments.reduce((sum, [, payment]) => sum + (payment?.paid ? Number(payment.paidAmount ?? event.sharePerMember) || 0 : 0), 0);
        return <section className="panel event-card" key={event.id}>
          <div className="event-title"><div><span className="eyebrow">Événement · {date(event.createdAt)}</span><h2>{event.title}</h2><p>{event.description || "Aucune description"} · Bénéficiaire : <strong>{names[event.beneficiaryMemberId] || "Membre"}</strong></p></div><Status value={event.closed ? "Clôturé" : event.reimbursedToBeneficiary ? "Remboursé" : "Ouvert"} /></div>
          <div className="event-summary"><span>Contribution : <strong>{money(event.sharePerMember)}</strong></span><span>Collecté : <strong>{money(collected)}</strong></span><span>Total prévu : <strong>{money(event.totalAmount)}</strong></span></div>
          <Table columns={[
            { key: "member", label: "Membre", render: (row) => names[row.id] || row.id },
            { key: "participation", label: "Participation", render: () => money(event.sharePerMember) },
            { key: "paidAmount", label: "Déjà versé", render: (row) => row.payment?.paid ? money(row.payment.paidAmount ?? event.sharePerMember) : "—" },
            { key: "actions", label: "Actions", render: (row) => <div className="row-actions"><Status value={row.payment?.paid ? (Number(row.payment.paidAmount ?? event.sharePerMember) < Number(event.sharePerMember) ? "Partiel" : "Payé") : row.payment?.convertedToDebt ? "Passé en dette" : "À payer"} />{canManage && !event.closed && !event.reimbursedToBeneficiary && !row.payment?.paid && !row.payment?.convertedToDebt && <MiniAmountAction label="Valider" max={event.sharePerMember} onSubmit={(amount) => runAction({ domain: "event", type: "payment", eventId: event.id, memberId: row.id, amount }, "Participation enregistrée.")} />}{canManage && row.payment?.paid && !event.closed && !event.reimbursedToBeneficiary && Number(row.payment.paidAmount ?? event.sharePerMember) < Number(event.sharePerMember) && <MiniAmountAction label="Compléter" max={Math.round((Number(event.sharePerMember) - Number(row.payment.paidAmount)) * 100) / 100} onSubmit={(added) => runAction({ domain: "event", type: "update-payment", eventId: event.id, memberId: row.id, amount: Math.round((Number(row.payment.paidAmount) + added) * 100) / 100 }, "Participation complétée.")} />}{canManage && row.payment?.paid && !event.closed && !event.reimbursedToBeneficiary && <Button onClick={() => runAction({ domain: "event", type: "cancel-payment", eventId: event.id, memberId: row.id }, "Paiement annulé.")}>Annuler paiement</Button>}</div> },
          ]} rows={payments.map(([id, payment]) => ({ id, payment }))} />
          {canManage && <div className="event-actions">{!event.closed && !event.reimbursedToBeneficiary && unpaid.length > 0 && <Button onClick={() => runAction({ domain: "event", type: "payment-bulk", eventId: event.id }, "Paiements restants validés.")}>Valider les participations restantes ({unpaid.length})</Button>}{!event.closed && !event.reimbursedToBeneficiary && <Button onClick={() => runAction({ domain: "event", type: "reimburse", eventId: event.id }, "Remboursement enregistré.")}>Rembourser le bénéficiaire</Button>}{!event.closed && event.reimbursedToBeneficiary && <Button onClick={() => runAction({ domain: "event", type: "close", eventId: event.id }, "Événement clôturé.")}>Clôturer</Button>}<Button variant="danger" onClick={() => confirmAction({ domain: "event", type: "delete", eventId: event.id }, "Supprimer cet événement ?")}>Supprimer</Button></div>}
        </section>;
      })}
      {!events.length && <EmptyPanel message="Aucun événement n’a été créé." />}
    </div>
  );
}

export function DebtsPage({ data, member, members, names, canManage, runAction, confirmAction }) {
  const fines = list(data, KEYS.fines).filter(active).filter((row) => canManage || row.memberId === member.id).sort(byNewest);
  const finePayments = list(data, KEYS.fineCash).filter(active).sort(byNewest);
  const oldDebts = list(data, KEYS.oldDebts).filter(active).filter((row) => canManage || row.memberId === member.id).sort(byNewest);
  const convertedEventDebts = list(data, KEYS.events).filter(active).flatMap((event) => Object.entries(event.payments || {}).filter(([, payment]) => payment?.convertedToDebt).map(([memberId, payment]) => ({ id: `${event.id}:${memberId}`, eventId: event.id, createdAt: event.createdAt, memberId, fineId: fines.find((fine) => active(fine) && String(fine.evenementId || fine.eventId) === String(event.id) && String(fine.memberId) === String(memberId))?.id, amount: Number(payment.debtAmount) || Number(event.sharePerMember) || 0, title: event.title }))).filter((row) => canManage || row.memberId === member.id);
  const openEventDues = canManage ? [] : memberEventRows(data, member.id).filter((row) => row.remaining > 0).map((row) => ({ id: row.id, createdAt: row.createdAt, memberId: member.id, title: row.title, amount: row.remaining }));
  const eventDebts = [...openEventDues, ...convertedEventDebts];
  const ownFines = fines.filter((row) => !isEventFine(row));
  const allOpen = [...ownFines.filter((row) => Number(row.amount) > 0), ...oldDebts.filter((row) => Number(row.amount) > 0), ...eventDebts];
  const due = allOpen.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  return (
    <div className="page-content">
      <PageHeading eyebrow="Suivi des paiements" title="Dettes & amendes" description={canManage ? "Consultez et gérez les amendes, dettes d’événement et dettes d’ancienne tournée." : "Consultez vos paiements en attente et votre historique."} />
      <div className="stats-grid compact"><Stat label="Total à régler" value={money(due)} tone="stat-red" /><Stat label="Amendes" value={money(ownFines.reduce((sum, row) => sum + Number(row.amount || 0), 0))} /><Stat label="Événements" value={money(eventDebts.reduce((sum, row) => sum + row.amount, 0))} tone="stat-blue" /><Stat label="Ex tournée" value={money(oldDebts.reduce((sum, row) => sum + Number(row.amount || 0), 0))} tone="stat-gold" /></div>
      {canManage && <Form className="inline-form" title="Ajouter une amende" fields={[
        { name: "memberId", label: "Membre", options: members.map((row) => [row.id, row.name]) },
        { name: "fineType", label: "Type", options: [["absence", "Absence"], ["retard", "Retard"], ["bavardage", "Bavardage"], ["sanctions", "Sanction"], ["ex-tournee", "Ex tournée"]] },
        { name: "amount", label: "Montant (€)", type: "number", min: "0.01", step: "0.01" },
        { name: "note", label: "Motif" },
      ]} submitLabel="Ajouter l’amende" onSubmit={(values) => runAction({ domain: "fine", type: "add", ...values, amount: Number(values.amount) }, "Amende ajoutée.")} />}
      {canManage && <Form className="inline-form" title="Ajouter une contribution collective" fields={[
        { name: "memberIds", label: "Membres concernés (Ctrl/Cmd pour sélectionner)", options: members.map((row) => [row.id, row.name]), multiple: true, required: true },
        { name: "amount", label: "Montant par membre (€)", type: "number", min: "0.01", step: "0.01" },
        { name: "note", label: "Motif" },
      ]} submitLabel="Ajouter les contributions" onSubmit={(values) => runAction({ domain: "fine", type: "add-bulk", ...values, amount: Number(values.amount) }, "Contributions ajoutées.")} />}
      <section className="panel"><PanelTitle title="Dettes & amendes" meta={`${ownFines.length} lignes`} />
        <Table columns={[
          { key: "date", label: "Date", render: (row) => date(row.date || row.createdAt) },
          { key: "type", label: "Type", render: (row) => FINE_NAMES[row.type] || row.type },
          { key: "note", label: "Détail", render: (row) => canManage ? `${names[row.memberId] || "Membre"} — ${row.note || ""}` : row.note || "—" },
          { key: "original", label: "Montant", render: (row) => money(fineOriginal(row)) },
          { key: "paid", label: "Déjà payé", render: (row) => money(row.repaidAmount) },
          { key: "remaining", label: "Reste", render: (row) => money(row.amount) },
          { key: "status", label: "Statut", render: (row) => <Status value={Number(row.amount) > 0 ? "En cours" : "Soldé"} /> },
          ...(canManage ? [{ key: "actions", label: "Actions", render: (row) => <div className="row-actions">{Number(row.amount) > 0 && <MiniAmountAction label="Valider" max={row.amount} onSubmit={(amount) => runAction({ domain: "fine", type: "repay", fineId: row.id, amount }, "Paiement enregistré.")} />}{Number(row.amount) > 0 && <Button onClick={() => runAction({ domain: "fine", type: "settle", fineId: row.id }, "Amende soldée.")}>Tout régler</Button>}{Number(row.amount) > 0 && <PromptNumberAction label="Modifier le reste" initial={row.amount} min={0} onSubmit={(amount) => runAction({ domain: "fine", type: "adjust-remaining", fineId: row.id, amount }, "Solde de l’amende modifié.")} />}{["absence", "retard", "bavardage", "sanctions"].includes(row.type) && <Button onClick={async () => { const amount = prompt("Nouveau montant total :", String(row.amount)); if (amount === null) return; const note = prompt("Motif :", row.note || ""); if (note === null) return; await runAction({ domain: "fine", type: "edit", fineId: row.id, memberId: row.memberId, fineType: row.type, amount: Number(amount), note }); }}>Modifier</Button>}<Button variant="danger" onClick={() => confirmAction({ domain: "fine", type: "delete", fineId: row.id }, "Supprimer cette amende ?")}>Supprimer</Button></div> }] : []),
        ]} rows={ownFines} footer={[
          { content: <strong>Total à régler</strong>, colSpan: 3 },
          money(ownFines.reduce((sum, row) => sum + fineOriginal(row), 0)),
          money(ownFines.reduce((sum, row) => sum + (Number(row.repaidAmount) || 0), 0)),
          money(ownFines.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)),
          "",
          ...(canManage ? [""] : []),
        ]} />
      </section>
      {eventDebts.length > 0 && <section className="panel"><PanelTitle title="Événements" />
        <Table columns={[
          { key: "date", label: "Date", render: (row) => date(row.createdAt) },
          { key: "type", label: "Type", render: () => "Événement" },
          { key: "detail", label: "Détail", render: (row) => canManage ? `${row.title} — ${names[row.memberId] || "Membre"}` : row.title },
          { key: "amount", label: "Montant", render: (row) => money(row.amount) },
          { key: "paid", label: "Déjà versé", render: () => "—" },
          { key: "remaining", label: "Reste", render: (row) => money(row.amount) },
          { key: "status", label: "Statut", render: (row) => <Status value={Number(row.amount) > 0 ? "En cours" : "Soldé"} /> },
          ...(canManage ? [{ key: "actions", label: "Actions", render: (row) => row.fineId ? <Button variant="danger" onClick={() => confirmAction({ domain: "fine", type: "delete", fineId: row.fineId }, "Supprimer cette dette d’événement ?")}>Supprimer</Button> : "—" }] : []),
        ]} rows={eventDebts} footer={[
          { content: <strong>Total à régler</strong>, colSpan: 3 },
          money(eventDebts.reduce((sum, row) => sum + row.amount, 0)),
          "—",
          money(eventDebts.reduce((sum, row) => sum + row.amount, 0)),
          "",
          ...(canManage ? [""] : []),
        ]} />
      </section>}
      {canManage && <section className="panel"><PanelTitle title="Versements encaissés" />
        <Table columns={[
          { key: "paidAt", label: "Date", render: (row) => date(row.paidAt) },
          { key: "type", label: "Type", render: () => "Versement" },
          { key: "note", label: "Détail", render: (row) => `${names[row.memberId] || "Membre"} — ${row.note || ""}` },
          { key: "amount", label: "Montant", render: (row) => money(row.amount) },
          { key: "paid", label: "Déjà versé", render: (row) => money(row.amount) },
          { key: "remaining", label: "Reste", render: () => money(0) },
          { key: "status", label: "Statut", render: () => <Status value="Soldé" /> },
          { key: "actions", label: "Actions", render: (row) => row.sourceAmendeId && <Button variant="danger" onClick={() => confirmAction({ domain: "fine", type: "undo-repay", fineId: row.sourceAmendeId, cashId: row.id }, "Annuler ce versement ?")}>Annuler le versement</Button> },
        ]} rows={finePayments} footer={[
          { content: <strong>Total encaissé</strong>, colSpan: 3 },
          money(finePayments.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)),
          money(finePayments.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)),
          money(0),
          "",
          "",
        ]} />
      </section>}
      {canManage && <Form className="inline-form" title="Ajouter une dette d’ancienne tournée" fields={[
        { name: "memberId", label: "Membre", options: members.map((row) => [row.id, row.name]) },
        { name: "amount", label: "Montant (€)", type: "number", min: "0.01", step: "0.01" },
        { name: "note", label: "Motif" },
      ]} submitLabel="Ajouter la dette" onSubmit={(values) => runAction({ domain: "old-debt", type: "add", ...values, amount: Number(values.amount) }, "Dette ajoutée.")} />}
      <section className="panel"><PanelTitle title="Ex tournée" />
        <Table columns={[
          { key: "createdAt", label: "Date", render: (row) => date(row.createdAt) },
          { key: "type", label: "Type", render: () => "Ex tournée" },
          { key: "note", label: "Détail", render: (row) => canManage ? `${names[row.memberId] || "Membre"} — ${row.note || ""}` : row.note || "—" },
          { key: "original", label: "Montant initial", render: (row) => money(fineOriginal(row)) },
          { key: "paid", label: "Déjà versé", render: (row) => money(row.repaidAmount) },
          { key: "amount", label: "Reste", render: (row) => money(row.amount) },
          { key: "status", label: "Statut", render: (row) => <Status value={Number(row.amount) > 0 ? "En cours" : "Soldé"} /> },
          ...(canManage ? [{ key: "actions", label: "Actions", render: (row) => <div className="row-actions">{Number(row.amount) > 0 && <MiniAmountAction label="Rembourser" max={row.amount} onSubmit={(amount) => runAction({ domain: "old-debt", type: "repay", entryId: row.id, amount }, "Remboursement enregistré.")} />}{<PromptNumberAction label="Modifier le reste" initial={row.amount} min={0} onSubmit={(amount) => runAction({ domain: "old-debt", type: "adjust-remaining", entryId: row.id, amount }, "Solde de la dette modifié.")} />}<Button variant="danger" onClick={() => confirmAction({ domain: "old-debt", type: "delete", entryId: row.id }, "Supprimer cette dette ?")}>Supprimer</Button></div> }] : []),
        ]} rows={oldDebts} footer={[
          { content: <strong>Total à régler</strong>, colSpan: 3 },
          money(oldDebts.reduce((sum, row) => sum + fineOriginal(row), 0)),
          money(oldDebts.reduce((sum, row) => sum + (Number(row.repaidAmount) || 0), 0)),
          money(oldDebts.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)),
          "",
          ...(canManage ? [""] : []),
        ]} />
      </section>
    </div>
  );
}

export function FinancePage({ data, members, names, canManage, runAction, confirmAction, saveData }) {
  const cashEntries = list(data, KEYS.cashEntries).filter(active);
  const finePayments = list(data, KEYS.fineCash).filter(active);
  const loans = list(data, KEYS.loans).filter((loan) => active(loan) && !["rejected", "voting", "awaiting_financier"].includes(loan.status));
  const events = list(data, KEYS.events).filter(active);
  const eventReceipts = events.reduce((sum, event) => sum + Object.values(event.payments || {}).reduce((rowSum, payment) => rowSum + (payment?.paid ? Number(payment.paidAmount ?? event.sharePerMember) || 0 : 0), 0), 0);
  const otherNet = cashEntries.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const fineNet = finePayments.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const loanDisbursed = loans.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const loanReturned = loans.reduce((sum, row) => sum + loanPaid(row), 0);
  const reimbursements = events.filter((row) => row.reimbursedToBeneficiary).reduce((sum, row) => {
    const reported = Number(row.reimbursedAmount);
    const total = Object.values(row.payments || {}).reduce((subtotal, payment) => subtotal + (payment?.paid ? Number(payment.paidAmount ?? row.sharePerMember) || 0 : 0), 0);
    return sum + (Number.isFinite(reported) ? reported : total);
  }, 0);
  const withdrawals = cashEntries.reduce((sum, row) => sum + Math.max(0, -(Number(row.amount) || 0)), 0);
  const donations = cashEntries.reduce((sum, row) => sum + Math.max(0, Number(row.amount) || 0), 0);
  const base = Number(data[KEYS.fund]) || 0;
  const annualPaid = Object.values(data[KEYS.annualFund]?.years || {}).reduce((total, year) => total + Object.values(year?.payments || {}).reduce((sum, payment) => sum + (Number(payment?.paidAmount) || 0), 0), 0);
  const eventDebtDeduction = events.reduce((sum, row) => sum + (Number(row.caisseDebtDeduction) || 0), 0);
  const loanCashImpact = loans.reduce((sum, row) => sum - (Number(row.amount) || 0) + (Number(row.totalRepaid) || loanPaid(row)), 0);
  const available = Math.max(0, base + annualPaid + fineNet - eventDebtDeduction + otherNet + loanCashImpact);
  const eventsInCash = events.filter((row) => !row.reimbursedToBeneficiary).reduce((sum, row) => sum + Object.values(row.payments || {}).reduce((subtotal, payment) => subtotal + (payment?.paid ? Number(payment.paidAmount ?? row.sharePerMember) || 0 : 0), 0), 0);
  const gross = available + eventsInCash;
  const history = [
    ...cashEntries.map((row) => ({
      ...row,
      id: `cash-${row.id}`,
      entryId: row.id,
      kind: Number(row.amount) < 0 ? "Retrait" : "Don ou aide",
      detail: `${names[row.memberId] || "Le groupe"}${row.note || row.motif ? ` — ${row.note || row.motif}` : ""}`,
      amount: Math.abs(Number(row.amount) || 0),
      status: Number(row.amount) < 0 ? "Sortie" : "Entrée",
    })),
    ...loans.filter((loan) => loan.status !== "rejected" && loan.status !== "voting" && loan.status !== "awaiting_financier").map((loan) => ({
      ...loan,
      id: `loan-${loan.id}`,
      createdAt: loan.approvedAt || loan.createdAt,
      kind: "Prêt",
      detail: `${names[loan.borrowerId] || "Membre"} — ${loan.note || "Prêt"}`,
      amount: Number(loan.amount) || 0,
      paid: loanPaid(loan),
      remaining: loanRemaining(loan),
      status: loan.status === "defaulted" ? "Retard + intérêts" : loanRemaining(loan) <= 0 ? "Soldé" : "En cours",
    })),
    ...finePayments.map((row) => ({
      ...row,
      id: `fine-${row.id}`,
      kind: "Amende",
      detail: `${names[row.memberId] || "Membre"} — ${row.note || ""}`,
      amount: Math.abs(Number(row.amount) || 0),
      status: "Entrée",
    })),
        ...events.flatMap((event) => Object.entries(event.payments || {}).filter(([, payment]) => payment?.paid).map(([memberId, payment]) => ({
      id: `event-${event.id}-${memberId}`,
      createdAt: payment.paidAt || event.createdAt,
      kind: "Événement",
      detail: `${event.title} — ${names[memberId] || "Membre"}`,
      amount: Number(payment.paidAmount ?? event.sharePerMember) || 0,
      status: "Entrée",
      eventId: event.id,
      memberId,
    }))),
  ].sort(byNewest);
  const historyTotal = history.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const historyPaid = history.reduce((sum, row) => sum + (Number(row.paid) || 0), 0);
  const historyRemaining = history.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const account = data[KEYS.account] || {};
  return (
    <div className="page-content">
      <PageHeading eyebrow="Caisse du groupe" title="Finance" description="Consultez le solde et l’historique des mouvements financiers du groupe." />
      <div className="stats-grid">
        <Stat label="Entrées" value={money(base + annualPaid + fineNet + donations + eventReceipts + loanReturned)} note={`Fond ${money(base)} · Fond annuel ${money(annualPaid)} · Amendes ${money(fineNet)} · Dons & aides ${money(donations)} · Événements ${money(eventReceipts)} · Remb. prêts ${money(loanReturned)}`} tone="stat-blue" />
        <Stat label="Sorties" value={money(loanDisbursed + reimbursements + eventDebtDeduction + withdrawals)} note={`Prêts ${money(loanDisbursed)} · Remb. événements ${money(reimbursements)} · Dettes déduites ${money(eventDebtDeduction)} · Retraits ${money(withdrawals)}`} tone="stat-gold" />
        <Stat label="Solde brut" value={money(gross)} note={`Caisse disponible + événements (${money(eventsInCash)})`} />
        <Stat label="Solde disponible" value={money(available)} note="Argent libre pour les prêts" tone={available < 0 ? "stat-red" : ""} />
      </div>
      {canManage && <div className="content-grid">
        <Form title="Ajouter un don ou une aide" fields={[
          { name: "memberId", label: "Versé par", options: members.map((row) => [row.id, row.name]) },
          { name: "amount", label: "Montant (€)", type: "number", min: "0.01", step: "0.01" },
          { name: "motif", label: "Motif", required: false },
        ]} submitLabel="Ajouter à la caisse" onSubmit={(values) => runAction({ domain: "cash", type: "add", ...values, amount: Number(values.amount) }, "Entrée enregistrée.")} />
        <Form title="Enregistrer une sortie" fields={[
          { name: "amount", label: "Montant (€)", type: "number", min: "0.01", step: "0.01" },
          { name: "motif", label: "Motif" },
          { name: "memberId", label: "Concerné", options: [["groupe", "Le groupe"], ...members.map((row) => [row.id, row.name])] },
        ]} submitLabel="Enregistrer le retrait" onSubmit={(values) => runAction({ domain: "cash", type: "withdraw", ...values, amount: Number(values.amount) }, "Sortie enregistrée.")} />
      </div>}
      {canManage && <div className="content-grid">
        <Form title="Modifier le fond de caisse de départ" fields={[{ name: "amount", label: "Montant (€)", type: "number", min: "0", step: "0.01", value: base }]} submitLabel="Mettre à jour le fond" onSubmit={(values) => runAction({ domain: "cash", type: "set-base", amount: Number(values.amount) }, "Fond de caisse mis à jour.")} />
      </div>}
      {canManage && <div className="cash-reset"><Button variant="danger" onClick={() => confirmAction({ domain: "cash", type: "reset-base" }, "Remettre le fond de caisse de départ à zéro ?")}>Réinitialiser le fond de départ</Button></div>}
      <section className="panel payment-account"><h3>Compte du financier</h3><p className="muted">Les paiements et remboursements se font auprès du financier sur le compte suivant :</p><strong>{account.iban ? formatIban(account.iban) : "Coordonnées bancaires non configurées"}</strong>{(account.holder || account.bank) && <small>{[account.holder, account.bank].filter(Boolean).join(" · ")}</small>}
        {canManage && <Form className="subform" fields={[{ name: "iban", label: "IBAN", value: account.iban || "" }, { name: "holder", label: "Titulaire", value: account.holder || "" }, { name: "bank", label: "Banque", value: account.bank || "" }]} submitLabel="Mettre à jour les coordonnées" onSubmit={(values) => saveData({ [KEYS.account]: values }, "Coordonnées de paiement mises à jour.")} />}
      </section>
      <section className="panel"><PanelTitle title="Historique finance" />
        <p className="finance-summary">Dons ou aides : <strong>{money(donations)}</strong> · Retraits : <strong>{money(withdrawals)}</strong> · Prêts dehors : <strong>{money(loans.filter((loan) => ["active", "defaulted"].includes(loan.status)).reduce((sum, loan) => sum + loanRemaining(loan), 0))}</strong> · Caisse disponible : <strong>{money(available)}</strong></p>
        <Table columns={[
          { key: "createdAt", label: "Date", render: (row) => date(row.createdAt || row.date || row.paidAt) },
          { key: "kind", label: "Type" },
          { key: "detail", label: "Détail" },
          { key: "amount", label: "Montant", render: (row) => <strong>{money(row.amount)}</strong> },
          { key: "paid", label: "Déjà payé", render: (row) => Number.isFinite(Number(row.paid)) && row.kind === "Prêt" ? money(row.paid) : "—" },
          { key: "remaining", label: "Reste", render: (row) => Number.isFinite(Number(row.remaining)) && row.kind === "Prêt" ? money(row.remaining) : "—" },
          { key: "status", label: "Statut", render: (row) => <><Status value={row.status} />{row.kind === "Prêt" && row.status !== "Soldé" && <small className="loan-due">{loanDueLabel(row)}</small>}</> },
          ...(canManage ? [{ key: "actions", label: "Actions", render: (row) => row.entryId
            ? <Button variant="danger" onClick={() => confirmAction({ domain: "cash", type: "delete", entryId: row.entryId }, "Supprimer ce mouvement de caisse ?")}>Supprimer</Button>
            : row.sourceAmendeId
              ? <Button variant="danger" onClick={() => confirmAction({ domain: "fine", type: "undo-repay", fineId: row.sourceAmendeId, cashId: row.id.replace(/^fine-/, "") }, "Annuler ce versement ?")}>Annuler le versement</Button>
              : row.eventId
                ? <Button variant="danger" onClick={() => confirmAction({ domain: "event", type: "cancel-payment", eventId: row.eventId, memberId: row.memberId }, "Annuler cette participation ?")}>Annuler paiement</Button>
                : "—" }] : []),
        ]} rows={history} footer={[
          { content: <strong>Total</strong>, colSpan: 3 },
          money(historyTotal),
          money(historyPaid),
          money(historyRemaining),
          "",
          ...(canManage ? [""] : []),
        ]} />
      </section>
      {canManage && <section className="panel"><PanelTitle title="Créances hors groupe" />
        <Form className="subform" fields={[{ name: "label", label: "Libellé" }, { name: "amount", label: "Montant (€)", type: "number", min: "0.01", step: "0.01" }]} submitLabel="Ajouter" onSubmit={(values) => runAction({ domain: "capital", type: "add", ...values, amount: Number(values.amount) }, "Créance ajoutée.")} />
        <Table columns={[
          { key: "label", label: "Libellé" },
          { key: "amount", label: "Montant", render: (row) => money(row.amount) },
          { key: "createdAt", label: "Date", render: (row) => date(row.createdAt) },
          { key: "actions", label: "Actions", render: (row) => <Button variant="danger" onClick={() => confirmAction({ domain: "capital", type: "delete", entryId: row.id }, "Supprimer cette créance ?")}>Supprimer</Button> },
        ]} rows={list(data, KEYS.capital).filter(active)} />
      </section>}
    </div>
  );
}

export function CommunicationPage({ data, member, members = [], canManage, saveData }) {
  const [category, setCategory] = useState("communique");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const q = query.trim().toLowerCase();

  const names = Object.fromEntries((members || []).map((person) => [String(person.id), person.name]));

  const tabs = [
    { id: "communique", label: "Communiqué", singular: "communiqué" },
    { id: "agenda", label: "Ordre du jour", singular: "ordre du jour" },
    { id: "rapport", label: "Rapports de réunions", singular: "rapport" },
    { id: "guide-site", label: "Guide site", singular: "article du guide" },
    { id: "divers", label: "Divers potos", singular: "message" },
    { id: "loi", label: "La loi", singular: "article" },
  ];

  const itemsFor = (id) => {
    if (id === "loi") return list(data, KEYS.law).filter(active);
    if (id === "guide-site") {
      const fromGuide = list(data, KEYS.guide).filter(active).map((row) => ({ ...row, _source: "guide" }));
      const fromComm = list(data, KEYS.communication).filter((row) => active(row) && communicationCategoryOf(row) === "guide-site");
      return [...fromGuide, ...fromComm];
    }
    return list(data, KEYS.communication)
      .filter((row) => active(row) && communicationCategoryOf(row) === id)
      .sort(byNewest);
  };

  const items = itemsFor(category);
  const tabMeta = tabs.find((tab) => tab.id === category) || tabs[0];

  const splitSentences = (body) =>
    String(body || "")
      .split(/(?<=[.!?;:\n])\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

  const searchResults = (() => {
    if (!q) return null;
    return items
      .map((item) => {
        const title = String(item.title || "");
        const body = String(item.body || "");
        const titleMatch = title.toLowerCase().includes(q);
        const phrases = splitSentences(body).filter((sentence) => sentence.toLowerCase().includes(q));
        if (!titleMatch && !phrases.length) return null;
        return { item, titleMatch, phrases };
      })
      .filter(Boolean);
  })();

  const highlight = (text) => {
    if (!q || !text) return text;
    const source = String(text);
    const lower = source.toLowerCase();
    const nodes = [];
    let cursor = 0;
    let found = lower.indexOf(q, cursor);
    let key = 0;
    while (found >= 0) {
      if (found > cursor) nodes.push(<span key={key++}>{source.slice(cursor, found)}</span>);
      nodes.push(<mark className="search-hit" key={key++}>{source.slice(found, found + q.length)}</mark>);
      cursor = found + q.length;
      found = lower.indexOf(q, cursor);
    }
    if (cursor < source.length) nodes.push(<span key={key++}>{source.slice(cursor)}</span>);
    return nodes;
  };

  const openFull = (id) => {
    setQuery("");
    setOpenId(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`comm-card-${id}`);
      if (el) {
        el.classList.add("comm-card-focus");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el.classList.remove("comm-card-focus"), 2500);
      }
    });
  };

  const countFor = (id) => itemsFor(id).length;

  return (
    <div className="page-content communication-page">
      {/* Pas de grand titre « Communication » : les sous-onglets suffisent */}

      {canManage && category !== "loi" && category !== "guide-site" && (
        <Form
          className="inline-form"
          title={`Publier — ${tabMeta.label}`}
          fields={[
            { name: "title", label: "Titre" },
            { name: "body", label: "Message", type: "textarea" },
          ]}
          submitLabel="Publier"
          onSubmit={(values) =>
            saveData(
              {
                [KEYS.communication]: [
                  {
                    id: crypto.randomUUID(),
                    kind: category,
                    category,
                    title: values.title.trim(),
                    body: values.body.trim(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: member?.id,
                  },
                  ...list(data, KEYS.communication),
                ],
              },
              "Publication ajoutée.",
            )
          }
        />
      )}

      <section className="panel communication-panel">
        <nav className="communication-categories" aria-label="Rubriques de communication">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={category === tab.id ? "communication-category selected" : "communication-category"}
              onClick={() => {
                setCategory(tab.id);
                setQuery("");
                setOpenId(null);
              }}
            >
              {tab.label}
              <span>{countFor(tab.id)}</span>
            </button>
          ))}
        </nav>

        <label className="communication-search">
          <span>Recherche dans {tabMeta.label}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Mot-clé dans ${tabMeta.singular}…`}
            autoComplete="off"
          />
        </label>

        {searchResults && (
          <p className="communication-search-meta">
            {searchResults.length === 0
              ? `Aucun résultat pour « ${query.trim()} »`
              : `${searchResults.reduce((n, row) => n + row.phrases.length + (row.titleMatch ? 1 : 0), 0)} phrase(s) dans ${searchResults.length} ${tabMeta.singular}${searchResults.length > 1 ? "s" : ""}`}
          </p>
        )}

        {!searchResults && !items.length && (
          <p className="muted communication-empty">Aucun {tabMeta.singular} publié pour le moment.</p>
        )}

        {searchResults ? (
          <div className="announcement-list">
            {searchResults.map(({ item, titleMatch, phrases }) => (
              <article
                className="announcement announcement-card announcement-search"
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => openFull(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openFull(item.id);
                  }
                }}
              >
                <div className="announcement-meta">
                  <span className="announcement-source">{tabMeta.label}</span>
                  <time>{item.createdAt || item.updatedAt ? date(item.updatedAt || item.createdAt) : "—"}</time>
                </div>
                <h3>{titleMatch ? highlight(item.title || "Sans titre") : (item.title || "Sans titre")}</h3>
                <div className="search-excerpts">
                  {phrases.length
                    ? phrases.map((phrase, index) => <p key={index}>{highlight(phrase)}</p>)
                    : titleMatch && <p className="muted">Mot trouvé dans le titre.</p>}
                </div>
                <p className="search-open-hint">Cliquer pour voir l’article entier →</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="announcement-list">
            {items.map((item) => (
              <article
                className={`announcement announcement-card${openId === item.id ? " comm-card-focus" : ""}`}
                id={`comm-card-${item.id}`}
                key={item.id}
              >
                <div className="announcement-meta">
                  <span className="announcement-source">{tabMeta.label}</span>
                  <time>
                    {item.createdAt || item.updatedAt ? date(item.updatedAt || item.createdAt) : "—"}
                    {item.createdBy && names[item.createdBy] ? ` · ${names[item.createdBy]}` : ""}
                  </time>
                </div>
                <h3>{item.title || "Sans titre"}</h3>
                <p>{item.body || ""}</p>
                {canManage && item.category && !item._source && (
                  <div className="row-actions">
                    <Button
                      variant="danger"
                      onClick={() =>
                        saveData(
                          {
                            [KEYS.communication]: list(data, KEYS.communication).map((row) =>
                              row.id === item.id
                                ? { ...row, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                                : row,
                            ),
                          },
                          "Publication supprimée.",
                        )
                      }
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function NotificationsPage({ data, member, saveData }) {
  const rows = list(data, KEYS.notifications).filter((row) => String(row.memberId) === String(member.id) && !row.deletedAt).sort(byNewest);
  const unread = rows.filter((row) => !row.read).length;
  return <div className="page-content">
    <PageHeading eyebrow="Votre espace" title="Notifications" description="Retrouvez les informations importantes sur les prêts, les paiements et les activités du groupe." />
    <section className="panel"><PanelTitle title="Toutes les notifications" meta={`${unread} non lue${unread === 1 ? "" : "s"}`} />
      {!rows.length && <p className="muted">Vous n’avez aucune notification.</p>}
      <div className="notification-list">{rows.map((row) => <article className={row.read ? "notification-item" : "notification-item notification-unread"} key={row.id}>
        <div className="notification-copy"><strong>{row.title || row.type || "Information"}</strong><small>{date(row.createdAt || row.at)}</small><p>{row.message || "—"}</p></div>
        <div className="row-actions">{!row.read && <Button onClick={() => saveData({ [KEYS.notifications]: list(data, KEYS.notifications).map((item) => item.id === row.id ? { ...item, read: true, updatedAt: new Date().toISOString() } : item) }, "Notification marquée comme lue.")}>Marquer comme lue</Button>}</div>
      </article>)}</div>
    </section>
  </div>;
}

export function ReferencePage({ data, canManageLaw, canManageGuide, saveData }) {
  return <div className="page-content">
    <PageHeading eyebrow="Documents de référence" title="La loi" description="Règles et guide du groupe." />
    <ReferenceList label="La loi" dataKey={KEYS.law} rows={list(data, KEYS.law)} canManage={canManageLaw} saveData={saveData} />
    <ReferenceList label="Le guide" dataKey={KEYS.guide} rows={list(data, KEYS.guide)} canManage={canManageGuide} saveData={saveData} />
  </div>;
}

export function ReferenceList({ label, dataKey, rows, canManage, saveData }) {
  return <section className="panel">
    <PanelTitle title={label} meta={`${rows.filter(active).length} rubriques`} />
    {canManage && <Form className="subform" fields={[
      { name: "title", label: "Titre" },
      { name: "body", label: "Contenu", type: "textarea" },
    ]} submitLabel={`Ajouter à ${label.toLowerCase()}`} onSubmit={(values) => saveData({ [dataKey]: [{ id: crypto.randomUUID(), title: values.title.trim(), body: values.body.trim(), order: rows.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...rows] }, "Rubrique ajoutée.")} />}
    {!rows.some(active) && <p className="muted">Aucun contenu disponible.</p>}
    <div className="reference-list">{rows.filter(active).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)).map((row) => <article className="reference-item" key={row.id}>
      <div><h3>{row.title}</h3><p>{row.body}</p></div>
      {canManage && <div className="row-actions"><Button onClick={async () => { const title = prompt("Modifier le titre :", row.title || ""); if (title === null) return; const body = prompt("Modifier le contenu :", row.body || ""); if (body === null) return; await saveData({ [dataKey]: rows.map((item) => item.id === row.id ? { ...item, title: title.trim(), body: body.trim(), updatedAt: new Date().toISOString() } : item) }, "Rubrique modifiée."); }}>Modifier</Button><Button variant="danger" onClick={() => saveData({ [dataKey]: rows.map((item) => item.id === row.id ? { ...item, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item) }, "Rubrique supprimée.")}>Supprimer</Button></div>}
    </article>)}</div>
  </section>;
}
