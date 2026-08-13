# Segurança e privacidade

## Controles implementados

- nenhuma senha, token ou chave real versionada;
- App Key digitada na interface mantida em `sessionStorage`;
- access token mantido apenas na memória do SDK (`saveAccessToken: false`);
- verificador PKCE e `state` apenas na sessão e apagados após o callback;
- dados importados do FamilySearch mantidos apenas em `sessionStorage`;
- saída HTML proveniente de dados escapada antes da renderização;
- servidor local restrito a `127.0.0.1`, com `no-store`, `nosniff` e política sem referer;
- escrita FamilySearch desabilitada e sem métodos de mutação no adaptador;
- exportação exige ação do usuário e inclui aviso de privacidade.

## Responsabilidade da pesquisadora

- não publicar dados de pessoas vivas;
- revisar o JSON antes de compartilhar;
- registrar callback OAuth exato e usar HTTPS fora de localhost;
- revogar/rotacionar uma credencial exposta;
- não colar chaves no GitHub, issues, prints ou relatórios.

## IA opcional

Não há integração de IA nesta versão. Uma futura integração Gemini deverá:

- ser opt-in por análise;
- mostrar exatamente quais dados serão enviados;
- excluir pessoas vivas por padrão;
- guardar a chave apenas fora do repositório;
- tratar a resposta como sugestão/inferência, nunca como fato;
- proibir qualquer escrita automática no FamilySearch.

