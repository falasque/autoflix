## 🧪 Guia de Teste: Cache + SYNC_SCHEDULE

### Teste 1: Verificar SYNC_SCHEDULE Configurado

```bash
# Ver valor atual
cat server/.env | grep SYNC_SCHEDULE

# Resultado atual:
SYNC_SCHEDULE=0 0 * * *
```

**Significado:**
```
0     = minuto 0
0     = hora 0 (meia-noite)
*     = todos os dias do mês
*     = todos os meses
*     = todos os dias da semana

⏰ Dispara TODO DIA À MEIA-NOITE
```

---

### Teste 2: Mudar para 4 em 4 horas

```bash
# Abra: server/.env
SYNC_SCHEDULE=0 */4 * * *
```

**Salve e reinicie o servidor:**
```bash
cd server
npm run dev
```

**Resultado nos logs:**
```
📅 Scheduling sync: "0 */4 * * *"
```

**Significado:**
```
0     = minuto 0
*/4   = A CADA 4 HORAS (0, 4, 8, 12, 16, 20)
*     = todos os dias do mês
*     = todos os meses
*     = todos os dias da semana

⏰ Dispara às 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
```

---

### Teste 3: Testar Cache - Primeira Chamada (MISS)

```bash
# Abra um novo terminal
curl "http://localhost:3001/api/vehicles/filters/options" -s | jq .

# Console do Backend mostra:
❌ Cache miss: vehicles:filters:options
💾 Cache definido: vehicles:filters:options (TTL: 4h)

# Resultado esperado:
{
  "brands": ["Ford", "Chevrolet", "Hyundai", ...],
  "years": [2024, 2023, 2022, ...],
  "fuels": ["Gasolina", "Diesel", "Híbrido", ...],
  "priceRange": {
    "min": 15000,
    "max": 89000
  }
}
```

**⏱️ Tempo:** ~250-500ms (porque consultou DB)

---

### Teste 4: Testar Cache - Segunda Chamada (HIT)

```bash
# Chamada imediata (sem esperar)
curl "http://localhost:3001/api/vehicles/filters/options" -s | jq .

# Console do Backend mostra:
✅ Cache hit: vehicles:filters:options (válido por mais: 3h 59m 50s)

# Resposta IDÊNTICA à anterior
```

**⏱️ Tempo:** ~1-5ms (porque veio da memória) 🚀 **250x mais rápido!**

---

### Teste 5: Ver Estatísticas do Cache

```bash
# Ver o que está cacheado
curl "http://localhost:3001/api/sync/cache/stats" -s | jq .

# Resultado esperado:
{
  "success": true,
  "stats": {
    "totalItems": 2,
    "items": [
      {
        "key": "vehicles:filters:options",
        "age": "2m 30s",
        "remainingTime": "3h 57m 30s",
        "ttl": "4h",
        "size": "2.5KB"
      },
      {
        "key": "vehicles:list:1:20:all:all:all:all:all:all:created_at:DESC",
        "age": "1m 15s",
        "remainingTime": "3h 58m 45s",
        "ttl": "4h",
        "size": "125KB"
      }
    ]
  }
}
```

---

### Teste 6: Disparar Sincronização (Vai Limpar Cache)

```bash
# Forçar sincronização manualmente
curl -X POST "http://localhost:3001/api/sync/trigger" -s | jq .

# Console do Backend mostra:
🔄 Starting vehicle sync from XML...
📍 XML URL: https://app.revendamais.com.br/...
✅ XML fetched successfully (15234 bytes)
📊 Found 61 vehicles in XML
✅ Sync completed: +0 ~0 -0 (61 total)

🔄 Invalidando cache de veículos...
🔄 Cache de veículos invalidado: vehicles:filters:options
🔄 Cache de veículos invalidado: vehicles:stats:overview
🗺️  Gerando sitemap com URLs de veículos...
✅ Sitemap gerado com sucesso!

# Resposta esperada:
{
  "success": true,
  "message": "Sync completed successfully",
  "result": {
    "added": 0,
    "updated": 0,
    "removed": 0,
    "total": 61,
    "duration": "2.34s"
  }
}
```

---

### Teste 7: Confirmar Cache Foi Limpo

```bash
# Chamar API após sync
curl "http://localhost:3001/api/vehicles/filters/options" -s | jq .

# Console do Backend mostra:
❌ Cache miss: vehicles:filters:options
💾 Cache definido: vehicles:filters:options (TTL: 4h)

# ⚠️ MISS novamente porque cache foi invalidado!
# Próximas chamadas vão fazer HIT
```

---

### Teste 8: Limpar Cache Manualmente

```bash
# Limpar TODO o cache
curl -X POST "http://localhost:3001/api/sync/cache/clear" -s | jq .

# Console mostra:
🧹 Cache completamente limpo

# Resposta:
{
  "success": true,
  "message": "Cache cleared successfully"
}

# Próxima chamada: MISS novamente
curl "http://localhost:3001/api/vehicles/filters/options" -s | jq .
❌ Cache miss: vehicles:filters:options
```

---

### Teste 9: Invalidar Apenas Cache de Veículos

```bash
# Invalidar cache de veículos (mantém outros caches)
curl -X POST "http://localhost:3001/api/sync/cache/invalidate-vehicles" -s | jq .

# Resposta:
{
  "success": true,
  "message": "Vehicle cache invalidated successfully"
}

# Próxima chamada de veículos: MISS
# Outros caches (se existissem): Still HIT
```

---

### Teste 10: Esperar Cache Expirar (4 horas)

```bash
# ⏰ Aguarde 4 horas exatas...

# Ou edite o TTL para testar (5 segundos em vez de 4h):

# Abra: server/src/routes/vehicles.js
# Mude:
const CACHE_TTL = 5 * 1000; // 5 segundos para teste

# Reinicie servidor e teste:

# t=0s: Primeira chamada → MISS
curl "http://localhost:3001/api/vehicles/filters/options"
❌ Cache miss: vehicles:filters:options
💾 Cache definido: vehicles:filters:options (TTL: 5s)

# t=1s: Segunda chamada → HIT
curl "http://localhost:3001/api/vehicles/filters/options"
✅ Cache hit: vehicles:filters:options (válido por mais: 4s)

# t=6s: Terceira chamada → MISS novamente (expirou!)
curl "http://localhost:3001/api/vehicles/filters/options"
⏰ Cache expirado: vehicles:filters:options (idade: 6s)
❌ Cache miss: vehicles:filters:options
💾 Cache definido: vehicles:filters:options (TTL: 5s)
```

---

### Teste 11: Monitorar Sync Automático

```bash
# Edite .env para testar com 30 segundos:
SYNC_SCHEDULE=*/30 * * * *

# Reinicie servidor
npm run dev

# Console mostra:
📅 Scheduling sync: "*/30 * * * *"

# Aguarde até a próxima execução:
# Se começou às 14:32:45, próxima é às 14:33:00 (15 segundos)

[aguardando...]
[aguardando...]

# Depois de alguns segundos:
🔄 Running scheduled sync...
🔄 Starting vehicle sync from XML...
...
✅ Sync completed: +0 ~0 -0 (61 total)
🔄 Invalidando cache de veículos...

# E novamente 30 segundos depois:
🔄 Running scheduled sync...
[repete...]
```

---

## 📊 Teste Integrado: Verificar Todo o Fluxo

```bash
# 1. Reiniciar servidor com novo SYNC_SCHEDULE
cd server
# Edite .env: SYNC_SCHEDULE=0 */4 * * *
npm run dev

# Console mostra:
📅 Scheduling sync: "0 */4 * * *"

# 2. Fazer primeira requisição
curl "http://localhost:3001/api/vehicles"

# Console:
❌ Cache miss: vehicles:list:1:20:all:all:all:all:all:all:created_at:DESC
💾 Cache definido: vehicles:list:1:20:all:all:all:all:all:all:created_at:DESC (TTL: 4h)

# 3. Ver estatísticas de cache
curl "http://localhost:3001/api/sync/cache/stats"

# Mostra: 1 item em cache, tamanho ~125KB, válido por 4h

# 4. Fazer segunda requisição (deve ser HIT)
curl "http://localhost:3001/api/vehicles"

# Console:
✅ Cache hit: vehicles:list:1:20:all:all:all:all:all:all:created_at:DESC

# 5. Forçar sync manual
curl -X POST "http://localhost:3001/api/sync/trigger"

# Console:
✅ Sync completed: +0 ~0 -0 (61 total)
🔄 Invalidando cache de veículos...
🔄 Cache de veículos invalidado: vehicles:list:1:20:all:all:all:all:all:all:created_at:DESC

# 6. Cache foi limpo - próxima requisição é MISS
curl "http://localhost:3001/api/vehicles"

# Console:
❌ Cache miss: vehicles:list:1:20:all:all:all:all:all:all:created_at:DESC
💾 Cache definido: vehicles:list:1:20:all:all:all:all:all:all:created_at:DESC (TTL: 4h)

# ✅ FLUXO COMPLETO FUNCIONANDO!
```

---

## 🎯 Checklist de Testes

- [ ] SYNC_SCHEDULE lido do .env
- [ ] Cron job agendado corretamente
- [ ] Primeira chamada à API: MISS
- [ ] Segunda chamada à API: HIT
- [ ] Cache hit ~250x mais rápido
- [ ] Ver cache stats via API
- [ ] Sync manual limpa cache
- [ ] Cache manual limpo via API
- [ ] Cache expira após 4 horas
- [ ] Cache invalidado após sync automático
- [ ] Sitemap gerado após sync
- [ ] Sem erros de console

---

## 📈 Resultados Esperados

### Console Backend (Primeira Execução)

```
✅ Server running on http://localhost:3001
📅 Scheduling sync: "0 */4 * * *"
💼 Database initialized
✅ All routes registered
🛠️ Admin routes available at /api/admin
```

### Após Requisição

```
GET /api/vehicles/filters/options
❌ Cache miss: vehicles:filters:options
💾 Cache definido: vehicles:filters:options (TTL: 4h)

GET /api/vehicles/filters/options (segunda vez)
✅ Cache hit: vehicles:filters:options (válido por mais: 3h 59m 58s)
```

### Após Sincronização

```
POST /api/sync/trigger
✅ Sync completed: +0 ~0 -0 (61 total)
🔄 Invalidando cache de veículos...
🔄 Cache de veículos invalidado: vehicles:filters:options
🔄 Cache de veículos invalidado: vehicles:stats:overview
```

---

**Status:** ✅ **PRONTO PARA TESTES**

