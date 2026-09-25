# 🚀 Guia de Deploy - aaPanel

## 📋 Pré-requisitos

### No seu servidor (aaPanel):
- [ ] Node.js 18+ instalado
- [ ] Nginx configurado
- [ ] Domínio apontado: autoflix.com.br
- [ ] SSL (Let's Encrypt) configurado

---

## 🛠️ PASSO 1: Preparar o Projeto Localmente

### 1.1 - Build do Projeto

No seu computador, execute:

```powershell
# Instalar dependências (se ainda não instalou)
npm install

# Criar build de produção
npm run build
```

Isso vai gerar a pasta `dist/` com todos os arquivos prontos para produção.

### 1.2 - Verificar Build

Teste localmente se o build funcionou:

```powershell
npm run preview
```

Acesse: http://localhost:4173

---

## 📦 PASSO 2: Preparar Arquivos para Upload

### 2.1 - Arquivos que você VAI enviar:

```
dist/                  ← Pasta completa do build
public/               ← Arquivos estáticos (se não estiverem no dist)
  ├── favicon.ico
  ├── ponto.png
  ├── xis.svg
  ├── robots.txt
  ├── sitemap.xml
  └── vehicles-data.json
```

### 2.2 - Arquivos que você NÃO precisa enviar:

```
❌ node_modules/
❌ src/
❌ .git/
❌ package.json (opcional)
❌ vite.config.ts
❌ *.md (arquivos de documentação)
```

---

## 🌐 PASSO 3: Configurar aaPanel

### 3.1 - Criar Site no aaPanel

1. **Login no aaPanel**
   - Acesse: `http://seu-servidor:7800`
   - Login com suas credenciais

2. **Criar Novo Site**
   - Menu: `Website` → `Add Site`
   - **Domain**: `autoflix.com.br`
   - **Domain (www)**: `www.autoflix.com.br`
   - **Document Root**: `/www/wwwroot/autoflix.com.br`
   - **PHP Version**: `Static HTML` ou `Pure Static`
   - Clique em `Submit`

### 3.2 - Configurar SSL (HTTPS)

1. **Instalar Let's Encrypt**
   - Vá em `Website` → Encontre `autoflix.com.br` → `SSL`
   - Clique em `Let's Encrypt`
   - Selecione: `autoflix.com.br` e `www.autoflix.com.br`
   - Clique em `Apply`
   - Aguarde certificado ser emitido

2. **Forçar HTTPS**
   - Marque: `Force HTTPS`
   - Salve

---

## 📤 PASSO 4: Upload dos Arquivos

### Método 1: Via FTP/SFTP (Recomendado)

1. **Usar FileZilla ou WinSCP**
   - Host: seu-servidor-ip
   - Porta: 21 (FTP) ou 22 (SFTP)
   - Usuário e senha do aaPanel

2. **Navegar até a pasta**
   ```
   /www/wwwroot/autoflix.com.br/
   ```

3. **Upload**
   - Enviar TODO o conteúdo da pasta `dist/`
   - Garantir que `index.html` está na raiz
   - Enviar `robots.txt` e `sitemap.xml`

### Método 2: Via aaPanel File Manager

1. **Acessar File Manager**
   - Menu: `Files`
   - Navegar: `/www/wwwroot/autoflix.com.br/`

2. **Upload**
   - Clique em `Upload`
   - Selecione os arquivos da pasta `dist/`
   - Aguarde upload completar

### Método 3: Via Terminal/SSH

1. **Zipar o build localmente**
   ```powershell
   # No seu computador (pasta do projeto)
   Compress-Archive -Path dist\* -DestinationPath autoflix-build.zip
   ```

2. **Upload via SCP**
   ```powershell
   scp autoflix-build.zip usuario@seu-servidor:/www/wwwroot/autoflix.com.br/
   ```

3. **Descompactar no servidor**
   ```bash
   cd /www/wwwroot/autoflix.com.br/
   unzip autoflix-build.zip
   rm autoflix-build.zip
   ```

---

## ⚙️ PASSO 5: Configurar Nginx

### 5.1 - Configuração para SPA (Single Page Application)

No aaPanel:
1. **Website** → `autoflix.com.br` → **Config File**
2. Encontre a seção `location /`
3. Adicione as configurações abaixo:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name autoflix.com.br www.autoflix.com.br;
    
    # SSL configurado pelo aaPanel
    ssl_certificate /www/server/panel/vhost/cert/autoflix.com.br/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/autoflix.com.br/privkey.pem;
    
    root /www/wwwroot/autoflix.com.br;
    index index.html;
    
    # Logs
    access_log /www/wwwroot/autoflix.com.br/logs/access.log;
    error_log /www/wwwroot/autoflix.com.br/logs/error.log;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json image/svg+xml;
    
    # CORREÇÃO: MIME Types para arquivos TypeScript/React
    location ~* \.(tsx|ts|jsx)$ {
        add_header Content-Type "application/javascript; charset=utf-8";
        add_header Access-Control-Allow-Origin "*";
        expires 1M;
    }
    
    # Cache para assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # CORREÇÃO: Favicon
    location = /favicon.ico {
        try_files $uri /public/favicon.ico /favicon.ico =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        log_not_found off;
        access_log off;
    }
    
    # SPA - Redirecionar tudo para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Robots.txt e sitemap.xml
    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }
    
    location = /sitemap.xml {
        allow all;
        log_not_found off;
        access_log off;
    }
    
    # Segurança - Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(json)$ {
        # Permitir apenas vehicles-data.json
        location = /vehicles-data.json {
            allow all;
        }
        deny all;
    }
}
```

3. **Salvar e Recarregar Nginx**
   - Clique em `Save`
   - Menu: `App Store` → `Nginx` → `Reload`

---

## 🔧 CORREÇÕES DE PROBLEMAS COMUNS

### Problema 1: MIME Type Incorreto (.tsx files)
**Erro**: `Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"`

**Solução**: Adicionado no Nginx acima:
```nginx
location ~* \.(tsx|ts|jsx)$ {
    add_header Content-Type "application/javascript; charset=utf-8";
    add_header Access-Control-Allow-Origin "*";
    expires 1M;
}
```

### Problema 2: Favicon 404
**Erro**: `Failed to load resource: the server responded with a status of 404 (/favicon.ico)`

**Solução**: Adicionado no Nginx acima:
```nginx
location = /favicon.ico {
    try_files $uri /public/favicon.ico /favicon.ico =404;
    expires 1y;
    add_header Cache-Control "public, immutable";
    log_not_found off;
    access_log off;
}
```

### Problema 3: Preload CORS Warning
**Erro**: `A preload for 'https://autoflix.com.br/src/main.tsx' is found, but is not used because the request credentials mode does not match`

**Solução**: Adicionado CORS headers nos assets e verificar se o favicon existe no diretório correto.

---

## ✅ PASSO 6: Verificar Deploy

### 6.1 - Testes Importantes

1. **Página Principal**
   ```
   https://autoflix.com.br
   ```
   - [ ] Site carrega corretamente
   - [ ] Veículos aparecem
   - [ ] Imagens carregam

2. **Páginas de Veículos**
   ```
   https://autoflix.com.br/veiculo/[slug-qualquer]
   ```
   - [ ] Página do veículo carrega
   - [ ] Não dá erro 404

3. **Página de Contato**
   ```
   https://autoflix.com.br/contato
   ```

4. **Verificar Arquivos Específicos**
   ```
   https://autoflix.com.br/favicon.ico - deve carregar o ícone
   https://autoflix.com.br/robots.txt - deve carregar o arquivo
   https://autoflix.com.br/sitemap.xml - deve carregar o sitemap
   ```

5. **Verificar Console do Navegador (F12)**
   - [ ] Não deve ter erros de MIME type
   - [ ] Não deve ter erro 404 do favicon
   - [ ] Warnings de CORS devem desaparecer
   - [ ] Mapas carregam
   - [ ] Botões do WhatsApp funcionam

4. **HTTPS**
   - [ ] Cadeado verde no navegador
   - [ ] Certificado válido

5. **SEO**
   ```
   https://autoflix.com.br/robots.txt
   https://autoflix.com.br/sitemap.xml
   ```
   - [ ] Arquivos acessíveis

### 6.2 - Testar em Dispositivos

- [ ] Desktop (Chrome, Firefox, Edge)
- [ ] Mobile (Android/iOS)
- [ ] Tablet

---

## 🔧 PASSO 7: Configurações Pós-Deploy

### 7.1 - Google Search Console

1. Acesse: https://search.google.com/search-console
2. Adicione propriedade: `https://autoflix.com.br`
3. Verifique via Google Analytics
4. Envie sitemap: `https://autoflix.com.br/sitemap.xml`

### 7.2 - Monitoramento

1. **Google Analytics**
   - Verifique se está recebendo dados
   - Analytics ID: G-VEYHZYGFCF

2. **Google Tag Manager**
   - Teste se eventos estão sendo enviados
   - GTM ID: GTM-KH8ZDRGN

### 7.3 - Performance

Teste velocidade:
- https://pagespeed.web.dev/
- Digite: `https://autoflix.com.br`

---

## 🚨 Troubleshooting

### Problema: Site não carrega

**Solução:**
1. Verificar se `index.html` está na raiz
2. Verificar permissões: `chmod 755` nas pastas, `644` nos arquivos
3. Verificar logs: `/www/wwwroot/autoflix.com.br/logs/error.log`

### Problema: Rotas dão 404

**Solução:**
- Verificar configuração do Nginx (try_files)
- Recarregar Nginx

### Problema: Imagens não carregam

**Solução:**
1. Verificar se pasta `assets/` foi enviada
2. Verificar caminhos das imagens
3. Verificar permissões

### Problema: HTTPS não funciona

**Solução:**
1. Verificar se certificado foi emitido
2. Verificar se domínio está apontando corretamente
3. Aguardar propagação DNS (até 48h)

---

## 📱 PASSO 8: Atualização Futura

### Para atualizar o site:

1. **No seu computador:**
   ```powershell
   npm run build
   ```

2. **Upload nova pasta `dist/`**
   - Via FTP/SFTP
   - Substituir arquivos antigos

3. **Limpar cache (opcional):**
   - Ctrl + Shift + R no navegador
   - Ou usar Cloudflare para purge

---

## 📊 Checklist Final

### Antes de Considerar Deploy Completo:

- [ ] Site acessível via HTTPS
- [ ] Todas as páginas funcionando
- [ ] Imagens carregando
- [ ] WhatsApp funcionando
- [ ] Formulários funcionando
- [ ] Google Maps funcionando
- [ ] Responsivo mobile/desktop
- [ ] SSL válido
- [ ] robots.txt acessível
- [ ] sitemap.xml acessível
- [ ] Google Analytics funcionando
- [ ] Google Tag Manager funcionando
- [ ] Google Search Console configurado

---

## 🎉 Pronto!

Seu site está no ar em: **https://autoflix.com.br**

### Próximos Passos:

1. ✅ Testar todas as funcionalidades
2. ✅ Configurar Google Search Console
3. ✅ Compartilhar nas redes sociais
4. ✅ Atualizar Google My Business
5. ✅ Começar a divulgar!

---

**Dúvidas?** Consulte a documentação do aaPanel: https://www.aapanel.com/

**Suporte:** Em caso de problemas, verifique os logs do Nginx e do site.
