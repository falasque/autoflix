import axios from 'axios';
import 'dotenv/config';

/**
 * Script para testar o parser de XML
 */

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

function parseVehicleFromXml(xmlText) {
  const getValue = (fieldNames) => {
    for (const name of fieldNames) {
      const simpleRegex = new RegExp(`<${name}[^>]*>([^<]*)<\\/`, 'i');
      const match = xmlText.match(simpleRegex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  };

  const getImages = () => {
    const images = [];
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
    console.warn('⚠️  Skipping vehicle: missing TITLE or PRICE');
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

function parseXmlSimple(xmlContent) {
  const vehicles = [];
  
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
      console.warn(`⚠️  Error parsing vehicle ${index}:`, error.message);
    }
  });

  return vehicles;
}

async function testParser() {
  const xmlUrl = process.env.XML_URL;

  if (!xmlUrl) {
    console.error('❌ XML_URL not configured in .env');
    process.exit(1);
  }

  console.log('🧪 Testing XML Parser');
  console.log(`📍 XML URL: ${xmlUrl}`);
  console.log('');

  try {
    console.log('🌐 Fetching XML...');
    const response = await axios.get(xmlUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Autoflix Server)',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    const xmlContent = response.data;
    console.log(`✅ XML fetched (${xmlContent.length} bytes)`);
    console.log('');

    console.log('🔄 Parsing vehicles...');
    const vehicles = parseXmlSimple(xmlContent);
    console.log(`✅ Parsed ${vehicles.length} vehicles`);
    console.log('');

    if (vehicles.length > 0) {
      console.log('📋 First 3 vehicles:');
      console.log('');
      vehicles.slice(0, 3).forEach((vehicle, i) => {
        console.log(`${i + 1}. ${vehicle.name}`);
        console.log(`   ID: ${vehicle.id}`);
        console.log(`   Brand: ${vehicle.brand}`);
        console.log(`   Model: ${vehicle.model}`);
        console.log(`   Year: ${vehicle.year}`);
        console.log(`   Price: R$ ${vehicle.price.toFixed(2)}`);
        console.log(`   Mileage: ${vehicle.mileage} km`);
        console.log(`   Fuel: ${vehicle.fuel}`);
        console.log(`   Images: ${vehicle.images.length}`);
        console.log(`   Features: ${vehicle.features.join(', ')}`);
        console.log('');
      });

      console.log(`✨ Parser is working! Ready to sync ${vehicles.length} vehicles.`);
    } else {
      console.error('❌ No vehicles were parsed from XML');
      console.error('Check XML structure and field names');
    }

  } catch (error) {
    console.error('❌ Error:');
    console.error('  Message:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
    }
  }
}

testParser().catch(console.error);
