#!/bin/bash

echo "🔧 INSTALANDO NODE.JS 20 - MÉTODO ALTERNATIVO"
echo "=============================================="
echo ""

# Sair se root
if [ "$EUID" -eq 0 ]; then 
    echo "❌ NÃO execute este script como root!"
    echo "   Execute como usuário normal: bash fix-node-simple.sh"
    exit 1
fi

# 1. Instalar 'n' (Node version manager)
echo "📦 1. Instalando 'n' (Node version manager)..."
sudo npm install -g n

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar 'n'"
    echo "Tentando método alternativo..."
    
    # Método alternativo: baixar binário do Node.js direto
    cd /tmp
    wget https://nodejs.org/dist/v20.18.1/node-v20.18.1-linux-x64.tar.xz
    sudo tar -xJf node-v20.18.1-linux-x64.tar.xz -C /usr/local --strip-components=1
    rm node-v20.18.1-linux-x64.tar.xz
else
    # 2. Instalar Node.js 20 via 'n'
    echo ""
    echo "📦 2. Instalando Node.js 20..."
    sudo n 20
fi

# 3. Verificar
echo ""
echo "✅ VERIFICANDO INSTALAÇÃO:"
node --version
npm --version

echo ""
echo "🎯 Node.js atualizado com sucesso!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "   cd /www/wwwroot/autoflix.com.br"
echo "   bash deploy-after-node-update.sh"
