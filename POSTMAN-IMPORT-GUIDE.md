# 📮 Importar Coleção Postman - Guia Rápido

## ✅ Arquivo Criado

Foi criado o arquivo: **`Autoflix-SQLite-API.postman_collection.json`**

Este arquivo contém **todas as rotas** do seu backend organizadas em pastas.

---

## 📥 Como Importar no Postman

### Método 1: Arrastar e Soltar (Mais Fácil)

1. Abra **Postman**
2. Abra a pasta do projeto: `c:\Users\José\Desktop\novo`
3. Procure o arquivo `Autoflix-SQLite-API.postman_collection.json`
4. **Arraste e solte** o arquivo na janela do Postman
5. Clique em **Import** quando pedido

### Método 2: Via Menu (Se Arrastar Não Funcionar)

1. Abra **Postman**
2. Clique em **File** → **Import**
3. Selecione **Upload Files**
4. Navegue até: `c:\Users\José\Desktop\novo\Autoflix-SQLite-API.postman_collection.json`
5. Clique em **Open** → **Import**

### Método 3: Link Local (Se tiver extensão)

1. Abra **Postman**
2. Clique em **Collections** (lado esquerdo)
3. Clique no botão **+** ou **Import**
4. Cole o caminho: `c:\Users\José\Desktop\novo\Autoflix-SQLite-API.postman_collection.json`
5. Clique em **Import**

---

## 🎯 Após Importar

Você verá na aba **Collections** uma estrutura assim:

```
📁 Autoflix SQLite API
├── Health Check
│   └── GET Health
├── Veículos
│   ├── GET Listar Todos os Veículos
│   ├── GET Listar com Filtro - Marca
│   ├── GET Listar com Filtro - Combustível
│   ├── GET Listar com Filtro - Preço
│   ├── GET Listar com Filtro - Ano
│   ├── GET Buscar por Texto
│   ├── GET Filtros Combinados
│   ├── GET Ordenar por Preço (ASC)
│   ├── GET Detalhes de um Veículo (por ID)
│   └── GET Detalhes de um Veículo (por Slug)
├── Filtros
│   └── GET Opções de Filtros
├── Estatísticas
│   └── GET Visão Geral das Estatísticas
└── Sincronização
    ├── POST Sincronizar Agora (Manual)
    ├── GET Informações da Última Sincronização
    └── GET Histórico de Sincronizações
```

---

## 🔧 Configurar Variável Base URL

Se estiver rodando em outra porta, edite a variável:

1. Clique na coleção **Autoflix SQLite API**
2. Vá para aba **Variables**
3. Mude `base_url` para sua URL:
   - **Local**: `http://localhost:3001`
   - **Staging**: `https://staging-api.autoflix.com.br`
   - **Produção**: `https://api.autoflix.com.br`

---

## 🚀 Testar Rotas

### 1. Começar pelo Health Check

1. Clique em: **Health Check** → **Health**
2. Clique em **Send**
3. Veja o resultado:

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T10:30:00.000Z"
}
```

### 2. Testar Listar Veículos

1. Clique em: **Veículos** → **Listar Todos os Veículos**
2. Clique em **Send**
3. Veja a lista de veículos

### 3. Testar Sincronização

1. Clique em: **Sincronização** → **Sincronizar Agora (Manual)**
2. Clique em **Send**
3. Espere a sincronização completar

---

## 📋 Rotas Disponíveis

### 🏥 Health Check
- `GET /health` - Status do servidor

### 🚗 Veículos
- `GET /api/vehicles` - Listar com paginação
- `GET /api/vehicles?brand=Toyota` - Filtrar por marca
- `GET /api/vehicles?fuel=Gasolina` - Filtrar por combustível
- `GET /api/vehicles?priceMin=50000&priceMax=150000` - Filtrar por preço
- `GET /api/vehicles?year=2020` - Filtrar por ano
- `GET /api/vehicles?search=Honda` - Buscar texto
- `GET /api/vehicles?sort=price&order=ASC` - Ordenar
- `GET /api/vehicles/:id` - Detalhes por ID
- `GET /api/vehicles/:slug` - Detalhes por slug

### 🔍 Filtros
- `GET /api/vehicles/filters/options` - Opções disponíveis

### 📊 Estatísticas
- `GET /api/vehicles/stats/overview` - Estatísticas gerais

### 🔄 Sincronização
- `POST /api/sync/trigger` - Forçar sincronização
- `GET /api/sync/info` - Última sincronização
- `GET /api/sync/history` - Histórico de syncs

---

## 💡 Dicas

1. **Variáveis**: Use `{{base_url}}` para mudar URL facilmente
2. **Ambientes**: Crie ambientes diferentes (dev, staging, prod)
3. **Pre-request**: Adicione scripts antes de requisições
4. **Tests**: Adicione validações nas respostas
5. **Documentação**: Cada rota tem descrição no campo "Description"

---

## 🆘 Erro ao Importar?

Se receber erro na importação:

1. Verifique se o arquivo `Autoflix-SQLite-API.postman_collection.json` existe
2. Abra o arquivo com um editor de texto e verifique se é JSON válido
3. Tente novamente ou crie manualmente as rotas

---

## 📝 Próximas Etapas

Após importar:

1. ✅ Testar rotas localmente
2. ✅ Ajustar base_url conforme necessário
3. ✅ Criar testes para validar respostas
4. ✅ Usar para documentação do time

---

**✨ Pronto para testar suas rotas no Postman!**
