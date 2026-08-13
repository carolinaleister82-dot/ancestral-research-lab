# Roadmap

## ✅ Versão 0.1 — concluída

- painel local e responsivo;
- pessoa, relações, fatos, fontes e memórias no modelo;
- matriz de evidências e alertas;
- notas e exportação;
- placeholder DGS manual;
- OAuth/App Key preparado;
- integração somente leitura preparada;
- testes e documentação.

## ⏳ Após receber App Key

1. registrar e confirmar callback Integration;
2. testar OAuth com conta da usuária;
3. validar pessoa raiz, famílias, fontes e memórias com respostas reais;
4. ajustar o mapeador a campos reais e redirects/merges observados;
5. testar limites, 401, 403, 404, 410 e 429;
6. documentar quais leituras foram efetivamente autorizadas.

## 🔍 Depois da validação de leitura

- busca FamilySearch na interface, com seleção explícita;
- comparação lado a lado entre fatos da árvore e fontes;
- importação/exportação GEDCOM X local;
- relatório de investigação em HTML/PDF;
- extensão auxiliar mínima, sem injeção no FamilySearch;
- Gemini opcional para resumir fontes já selecionadas pela usuária.

## 🚫 Bloqueado por política/autorização

- automação de DGS ou imagens históricas: aguardar Records Access;
- escrita FamilySearch: aguardar App Key, permissões e revisão de compatibilidade;
- uso de endpoints não documentados: não será implementado.

