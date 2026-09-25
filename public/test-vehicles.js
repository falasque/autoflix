// Script de teste rápido - Execute no console do navegador

console.log('🔧 Testando sistema de veículos...');

// Limpa cache e força reload
localStorage.removeItem('verda-auto-vehicles-local-cache');

// Força uma nova busca
setTimeout(() => {
  location.reload();
}, 1000);

console.log('✅ Cache limpo, recarregando página...');