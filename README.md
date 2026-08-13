# Ancestral Research Lab

Aplicação web local, gratuita e orientada por evidências para investigação genealógica. Funciona agora em modo demonstrativo, sem conta, App Key, banco de dados ou serviço pago. Quando uma App Key do FamilySearch estiver disponível, a mesma interface poderá ler dados autorizados da árvore por OAuth 2.0.

> Estado: versão inicial `0.1.0`. A integração real não foi executada porque ainda não há App Key/callback liberados. Nenhuma escrita no FamilySearch foi implementada.

## VISÃO RÁPIDA

| Área | Sem App Key | Com App Key autorizada |
|---|---:|---:|
| Painel e ficha individual | ✅ | ✅ |
| Análise local de lacunas | ✅ | ✅ |
| Notas e referências DGS manuais | ✅ | ✅ |
| Exportação JSON local | ✅ | ✅ |
| Pessoa raiz, família, fatos e fontes | dados demonstrativos | leitura oficial |
| Memórias permitidas | dados demonstrativos | leitura oficial |
| Busca no FamilySearch | — | adaptador preparado |
| Escrita no FamilySearch | 🚫 desativada | 🚫 desativada |
| DGS/imagens históricas automatizadas | 🚫 | 🚫 |

## O que foi construído

- painel visual de investigação e métricas do recorte atual;
- seleção local de pessoa por nome, variante ou identificador;
- ficha individual, cronologia e mapa de relações próximas;
- matriz de fatos, fontes, força da evidência e pendências;
- alertas locais para fatos sem fonte, relações não sustentadas, datas aproximadas, lugares ausentes e variantes nominais;
- notas de pesquisa classificadas como fato, relato, indício, hipótese, contradição ou não confirmado;
- exportação explícita da pesquisa em JSON;
- módulo manual de referências DGS/imagens, sem scraping ou endpoints privados;
- adaptador isolado para o SDK oficial `fs-js-lite` 3.0.0, OAuth Authorization Code + `state` + PKCE e leitura dos endpoints documentados;
- armazenamento local para pesquisas mock e armazenamento apenas de sessão para dados importados do FamilySearch;
- testes automatizados sem dependências externas.

## Como rodar no Windows

Requisito: Node.js 20 ou superior. O runtime do Codex já atende a esse requisito no ambiente de desenvolvimento.

No Windows, dê duplo clique em `INICIAR_ANCESTRAL_RESEARCH_LAB.cmd`. Mantenha a janela aberta durante o uso; para parar, pressione `Ctrl+C` ou feche a janela.

Alternativamente:

```powershell
npm start
```

Abra [http://localhost:4173](http://localhost:4173). Não é necessário executar `npm install`: a aplicação não possui dependências de build.

Para verificar:

```powershell
npm test
npm run check
```

## Configuração futura da App Key

Há duas formas seguras:

1. abrir **Configurar** e informar a App Key; ela permanece apenas na sessão atual; ou
2. copiar `config.example.js` para `config.local.js`, preencher localmente e nunca enviar esse arquivo ao Git.

O callback padrão é `http://localhost:4173/`, mas ele precisa estar exatamente registrado para a App Key pelo FamilySearch. Ambientes e chaves são geridos separadamente; uma chave de Beta não implica acesso a Production.

Não coloque no código, no GitHub ou em exports:

- senha FamilySearch;
- access token ou refresh token;
- client secret ou chave privada;
- chave Gemini ou de outro provedor de IA.

## Limites deliberados

- A aplicação não acessa DGS, grupos de imagens ou imagens históricas por meios não documentados.
- Não há scraping, automação do DOM do FamilySearch, bypass, download em massa ou endpoint privado.
- O módulo DGS registra apenas referências inseridas pela pesquisadora.
- A busca FamilySearch e a leitura real dependem de App Key, callback e permissões válidas.
- Dados de pessoas vivas exigem proteção especial e não devem ser publicados em exportações.
- A análise automática aponta pendências; ela não prova identidade, filiação ou parentesco.

## Documentação do projeto

- [Arquitetura](docs/ARCHITECTURE.md)
- [Notas técnicas FamilySearch](docs/FAMILYSEARCH_TECHNICAL_NOTES.md)
- [Segurança e privacidade](docs/SECURITY.md)
- [Modelo de evidências](docs/EVIDENCE_MODEL.md)
- [Roadmap](docs/ROADMAP.md)

## Fontes técnicas

Para a integração FamilySearch foram usadas exclusivamente fontes oficiais do FamilySearch, listadas e relacionadas às decisões em [docs/FAMILYSEARCH_TECHNICAL_NOTES.md](docs/FAMILYSEARCH_TECHNICAL_NOTES.md).

## Uso e custo

Projeto pessoal, não comercial e de custo zero. O modo local não envia dados a serviços externos. Uma integração futura com Gemini será opcional, desativada por padrão e deverá usar configuração local nunca versionada.
