# Repositório e configuração local

Repositório: git@github.com:falasque/autoflix.git
Branch: main
Cópia de código no servidor: /opt/autoflix

## Desenvolvimento

1. Instale as dependências com `npm ci` e `npm --prefix server ci`.
2. Copie `.env.example` para `.env.local` e `server/.env.example` para `server/.env`.
3. Preencha as configurações locais. Os arquivos `.env`, bancos SQLite, logs e dependências não são versionados.
4. Execute `npm run dev` e, em outro terminal, `npm --prefix server start`.

O login legado do frontend usa VITE_ADMIN_PASSWORD_HASH e VITE_ADMIN_STORAGE_KEY.
Esses valores são incorporados ao JavaScript pelo Vite e ficam acessíveis ao navegador.
A API usa ADMIN_PASSWORD_HASH no seu ambiente. Retirar os valores do Git não substitui
uma futura revisão do mecanismo de autenticação.

## Git no servidor

A cópia em /opt/autoflix serve para manter o código-fonte sincronizado:

```sh
cd /opt/autoflix
git pull --ff-only origin main
```

Esse comando atualiza o código dessa pasta. Não publica automaticamente o site,
não altera os serviços existentes e não migra bancos de dados.
