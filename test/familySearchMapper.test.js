import test from "node:test";
import assert from "node:assert/strict";
import { mapFamilySearchBundle } from "../src/services/familySearchMapper.js";

test("normaliza pessoa, família, fontes e memórias de GEDCOM X", () => {
  const mapped = mapFamilySearchBundle({
    person: { persons: [{ id: "AAAA-111", display: { name: "Ana Teste" }, living: false, facts: [{ id: "fact-1", type: "http://gedcomx.org/Birth", date: { original: "1900" }, place: { original: "Curitiba" } }] }] },
    families: {
      persons: [{ id: "BBBB-222", display: { name: "Bruno Teste" }, facts: [] }],
      relationships: [{ id: "rel-1", person1: { resourceId: "AAAA-111" }, person2: { resourceId: "BBBB-222" } }]
    },
    sources: { sourceDescriptions: [{ id: "SRC-1", titles: [{ value: "Registro civil" }], citations: [{ value: "Livro 1, folha 2" }] }] },
    memories: { sourceDescriptions: [{ id: "MEM-1", titles: [{ value: "Fotografia" }], mediaType: "image/jpeg" }] }
  });
  assert.equal(mapped.focusPersonId, "AAAA-111");
  assert.equal(mapped.persons.length, 2);
  assert.equal(mapped.persons[0].facts[0].label, "Nascimento");
  assert.equal(mapped.relationships[0].type, "couple");
  assert.equal(mapped.sources[0].title, "Registro civil");
  assert.equal(mapped.memories[0].title, "Fotografia");
});

test("não duplica pessoas repetidas entre respostas", () => {
  const person = { id: "AAAA-111", display: { name: "Ana Teste" }, facts: [] };
  const mapped = mapFamilySearchBundle({ person: { persons: [person] }, families: { persons: [person] }, sources: {}, memories: {} });
  assert.equal(mapped.persons.length, 1);
});
