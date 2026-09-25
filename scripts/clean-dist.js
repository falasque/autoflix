// Script para limpar pasta dist sem remover arquivos do sistema
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

console.log('🧹 Limpando pasta dist (preservando arquivos do sistema)...');

// Arquivos que NÃO devem ser removidos (arquivos do aaPanel/sistema)
const SYSTEM_FILES = [
  '.user.ini',
  '.htaccess',
  '.well-known'
];

// Arquivos/pastas que são do build e podem ser removidos
const BUILD_FILES = [
  'index.html',
  'assets',
  'favicon.ico',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'vehicles-data.json',
  'sw.js'
];

try {
  if (!fs.existsSync(distDir)) {
    console.log('📁 Pasta dist não existe, nada para limpar');
    process.exit(0);
  }

  const files = fs.readdirSync(distDir);
  let removedCount = 0;

  files.forEach(file => {
    const filePath = path.join(distDir, file);
    
    // Se é arquivo do sistema, pula
    if (SYSTEM_FILES.includes(file)) {
      console.log(`⚠️  Preservando arquivo do sistema: ${file}`);
      return;
    }

    // Se é arquivo de build, remove
    if (BUILD_FILES.includes(file)) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`🗑️  Pasta removida: ${file}`);
        } else {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Arquivo removido: ${file}`);
        }
        removedCount++;
      } catch (error) {
        console.warn(`⚠️  Erro ao remover ${file}:`, error.message);
      }
    } else {
      console.log(`❓ Arquivo não reconhecido (preservado): ${file}`);
    }
  });

  console.log(`✅ Limpeza concluída! ${removedCount} itens removidos`);
  console.log('🚀 Pronto para novo build');

} catch (error) {
  console.error('❌ Erro durante limpeza:', error.message);
  process.exit(1);
}