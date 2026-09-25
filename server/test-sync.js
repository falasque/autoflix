/**
 * Script para testar sincronização manual (simula cron job)
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import sync service
import { syncVehiclesFromXml } from './src/services/sync-service.js';

async function testSync() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ 🧪 TESTE DE SINCRONIZAÇÃO                                      ║
║ ─────────────────────────────────────────────────────────────  ║
║ 📝 Simulando execução do CRON JOB                              ║
╚════════════════════════════════════════════════════════════════╝
  `);

  // Check XML_URL
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

  console.log(`✅ XML_URL configurado: ${xmlUrl.substring(0, 80)}...`);
  console.log('');

  // Open database
  const dbPath = path.join(__dirname, 'data', 'vehicles.db');
  console.log(`📂 Abrindo banco de dados: ${dbPath}`);
  
  let db;
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log('✅ Banco de dados conectado');
    console.log('');
  } catch (error) {
    console.error('❌ ERRO ao abrir banco de dados:', error.message);
    process.exit(1);
  }

  // Test sync
  const startTime = Date.now();
  
  try {
    console.log('🔄 Iniciando sincronização...');
    console.log('⏰ Horário de início:', new Date().toLocaleString('pt-BR'));
    console.log('');
    
    const result = await syncVehiclesFromXml(db, xmlUrl);
    
    const duration = Date.now() - startTime;
    const endTime = new Date();
    
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║ ✅ TESTE CONCLUÍDO COM SUCESSO                                 ║
╠════════════════════════════════════════════════════════════════╣
║ ⏰ Horário de término: ${endTime.toLocaleString('pt-BR')}      ║
║ ⏱️  Duração total: ${(duration / 1000).toFixed(2)}s            ║
║                                                                 ║
║ 📊 RESULTADOS:                                                  ║
║    • Veículos adicionados: ${result.added.toString().padStart(3)}                         ║
║    • Veículos atualizados: ${result.updated.toString().padStart(3)}                       ║
║    • Veículos removidos: ${result.removed.toString().padStart(3)}                         ║
║    • Total no banco: ${result.total.toString().padStart(3)}                               ║
║                                                                 ║
║ 🎯 STATUS: Sincronização funcionando corretamente!             ║
╚════════════════════════════════════════════════════════════════╝
    `);

    await db.close();
    process.exit(0);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const endTime = new Date();
    
    console.error(`
╔════════════════════════════════════════════════════════════════╗
║ ❌ TESTE FALHOU                                                 ║
╠════════════════════════════════════════════════════════════════╣
║ ⏰ Horário: ${endTime.toLocaleString('pt-BR')}                 ║
║ ⏱️  Duração: ${(duration / 1000).toFixed(2)}s                  ║
║                                                                 ║
║ ⚠️  ERRO:                                                       ║
║    ${error.message}                                            ║
║                                                                 ║
║ 📋 TIPO: ${error.constructor.name}                             ║
║                                                                 ║
║ 🔍 DETALHES DO STACK:                                           ║
    `);
    
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(0, 5);
      stackLines.forEach(line => {
        console.error(`║    ${line.trim().substring(0, 60).padEnd(60)} ║`);
      });
    }
    
    console.error(`╚════════════════════════════════════════════════════════════════╝`);
    console.error('');
    
    // Diagnóstico adicional
    console.log(`
📋 POSSÍVEIS CAUSAS:
   1. ❌ URL do XML inválida ou inacessível
   2. ❌ Timeout na conexão (servidor lento)
   3. ❌ XML mal formatado ou vazio
   4. ❌ Problema de rede/firewall
   5. ❌ Servidor do XML fora do ar

🔧 PRÓXIMOS PASSOS:
   1. Verifique se a URL do XML está correta no .env
   2. Teste a URL diretamente no navegador
   3. Verifique os logs em: server/logs/cron-executions.log
   4. Execute: npm run test-xml para testar apenas o download
    `);
    
    if (db) {
      await db.close();
    }
    process.exit(1);
  }
}

// Execute test
testSync();
