#!/bin/bash
# Script para Build Direto no Servidor (aaPanel)
# Execute este script dentro do aaPanel File Manager Terminal

echo "🚀 AUTOFLIX - Build no Servidor"
echo "================================="

# Configurações
PROJECT_PATH="/www/wwwroot/autoflix.com.br"
DIST_PATH="$PROJECT_PATH/dist"

echo "📍 Caminho do projeto: $PROJECT_PATH"
echo "🏗️ Build final: $DIST_PATH"
echo ""

# Navega para o diretório do projeto
cd "$PROJECT_PATH" || exit 1

echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "💡 Instale Node.js no aaPanel:"
    echo "   1. aaPanel > App Store > Node.js > Install"
    echo "   2. Ou via terminal: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js: $NODE_VERSION"
echo "✅ NPM: $NPM_VERSION"
echo ""

echo "📦 Verificando arquivos do projeto..."

# Verifica arquivos essenciais no diretório raiz do projeto
ESSENTIAL_FILES=("package.json" "vite.config.ts" "src" "public")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -e "$PROJECT_PATH/$file" ]; then
        echo "❌ Arquivo/pasta essencial não encontrado: $file"
        echo "💡 Certifique-se de que todos os arquivos do projeto estão em: $PROJECT_PATH"
        echo "   Arquivos necessários: src/, public/, package.json, vite.config.ts, etc."
        exit 1
    fi
done

echo "✅ Arquivos essenciais encontrados"
echo ""

# Já estamos no diretório do projeto
# cd "$PROJECT_PATH" já foi executado anteriormente

echo "🧹 Limpando instalações anteriores..."
rm -rf node_modules
rm -rf dist
rm -f package-lock.json

echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro na instalação das dependências!"
    echo "💡 Verifique:"
    echo "   1. Conexão com internet"
    echo "   2. Permissões de escrita"
    echo "   3. Espaço em disco"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"
echo ""

echo "🏗️ Executando build de produção..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    echo "💡 Verifique os logs acima para detalhes do erro"
    exit 1
fi

echo "✅ Build concluído com sucesso"
echo ""

echo "🔄 Substituindo arquivos de produção..."
# Backup da versão atual (se existir)
if [ -d "$DIST_PATH" ]; then
    BACKUP_NAME="dist-backup-$(date +%Y%m%d-%H%M%S)"
    echo "📦 Criando backup: $BACKUP_NAME"
    mv "$DIST_PATH" "$PROJECT_PATH/$BACKUP_NAME"
fi

# O build já está na pasta correta (dist/ foi criado no local certo)
echo "✅ Arquivos de produção atualizados"
echo ""

echo "🧹 Limpeza final..."
cd "$PROJECT_PATH"
rm -rf node_modules  # Remove node_modules para economizar espaço

echo "🔄 Testando Nginx..."
nginx -t && nginx -s reload

echo ""
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================="
echo "🌐 Site: https://autoflix.com.br"
echo "🔧 Admin: https://autoflix.com.br/admin"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse o painel admin"
echo "   2. Teste 'Sincronizar Agora'"
echo "   3. Verifique se os 60 veículos são carregados"
echo ""
echo "📊 Informações do build:"
echo "   ├── Projeto: $PROJECT_PATH"
echo "   ├── Arquivos produção: $DIST_PATH"
echo "   └── Node.js: $NODE_VERSION"
echo ""