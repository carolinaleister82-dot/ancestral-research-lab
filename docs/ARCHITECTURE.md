# Arquitetura

## Decisão principal

O Ancestral Research Lab é uma aplicação web principal. Uma extensão auxiliar poderá ser criada no futuro somente para abrir a aplicação ou transportar uma referência escolhida pelo usuário; ela não injetará código em páginas do FamilySearch.

```text
Interface investigativa
       │
       ├── dados mock/local ── localStorage ── exportação explícita
       │
       ├── análise determinística ── lacunas, relações e fontes
       │
       └── adaptador FamilySearch (opcional)
                │
                ├── SDK oficial fs-js-lite 3.0.0
                ├── OAuth 2.0 + state + PKCE
                ├── leitura de pessoa/família/fontes/memórias
                └── sessionStorage (limpo ao fim da sessão)
```

## Módulos

| Caminho | Responsabilidade |
|---|---|
| `src/app.js` | Estado da interface, eventos e fluxo OAuth |
| `src/data/mock.js` | Conjunto demonstrativo sem pessoas reais |
| `src/services/analysis.js` | Regras locais, transparentes e testáveis |
| `src/services/familySearchClient.js` | Único ponto que conhece endpoints FamilySearch |
| `src/services/familySearchMapper.js` | GEDCOM X/FamilySearch para modelo interno |
| `src/services/storage.js` | Separação entre persistência local e sessão FamilySearch |
| `src/services/export.js` | Exportação iniciada pelo usuário |
| `src/ui/render.js` | Renderização sem framework e escape de conteúdo |

## Modelo interno mínimo

- `persons`: pessoa, variantes, fatos e grau de certeza;
- `relationships`: casal ou parental, fontes e status;
- `sources`: título, citação, URL, avaliação e itens sustentados;
- `notes`: classificação epistemológica e texto local;
- `manualRecords`: referência DGS/manual, sem acesso automatizado.

O modelo preserva o dado original sempre que recebido e evita transformar ausência de fonte em conclusão negativa.

## Escrita futura

Escrita está ausente do cliente atual. Se for implementada após aprovação do FamilySearch, deverá passar por um fluxo separado:

```text
sugestão local → comparação visual → fontes exibidas → motivo da alteração
→ confirmação humana por operação → chamada documentada → registro do resultado
```

Não haverá botão global de “sincronizar tudo”, escrita automática por IA ou confirmação reaproveitada para várias pessoas.

