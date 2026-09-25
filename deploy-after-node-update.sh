#!/bin/bash

echo "🚀 DEPLOY APÓS ATUALIZAÇÃO DO NODE.JS"
echo "======================================"
echo ""

# Verificar Node.js
NODE_VERSION=$(node --version)
echo "📌 Node.js: $NODE_VERSION"
echo ""

cd /www/wwwroot/autoflix.com.br

# 1. Limpar e reinstalar frontend
echo "📦 1. REINSTALANDO DEPENDÊNCIAS DO FRONTEND..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

# 2. Build frontend
echo ""
echo "🏗️  2. COMPILANDO FRONTEND..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar frontend"
    exit 1
fi

echo "✅ Frontend compilado com sucesso!"
echo ""

# 3. Verificar pasta dist
if [ -d "dist" ]; then
    echo "📁 Pasta dist/ criada:"
    ls -lh dist/ | head -10
else
    echo "❌ Pasta dist/ não foi criada!"
    exit 1
fi

# 4. Backend
echo ""
echo "📦 3. REINSTALANDO DEPENDÊNCIAS DO BACKEND..."
cd server
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

echo "✅ Backend atualizado!"
cd ..

# 5. Criar pastas necessárias
echo ""
echo "📂 4. CRIANDO ESTRUTURA DE PASTAS..."
mkdir -p server/data server/logs server/public dist public
chmod -R 775 server/data server/logs server/public

# 6. Copiar arquivos importantes para dist
if [ -f "public/sitemap.xml" ]; then
    cp public/sitemap.xml dist/sitemap.xml 2>/dev/null
    cp public/sitemap.xml server/public/sitemap.xml 2>/dev/null
fi

if [ -f "public/force-update.html" ]; then
    cp public/force-update.html dist/force-update.html 2>/dev/null
    echo "✅ Página de atualização forçada copiada"
fi

# 7. Ajustar permissões
echo ""
echo "🔒 5. AJUSTANDO PERMISSÕES..."
chown -R www:www . 2>/dev/null || chown -R www-data:www-data . 2>/dev/null || echo "⚠️  Ajuste as permissões manualmente"

# 8. Reiniciar servidor
echo ""
echo "🔄 6. REINICIANDO SERVIDOR..."

if command -v pm2 &> /dev/null; then
    pm2 restart autoflix-server 2>/dev/null || pm2 start server/src/server.js --name autoflix-server
    pm2 save
    echo "✅ Servidor reiniciado com PM2"
else
    echo "⚠️  PM2 não encontrado. Reinicie o servidor manualmente:"
    echo "   cd /www/wwwroot/autoflix.com.br/server"
    echo "   node src/server.js"
fi

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo ""
echo "🔍 VERIFICAÇÕES:"
echo "   • Frontend: https://autoflix.com.br"
echo "   • API: https://api.autoflix.com.br/api/vehicles"
echo "   • Forçar Atualização: https://autoflix.com.br/force-update.html"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Acesse: https://autoflix.com.br/force-update.html"
echo "   2. Clique em 'Limpar Cache e Atualizar'"
echo "   3. Aguarde o redirecionamento automático"
