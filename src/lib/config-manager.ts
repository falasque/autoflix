import { SiteConfig } from './admin-types';

// Configuração padrão do site
const defaultSiteConfig: SiteConfig = {
  name: "AUTOFLIX MULTIMARCAS",
  description: "Veículos seminovos com qualidade garantida",
  logo: "/logo.svg",
  favicon: "/favicon.ico",
  xmlUrl: "https://app.revendamais.com.br/application/index.php/apiGeneratorXml/generator/sitedaloja/fcea82d6d33494aa52975011402e563a11466.xml",
  address: {
    street: "R. Cruzeiro do Sul, 204 - Sítio Cercado",
    city: "Curitiba",
    state: "PR",
    zipCode: "81900-230",
    country: "Brasil"
  },
  contact: {
    phone: "(41) 99588-0292",
    whatsapp: "5541995880292"
  },
  secondaryStore: {
    address: {
      street: "R. Nova Aurora, 2036 - Sítio Cercado",
      city: "Curitiba",
      state: "PR",
      zipCode: "81920-650",
      country: "Brasil"
    },
    phone: "(41) 99501-1170",
    coordinates: {
      lat: -25.4290,
      lng: -49.2371
    }
  },
  colors: {
    primary: "#16a34a",
    secondary: "#FF6B35",
    accent: "#4ECDC4",
    background: "#FFFFFF",
    foreground: "#1A1A1A"
  },
  hero: {
    title: "Encontre o Carro dos Seus Sonhos",
    subtitle: "Veículos seminovos com qualidade garantida e as melhores condições de pagamento",
    backgroundImage: "/hero-bg.jpg"
  },
  features: [
    "Garantia de 6 meses",
    "Financiamento facilitado",
    "Troca garantida",
    "Revisão pré-entrega"
  ],
  socialMedia: {
    instagram: "https://www.instagram.com/autoflixbr/",
    whatsapp: "https://wa.me/5541995880292"
  },
  analytics: {
    googleAnalyticsId: "",
    googleTagManagerId: "",
    enabled: false
  }
};

export const SiteConfigManager = {
  // Carrega a configuração do localStorage ou usa a padrão
  loadConfig: (): SiteConfig => {
    try {
      const saved = localStorage.getItem('site-config');
      // Se houver configuração salva, carrega dela
      if (saved) {
        const config = JSON.parse(saved);
        // Mescla com a configuração padrão para garantir que todas as propriedades existam
        return { ...defaultSiteConfig, ...config };
      }
    } catch (error) {
      console.error('Erro ao carregar configuração do site:', error);
    }
    return defaultSiteConfig;
  },

  // Salva a configuração no localStorage
  saveConfig: (config: SiteConfig): void => {
    try {
      localStorage.setItem('site-config', JSON.stringify(config));
      // Dispara evento customizado para notificar componentes sobre a mudança
      window.dispatchEvent(new CustomEvent('siteConfigChanged', { detail: config }));
    } catch (error) {
      console.error('Erro ao salvar configuração do site:', error);
    }
  },

  // Reseta para a configuração padrão
  resetToDefault: (): SiteConfig => {
    localStorage.removeItem('site-config');
    window.dispatchEvent(new CustomEvent('siteConfigChanged', { detail: defaultSiteConfig }));
    return defaultSiteConfig;
  },

  // Retorna a configuração padrão
  getDefaultConfig: (): SiteConfig => {
    return { ...defaultSiteConfig };
  }
};