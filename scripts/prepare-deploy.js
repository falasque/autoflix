// Script para preparar deploy automático
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Preparando arquivos para deploy...');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const deployDir = path.join(projectRoot, 'deploy');

// Função para copiar arquivos recursivamente
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  // 1. Limpar pasta deploy se existir
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
    console.log('✅ Pasta deploy limpa');
  }

  // 2. Criar pasta deploy
  fs.mkdirSync(deployDir, { recursive: true });
  console.log('✅ Pasta deploy criada');

  // 3. Verificar se pasta dist existe
  if (!fs.existsSync(distDir)) {
    console.error('❌ Pasta dist não encontrada. Execute npm run build primeiro.');
    process.exit(1);
  }

  // 4. Copiar conteúdo de dist para deploy
  console.log('📦 Copiando arquivos...');
  copyRecursive(distDir, deployDir);

  // 5. Listar arquivos copiados
  console.log('✅ Arquivos prontos para deploy:');
  const files = fs.readdirSync(deployDir);
  files.forEach(file => {
    const filePath = path.join(deployDir, file);
    const stat = fs.statSync(filePath);
    const type = stat.isDirectory() ? '📁' : '📄';
    console.log(`  ${type} ${file}`);
  });

  console.log('\n🎯 Instruções:');
  console.log('1. Faça upload de TODOS os arquivos da pasta "deploy/" para:');
  console.log('   /www/wwwroot/autoflix.com.br/');
  console.log('2. Substitua todos os arquivos existentes');
  console.log('3. NÃO envie a pasta "deploy" - apenas seu conteúdo');
  console.log('\n✅ Deploy preparado com sucesso!');

} catch (error) {
  console.error('❌ Erro ao preparar deploy:', error.message);
  process.exit(1);
}