// Configurações avançadas de SEO para AUTOFLIX MULTIMARCAS

export const SEO_CONFIG = {
  site: {
    name: 'AUTOFLIX MULTIMARCAS',
    title: 'AUTOFLIX MULTIMARCAS - Veículos Seminovos em Curitiba | Garantia e Financiamento',
    description: '🚗 AUTOFLIX MULTIMARCAS em Curitiba - Veículos seminovos das melhores marcas com garantia, financiamento facilitado e procedência. 2 lojas para melhor atendê-lo. Confira!',
    url: 'https://autoflix.com.br',
    logo: 'https://autoflix.com.br/favicon.ico',
    image: 'https://lovable.dev/opengraph-image-p98pqg.png',
    locale: 'pt_BR',
    type: 'website'
  },
  
  business: {
    type: 'AutoDealer',
    name: 'AUTOFLIX MULTIMARCAS',
    telephone: '+55-41-99999-9999',
    priceRange: '$$',
    areaServed: 'Curitiba, PR',
    locations: [
      {
        name: 'LOJA 1 - AUTOFLIX MULTIMARCAS',
        address: {
          streetAddress: 'Endereço Loja 1',
          addressLocality: 'Curitiba',
          addressRegion: 'PR',
          postalCode: '80000-000',
          addressCountry: 'BR'
        },
        geo: {
          latitude: '-25.538054',
          longitude: '-49.284419'
        },
        mapUrl: 'https://maps.app.goo.gl/CTzzr2ozXy6xX33R9'
      },
      {
        name: 'LOJA 2 - AUTOFLIX MULTIMARCAS',
        address: {
          streetAddress: 'Endereço Loja 2',
          addressLocality: 'Curitiba',
          addressRegion: 'PR',
          postalCode: '80000-000',
          addressCountry: 'BR'
        },
        geo: {
          latitude: '-25.541108',
          longitude: '-49.263813'
        },
        mapUrl: 'https://maps.app.goo.gl/zQ4bLpPR2WnJaHFJ6'
      }
    ],
    openingHours: [
      {
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      },
      {
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '13:00'
      }
    ],
    socialMedia: {
      instagram: 'https://www.instagram.com/autoflixmultimarcas',
      facebook: 'https://www.facebook.com/autoflixmultimarcas'
    }
  },

  keywords: {
    primary: [
      'veículos seminovos curitiba',
      'carros usados curitiba',
      'autoflix multimarcas',
      'concessionária curitiba'
    ],
    secondary: [
      'financiamento veículos curitiba',
      'carros com garantia',
      'seminovos procedência',
      'multimarcas curitiba'
    ],
    brands: [
      'toyota curitiba',
      'honda curitiba',
      'volkswagen curitiba',
      'chevrolet curitiba',
      'hyundai curitiba',
      'ford curitiba',
      'fiat curitiba',
      'nissan curitiba'
    ]
  },

  meta: {
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    googlebot: 'index, follow',
    language: 'Portuguese',
    author: 'AUTOFLIX MULTIMARCAS',
    viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover'
  },

  analytics: {
    googleAnalyticsId: 'G-VEYHZYGFCF',
    googleTagManagerId: '', // Adicionar se tiver GTM
    facebookPixelId: '', // Adicionar se tiver Facebook Pixel
    hotjarId: '' // Adicionar se tiver Hotjar
  },

  structuredData: {
    // Schema.org LocalBusiness
    getLocalBusinessSchema: () => ({
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      'name': SEO_CONFIG.business.name,
      'description': SEO_CONFIG.site.description,
      'url': SEO_CONFIG.site.url,
      'logo': SEO_CONFIG.site.logo,
      'image': SEO_CONFIG.site.image,
      'telephone': SEO_CONFIG.business.telephone,
      'priceRange': SEO_CONFIG.business.priceRange,
      'address': SEO_CONFIG.business.locations.map(loc => loc.address),
      'geo': SEO_CONFIG.business.locations.map(loc => ({
        '@type': 'GeoCoordinates',
        'latitude': loc.geo.latitude,
        'longitude': loc.geo.longitude
      })),
      'openingHoursSpecification': SEO_CONFIG.business.openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': hours.dayOfWeek,
        'opens': hours.opens,
        'closes': hours.closes
      })),
      'sameAs': Object.values(SEO_CONFIG.business.socialMedia),
      'paymentAccepted': 'Dinheiro, Cartão de Crédito, Cartão de Débito, Transferência Bancária, Financiamento',
      'areaServed': {
        '@type': 'City',
        'name': 'Curitiba'
      }
    }),

    // Schema.org Product (para veículos)
    getVehicleSchema: (vehicle: any) => ({
      '@context': 'https://schema.org',
      '@type': 'Car',
      'name': vehicle.name,
      'description': vehicle.description || `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${vehicle.mileage.toLocaleString('pt-BR')} km`,
      'brand': {
        '@type': 'Brand',
        'name': vehicle.brand
      },
      'model': vehicle.model,
      'vehicleModelDate': vehicle.year.toString(),
      'mileageFromOdometer': {
        '@type': 'QuantitativeValue',
        'value': vehicle.mileage,
        'unitCode': 'KMT'
      },
      'fuelType': vehicle.fuel,
      'vehicleTransmission': vehicle.transmission,
      'color': vehicle.color,
      'numberOfDoors': vehicle.doors,
      'image': vehicle.images || [vehicle.image],
      'offers': {
        '@type': 'Offer',
        'price': vehicle.price,
        'priceCurrency': 'BRL',
        'availability': 'https://schema.org/InStock',
        'seller': {
          '@type': 'AutoDealer',
          'name': SEO_CONFIG.business.name
        }
      },
      'url': `${SEO_CONFIG.site.url}/veiculo/${vehicle.slug}`
    }),

    // Schema.org BreadcrumbList
    getBreadcrumbSchema: (items: Array<{ name: string; url: string }>) => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    })
  }
};

// Função para gerar meta tags dinâmicas
export const generateMetaTags = (page: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}) => {
  return {
    title: page.title || SEO_CONFIG.site.title,
    description: page.description || SEO_CONFIG.site.description,
    keywords: [...SEO_CONFIG.keywords.primary, ...(page.keywords || [])].join(', '),
    image: page.image || SEO_CONFIG.site.image,
    url: page.url || SEO_CONFIG.site.url,
    type: page.type || SEO_CONFIG.site.type
  };
};

export default SEO_CONFIG;
