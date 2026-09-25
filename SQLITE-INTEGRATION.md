# 🚀 Guia de Integração: Sistema SQLite com Frontend

## 📋 Visão Geral

Este guia descreve como integrar o novo sistema de banco de dados SQLite com o frontend React existente.

### O que muda:

**❌ Removido:**
- `mock-vehicles.ts` - Dados fictícios
- `local-vehicle-service.ts` - Sincronização local
- `vehicle-sync-service.ts` - Sincronização complexa
- `api-vehicle-service.ts` - API básica
- Dependência de localStorage para dados de veículos

**✅ Novo:**
- Backend Node.js/Express com SQLite
- API REST em `/api/vehicles` e `/api/sync`
- Sincronização automática via cron
- Cache inteligente no frontend

---

## 🛠️ Setup Inicial

### 1. Backend - Instalação

```bash
cd server
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas configurações
```

**`.env` recomendado:**

```
PORT=3001
NODE_ENV=development
DB_PATH=./data/vehicles.db
XML_URL=https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml
CORS_ORIGIN=http://localhost:5173,http://localhost:8080,https://autoflix.com.br
SYNC_SCHEDULE=0 0 * * *
```

### 3. Iniciar servidor backend

```bash
# Development com watch
npm run dev

# Production
npm start
```

Servidor rodando em: `http://localhost:3001`

---

## 🔗 Integração Frontend

### 1. Configurar URL do Backend

No arquivo `vite.config.ts` ou `.env.local`:

```bash
VITE_API_URL=http://localhost:3001/api
```

Ou no componente:

```typescript
import { databaseVehicleService } from '@/lib/database-vehicle-service';

databaseVehicleService.setBackendUrl('http://localhost:3001/api');
```

### 2. Atualizar Componentes

**Antes (localStorage + mock data):**

```typescript
import { localVehicleService } from '@/lib/local-vehicle-service';

const vehicles = await localVehicleService.getVehicles();
```

**Depois (SQLite via API):**

```typescript
import { useVehicles } from '@/hooks/use-vehicle-data';

function VehicleList() {
  const { data, isLoading, error } = useVehicles({
    page: 1,
    limit: 20,
    brand: 'Toyota'
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      {data?.data.map(vehicle => (
        <div key={vehicle.id}>{vehicle.name}</div>
      ))}
    </div>
  );
}
```

### 3. Usar Hooks Personalizados

```typescript
import {
  useVehicles,
  useVehicleById,
  useFilterOptions,
  useVehicleStatistics,
  useSyncInfo,
  useManualSync,
  useSyncHistory
} from '@/hooks/use-vehicle-data';

// Listar veículos com filtros
function VehicleListPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useVehicles(filters);

  return (
    <div>
      {data?.data.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}

// Detalhes de um veículo
function VehicleDetailsPage({ slug }) {
  const { data: vehicle, isLoading } = useVehicleById(slug);

  return (
    <div>
      <h1>{vehicle?.name}</h1>
      <p>Preço: R$ {vehicle?.price}</p>
    </div>
  );
}

// Admin - Trigger sincronização
function AdminSync() {
  const { mutate: triggerSync, isPending } = useManualSync();
  const { data: syncInfo } = useSyncInfo();

  return (
    <div>
      <button onClick={() => triggerSync()} disabled={isPending}>
        {isPending ? 'Sincronizando...' : 'Sincronizar Agora'}
      </button>
      <p>Última sincronização: {syncInfo?.lastSync?.sync_date}</p>
    </div>
  );
}
```

---

## 📊 Endpoints da API

### Veículos

```bash
# Listar com filtros
GET /api/vehicles?page=1&limit=20&brand=Toyota&fuel=Gasolina&search=Corolla

# Detalhes
GET /api/vehicles/:id_ou_slug

# Filtros disponíveis
GET /api/vehicles/filters/options

# Estatísticas
GET /api/vehicles/stats/overview
```

### Sincronização

```bash
# Informações da última sincronização
GET /api/sync/info

# Histórico de sincronizações
GET /api/sync/history?limit=10

# Forçar sincronização manual
POST /api/sync/trigger
```

---

## 🔄 Fluxo de Sincronização

```
┌─────────────────┐
│   XML Externo   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Backend - sync-service │
│  (Parse + Validate)     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│   SQLite DB     │
│  (Persistente)  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  API Rest (/api/vehicles)│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  React Frontend          │
│  (TanStack Query Cache)  │
└──────────────────────────┘
```

### Sincronização Automática

- **Agendamento**: Configurável via `SYNC_SCHEDULE` (cron format)
- **Padrão**: `0 0 * * *` (todo dia à meia-noite)
- **Logging**: Todos os syncs são registrados em `sync_log`

### Sincronização Manual (Admin)

```typescript
// Dashboard Admin
function AdminDashboard() {
  const { mutate: triggerSync, isPending } = useManualSync();
  const { data: syncInfo } = useSyncInfo();
  const { data: history } = useSyncHistory(10);

  return (
    <div>
      <button onClick={() => triggerSync()}>
        Sincronizar Agora
      </button>
      
      {syncInfo?.lastSync && (
        <div>
          <h3>Última Sincronização</h3>
          <p>Data: {syncInfo.lastSync.sync_date}</p>
          <p>Adicionados: {syncInfo.lastSync.vehicles_added}</p>
          <p>Atualizados: {syncInfo.lastSync.vehicles_updated}</p>
          <p>Removidos: {syncInfo.lastSync.vehicles_removed}</p>
          <p>Total: {syncInfo.totalVehicles}</p>
        </div>
      )}
      
      <h3>Histórico</h3>
      {history?.map(sync => (
        <div key={sync.id}>
          {sync.sync_date} - {sync.status}
        </div>
      ))}
    </div>
  );
}
```

---

## 🗂️ Estrutura de Arquivos

```
projeto/
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── server.js               # Entrada principal
│   │   ├── db/
│   │   │   └── database.js         # Inicialização SQLite
│   │   ├── routes/
│   │   │   ├── vehicles.js         # Endpoints de veículos
│   │   │   └── sync.js             # Endpoints de sincronização
│   │   └── services/
│   │       └── sync-service.js     # Lógica de sincronização
│   ├── data/
│   │   └── vehicles.db             # Banco de dados (criado automaticamente)
│   ├── package.json
│   └── .env
│
└── src/
    ├── lib/
    │   └── database-vehicle-service.ts  # Client para API
    ├── hooks/
    │   └── use-vehicle-data.ts          # Hooks personalizados
    └── ...
```

---

## 🚨 Troubleshooting

### Erro: "Cannot connect to backend"

**Solução:**

1. Verificar se backend está rodando: `http://localhost:3001/health`
2. Conferir CORS em `.env` do server
3. Configurar `VITE_API_URL` corretamente

### Erro: "Database locked"

**Solução:**

1. Fechar outras conexões ao banco
2. Deletar `data/vehicles.db` e deixar recriar
3. Aumentar timeout em `database.js`

### Dados não sincronizam

**Solução:**

1. Verificar XML URL em `.env`
2. Conferir logs do servidor: `npm run dev`
3. Testar manualmente: `POST /api/sync/trigger`

---

## 📱 Deployment

### Production - Backend

```bash
# Build
npm run build

# Start
NODE_ENV=production npm start

# Com PM2
npm install -g pm2
pm2 start src/server.js --name "autoflix-server"
```

### Production - Frontend

Adicionar ao `vite.config.ts`:

```typescript
export default defineConfig({
  // ...
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api.autoflix.com.br'
    )
  }
});
```

---

## 📝 Próximos Passos

1. ✅ Instalar dependências do backend
2. ✅ Configurar `.env`
3. ✅ Iniciar servidor backend
4. ✅ Atualizar componentes React
5. ✅ Testar sincronização manual
6. ✅ Ativar sincronização automática
7. ✅ Deploy em produção

---

**🎉 Sistema de SQLite integrado e funcionando!**
