import { Vehicle } from './types';
import { sanitizeImageUrl, sanitizeImageUrls } from './image-service';

// Sistema de cache local
interface CachedData {
  vehicles: Vehicle[];
  lastUpdate: string;
  hash: string;
  lastSyncDate: string;
}

// Configuração da API
const API_BASE_URL = 'https://api.autoflix.com.br/api';
const CACHE_KEY = 'autoflix-vehicles-api-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos para dados da API

class ApiVehicleService {
  private cache: CachedData | null = null;

  /**
   * Obtém a data de hoje no formato YYYY-MM-DD
   */
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Carrega dados do cache local
   */
  private loadCache(): CachedData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log('📦 Nenhum cache da API encontrado');
        return null;
      }
      
      const data = JSON.parse(cached) as CachedData;
      
      // Valida se tem dados de veículos
      if (!data.vehicles || data.vehicles.length === 0) {
        console.log('📦 Cache da API vazio, será renovado');
        return null;
      }
      
      // Verifica se o cache ainda é válido (5 minutos para API)
      const lastUpdate = new Date(data.lastUpdate);
      const cacheAge = Date.now() - lastUpdate.getTime();
      
      console.log(`📦 Cache da API encontrado: ${data.vehicles.length} veículos (age: ${Math.round(cacheAge / 1000 / 60)}min)`);
      
      if (cacheAge > CACHE_DURATION) {
        console.log('📦 Cache da API expirado, será renovado');
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ Erro ao carregar cache da API:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }

  /**
   * Salva dados no cache local
   */
  private saveCache(vehicles: Vehicle[]): void {
    try {
      if (!vehicles || vehicles.length === 0) {
        console.warn('⚠️ Tentativa de salvar cache da API com dados vazios');
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
      console.log(`✅ Cache da API atualizado: ${vehicles.length} veículos (salvo em ${data.lastUpdate})`);
    } catch (error) {
      console.error('❌ Erro ao salvar cache da API:', error);
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
   * Busca veículos da API
   */
  private async fetchVehiclesFromApi(): Promise<Vehicle[]> {
    try {
      console.log('🌐 Buscando veículos da API...');
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na resposta da API');
      }

      const vehicles = result.data.vehicles || [];
      console.log(`✅ ${vehicles.length} veículos obtidos da API`);
      
      // Converte dados da API para formato do frontend
      return vehicles.map((vehicle: any) => this.convertApiVehicle(vehicle));
      
    } catch (error) {
      console.error('❌ Erro ao buscar veículos da API:', error);
      throw error;
    }
  }

  /**
   * Converte dados da API para formato do frontend
   */
  private convertApiVehicle(apiVehicle: any): Vehicle {
    // Sanitiza imagem principal
    const sanitizedImage = sanitizeImageUrl(apiVehicle.image);
    
    // Sanitiza array de imagens
    const imageArray = Array.isArray(apiVehicle.images) 
      ? apiVehicle.images 
      : [apiVehicle.image];
    const sanitizedImages = sanitizeImageUrls(imageArray);
    
    return {
      id: apiVehicle.id,
      slug: apiVehicle.slug,
      name: apiVehicle.name,
      brand: apiVehicle.brand,
      model: apiVehicle.model,
      year: parseInt(apiVehicle.year) || 2020,
      price: parseFloat(apiVehicle.price) || 0,
      mileage: parseInt(apiVehicle.mileage) || 0,
      fuel: apiVehicle.fuel as Vehicle['fuel'] || 'Flex',
      transmission: apiVehicle.transmission as Vehicle['transmission'] || 'Manual',
      color: apiVehicle.color || 'Não informado',
      doors: parseInt(apiVehicle.doors) || 4,
      image: sanitizedImage,
      images: sanitizedImages,
      description: apiVehicle.description || '',
      features: Array.isArray(apiVehicle.features) ? apiVehicle.features : []
    };
  }

  /**
   * Obtém veículos (usa cache se válido, senão busca da API)
   */
  async getVehicles(): Promise<Vehicle[]> {
    console.log('🔍 Iniciando busca de veículos via API...');

    // Carrega cache se existir e for válido
    const cached = this.loadCache();
    if (cached && cached.vehicles.length > 0) {
      console.log(`📦 Usando dados do cache da API (${cached.vehicles.length} veículos)`);
      return cached.vehicles;
    }

    // Busca da API
    try {
      const vehicles = await this.fetchVehiclesFromApi();
      if (vehicles.length > 0) {
        this.saveCache(vehicles);
        return vehicles;
      }
    } catch (error) {
      console.error('❌ Falha ao buscar da API:', error);
      
      // Se tem cache expirado, usa como fallback
      if (cached && cached.vehicles.length > 0) {
        console.log(`📦 Usando cache expirado como fallback (${cached.vehicles.length} veículos)`);
        return cached.vehicles;
      }
    }

    // Se chegou aqui, não há dados disponíveis
    console.log('⚠️ Nenhuma fonte de dados disponível');
    return [];
  }

  /**
   * Força uma nova sincronização via API
   */
  async forceSync(): Promise<Vehicle[]> {
    try {
      console.log('🔄 Forçando sincronização via API...');
      
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na sincronização');
      }

      console.log('✅ Sincronização via API concluída:', result.data.stats);
      
      // Limpa cache e busca dados novamente
      this.clearCache();
      return this.getVehicles();
      
    } catch (error) {
      console.error('❌ Erro na sincronização via API:', error);
      throw error;
    }
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    this.cache = null;
    console.log('🗑️ Cache da API limpo');
  }

  /**
   * Força refresh completo (limpa cache e recarrega)
   */
  async forceRefresh(): Promise<Vehicle[]> {
    console.log('🔄 Forçando refresh completo via API...');
    
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
      version: 2, // Versão da API
      source: 'API'
    };
  }

  /**
   * Obtém estatísticas da API
   */
  async getApiStats(): Promise<any> {
    try {
      console.log('📊 Buscando estatísticas da API...');
      
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao obter estatísticas');
      }

      return result.data;
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas da API:', error);
      throw error;
    }
  }

  /**
   * Obtém logs da API
   */
  async getApiLogs(limit: number = 20): Promise<any> {
    try {
      console.log('📜 Buscando logs da API...');
      
      const response = await fetch(`${API_BASE_URL}/logs?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao obter logs');
      }

      return result.data.logs;
      
    } catch (error) {
      console.error('❌ Erro ao obter logs da API:', error);
      throw error;
    }
  }

  /**
   * Testa conexão com a API
   */
  async testApiConnection(): Promise<{ success: boolean; message: string; vehicleCount?: number }> {
    try {
      console.log('🧪 Testando conexão com a API...');
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          message: result.error || 'Erro na resposta da API'
        };
      }

      const vehicleCount = result.data.total || 0;
      
      return {
        success: true,
        message: `Conexão bem-sucedida! ${vehicleCount} veículos disponíveis na API.`,
        vehicleCount
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }
}

// Instância singleton
export const apiVehicleService = new ApiVehicleService();