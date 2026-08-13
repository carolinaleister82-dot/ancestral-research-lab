import { clearPkceState, loadPkceState, savePkceState } from "./storage.js";

const ENVIRONMENTS = {
  integration: "integration",
  beta: "beta",
  production: "production"
};

export class FamilySearchClient {
  constructor(settings) {
    this.settings = settings;
    this.sdk = null;
  }

  isConfigured() {
    return Boolean(this.settings.appKey && this.settings.redirectUri);
  }

  initialize() {
    if (!this.isConfigured()) throw new Error("Informe a App Key e o callback OAuth.");
    if (typeof globalThis.FamilySearch !== "function") throw new Error("O SDK oficial do FamilySearch não pôde ser carregado.");
    this.sdk = new globalThis.FamilySearch({
      environment: ENVIRONMENTS[this.settings.environment] || "integration",
      appKey: this.settings.appKey,
      redirectUri: this.settings.redirectUri,
      saveAccessToken: false,
      secureCookies: true,
      requestInterval: 350,
      maxThrottledRetries: 3
    });
    return this;
  }

  async beginOAuth() {
    this.initialize();
    const verifier = this.sdk.generateCodeVerifier();
    const challenge = await Promise.resolve(this.sdk.generateCodeChallenge(verifier));
    const state = crypto.randomUUID();
    savePkceState({ verifier, state });
    location.assign(this.sdk.oauthRedirectURL({ state, codeChallenge: challenge }));
  }

  async completeOAuthFromLocation() {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (!code) return { handled: false };
    const stored = loadPkceState();
    if (!stored.verifier || !stored.state || params.get("state") !== stored.state) {
      clearPkceState();
      throw new Error("A resposta OAuth não corresponde à sessão iniciada. Tente entrar novamente.");
    }
    this.initialize();
    const response = await callbackToPromise((done) => this.sdk.oauthToken(code, stored.verifier, done));
    clearPkceState();
    history.replaceState({}, document.title, location.pathname);
    if (!response?.data?.access_token && !this.sdk.getAccessToken()) throw new Error("O FamilySearch não retornou um token de acesso.");
    return { handled: true, authenticated: true };
  }

  async loadCurrentResearchBundle() {
    this.requireAuthenticated();
    const current = await this.get("/platform/tree/current-person", { followRedirect: true });
    const root = current.data?.persons?.[0];
    if (!root?.id) throw new Error("A pessoa raiz da conta não foi localizada.");
    return this.loadPersonBundle(root.id);
  }

  async loadPersonBundle(personId) {
    this.requireAuthenticated();
    const safeId = encodeURIComponent(personId);
    const [person, families, sources, memories] = await Promise.all([
      this.get(`/platform/tree/persons/${safeId}`),
      this.get(`/platform/tree/persons/${safeId}/families`),
      this.get(`/platform/tree/persons/${safeId}/sources`),
      this.get(`/platform/tree/persons/${safeId}/memories`)
    ]);
    return { person: person.data, families: families.data, sources: sources.data, memories: memories.data };
  }

  async searchPeople(query) {
    this.requireAuthenticated();
    const value = encodeURIComponent(query.trim());
    if (!value) return [];
    const response = await this.get(`/platform/tree/search?q.name=${value}`);
    return response.data?.entries || [];
  }

  get(path, options = {}) {
    return callbackToPromise((done) => this.sdk.get(path, options, done)).then((response) => {
      if (!response || response.statusCode >= 400) {
        const error = new Error(mapStatus(response?.statusCode));
        error.statusCode = response?.statusCode;
        throw error;
      }
      return response;
    });
  }

  requireAuthenticated() {
    if (!this.sdk?.getAccessToken()) throw new Error("Entre com o FamilySearch antes de consultar a API.");
  }
}

function callbackToPromise(run) {
  return new Promise((resolve, reject) => run((error, response) => error ? reject(error) : resolve(response)));
}

function mapStatus(status) {
  if (status === 401) return "A sessão do FamilySearch expirou ou não foi autorizada.";
  if (status === 403) return "Esta App Key não possui acesso a esse recurso.";
  if (status === 404) return "O recurso solicitado não foi encontrado.";
  if (status === 429) return "O limite temporário de requisições foi atingido. Aguarde e tente novamente.";
  if (status >= 500) return "O FamilySearch está temporariamente indisponível.";
  return `A solicitação ao FamilySearch falhou${status ? ` (${status})` : ""}.`;
}
