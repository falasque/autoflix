/**
 * Serviço para acessar dados de veículos do backend SQLite
 * Substitui o sistema anterior de localStorage + XML direto
 */

import { Vehicle } from './types';

export interface VehicleFilters {
  page?: number;
  limit?: number;
  brand?: string;
  year?: number;
  fuel?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface SyncInfo {
  lastSync: {
    id: number;
    sync_date: string;
    vehicles_added: number;
    vehicles_updated: number;
    vehicles_removed: number;
    total_vehicles: number;
    status: 'success' | 'error';
    error_message: string | null;
    duration_ms: number;
  } | null;
  totalVehicles: number;
  timestamp: string;
}

class DatabaseVehicleService {
  private baseUrl: string;
  private cacheTime = 5 * 60 * 1000; // 5 minutes cache
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.getBackendUrl();
  }

  /**
   * Get backend URL from environment or localStorage config
   */
  private getBackendUrl(): string {
    // Try environment variable first
    const apiUrl = (import.meta as any).env?.VITE_API_URL;
    if (apiUrl) {
      return apiUrl;
    }

    // Try localStorage config
    try {
      const config = localStorage.getItem('site-config');
      if (config) {
        const parsed = JSON.parse(config);
        if (parsed.backendUrl) {
          return parsed.backendUrl;
        }
      }
    } catch (error) {
      console.warn('Failed to read backend URL from localStorage:', error);
    }

    // Default fallback - PRODUÇÃO
    return 'https://api.autoflix.com.br/api';
  }

  /**
   * Make API request with error handling
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const cacheKey = `${endpoint}_${JSON.stringify(options?.body || {})}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      });

      if (!response.ok) {
        // Criar erro específico com status code
        const error: any = new Error(`API Error: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();

      // Cache successful response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error: any) {
      // Apenas loga erros que NÃO são 404 (veículo não encontrado é esperado)
      if (error.status !== 404) {
        console.error(`❌ Request failed: ${endpoint}`, error);
      }
      throw error;
    }
  }

  /**
   * Fetch vehicles with filters and pagination
   */
  async getVehicles(filters?: VehicleFilters) {
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.year) queryParams.append('year', filters.year.toString());
      if (filters.fuel) queryParams.append('fuel', filters.fuel);
      if (filters.priceMin !== undefined) queryParams.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) queryParams.append('priceMax', filters.priceMax.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.order) queryParams.append('order', filters.order);
    }

    const url = `/vehicles?${queryParams.toString()}`;
    return this.request<PaginationResponse<any>>(url);
  }

  /**
   * Fetch single vehicle by ID or slug
   */
  async getVehicleById(identifier: string): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${identifier}`);
  }

  /**
   * Get available filter options
   */
  async getFilterOptions() {
    return this.request('/vehicles/filters/options');
  }

  /**
   * Get vehicle statistics
   */
  async getStatistics() {
    return this.request('/vehicles/stats/overview');
  }

  /**
   * Get sync information
   */
  async getSyncInfo(): Promise<SyncInfo> {
    return this.request('/sync/info');
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit = 10) {
    return this.request(`/sync/history?limit=${limit}`);
  }

  /**
   * Trigger manual sync (admin only)
   */
  async triggerSync() {
    // Clear cache when syncing
    this.cache.clear();

    return this.request('/sync/trigger', {
      method: 'POST'
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('✅ Cache cleared');
  }

  /**
   * Set backend URL
   */
  setBackendUrl(url: string) {
    this.baseUrl = url;
    this.clearCache();
  }
}

// Singleton instance
export const databaseVehicleService = new DatabaseVehicleService();
