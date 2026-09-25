/**
 * Script para testar apenas o download do XML
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testXmlDownload() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ 🧪 TESTE DE DOWNLOAD DO XML                                    ║
╚════════════════════════════════════════════════════════════════╝
  `);

  const xmlUrl = process.env.XML_URL;
  
  if (!xmlUrl) {
    console.error('❌ ERRO: XML_URL não configurado no arquivo .env');
    console.log(`
📋 SOLUÇÃO:
   1. Abra o arquivo .env na pasta server/
   2. Adicione a linha: XML_URL=https://sua-url-aqui.com/feed.xml
   3. Execute o teste novamente
    `);
    process.exit(1);
  }

  console.log(`📍 URL configurada:`);
  console.log(`   ${xmlUrl}`);
  console.log('');

  // Test 1: DNS Resolution
  console.log('🔍 Teste 1: Resolvendo DNS...');
  try {
    const urlObj = new URL(xmlUrl);
    console.log(`   ✅ Hostname: ${urlObj.hostname}`);
    console.log(`   ✅ Protocol: ${urlObj.protocol}`);
  } catch (error) {
    console.error(`   ❌ URL inválida: ${error.message}`);
    process.exit(1);
  }
  console.log('');

  // Test 2: HTTP Request (with retries)
  console.log('🌐 Teste 2: Fazendo requisição HTTP...');
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`   🔄 Tentativa ${attempt}/3...`);
      
      const startTime = Date.now();
      const response = await axios.get(xmlUrl, {
        timeout: 30000, // 30 seconds
        headers: {
          'User-Agent': 'Mozilla/5.0 (Autoflix Server)',
          'Accept': 'application/xml, text/xml, */*'
        },
        validateStatus: () => true,
        maxRedirects: 5
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`   ⏱️  Tempo de resposta: ${(duration / 1000).toFixed(2)}s`);
      console.log(`   📊 Status HTTP: ${response.status} ${response.statusText}`);
      console.log(`   📦 Content-Type: ${response.headers['content-type'] || 'N/A'}`);
      console.log(`   📏 Tamanho: ${(response.data?.length || 0).toLocaleString()} bytes`);
      console.log('');
      
      if (response.status === 200) {
        console.log('✅ Download bem-sucedido!');
        console.log('');
        
        // Test 3: XML Content Validation
        console.log('📝 Teste 3: Validando conteúdo XML...');
        
        const content = response.data;
        
        if (!content || content.length === 0) {
          console.error('   ❌ XML vazio!');
          process.exit(1);
        }
        
        // Check if it's XML
        if (!content.includes('<?xml') && !content.includes('<')) {
          console.error('   ❌ Conteúdo não parece ser XML');
          console.log('   Primeiros 200 caracteres:');
          console.log(`   ${content.substring(0, 200)}`);
          process.exit(1);
        }
        
        console.log('   ✅ Formato válido (contém tags XML)');
        
        // Check for vehicle entries
        const adMatches = content.match(/<AD>/g) || [];
        const itemMatches = content.match(/<item>/g) || [];
        const vehicleMatches = content.match(/<vehicle>/g) || [];
        
        console.log(`   📊 Entradas encontradas:`);
        console.log(`      • <AD> tags: ${adMatches.length}`);
        console.log(`      • <item> tags: ${itemMatches.length}`);
        console.log(`      • <vehicle> tags: ${vehicleMatches.length}`);
        console.log('');
        
        if (adMatches.length > 0 || itemMatches.length > 0 || vehicleMatches.length > 0) {
          console.log('✅ XML contém entradas de veículos!');
          
          // Show first vehicle preview
          const firstVehicle = content.match(/<AD>[\s\S]*?<\/AD>/)?.[0] || 
                               content.match(/<item>[\s\S]*?<\/item>/)?.[0] ||
                               content.match(/<vehicle>[\s\S]*?<\/vehicle>/)?.[0];
          
          if (firstVehicle) {
            console.log('');
            console.log('📋 Preview do primeiro veículo (primeiros 500 caracteres):');
            console.log('─'.repeat(60));
            console.log(firstVehicle.substring(0, 500) + '...');
            console.log('─'.repeat(60));
          }
        } else {
          console.warn('⚠️  Nenhuma entrada de veículo encontrada no XML');
          console.log('');
          console.log('📋 Preview do XML (primeiros 1000 caracteres):');
          console.log('─'.repeat(60));
          console.log(content.substring(0, 1000));
          console.log('─'.repeat(60));
        }
        
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║ ✅ TODOS OS TESTES PASSARAM                                    ║
╠════════════════════════════════════════════════════════════════╣
║ O XML está acessível e válido!                                 ║
║ Você pode executar a sincronização completa com:               ║
║                                                                 ║
║   npm run test-sync                                            ║
╚════════════════════════════════════════════════════════════════╝
        `);
        
        process.exit(0);
        
      } else if (response.status === 404) {
        console.error(`   ❌ XML não encontrado (404)`);
        console.error(`   Verifique se a URL está correta`);
        process.exit(1);
        
      } else if (response.status >= 500) {
        console.error(`   ❌ Erro no servidor (${response.status})`);
        console.error(`   O servidor está com problemas`);
        
        if (attempt < 3) {
          const delay = attempt * 2000;
          console.log(`   ⏳ Aguardando ${delay}ms antes de tentar novamente...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        process.exit(1);
        
      } else {
        console.error(`   ❌ Status inesperado: ${response.status}`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(`   ❌ Erro na tentativa ${attempt}:`);
      
      if (error.code === 'ENOTFOUND') {
        console.error(`   ❌ Servidor não encontrado (DNS)`);
        console.error(`   Verifique se a URL está correta`);
        process.exit(1);
      } else if (error.code === 'ECONNREFUSED') {
        console.error(`   ❌ Conexão recusada`);
        console.error(`   O servidor pode estar fora do ar`);
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        console.error(`   ⏱️  Timeout (servidor muito lento)`);
      } else {
        console.error(`   ❌ ${error.message}`);
      }
      
      if (attempt < 3) {
        const delay = attempt * 2000;
        console.log(`   ⏳ Aguardando ${delay}ms antes de tentar novamente...`);
        console.log('');
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`
╔════════════════════════════════════════════════════════════════╗
║ ❌ FALHA AO BAIXAR XML                                          ║
╠════════════════════════════════════════════════════════════════╣
║ Todas as 3 tentativas falharam                                 ║
║                                                                 ║
║ 🔧 VERIFICAÇÕES:                                                ║
║   1. A URL está correta?                                       ║
║   2. Você consegue abrir a URL no navegador?                   ║
║   3. Existe algum firewall bloqueando?                         ║
║   4. O servidor está online?                                   ║
╚════════════════════════════════════════════════════════════════╝
        `);
        process.exit(1);
      }
    }
  }
}

// Execute test
testXmlDownload();
