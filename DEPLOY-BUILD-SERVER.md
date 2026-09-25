# 🚀 GUIA: Deploy com Build no Servidor

## 📋 Pré-requisitos

1. **Node.js instalado no servidor**
   - aaPanel > App Store > Node.js > Install
   - Ou via SSH: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`

2. **Nginx configurado** ✅ (já feito)

## 🛠️ Processo Manual (Recomendado)

### Passo 1: Preparar Estrutura no Servidor
```bash
# Via aaPanel File Manager ou SSH
cd /www/wwwroot/autoflix.com.br
mkdir -p source
```

### Passo 2: Upload dos Arquivos Fonte
Faça upload via aaPanel File Manager para `/www/wwwroot/autoflix.com.br/source/`:

**📁 Pastas obrigatórias:**
- `src/` (todo o código React)
- `public/` (arquivos estáticos)

**📄 Arquivos obrigatórios:**
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `components.json`
- `eslint.config.js`
- `index.html`

### Passo 3: Executar Build no Servidor
Via aaPanel Terminal ou SSH:

```bash
# Navegar para o código fonte
cd /www/wwwroot/autoflix.com.br/source

# Verificar Node.js
node --version
npm --version

# Limpar instalações anteriores
rm -rf node_modules dist package-lock.json

# Instalar dependências
npm install

# Executar build
npm run build

# Mover build para produção
cd /www/wwwroot/autoflix.com.br
rm -rf dist-backup-old
mv dist dist-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
mv source/dist ./dist

# Limpar node_modules (economizar espaço)
rm -rf source/node_modules

# Recarregar Nginx
nginx -s reload
```

## 🎯 Processo Automatizado

1. **Upload do script:**
   ```bash
   # Fazer upload do arquivo deploy-server.sh para o servidor
   ```

2. **Executar script:**
   ```bash
   cd /www/wwwroot/autoflix.com.br
   chmod +x deploy-server.sh
   ./deploy-server.sh
   ```

## ✅ Verificação Final

1. **Site funcionando:** https://autoflix.com.br
2. **Admin acessível:** https://autoflix.com.br/admin
3. **Teste XML:** Deve encontrar 60 veículos
4. **Sincronização:** Deve funcionar sem erro CORS

## 🐛 Troubleshooting

### Node.js não encontrado
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### Erro de permissões
```bash
# Corrigir permissões
chown -R www:www /www/wwwroot/autoflix.com.br
chmod -R 755 /www/wwwroot/autoflix.com.br
```

### Build falha
- Verifique espaço em disco: `df -h`
- Verifique memória: `free -h`
- Verifique logs do npm para erros específicos

## 📊 Vantagens desta Abordagem

1. ✅ **Nomes consistentes:** Build sempre gera os mesmos nomes de arquivo
2. ✅ **Sem conflicts:** Não há conflito entre builds locais e remotos
3. ✅ **Otimizado:** Build é otimizado para o ambiente de produção
4. ✅ **Backup automático:** Versão anterior sempre preservada
5. ✅ **Limpeza automática:** Remove arquivos desnecessários

---

**🎯 Próximo passo:** Execute o processo manual ou use o script automatizado!