const TYPE_LABELS = {
  Birth: "Nascimento",
  Christening: "Batismo",
  Marriage: "Casamento",
  Death: "Óbito",
  Burial: "Sepultamento",
  Residence: "Residência",
  Occupation: "Profissão",
  Nationality: "Nacionalidade",
  Religion: "Religião"
};

export function mapFamilySearchBundle(bundle) {
  const documents = [bundle.person, bundle.families].filter(Boolean);
  const rawPersons = uniqueById(documents.flatMap((document) => document.persons || []));
  const sources = mapSources(bundle.sources);
  const sourceIds = new Set(sources.map((source) => source.id));
  const persons = rawPersons.map((person) => mapPerson(person, sourceIds));
  const relationships = mapRelationships(documents, sourceIds);
  const rootId = bundle.person?.persons?.[0]?.id || persons[0]?.id;
  return {
    meta: {
      title: "Pesquisa conectada ao FamilySearch",
      subtitle: "Leitura autorizada pela conta; análise e notas permanecem locais.",
      schemaVersion: 1,
      mode: "familysearch",
      importedAt: new Date().toISOString()
    },
    focusPersonId: rootId,
    persons,
    relationships,
    sources,
    memories: mapMemories(bundle.memories),
    notes: [],
    manualRecords: []
  };
}

function mapPerson(person, sourceIds) {
  const displayName = person.display?.name || person.names?.find((name) => name.preferred)?.nameForms?.[0]?.fullText || person.names?.[0]?.nameForms?.[0]?.fullText || person.id;
  const alternateNames = (person.names || []).flatMap((name) => name.nameForms || []).map((form) => form.fullText).filter((name) => name && name !== displayName);
  return {
    id: person.id,
    name: displayName,
    alternateNames: [...new Set(alternateNames)],
    gender: lastSegment(person.gender?.type || "Unknown"),
    living: Boolean(person.living),
    confidence: "não avaliado",
    facts: (person.facts || []).map((fact, index) => ({
      id: fact.id || `${person.id}-fact-${index}`,
      type: lastSegment(fact.type || "Fact"),
      label: TYPE_LABELS[lastSegment(fact.type || "Fact")] || lastSegment(fact.type || "Fato"),
      date: fact.date?.original || fact.date?.formal || "",
      place: fact.place?.original || fact.place?.normalized?.value || "",
      sourceIds: (person.sources || person.sourceReferences || []).map((reference) => referenceId(reference.description || reference.resource)).filter((id) => sourceIds.has(id)),
      status: "importado; requer avaliação"
    }))
  };
}

function mapRelationships(documents, sourceIds) {
  const couples = uniqueById(documents.flatMap((document) => document.relationships || document.coupleRelationships || []));
  const parents = uniqueById(documents.flatMap((document) => document.childAndParentsRelationships || []));
  const output = [];
  for (const relationship of couples) {
    const person1 = referenceId(relationship.person1?.resource || relationship.person1?.resourceId);
    const person2 = referenceId(relationship.person2?.resource || relationship.person2?.resourceId);
    if (person1 && person2) output.push({ id: relationship.id, type: "couple", person1, person2, label: "cônjuge", sourceIds: mapReferenceIds(relationship, sourceIds), status: "importado; requer avaliação" });
  }
  for (const relationship of parents) {
    const child = referenceId(relationship.child?.resource || relationship.child?.resourceId);
    for (const parentKey of ["parent1", "parent2"]) {
      const parent = referenceId(relationship[parentKey]?.resource || relationship[parentKey]?.resourceId);
      if (parent && child) output.push({ id: `${relationship.id}-${parentKey}`, type: "parent-child", person1: parent, person2: child, label: "relação parental", sourceIds: mapReferenceIds(relationship, sourceIds), status: "importado; requer avaliação" });
    }
  }
  return output;
}

function mapSources(document) {
  return (document?.sourceDescriptions || []).map((source) => ({
    id: source.id || referenceId(source.about),
    title: textValue(source.titles?.[0]) || "Fonte sem título",
    citation: textValue(source.citations?.[0]) || "Citação não informada",
    date: "",
    url: source.about || "",
    quality: "importada; requer avaliação humana",
    supports: []
  })).filter((source) => source.id);
}

function mapMemories(document) {
  return (document?.sourceDescriptions || []).map((memory) => ({
    id: memory.id || referenceId(memory.about),
    title: textValue(memory.titles?.[0]) || "Memória sem título",
    description: memory.notes?.[0]?.text || "",
    mediaType: memory.mediaType || "",
    url: memory.about || ""
  }));
}

function mapReferenceIds(entity, sourceIds) {
  return (entity.sources || entity.sourceReferences || []).map((reference) => referenceId(reference.description || reference.resource)).filter((id) => sourceIds.has(id));
}

function textValue(value) {
  return typeof value === "string" ? value : value?.value || "";
}

function lastSegment(value) {
  return String(value).split(/[\/#]/).filter(Boolean).at(-1) || "";
}

function referenceId(value) {
  if (!value) return "";
  return String(value).replace(/^#/, "").split(/[\/#]/).filter(Boolean).at(-1) || "";
}

function uniqueById(values) {
  const seen = new Map();
  for (const value of values) if (value?.id && !seen.has(value.id)) seen.set(value.id, value);
  return [...seen.values()];
}

