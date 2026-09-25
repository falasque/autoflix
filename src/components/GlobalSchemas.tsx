import { useOrganizationSchema, useLocalBusinessSchema } from '@/hooks/use-schema';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

/**
 * Componente que injeta schemas JSON-LD globais para SEO
 * - Organization: Informações da empresa
 * - LocalBusiness: Dados de negócio local
 * 
 * Renderiza uma vez na aplicação e é responsável por injetar
 * os scripts JSON-LD no document.head
 */
export const GlobalSchemas = () => {
  const { config } = useSiteConfig();

  // Injetar schema da organização
  useOrganizationSchema(config);

  // Injetar schema de negócio local
  useLocalBusinessSchema(config);

  // Este componente não renderiza nada visível
  return null;
};

export default GlobalSchemas;
