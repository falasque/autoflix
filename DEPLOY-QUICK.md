# 🚀 Deploy Rápido - aaPanel

## 📝 Resumo para Deploy Rápido

### 1️⃣ No Seu Computador

```powershell
# Execute o script de build
.\build-deploy.ps1
```

Isso vai:
- ✅ Gerar pasta `dist/`
- ✅ Criar arquivo ZIP
- ✅ Preparar tudo para upload

### 2️⃣ No aaPanel

1. **Login**: `http://seu-servidor:7800`

2. **Criar Site**:
   - Website → Add Site
   - Domain: `autoflix.com.br`
   - Root: `/www/wwwroot/autoflix.com.br`

3. **Configurar SSL**:
   - SSL → Let's Encrypt
   - Apply → Force HTTPS

4. **Upload**:
   - Files → `/www/wwwroot/autoflix.com.br/`
   - Upload o arquivo ZIP
   - Extract (descompactar)

5. **Configurar Nginx**:
   - Website → autoflix.com.br → Config File
   - Cole o conteúdo de `nginx-config.conf`
   - Save → Reload Nginx

### 3️⃣ Testar

Acesse: `https://autoflix.com.br`

✅ **Pronto!**

---

## 📁 Estrutura Final no Servidor

```
/www/wwwroot/autoflix.com.br/
├── index.html              ← Página principal
├── assets/                 ← JS, CSS, imagens
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── cars/               ← Fotos dos veículos
├── favicon.ico
├── ponto.png
├── xis.svg
├── robots.txt
├── sitemap.xml
└── vehicles-data.json
```

---

## ✅ Checklist Rápido

- [ ] Build gerado (`dist/` existe)
- [ ] Site criado no aaPanel
- [ ] SSL configurado e funcionando
- [ ] Arquivos enviados e descompactados
- [ ] Nginx configurado (SPA support)
- [ ] Nginx recarregado
- [ ] Site acessível via HTTPS
- [ ] Todas as páginas funcionam
- [ ] WhatsApp funciona
- [ ] Mapas carregam

---

## 🆘 Problemas Comuns

### Site dá 404 nas rotas
➡️ **Solução**: Verificar configuração Nginx (try_files)

### Imagens não carregam
➡️ **Solução**: Verificar se pasta `assets/` foi enviada

### HTTPS não funciona
➡️ **Solução**: Aguardar DNS propagar (até 48h)

### CSS/JS não carrega
➡️ **Solução**: Limpar cache (Ctrl+Shift+R)

---

## 📞 Comandos Úteis SSH

```bash
# Ver logs de erro
tail -f /www/wwwroot/autoflix.com.br/logs/error.log

# Verificar permissões
ls -la /www/wwwroot/autoflix.com.br/

# Corrigir permissões
cd /www/wwwroot/autoflix.com.br/
chown -R www:www *
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Recarregar Nginx
nginx -t
nginx -s reload
```

---

## 📚 Documentação Completa

- **Guia Detalhado**: `DEPLOY-AAPANEL.md`
- **Configuração Nginx**: `nginx-config.conf`
- **Script de Build**: `build-deploy.ps1`

---

🎉 **Seu site estará no ar em minutos!**
