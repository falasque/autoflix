// Script de teste para Google Analytics
// Execute no console do navegador para testar eventos

console.log('🧪 Testando Google Analytics...');

// Verificar se gtag está disponível
if (typeof window.gtag !== 'undefined') {
  console.log('✅ Google Analytics detectado!');
  console.log('📊 ID: G-VEYHZYGFCF');
  
  // Testar evento personalizado
  window.gtag('event', 'test_event', {
    event_category: 'test',
    event_label: 'manual_test',
    value: 1
  });
  
  console.log('✅ Evento de teste enviado!');
  console.log('📈 Verifique em: https://analytics.google.com/');
  console.log('⏱️  Aguarde 24-48h para dados aparecerem');
  
} else {
  console.error('❌ Google Analytics não detectado!');
  console.log('🔍 Verifique se o script está carregando corretamente');
}

// Verificar dataLayer
if (window.dataLayer) {
  console.log('✅ dataLayer encontrado');
  console.log('📦 Eventos:', window.dataLayer);
} else {
  console.warn('⚠️  dataLayer não encontrado');
}

// Função para testar eventos manualmente
window.testAnalyticsEvent = (action, category, label) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label
    });
    console.log(`✅ Evento enviado: ${action} - ${category} - ${label}`);
  } else {
    console.error('❌ gtag não disponível');
  }
};

console.log('');
console.log('💡 Para testar manualmente, use:');
console.log('   testAnalyticsEvent("click", "test", "button_test")');
console.log('');
