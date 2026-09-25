import { useMemo, useEffect } from 'react';
import { shuffle } from '@/lib/utils';

/**
 * Hook para manter ordem aleatória consistente durante a sessão
 * 
 * Funcionalidade:
 * - Gera uma seed única por sessão (sessionStorage)
 * - Usa a seed para embaralhar veículos de forma determinística
 * - Mesma seed = mesma ordem durante toda a sessão
 * - F5 não muda a ordem, apenas fechar o navegador
 */

// Gera uma seed numérica baseada em string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Shuffle determinístico usando seed
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  
  // Implementação de Fisher-Yates com seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Gera número pseudo-aleatório baseado em seed
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const randomIndex = Math.floor((currentSeed / 233280) * (i + 1));
    
    // Swap
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  
  return shuffled;
}

export function useSessionRandomOrder<T>(items: T[], enabled: boolean = true): T[] {
  // Gera ou recupera seed da sessão
  const sessionSeed = useMemo(() => {
    if (!enabled) return 0;
    
    const STORAGE_KEY = 'autoflix-random-seed';
    
    // Tenta pegar seed existente
    const existingSeed = sessionStorage.getItem(STORAGE_KEY);
    if (existingSeed) {
      return parseInt(existingSeed, 10);
    }
    
    // Gera nova seed baseada em timestamp + random
    const newSeed = hashString(Date.now().toString() + Math.random().toString());
    sessionStorage.setItem(STORAGE_KEY, newSeed.toString());
    
    return newSeed;
  }, [enabled]);

  // Ordena itens usando seed da sessão
  const orderedItems = useMemo(() => {
    if (!enabled || items.length === 0) {
      return items;
    }
    
    // Usa shuffle determinístico
    return seededShuffle(items, sessionSeed);
  }, [items, sessionSeed, enabled]);

  return orderedItems;
}

/**
 * Hook para resetar a seed da sessão (força nova ordem aleatória)
 */
export function useResetSessionOrder() {
  return () => {
    sessionStorage.removeItem('autoflix-random-seed');
  };
}
