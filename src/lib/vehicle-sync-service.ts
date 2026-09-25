import { Vehicle } from '@/lib/types';
import { vehicles as mockVehicles } from '@/lib/mock-data';

// Interface para controle de sincronização
interface SyncMetadata {
  lastSync: string;
  totalVehicles: number;
  hash: string;
  version: number;
}

// Interface para dados armazenados
interface CachedVehicleData {
  vehicles: Vehicle[];
  metadata: SyncMetadata;
}

// Chaves para localStorage
const STORAGE_KEYS = {
  VEHICLES: 'verda-auto-vehicles-cache',
  SYNC_METADATA: 'verda-auto-sync-metadata',
  XML_URL: 'verda-auto-xml-url'
};

// Proxies CORS disponíveis
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest='
];

class VehicleSyncService {
  private issyncing = false;
  private syncPromise: Promise<Vehicle[]> | null = null;

  /**
   * Gera hash simples para comparar dados
   */
  private generateHash(data: Vehicle[]): string {
    const str = JSON.stringify(data.map(v => ({
      id: v.id,
      model: v.model,
      price: v.price,
      year: v.year,
      mileage: v.mileage
    })).sort((a, b) => a.id.localeCompare(b.id)));
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Carrega dados do cache local
   */
  private loadCachedData(): CachedVehicleData | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (!cached) return null;

      const data: CachedVehicleData = JSON.parse(cached);
      
      // Verifica se os dados são válidos
      if (!data.vehicles || !Array.isArray(data.vehicles) || !data.metadata) {
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Erro ao carregar dados do cache:', error);
      return null;
    }
  }

  /**
   * Salva dados no cache local
   */
  private saveCachedData(vehicles: Vehicle[]): void {
    try {
      const metadata: SyncMetadata = {
        lastSync: new Date().toISOString(),
        totalVehicles: vehicles.length,
        hash: this.generateHash(vehicles),
        version: 1
      };

      const data: CachedVehicleData = {
        vehicles,
        metadata
      };

      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(data));
      
      console.log(`✅ Cache atualizado: ${vehicles.length} veículos salvos`);
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }

  /**
   * Verifica se o cache precisa ser atualizado (mais de 24h)
   */
  private needsSync(): boolean {
    const cached = this.loadCachedData();
    if (!cached) return true;

    const lastSync = new Date(cached.metadata.lastSync);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync >= 24; // Sincroniza a cada 24 horas
  }

  /**
   * Busca XML usando proxy PHP do servidor primeiro, depois fallback
   */
  private async fetchXmlWithProxy(xmlUrl: string): Promise<string> {
    let lastError: Error | null = null;

    // 1. Tenta primeiro com proxy PHP do servidor (resolve CORS definitivamente)
    if (xmlUrl.includes('app.revendamais.com.br')) {
      try {
        const proxyUrl = `/api/xml.php`;
        console.log('🔄 Usando proxy PHP do servidor:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/xml, text/xml, */*',
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          const text = await response.text();
          if (text.trim() && (text.includes('<?xml') || text.includes('<'))) {
            console.log('✅ XML obtido via proxy PHP do servidor');
            return text;
          }
        }
        console.log(`❌ Proxy PHP falhou: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log('❌ Erro no proxy PHP:', error);
        lastError = error as Error;
      }
    }

    // 2. Fallback: tenta busca direta
    try {
      console.log('🔄 Tentando busca direta como fallback...');
      const response = await fetch(xmlUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; VerdaAutoBot/1.0)'
        }
      });

      if (response.ok) {
        const text = await response.text();
        if (text.trim().startsWith('<?xml') || text.includes('<vehicle>')) {
          console.log('✅ XML obtido diretamente');
          return text;
        }
      }
    } catch (error) {
      console.log('❌ Fallback direto falhou:', error);
      lastError = error as Error;
    }

    // 3. Último recurso: proxies CORS externos
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxy = CORS_PROXIES[i];
      try {
        console.log(`🔄 Tentando proxy externo ${i + 1}/${CORS_PROXIES.length}: ${proxy}`);
        
        const proxyUrl = proxy + encodeURIComponent(xmlUrl);
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/xml, text/xml, */*',
          }
        });

        if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith('<?xml') || text.includes('<vehicle>')) {
            console.log(`✅ XML obtido via proxy externo: ${proxy}`);
            return text;
          }
        }
      } catch (error) {
        console.log(`❌ Proxy externo ${i + 1} falhou:`, error);
        lastError = error as Error;
      }
    }

    throw new Error(`Falha ao buscar XML após tentar todos os métodos. Último erro: ${lastError?.message}`);
  }

  /**
   * Converte XML em array de veículos
   */
  private parseXmlToVehicles(xmlString: string): Vehicle[] {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Verifica se há erro no parsing
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML inválido');
      }

      const vehicles: Vehicle[] = [];
      const vehicleNodes = xmlDoc.querySelectorAll('vehicle, veiculo, car');

      vehicleNodes.forEach((node, index) => {
        try {
          const modelName = this.getXmlValue(node, ['model', 'modelo', 'nome']) || 'Modelo não informado';
          const vehicle: Vehicle = {
            id: this.getXmlValue(node, ['id', 'codigo', 'cod']) || `vehicle-${index}`,
            name: modelName,
            model: modelName,
            brand: this.getXmlValue(node, ['brand', 'marca']) || 'Marca não informada',
            year: parseInt(this.getXmlValue(node, ['year', 'ano']) || '0'),
            price: parseFloat(this.getXmlValue(node, ['price', 'preco', 'valor']) || '0'),
            mileage: parseInt(this.getXmlValue(node, ['mileage', 'km', 'quilometragem']) || '0'),
            fuel: this.parseFuelType(this.getXmlValue(node, ['fuelType', 'combustivel', 'fuel']) || 'Flex'),
            transmission: this.parseTransmission(this.getXmlValue(node, ['transmission', 'cambio']) || 'Manual'),
            color: this.getXmlValue(node, ['color', 'cor']) || 'Não informado',
            doors: parseInt(this.getXmlValue(node, ['doors', 'portas']) || '4'),
            image: this.parseImages(node)[0] || '/placeholder-car.jpg',
            images: this.parseImages(node),
            description: this.getXmlValue(node, ['description', 'descricao', 'obs']) || '',
            features: this.parseFeatures(node),
            slug: this.generateSlug(modelName)
          };

          vehicles.push(vehicle);
        } catch (error) {
          console.warn(`Erro ao processar veículo ${index}:`, error);
        }
      });

      return vehicles;
    } catch (error) {
      console.error('Erro ao fazer parse do XML:', error);
      throw error;
    }
  }

  /**
   * Extrai valor de nós XML com múltiplas possibilidades de nome
   */
  private getXmlValue(node: Element, possibleNames: string[]): string {
    for (const name of possibleNames) {
      const element = node.querySelector(name);
      if (element && element.textContent) {
        return element.textContent.trim();
      }
      
      // Tenta como atributo
      const attr = node.getAttribute(name);
      if (attr) return attr.trim();
    }
    return '';
  }

  /**
   * Extrai imagens do XML
   */
  private parseImages(node: Element): string[] {
    const images: string[] = [];
    const imageNodes = node.querySelectorAll('image, img, foto, imagem');
    
    imageNodes.forEach(imgNode => {
      const url = imgNode.textContent || imgNode.getAttribute('url') || imgNode.getAttribute('src');
      if (url && url.trim()) {
        images.push(url.trim());
      }
    });

    // Se não encontrar imagens, adiciona uma imagem placeholder
    if (images.length === 0) {
      images.push('/placeholder-car.jpg');
    }

    return images;
  }

  /**
   * Extrai características do XML
   */
  private parseFeatures(node: Element): string[] {
    const features: string[] = [];
    const featureNodes = node.querySelectorAll('feature, caracteristica, item, optional');
    
    featureNodes.forEach(featureNode => {
      const feature = featureNode.textContent;
      if (feature && feature.trim()) {
        features.push(feature.trim());
      }
    });

    return features;
  }

  /**
   * Gera slug a partir do nome
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Converte string de combustível para tipo válido
   */
  private parseFuelType(fuel: string): 'Gasolina' | 'Flex' | 'Diesel' | 'Elétrico' | 'Híbrido' {
    const fuelLower = fuel.toLowerCase();
    
    if (fuelLower.includes('diesel')) return 'Diesel';
    if (fuelLower.includes('eletrico') || fuelLower.includes('elétrico')) return 'Elétrico';
    if (fuelLower.includes('hibrido') || fuelLower.includes('híbrido')) return 'Híbrido';
    if (fuelLower.includes('gasolina')) return 'Gasolina';
    
    return 'Flex'; // Default
  }

  /**
   * Converte string de transmissão para tipo válido
   */
  private parseTransmission(transmission: string): 'Manual' | 'Automático' | 'CVT' {
    const transLower = transmission.toLowerCase();
    
    if (transLower.includes('automatico') || transLower.includes('automático') || transLower.includes('auto')) return 'Automático';
    if (transLower.includes('cvt')) return 'CVT';
    
    return 'Manual'; // Default
  }

  /**
   * Compara dados antigos com novos e determina mudanças
   */
  private compareVehicles(oldVehicles: Vehicle[], newVehicles: Vehicle[]): {
    added: Vehicle[];
    updated: Vehicle[];
    removed: Vehicle[];
    unchanged: Vehicle[];
  } {
    const oldMap = new Map(oldVehicles.map(v => [v.id, v]));
    const newMap = new Map(newVehicles.map(v => [v.id, v]));

    const added: Vehicle[] = [];
    const updated: Vehicle[] = [];
    const unchanged: Vehicle[] = [];

    // Verifica novos e atualizados
    newVehicles.forEach(newVehicle => {
      const oldVehicle = oldMap.get(newVehicle.id);
      
      if (!oldVehicle) {
        added.push(newVehicle);
      } else {
        // Compara se houve mudanças
        const oldHash = this.generateHash([oldVehicle]);
        const newHash = this.generateHash([newVehicle]);
        
        if (oldHash !== newHash) {
          updated.push(newVehicle);
        } else {
          unchanged.push(newVehicle);
        }
      }
    });

    // Verifica removidos
    const removed: Vehicle[] = [];
    oldVehicles.forEach(oldVehicle => {
      if (!newMap.has(oldVehicle.id)) {
        removed.push(oldVehicle);
      }
    });

    return { added, updated, removed, unchanged };
  }

  /**
   * Sincroniza dados do XML
   */
  async syncFromXml(): Promise<Vehicle[]> {
    // Evita múltiplas sincronizações simultâneas
    if (this.issyncing && this.syncPromise) {
      return this.syncPromise;
    }

    this.issyncing = true;
    this.syncPromise = this._performSync();

    try {
      const result = await this.syncPromise;
      return result;
    } finally {
      this.issyncing = false;
      this.syncPromise = null;
    }
  }

  /**
   * Executa a sincronização
   */
  private async _performSync(): Promise<Vehicle[]> {
    try {
      console.log('🔄 Iniciando sincronização de veículos...');

      // Carrega URL do XML
      const xmlUrl = localStorage.getItem(STORAGE_KEYS.XML_URL) || 
        'https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml';

      // Busca dados do XML
      const xmlString = await this.fetchXmlWithProxy(xmlUrl);
      const newVehicles = this.parseXmlToVehicles(xmlString);

      if (newVehicles.length === 0) {
        throw new Error('Nenhum veículo encontrado no XML');
      }

      // Carrega dados atuais do cache
      const cached = this.loadCachedData();
      const oldVehicles = cached?.vehicles || [];

      // Compara dados
      const changes = this.compareVehicles(oldVehicles, newVehicles);

      // Log das mudanças
      if (changes.added.length > 0) {
        console.log(`➕ ${changes.added.length} veículos adicionados`);
      }
      if (changes.updated.length > 0) {
        console.log(`🔄 ${changes.updated.length} veículos atualizados`);
      }
      if (changes.removed.length > 0) {
        console.log(`➖ ${changes.removed.length} veículos removidos`);
      }
      if (changes.unchanged.length > 0) {
        console.log(`✅ ${changes.unchanged.length} veículos sem alteração`);
      }

      // Salva os novos dados
      this.saveCachedData(newVehicles);

      console.log(`✅ Sincronização concluída: ${newVehicles.length} veículos`);
      return newVehicles;

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      
      // Em caso de erro, retorna dados do cache se disponíveis
      const cached = this.loadCachedData();
      if (cached && cached.vehicles.length > 0) {
        console.log('📦 Usando dados do cache devido ao erro na sincronização');
        return cached.vehicles;
      }

      // Se não há cache, usa dados mock
      console.log('🎭 Usando dados mock devido ao erro e ausência de cache');
      this.saveCachedData(mockVehicles);
      return mockVehicles;
    }
  }

  /**
   * Retorna veículos (do cache ou sincroniza se necessário)
   */
  async getVehicles(forceSync = false): Promise<Vehicle[]> {
    // Se forçar sync ou precisar sincronizar
    if (forceSync || this.needsSync()) {
      return this.syncFromXml();
    }

    // Retorna dados do cache
    const cached = this.loadCachedData();
    if (cached && cached.vehicles.length > 0) {
      console.log('📦 Usando dados do cache');
      return cached.vehicles;
    }

    // Se não há cache, força sincronização
    return this.syncFromXml();
  }

  /**
   * Força sincronização manual
   */
  async forceSyncNow(): Promise<Vehicle[]> {
    return this.getVehicles(true);
  }

  /**
   * Retorna informações sobre o último sync
   */
  getSyncInfo(): SyncMetadata | null {
    const cached = this.loadCachedData();
    return cached?.metadata || null;
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    console.log('🗑️ Cache de veículos limpo');
  }
}

// Instância singleton
export const vehicleSyncService = new VehicleSyncService();

// Hook para usar em React
export const useVehicleSync = () => {
  return {
    getVehicles: vehicleSyncService.getVehicles.bind(vehicleSyncService),
    forceSyncNow: vehicleSyncService.forceSyncNow.bind(vehicleSyncService),
    getSyncInfo: vehicleSyncService.getSyncInfo.bind(vehicleSyncService),
    clearCache: vehicleSyncService.clearCache.bind(vehicleSyncService)
  };
};