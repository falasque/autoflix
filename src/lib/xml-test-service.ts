// Função específica para testar URLs XML no dashboard admin
export async function testXmlConnection(xmlUrl: string): Promise<{
  success: boolean;
  message: string;
  vehicleCount?: number;
  error?: string;
}> {
  if (!xmlUrl || !xmlUrl.trim()) {
    return {
      success: false,
      message: 'URL não pode estar vazia',
      error: 'EMPTY_URL'
    };
  }

  // Valida se é uma URL válida
  try {
    new URL(xmlUrl);
  } catch {
    return {
      success: false,
      message: 'URL inválida. Verifique o formato.',
      error: 'INVALID_URL'
    };
  }

  const proxies = [
    { name: 'Direto', url: xmlUrl },
    { name: 'CORS Proxy IO', url: `https://corsproxy.io/?${encodeURIComponent(xmlUrl)}` },
    { name: 'AllOrigins', url: `https://api.allorigins.win/get?url=${encodeURIComponent(xmlUrl)}` },
    { name: 'ThingProxy', url: `https://thingproxy.freeboard.io/fetch/${xmlUrl}` }
  ];

  for (const proxy of proxies) {
    try {
      console.log(`Testando ${proxy.name}:`, proxy.url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(proxy.url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; XML-Test-Bot)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`${proxy.name} falhou: HTTP ${response.status}`);
        continue;
      }

      let xmlText: string;
      
      if (proxy.name === 'AllOrigins') {
        const data = await response.json();
        if (!data.contents) {
          console.log(`${proxy.name} falhou: Sem conteúdo`);
          continue;
        }
        xmlText = data.contents;
      } else {
        xmlText = await response.text();
      }

      // Verifica se é XML válido
      if (!xmlText || xmlText.trim().length === 0) {
        console.log(`${proxy.name} falhou: Conteúdo vazio`);
        continue;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.log(`${proxy.name} falhou: XML inválido`);
        continue;
      }

      // Conta veículos
      const ads = xmlDoc.querySelectorAll('AD');
      const vehicleCount = ads.length;

      return {
        success: true,
        message: `Conexão bem-sucedida via ${proxy.name}! Encontrados ${vehicleCount} veículos.`,
        vehicleCount
      };

    } catch (error: any) {
      console.log(`${proxy.name} falhou:`, error.message);
      if (error.name === 'AbortError') {
        console.log(`${proxy.name}: Timeout após 10 segundos`);
      }
      continue;
    }
  }

  return {
    success: false,
    message: 'Não foi possível conectar à URL. Verifique se o endereço está correto e tente novamente.',
    error: 'ALL_PROXIES_FAILED'
  };
}