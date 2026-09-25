# 🧪 Teste de Open Graph Tags para WhatsApp/Facebook
# Este script PowerShell testa se o sistema de meta tags dinâmicas está funcionando

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🧪 TESTE DE OPEN GRAPH TAGS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# URL para testar
$URL = "https://autoflix.com.br/veiculo/fiat-siena-el-flex-2010"
$API_URL = "https://api.autoflix.com.br/api/vehicles"

# TESTE 1: Verificar .htaccess
Write-Host "📋 TESTE 1: Verificar se .htaccess existe" -ForegroundColor Yellow
if (Test-Path "public\.htaccess") {
    Write-Host "✅ .htaccess encontrado em public/" -ForegroundColor Green
} else {
    Write-Host "❌ .htaccess NÃO encontrado em public/" -ForegroundColor Red
}
Write-Host ""

# TESTE 2: Verificar og-meta.php
Write-Host "📋 TESTE 2: Verificar se og-meta.php existe" -ForegroundColor Yellow
if (Test-Path "api\og-meta.php") {
    Write-Host "✅ og-meta.php encontrado em api/" -ForegroundColor Green
} else {
    Write-Host "❌ og-meta.php NÃO encontrado em api/" -ForegroundColor Red
}
Write-Host ""

# TESTE 3: Testar API
Write-Host "📋 TESTE 3: Testar API de veículos" -ForegroundColor Yellow
Write-Host "URL: $API_URL"
try {
    $response = Invoke-WebRequest -Uri $API_URL -Method Get -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API funcionando (HTTP $($response.StatusCode))" -ForegroundColor Green
        $vehicles = ($response.Content | ConvertFrom-Json).data
        Write-Host "   Total de veículos: $($vehicles.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ API com erro: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# TESTE 4: Simular acesso do Facebook Bot
Write-Host "📋 TESTE 4: Simular acesso do Facebook Bot (PRODUÇÃO)" -ForegroundColor Yellow
Write-Host "URL: $URL"
Write-Host "User-Agent: facebookexternalhit/1.1"
Write-Host ""
try {
    $headers = @{
        "User-Agent" = "facebookexternalhit/1.1"
    }
    $response = Invoke-WebRequest -Uri $URL -Headers $headers -UseBasicParsing -ErrorAction Stop
    
    # Extrair meta tags Open Graph
    $ogTags = $response.Content -split "`n" | Where-Object { $_ -match "og:" }
    
    if ($ogTags.Count -gt 0) {
        Write-Host "✅ Meta tags Open Graph encontradas:" -ForegroundColor Green
        $ogTags | Select-Object -First 5 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Nenhuma meta tag Open Graph encontrada" -ForegroundColor Yellow
        Write-Host "   Isso pode significar que o .htaccess não está ativo" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao acessar URL: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# TESTE 5: Verificar conteúdo do .htaccess
Write-Host "📋 TESTE 5: Verificar regras do .htaccess" -ForegroundColor Yellow
if (Test-Path "public\.htaccess") {
    $htaccessContent = Get-Content "public\.htaccess" -Raw
    if ($htaccessContent -match "facebookexternalhit|WhatsApp") {
        Write-Host "✅ Regras de detecção de bots encontradas" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Regras de bots não encontradas no .htaccess" -ForegroundColor Yellow
    }
    
    if ($htaccessContent -match "og-meta\.php") {
        Write-Host "✅ Redirecionamento para og-meta.php configurado" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Redirecionamento para og-meta.php não encontrado" -ForegroundColor Yellow
    }
}
Write-Host ""

# TESTE 6: Verificar configuração da API no og-meta.php
Write-Host "📋 TESTE 6: Verificar configuração da API no og-meta.php" -ForegroundColor Yellow
if (Test-Path "api\og-meta.php") {
    $phpContent = Get-Content "api\og-meta.php" -Raw
    if ($phpContent -match "api\.autoflix\.com\.br") {
        Write-Host "✅ URL da API produção configurada" -ForegroundColor Green
    } else {
        Write-Host "⚠️ URL da API pode estar incorreta" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔍 INSTRUÇÕES DE TESTE MANUAL" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣ Facebook Sharing Debugger:" -ForegroundColor White
Write-Host "   https://developers.facebook.com/tools/debug/" -ForegroundColor Gray
Write-Host "   Cole: $URL" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣ LinkedIn Post Inspector:" -ForegroundColor White
Write-Host "   https://www.linkedin.com/post-inspector/" -ForegroundColor Gray
Write-Host "   Cole: $URL" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣ Twitter Card Validator:" -ForegroundColor White
Write-Host "   https://cards-dev.twitter.com/validator" -ForegroundColor Gray
Write-Host "   Cole: $URL" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣ WhatsApp (teste real):" -ForegroundColor White
Write-Host "   Envie para você mesmo: $URL" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣ Teste via CURL (se tiver instalado):" -ForegroundColor White
Write-Host "   curl -A ""facebookexternalhit"" $URL" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ TESTE CONCLUÍDO" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. Se os testes locais passaram, faca upload para producao" -ForegroundColor Gray
Write-Host "   2. Siga o guia: DEPLOY-OG-TAGS.md" -ForegroundColor Gray
Write-Host "   3. Teste com Facebook Debugger apos deploy" -ForegroundColor Gray
Write-Host "   4. Limpe cache do WhatsApp/Facebook se necessario" -ForegroundColor Gray
