import axios from 'axios';

/**
 * Script de debug para analisar o XML retornado
 */
async function debugXml() {
  const xmlUrl = process.env.XML_URL || 'https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml';

  console.log('🔍 Debugando XML de:', xmlUrl);
  console.log('');

  try {
    const response = await axios.get(xmlUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Autoflix Server)',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    const xmlContent = response.data;

    console.log('✅ XML obtido com sucesso!');
    console.log(`📊 Tamanho: ${xmlContent.length} bytes`);
    console.log('');

    // Mostrar primeiro 2000 caracteres
    console.log('📄 Primeiros 2000 caracteres do XML:');
    console.log('-------------------------------------------');
    console.log(xmlContent.substring(0, 2000));
    console.log('-------------------------------------------');
    console.log('');

    // Procurar por tags principais
    console.log('🏷️  Tags principais encontradas:');
    
    // Encontrar tags únicas
    const tagRegex = /<([A-Za-z][A-Za-z0-9-]*)[^>]*>/g;
    const tags = new Set();
    let match;
    
    while ((match = tagRegex.exec(xmlContent)) !== null) {
      tags.add(match[1].toUpperCase());
    }

    const sortedTags = Array.from(tags).sort();
    sortedTags.forEach(tag => {
      const count = (xmlContent.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
      console.log(`  - <${tag}> (${count} ocorrências)`);
    });
    console.log('');

    // Procurar por estrutura de veículos
    console.log('🚗 Procurando por estruturas de veículos...');
    
    // Padrões comuns para envolvedor de veículos
    const patterns = [
      { name: 'VEICULO|VEHICLE|CAR|AUTO', desc: 'Elemento de veículo' },
      { name: 'TITLE|NAME|MODELO', desc: 'Nome/título' },
      { name: 'PRECO|PRICE|VALOR', desc: 'Preço' },
      { name: 'MARCA|MAKE|BRAND', desc: 'Marca' },
      { name: 'PHOTO|IMAGE|IMAGEM|FOTO', desc: 'Imagem' }
    ];

    patterns.forEach(pattern => {
      const regex = new RegExp(`<(?:${pattern.name})[^>]*>([^<]{1,100})<`, 'i');
      const match = xmlContent.match(regex);
      if (match) {
        console.log(`  ✅ ${pattern.desc}: <${match[0].match(/<(\w+)/)[1]}>`);
        console.log(`     Exemplo: ${match[1].substring(0, 60)}`);
      } else {
        console.log(`  ❌ ${pattern.desc}: Não encontrado`);
      }
    });
    console.log('');

    // Contar possíveis registros de veículos
    console.log('📈 Análise de quantidade de registros:');
    
    // Tentar encontrar o wrapper principal
    const wrapperMatch = xmlContent.match(/<([A-Za-z]+)[^>]*>[\s\S]*<\/\1>/);
    if (wrapperMatch) {
      console.log(`  Root wrapper: <${wrapperMatch[1]}>`);
    }

    // Procurar por padrões de repetição
    const commonPatterns = [
      'VEICULO', 'VEHICLE', 'CAR', 'PRODUCT', 'ITEM', 'RECORD',
      'AUTO', 'CARRO', 'VEHÍCULO'
    ];

    for (const pattern of commonPatterns) {
      const count = (xmlContent.match(new RegExp(`<${pattern}[^>]*>`, 'gi')) || []).length;
      if (count > 0) {
        console.log(`  Possível container "${pattern}": ${count} registros`);
      }
    }
    console.log('');

    // Salvar amostra em arquivo
    const fs = await import('fs');
    const path = './xml-debug-sample.xml';
    fs.writeFileSync(path, xmlContent.substring(0, 5000));
    console.log(`💾 Amostra salva em: ${path}`);

  } catch (error) {
    console.error('❌ Erro ao buscar XML:');
    console.error('  Mensagem:', error.message);
    console.error('  Código:', error.code);
    if (error.response) {
      console.error('  Status HTTP:', error.response.status);
      console.error('  Dados:', error.response.data.substring(0, 500));
    }
  }
}

debugXml().catch(console.error);
