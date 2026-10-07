import { useEffect, useState } from "react";
import { KEYS, AdminTableContext, TOURNEE_MONTHS, ADMIN_SECTIONS, money, date, active, list, byNewest, request, Button, Form, Table, AdminTable, Stat, ROLE_NAMES, OrderEditor, MiniAmountAction, PageHeading, PanelTitle, Status } from "./shared.jsx";
import { LoansPage, EventsPage, DebtsPage, FinancePage, CommunicationPage } from "./pages.jsx";

export function AdminPage({ section, sections, setSection, data, member, members, names, runAction, confirmAction, saveData }) {
  const sectionAliases = { annuel: "caisse", journal: "connexions" };
  const requestedSection = sectionAliases[section] || section;
  const visibleSections = ADMIN_SECTIONS.filter(([id]) => sections.includes(id));
  const activeSection = visibleSections.some(([id]) => id === requestedSection) ? requestedSection : visibleSections[0]?.[0] || "membres";
  return (
    <div className="page-content">
      <PageHeading eyebrow="Espace de gestion" title="Administration" description="Gérez les membres, les accès et les opérations du groupe." />
      <div className="admin-layout">
        <aside className="admin-menu">{visibleSections.map(([id, label]) => <button className={activeSection === id ? "admin-menu-item current" : "admin-menu-item"} key={id} onClick={() => setSection(id)}>{label}<span>›</span></button>)}</aside>
        <AdminTableContext.Provider value={true}>
          <div className="admin-content">{renderSection()}</div>
        </AdminTableContext.Provider>
      </div>
    </div>
  );

  function renderSection() {
    if (activeSection === "membres") return <MembersAdmin data={data} members={members} runAction={runAction} confirmAction={confirmAction} saveData={saveData} />;
    if (activeSection === "admins") return <AdminIdsPage data={data} members={members} saveData={saveData} />;
    if (activeSection === "amendes") return <DebtsPage data={data} member={{ id: "" }} members={members} names={names} canManage runAction={runAction} confirmAction={confirmAction} />;
    if (activeSection === "prets") return <LoansPage data={data} member={{ id: "" }} members={members} names={names} canManage runAction={runAction} confirmAction={confirmAction} />;
    if (activeSection === "evenements") return <EventsPage data={data} member={{ id: "" }} members={members} names={names} canManage runAction={runAction} confirmAction={confirmAction} />;
    if (activeSection === "caisse") return <><FinancePage data={data} members={members} names={names} canManage runAction={runAction} confirmAction={confirmAction} saveData={saveData} /><AnnualFundAdmin data={data} members={members} names={names} runAction={runAction} confirmAction={confirmAction} /></>;
    if (activeSection === "tournee") return <TourneeAdmin data={data} members={members} saveData={saveData} />;
    if (activeSection === "communication") return <CommunicationPage data={data} members={members} canManage member={member} saveData={saveData} />;
    if (activeSection === "loi") return <ReferenceAdmin data={data} saveData={saveData} />;
    if (activeSection === "connexions") return <LoginLogAdmin />;
    if (activeSection === "sauvegarde") return <BackupAdmin />;
    return <AccessAdmin data={data} members={members} saveData={saveData} />;
  }
}

export function MembersAdmin({ data, members, runAction, confirmAction, saveData }) {
  return <>
    <PanelTitle title="Membres & Bureau" meta={`${members.length} membres actifs`} />
    <Form className="subform" title="Ajouter un membre" fields={[
      { name: "name", label: "Nom complet" },
      { name: "kind", label: "Statut", options: [["membre", "Membre actif"], ["nouveau", "Nouveau membre"]] },
    ]} submitLabel="Ajouter le membre" onSubmit={async (values) => {
      const id = crypto.randomUUID();
      const member = { id, name: values.name.trim(), kind: values.kind, createdAt: new Date().toISOString() };
      return saveData({ [KEYS.members]: [...list(data, KEYS.members), member] }, "Membre ajouté. Le compte de connexion est créé côté serveur.");
    }} />
    <p className="muted">La suppression d’un membre est traitée côté serveur et retire ses affectations de rôle et ses données de groupe.</p>
    <Table columns={[
      { key: "name", label: "Nom", render: (row) => <strong>{row.name}</strong> },
      { key: "kind", label: "Statut", render: (row) => row.kind === "nouveau" ? "Nouveau membre" : "Membre actif" },
      { key: "office", label: "Fonction", render: (row) => Object.entries(data[KEYS.roles] || {}).filter(([, id]) => String(id) === String(row.id)).map(([role]) => ROLE_NAMES[role] || role).join(", ") || "—" },
      { key: "actions", label: "Actions", render: (row) => <div className="row-actions"><Button onClick={async () => { const name = prompt("Modifier le nom du membre :", row.name); if (name === null || !name.trim()) return; await saveData({ [KEYS.members]: list(data, KEYS.members).map((member) => member.id === row.id ? { ...member, name: name.trim() } : member) }, "Nom du membre mis à jour."); }}>Modifier</Button><Button onClick={async () => { try { const result = await request(`/api/admin/ensure-user/${encodeURIComponent(row.id)}`, { method: "POST", body: "{}" }); alert(result.message); } catch (reason) { alert(reason.message); } }}>Créer le compte</Button><Button onClick={async () => { try { const result = await request(`/api/admin/reset-password/${encodeURIComponent(row.id)}`, { method: "POST", body: "{}" }); alert(result.message); } catch (reason) { alert(reason.message); } }}>Réinitialiser accès</Button><Button variant="danger" onClick={() => confirmAction({ domain: "member", type: "delete", memberId: row.id }, `Supprimer ${row.name} du groupe ? Cette action retirera ses données associées.`)}>Supprimer</Button></div> },
    ]} rows={list(data, KEYS.members)} />
    <section className="panel inset-panel"><h3>Attributions du bureau</h3><div className="role-grid">{Object.entries(ROLE_NAMES).map(([role, label]) => <label className="field" key={role}><span>{label}</span><select value={data[KEYS.roles]?.[role] || ""} onChange={(event) => { const next = { ...(data[KEYS.roles] || {}) }; if (event.target.value) next[role] = event.target.value; else delete next[role]; saveData({ [KEYS.roles]: next }, "Attribution du bureau mise à jour."); }}><option value="">Non attribué</option>{members.filter((member) => member.kind !== "nouveau").map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>)}</div></section>
  </>;
}

export function AdminIdsPage({ data, members, saveData }) {
  const raw = data[KEYS.adminIds];
  const current = Array.isArray(raw) ? raw : Array.isArray(raw?.ids) ? raw.ids : [];
  const assign = (ids) => {
    const value = Array.isArray(raw) ? ids : { ...(raw || {}), ids, updatedAt: new Date().toISOString() };
    return saveData({ [KEYS.adminIds]: value }, "Liste des administrateurs mise à jour.");
  };
  return <>
    <PanelTitle title="Administrateurs du groupe" meta={`${current.length} administrateur${current.length === 1 ? "" : "s"}`} />
    <p className="muted">Les administrateurs peuvent gérer les membres, les finances, les événements et les autorisations. Le propriétaire du site reste administrateur.</p>
    {members.some((member) => !current.some((id) => String(id) === String(member.id))) && <Form className="inline-form" title="Nommer un administrateur" fields={[
      { name: "memberId", label: "Membre", options: members.filter((member) => !current.some((id) => String(id) === String(member.id))).map((member) => [member.id, member.name]) },
    ]} submitLabel="Nommer administrateur" onSubmit={(values) => assign([...new Set([...current, values.memberId])])} />}
    <section className="panel inset-panel"><PanelTitle title="Administrateurs actuels" />
      {current.length ? <div className="admin-id-list">{members.filter((member) => current.some((id) => String(id) === String(member.id))).map((member) => <div className="admin-id-card" key={member.id}><span><strong>{member.name}</strong><small>{member.kind === "nouveau" ? "Nouveau membre" : "Membre du groupe"}</small></span><Button variant="danger" onClick={() => assign(current.filter((id) => String(id) !== String(member.id)))}>Retirer</Button></div>)}</div> : <p className="muted">Aucun administrateur supplémentaire n’est désigné.</p>}
    </section>
  </>;
}

export function AnnualFundAdmin({ data, members, names, runAction, confirmAction }) {
  const years = data[KEYS.annualFund]?.years || {};
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const fund = years[year] || {};
  const amount = Number(fund.amountPerMember) || 0;
  const paid = members.reduce((sum, member) => sum + (Number(fund.payments?.[member.id]?.paidAmount) || 0), 0);
  return <>
    <PanelTitle title="Fond de caisse annuel" />
    <div className="year-select"><label htmlFor="annual-year">Année</label><select id="annual-year" value={year} onChange={(event) => setYear(event.target.value)}>{[...new Set([...Object.keys(years), String(new Date().getFullYear()), String(new Date().getFullYear() - 1), String(new Date().getFullYear() + 1)])].sort().map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="stats-grid compact"><Stat label="À verser par membre" value={money(amount)} /><Stat label="Total encaissé" value={money(paid)} tone="stat-blue" /><Stat label="Reste total" value={money(Math.max(0, amount * members.length - paid))} tone="stat-gold" /></div>
    <Form className="inline-form" title={fund.amountPerMember ? "Modifier le montant annuel" : "Configurer le fond annuel"} fields={[{ name: "amount", label: "Montant par membre (€)", type: "number", min: "0", step: "0.01", value: amount }]} submitLabel="Enregistrer" onSubmit={(values) => runAction({ domain: "fund", type: "set-annual-amount", year, amount: Number(values.amount) }, "Montant annuel enregistré.")} />
    <div className="event-actions"><Button onClick={() => runAction({ domain: "fund", type: "convert-annual-debt", year }, "Les restes ont été convertis en dettes.")}>Convertir les restes en dettes</Button>{years[year] && <Button variant="danger" onClick={() => confirmAction({ domain: "fund", type: "delete-annual", year }, `Supprimer la configuration du fond annuel ${year} ?`)}>Supprimer l’année</Button>}</div>
    <Table columns={[
      { key: "name", label: "Membre", render: (row) => names[row.id] || row.id },
      { key: "required", label: "Montant dû", render: () => money(amount) },
      { key: "paid", label: "Versé", render: (row) => money(fund.payments?.[row.id]?.paidAmount) },
      { key: "remaining", label: "Reste", render: (row) => money(Math.max(0, amount - (Number(fund.payments?.[row.id]?.paidAmount) || 0))) },
      { key: "status", label: "Statut", render: (row) => {
        const payment = fund.payments?.[row.id] || {};
        const remaining = Math.max(0, amount - (Number(payment.paidAmount) || 0));
        return !amount ? "—" : payment.convertedToDebt ? <Status value="Passé en dette" /> : remaining === 0 ? <Status value="Soldé" /> : <Status value="En cours" />;
      } },
      { key: "actions", label: "Actions", render: (row) => <div className="row-actions">{amount > 0 && amount > (Number(fund.payments?.[row.id]?.paidAmount) || 0) && <MiniAmountAction label="Encaisser" max={amount - (Number(fund.payments?.[row.id]?.paidAmount) || 0)} onSubmit={(value) => runAction({ domain: "fund", type: "pay", year, memberId: row.id, amount: value }, "Versement encaissé.")} />}{fund.payments?.[row.id]?.paidAmount > 0 && <Button variant="danger" onClick={() => runAction({ domain: "fund", type: "cancel-payment", year, memberId: row.id }, "Dernier versement annulé.")}>Annuler versement</Button>}</div> },
    ]} rows={members} footer={[
      { content: <strong>Total à régler</strong>, colSpan: 1 },
      money(amount * members.length),
      money(paid),
      money(Math.max(0, amount * members.length - paid)),
      "",
      "",
    ]} />
  </>;
}

export function TourneeAdmin({ data, members, saveData }) {
  const years = data[KEYS.tournee]?.years || {};
  const yearKeys = [...new Set([...Object.keys(years), String(new Date().getFullYear())])].sort((a, b) => Number(b) - Number(a));
  const [year, setYear] = useState(yearKeys.includes(String(new Date().getFullYear())) && years[String(new Date().getFullYear())] ? String(new Date().getFullYear()) : yearKeys.find((key) => years[key]) || yearKeys[0]);
  const [month, setMonth] = useState(String(TOURNEE_MONTHS.includes(new Date().getMonth()) ? new Date().getMonth() : TOURNEE_MONTHS[0]));
  const record = years[year] || {};
  const cotisations = data[KEYS.cotisations] || {};
  const nameOf = (id) => members.find((row) => String(row.id) === String(id))?.name || "Membre";
  const monthName = (index) => new Intl.DateTimeFormat("fr-BE", { month: "long" }).format(new Date(2020, Number(index), 1));
  const shortMonth = (index) => new Intl.DateTimeFormat("fr-BE", { month: "short" }).format(new Date(2020, Number(index), 1));
  const saveYear = (nextYear) => saveData({ [KEYS.tournee]: { ...(data[KEYS.tournee] || {}), years: { ...years, [year]: nextYear } } }, `Tournée ${year} mise à jour.`);
  const setMap = (name, id, value) => saveYear({ ...record, [name]: { ...(record[name] || {}), [id]: value } });
  const setOk = (name, id, ok) => setMap(name, id, { ok, at: new Date().toISOString() });
  const isOk = (name, id) => record[name]?.[id] === true || Boolean(record[name]?.[id]?.ok);
  const setOrder = (kind, ids) => {
    const order = { ...(record[kind] || {}) };
    if (ids.length) order[month] = ids; else delete order[month];
    const nextYear = { ...record, [kind]: order };
    if (!Object.keys(order).length) delete nextYear[kind];
    if (kind === "reception") { if (ids.length) nextYear[month] = ids; else delete nextYear[month]; }
    return saveYear(nextYear);
  };
  const reception = record.reception?.[month] || [];
  const ristourne = record.ristourne?.[month] || [];
  const move = (ids, index, delta, kind) => {
    const next = [...ids];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setOrder(kind, next);
  };
  const addSelect = (ids, kind) => (
    <select aria-label="Ajouter un membre" value="" onChange={(event) => event.target.value && setOrder(kind, [...ids, event.target.value])}>
      <option value="">+ Ajouter un membre…</option>
      {members.filter((member) => !ids.includes(String(member.id))).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
    </select>
  );
  return <>
    <PanelTitle title="Tournée" meta="Choisissez un mois, puis organisez l’ordre de passage" />
    <div className="tournee-toolbar">
      <label>Année <select value={year} onChange={(event) => setYear(event.target.value)}>{yearKeys.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="month-pills" role="tablist" aria-label="Mois de la tournée">{TOURNEE_MONTHS.map((index) => <button key={index} role="tab" aria-selected={String(index) === month} className={String(index) === month ? "month-pill current" : "month-pill"} onClick={() => setMonth(String(index))}>{shortMonth(index)}{record.reception?.[index]?.length ? <i /> : null}</button>)}</div>
    </div>
    <section className="panel inset-panel">
      <h3>1. Qui reçoit en {monthName(month)} ?</h3>
      <p className="muted">Classez dans l’ordre de passage, puis cochez « Reçu » une fois la tournée faite.</p>
      <div className="order-items">{reception.map((id, index) => <div className="order-item" key={id}>
        <span className="order-rank">{index + 1}</span><strong>{nameOf(id)}</strong>
        <label className="inline-check"><input type="checkbox" checked={isOk("receptionOk", id)} onChange={(event) => setOk("receptionOk", id, event.target.checked)} /> Reçu</label>
        <input type="date" aria-label={`Date de réception de ${nameOf(id)}`} value={record.receptionDates?.[id] || ""} onChange={(event) => setMap("receptionDates", id, event.target.value)} />
        <div className="row-actions"><Button aria-label="Monter" disabled={index === 0} onClick={() => move(reception, index, -1, "reception")}>↑</Button><Button aria-label="Descendre" disabled={index === reception.length - 1} onClick={() => move(reception, index, 1, "reception")}>↓</Button><Button variant="danger" aria-label="Retirer" onClick={() => setOrder("reception", reception.filter((value) => value !== id))}>×</Button></div>
      </div>)}{!reception.length && <span className="muted">Personne pour l’instant.</span>}</div>
      {addSelect(reception, "reception")}
    </section>
    <section className="panel inset-panel">
      <h3>2. Ristourne</h3>
      <p className="muted">Montant annuel = cotisation × 10 (septembre → juin). Cochez « Déjà bouffé » quand c’est réglé.</p>
      <div className="order-items">{ristourne.map((id, index) => <div className="order-item" key={id}>
        <span className="order-rank">{index + 1}</span><strong>{nameOf(id)}</strong><small>{money((Number(cotisations[id]) || 0) * 10)}</small>
        <label className="inline-check"><input type="checkbox" checked={isOk("ristourneOk", id)} onChange={(event) => setOk("ristourneOk", id, event.target.checked)} /> Déjà bouffé</label>
        <div className="row-actions"><Button aria-label="Monter" disabled={index === 0} onClick={() => move(ristourne, index, -1, "ristourne")}>↑</Button><Button aria-label="Descendre" disabled={index === ristourne.length - 1} onClick={() => move(ristourne, index, 1, "ristourne")}>↓</Button><Button variant="danger" aria-label="Retirer" onClick={() => setOrder("ristourne", ristourne.filter((value) => value !== id))}>×</Button></div>
      </div>)}{!ristourne.length && <span className="muted">Personne pour l’instant.</span>}</div>
      {addSelect(ristourne, "ristourne")}
    </section>
    <details className="panel inset-panel"><summary><strong>Cotisations mensuelles</strong> <span className="muted">(servent au calcul de la ristourne)</span></summary>
      <div className="cotisation-list">{members.map((member) => <form className="cotisation-row" key={member.id} onSubmit={(event) => {
        event.preventDefault();
        const value = Number(new FormData(event.currentTarget).get("amount"));
        const current = { ...cotisations };
        if (value > 0) current[member.id] = value; else delete current[member.id];
        saveData({ [KEYS.cotisations]: current }, "Cotisation mise à jour.");
      }}><strong>{member.name}</strong><input name="amount" type="number" min="0" step="0.5" defaultValue={cotisations[member.id] || ""} aria-label={`Cotisation de ${member.name}`} /><span>€</span><button className="button button-primary">OK</button></form>)}</div>
    </details>
  </>;
}
export function AccessAdmin({ data, members, saveData }) {
  const roles = data[KEYS.roles] || {};
  const permissions = data[KEYS.permissions] || {};
  const sections = [
    ["membres", "Membres & Bureau"],
    ["tournee", "Tournée"],
    ["finance", "Caisse"],
    ["prets", "Prêts"],
    ["amendes", "Dettes & amendes"],
    ["evenements", "Événements"],
    ["communication", "Communication"],
    ["loi", "La loi"],
  ];
  const extraSections = Object.keys(permissions).filter((tab) => !sections.some(([id]) => id === tab) && !["admin", "admins", "acces"].includes(tab));
  const permissionRows = [...sections.map(([id, label]) => ({ id, tab: id, label, ids: permissions[id] || [] })), ...extraSections.map((tab) => ({ id: tab, tab, label: tab, ids: permissions[tab] || [] }))];
  return <>
    <PanelTitle title="Accès aux fonctions" />
    <p className="muted">Les changements sont transmis à l’API et appliqués aux prochaines actions des membres.</p>
    <section className="panel inset-panel"><h3>Responsables actuels</h3><div className="role-grid">{Object.entries(ROLE_NAMES).map(([role, label]) => <div className="role-line" key={role}><strong>{label}</strong><span>{members.find((member) => String(member.id) === String(roles[role]))?.name || "Non attribué"}</span></div>)}</div></section>
    <section className="panel inset-panel"><h3>Sections autorisées par fonction</h3><AdminTable
      columns={[
        { key: "label", label: "Onglet" },
        ...Object.keys(ROLE_NAMES).map((role) => ({
          key: role,
          label: ROLE_NAMES[role],
          render: (row) => <input aria-label={`${row.tab}: ${ROLE_NAMES[role]}`} type="checkbox" checked={Array.isArray(row.ids) && row.ids.includes(role)} onChange={(event) => {
            const next = { ...permissions, [row.tab]: event.target.checked ? [...new Set([...(row.ids || []), role])] : (row.ids || []).filter((value) => value !== role) };
            saveData({ [KEYS.permissions]: next }, "Autorisations mises à jour.");
          }} />,
        })),
      ]}
      rows={permissionRows}
      empty="Aucune permission configurée."
    /></section>
  </>;
}

export function ReferenceAdmin({ data, saveData }) {
  const references = [
    { label: "La loi", key: KEYS.law, rows: list(data, KEYS.law) },
    { label: "Le guide", key: KEYS.guide, rows: list(data, KEYS.guide) },
  ];
  return <div className="page-content">
    <PageHeading eyebrow="Documents de référence" title="La loi & le guide" description="Règles, consignes et informations utiles au groupe." />
    {references.map(({ label, key, rows }) => <section className="panel" key={key}>
      <PanelTitle title={label} meta={`${rows.filter(active).length} rubriques`} />
      <Form className="subform" fields={[
        { name: "title", label: "Titre" },
        { name: "body", label: "Contenu", type: "textarea" },
      ]} submitLabel={`Ajouter à ${label.toLowerCase()}`} onSubmit={(values) => saveData({ [key]: [{ id: crypto.randomUUID(), title: values.title.trim(), body: values.body.trim(), order: rows.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...rows] }, "Rubrique ajoutée.")} />
      <div className="reference-list">{rows.filter(active).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)).map((row) => <article className="reference-item" key={row.id}>
        <div><h3>{row.title}</h3><p>{row.body}</p></div>
        <div className="row-actions"><Button onClick={async () => { const title = prompt("Modifier le titre :", row.title || ""); if (title === null) return; const body = prompt("Modifier le contenu :", row.body || ""); if (body === null) return; await saveData({ [key]: rows.map((item) => item.id === row.id ? { ...item, title: title.trim(), body: body.trim(), updatedAt: new Date().toISOString() } : item) }, "Rubrique modifiée."); }}>Modifier</Button><Button variant="danger" onClick={() => saveData({ [key]: rows.map((item) => item.id === row.id ? { ...item, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item) }, "Rubrique supprimée.")}>Supprimer</Button></div>
      </article>)}</div>
    </section>)}
  </div>;
}

export function LoginLogAdmin() {
  const [entries, setEntries] = useState([]);
  const [day, setDay] = useState("");
  const [expanded, setExpanded] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    request("/api/admin/login-log")
      .then((result) => {
        if (!mounted) return;
        const nextEntries = Array.isArray(result.entries) ? result.entries : [];
        setEntries(nextEntries);
        if (nextEntries.length) setDay(new Date(nextEntries[0].at).toISOString().slice(0, 10));
      })
      .catch((reason) => mounted && setError(reason.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);
  const days = [...new Set(entries.map((entry) => new Date(entry.at).toISOString().slice(0, 10)))].sort((a, b) => b.localeCompare(a));
  const grouped = entries.filter((entry) => !day || new Date(entry.at).toISOString().slice(0, 10) === day).reduce((groups, entry) => {
    const key = String(entry.memberId || entry.memberName || entry.name || "Compte");
    if (!groups[key]) groups[key] = { key, member: entry.memberName || entry.name || "Compte", entries: [] };
    groups[key].entries.push(entry);
    return groups;
  }, {});
  const people = Object.values(grouped).sort((a, b) => a.member.localeCompare(b.member, "fr"));
  return <>
    <PanelTitle title="Journal de connexion" meta={loading ? "Chargement…" : `${entries.length} événements`} />
    {error && <div className="notice notice-error">{error}</div>}
    <p className="muted">Nom et nombre de passages par jour. Ouvrez une ligne pour consulter les heures de connexion.</p>
    <label className="field connection-day"><span>Jour</span><select value={day} onChange={(event) => setDay(event.target.value)}>{days.map((value) => <option key={value} value={value}>{new Intl.DateTimeFormat("fr-BE", { dateStyle: "full" }).format(new Date(`${value}T12:00:00`))}</option>)}</select></label>
    {!people.length && <p className="muted">{loading ? "Chargement des connexions…" : "Aucune connexion enregistrée pour ce jour."}</p>}
    <div className="connection-log-list">{people.map((person) => <details className="connection-log-item" key={person.key} open={expanded === person.key} onToggle={(event) => setExpanded(event.currentTarget.open ? person.key : "")}>
      <summary><strong>{person.member}</strong><span>{person.entries.length} passage{person.entries.length === 1 ? "" : "s"}</span><span aria-hidden="true">›</span></summary>
      <ul>{person.entries.map((entry) => <li key={entry.id}><time>{new Intl.DateTimeFormat("fr-BE", { timeStyle: "short" }).format(new Date(entry.at))}</time><span>{entry.message || entry.type || entry.event || "Connexion"}</span></li>)}</ul>
    </details>)}</div>
  </>;
}

export function BackupAdmin() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let mounted = true;
    request("/api/admin/db-status")
      .then((result) => mounted && setStatus(result))
      .catch((reason) => mounted && setError(reason.message));
    return () => { mounted = false; };
  }, []);
  async function exportDatabase() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/export", { credentials: "same-origin" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Export impossible (${response.status})`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || `poto-timide-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("La sauvegarde a été téléchargée.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  async function restore(event) {
    event.preventDefault();
    if (!selectedFile || confirmation.trim() !== "RESTAURER") return;
    if (!confirm("Cette restauration va remplacer les données actuelles du groupe. Continuer ?")) return;
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const dump = JSON.parse(await selectedFile.text());
      const result = await request("/api/admin/import", { method: "POST", body: JSON.stringify({ confirm: confirmation, dump }) });
      setMessage(`Restauration terminée. ${result.message || "Rechargez la page pour actualiser les données."}`);
    } catch (reason) {
      setError(reason instanceof SyntaxError ? "Le fichier sélectionné n’est pas un JSON valide." : reason.message);
    } finally {
      setBusy(false);
    }
  }
  return <div className="page-content">
    <PageHeading eyebrow="Maintenance des données" title="Sauvegarde" description="Exportez les données du groupe ou restaurez une sauvegarde JSON." />
    {error && <div className="notice notice-error">{error}</div>}
    {message && <div className="notice notice-success">{message}</div>}
    <section className="panel"><PanelTitle title="État de la base de données" />
      {status ? <>
        <p className="muted">Tout le groupe vit dans la base de données. {status.independentOfHost ? "Elle est indépendante de l’hébergeur : vous pouvez en changer sans perdre les comptes ni les chiffres." : "Elle est stockée sur le disque du serveur : téléchargez régulièrement une sauvegarde."}</p>
        <div className="stats-grid compact">
          <Stat label="Base" value={status.mode === "local" ? "SQLite locale" : String(status.mode || "—")} />
          <Stat label="Membres" value={status.memberCount ?? "—"} />
          <Stat label="Comptes" value={status.userCount ?? "—"} />
          <Stat label="Notifications push" value={status.pushCount ?? "—"} />
          <Stat label="Données" value={`${status.keyCount ?? 0} / ${status.keyTotal ?? 0}`} tone={status.keyCount === status.keyTotal ? "stat-green" : "stat-red"} />
        </div>
        {Array.isArray(status.keys) && <details className="backup-keys"><summary>Détail des {status.keys.length} jeux de données</summary>
          <Table columns={[
            { key: "key", label: "Données", render: (row) => row.key },
            { key: "items", label: "Éléments", render: (row) => row.items },
            { key: "updatedAt", label: "Dernière mise à jour", render: (row) => row.updatedAt || "—" },
            { key: "present", label: "Statut", render: (row) => <Status value={row.present ? "Présent" : "Manquant"} /> },
          ]} rows={status.keys} />
        </details>}
      </> : <p className="muted">{error || "Lecture de la base…"}</p>}
    </section>
    <section className="panel"><PanelTitle title="Exporter une sauvegarde" /><p className="muted">Le fichier téléchargé contient les informations du groupe et doit être conservé en lieu sûr.</p><Button variant="primary" disabled={busy} onClick={exportDatabase}>{busy ? "Traitement…" : "Télécharger la sauvegarde complète"}</Button></section>
    <section className="panel"><PanelTitle title="Restaurer une sauvegarde" /><p className="muted">La restauration remplace des données existantes. Vérifiez le fichier et exportez une sauvegarde actuelle avant de continuer.</p>
      <form className="restore-form" onSubmit={restore}>
        <label className="field"><span>Fichier de sauvegarde JSON</span><input type="file" accept=".json,application/json" required onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} /></label>
        <label className="field"><span>Tapez RESTAURER pour confirmer</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
        <button className="button button-danger" disabled={busy || confirmation.trim() !== "RESTAURER" || !selectedFile}>{busy ? "Restauration…" : "Remplacer les données du groupe"}</button>
      </form>
    </section>
  </div>;
}
