/**
 * Hook para regenerar sitemap quando veículos são carregados
 * Garante que o sitemap.xml está sempre atualizado
 */

import { useEffect } from 'react';
import { sitemapService } from '@/lib/sitemap-service';

export function useSitemapRegenerator() {
  useEffect(() => {
    /**
     * Regenerar sitemap via API backend
     * Isso garante que o sitemap.xml tem todos os veículos mais recentes
     */
    const regenerateSitemap = async () => {
      try {
        console.log('🗺️  Hook: Tentando regenerar sitemap via API...');
        
        const result = await sitemapService.regenerateSitemapViaAPI();
        
        if (result.success) {
          console.log('✅ Sitemap regenerado com sucesso!');
        } else {
          console.warn('⚠️ Falha ao regenerar sitemap:', result.message);
        }
      } catch (error) {
        console.error('❌ Erro ao regenerar sitemap:', error);
      }
    };

    // Regenerar sitemap ao carregar o componente
    regenerateSitemap();

    // Também regenerar a cada 6 horas enquanto usuário está na página
    const interval = setInterval(regenerateSitemap, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
