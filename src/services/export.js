export function exportWorkspace(workspace) {
  const payload = {
    exportedAt: new Date().toISOString(),
    application: "Ancestral Research Lab",
    formatVersion: 1,
    privacyNotice: "Arquivo local de pesquisa. Revise dados de pessoas vivas antes de compartilhar.",
    workspace
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ancestral-research-lab-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

