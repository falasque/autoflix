// Configurações de tracking
export interface AnalyticsConfig {
  gaId?: string;
  gtmId?: string;
  enabled: boolean;
}

// Eventos customizados para tracking
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Declarar gtag globalmente
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private config: AnalyticsConfig = { enabled: false };
  private isInitialized = false;

  init(config: AnalyticsConfig) {
    this.config = config;
    
    if (!config.enabled) {
      console.log('📊 Analytics desativado');
      return;
    }

    // O Google Analytics já está no index.html, apenas configurar eventos
    this.setupCustomEvents();
    this.isInitialized = true;
    console.log('✅ Analytics inicializado - ID:', config.gaId);
  }

  private initializeGTM() {
    if (!this.config.gtmId) return;

    // GTM Script
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${this.config.gtmId}');
    `;
    document.head.appendChild(gtmScript);

    // GTM NoScript
    const gtmNoScript = document.createElement('noscript');
    gtmNoScript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${this.config.gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;
    document.body.appendChild(gtmNoScript);

    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];
  }

  private initializeGA() {
    // Google Analytics já está configurado no index.html
    // Esta função não é mais necessária, mas mantida para compatibilidade
    return;
  }

  private setupCustomEvents() {
    // Tracking de cliques em links externos
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href);
        const isExternal = url.hostname !== window.location.hostname;
        
        if (isExternal) {
          this.trackEvent({
            action: 'click',
            category: 'external_link',
            label: url.hostname
          });
        }
      }
    });

    // Tracking de tempo na página
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      this.trackEvent({
        action: 'time_on_page',
        category: 'engagement',
        value: timeSpent
      });
    });

    // Tracking de scroll depth
    let maxScroll = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll >= 25 && maxScroll < 50) {
          this.trackEvent({ action: 'scroll', category: 'engagement', label: '25%' });
        } else if (maxScroll >= 50 && maxScroll < 75) {
          this.trackEvent({ action: 'scroll', category: 'engagement', label: '50%' });
        } else if (maxScroll >= 75 && maxScroll < 90) {
          this.trackEvent({ action: 'scroll', category: 'engagement', label: '75%' });
        } else if (maxScroll >= 90) {
          this.trackEvent({ action: 'scroll', category: 'engagement', label: '90%' });
        }
      }
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          trackScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Métodos públicos para tracking
  trackEvent(event: AnalyticsEvent) {
    if (!this.config.enabled || !this.isInitialized) return;

    // Google Analytics 4
    if (this.config.gaId && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    }

    // Google Tag Manager
    if (this.config.gtmId && window.dataLayer) {
      window.dataLayer.push({
        event: 'custom_event',
        event_action: event.action,
        event_category: event.category,
        event_label: event.label,
        event_value: event.value,
        ...event.custom_parameters
      });
    }

    console.log('📊 Event tracked:', event);
  }

  trackPageView(path: string, title?: string) {
    if (!this.config.enabled || !this.isInitialized) return;

    if (this.config.gaId && window.gtag) {
      window.gtag('config', this.config.gaId, {
        page_path: path,
        page_title: title || document.title
      });
      console.log('📄 Page view tracked:', path);
    }

    if (this.config.gtmId && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: path,
        page_title: title || document.title
      });
    }
  }

  trackVehicleView(vehicle: any) {
    this.trackEvent({
      action: 'view_item',
      category: 'vehicle',
      label: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      custom_parameters: {
        item_id: vehicle.id,
        item_name: vehicle.name,
        item_category: 'vehicle',
        item_brand: vehicle.brand,
        price: vehicle.price,
        currency: 'BRL'
      }
    });
  }

  trackVehicleInterest(vehicle: any, action: 'whatsapp' | 'phone' | 'email') {
    this.trackEvent({
      action: 'generate_lead',
      category: 'vehicle_interest',
      label: `${action}_${vehicle.brand}_${vehicle.model}`,
      value: vehicle.price,
      custom_parameters: {
        lead_type: action,
        vehicle_id: vehicle.id,
        vehicle_name: vehicle.name,
        vehicle_price: vehicle.price
      }
    });
  }

  trackSearch(query: string, resultsCount: number) {
    this.trackEvent({
      action: 'search',
      category: 'vehicle_search',
      label: query,
      value: resultsCount,
      custom_parameters: {
        search_term: query,
        results_count: resultsCount
      }
    });
  }

  trackFilter(filterType: string, filterValue: string) {
    this.trackEvent({
      action: 'filter',
      category: 'vehicle_filter',
      label: `${filterType}_${filterValue}`,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue
      }
    });
  }

  // Compliance com LGPD/GDPR
  setConsentGranted() {
    if (this.config.gaId && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    }
  }

  setConsentDenied() {
    if (this.config.gaId && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  }
}

export const analytics = new AnalyticsService();

// Hook para usar analytics
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackVehicleView: analytics.trackVehicleView.bind(analytics),
    trackVehicleInterest: analytics.trackVehicleInterest.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackFilter: analytics.trackFilter.bind(analytics)
  };
};