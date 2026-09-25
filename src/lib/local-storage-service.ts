import type { Vehicle } from './types';

interface LocalStorageData {
  vehicles: Vehicle[];
  lastUpdate: string;
  xmlUrl: string;
}

const STORAGE_KEY = 'verda-auto-vehicles';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export class LocalStorageService {
  private static instance: LocalStorageService;
  
  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // Salvar dados dos veículos localmente
  public saveVehicles(vehicles: Vehicle[], xmlUrl: string): void {
    try {
      const data: LocalStorageData = {
        vehicles,
        lastUpdate: new Date().toISOString(),
        xmlUrl
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Veículos salvos localmente:', vehicles.length);
      
      // Também salvar no public para acesso direto
      this.saveToPublicFolder(data);
    } catch (error) {
      console.error('❌ Erro ao salvar veículos:', error);
    }
  }

  // Carregar dados dos veículos localmente
  public loadVehicles(): { vehicles: Vehicle[]; needsUpdate: boolean } {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('📂 Nenhum dado local encontrado');
        return { vehicles: [], needsUpdate: true };
      }

      const data: LocalStorageData = JSON.parse(stored);
      const lastUpdate = new Date(data.lastUpdate);
      const now = new Date();
      const needsUpdate = (now.getTime() - lastUpdate.getTime()) > CACHE_DURATION;

      console.log('📂 Dados locais carregados:', {
        vehicles: data.vehicles.length,
        lastUpdate: data.lastUpdate,
        needsUpdate
      });

      return { vehicles: data.vehicles, needsUpdate };
    } catch (error) {
      console.error('❌ Erro ao carregar veículos:', error);
      return { vehicles: [], needsUpdate: true };
    }
  }

  // Verificar se tem dados válidos
  public hasValidCache(): boolean {
    const { needsUpdate } = this.loadVehicles();
    return !needsUpdate;
  }

  // Salvar no public folder para acesso estático
  private async saveToPublicFolder(data: LocalStorageData): Promise<void> {
    try {
      // Criar um endpoint para salvar dados estaticamente
      const response = await fetch('/api/save-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('📁 Dados salvos no servidor local');
      }
    } catch (error) {
      console.log('⚠️ Servidor local não disponível, usando apenas localStorage');
    }
  }

  // Carregar dados estáticos do servidor
  public async loadFromServer(): Promise<Vehicle[]> {
    try {
      const response = await fetch('/vehicles-data.json');
      if (response.ok) {
        const data: LocalStorageData = await response.json();
        console.log('🌐 Dados carregados do servidor:', data.vehicles.length);
        return data.vehicles;
      }
    } catch (error) {
      console.log('⚠️ Dados do servidor não disponíveis');
    }
    return [];
  }

  // Limpar cache
  public clearCache(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Cache limpo');
  }
}

export const localStorageService = LocalStorageService.getInstance();