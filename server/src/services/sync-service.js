import axios from 'axios';
import cron from 'node-cron';
import { generateSitemap } from '../scripts/generate-sitemap.js';
import { cacheService } from './cache-service.js';
import { logCronExecution } from './logger-service.js';

/**
 * Sincroniza veículos do XML para o banco de dados SQLite
 */
export async function syncVehiclesFromXml(db, xmlUrl) {
  const startTime = Date.now();
  const startDate = new Date();

  try {
    console.log(`
┌────────────────────────────────────────────────────────────────┐
│ 🔄 SINCRONIZAÇÃO DE VEÍCULOS INICIADA                          │
├────────────────────────────────────────────────────────────────┤
│ 📍 XML URL: ${xmlUrl.substring(0, 45)}...                     │
│ ⏰ Horário: ${startDate.toLocaleTimeString('pt-BR')}           │
│ � Data: ${startDate.toLocaleDateString('pt-BR')}             │
└────────────────────────────────────────────────────────────────┘
    `);

    // Fetch XML
    const fetchStartTime = Date.now();
    console.log('📥 Baixando arquivo XML...');
    const xmlContent = await fetchXml(xmlUrl);
    const fetchDuration = Date.now() - fetchStartTime;
    
    if (!xmlContent) {
      throw new Error('Falha ao baixar XML');
    }
    console.log(`✅ XML baixado com sucesso (${(fetchDuration / 1000).toFixed(2)}s)`);

    // Parse XML to vehicles
    const parseStartTime = Date.now();
    console.log('📝 Analisando XML...');
    const newVehicles = parseXmlToVehicles(xmlContent);
    const parseDuration = Date.now() - parseStartTime;
    
    console.log(`✅ XML analisado: ${newVehicles.length} veículos encontrados (${(parseDuration / 1000).toFixed(2)}s)`);

    if (newVehicles.length === 0) {
      throw new Error('Nenhum veículo encontrado no XML');
    }

    // Get existing vehicles
    console.log('🔍 Verificando veículos existentes no banco de dados...');
    const existingVehicles = await db.all('SELECT id FROM vehicles');
    const existingIds = new Set(existingVehicles.map(v => v.id));
    console.log(`✅ ${existingIds.size} veículos existentes encontrados`);

    let addedCount = 0;
    let updatedCount = 0;
    let removedCount = 0;
    let imagesProcessed = 0;
    let featuresProcessed = 0;

    // Start transaction
    console.log('💾 Iniciando transação do banco de dados...');
    await db.run('BEGIN TRANSACTION');

    try {
      // Insert or update vehicles
      console.log('🔄 Processando veículos...');
      for (const vehicle of newVehicles) {
        const existing = existingIds.has(vehicle.id);

        if (existing) {
          // Update existing vehicle
          await db.run(
            `UPDATE vehicles SET
              name = ?, brand = ?, model = ?, year = ?,
              price = ?, mileage = ?, fuel = ?, transmission = ?,
              color = ?, doors = ?, image = ?, description = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
              vehicle.name, vehicle.brand, vehicle.model, vehicle.year,
              vehicle.price, vehicle.mileage, vehicle.fuel, vehicle.transmission,
              vehicle.color, vehicle.doors, vehicle.image, vehicle.description,
              vehicle.id
            ]
          );
          updatedCount++;
        } else {
          // Insert new vehicle
          await db.run(
            `INSERT INTO vehicles
              (id, slug, name, brand, model, year, price, mileage,
               fuel, transmission, color, doors, image, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              vehicle.id, vehicle.slug, vehicle.name, vehicle.brand,
              vehicle.model, vehicle.year, vehicle.price, vehicle.mileage,
              vehicle.fuel, vehicle.transmission, vehicle.color, vehicle.doors,
              vehicle.image, vehicle.description
            ]
          );
          addedCount++;
        }

        // Update images
        if (vehicle.images && vehicle.images.length > 0) {
          // Delete existing images
          await db.run('DELETE FROM vehicle_images WHERE vehicle_id = ?', [vehicle.id]);

          // Insert new images
          for (let i = 0; i < vehicle.images.length; i++) {
            await db.run(
              'INSERT INTO vehicle_images (vehicle_id, image_url, position) VALUES (?, ?, ?)',
              [vehicle.id, vehicle.images[i], i]
            );
          }
          imagesProcessed += vehicle.images.length;
        }

        // Update features
        if (vehicle.features && vehicle.features.length > 0) {
          // Delete existing features
          await db.run('DELETE FROM vehicle_features WHERE vehicle_id = ?', [vehicle.id]);

          // Insert new features
          for (const feature of vehicle.features) {
            await db.run(
              'INSERT INTO vehicle_features (vehicle_id, feature) VALUES (?, ?)',
              [vehicle.id, feature]
            );
          }
          featuresProcessed += vehicle.features.length;
        }
      }

      console.log(`   ✅ Adicionados: ${addedCount} | Atualizados: ${updatedCount}`);

      // Remove vehicles not in XML
      console.log('🗑️  Verificando veículos para remover...');
      for (const id of existingIds) {
        if (!newVehicles.some(v => v.id === id)) {
          await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
          removedCount++;
        }
      }
      if (removedCount > 0) {
        console.log(`   ✅ Removidos: ${removedCount}`);
      }

      // Log sync
      const duration = Date.now() - startTime;
      console.log('📊 Registrando log de sincronização...');
      await db.run(
        `INSERT INTO sync_log (vehicles_added, vehicles_updated, vehicles_removed, total_vehicles, status, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [addedCount, updatedCount, removedCount, newVehicles.length, 'success', duration]
      );

      // Commit transaction
      console.log('✅ Confirmando transação...');
      await db.run('COMMIT');

      // Invalidar cache de veículos
      console.log('🔄 Invalidando cache de veículos...');
      cacheService.invalidateVehicleCache();
      console.log('   ✅ Cache invalidado');

      // Gerar sitemap dinâmico com URLs de veículos
      console.log('🗺️  Gerando sitemap com URLs de veículos...');
      try {
        await generateSitemap();
        console.log('   ✅ Sitemap gerado com sucesso');
      } catch (sitemapError) {
        console.error('   ⚠️  Erro ao gerar sitemap:', sitemapError.message);
        // Não falhar a sincronização se o sitemap falhar
      }

      const endDate = new Date();

      const result = {
        added: addedCount,
        updated: updatedCount,
        removed: removedCount,
        total: newVehicles.length,
        duration: `${(duration / 1000).toFixed(2)}s`
      };

      console.log(`
┌────────────────────────────────────────────────────────────────┐
│ ✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO                         │
├────────────────────────────────────────────────────────────────┤
│ ➕ Adicionados: ${addedCount.toString().padStart(3, ' ')} veículos                        │
│ ↻  Atualizados: ${updatedCount.toString().padStart(3, ' ')} veículos                       │
│ ➖ Removidos: ${removedCount.toString().padStart(3, ' ')} veículos                         │
│ 📸 Imagens: ${imagesProcessed.toString().padStart(3, ' ')} processadas                    │
│ 🏷️  Features: ${featuresProcessed.toString().padStart(3, ' ')} processadas                 │
│ ⏱️  Tempo total: ${(duration / 1000).toFixed(2)}s                    │
│ 📅 Conclusão: ${endDate.toLocaleTimeString('pt-BR')}              │
└────────────────────────────────────────────────────────────────┘
      `);
      
      return result;

    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Sync error:', error);
    
    // Log error
    try {
      const duration = Date.now() - startTime;
      await db.run(
        `INSERT INTO sync_log (status, error_message, duration_ms)
        VALUES (?, ?, ?)`,
        ['error', error.message, duration]
      );
    } catch (logError) {
      console.error('❌ Failed to log sync error:', logError);
    }

    throw error;
  }
}

/**
 * Fetch XML from URL with retry logic
 */
async function fetchXml(xmlUrl, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Fetching XML (attempt ${attempt}/${maxRetries})...`);

      const response = await axios.get(xmlUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Autoflix Server)',
          'Accept': 'application/xml, text/xml, */*'
        },
        validateStatus: () => true
      });

      if (response.status === 200 && response.data) {
        console.log(`✅ XML fetched successfully (${response.data.length} bytes)`);
        return response.data;
      } else {
        console.warn(`⚠️ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.warn(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return null;
}

/**
 * Parse XML string to vehicles array
 */
function parseXmlToVehicles(xmlContent) {
  try {
    const parser = new (require('node:dom').DOMParser)();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // If no DOMParser available (Node.js), use simple regex parsing
    return parseXmlSimple(xmlContent);

  } catch (error) {
    console.warn('⚠️ DOMParser not available, using simple parsing');
    return parseXmlSimple(xmlContent);
  }
}

/**
 * Simple XML parsing using regex (more reliable for server-side)
 */
function parseXmlSimple(xmlContent) {
  const vehicles = [];
  
  // Match AD entries specifically (RevendaMais format)
  const vehiclePattern = /<AD>[\s\S]*?<\/AD>/g;
  const matches = xmlContent.match(vehiclePattern) || [];

  console.log(`📊 Found ${matches.length} <AD> entries in XML`);

  matches.forEach((match, index) => {
    try {
      const vehicle = parseVehicleFromXml(match);
      if (vehicle && vehicle.name) {
        vehicles.push(vehicle);
      }
    } catch (error) {
      console.warn(`⚠️ Error parsing vehicle ${index}:`, error.message);
    }
  });

  return vehicles;
}

/**
 * Extract values from XML text
 */
function parseVehicleFromXml(xmlText) {
  const getValue = (fieldNames) => {
    for (const name of fieldNames) {
      // Match tags like <TAG>value</TAG> or <TAG>value</TAG> with attributes
      const regex = new RegExp(`<${name}(?:\\s[^>]*)?>([^<]*)<\\/\\1>|<${name}(?:\\s[^>]*)?>([^<]*)<\\/\\2>|<${name}[^>]*>([^<]*)<\\/\\1>`, 'i');
      const match = xmlText.match(regex);
      
      // Also try simpler pattern
      if (!match) {
        const simpleRegex = new RegExp(`<${name}[^>]*>([^<]*)<\\/`, 'i');
        const simpleMatch = xmlText.match(simpleRegex);
        if (simpleMatch && simpleMatch[1]) {
          return simpleMatch[1].trim();
        }
      }
      
      if (match) {
        const value = match[1] || match[2] || match[3];
        if (value) {
          return value.trim();
        }
      }
    }
    return '';
  };

  const getImages = () => {
    const images = [];
    // Match <IMAGE_URL> or <IMAGE> tags
    const imgRegex = /<IMAGE_URL[^>]*>([^<]+)<\/IMAGE_URL>|<IMAGE[^>]*>([^<]+)<\/IMAGE>/gi;
    let match;
    while ((match = imgRegex.exec(xmlText)) !== null) {
      const url = (match[1] || match[2] || '').trim();
      if (url && !images.includes(url)) {
        images.push(url);
      }
    }
    return images.length > 0 ? images : ['https://via.placeholder.com/400x300?text=No+Image'];
  };

  const getFeatures = () => {
    const features = [];
    const accessories = getValue(['ACCESSORIES', 'FEATURES', 'ATRIBUTOS']);
    if (accessories) {
      // Split by comma or other delimiters
      accessories.split(/,|;|\|/).forEach(feature => {
        const trimmed = feature.trim();
        if (trimmed && trimmed.length > 0) {
          features.push(trimmed);
        }
      });
    }
    return features;
  };

  const title = getValue(['TITLE', 'NAME', 'MODELO']);
  const make = getValue(['MAKE', 'BRAND', 'MARCA']);
  const model = getValue(['MODEL', 'MODELO']);
  const year = getValue(['YEAR', 'ANO', 'FABRIC_YEAR']);
  const price = getValue(['PRICE', 'PRECO', 'VALOR']);
  const mileage = getValue(['MILEAGE', 'KM', 'QUILOMETRAGEM']);
  const id = getValue(['ID', 'CODE', 'CODIGO']);

  if (!title || !price) {
    return null;
  }

  const name = title || `${make} ${model}`.trim();
  const slug = generateSlug(name);

  return {
    id: id || `xml-${slug}-${Date.now()}`,
    slug,
    name,
    brand: make || 'Unknown',
    model: model || name,
    year: parseInt(year || new Date().getFullYear()),
    price: parseFloat(price.replace(/[^\d.]/g, '')) || 0,
    mileage: parseInt(mileage.replace(/[^\d]/g, '')) || 0,
    fuel: parseFuel(getValue(['FUEL', 'COMBUSTIVEL', 'ENERGY'])),
    transmission: parseTransmission(getValue(['GEAR', 'CAMBIO', 'TRANSMISSION', 'TRANSMISION'])),
    color: getValue(['COLOR', 'COR', 'COLOUR']) || 'Not specified',
    doors: parseInt(getValue(['DOORS', 'PORTAS']) || 4),
    image: getImages()[0],
    images: getImages(),
    description: getValue(['DESCRIPTION', 'DESCRICAO', 'OBS', 'OBSERVACOES']) || '',
    features: getFeatures()
  };
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseFuel(fuel) {
  const f = fuel.toLowerCase();
  if (f.includes('diesel')) return 'Diesel';
  if (f.includes('eletrico') || f.includes('elétrico')) return 'Elétrico';
  if (f.includes('hibrido') || f.includes('híbrido')) return 'Híbrido';
  if (f.includes('gasolina')) return 'Gasolina';
  return 'Flex';
}

function parseTransmission(transmission) {
  const t = transmission.toLowerCase();
  if (t.includes('automatico') || t.includes('automático') || t.includes('auto')) return 'Automático';
  if (t.includes('cvt')) return 'CVT';
  return 'Manual';
}

/**
 * Start scheduled sync
 */
export function startScheduledSync(db) {
  const schedule = process.env.SYNC_SCHEDULE || '0 4 * * *'; // Default: 04:00 (4 da manhã)
  const xmlUrl = process.env.XML_URL;

  if (!xmlUrl) {
    console.warn('⚠️ XML_URL not configured, scheduled sync disabled');
    return;
  }

  console.log(`📅 Scheduling sync: "${schedule}"`);
  console.log(`🕐 Próxima execução: 04:00 (4 da manhã)`);

  cron.schedule(schedule, async () => {
    const now = new Date();
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║ 🔄 CRON JOB EXECUTADO                                          ║
║ ─────────────────────────────────────────────────────────────  ║
║ ⏰ Horário: ${now.toLocaleString('pt-BR')}                     ║
║ 🔗 XML URL: ${xmlUrl.substring(0, 50)}...                      ║
║ 📊 Ação: Sincronização automática de veículos                  ║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    try {
      const startTime = Date.now();
      const result = await syncVehiclesFromXml(db, xmlUrl);
      const duration = Date.now() - startTime;
      
      // Log successful cron execution
      logCronExecution('SUCESSO', {
        'Início': now.toLocaleString('pt-BR'),
        'Duração': `${(duration / 1000).toFixed(2)}s`,
        'Adicionados': result.added,
        'Atualizados': result.updated,
        'Removidos': result.removed,
        'Total de Veículos': result.total,
        'Status': '✅ Sincronização Bem-Sucedida'
      });
      
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║ ✅ CRON JOB CONCLUÍDO COM SUCESSO                              ║
║ ─────────────────────────────────────────────────────────────  ║
║ ⏱️  Tempo total: ${(duration / 1000).toFixed(2)}s              ║
║ 📅 Data: ${now.toLocaleString('pt-BR')}                        ║
║ 📝 Próxima execução: 04:00 amanhã                              ║
╚════════════════════════════════════════════════════════════════╝
      `);
    } catch (error) {
      // Log failed cron execution
      logCronExecution('ERRO', {
        'Início': now.toLocaleString('pt-BR'),
        'Mensagem de Erro': error.message,
        'Tipo': error.constructor.name,
        'Status': '❌ Sincronização Falhou'
      });
      
      console.error(`
╔════════════════════════════════════════════════════════════════╗
║ ❌ CRON JOB FALHOU                                              ║
║ ─────────────────────────────────────────────────────────────  ║
║ 📅 Data: ${now.toLocaleString('pt-BR')}                        ║
║ ⚠️  Erro: ${error.message}                                      ║
║ 📝 Stack: ${error.stack?.split('\n')[1] || 'N/A'}              ║
╚════════════════════════════════════════════════════════════════╝
      `);
    }
  });
}
