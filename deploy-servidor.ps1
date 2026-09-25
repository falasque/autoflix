# Script para Deploy no Servidor com Build Remoto
# Este script faz upload do código fonte e executa o build diretamente no servidor

Write-Host "🚀 AUTOFLIX - Deploy com Build no Servidor" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Configurações (AJUSTE ESTAS VARIÁVEIS)
$SERVIDOR_HOST = "SEU_IP_SERVIDOR"  # Ex: "123.45.67.89"
$SERVIDOR_USER = "root"              # Usuário SSH
$SERVIDOR_PATH = "/www/wwwroot/autoflix.com.br"  # Caminho no servidor
$LOCAL_PATH = Get-Location           # Pasta atual

Write-Host "📋 Configurações:" -ForegroundColor Yellow
Write-Host "   Servidor: $SERVIDOR_HOST" -ForegroundColor White
Write-Host "   Usuário: $SERVIDOR_USER" -ForegroundColor White
Write-Host "   Caminho: $SERVIDOR_PATH" -ForegroundColor White
Write-Host "   Local: $LOCAL_PATH" -ForegroundColor White
Write-Host ""

# Função para executar comandos SSH
function Invoke-SSH {
    param($Command)
    Write-Host "🔧 Executando: $Command" -ForegroundColor Cyan
    ssh $SERVIDOR_USER@$SERVIDOR_HOST $Command
}

# Função para fazer upload via SCP
function Invoke-SCP {
    param($Source, $Destination)
    Write-Host "📤 Upload: $Source -> $Destination" -ForegroundColor Cyan
    scp -r $Source "${SERVIDOR_USER}@${SERVIDOR_HOST}:${Destination}"
}

Write-Host "🔍 Verificando conexão SSH..." -ForegroundColor Yellow
try {
    Invoke-SSH "echo 'Conexão OK'"
    Write-Host "✅ Conexão SSH estabelecida" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro de conexão SSH. Verifique:" -ForegroundColor Red
    Write-Host "   1. IP/usuário corretos" -ForegroundColor White
    Write-Host "   2. Chave SSH configurada" -ForegroundColor White
    Write-Host "   3. Servidor acessível" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "📦 Preparando arquivos para upload..." -ForegroundColor Yellow

# Lista de arquivos/pastas essenciais para o build
$ARQUIVOS_ESSENCIAIS = @(
    "src/",
    "public/",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tailwind.config.ts",
    "postcss.config.js",
    "components.json",
    "eslint.config.js",
    "index.html"
)

# Verifica se todos os arquivos existem
foreach ($arquivo in $ARQUIVOS_ESSENCIAIS) {
    if (!(Test-Path $arquivo)) {
        Write-Host "❌ Arquivo não encontrado: $arquivo" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Todos os arquivos essenciais encontrados" -ForegroundColor Green
Write-Host ""

Write-Host "🗂️ Criando backup da pasta atual no servidor..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Invoke-SSH "cd $SERVIDOR_PATH && cp -r dist dist-backup-$timestamp 2>/dev/null || echo 'Sem dist para backup'"

Write-Host "📤 Fazendo upload dos arquivos fonte..." -ForegroundColor Yellow

# Cria pasta temporária no servidor para o código fonte
Invoke-SSH "mkdir -p $SERVIDOR_PATH/src-temp"

# Upload dos arquivos essenciais
foreach ($arquivo in $ARQUIVOS_ESSENCIAIS) {
    Write-Host "📎 Enviando: $arquivo" -ForegroundColor White
    Invoke-SCP "$LOCAL_PATH\$arquivo" "$SERVIDOR_PATH/src-temp/"
}

Write-Host ""
Write-Host "🔧 Verificando Node.js no servidor..." -ForegroundColor Yellow
$nodeVersion = Invoke-SSH "node --version 2>/dev/null || echo 'NODE_NOT_FOUND'"
if ($nodeVersion -eq "NODE_NOT_FOUND") {
    Write-Host "❌ Node.js não encontrado no servidor!" -ForegroundColor Red
    Write-Host "💡 Instale Node.js no servidor primeiro:" -ForegroundColor Yellow
    Write-Host "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -" -ForegroundColor White
    Write-Host "   sudo apt-get install -y nodejs" -ForegroundColor White
    exit 1
} else {
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Instalando dependências no servidor..." -ForegroundColor Yellow
Invoke-SSH "cd $SERVIDOR_PATH/src-temp && npm install --production=false"

Write-Host ""
Write-Host "🏗️ Executando build no servidor..." -ForegroundColor Yellow
Invoke-SSH "cd $SERVIDOR_PATH/src-temp && npm run build"

Write-Host ""
Write-Host "🔄 Substituindo arquivos de produção..." -ForegroundColor Yellow
# Remove dist atual e move o novo
Invoke-SSH "cd $SERVIDOR_PATH && rm -rf dist && mv src-temp/dist . && rm -rf src-temp"

Write-Host ""
Write-Host "🧹 Limpeza de arquivos temporários..." -ForegroundColor Yellow
Invoke-SSH "cd $SERVIDOR_PATH && find . -name 'node_modules' -type d -exec rm -rf {} + 2>/dev/null || true"

Write-Host ""
Write-Host "🔄 Recarregando Nginx..." -ForegroundColor Yellow
Invoke-SSH "nginx -t && nginx -s reload"

Write-Host ""
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🌐 Site: https://autoflix.com.br" -ForegroundColor White
Write-Host "🔧 Admin: https://autoflix.com.br/admin" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Teste o site principal" -ForegroundColor White
Write-Host "   2. Acesse o painel admin" -ForegroundColor White
Write-Host "   3. Teste 'Sincronizar Agora'" -ForegroundColor White
Write-Host "   4. Verifique se encontra os 60 veículos" -ForegroundColor White
Write-Host ""