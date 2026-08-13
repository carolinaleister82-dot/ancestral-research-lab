const WORKSPACE_KEY = "arl.workspace.v1";
const SESSION_WORKSPACE_KEY = "arl.familysearch-workspace.v1";
const SETTINGS_KEY = "arl.session-settings.v1";

export function loadWorkspace(fallbackFactory) {
  try {
    const sessionRaw = sessionStorage.getItem(SESSION_WORKSPACE_KEY);
    if (sessionRaw) return JSON.parse(sessionRaw);
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return fallbackFactory();
    const parsed = JSON.parse(raw);
    if (parsed?.meta?.schemaVersion !== 1 || !Array.isArray(parsed.persons)) return fallbackFactory();
    return parsed;
  } catch {
    return fallbackFactory();
  }
}

export function saveWorkspace(workspace) {
  if (workspace?.meta?.mode === "familysearch") {
    sessionStorage.setItem(SESSION_WORKSPACE_KEY, JSON.stringify(workspace));
    return;
  }
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
}

export function clearWorkspace() {
  localStorage.removeItem(WORKSPACE_KEY);
  sessionStorage.removeItem(SESSION_WORKSPACE_KEY);
}

export function loadSessionSettings() {
  const config = globalThis.ARL_CONFIG?.familySearch || {};
  try {
    const session = JSON.parse(sessionStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      environment: session.environment || config.environment || "integration",
      appKey: session.appKey || config.appKey || "",
      redirectUri: session.redirectUri || config.redirectUri || "http://localhost:4173/"
    };
  } catch {
    return { environment: "integration", appKey: "", redirectUri: "http://localhost:4173/" };
  }
}

export function saveSessionSettings(settings) {
  sessionStorage.setItem(SETTINGS_KEY, JSON.stringify({
    environment: settings.environment,
    appKey: settings.appKey,
    redirectUri: settings.redirectUri
  }));
}

export function savePkceState({ verifier, state }) {
  sessionStorage.setItem("arl.oauth.pkce.verifier", verifier);
  sessionStorage.setItem("arl.oauth.state", state);
}

export function loadPkceState() {
  return {
    verifier: sessionStorage.getItem("arl.oauth.pkce.verifier"),
    state: sessionStorage.getItem("arl.oauth.state")
  };
}

export function clearPkceState() {
  sessionStorage.removeItem("arl.oauth.pkce.verifier");
  sessionStorage.removeItem("arl.oauth.state");
}
