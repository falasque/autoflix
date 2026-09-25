# ✅ CHECKLIST DE IMPLEMENTAÇÃO - SISTEMA SQLite

## 📋 Fase 1: Preparação

- [ ] Revisar documentação:
  - [ ] `RESUMO-SQLITE-IMPLEMENTATION.md`
  - [ ] `SQLITE-INTEGRATION.md`
  - [ ] `ARQUITETURA-DETALHADA.md`

- [ ] Instalar backend:
  ```bash
  cd server
  npm install
  ```

- [ ] Configurar variáveis:
  ```bash
  cp server/.env.example server/.env
  # Editar server/.env com XML_URL correto
  ```

---

## 🚀 Fase 2: Testes Iniciais

### Backend

- [ ] Iniciar servidor backend:
  ```bash
  cd server
  npm run dev
  ```

- [ ] Verificar health check:
  ```bash
  curl http://localhost:3001/health
  # Deve retornar: {"status":"ok","timestamp":"..."}
  ```

- [ ] Verificar estrutura do banco:
  ```bash
  sqlite3 server/data/vehicles.db ".tables"
  # Deve mostrar: sync_log site_config vehicle_features vehicle_images vehicles
  ```

### Frontend

- [ ] Instalar TanStack Query (se necessário):
  ```bash
  npm install @tanstack/react-query
  ```

- [ ] Iniciar frontend:
  ```bash
  npm run dev
  # Deve rodar em http://localhost:5173
  ```

- [ ] Verificar console do navegador:
  - Sem erros de CORS
  - Sem erros de TypeScript
  - Hooks estão disponíveis

---

## 🔄 Fase 3: Sincronização

### Sincronizar Manualmente

- [ ] Via API (Postman/Insomnia):
  ```bash
  POST http://localhost:3001/api/sync/trigger
  ```

- [ ] Verificar resposta:
  ```json
  {
    "success": true,
    "message": "Sync completed successfully",
    "result": {
      "added": X,
      "updated": Y,
      "removed": Z,
      "total": N,
      "duration": "Zs"
    }
  }
  ```

- [ ] Verificar dados no banco:
  ```bash
  sqlite3 server/data/vehicles.db "SELECT COUNT(*) FROM vehicles;"
  ```

- [ ] Verificar histórico de sync:
  ```bash
  sqlite3 server/data/vehicles.db "SELECT * FROM sync_log ORDER BY sync_date DESC LIMIT 1;"
  ```

### Testar Endpoints

- [ ] GET `/api/vehicles`:
  ```bash
  curl "http://localhost:3001/api/vehicles?page=1&limit=5"
  ```

- [ ] GET `/api/vehicles/filters/options`:
  ```bash
  curl http://localhost:3001/api/vehicles/filters/options
  ```

- [ ] GET `/api/sync/info`:
  ```bash
  curl http://localhost:3001/api/sync/info
  ```

---

## 🎨 Fase 4: Integração Frontend

### Atualizar Componentes

- [ ] Backup do arquivo original:
  ```bash
  git add -A && git commit -m "Backup antes de integrar SQLite"
  ```

- [ ] Remover imports antigos de:
  - `mock-vehicles.ts`
  - `local-vehicle-service.ts`
  - `vehicle-sync-service.ts`
  - `api-vehicle-service.ts`

- [ ] Adicionar import novo:
  ```typescript
  import { useVehicles } from '@/hooks/use-vehicle-data';
  ```

- [ ] Atualizar páginas:
  - [ ] `pages/Index.tsx` - Usar `useVehicles()`
  - [ ] `pages/VehicleDetails.tsx` - Usar `useVehicleById()`
  - [ ] `pages/AdminDashboard.tsx` - Usar `useManualSync()`

- [ ] Testar cada página:
  - [ ] Listar veículos funciona
  - [ ] Filtros funcionam
  - [ ] Paginação funciona
  - [ ] Detalhes de veículo funciona
  - [ ] Admin sync funciona

---

## 🧪 Fase 5: Testes

### Testes Manuais

- [ ] **Fluxo de Usuário**:
  - [ ] Acessar home - mostra veículos
  - [ ] Filtrar por marca - funciona
  - [ ] Filtrar por preço - funciona
  - [ ] Buscar por texto - funciona
  - [ ] Mudar de página - funciona
  - [ ] Clicar em veículo - mostra detalhes

- [ ] **Fluxo de Admin**:
  - [ ] Dashboard carrega
  - [ ] Botão "Sincronizar Agora" funciona
  - [ ] Sincronização completa com sucesso
  - [ ] Dados atualizam em tempo real
  - [ ] Histórico de sync mostra

- [ ] **Performance**:
  - [ ] Primeira carga: <2s
  - [ ] Carga com cache: <500ms
  - [ ] Mudança de página: <1s
  - [ ] Busca/filtro: <1s

- [ ] **Erros**:
  - [ ] Backend cai: API retorna erro
  - [ ] Rede falha: Mostra mensagem de erro
  - [ ] XML inválido: Sincronização falha graciosamente

### Testes de Sincronização

- [ ] **Adicionar dados**:
  - [ ] Novo XML com mais veículos
  - [ ] Sincronizar
  - [ ] Verificar se novos aparecem

- [ ] **Atualizar dados**:
  - [ ] Modificar preço em XML (mock)
  - [ ] Sincronizar
  - [ ] Verificar se preço mudou no DB

- [ ] **Remover dados**:
  - [ ] Remover veículo de XML (mock)
  - [ ] Sincronizar
  - [ ] Verificar se foi deletado do DB

---

## 🧹 Fase 6: Limpeza

### Remover Arquivos Não Usados

```bash
# ❌ Remover esses arquivos
rm src/lib/mock-vehicles.ts
rm src/lib/local-vehicle-service.ts
rm src/lib/vehicle-sync-service.ts
rm src/lib/api-vehicle-service.ts

# ✅ Manter esses
src/lib/database-vehicle-service.ts
src/hooks/use-vehicle-data.ts
```

### Remover Imports Antigos

- [ ] Procurar por:
  ```bash
  grep -r "mock-vehicles\|local-vehicle-service\|vehicle-sync-service\|api-vehicle-service" src/
  ```

- [ ] Remover todos os imports encontrados

- [ ] Verificar se compila:
  ```bash
  npm run type-check
  ```

### Remover localStorage que não é mais usado

- [ ] Remover localStorage de veículos em:
  - `localStorage.removeItem('verda-auto-vehicles-cache')`
  - `localStorage.removeItem('autoflix-vehicles-api-cache')`
  - Manter apenas site-config

---

## 📦 Fase 7: Deploy

### Staging

- [ ] Fazer build:
  ```bash
  npm run build
  ```

- [ ] Verificar dist:
  ```bash
  npm run preview
  ```

- [ ] Backend em staging:
  ```bash
  NODE_ENV=production npm start
  ```

### Produção

- [ ] Configurar `.env` de produção:
  ```env
  NODE_ENV=production
  PORT=3001
  DB_PATH=/var/lib/autoflix/vehicles.db
  CORS_ORIGIN=https://autoflix.com.br
  ```

- [ ] Configurar frontend para produção:
  ```env
  VITE_API_URL=https://api.autoflix.com.br
  ```

- [ ] Deploy backend com PM2:
  ```bash
  npm install -g pm2
  pm2 start server/src/server.js --name "autoflix-api"
  pm2 save
  pm2 startup
  ```

- [ ] Deploy frontend:
  ```bash
  npm run build
  # Upload dist/ para servidor
  ```

- [ ] Configurar Nginx reverse proxy
- [ ] Testar HTTPS/SSL
- [ ] Testar sincronização em produção

---

## 📊 Fase 8: Monitoramento

### Logs

- [ ] Verificar logs do backend:
  ```bash
  pm2 logs autoflix-api
  ```

- [ ] Verificar logs de sync:
  ```bash
  sqlite3 vehicles.db "SELECT * FROM sync_log ORDER BY sync_date DESC LIMIT 10;"
  ```

### Health Checks

- [ ] Status do servidor:
  ```bash
  curl https://autoflix.com.br/api/health
  ```

- [ ] Contar veículos:
  ```bash
  sqlite3 vehicles.db "SELECT COUNT(*) FROM vehicles;"
  ```

### Alertas

- [ ] Sincronização falhou 3x seguidas
- [ ] Banco de dados cresceu muito (>1GB)
- [ ] API retornando erros 5xx
- [ ] Lentidão na resposta (>5s)

---

## 🎯 Checklist Final

### Antes do Deploy

- [ ] Código sem erros
- [ ] Testes passando
- [ ] Sincronização funcionando
- [ ] Performance aceitável
- [ ] Dados consistentes
- [ ] Sem console.logs de debug
- [ ] Documentação atualizada

### Após o Deploy

- [ ] Verificar health check
- [ ] Testar primeiros veículos
- [ ] Testar sincronização
- [ ] Monitorar por 24h
- [ ] Comunicar ao time
- [ ] Documentar issues

---

## 🆘 Rollback (se necessário)

```bash
# Reverter para versão anterior
git revert HEAD

# Backend
cd server
git checkout main
npm install
npm start

# Frontend
git checkout main
npm install
npm run build
```

---

## 📞 Contatos de Suporte

- **Erro no Backend**: Ver logs com `npm run dev`
- **Erro no Frontend**: Ver console do navegador (F12)
- **Banco de Dados**: `sqlite3 server/data/vehicles.db`
- **Documentação**: Ver arquivos MD neste diretório

---

**✅ Após completar todos os itens, seu sistema estará pronto para produção!**

Data: 30/10/2025
Versão: 1.0.0
