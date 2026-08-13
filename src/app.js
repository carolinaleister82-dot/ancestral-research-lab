import { cloneMockWorkspace } from "./data/mock.js";
import { exportWorkspace } from "./services/export.js";
import { FamilySearchClient } from "./services/familySearchClient.js";
import { mapFamilySearchBundle } from "./services/familySearchMapper.js";
import { findPerson } from "./services/analysis.js";
import { loadSessionSettings, loadWorkspace, saveSessionSettings, saveWorkspace } from "./services/storage.js";
import { renderAll } from "./ui/render.js";

let workspace = loadWorkspace(cloneMockWorkspace);
let settings = loadSessionSettings();
let familySearch = new FamilySearchClient(settings);

renderAll(workspace);
hydrateSettings();
bindNavigation();
bindSearch();
bindNotes();
bindManualRecords();
bindSettings();
bindGlobalActions();
completeOAuthIfPresent();

function bindNavigation() {
  document.querySelector("#main-nav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (button) switchView(button.dataset.view);
  });
  document.body.addEventListener("click", (event) => {
    const targetView = event.target.closest("[data-go]")?.dataset.go;
    if (targetView) switchView(targetView);
    const personId = event.target.closest("[data-person-id]")?.dataset.personId;
    if (personId) selectPerson(personId);
  });
}

function switchView(view) {
  document.querySelectorAll(".view").forEach((element) => element.classList.toggle("active", element.id === `view-${view}`));
  document.querySelectorAll(".nav-item").forEach((element) => element.classList.toggle("active", element.dataset.view === view));
  document.querySelector("#main").focus({ preventScroll: true });
}

function bindSearch() {
  const input = document.querySelector("#person-search-input");
  const results = document.querySelector("#search-results");
  const run = () => {
    const query = input.value.trim().toLocaleLowerCase("pt-BR");
    if (!query) return hideResults();
    const matches = workspace.persons.filter((person) => [person.id, person.name, ...(person.alternateNames || [])].some((value) => value.toLocaleLowerCase("pt-BR").includes(query))).slice(0, 8);
    results.innerHTML = matches.length ? matches.map((person) => `<button class="search-result" type="button" data-person-id="${person.id}"><strong>${person.name}</strong><span>${person.id}</span></button>`).join("") : `<p class="muted" style="padding:8px;margin:0">Nenhuma pessoa local encontrada.</p>`;
    results.hidden = false;
  };
  document.querySelector("#search-button").addEventListener("click", run);
  input.addEventListener("input", run);
  input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); run(); } });
  results.addEventListener("click", (event) => {
    const id = event.target.closest("[data-person-id]")?.dataset.personId;
    if (id) { selectPerson(id); input.value = ""; hideResults(); }
  });
  document.addEventListener("click", (event) => { if (!event.target.closest(".person-search")) hideResults(); });
  function hideResults() { results.hidden = true; }
}

function selectPerson(personId) {
  if (!findPerson(workspace, personId)) return;
  workspace.focusPersonId = personId;
  persist("Pessoa em foco atualizada.");
  renderAll(workspace);
  switchView("person");
}

function bindNotes() {
  const form = document.querySelector("#note-form");
  document.querySelector("#new-note-button").addEventListener("click", () => { form.hidden = false; document.querySelector("#note-title").focus(); });
  document.querySelector("#cancel-note").addEventListener("click", () => { form.hidden = true; form.reset(); });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    workspace.notes.push({
      id: crypto.randomUUID(),
      personId: workspace.focusPersonId,
      title: document.querySelector("#note-title").value.trim(),
      classification: document.querySelector("#note-classification").value,
      body: document.querySelector("#note-body").value.trim(),
      createdAt: new Date().toISOString()
    });
    persist("Nota salva somente neste navegador.");
    form.reset(); form.hidden = true; renderAll(workspace);
  });
  document.querySelector("#notes-list").addEventListener("click", (event) => {
    const id = event.target.closest("[data-delete-note]")?.dataset.deleteNote;
    if (!id || !confirm("Excluir esta nota local?")) return;
    workspace.notes = workspace.notes.filter((note) => note.id !== id);
    persist("Nota local excluída."); renderAll(workspace);
  });
}

function bindManualRecords() {
  document.querySelector("#record-form").addEventListener("submit", (event) => {
    event.preventDefault();
    workspace.manualRecords.push({
      id: crypto.randomUUID(),
      reference: document.querySelector("#record-id").value.trim(),
      description: document.querySelector("#record-description").value.trim(),
      status: document.querySelector("#record-status").value,
      createdAt: new Date().toISOString()
    });
    persist("Referência manual adicionada."); event.target.reset(); renderAll(workspace);
  });
  document.querySelector("#record-list").addEventListener("click", (event) => {
    const id = event.target.closest("[data-delete-record]")?.dataset.deleteRecord;
    if (!id || !confirm("Excluir esta referência manual?")) return;
    workspace.manualRecords = workspace.manualRecords.filter((record) => record.id !== id);
    persist("Referência manual excluída."); renderAll(workspace);
  });
}

function bindSettings() {
  const dialog = document.querySelector("#settings-dialog");
  document.querySelector("#settings-button").addEventListener("click", () => dialog.showModal());
  document.querySelector("#save-settings").addEventListener("click", (event) => {
    event.preventDefault();
    settings = readSettingsForm();
    saveSessionSettings(settings);
    familySearch = new FamilySearchClient(settings);
    dialog.close();
    toast(settings.appKey ? "Configuração mantida apenas nesta sessão." : "Modo local mantido.");
  });
  document.querySelector("#familysearch-login").addEventListener("click", async (event) => {
    event.preventDefault();
    settings = readSettingsForm();
    saveSessionSettings(settings);
    familySearch = new FamilySearchClient(settings);
    try { await familySearch.beginOAuth(); } catch (error) { showOAuthMessage(error.message, "error"); }
  });
}

function bindGlobalActions() {
  document.querySelector("#export-button").addEventListener("click", () => { exportWorkspace(workspace); toast("Exportação JSON criada. Revise dados vivos antes de compartilhar."); });
}

async function completeOAuthIfPresent() {
  if (!new URLSearchParams(location.search).has("code")) return;
  try {
    const result = await familySearch.completeOAuthFromLocation();
    if (result.authenticated) {
      const previousNotes = workspace.notes;
      const previousRecords = workspace.manualRecords;
      const bundle = await familySearch.loadCurrentResearchBundle();
      workspace = mapFamilySearchBundle(bundle);
      workspace.notes = previousNotes;
      workspace.manualRecords = previousRecords;
      saveWorkspace(workspace);
      renderAll(workspace);
      document.querySelector("#mode-badge").textContent = "FamilySearch conectado";
      document.querySelector("#mode-badge").className = "status-pill status-live";
      toast("Pessoa raiz e dados permitidos importados em modo somente leitura.");
    }
  } catch (error) {
    showOAuthMessage(error.message, "error");
    document.querySelector("#settings-dialog").showModal();
  }
}

function hydrateSettings() {
  document.querySelector("#fs-environment").value = settings.environment;
  document.querySelector("#fs-app-key").value = settings.appKey;
  document.querySelector("#fs-redirect-uri").value = settings.redirectUri;
}

function readSettingsForm() {
  return {
    environment: document.querySelector("#fs-environment").value,
    appKey: document.querySelector("#fs-app-key").value.trim(),
    redirectUri: document.querySelector("#fs-redirect-uri").value.trim()
  };
}

function showOAuthMessage(message, type) {
  const element = document.querySelector("#oauth-message");
  element.textContent = message;
  element.className = `notice notice-${type}`;
  element.hidden = false;
}

function persist(message) {
  saveWorkspace(workspace);
  document.querySelector("#last-saved").textContent = `Salvo às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (message) toast(message);
}

let toastTimer;
function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 3300);
}
