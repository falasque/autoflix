# 📐 ARQUITETURA DO SISTEMA AUTOFLIX

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET / XML                            │
│            https://app.revendamais.com.br                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ XML Feed
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND - NODE.JS                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Express Server (Port 3001)               │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  sync-service.js                                 │ │  │
│  │  │  ├─ Fetch XML                                    │ │  │
│  │  │  ├─ Parse & Validate                             │ │  │
│  │  │  ├─ Compare with DB                              │ │  │
│  │  │  └─ Insert/Update/Delete                         │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                      ▼                                 │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  API Routes                                      │ │  │
│  │  │  ├─ GET  /api/vehicles                           │ │  │
│  │  │  ├─ GET  /api/vehicles/:id                       │ │  │
│  │  │  ├─ GET  /api/vehicles/filters/options           │ │  │
│  │  │  ├─ GET  /api/sync/info                          │ │  │
│  │  │  ├─ POST /api/sync/trigger                       │ │  │
│  │  │  └─ GET  /api/sync/history                       │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                      │                                       │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       │ SQLite Database
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE - SQLITE                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  vehicles   │  │  vehicle_    │  │  vehicle_        │  │
│  │             │  │  images      │  │  features        │  │
│  │ • id        │  │              │  │                  │  │
│  │ • name      │  │ • id         │  │ • id             │  │
│  │ • brand     │  │ • vehicle_id │  │ • vehicle_id     │  │
│  │ • price     │  │ • image_url  │  │ • feature        │  │
│  │ • year      │  │ • position   │  │ • created_at     │  │
│  │ • mileage   │  │ • created_at │  │                  │  │
│  │ • features  │  └──────────────┘  └──────────────────┘  │
│  │ • created_at│                                            │
│  └─────────────┘  ┌──────────────┐                         │
│                   │   sync_log   │                         │
│                   │              │                         │
│                   │ • sync_date  │                         │
│                   │ • added      │                         │
│                   │ • updated    │                         │
│                   │ • removed    │                         │
│                   │ • status     │                         │
│                   └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                       ▲
                       │ HTTP/REST
                       │
┌──────────────────────┴───────────────────────────────────────┐
│              FRONTEND - REACT / VITE                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  App.tsx                                              │  │
│  │  ├─ QueryClientProvider                              │  │
│  │  └─ Routes                                            │  │
│  └────────────┬──────────────────────────────────────────┘  │
│               │                                              │
│  ┌────────────┴──────────────────────────────────────────┐  │
│  │  Pages & Components                                   │  │
│  │  ├─ Index.tsx → useVehicles()                         │  │
│  │  ├─ VehicleDetails.tsx → useVehicleById()            │  │
│  │  └─ AdminDashboard.tsx → useManualSync()             │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────┴─────────────────────────────────┐  │
│  │  Hooks (TanStack Query)                               │  │
│  │  ├─ useVehicles()                                     │  │
│  │  ├─ useVehicleById()                                  │  │
│  │  ├─ useFilterOptions()                                │  │
│  │  ├─ useManualSync()                                   │  │
│  │  └─ useSyncInfo()                                     │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────┴─────────────────────────────────┐  │
│  │  Services (lib/)                                      │  │
│  │  └─ database-vehicle-service.ts                       │  │
│  │     ├─ getVehicles()                                  │  │
│  │     ├─ getVehicleById()                               │  │
│  │     ├─ getSyncInfo()                                  │  │
│  │     └─ triggerSync()                                  │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│                        │ HTTP Requests                       │
│                        ▼                                     │
│                 (localhost:3001/api)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Diretórios

```
novo/
│
├── server/                          ← BACKEND (Node.js)
│   ├── src/
│   │   ├── server.js               → Express app principal
│   │   ├── db/
│   │   │   └── database.js         → Inicializa SQLite
│   │   ├── routes/
│   │   │   ├── vehicles.js         → Endpoints de veículos
│   │   │   └── sync.js             → Endpoints de sincronização
│   │   └── services/
│   │       └── sync-service.js     → Lógica de sincronização
│   ├── data/
│   │   └── vehicles.db             → Banco de dados (criado automaticamente)
│   ├── package.json
│   ├── .env.example
│   └── .env                        → Configurações (criar a partir do .example)
│
├── src/                             ← FRONTEND (React)
│   ├── lib/
│   │   ├── database-vehicle-service.ts  → Client HTTP para API
│   │   ├── mock-vehicles.ts            → ❌ REMOVER
│   │   ├── local-vehicle-service.ts    → ❌ REMOVER
│   │   ├── vehicle-sync-service.ts     → ❌ REMOVER
│   │   └── api-vehicle-service.ts      → ❌ REMOVER
│   ├── hooks/
│   │   └── use-vehicle-data.ts         → Hooks com TanStack Query
│   ├── pages/
│   │   ├── Index.tsx                   → Atualizar com useVehicles()
│   │   ├── VehicleDetails.tsx          → Atualizar com useVehicleById()
│   │   └── AdminDashboard.tsx          → Atualizar com useManualSync()
│   └── ...
│
├── RESUMO-SQLITE-IMPLEMENTATION.md
├── SQLITE-INTEGRATION.md
├── SISTEMA-SQLITE-README.md
├── EXEMPLO-INTEGRACAO.tsx
├── setup-sqlite.ps1
└── setup-sqlite.sh
```

---

## 🔄 Fluxo de Sincronização

```
INÍCIO
  │
  ▼
┌────────────────────────────────────┐
│  Cron Job (0 0 * * * daily)        │
│  OU                                │
│  POST /api/sync/trigger (manual)   │
└────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────┐
│  Fetch XML do URL                  │
│  (com retry automático)            │
└────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────┐
│  Parse XML                         │
│  • Extrai veículos                 │
│  • Valida dados                    │
│  • Gera slugs                      │
└────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────┐
│  Carrega dados existentes           │
│  do SQLite                         │
└────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────┐
│  Compara dados                     │
│  • Novos: INSERT                   │
│  • Modificados: UPDATE             │
│  • Deletados: DELETE               │
└────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────┐
│  Transação no SQLite               │
│  BEGIN                             │
│  ├─ Insert/Update/Delete           │
│  ├─ Insere imagens                 │
│  ├─ Insere características         │
│  ├─ Log na sync_log                │
│  COMMIT                            │
└────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────┐
│  Retorna resultado                 │
│  • veículos adicionados            │
│  • veículos atualizados            │
│  • veículos removidos              │
│  • tempo total                     │
└────────────────────────────────────┘
  │
  ▼
  FIM

Erro em qualquer etapa:
  │
  ├─ Retry automático
  ├─ Log do erro em sync_log
  ├─ Mantém dados anteriores
  └─ Retorna erro para o cliente
```

---

## 🔌 Request/Response Flow

### Exemplo 1: Listar Veículos

```javascript
// FRONTEND
const { data, isLoading } = useVehicles({ 
  page: 1, 
  limit: 20, 
  brand: 'Toyota' 
});

// Internamente faz:
// GET /api/vehicles?page=1&limit=20&brand=Toyota
```

```json
// RESPONSE (Backend)
{
  "data": [
    {
      "id": "xml-toyota-camry-2020-1",
      "slug": "toyota-camry-2020-1",
      "name": "Toyota Camry 2020",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "price": 85000,
      "mileage": 25000,
      "fuel": "Gasolina",
      "transmission": "Automático",
      "color": "Prata",
      "doors": 4,
      "image": "https://example.com/image1.jpg",
      "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "features": ["Ar condicionado", "Direção hidráulica", "Vidros elétricos"],
      "featured": false,
      "created_at": "2025-10-30T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Exemplo 2: Forçar Sincronização

```javascript
// FRONTEND
const { mutate: triggerSync } = useManualSync();
triggerSync();

// Internamente faz:
// POST /api/sync/trigger
```

```json
// RESPONSE
{
  "success": true,
  "message": "Sync completed successfully",
  "result": {
    "added": 5,
    "updated": 12,
    "removed": 2,
    "total": 150,
    "duration": "2.34s"
  }
}
```

---

## 🎯 Estados de Cache (TanStack Query)

```
┌──────────────────────────────────────┐
│     ESTADOS DE QUERY                 │
└──────────────────────────────────────┘

isLoading: true
├─ Carregando dados pela primeira vez
├─ Status: "loading"
└─ Dados: undefined

isLoading: false
isSuccess: true
├─ Dados carregados com sucesso
├─ Status: "success"
├─ Data: [...]
└─ Pode ser cacheado

isLoading: false
isError: true
├─ Erro ao carregar dados
├─ Status: "error"
├─ Error: Error object
└─ Pode tentar retry

isFetching: true
├─ Revalidando dados em background
├─ Dados antigos ainda visíveis
└─ Não é erro

┌──────────────────────────────────────┐
│     CICLO DE VIDA DO CACHE           │
└──────────────────────────────────────┘

1. Primeira requisição → Server fetch
2. Dados retornam → Cache por 5 min
3. Usar durante 5 min → Serve do cache
4. Após 5 min → Revalidação em background
5. Manual refresh → Invalidate + fetch novo
6. Na seleção → Mantém último estado
```

---

## 🔐 Segurança

```
FRONTEND                      BACKEND
┌────────────────────┐       ┌────────────────────┐
│  VITE_API_URL      │───┬──→│  CORS Config       │
│  (localhost:3001)  │   │   │  (validar origin)  │
│                    │   │   │                    │
│  useVehicles()     │   └──→│  Rota pública      │
│  (sem dados sensi) │       │  /api/vehicles     │
│                    │       │                    │
│  useManualSync()   │   ┌──→│  Rota protegida    │
│  (admin only)      │───┤   │  POST /api/sync    │
│                    │   │   │  (Future: JWT)     │
│                    │   │   │                    │
└────────────────────┘   │   └────────────────────┘
                         │
                    VALIDAÇÕES:
                    ├─ Sanitizar inputs
                    ├─ Validar query params
                    ├─ Limite de requisições
                    └─ Timeouts
```

---

## 📊 Métricas de Performance

```
┌─────────────────────────────────────┐
│    Carregamento de Página           │
├─────────────────────────────────────┤
│ Sem cache:   ~800ms                 │
│ Com cache:   ~50ms                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    Sincronização (100 veículos)     │
├─────────────────────────────────────┤
│ Fetch XML:     ~2s                  │
│ Parse:         ~0.5s                │
│ DB Insert:     ~1s                  │
│ Total:         ~3.5s                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    Tamanho do Banco                 │
├─────────────────────────────────────┤
│ 100 veículos:   ~2MB                │
│ 1000 veículos:  ~20MB               │
│ 10000 veículos: ~200MB              │
└─────────────────────────────────────┘
```

---

**📌 Esta documentação pode ser consultada sempre que precisar entender a arquitetura do sistema.**
