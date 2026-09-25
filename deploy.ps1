# Script PowerShell para preparar deploy automatizado
# Este script compacta a pasta dist em um ZIP pronto para upload

$projectPath = Get-Location
$distPath = Join-Path $projectPath "dist"
$deployPath = Join-Path $projectPath "autoflix-deploy.zip"

Write-Host "🚀 Preparando deploy automático..." -ForegroundColor Green

# Verificar se pasta dist existe
if (-not (Test-Path $distPath)) {
    Write-Host "❌ Pasta dist não encontrada! Execute 'npm run build' primeiro." -ForegroundColor Red
    exit 1
}

# Remover ZIP anterior se existir
if (Test-Path $deployPath) {
    Remove-Item $deployPath -Force
    Write-Host "🗑️ ZIP anterior removido" -ForegroundColor Yellow
}

# Criar ZIP com todo conteúdo da pasta dist
Write-Host "📦 Compactando pasta dist..." -ForegroundColor Cyan
Compress-Archive -Path "$distPath\*" -DestinationPath $deployPath -Force

# Mostrar resumo
$zipSize = (Get-Item $deployPath).Length / 1MB
Write-Host "✅ Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host "📁 Arquivo: autoflix-deploy.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor White

Write-Host "`n🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Faça upload do arquivo 'autoflix-deploy.zip' para o servidor" -ForegroundColor White
Write-Host "2. No servidor, extraia o conteúdo em: /www/wwwroot/autoflix.com.br/dist/" -ForegroundColor White
Write-Host "3. Substitua todos os arquivos existentes" -ForegroundColor White
Write-Host "4. Teste o site e limpe cache do navegador" -ForegroundColor White

Write-Host "`n🔧 Comandos no servidor (via SSH):" -ForegroundColor Cyan
Write-Host "cd /www/wwwroot/autoflix.com.br/dist" -ForegroundColor Gray
Write-Host "unzip -o autoflix-deploy.zip" -ForegroundColor Gray
Write-Host "rm autoflix-deploy.zip" -ForegroundColor Gray

Write-Host "`n📊 Arquivos incluídos:" -ForegroundColor Cyan
Get-ChildItem $distPath | ForEach-Object { 
    $type = if ($_.PSIsContainer) { "📁" } else { "📄" }
    Write-Host "  $type $($_.Name)" -ForegroundColor White
}