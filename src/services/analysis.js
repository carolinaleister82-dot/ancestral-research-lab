const requiredFacts = [
  { type: "Birth", label: "nascimento" },
  { type: "Death", label: "óbito" }
];

export function findPerson(workspace, personId) {
  return workspace.persons.find((person) => person.id === personId) || null;
}

export function getConnections(workspace, personId) {
  return workspace.relationships
    .filter((relationship) => relationship.person1 === personId || relationship.person2 === personId)
    .map((relationship) => {
      const relatedId = relationship.person1 === personId ? relationship.person2 : relationship.person1;
      return { ...relationship, person: findPerson(workspace, relatedId) };
    })
    .filter((item) => item.person);
}

export function sourceStrength(source) {
  const value = source?.quality?.toLowerCase() || "";
  if (value.includes("primária") && value.includes("direta")) return "forte";
  if (value.includes("primária") || value.includes("corrobor")) return "média";
  if (value.includes("relato") || value.includes("secundária")) return "fraca";
  return "não avaliada";
}

export function buildEvidenceRows(workspace, personId) {
  const person = findPerson(workspace, personId);
  if (!person) return [];
  return person.facts.map((fact) => {
    const sources = fact.sourceIds.map((id) => workspace.sources.find((source) => source.id === id)).filter(Boolean);
    return {
      fact,
      sources,
      strength: sources.length ? strongest(sources.map(sourceStrength)) : "ausente",
      pending: sources.length ? derivePending(fact, sources) : "Localizar documento que sustente este fato."
    };
  });
}

function strongest(values) {
  const order = ["forte", "média", "fraca", "não avaliada"];
  return order.find((level) => values.includes(level)) || "não avaliada";
}

function derivePending(fact, sources) {
  if (!fact.place) return "Confirmar e normalizar a localidade.";
  if (fact.date?.startsWith("c.")) return "Substituir a data aproximada por registro direto, se disponível.";
  if (sources.every((source) => sourceStrength(source) === "fraca")) return "Buscar fonte independente e contemporânea ao evento.";
  return "Nenhuma pendência automática; revisar a transcrição humana."
}

export function analyzeWorkspace(workspace, personId) {
  const person = findPerson(workspace, personId);
  if (!person) return [];
  const alerts = [];
  const factsByType = new Map(person.facts.map((fact) => [fact.type, fact]));

  for (const required of requiredFacts) {
    const fact = factsByType.get(required.type);
    if (!fact) {
      alerts.push(issue("lacuna", "alta", `Falta o fato de ${required.label}`, `A ficha não contém um fato de ${required.label}.`, `Localizar registro de ${required.label} ou registrar explicitamente a busca negativa.`));
    } else if (!fact.sourceIds?.length) {
      alerts.push(issue("fonte ausente", "alta", `${fact.label} sem fonte vinculada`, `O valor “${formatFact(fact)}” está registrado, mas não possui fonte.`, `Localizar uma fonte direta ou reclassificar o dado como relato/hipótese.`));
    }
  }

  for (const fact of person.facts) {
    if (!fact.place) alerts.push(issue("lacuna", "média", `${fact.label} sem localidade`, "O campo de lugar está vazio.", "Procurar o documento original e registrar o texto tal como consta antes de normalizar."));
    if (fact.date?.startsWith("c.")) alerts.push(issue("data aproximada", "baixa", `${fact.label} com data aproximada`, `A data atual é “${fact.date}”.`, "Buscar uma fonte contemporânea ao evento para estreitar o intervalo."));
  }

  const relationships = workspace.relationships.filter((relationship) => relationship.person1 === personId || relationship.person2 === personId);
  for (const relationship of relationships) {
    if (!relationship.sourceIds?.length) {
      const relatedId = relationship.person1 === personId ? relationship.person2 : relationship.person1;
      const related = findPerson(workspace, relatedId);
      alerts.push(issue("relação não provada", "alta", `Relação com ${related?.name || relatedId} sem documento`, `A relação está classificada como “${relationship.status}” e não possui fonte direta vinculada.`, "Localizar documento que nomeie diretamente as duas pessoas na relação alegada."));
    }
  }

  const normalizedNames = new Map();
  for (const value of [person.name, ...(person.alternateNames || [])]) {
    const normalized = normalizeName(value);
    if (normalizedNames.has(normalized) && normalizedNames.get(normalized) !== value) continue;
    normalizedNames.set(normalized, value);
  }
  if ((person.alternateNames || []).length) {
    alerts.push(issue("variante nominal", "média", "Há variantes de nome para conferir", `Formas registradas: ${[person.name, ...person.alternateNames].join("; ")}.`, "Comparar cada grafia com a imagem ou documento original e indicar em qual fonte ocorre."));
  }

  return alerts;
}

function issue(type, priority, title, detail, nextAction) {
  return { id: `${type}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), type, priority, title, detail, nextAction };
}

function normalizeName(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\b(de|da|do|dos|das)\b/g, "").replace(/\s+/g, " ").trim();
}

function formatFact(fact) {
  return [fact.date, fact.place].filter(Boolean).join(" — ");
}

export function metrics(workspace, personId) {
  const person = findPerson(workspace, personId);
  const alerts = analyzeWorkspace(workspace, personId);
  const sources = new Set((person?.facts || []).flatMap((fact) => fact.sourceIds || []));
  return {
    people: workspace.persons.length,
    sources: sources.size,
    alerts: alerts.length,
    confirmed: (person?.facts || []).filter((fact) => ["comprovado", "corroborado"].includes(fact.status)).length
  };
}

export function nextAction(workspace, personId) {
  return analyzeWorkspace(workspace, personId)[0] || {
    priority: "baixa",
    title: "Revisar a transcrição das fontes",
    nextAction: "Conferir se nomes, datas, lugares e citações correspondem aos documentos originais."
  };
}

