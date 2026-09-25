# Verda Auto Show - Sistema Administrativo

## 🚀 Como executar o projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm

### Instalação e execução
```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

O site estará disponível em: http://localhost:8080/

## 🔐 Sistema Administrativo

### Acessar o Admin
1. Vá para: http://localhost:8080/admin/login
2. Use a senha: **admin123**
3. Você terá acesso ao dashboard administrativo

### Funcionalidades do Admin

O dashboard possui **6 abas organizadas**:

1. **Geral** - Informações básicas do site
2. **Contato** - Dados de contato e endereço  
4. **Personalizar**: Use as 6 abas do dashboard para configurar tudo!

### 🧪 **Testando a URL do XML**

1. **Acesse a aba "Dados"** no dashboard admin
2. **Cole a URL do XML** no campo correspondente
3. **Clique em "Testar"** para verificar a conexão
4. **Veja o resultado**:
   - ✅ **Sucesso**: Mostra quantos veículos foram encontrados
   - ❌ **Erro**: Mostra detalhes do problema
5. **Salve as alterações** para aplicar a nova URL
4. **Hero Section** - Seção principal do site
5. **Redes Sociais** - Links das redes sociais
6. **Dados** - Configuração da fonte de dados XML

#### 🎨 Personalização Visual
- **Cores do Site**: Personalize a paleta de cores completa
- **Logo**: Configure a logo do site
- **Hero Section**: Edite título, subtítulo e imagem de fundo

#### 📝 Informações do Site
- **Nome do Site**: Altere o nome que aparece no cabeçalho
- **Descrição**: Configure a descrição do negócio
- **Recursos/Diferenciais**: Liste os principais diferenciais

#### 📍 Informações de Contato
- **Endereço Completo**: Rua, cidade, estado, CEP
- **Telefone**: Número principal de contato
- **Email**: Email de contato
- **WhatsApp**: Número para WhatsApp

#### 🌐 Redes Sociais
- **Facebook**: Link da página no Facebook
- **Instagram**: Link do perfil no Instagram
- **Twitter**: Link do perfil no Twitter
- **LinkedIn**: Link da página no LinkedIn
- **WhatsApp**: Link direto para WhatsApp

#### 🗂️ Fontes de Dados
- **URL do XML**: Configure a URL do arquivo XML de veículos
- **Teste de Conexão**: Teste se a URL está funcionando corretamente
- **Validação**: Verifica se o XML está no formato correto
- **Contador de Veículos**: Mostra quantos veículos foram encontrados

### 🔒 Segurança
- Autenticação com senha criptografada
- Sessão expira em 24 horas
- Dados salvos localmente no navegador
- Sem banco de dados necessário

### 💾 Persistência de Dados
- Todas as configurações são salvas no localStorage do navegador
- As alterações são aplicadas em tempo real
- Possibilidade de resetar para configurações padrão

## 🛠️ Estrutura do Projeto

### Principais arquivos adicionados/modificados:

#### Contextos
- `src/contexts/AdminAuthContext.tsx` - Gerenciamento de autenticação
- `src/contexts/SiteConfigContext.tsx` - Gerenciamento de configurações

#### Páginas Admin
- `src/pages/AdminLogin.tsx` - Página de login
- `src/pages/AdminDashboard.tsx` - Dashboard administrativo

#### Utilitários
- `src/lib/auth.ts` - Sistema de autenticação
- `src/lib/config-manager.ts` - Gerenciador de configurações
- `src/lib/admin-types.ts` - Tipos TypeScript

#### Componentes
- `src/components/ProtectedRoute.tsx` - Proteção de rotas
- `src/components/DynamicStyles.tsx` - Aplicação dinâmica de estilos

### Scripts NPM Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

## 🎯 Recursos Implementados

### ✅ Concluído
- [x] Otimização para NPM
- [x] Sistema de autenticação seguro
- [x] Dashboard administrativo completo (6 abas)
- [x] Personalização de cores em tempo real
- [x] Gerenciamento de informações do site
- [x] Configuração de contatos e endereço
- [x] Gerenciamento de redes sociais
- [x] **Configuração de URL XML editável**
- [x] **Teste de conexão XML com validação**
- [x] **Contador de veículos no XML**
- [x] Aplicação dinâmica de estilos
- [x] Persistência local das configurações
- [x] Interface responsiva
- [x] Integração com componentes existentes

### 🔧 Detalhes Técnicos
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: Context API
- **Criptografia**: crypto-js
- **Cores**: react-colorful
- **Ícones**: Lucide React + React Icons

### 🎨 Personalização
O sistema permite personalizar:
- Nome e descrição do site
- Logo e favicon
- Paleta de cores completa
- Informações de contato
- Endereço da empresa
- Links de redes sociais
- Seção hero (título, subtítulo, background)
- Lista de recursos/diferenciais

### 📱 Responsividade
- Design responsivo em todas as telas
- Dashboard otimizado para desktop e mobile
- Interface adaptativa para diferentes dispositivos

## 🚀 Deploy

Para fazer deploy do projeto:

1. Execute `npm run build`
2. A pasta `dist/` conterá os arquivos otimizados
3. Faça upload dessa pasta para seu servidor

## 🔧 Customização Avançada

Para desenvolvedores que queiram modificar o sistema:

1. **Adicionar novos campos**: Edite `src/lib/admin-types.ts`
2. **Modificar autenticação**: Altere `src/lib/auth.ts`
3. **Personalizar dashboard**: Modifique `src/pages/AdminDashboard.tsx`
4. **Adicionar novos estilos**: Edite `src/components/DynamicStyles.tsx`

---

🎉 **Pronto para usar!** Seu site agora tem um sistema administrativo completo e personalizável.