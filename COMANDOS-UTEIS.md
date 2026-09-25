# 🛠️ Comandos Úteis - Deploy e Manutenção

## 📦 Build e Deploy

### Gerar Build
```powershell
npm run build
```

### Build + Preview Local
```powershell
npm run build
npm run preview
```

### Build Completo com Script
```powershell
.\build-deploy.ps1
```

---

## 🚀 Upload para Servidor

### Via PowerShell (SCP)
```powershell
# Criar ZIP
Compress-Archive -Path dist\* -DestinationPath autoflix.zip

# Upload (substitua usuario e ip)
scp autoflix.zip usuario@seu-ip:/www/wwwroot/autoflix.com.br/

# Conectar SSH e descompactar
ssh usuario@seu-ip
cd /www/wwwroot/autoflix.com.br/
unzip -o autoflix.zip
rm autoflix.zip
```

### Via FileZilla/WinSCP
```
Host: seu-ip
Port: 22 (SFTP)
User: seu-usuario
Pass: sua-senha

Upload para: /www/wwwroot/autoflix.com.br/
```

---

## 🔧 Comandos SSH no Servidor

### Navegar até pasta do site
```bash
cd /www/wwwroot/autoflix.com.br/
```

### Ver logs em tempo real
```bash
# Logs de acesso
tail -f /www/wwwroot/autoflix.com.br/logs/access.log

# Logs de erro
tail -f /www/wwwroot/autoflix.com.br/logs/error.log

# Logs do Nginx
tail -f /www/server/nginx/logs/error.log
```

### Verificar e corrigir permissões
```bash
# Ver permissões atuais
ls -la

# Corrigir proprietário (www é o usuário do Nginx)
chown -R www:www /www/wwwroot/autoflix.com.br/

# Permissões corretas para arquivos
find /www/wwwroot/autoflix.com.br/ -type f -exec chmod 644 {} \;

# Permissões corretas para pastas
find /www/wwwroot/autoflix.com.br/ -type d -exec chmod 755 {} \;
```

### Nginx
```bash
# Testar configuração
nginx -t

# Recarregar configuração
nginx -s reload

# Reiniciar Nginx
systemctl restart nginx

# Status do Nginx
systemctl status nginx

# Ver configuração do site
cat /www/server/panel/vhost/nginx/autoflix.com.br.conf
```

### Limpar cache
```bash
# Limpar cache do Nginx (se configurado)
rm -rf /www/server/nginx/proxy_cache_dir/*

# Reiniciar para garantir
systemctl restart nginx
```

---

## 🔍 Diagnóstico de Problemas

### Verificar se site está acessível
```bash
curl -I https://autoflix.com.br
```

### Testar DNS
```bash
nslookup autoflix.com.br
dig autoflix.com.br
```

### Ver processos Nginx
```bash
ps aux | grep nginx
```

### Espaço em disco
```bash
df -h
du -sh /www/wwwroot/autoflix.com.br/
```

### Ver últimos erros
```bash
tail -100 /www/wwwroot/autoflix.com.br/logs/error.log
```

---

## 📊 Monitoramento

### Ver estatísticas de acesso
```bash
# Acessos hoje
grep $(date +%d/%b/%Y) /www/wwwroot/autoflix.com.br/logs/access.log | wc -l

# IPs únicos hoje
grep $(date +%d/%b/%Y) /www/wwwroot/autoflix.com.br/logs/access.log | awk '{print $1}' | sort -u | wc -l

# Páginas mais acessadas
awk '{print $7}' /www/wwwroot/autoflix.com.br/logs/access.log | sort | uniq -c | sort -rn | head -20
```

---

## 🔄 Atualização do Site

### Processo Completo
```powershell
# 1. No seu computador
npm run build

# 2. Criar backup no servidor (opcional)
ssh usuario@ip "cd /www/wwwroot && tar -czf autoflix-backup-$(date +%Y%m%d).tar.gz autoflix.com.br/"

# 3. Upload nova versão
scp -r dist/* usuario@ip:/www/wwwroot/autoflix.com.br/

# 4. Limpar cache
ssh usuario@ip "systemctl reload nginx"
```

### Rollback (voltar versão)
```bash
# No servidor
cd /www/wwwroot
tar -xzf autoflix-backup-20251029.tar.gz
systemctl reload nginx
```

---

## 🔐 SSL/HTTPS

### Verificar certificado
```bash
# Status do certificado
openssl s_client -connect autoflix.com.br:443 -servername autoflix.com.br | openssl x509 -noout -dates

# Ver detalhes completos
openssl s_client -connect autoflix.com.br:443 -servername autoflix.com.br
```

### Renovar Let's Encrypt (se necessário)
```bash
# Via aaPanel
# Website → autoflix.com.br → SSL → Renew

# Ou via terminal
certbot renew
```

---

## 📈 Performance

### Testar velocidade de carregamento
```bash
curl -o /dev/null -s -w 'Total: %{time_total}s\n' https://autoflix.com.br
```

### Testar compressão GZIP
```bash
curl -H "Accept-Encoding: gzip" -I https://autoflix.com.br
```

---

## 🗑️ Limpeza

### Limpar logs antigos (mais de 30 dias)
```bash
find /www/wwwroot/autoflix.com.br/logs/ -name "*.log" -mtime +30 -delete
```

### Limpar cache do npm (localmente)
```powershell
npm cache clean --force
```

---

## 🆘 Troubleshooting Rápido

### Site não carrega
```bash
# 1. Verificar se Nginx está rodando
systemctl status nginx

# 2. Ver logs
tail -50 /www/wwwroot/autoflix.com.br/logs/error.log

# 3. Testar configuração
nginx -t

# 4. Reiniciar
systemctl restart nginx
```

### 404 em rotas
```bash
# Verificar se try_files está configurado
grep "try_files" /www/server/panel/vhost/nginx/autoflix.com.br.conf

# Deve ter: try_files $uri $uri/ /index.html;
```

### Permissões negadas
```bash
# Corrigir tudo de uma vez
cd /www/wwwroot/autoflix.com.br/
chown -R www:www *
chmod -R 755 .
find . -type f -exec chmod 644 {} \;
```

---

## 📝 Aliases Úteis (Opcional)

Adicione ao `~/.bashrc` para facilitar:

```bash
# Aliases para autoflix
alias autoflix-cd='cd /www/wwwroot/autoflix.com.br/'
alias autoflix-logs='tail -f /www/wwwroot/autoflix.com.br/logs/error.log'
alias autoflix-access='tail -f /www/wwwroot/autoflix.com.br/logs/access.log'
alias autoflix-reload='nginx -t && nginx -s reload'
alias autoflix-backup='cd /www/wwwroot && tar -czf autoflix-backup-$(date +%Y%m%d-%H%M).tar.gz autoflix.com.br/'
```

Depois execute:
```bash
source ~/.bashrc
```

Agora pode usar:
```bash
autoflix-cd
autoflix-logs
autoflix-reload
```

---

🎯 **Dica**: Guarde este arquivo para consultas rápidas!
