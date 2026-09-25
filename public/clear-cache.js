// Script para limpar cache dos veículos e forçar nova busca
console.log('🗑️ Limpando cache de veículos e configurações...');

// Limpa o cache do localStorage
localStorage.removeItem('verda-auto-vehicles-local-cache');
localStorage.removeItem('verda-auto-xml-url');
localStorage.removeItem('site-config');

console.log('✅ Cache limpo! Recarregue a página para buscar dados atualizados.');