/**
 * Cache Service com TTL (Time To Live)
 * Implementa cache em memória com expiração automática
 * 
 * Uso:
 * - cacheService.set(key, value, ttl)
 * - cacheService.get(key)
 * - cacheService.invalidate(key)
 * - cacheService.clear()
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Define um valor no cache com TTL
   * @param {string} key - Chave do cache
   * @param {*} value - Valor a ser armazenado
   * @param {number} ttl - Time To Live em milissegundos (default: 4 horas)
   */
  set(key, value, ttl = 4 * 60 * 60 * 1000) {
    // Limpar timer anterior se existir
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Armazenar valor com timestamp
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Definir timer para expiração
    const timer = setTimeout(() => {
      this.invalidate(key);
      console.log(`🗑️  Cache expirado: ${key}`);
    }, ttl);

    this.timers.set(key, timer);

    console.log(`💾 Cache definido: ${key} (TTL: ${this._formatTtl(ttl)})`);
  }

  /**
   * Obtém um valor do cache
   * @param {string} key - Chave do cache
   * @returns {* | null} Valor armazenado ou null se expirado/não encontrado
   */
  get(key) {
    const cached = this.cache.get(key);

    if (!cached) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }

    const { value, timestamp, ttl } = cached;
    const age = Date.now() - timestamp;

    // Verificar se ainda está válido
    if (age > ttl) {
      this.invalidate(key);
      console.log(`⏰ Cache expirado: ${key} (idade: ${this._formatAge(age)})`);
      return null;
    }

    const remainingTime = ttl - age;
    console.log(`✅ Cache hit: ${key} (válido por mais: ${this._formatTtl(remainingTime)})`);
    return value;
  }

  /**
   * Invalida (remove) um item do cache
   * @param {string} key - Chave do cache
   */
  invalidate(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
    console.log('🧹 Cache completamente limpo');
  }

  /**
   * Invalida cache quando há sincronização
   * Remove todos os caches relacionados a veículos
   */
  invalidateVehicleCache() {
    const vehicleCacheKeys = [
      'vehicles:all',
      'vehicles:filters',
      'vehicles:stats',
      'vehicles:brands',
      'vehicles:years',
      'vehicles:fuels',
      'vehicles:prices'
    ];

    vehicleCacheKeys.forEach(key => {
      if (this.cache.has(key)) {
        this.invalidate(key);
        console.log(`🔄 Cache de veículos invalidado: ${key}`);
      }
    });
  }

  /**
   * Obtém informações sobre o cache (para debug)
   */
  getStats() {
    const stats = {
      totalItems: this.cache.size,
      items: []
    };

    this.cache.forEach((cached, key) => {
      const age = Date.now() - cached.timestamp;
      const remainingTime = cached.ttl - age;
      
      stats.items.push({
        key,
        age: this._formatAge(age),
        remainingTime: this._formatTtl(remainingTime),
        ttl: this._formatTtl(cached.ttl),
        size: this._estimateSize(cached.value)
      });
    });

    return stats;
  }

  /**
   * Formata TTL para string legível
   * @private
   */
  _formatTtl(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Formata idade para string legível
   * @private
   */
  _formatAge(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Estima tamanho do objeto em memória
   * @private
   */
  _estimateSize(obj) {
    const bytes = new Blob([JSON.stringify(obj)]).size;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
}

// Singleton instance
export const cacheService = new CacheService();

export default cacheService;
