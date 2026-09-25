// Script de debug para testar o sistema de veículos
// Execute no console do navegador

console.log('🔧 Script de Debug do Sistema de Veículos');

// Mostra estado atual
console.log('📊 Estado atual do localStorage:');
console.log('- XML URL:', localStorage.getItem('verda-auto-xml-url'));
console.log('- Cache vehicles:', localStorage.getItem('verda-auto-vehicles-local-cache') ? 'Existe' : 'Não existe');

// Função para limpar tudo e recomeçar
window.debugClearAll = () => {
  console.log('🗑️ Limpando todo o cache...');
  localStorage.removeItem('verda-auto-vehicles-local-cache');
  localStorage.removeItem('verda-auto-vehicles-cache');
  localStorage.removeItem('verda-auto-sync-metadata');
  console.log('✅ Cache limpo! Recarregue a página.');
};

// Função para definir URL do XML
window.debugSetXmlUrl = (url) => {
  console.log('📍 Configurando URL do XML:', url);
  localStorage.setItem('verda-auto-xml-url', url);
  console.log('✅ URL configurada! Use debugForceRefresh() para testar.');
};

// Função para forçar refresh
window.debugForceRefresh = async () => {
  console.log('🔄 Forçando refresh...');
  try {
    const { forceRefreshVehicles } = await import('/src/lib/xml-service.ts');
    const vehicles = await forceRefreshVehicles();
    console.log('✅ Refresh concluído:', vehicles);
  } catch (error) {
    console.error('❌ Erro no refresh:', error);
  }
};

// Função para testar XML
window.debugTestXml = async (url) => {
  console.log('🧪 Testando XML:', url);
  try {
    const { testXmlConnection } = await import('/src/lib/xml-service.ts');
    const result = await testXmlConnection(url);
    console.log('🧪 Resultado do teste:', result);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

console.log('📝 Funções disponíveis:');
console.log('- debugClearAll() - Limpa todo o cache');
console.log('- debugSetXmlUrl(url) - Define URL do XML');
console.log('- debugForceRefresh() - Força refresh dos dados');
console.log('- debugTestXml(url) - Testa conexão com XML');

// URL padrão para teste
const DEFAULT_XML_URL = 'https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml';
console.log('🔗 URL padrão para teste:', DEFAULT_XML_URL);
console.log('💡 Exemplo: debugSetXmlUrl("' + DEFAULT_XML_URL + '")');