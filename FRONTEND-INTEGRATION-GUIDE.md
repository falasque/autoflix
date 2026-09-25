# 📱 Guia de Integração Frontend com API SQLite

## 🎯 Objetivo

Conectar o frontend React com a API backend que sincroniza dados do XML para SQLite, removendo a dependência de mock data local.

## 📋 Componentes que Serão Alterados

### 1. **src/pages/Index.tsx** ✅
**Mudança**: Usar `useVehicles()` hook ao invés de `fetchVehiclesFromXml()`

**Antes:**
```typescript
const { data: vehicles = [], isLoading, error } = useQuery({
  queryKey: ['vehicles'],
  queryFn: fetchVehiclesFromXml,
  staleTime: 1000 * 60 * 5,
  retry: 2,
});
```

**Depois:**
```typescript
const { data: vehicles = [], isLoading, error } = useVehicles({
  limit: 100, // Carregar todos para fazer filtros client-side
  page: 1,
  sort: 'random'
});
```

---

### 2. **src/pages/VehicleDetails.tsx** ✅
**Mudança**: Usar `useVehicleById()` para buscar um veículo específico

**Antes:**
```typescript
const { data: vehicles = [], isLoading } = useQuery({
  queryKey: ['vehicles'],
  queryFn: () => localVehicleService.getVehicles(),
  staleTime: 5 * 60 * 1000,
});
```

**Depois:**
```typescript
const { data: vehicle, isLoading, error } = useVehicleById(slug);
```

---

### 3. **src/components/AdminDashboard.tsx** ⚠️
**Mudança**: Usar `useManualSync()` para disparar sincronização

**Antes:**
```typescript
// Botão manual para sync (se existir)
```

**Depois:**
```typescript
const { mutate: triggerSync, isPending } = useManualSync();

const handleSync = () => {
  triggerSync(undefined, {
    onSuccess: (result) => {
      console.log('✅ Sincronização concluída:', result);
    },
    onError: (error) => {
      console.error('❌ Erro na sincronização:', error);
    }
  });
};
```

---

## 🔧 Estrutura de Imports Necessários

```typescript
// Novos imports para usar
import { 
  useVehicles, 
  useVehicleById, 
  useManualSync, 
  useFilterOptions,
  useSyncInfo,
  useSyncHistory
} from '@/hooks/use-vehicle-data';

// Remover estes imports
import { fetchVehiclesFromXml } from '@/lib/xml-service';
import { localVehicleService } from '@/lib/local-vehicle-service';
```

---

## ✨ Benefícios da Integração

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Dados** | Mock local + localStorage | API SQLite em tempo real |
| **Sincronização** | Manual via XML | Automática via cron + manual |
| **Performance** | Lento (carrega tudo) | Rápido com paginação |
| **Cache** | localStorage | TanStack Query (5 min default) |
| **Filtros** | No frontend | Pode fazer no backend ou frontend |
| **Imagens** | Limitadas | Todas do S3 (13+ por veículo) |
| **Features** | Não tinha | Agora com accessories parsing |

---

## 📝 Passo a Passo de Implementação

### ✅ Passo 1: Atualizar Index.tsx
1. Remover import de `fetchVehiclesFromXml`
2. Adicionar import de `useVehicles`
3. Substituir a chamada do useQuery
4. Manter toda a lógica de filtros client-side (igual está)

### ✅ Passo 2: Atualizar VehicleDetails.tsx
1. Remover import de `localVehicleService`
2. Adicionar import de `useVehicleById`
3. Substituir a busca de veículo único
4. Adicionar tratamento de erro melhorado

### ⚠️ Passo 3: Atualizar AdminDashboard.tsx (Opcional)
1. Adicionar botão para sync manual (se não tiver)
2. Usar `useManualSync()` mutation
3. Mostrar resultado do sync

### 🗑️ Passo 4: Remover Dependências Antigas
1. Remover `fetchVehiclesFromXml` do Index.tsx
2. Remover `localVehicleService.getVehicles()`
3. Verificar se pode remover arquivos:
   - `src/lib/mock-data.ts` (se só tinha veículos)
   - `src/lib/mock-vehicles.ts` (se não está mais sendo usado)
   - `src/lib/local-vehicle-service.ts` (se não está em outros places)

---

## 🧪 Testando a Integração

### 1. Frontend Carregando Dados
```bash
# Abrir browser com DevTools
# Procurar por: "✅ Parsed X vehicles"
# Verificar Network tab: GET /api/vehicles
```

### 2. Verificar Cache do TanStack Query
```javascript
// No console do browser
window.__react_query_devtools_open = true;
```

### 3. Testar Filtros
- Filtrar por marca: deve funcionar igual
- Buscar por texto: deve funcionar igual
- Ordenar: deve funcionar igual

### 4. Testar Detalhes
- Clicar em um veículo
- Deve carregar com todas as imagens do S3
- Features devem estar visíveis

---

## 🚀 Próximas Etapas

1. **Deploy do Backend**
   - Configurar no servidor de produção
   - Definir .env com XML_URL válida
   - Testar cron job de sincronização

2. **Otimizações**
   - Implementar Server-Side Pagination (SSP) no Index
   - Cache mais agressivo para listagem
   - Pre-load de imagens

3. **Admin Dashboard**
   - Criar dashboard para monitorar syncs
   - Ver histórico de sincronizações
   - Estatísticas de veículos

---

## 📊 Estrutura de Dados Esperada

### Resposta de `/api/vehicles`
```json
{
  "data": [
    {
      "id": "7485108",
      "slug": "peugeot-partrapid-busipk-2023",
      "name": "peugeot partrapid busipk 2023",
      "brand": "peugeot",
      "model": "partrapid busipk",
      "year": 2023,
      "price": 72900,
      "mileage": 56011,
      "fuel": "Flex",
      "transmission": "Manual",
      "color": "branco",
      "doors": 2,
      "image": "https://s3.carro57.com.br/FC/11466/7485108_2_O_92327badcd.jpeg",
      "images": ["url1", "url2", ...],
      "features": ["cambio manual", "ar quente", ...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 61,
    "pages": 7
  }
}
```

---

## ⚡ Performance Esperada

- **Carregamento Inicial**: ~500ms (com cache)
- **Filtro por Marca**: ~50ms (client-side)
- **Busca de Texto**: ~50ms (client-side)
- **Sincronização Manual**: ~2s (via POST /api/sync/trigger)

---

## 🔍 Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro 404 na API | Verificar se servidor está rodando na porta 3001 |
| Veículos não carregam | Verificar console do navegador para erros |
| Cache não atualiza | Limpar cache via DevTools ou aguardar 5 minutos |
| Imagens não mostram | Verificar URLs do S3 no banco de dados |

---

## ✅ Checklist de Conclusão

- [ ] Index.tsx atualizado com useVehicles()
- [ ] VehicleDetails.tsx atualizado com useVehicleById()
- [ ] AdminDashboard.tsx atualizado (se aplicável)
- [ ] Todos os imports antigos removidos
- [ ] Frontend testado e funcionando
- [ ] Backend rodando corretamente
- [ ] Cache funcionando (F5 rápido não refaz requisição)
- [ ] Filtros funcionando
- [ ] Paginação funcionando (se houver)

---

**Status**: 🔄 Em Implementação
**Próxima Ação**: Executar mudanças no Index.tsx

