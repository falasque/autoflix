import { databaseVehicleService } from './database-vehicle-service';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: string[];
}

class SitemapService {
  private baseUrl = 'https://autoflix.com.br';
  private apiUrl = 'https://api.autoflix.com.br/api';

  async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Páginas estáticas
    urls.push({
      loc: `${this.baseUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0
    });

    urls.push({
      loc: `${this.baseUrl}/contato`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8
    });

    urls.push({
      loc: `${this.baseUrl}/simular-financiamento`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7
    });

    // Páginas dinâmicas de veículos - buscar da API
    try {
      console.log('🌐 Buscando veículos da API para gerar sitemap...');
      const vehiclesResponse = await databaseVehicleService.getVehicles({ limit: 1000 });
      
      // Handle paginated response
      const vehicles = vehiclesResponse.data || vehiclesResponse;
      
      if (Array.isArray(vehicles) && vehicles.length > 0) {
        console.log(`✅ ${vehicles.length} veículos encontrados para o sitemap`);
        
        vehicles.forEach((vehicle: any) => {
          urls.push({
            loc: `${this.baseUrl}/veiculo/${vehicle.slug}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: 0.9,
            images: vehicle.images || [vehicle.image]
          });
        });
      } else {
        console.warn('⚠️ Nenhum veículo encontrado para o sitemap');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar veículos da API para gerar sitemap:', error);
    }

    return this.buildXML(urls);
  }

  /**
   * Regenerar sitemap via API do backend
   * Este é o método preferido - chama o backend para regenerar
   */
  async regenerateSitemapViaAPI(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Regenerando sitemap via API...');
      
      const response = await fetch(`${this.apiUrl}/sync/generate-sitemap`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Sitemap regenerado com sucesso via API');
        return {
          success: true,
          message: 'Sitemap regenerado com sucesso'
        };
      } else {
        throw new Error(result.error || 'Erro ao regenerar sitemap');
      }
    } catch (error) {
      console.error('❌ Erro ao regenerar sitemap via API:', error);
      return {
        success: false,
        message: `Erro ao regenerar sitemap: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private buildXML(urls: SitemapUrl[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    urls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;

      // Adicionar imagens se existirem
      if (url.images && url.images.length > 0) {
        url.images.forEach(image => {
          xml += '    <image:image>\n';
          xml += `      <image:loc>${this.escapeXml(image)}</image:loc>\n`;
          xml += '    </image:image>\n';
        });
      }

      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async downloadSitemap() {
    const xml = await this.generateSitemap();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async logSitemap() {
    const xml = await this.generateSitemap();
    console.log('📄 Sitemap gerado:\n', xml);
    return xml;
  }
}

export const sitemapService = new SitemapService();
