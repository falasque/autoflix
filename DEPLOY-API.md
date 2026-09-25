# 🚀 AUTOFLIX - Instruções de Deploy da API

## 📋 Checklist de Deploy

### 1. Upload da API para o Servidor

**Faça upload dos arquivos da pasta `api/` para:**
```
/www/wwwroot/cron.autoflix.com.br/
```

**Estrutura final no servidor:**
```
/www/wwwroot/cron.autoflix.com.br/
├── index.php          # API principal
├── .htaccess          # Configuração Apache
├── sync.sh            # Script de sincronização
├── README.md          # Documentação
├── vehicles.db        # Banco SQLite (será criado automaticamente)
├── sync.log           # Logs (será criado automaticamente)
└── cron.log          # Logs do cron (será criado automaticamente)
```

### 2. Configuração de Permissões

**Execute no terminal do aaPanel:**
```bash
cd /www/wwwroot/cron.autoflix.com.br/
chmod +x sync.sh
chmod 755 ./
chmod 644 index.php
chmod 644 .htaccess
chmod 644 README.md
```

### 3. Teste da API

**Teste se a API está funcionando:**
```bash
# Teste básico
curl https://cron.autoflix.com.br/api

# Teste de sincronização
curl https://cron.autoflix.com.br/api/sync

# Teste de estatísticas
curl https://cron.autoflix.com.br/api/stats
```

### 4. Configuração do Cron Job

**No aaPanel > Cron:**
- **Nome**: `AUTOFLIX - Sincronização Automática`
- **Tipo**: `Shell Script`
- **Período**: `A cada hora (0 * * * *)`
- **Script**: `/www/wwwroot/cron.autoflix.com.br/sync.sh`
- **Status**: `Ativado`

### 5. Deploy do Frontend Atualizado

**Execute no terminal local do projeto:**
```bash
# O build já foi feito, agora execute no servidor
cd /www/wwwroot/autoflix.com.br
./deploy-server.sh
```

**Ou manualmente no servidor:**
```bash
cd /www/wwwroot/autoflix.com.br
npm install
npm run build
```

---

## 🔧 Como o Sistema Funciona

### Fluxo de Dados:
1. **Cron Job** executa `sync.sh` a cada hora
2. **sync.sh** chama `https://cron.autoflix.com.br/api/sync`
3. **API** busca XML da RevendaMais
4. **API** processa e armazena dados no SQLite
5. **Frontend** busca dados da API (cache de 5min)
6. **Fallback** para sistema XML direto se API falhar

### URLs da API:
- **Veículos**: `https://cron.autoflix.com.br/api`
- **Sincronização**: `https://cron.autoflix.com.br/api/sync`
- **Estatísticas**: `https://cron.autoflix.com.br/api/stats`
- **Logs**: `https://cron.autoflix.com.br/api/logs`

### XML Configurado:
```
https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml
```

---

## 📊 Monitoramento

### Logs do Cron:
```bash
tail -f /www/wwwroot/cron.autoflix.com.br/cron.log
```

### Logs da API:
```bash
tail -f /www/wwwroot/cron.autoflix.com.br/sync.log
```

### Status via API:
```bash
curl https://cron.autoflix.com.br/api/stats
```

---

## 🎯 Resultado Esperado

Após o deploy completo:

✅ **API funcionando** em `https://cron.autoflix.com.br/api`
✅ **Cron sincronizando** a cada hora automaticamente
✅ **Frontend atualizado** usando API com fallback
✅ **Sistema robusto** com logs e monitoramento
✅ **Cache otimizado** (5min API, 24h fallback)

---

## 🚨 Troubleshooting

### Se a API não funcionar:
1. Verifique permissões dos arquivos
2. Confirme se o PHP está habilitado
3. Teste a URL diretamente no navegador

### Se o cron não executar:
1. Verifique se `sync.sh` tem permissão de execução
2. Teste o script manualmente
3. Verifique logs do aaPanel

### Se o frontend não carregar dados:
1. Abra Console do Navegador (F12)
2. Verifique se há erros de API
3. O sistema deve usar fallback automaticamente

---

**🚗 Sistema pronto para produção!**