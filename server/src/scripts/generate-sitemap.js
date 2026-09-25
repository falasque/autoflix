import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Gera o sitemap.xml dinamicamente com todas as URLs de veículos
 * Este script é executado automaticamente após cada sincronização
 */
export async function generateSitemap() {
  try {
    console.log('🗺️  Iniciando geração do sitemap...');

    // Conectar ao banco de dados
    const dbPath = path.join(__dirname, '../../data/vehicles.db');
    const db = new sqlite3.Database(dbPath);

    // Buscar todos os veículos
    const vehicles = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, slug, updated_at FROM vehicles ORDER BY updated_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    console.log(`📊 Encontrados ${vehicles.length} veículos no banco de dados`);

    // Base URL
    const baseUrl = process.env.BASE_URL || 'https://autoflix.com.br';

    // URLs fixas
    const staticUrls = [
      {
        loc: `${baseUrl}/`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/contato`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        loc: `${baseUrl}/simular-financiamento`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7'
      }
    ];

    // URLs dinâmicas de veículos
    const vehicleUrls = vehicles.map((vehicle) => ({
      loc: `${baseUrl}/veiculo/${vehicle.slug}`,
      lastmod: vehicle.updated_at ? vehicle.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    }));

    // Combinar URLs
    const allUrls = [...staticUrls, ...vehicleUrls];

    // Gerar XML
    const xmlContent = generateXml(allUrls);

    // Determinar o caminho correto do sitemap
    // Em produção (/www/wwwroot/autoflix.com.br/server/): salva em ../../dist/sitemap.xml
    // Em desenvolvimento: salva em ../../public/sitemap.xml e ../../../public/sitemap.xml
    
    const possiblePaths = [
      path.join(__dirname, '../../../dist/sitemap.xml'),        // Produção - pasta dist do frontend
      path.join(__dirname, '../../../public/sitemap.xml'),       // Dev - pasta public do frontend (raiz)
      path.join(__dirname, '../../public/sitemap.xml')          // Dev - pasta public do backend
    ];

    let sitemapPath = null;
    let savedCount = 0;

    // Tentar salvar em todos os caminhos possíveis
    for (const testPath of possiblePaths) {
      try {
        const dir = path.dirname(testPath);
        
        // Criar diretório se não existir
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`📁 Diretório criado: ${dir}`);
        }

        // Salvar arquivo
        fs.writeFileSync(testPath, xmlContent, 'utf-8');
        
        if (!sitemapPath) {
          sitemapPath = testPath; // Usar o primeiro como principal
        }
        savedCount++;
        console.log(`   ✅ Salvo em: ${testPath}`);
      } catch (error) {
        console.warn(`   ⚠️  Não foi possível salvar em ${testPath}: ${error.message}`);
      }
    }

    if (savedCount === 0) {
      throw new Error('Não foi possível salvar o sitemap em nenhum dos caminhos');
    }

    console.log(`✅ Sitemap gerado com sucesso!`);
    console.log(`   📁 Arquivo principal: ${sitemapPath}`);
    console.log(`   📂 Total de cópias salvas: ${savedCount}`);
    console.log(`   📈 Total de URLs: ${allUrls.length} (${staticUrls.length} fixas + ${vehicleUrls.length} veículos)`);
    console.log(`   🔗 Base URL: ${baseUrl}`);

    db.close();

    return {
      success: true,
      totalUrls: allUrls.length,
      staticUrls: staticUrls.length,
      vehicleUrls: vehicleUrls.length,
      filePath: sitemapPath
    };

  } catch (error) {
    console.error('❌ Erro ao gerar sitemap:', error);
    throw error;
  }
}

/**
 * Gera conteúdo XML do sitemap
 */
function generateXml(urls) {
  const urlsXml = urls
    .map(
      (url) => `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXml}
</urlset>`;
}

/**
 * Escapa caracteres especiais para XML
 */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Se executado diretamente (não importado como módulo)
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap()
    .then(() => {
      console.log('✨ Sitemap gerado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao gerar sitemap:', error);
      process.exit(1);
    });
}
