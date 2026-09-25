#!/bin/bash

# 🧪 Script de Teste: Cache de 4 Horas + SYNC_SCHEDULE
# Use: ./test-cache-sync.sh (ou execute os comandos manualmente)

echo "=================================================="
echo "🧪 TESTE: Cache de 4 Horas + SYNC_SCHEDULE"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
API_URL="http://localhost:3001"
SLEEP_TIME=2

# Função para imprimir seção
section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📌 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Função para testar
test_step() {
    echo -e "${YELLOW}➜ $1${NC}"
    sleep $SLEEP_TIME
}

# Função para imprimir resultado
result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ Sucesso${NC}"
    else
        echo -e "${RED}❌ Falhou${NC}"
    fi
    echo ""
}

# TESTE 1: Verificar servidor
section "TESTE 1: Verificar se servidor está rodando"
test_step "Tentando conectar ao API..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_URL/api/sync/info"

# TESTE 2: Primeira requisição (Cache Miss)
section "TESTE 2: Primeira requisição (Cache Miss)"
test_step "Chamar GET /api/vehicles/filters/options..."
echo -e "${YELLOW}Resposta:${NC}"
curl -s "$API_URL/api/vehicles/filters/options" | jq '.' | head -20
echo "..."

# TESTE 3: Segunda requisição (Cache Hit)
section "TESTE 3: Segunda requisição (Cache Hit)"
test_step "Chamar GET /api/vehicles/filters/options novamente..."
echo -e "${YELLOW}Resposta (deve ser instant):${NC}"
time curl -s "$API_URL/api/vehicles/filters/options" | jq '.' | head -5
echo "..."

# TESTE 4: Ver cache stats
section "TESTE 4: Ver estatísticas do cache"
test_step "Chamar GET /api/sync/cache/stats..."
echo -e "${YELLOW}Resposta:${NC}"
curl -s "$API_URL/api/sync/cache/stats" | jq '.'

# TESTE 5: Disparar sync
section "TESTE 5: Disparar sincronização manual"
test_step "Chamar POST /api/sync/trigger..."
echo -e "${YELLOW}Resposta:${NC}"
curl -s -X POST "$API_URL/api/sync/trigger" | jq '.'

# TESTE 6: Verificar cache foi limpo
section "TESTE 6: Verificar cache foi limpo"
test_step "Chamar GET /api/sync/cache/stats..."
echo -e "${YELLOW}Resposta (deve mostrar cache vazio):${NC}"
curl -s "$API_URL/api/sync/cache/stats" | jq '.stats.totalItems'

# TESTE 7: Requisição após sync (novo Miss)
section "TESTE 7: Requisição após sync (novo Miss)"
test_step "Chamar GET /api/vehicles/filters/options..."
echo -e "${YELLOW}Resposta (vai fazer novo hit ao DB):${NC}"
curl -s "$API_URL/api/vehicles/filters/options" | jq '.' | head -5
echo "..."

# TESTE 8: Limpar cache manualmente
section "TESTE 8: Limpar cache manualmente"
test_step "Chamar POST /api/sync/cache/clear..."
echo -e "${YELLOW}Resposta:${NC}"
curl -s -X POST "$API_URL/api/sync/cache/clear" | jq '.'

# TESTE 9: Invalidar apenas cache de veículos
section "TESTE 9: Invalidar apenas cache de veículos"
test_step "Chamar POST /api/sync/cache/invalidate-vehicles..."
echo -e "${YELLOW}Resposta:${NC}"
curl -s -X POST "$API_URL/api/sync/cache/invalidate-vehicles" | jq '.'

# TESTE 10: Ver info do sync
section "TESTE 10: Ver informações do último sync"
test_step "Chamar GET /api/sync/info..."
echo -e "${YELLOW}Resposta:${NC}"
curl -s "$API_URL/api/sync/info" | jq '.'

# Resumo
section "📊 RESUMO DOS TESTES"
echo -e "${GREEN}✅ Todos os testes executados!${NC}"
echo ""
echo "📌 Interpretação dos Resultados:"
echo "  - Primeiro acesso: Cache miss (consulta DB)"
echo "  - Segundo acesso: Cache hit (muuito mais rápido)"
echo "  - Após sync: Cache limpo, novamente miss"
echo "  - Cache stats: Mostra quantos itens em cache"
echo ""
echo "⚡ Performance esperada:"
echo "  - Cache miss: ~250ms (DB query)"
echo "  - Cache hit: ~1-5ms (memória)"
echo "  - Ganho: ~250x mais rápido!"
echo ""
echo "🔄 Sync_schedule:"
echo "  - Verifique server/.env → SYNC_SCHEDULE"
echo "  - Padrão: '0 0 * * *' (diariamente à meia-noite)"
echo "  - A cada 4h: '0 */4 * * *'"
echo ""
echo -e "${BLUE}✨ Testes concluídos! Verifique os logs do servidor.${NC}"
