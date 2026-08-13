import { analyzeWorkspace, buildEvidenceRows, findPerson, getConnections, metrics, nextAction, sourceStrength } from "../services/analysis.js";

const escape = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

export function renderAll(workspace) {
  const person = findPerson(workspace, workspace.focusPersonId) || workspace.persons[0];
  if (!person) return;
  workspace.focusPersonId = person.id;
  document.querySelector("#workspace-title").textContent = workspace.meta.title;
  document.querySelector("#workspace-subtitle").textContent = workspace.meta.subtitle;
  document.querySelector("#focus-name").textContent = person.name;
  renderMetrics(workspace, person.id);
  renderFocus(workspace, person);
  renderConnections(workspace, person);
  renderAlertPreview(workspace, person.id);
  renderPersonDetail(workspace, person);
  renderEvidence(workspace, person.id);
  renderAnalysis(workspace, person.id);
  renderNotes(workspace, person.id);
  renderManualRecords(workspace);
}

function renderMetrics(workspace, personId) {
  const values = metrics(workspace, personId);
  const cards = [
    ["Pessoas no recorte", values.people, "◎"],
    ["Fontes vinculadas", values.sources, "▤"],
    ["Fatos sustentados", values.confirmed, "✓"],
    ["Alertas ativos", values.alerts, "!"],
  ];
  document.querySelector("#metric-grid").innerHTML = cards.map(([label, value, icon]) => `<article class="metric"><span class="metric-icon">${icon}</span><span class="muted">${escape(label)}</span><strong>${value}</strong><small>na pessoa em foco</small></article>`).join("");
}

function renderFocus(workspace, person) {
  const birth = person.facts.find((fact) => fact.type === "Birth");
  const death = person.facts.find((fact) => fact.type === "Death");
  document.querySelector("#focus-summary").innerHTML = `<div class="focus-grid"><div class="person-avatar" aria-hidden="true">${initials(person.name)}</div><div><div class="fact-line"><span>ID local</span><strong>${escape(person.id)}</strong></div><div class="fact-line"><span>Nascimento</span><strong>${escape(formatFact(birth))}</strong></div><div class="fact-line"><span>Óbito</span><strong>${escape(formatFact(death))}</strong></div><div class="fact-line"><span>Variantes</span><strong>${escape(person.alternateNames?.join("; ") || "nenhuma registrada")}</strong></div><div class="tag-row"><span class="tag ${confidenceClass(person.confidence)}">Conclusão: ${escape(person.confidence)}</span><span class="tag">${person.facts.length} fatos</span><span class="tag">${getConnections(workspace, person.id).length} conexões</span></div></div></div>`;
  const action = nextAction(workspace, person.id);
  document.querySelector("#next-action").innerHTML = `<div class="action-card"><strong>${escape(action.title)}</strong><p>${escape(action.nextAction)}</p><span class="priority priority-${escape(action.priority)}">prioridade ${escape(action.priority)}</span></div>`;
}

function renderConnections(workspace, person) {
  const connections = getConnections(workspace, person.id);
  document.querySelector("#relationship-map").innerHTML = [
    `<div class="relation-node focus"><small>pessoa em foco</small><strong>${escape(person.name)}</strong><button type="button" data-person-id="${escape(person.id)}">${escape(person.id)}</button></div>`,
    ...connections.map((connection) => `<div class="relation-node"><small>${escape(connection.label)} · ${escape(connection.status)}</small><strong>${escape(connection.person.name)}</strong><button type="button" data-person-id="${escape(connection.person.id)}">abrir ficha →</button></div>`)
  ].join("");
}

function renderAlertPreview(workspace, personId) {
  const alerts = analyzeWorkspace(workspace, personId).slice(0, 3);
  document.querySelector("#alert-preview").innerHTML = alerts.length ? alerts.map(alertMarkup).join("") : `<p class="muted">Nenhum alerta automático. A revisão humana das fontes continua necessária.</p>`;
}

function renderPersonDetail(workspace, person) {
  const connections = getConnections(workspace, person.id);
  document.querySelector("#person-detail").innerHTML = `<div class="person-layout"><article class="panel profile-card"><div class="person-avatar" aria-hidden="true">${initials(person.name)}</div><h3>${escape(person.name)}</h3><p>${escape(person.id)}</p><div class="tag-row" style="justify-content:center"><span class="tag ${confidenceClass(person.confidence)}">${escape(person.confidence)}</span><span class="tag">${person.living ? "pessoa viva" : "falecida"}</span></div><hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><p><strong>Variantes nominais</strong><br>${escape(person.alternateNames?.join("; ") || "Nenhuma")}</p><p><strong>Conexões próximas</strong><br>${connections.map((item) => `${escape(item.label)}: ${escape(item.person.name)}`).join("<br>") || "Nenhuma"}</p></article><article class="panel"><div class="panel-heading"><div><p class="eyebrow">CRONOLOGIA</p><h3>Eventos registrados</h3></div></div><div class="timeline">${person.facts.map((fact) => `<div class="timeline-item"><strong>${escape(fact.label)}</strong><p>${escape(formatFact(fact))}</p><small>${fact.sourceIds.length} fonte(s) · ${escape(fact.status)}</small></div>`).join("")}</div></article></div>`;
}

function renderEvidence(workspace, personId) {
  const rows = buildEvidenceRows(workspace, personId);
  document.querySelector("#evidence-table").innerHTML = `<table class="data-table"><thead><tr><th>Fato</th><th>Valor</th><th>Fonte(s)</th><th>Força</th><th>Pendência</th></tr></thead><tbody>${rows.map(({ fact, sources, strength, pending }) => `<tr><td><strong>${escape(fact.label)}</strong><br><span class="muted">${escape(fact.status)}</span></td><td>${escape(formatFact(fact))}</td><td>${sources.length ? sources.map((source) => `<span class="source-link">${escape(source.title)}</span><br><small>${escape(source.citation)}</small>`).join("<br>") : '<span class="tag tag-danger">sem fonte</span>'}</td><td><span class="tag ${strength === "forte" ? "tag-confirmed" : strength === "ausente" ? "tag-danger" : "tag-warning"}">${escape(strength)}</span></td><td>${escape(pending)}</td></tr>`).join("")}</tbody></table>`;
}

function renderAnalysis(workspace, personId) {
  const alerts = analyzeWorkspace(workspace, personId);
  document.querySelector("#analysis-list").innerHTML = alerts.length ? alerts.map((alert) => `<article class="panel analysis-card"><div class="analysis-symbol">${alert.priority === "alta" ? "!" : alert.priority === "média" ? "◇" : "·"}</div><div><p class="eyebrow">${escape(alert.type)}</p><h3>${escape(alert.title)}</h3><p>${escape(alert.detail)}</p><strong>Próxima pesquisa: ${escape(alert.nextAction)}</strong></div><span class="priority priority-${escape(alert.priority)}">${escape(alert.priority)}</span></article>`).join("") : `<article class="panel"><h3>Nenhuma lacuna automática</h3><p class="muted">Isso não substitui a crítica humana das fontes nem confirma identidades.</p></article>`;
}

export function renderNotes(workspace, personId) {
  const notes = workspace.notes.filter((note) => note.personId === personId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  document.querySelector("#notes-list").innerHTML = notes.length ? notes.map((note) => `<article class="panel note-card"><button class="delete-button" type="button" data-delete-note="${escape(note.id)}" aria-label="Excluir nota">Excluir</button><div class="note-meta"><span class="tag">${escape(note.classification)}</span><span>${new Date(note.createdAt).toLocaleString("pt-BR")}</span></div><h3>${escape(note.title)}</h3><p>${escape(note.body)}</p></article>`).join("") : `<article class="panel"><p class="muted">Nenhuma nota para esta pessoa.</p></article>`;
}

export function renderManualRecords(workspace) {
  document.querySelector("#record-list").innerHTML = workspace.manualRecords.length ? workspace.manualRecords.map((record) => `<article class="panel note-card"><button class="delete-button" type="button" data-delete-record="${escape(record.id)}" aria-label="Excluir referência">Excluir</button><div class="note-meta"><span class="tag tag-warning">${escape(record.status)}</span><span>inserido manualmente</span></div><h3>${escape(record.reference)}</h3><p>${escape(record.description)}</p></article>`).join("") : `<article class="panel"><p class="muted">Nenhuma referência DGS/manual registrada.</p></article>`;
}

function alertMarkup(alert) {
  return `<div class="alert-item"><div class="alert-title"><span class="tag ${alert.priority === "alta" ? "tag-danger" : "tag-warning"}">${escape(alert.priority)}</span>${escape(alert.title)}</div><p>${escape(alert.detail)}</p></div>`;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatFact(fact) {
  if (!fact) return "não registrado";
  return [fact.date, fact.place].filter(Boolean).join(" — ") || "sem valor";
}

function confidenceClass(value) {
  if (["confirmado", "altamente provável"].includes(value)) return "tag-confirmed";
  if (["provável", "possível"].includes(value)) return "tag-warning";
  return "tag-danger";
}

