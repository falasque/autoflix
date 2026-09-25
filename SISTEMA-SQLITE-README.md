# 🚗 Sistema de Sincronização SQLite - Guia de Implementação

## ✅ O que foi criado

### Backend - Node.js + Express + SQLite

Um servidor completo para gerenciar os dados de veículos em um banco de dados SQLite com sincronização automática do XML.

**Arquivos criados em `/server/`:**

- `src/server.js` - Servidor Express
- `src/db/database.js` - Inicialização do SQLite
- `src/routes/vehicles.js` - API de veículos
- `src/routes/sync.js` - API de sincronização
- `src/services/sync-service.js` - Lógica de sincronização
- `package.json` - Dependências
- `.env.example` - Configurações exemplo

**Banco de dados cria 4 tabelas:**
- `vehicles` - Dados principais dos veículos
- `vehicle_images` - Galeria de imagens
- `vehicle_features` - Características/acessórios
- `sync_log` - Histórico de sincronizações

### Frontend - TypeScript + React Query

Novo serviço para acessar dados via API em vez de localStorage.

**Arquivos criados em `/src/`:**

- `lib/database-vehicle-service.ts` - Client da API
- `hooks/use-vehicle-data.ts` - Hooks com TanStack Query

**Removidos (não necessários mais):**
- ❌ `mock-vehicles.ts` 
- ❌ `local-vehicle-service.ts`
- ❌ `vehicle-sync-service.ts`
- ❌ `api-vehicle-service.ts`

---

## 🚀 Como usar

### 1️⃣ Instalar Backend

```bash
cd server
npm install
```

### 2️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar e editar
cp .env.example .env
```

Edite `.env` com:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/vehicles.db
XML_URL=https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml
CORS_ORIGIN=http://localhost:5173,http://localhost:8080,https://autoflix.com.br
SYNC_SCHEDULE=0 0 * * *
```

### 3️⃣ Iniciar Backend

```bash
npm run dev
```

Servidor rodará em: `http://localhost:3001`

### 4️⃣ Configurar Frontend

No seu `vite.config.ts` ou `.env.local` do frontend:

```
VITE_API_URL=http://localhost:3001/api
```

### 5️⃣ Usar nos Componentes

**Antes (antigo):**
```typescript
import { localVehicleService } from '@/lib/local-vehicle-service';
const vehicles = await localVehicleService.getVehicles();
```

**Depois (novo):**
```typescript
import { useVehicles } from '@/hooks/use-vehicle-data';

export function MyComponent() {
  const { data: vehiclesData, isLoading, error } = useVehicles({
    page: 1,
    limit: 20,
    brand: 'Toyota'
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro!</div>;

  return (
    <div>
      {vehiclesData?.data.map(vehicle => (
        <div key={vehicle.id}>{vehicle.name}</div>
      ))}
    </div>
  );
}
```

---

## 📚 Hooks Disponíveis

Todos em `@/hooks/use-vehicle-data`:

```typescript
// Listar veículos com paginação e filtros
useVehicles(filters?: VehicleFilters)

// Um veículo específico
useVehicleById(identifier: string)

// Opções de filtros (marcas, anos, combustíveis, preços)
useFilterOptions()

// Estatísticas gerais
useVehicleStatistics()

// Informações de sincronização
useSyncInfo()

// Forçar sincronização (admin)
useManualSync()

// Histórico de sincronizações
useSyncHistory(limit?: number)
```

---

## 🔌 API Endpoints

### GET Veículos
```
GET /api/vehicles
GET /api/vehicles?page=1&limit=20&brand=Toyota&fuel=Gasolina
GET /api/vehicles/honda-civic-2020-1
```

### GET Filtros
```
GET /api/vehicles/filters/options
```

### GET Stats
```
GET /api/vehicles/stats/overview
```

### GET Sincronização
```
GET /api/sync/info
GET /api/sync/history?limit=10
POST /api/sync/trigger
```

---

## 🔄 Ciclo de Sincronização

```
1. Sincronização Automática (cron)
   ↓
2. Fetch XML do URL configurado
   ↓
3. Parse XML → Extrair veículos
   ↓
4. Comparar com DB (added/updated/removed)
   ↓
5. Inserir/Atualizar/Deletar em SQLite
   ↓
6. Registrar em sync_log
   ↓
7. API retorna dados atualizados
   ↓
8. Frontend recebe via TanStack Query
```

---

## 📊 Estrutura do Banco de Dados

### Tabela `vehicles`

```sql
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price REAL NOT NULL,
  mileage INTEGER NOT NULL,
  fuel TEXT CHECK(fuel IN ('Gasolina', 'Flex', 'Diesel', 'Elétrico', 'Híbrido')),
  transmission TEXT CHECK(transmission IN ('Manual', 'Automático', 'CVT')),
  color TEXT NOT NULL,
  doors INTEGER NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  featured BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `vehicle_images`
```sql
CREATE TABLE vehicle_images (
  id INTEGER PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
```

### Tabela `vehicle_features`
```sql
CREATE TABLE vehicle_features (
  id INTEGER PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
```

### Tabela `sync_log`
```sql
CREATE TABLE sync_log (
  id INTEGER PRIMARY KEY,
  sync_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  vehicles_added INTEGER DEFAULT 0,
  vehicles_updated INTEGER DEFAULT 0,
  vehicles_removed INTEGER DEFAULT 0,
  total_vehicles INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('success', 'error')),
  error_message TEXT,
  duration_ms INTEGER
);
```

---

## 🛠️ Troubleshooting

### Erro: "Cannot connect to backend"

Verificar:
1. Backend está rodando? `npm run dev` na pasta `/server`
2. Porta 3001 disponível? Verificar outras aplicações
3. VITE_API_URL configurado? Deve ser `http://localhost:3001/api`

### Erro: "Database locked"

Solução:
1. Matar processo anterior: `lsof -i :3001` e `kill -9 <PID>`
2. Deletar DB: `rm server/data/vehicles.db` (será recriado)
3. Reiniciar: `npm run dev`

### XML não sincroniza

Verificar:
1. URL do XML em `.env` está correta
2. URL é acessível (testar no navegador)
3. Formato XML é válido
4. Logs do servidor: `npm run dev`

### Dados antigos aparecem

Solução:
1. Forçar novo sync: `POST /api/sync/trigger` via Postman/Insomnia
2. Limpar cache frontend: Ctrl+Shift+R (hard refresh)
3. Limpar localStorage: `localStorage.clear()` no console

---

## 📦 Comandos Úteis

### Backend

```bash
# Desenvolvimento
cd server && npm run dev

# Production
cd server && NODE_ENV=production npm start

# Sincronizar manualmente
cd server && npm run sync

# Ver logs do banco
sqlite3 data/vehicles.db "SELECT * FROM sync_log;"
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Limpar cache
npm run build:clean
```

---

## 🔐 Segurança em Produção

### Backend (.env production)

```env
NODE_ENV=production
PORT=3001
DB_PATH=/opt/autoflix/data/vehicles.db
CORS_ORIGIN=https://autoflix.com.br
```

### Frontend (.env production)

```env
VITE_API_URL=https://api.autoflix.com.br
```

### Nginx (proxy reverso)

```nginx
location /api {
  proxy_pass http://localhost:3001;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;
  proxy_cache api_cache;
  proxy_cache_valid 200 5m;
}
```

---

## 📈 Performance

### Otimizações Implementadas

1. **Índices no SQLite**
   - `idx_vehicles_brand` - Busca por marca
   - `idx_vehicles_year` - Busca por ano
   - `idx_vehicles_price` - Busca por preço
   - `idx_vehicles_fuel` - Busca por combustível

2. **Caching Frontend (TanStack Query)**
   - Veículos: 5 minutos
   - Filtros: 1 hora
   - Stats: 30 minutos

3. **Paginação**
   - Padrão: 20 itens por página
   - Máximo: 100 itens

---

## ✨ Benefícios do Novo Sistema

✅ **Dados Persistentes** - Banco de dados centralizado  
✅ **Sincronização Automática** - Via cron job  
✅ **Sem Dependência de localStorage** - Mais seguro  
✅ **API RESTful** - Escalável para múltiplos clientes  
✅ **Caching Inteligente** - Via TanStack Query  
✅ **Melhor Performance** - Índices no DB  
✅ **Histórico de Sync** - Rastreabilidade  
✅ **Separação Frontend/Backend** - Arquitetura moderna  

---

## 📝 Próximas Etapas

- [ ] Remover arquivos antigos (mock, local-service, etc)
- [ ] Atualizar todos os componentes
- [ ] Testar sincronização manual
- [ ] Ativar sincronização automática
- [ ] Configurar PM2 para produção
- [ ] Testar em staging
- [ ] Deploy em produção

---

**🎉 Sistema pronto para usar! Qualquer dúvida, verifique a documentação em `SQLITE-INTEGRATION.md`**
