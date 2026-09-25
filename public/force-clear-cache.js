// 🧹 Script para forçar limpeza completa de cache e service worker

console.log('🧹 Iniciando limpeza total de cache...');

// 1. Limpar todos os caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      console.log(`🗑️ Deletando cache: ${name}`);
      caches.delete(name);
    });
  });
}

// 2. Desregistrar service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('🗑️ Desregistrando service worker...');
      registration.unregister();
    });
  });
}

// 3. Limpar localStorage
console.log('🗑️ Limpando localStorage...');
localStorage.clear();

// 4. Limpar sessionStorage
console.log('🗑️ Limpando sessionStorage...');
sessionStorage.clear();

console.log('✅ Limpeza completa! Recarregue a página (Ctrl+Shift+R ou Cmd+Shift+R)');
alert('✅ Cache limpo! Por favor, recarregue a página com Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)');
