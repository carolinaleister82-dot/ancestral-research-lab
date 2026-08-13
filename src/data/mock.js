export const mockWorkspace = {
  meta: {
    title: "Reconstrução documental da família Duarte",
    subtitle: "Dados demonstrativos — substitua-os por sua própria pesquisa.",
    schemaVersion: 1,
    mode: "mock"
  },
  focusPersonId: "MOCK-H001",
  persons: [
    {
      id: "MOCK-H001",
      name: "Helena Duarte",
      alternateNames: ["Helena de Souza Duarte"],
      gender: "Female",
      living: false,
      confidence: "provável",
      facts: [
        { id: "f1", type: "Birth", label: "Nascimento", date: "1898", place: "Campinas, São Paulo, Brasil", sourceIds: ["s1"], status: "corroborado" },
        { id: "f2", type: "Marriage", label: "Casamento", date: "1921", place: "São Carlos, São Paulo, Brasil", sourceIds: ["s2"], status: "comprovado" },
        { id: "f3", type: "Death", label: "Óbito", date: "1974", place: "São Paulo, São Paulo, Brasil", sourceIds: [], status: "não confirmado" }
      ]
    },
    { id: "MOCK-J001", name: "Joaquim Duarte", alternateNames: [], gender: "Male", living: false, confidence: "possível", facts: [{ id: "f4", type: "Birth", label: "Nascimento", date: "c. 1864", place: "Minas Gerais, Brasil", sourceIds: [], status: "não confirmado" }] },
    { id: "MOCK-A001", name: "Amélia de Souza", alternateNames: ["Amélia Souza"], gender: "Female", living: false, confidence: "provável", facts: [{ id: "f5", type: "Birth", label: "Nascimento", date: "1872", place: "", sourceIds: ["s3"], status: "indício" }] },
    { id: "MOCK-M001", name: "Manuel Ribeiro", alternateNames: [], gender: "Male", living: false, confidence: "confirmado", facts: [{ id: "f6", type: "Birth", label: "Nascimento", date: "1895", place: "Porto, Portugal", sourceIds: ["s2"], status: "comprovado" }] },
    { id: "MOCK-C001", name: "Celina Ribeiro", alternateNames: [], gender: "Female", living: false, confidence: "confirmado", facts: [{ id: "f7", type: "Birth", label: "Nascimento", date: "1924", place: "São Carlos, São Paulo, Brasil", sourceIds: ["s4"], status: "comprovado" }] }
  ],
  relationships: [
    { id: "r1", type: "parent-child", person1: "MOCK-J001", person2: "MOCK-H001", label: "pai", sourceIds: [], status: "hipótese" },
    { id: "r2", type: "parent-child", person1: "MOCK-A001", person2: "MOCK-H001", label: "mãe", sourceIds: ["s1"], status: "provável" },
    { id: "r3", type: "couple", person1: "MOCK-H001", person2: "MOCK-M001", label: "cônjuge", sourceIds: ["s2"], status: "confirmado" },
    { id: "r4", type: "parent-child", person1: "MOCK-H001", person2: "MOCK-C001", label: "filha", sourceIds: ["s4"], status: "confirmado" }
  ],
  sources: [
    { id: "s1", title: "Registro de batismo — cópia demonstrativa", citation: "Paróquia demonstrativa, livro 3, folha 18.", date: "1899", url: "", quality: "fonte primária; informação indireta", supports: ["f1", "r2"] },
    { id: "s2", title: "Habilitação matrimonial — cópia demonstrativa", citation: "Arquivo demonstrativo, processo 21/1921.", date: "1921", url: "", quality: "fonte primária; informação direta", supports: ["f2", "f6", "r3"] },
    { id: "s3", title: "Memória familiar registrada", citation: "Relato familiar sem documento civil associado.", date: "1988", url: "", quality: "relato; informação secundária", supports: ["f5"] },
    { id: "s4", title: "Registro civil de nascimento — cópia demonstrativa", citation: "Cartório demonstrativo, termo 44/1924.", date: "1924", url: "", quality: "fonte primária; informação direta", supports: ["f7", "r4"] }
  ],
  notes: [
    { id: "n1", personId: "MOCK-H001", title: "Variação nominal", classification: "indício", body: "A forma “Helena de Souza Duarte” aparece apenas na fonte matrimonial. Verificar se é nome de casada ou composição posterior.", createdAt: "2026-08-13T12:00:00.000Z" }
  ],
  manualRecords: []
};

export function cloneMockWorkspace() {
  return structuredClone(mockWorkspace);
}
