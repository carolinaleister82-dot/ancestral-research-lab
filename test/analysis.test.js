import test from "node:test";
import assert from "node:assert/strict";
import { analyzeWorkspace, buildEvidenceRows, getConnections, metrics } from "../src/services/analysis.js";
import { cloneMockWorkspace } from "../src/data/mock.js";

test("detecta fato sem fonte e relação sem prova", () => {
  const workspace = cloneMockWorkspace();
  const alerts = analyzeWorkspace(workspace, "MOCK-H001");
  assert.ok(alerts.some((alert) => alert.title.includes("Óbito sem fonte")));
  assert.ok(alerts.some((alert) => alert.title.includes("Joaquim Duarte")));
});

test("matriz de evidências classifica fonte primária direta como forte", () => {
  const workspace = cloneMockWorkspace();
  const rows = buildEvidenceRows(workspace, "MOCK-H001");
  const marriage = rows.find((row) => row.fact.type === "Marriage");
  assert.equal(marriage.strength, "forte");
});

test("conexões retornam a pessoa relacionada", () => {
  const workspace = cloneMockWorkspace();
  const connections = getConnections(workspace, "MOCK-H001");
  assert.equal(connections.length, 4);
  assert.ok(connections.some((item) => item.person.name === "Amélia de Souza"));
});

test("métricas refletem o recorte local", () => {
  const workspace = cloneMockWorkspace();
  const result = metrics(workspace, "MOCK-H001");
  assert.equal(result.people, 5);
  assert.equal(result.sources, 2);
  assert.equal(result.confirmed, 2);
  assert.ok(result.alerts >= 2);
});

