#!/bin/bash

# Script para corrigir estrutura de pastas no servidor
# Execute este script no servidor via SSH

echo "🔧 AUTOFLIX - Correção de Estrutura de Pastas"
echo "=============================================="
echo ""

# Determinar o diretório base
if [ -d "/www/wwwroot/autoflix.com.br" ]; then
    BASE_DIR="/www/wwwroot/autoflix.com.br"
else
    BASE_DIR="$(pwd)"
fi

echo "📁 Diretório base: $BASE_DIR"
echo ""

# Pastas necessárias
PASTAS=(
    "$BASE_DIR/server/data"
    "$BASE_DIR/server/logs"
    "$BASE_DIR/server/public"
    "$BASE_DIR/dist"
    "$BASE_DIR/public"
)

echo "📂 Verificando e criando pastas necessárias..."
for PASTA in "${PASTAS[@]}"; do
    if [ ! -d "$PASTA" ]; then
        mkdir -p "$PASTA"
        echo "   ✅ Criado: $PASTA"
    else
        echo "   ✓ Existe: $PASTA"
    fi
done

echo ""
echo "🔒 Ajustando permissões..."

# Permissões do servidor
chown -R www:www "$BASE_DIR" 2>/dev/null || chown -R www-data:www-data "$BASE_DIR" 2>/dev/null
chmod -R 755 "$BASE_DIR"

# Pastas que precisam de escrita
chmod -R 775 "$BASE_DIR/server/data"
chmod -R 775 "$BASE_DIR/server/logs"
chmod -R 775 "$BASE_DIR/server/public"
chmod -R 775 "$BASE_DIR/dist"

echo "   ✅ Permissões ajustadas"
echo ""

echo "📊 Estrutura final:"
tree -L 3 -d "$BASE_DIR" 2>/dev/null || find "$BASE_DIR" -maxdepth 3 -type d

echo ""
echo "✅ Correção concluída!"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Teste a geração do sitemap:"
echo "      curl https://api.autoflix.com.br/api/sync/generate-sitemap"
echo ""
echo "   2. Verifique se o sitemap foi criado:"
echo "      ls -la $BASE_DIR/dist/sitemap.xml"
echo "      ls -la $BASE_DIR/public/sitemap.xml"
