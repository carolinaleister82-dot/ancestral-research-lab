# Estudo técnico oficial do FamilySearch

Revisão realizada em 13 de agosto de 2026. Para a parte técnica, foram usadas somente páginas do FamilySearch e o repositório oficial `FamilySearch/fs-js-lite`.

## Conclusões que dirigem o código

| Tema oficial | Conclusão aplicada |
|---|---|
| OAuth | Authorization Code; a aplicação nunca recebe usuário/senha FamilySearch |
| Proteção contra CSRF | `state` aleatório é criado e conferido no callback |
| PKCE | usado pelo SDK oficial para proteger cliente público; verificador fica na sessão |
| App Keys | ambientes e callbacks são administrados separadamente pelo FamilySearch |
| Tokens | access token não é persistido; refresh token não é solicitado nesta versão |
| Transporte | produção exige HTTPS; localhost é apenas desenvolvimento |
| Cache | dados FamilySearch ficam em sessão e desaparecem quando a sessão termina |
| Privacidade | pessoas vivas não podem ser expostas a outros usuários ou publicadas |
| Dados | GEDCOM X JSON é convertido por um mapeador tolerante a campos adicionais |
| Throttling | SDK respeita `Retry-After`; intervalo mínimo e tentativas limitadas configurados |
| Redirect/merge | cliente trata respostas HTTP e mantém integração isolada para evolução futura |
| Escrita | ausente; leitura deve ser validada antes de qualquer certificação de escrita |
| Plug-in | web app principal; nada de injetar HTML/JS em páginas FamilySearch |
| API não documentada | proibida; pode causar desativação da App Key |
| DGS/imagens | não há automação; apenas anotação manual até autorização específica |

## SDK e ferramentas

A página oficial de Tools & SDKs identifica `FamilySearch/fs-js-lite` como o SDK JavaScript oficial. A versão 3.0.0:

- funciona em navegadores modernos;
- suporta os ambientes `integration`, `beta` e `production`;
- oferece OAuth, PKCE, requisições GEDCOM X, redirects e tratamento de throttling;
- não interpreta erros HTTP pela aplicação — o cliente ainda precisa tratar status;
- recomenda cookies seguros, mas o projeto escolheu não salvar o access token.

Bruno é recomendado pela documentação como cliente para testes manuais. O Python SDK aparece como inativo e não foi escolhido.

## Recursos/endpoints usados ou preparados

| Função | Método e rota documentada | Estado |
|---|---|---|
| Pessoa raiz | `GET /platform/tree/current-person` | preparado |
| Pessoa | `GET /platform/tree/persons/{personId}` | preparado |
| Famílias/relações | `GET /platform/tree/persons/{personId}/families` | preparado |
| Fontes da pessoa | `GET /platform/tree/persons/{personId}/sources` | preparado |
| Memórias da pessoa | `GET /platform/tree/persons/{personId}/memories` | preparado |
| Busca de pessoas | `GET /platform/tree/search?q.name=...` | adaptador preparado; UI futura |

O inventário oficial também documenta recursos de pessoas, relações de casal e parentalidade, fontes, memórias, change history, matches, places, genealogies e user trees. A existência de um endpoint não significa que toda App Key possua acesso, nem que seja seguro ativá-lo sem revisão.

## AI agents e OpenAPI

O portal publicou um índice próprio para agentes em [`/main/llms.txt`](https://developers.familysearch.org/main/llms.txt). Ele lista guias em Markdown e a referência de endpoints gerada pela documentação OpenAPI. O arquivo é usado como índice de estudo, não como autorização para descobrir rotas privadas nem como dependência de execução.

## Compatibilidade

O processo oficial exige revisão para Beta/Production e afirma que a compatibilidade de leitura precede a de escrita. Mudanças que adicionem, alterem ou excluam dados exigem nova verificação. O checklist também exige proteção de tokens, SSL, login direto na página FamilySearch, não armazenamento de credenciais e gestão segura de dados/cache.

A documentação atual informa ainda que somente empresa ou organização sem fins lucrativos legalmente registrada é elegível para verificação e listagem na galeria de soluções. Isso é uma condição distinta do desenvolvimento local/mock e precisa ser esclarecida com Developer Support antes de apresentar o projeto como solução pública compatível.

## Fontes oficiais consultadas

- [API Resources](https://www.familysearch.org/en/developers/docs/api/resources)
- [Getting Started](https://developers.familysearch.org/main/docs/getting-started)
- [Tools & SDKs](https://developers.familysearch.org/main/docs/tools-sdks)
- [SDK JavaScript oficial](https://github.com/FamilySearch/fs-js-lite)
- [Authentication](https://developers.familysearch.org/main/docs/authentication)
- [Authorization Code Flow](https://developers.familysearch.org/main/docs/authorization-code-flow)
- [API Key Management](https://developers.familysearch.org/main/docs/api-key-management)
- [Compatibility Review Process](https://developers.familysearch.org/main/docs/compatibility-review-process)
- [Compatibility Checklist](https://developers.familysearch.org/main/docs/compatibility-checklist)
- [Data Formats](https://developers.familysearch.org/main/docs/data-formats)
- [Family Tree Data Model](https://developers.familysearch.org/main/docs/the-family-tree-data-model)
- [Persons](https://developers.familysearch.org/main/docs/persons)
- [Family Tree Search](https://developers.familysearch.org/main/docs/family-tree-search)
- [Contributing Sources](https://developers.familysearch.org/main/docs/contributing-sources)
- [Memories](https://developers.familysearch.org/main/docs/memories-dir)
- [Private Spaces and Data Access Control](https://developers.familysearch.org/main/docs/private-spaces-and-data-access-control)
- [Caching](https://developers.familysearch.org/main/docs/caching)
- [Throttling](https://developers.familysearch.org/main/docs/throttling)
- [HTTP Status Codes](https://developers.familysearch.org/main/docs/http-status-codes)
- [API Evolution](https://developers.familysearch.org/main/docs/api-evolution)
- [AI-agent documentation index](https://developers.familysearch.org/main/llms.txt)
