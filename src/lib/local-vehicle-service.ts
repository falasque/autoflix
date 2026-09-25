import { Vehicle } from './types';
import { sanitizeImageUrl, sanitizeImageUrls } from './image-service';

// Sistema de cache local
interface CachedData {
  vehicles: Vehicle[];
  lastUpdate: string;
  hash: string;
  lastSyncDate: string; // Data no formato YYYY-MM-DD para sincronização diária
}

// Configuração local
const CACHE_KEY = 'verda-auto-vehicles-local-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

class LocalVehicleService {
  private cache: CachedData | null = null;

  /**
   * Obtém a data de hoje no formato YYYY-MM-DD
   */
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Carrega dados do cache local com validação melhorada
   */
  private loadCache(): CachedData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log('📦 Nenhum cache encontrado');
        return null;
      }
      
      const data = JSON.parse(cached) as CachedData;
      
      // Valida se tem dados de veículos
      if (!data.vehicles || data.vehicles.length === 0) {
        console.log('📦 Cache vazio, será renovado');
        return null;
      }
      
      // Verifica se o cache ainda é válido (24h)
      const lastUpdate = new Date(data.lastUpdate);
      const cacheAge = Date.now() - lastUpdate.getTime();
      
      console.log(`📦 Cache encontrado: ${data.vehicles.length} veículos (age: ${Math.round(cacheAge / 1000 / 60)}min)`);
      
      if (cacheAge > CACHE_DURATION) {
        console.log('📦 Cache expirado, será renovado');
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ Erro ao carregar cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }

  /**
   * Salva dados no cache local com melhor controle
   */
  private saveCache(vehicles: Vehicle[]): void {
    try {
      if (!vehicles || vehicles.length === 0) {
        console.warn('⚠️ Tentativa de salvar cache com dados vazios');
        return;
      }

      const data: CachedData = {
        vehicles,
        lastUpdate: new Date().toISOString(),
        hash: this.generateHash(vehicles),
        lastSyncDate: this.getTodayDate()
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      this.cache = data;
      console.log(`✅ Cache local atualizado: ${vehicles.length} veículos (salvo em ${data.lastUpdate})`);
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
    }
  }

  /**
   * Verifica se precisa sincronizar comparando datas (apenas 1x por dia)
   */
  private shouldSyncToday(): boolean {
    try {
      const cached = this.loadCache();
      if (!cached) return true;
      
      const today = this.getTodayDate();
      const lastSync = cached.lastSyncDate || '';
      
      const needsSync = today !== lastSync;
      console.log(`📅 Última sincronização: ${lastSync}, Hoje: ${today}, Precisa sincronizar: ${needsSync}`);
      
      return needsSync;
    } catch (error) {
      console.error('❌ Erro ao verificar sync:', error);
      return true;
    }
  }

  /**
   * Gera hash simples dos dados
   */
  private generateHash(vehicles: Vehicle[]): string {
    const str = JSON.stringify(vehicles.map(v => ({ id: v.id, name: v.name, price: v.price })));
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Busca XML usando proxies CORS externos (para sites static-only)
   */
  private async fetchXmlDirect(url: string): Promise<string | null> {
    try {
      console.log('🌐 Tentando buscar XML via proxies CORS...');
      
      // Lista expandida de proxies CORS mais confiáveis
      const corsProxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://cors-proxy.htmldriven.com/?url=',
        'https://cors.eu.org/',
        'https://thingproxy.freeboard.io/fetch/',
        'https://cors-anywhere.herokuapp.com/',
        'https://crossorigin.me/'
      ];
      
      // Tenta cada proxy em sequência com timeout
      for (let i = 0; i < corsProxies.length; i++) {
        const proxy = corsProxies[i];
        try {
          const proxyUrl = proxy + encodeURIComponent(url);
          console.log(`🔄 Tentando proxy ${i + 1}/${corsProxies.length}: ${proxy.split('/')[2]}`);
          
          // AbortController para timeout de 15 segundos
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/xml, text/xml, */*',
              'Cache-Control': 'no-cache',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const text = await response.text();
            if (text.trim() && (text.includes('<?xml') || text.includes('<'))) {
              console.log(`✅ XML obtido via proxy: ${proxy.split('/')[2]} (${text.length} chars)`);
              return text;
            } else {
              console.log(`⚠️ Proxy ${i + 1} retornou dados inválidos`);
            }
          } else {
            console.log(`❌ Proxy ${i + 1} falhou: ${response.status} ${response.statusText}`);
          }
          
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log(`⏱️ Proxy ${i + 1} timeout após 15s`);
          } else {
            console.log(`❌ Erro no proxy ${i + 1}:`, error instanceof Error ? error.message : error);
          }
        }
        
        // Pequena pausa entre tentativas para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Se todos os proxies falharam, tenta busca direta como último recurso
      console.log('🔄 Tentando busca direta como último recurso...');
      return this.fetchXmlFallback(url);
      
    } catch (error) {
      console.log('❌ Erro geral na busca do XML:', error);
      return null;
    }
  }

  /**
   * Fallback para busca direta sem proxy
   */
  private async fetchXmlFallback(url: string): Promise<string | null> {
    try {
      console.log('🔄 Tentando busca direta (fallback)...');
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        }
      });

      if (response.ok) {
        const text = await response.text();
        if (text.trim() && (text.includes('<?xml') || text.includes('<'))) {
          console.log('✅ XML obtido via fallback');
          return text;
        }
      }
      
      return null;
    } catch (error) {
      console.log('❌ Fallback também falhou:', error);
      return null;
    }
  }

  /**
   * Converte XML para veículos usando uma abordagem simples
   */
  private parseXmlToVehicles(xmlString: string): Vehicle[] {
    try {
      console.log('🔄 Fazendo parse do XML...');
      console.log('📄 Tamanho do XML:', xmlString.length, 'caracteres');
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const vehicles: Vehicle[] = [];
      
      // DEBUGGING: Primeiro mostra a estrutura completa do XML
      console.log('🔍 PRIMEIRA LINHA DO XML:', xmlString.split('\n')[0]);
      console.log('🔍 PRIMEIROS 1000 CARACTERES:', xmlString.substring(0, 1000));
      console.log('🔍 ÚLTIMOS 500 CARACTERES:', xmlString.substring(xmlString.length - 500));
      
      // Busca por TODAS as tags no XML para debug
      const allTags = Array.from(new Set(Array.from(xmlDoc.querySelectorAll('*')).map(el => el.tagName)));
      console.log('🔍 TODAS AS TAGS ENCONTRADAS:', allTags);
      
      // Busca por diferentes tags que podem representar veículos (EXPANDIDA)
      const possibleTags = [
        'AD', 'vehicle', 'veiculo', 'car', 'item', 'produto', 'anuncio',
        'VEHICLE', 'VEICULO', 'CAR', 'ITEM', 'PRODUTO', 'ANUNCIO',
        'listing', 'LISTING', 'ad', 'classified', 'CLASSIFIED'
      ];
      let vehicleNodes: NodeList | null = null;
      
      for (const tag of possibleTags) {
        vehicleNodes = xmlDoc.querySelectorAll(tag);
        if (vehicleNodes.length > 0) {
          console.log(`📍 Encontrados ${vehicleNodes.length} elementos com tag "${tag}"`);
          break;
        }
      }
      
      // Se não encontrou pelas tags usuais, tenta encontrar elementos que tenham campos de veículo
      if (!vehicleNodes || vehicleNodes.length === 0) {
        console.warn('⚠️ Tentando encontrar elementos por conteúdo...');
        
        // Procura por elementos que tenham campos típicos de veículos
        const elementsWithPrice = xmlDoc.querySelectorAll('*[price], *[PRICE], *[preco], *[PRECO], *[valor], *[VALUE]');
        const elementsWithMake = xmlDoc.querySelectorAll('*[make], *[MAKE], *[marca], *[MARCA]');
        const elementsWithYear = xmlDoc.querySelectorAll('*[year], *[YEAR], *[ano], *[ANO]');
        
        console.log('🔍 Elementos com PRICE:', elementsWithPrice.length);
        console.log('🔍 Elementos com MAKE:', elementsWithMake.length);
        console.log('🔍 Elementos com YEAR:', elementsWithYear.length);
        
        // Tenta usar elementos que contenham sub-elementos com nomes de campos
        const candidateElements = xmlDoc.querySelectorAll('*');
        for (let elem of candidateElements) {
          const hasPrice = elem.querySelector('price, PRICE, preco, PRECO, valor, VALUE');
          const hasMake = elem.querySelector('make, MAKE, marca, MARCA');
          const hasModel = elem.querySelector('model, MODEL, modelo, MODELO');
          
          if (hasPrice && (hasMake || hasModel)) {
            vehicleNodes = xmlDoc.querySelectorAll(elem.tagName);
            console.log(`📍 Encontrados ${vehicleNodes.length} elementos candidatos com tag "${elem.tagName}"`);
            break;
          }
        }
      }
      
      if (!vehicleNodes || vehicleNodes.length === 0) {
        console.error('❌ NENHUM ELEMENTO DE VEÍCULO ENCONTRADO!');
        console.log('🔍 Estrutura do XML:', xmlString.substring(0, 2000));
        return [];
      }

      vehicleNodes.forEach((node, index) => {
        try {
          const element = node as Element;
          
          // Função helper para buscar valores em diferentes possíveis tags
          const getValue = (possibleNames: string[]): string => {
            for (const name of possibleNames) {
              const el = element.querySelector(name) || element.querySelector(name.toLowerCase()) || element.querySelector(name.toUpperCase());
              if (el && el.textContent?.trim()) {
                return el.textContent.trim();
              }
              // Tenta como atributo também
              const attr = element.getAttribute(name) || element.getAttribute(name.toLowerCase()) || element.getAttribute(name.toUpperCase());
              if (attr?.trim()) {
                return attr.trim();
              }
            }
            return '';
          };

          const getImages = (): string[] => {
            const images: string[] = [];
            
            // Lista expandida de possíveis tags de imagem baseada no XML da RevendaMais
            const imageTags = [
              'IMAGE', 'IMAGES', 'image', 'img', 'foto', 'imagem', 
              'PHOTO', 'PHOTOS', 'PICTURE', 'PICTURES', 'IMAGEM',
              'FOTO', 'PIC', 'GALERIA', 'GALLERY', 'THUMB', 'THUMBNAIL',
              'URL_FOTO', 'FOTO_URL', 'IMG_URL', 'IMAGE_URL'
            ];
            
            // Busca imagens em diferentes formatos
            imageTags.forEach(tag => {
              const imgNodes = element.querySelectorAll(tag);
              
              imgNodes.forEach((img) => {
                let url = img.textContent?.trim() || 
                         img.getAttribute('src') || 
                         img.getAttribute('url') ||
                         img.getAttribute('href') ||
                         img.getAttribute('value');
                
                if (url && url.length > 10) {
                  // Se a URL contém múltiplas URLs concatenadas (problema identificado)
                  if (url.includes('https://') && url.indexOf('https://', 1) > 0) {
                    // Separa as URLs concatenadas
                    const urls = url.split('https://').filter(part => part.length > 0);
                    urls.forEach((urlPart) => {
                      const cleanUrl = 'https://' + urlPart.trim();
                      if (cleanUrl.includes('.jpg') || cleanUrl.includes('.jpeg') || cleanUrl.includes('.png') || 
                          cleanUrl.includes('.webp') || cleanUrl.includes('.gif')) {
                        
                        if (!images.includes(cleanUrl)) {
                          images.push(cleanUrl);
                        }
                      }
                    });
                  } else {
                    // URL única
                    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || 
                        url.includes('.webp') || url.includes('.gif') || url.startsWith('http') || 
                        url.startsWith('//') || url.startsWith('www')) {
                      
                      let finalUrl = url;
                      if (url.startsWith('//')) {
                        finalUrl = 'https:' + url;
                      } else if (url.startsWith('www')) {
                        finalUrl = 'https://' + url;
                      } else if (!url.startsWith('http') && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png'))) {
                        finalUrl = 'https://' + url;
                      }
                      
                      if (!images.includes(finalUrl)) {
                        images.push(finalUrl);
                      }
                    }
                  }
                }
              });
            });
            
            // Se não encontrar imagens nos elementos filhos, busca no elemento principal
            if (images.length === 0) {
              const possibleAttrs = ['image', 'photo', 'picture', 'src', 'imagem', 'foto', 'url_foto'];
              for (const attr of possibleAttrs) {
                const url = element.getAttribute(attr);
                if (url && url.length > 10) {
                  let finalUrl = url;
                  if (url.startsWith('//')) {
                    finalUrl = 'https:' + url;
                  } else if (url.startsWith('www')) {
                    finalUrl = 'https://' + url;
                  } else if (!url.startsWith('http') && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png'))) {
                    finalUrl = 'https://' + url;
                  }
                  images.push(finalUrl);
                  if (index < 3) {
                    console.log(`✅ Imagem do atributo ${attr}: ${finalUrl}`);
                  }
                  break;
                }
              }
            }
            
            // Se ainda não encontrou imagens, usa placeholder
            if (images.length === 0) {
              images.push('/placeholder-car.svg');
              if (index < 3) {
                console.log('⚠️ Nenhuma imagem encontrada, usando placeholder');
              }
            }
            
            return images;
          };

          // Mapeia os campos específicos do XML obtido
          const title = getValue(['TITLE', 'title', 'name', 'nome']);
          const make = getValue(['MAKE', 'brand', 'marca']);
          const model = getValue(['MODEL', 'model', 'modelo']);
          const year = getValue(['YEAR', 'year', 'ano', 'FABRIC_YEAR']);
          const price = getValue(['PRICE', 'price', 'preco', 'valor', 'VALUE']);
          const mileage = getValue(['MILEAGE', 'mileage', 'km', 'quilometragem']);
          const fuel = getValue(['FUEL', 'fuel', 'combustivel']);
          const gear = getValue(['GEAR', 'gear', 'cambio', 'transmission']);
          const doors = getValue(['DOORS', 'doors', 'portas']);
          const description = getValue(['DESCRIPTION', 'description', 'descricao']);
          const accessories = getValue(['ACCESSORIES', 'accessories', 'acessorios']);
          
          // Se o preço não está especificado, gera um preço base realista baseado no ano
          let finalPrice = parseFloat(price || '0');
          if (finalPrice === 0 && year) {
            const vehicleYear = parseInt(year);
            const currentYear = new Date().getFullYear();
            const age = currentYear - vehicleYear;
            // Preço base fictício: 120k para carros novos, depreciando ~10k por ano
            finalPrice = Math.max(30000, 120000 - (age * 10000));
          }
          
          const name = title || `${make} ${model}`.trim() || `Veículo ${index + 1}`;
          
          // Sanitiza imagens
          const allImages = getImages();
          const sanitizedImages = sanitizeImageUrls(allImages);
          
          const vehicle: Vehicle = {
            id: getValue(['ID', 'id', 'codigo', 'cod']) || `xml-${index}`,
            slug: this.generateSlug(name),
            name,
            brand: make || 'Não informado',
            model: model || name,
            year: parseInt(year || '2020'),
            price: finalPrice,
            mileage: parseInt(mileage || '0'),
            fuel: this.parseFuel(fuel || 'Flex'),
            transmission: this.parseTransmission(gear || 'Manual'),
            color: getValue(['COLOR', 'color', 'cor']) || 'Não informado',
            doors: parseInt(doors || '4'),
            image: sanitizeImageUrl(sanitizedImages[0]),
            images: sanitizedImages,
            description: description || accessories || '',
            features: this.parseFeatures(element, accessories)
          };

          // Debug: mostra dados extraídos (só para os primeiros 3)
          if (index < 3) {
            console.log(`🚗 Veículo ${index + 1}:`, {
              id: vehicle.id,
              name: vehicle.name,
              slug: vehicle.slug,
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              price: vehicle.price,
              mileage: vehicle.mileage,
              images: vehicle.images
            });
          }

          vehicles.push(vehicle);
          
        } catch (error) {
          console.warn(`Erro ao processar veículo ${index}:`, error);
        }
      });

      console.log(`✅ Parse concluído: ${vehicles.length} veículos processados`);
      return vehicles;
      
    } catch (error) {
      console.error('❌ Erro no parse do XML:', error);
      return [];
    }
  }

  /**
   * Parse do combustível
   */
  private parseFuel(fuel: string): Vehicle['fuel'] {
    const f = fuel.toLowerCase();
    if (f.includes('diesel')) return 'Diesel';
    if (f.includes('eletrico') || f.includes('elétrico')) return 'Elétrico';
    if (f.includes('hibrido') || f.includes('híbrido')) return 'Híbrido';
    if (f.includes('gasolina')) return 'Gasolina';
    return 'Flex';
  }

  /**
   * Parse da transmissão
   */
  private parseTransmission(trans: string): Vehicle['transmission'] {
    const t = trans.toLowerCase();
    if (t.includes('automatico') || t.includes('automático') || t.includes('auto')) return 'Automático';
    if (t.includes('cvt')) return 'CVT';
    return 'Manual';
  }

  /**
   * Gera slug válido para URLs
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens múltiplos
      .replace(/^-|-$/g, '') // Remove hífens no início e fim
      .trim();
  }

  /**
   * Parse das características
   */
  private parseFeatures(element: Element, accessories?: string): string[] {
    const features: string[] = [];
    
    // Busca características em nós filhos
    const featureNodes = element.querySelectorAll('feature, caracteristica, opcional, item');
    featureNodes.forEach(node => {
      const feature = node.textContent?.trim();
      if (feature) features.push(feature);
    });
    
    // Se temos acessórios como string, divide por vírgula
    if (accessories && accessories.trim()) {
      const accessoryList = accessories.split(',').map(acc => acc.trim()).filter(acc => acc.length > 0);
      features.push(...accessoryList);
    }
    
    return features;
  }

  /**
   * Obtém veículos (prioriza dados estáticos locais)
   */
  async getVehicles(): Promise<Vehicle[]> {
    // Tenta carregar a URL do config salvo
    let xmlUrl: string | null = null;
    try {
      const siteConfigStr = localStorage.getItem('site-config');
      if (siteConfigStr) {
        const siteConfig = JSON.parse(siteConfigStr);
        xmlUrl = siteConfig.xmlUrl;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar config do site:', error);
    }
    
    // Fallback: tenta a chave antiga
    if (!xmlUrl) {
      xmlUrl = localStorage.getItem('verda-auto-xml-url');
    }
    
    console.log('🔍 Verificando configuração XML...');
    console.log('📍 URL configurada:', xmlUrl || 'Nenhuma URL configurada');

    // Carrega cache se existir
    const cached = this.loadCache();
    
    // 1️⃣ Se cache é válido e não precisa sincronizar hoje, retorna do cache
    if (cached && cached.vehicles.length > 0 && !this.shouldSyncToday()) {
      console.log(`📦 Usando dados do cache local (${cached.vehicles.length} veículos, sincronizado em ${cached.lastSyncDate})`);
      return cached.vehicles;
    }
    
    // 2️⃣ Se há URL configurada, tenta buscar XML primeiro
    if (xmlUrl && xmlUrl.trim()) {
      console.log('🔄 Sincronizando dados do XML (hoje ainda não sincronizou)...');
      
      try {
        const xmlContent = await this.fetchXmlDirect(xmlUrl);
        if (xmlContent) {
          const vehicles = this.parseXmlToVehicles(xmlContent);
          if (vehicles.length > 0) {
            console.log(`✅ ${vehicles.length} veículos obtidos do XML e cache atualizado`);
            this.saveCache(vehicles);
            return vehicles;
          } else {
            console.warn('⚠️ XML válido encontrado, mas nenhum veículo foi extraído');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar XML:', error);
      }
      
      // 3️⃣ Se falha na busca do XML, tenta usar cache como fallback
      if (cached && cached.vehicles.length > 0) {
        console.log(`📦 Usando dados do cache local como fallback (${cached.vehicles.length} veículos)`);
        return cached.vehicles;
      }
    } else {
      // Se não há URL configurada, usa cache se disponível
      if (cached && cached.vehicles.length > 0) {
        console.log(`📦 Usando dados do cache local (sem URL configurada, ${cached.vehicles.length} veículos)`);
        return cached.vehicles;
      }
    }

    // Sem fallback para mock data - retorna array vazio se não há dados
    console.log('⚠️ Nenhuma fonte de dados disponível');
    return [];
  }

  /**
   * Força uma nova sincronização
   */
  async forceSync(): Promise<Vehicle[]> {
    console.log('🔄 Forçando sincronização...');
    
    // Remove cache atual
    localStorage.removeItem(CACHE_KEY);
    this.cache = null;
    
    // Busca novamente
    return this.getVehicles();
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    this.cache = null;
    console.log('🗑️ Cache limpo');
  }

  /**
   * Força refresh completo (limpa cache e recarrega)
   */
  async forceRefresh(): Promise<Vehicle[]> {
    console.log('🔄 Forçando refresh completo...');
    
    // Limpa cache
    this.clearCache();
    
    // Busca dados novamente
    return this.getVehicles();
  }

  /**
   * Obtém informações do cache
   */
  getCacheInfo() {
    const cached = this.loadCache();
    if (!cached) return null;
    
    return {
      lastSync: cached.lastUpdate,
      totalVehicles: cached.vehicles.length,
      hash: cached.hash,
      version: 1
    };
  }

  /**
   * Testa conexão com XML
   */
  async testXmlConnection(url: string): Promise<{ success: boolean; message: string; vehicleCount?: number }> {
    try {
      console.log('🧪 Testando XML:', url);
      
      const xmlContent = await this.fetchXmlDirect(url);
      if (!xmlContent) {
        return {
          success: false,
          message: 'Não foi possível acessar o XML. Verifique a URL e se há problemas de CORS.'
        };
      }

      const vehicles = this.parseXmlToVehicles(xmlContent);
      
      return {
        success: true,
        message: `Conexão bem-sucedida! ${vehicles.length} veículos encontrados.`,
        vehicleCount: vehicles.length
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Carregamento manual forçado pelo admin (ignora cache e tenta todos os métodos)
   */
  async forceLoadFromXml(): Promise<{ success: boolean; message: string; vehicleCount: number }> {
    try {
      console.log('🔧 CARREGAMENTO MANUAL FORÇADO PELO ADMIN');
      
      // Obtém URL configurada
      let xmlUrl: string | null = null;
      try {
        const siteConfigStr = localStorage.getItem('site-config');
        if (siteConfigStr) {
          const siteConfig = JSON.parse(siteConfigStr);
          xmlUrl = siteConfig.xmlUrl;
        }
      } catch (error) {
        xmlUrl = localStorage.getItem('verda-auto-xml-url');
      }
      
      if (!xmlUrl || !xmlUrl.trim()) {
        return {
          success: false,
          message: 'Nenhuma URL de XML configurada. Configure primeiro a URL nas configurações.',
          vehicleCount: 0
        };
      }
      
      console.log('🎯 URL alvo:', xmlUrl);
      
      // Limpa cache primeiro
      this.clearCache();
      
      // Tenta buscar XML com método mais agressivo
      const xmlContent = await this.fetchXmlDirect(xmlUrl);
      
      if (!xmlContent) {
        return {
          success: false,
          message: 'Falha ao acessar XML. Todos os proxies CORS falharam. Verifique conectividade ou tente novamente mais tarde.',
          vehicleCount: 0
        };
      }
      
      // Parse dos veículos
      const vehicles = this.parseXmlToVehicles(xmlContent);
      
      if (vehicles.length === 0) {
        return {
          success: false,
          message: 'XML acessado mas nenhum veículo foi encontrado. Verifique se o formato do XML está correto.',
          vehicleCount: 0
        };
      }
      
      // Salva no cache
      this.saveCache(vehicles);
      
      return {
        success: true,
        message: `✅ Carregamento manual bem-sucedido! ${vehicles.length} veículos importados e salvos no cache.`,
        vehicleCount: vehicles.length
      };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro no carregamento manual:', error);
      
      return {
        success: false,
        message: `Erro durante carregamento manual: ${errorMsg}`,
        vehicleCount: 0
      };
    }
  }
}

// Instância singleton
export const localVehicleService = new LocalVehicleService();