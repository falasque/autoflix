import { useEffect } from 'react';
import { Vehicle } from '@/lib/types';

/**
 * Hook para adicionar schema JSON-LD para veículos na página
 * Melhora SEO e rich snippets nos resultados de busca
 */
export function useVehicleSchema(vehicle: Vehicle | null | undefined) {
  useEffect(() => {
    if (!vehicle) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Car',
      name: vehicle.name,
      description: vehicle.description || `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      url: `${typeof window !== 'undefined' ? window.location.href : ''}`,
      image: vehicle.images || [vehicle.image],
      brand: {
        '@type': 'Brand',
        name: vehicle.brand
      },
      model: vehicle.model,
      vehicleModelDate: vehicle.year.toString(),
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: vehicle.mileage,
        unitText: 'km'
      },
      fuelType: vehicle.fuel,
      vehicleTransmission: vehicle.transmission,
      numberOfDoors: vehicle.doors,
      color: vehicle.color,
      offers: {
        '@type': 'Offer',
        price: vehicle.price.toString(),
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/UsedCondition',
        url: `${typeof window !== 'undefined' ? window.location.href : ''}`
      },
      vehicleConfiguration: vehicle.features?.join(', ') || '',
      datePosted: new Date().toISOString().split('T')[0],
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': typeof window !== 'undefined' ? window.location.href : ''
      }
    };

    // Criar e adicionar script tag com schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [vehicle]);
}

/**
 * Hook para adicionar schema JSON-LD para listagem de veículos (Collection)
 */
export function useVehiclesCollectionSchema(vehicles: Vehicle[] | null | undefined) {
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Veículos em Destaque - AUTOFLIX MULTIMARCAS',
      description: `Conheça nossa coleção de ${vehicles.length} veículos seminovos com qualidade garantida`,
      url: `${typeof window !== 'undefined' ? window.location.href : ''}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: vehicles.slice(0, 10).map((vehicle, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${typeof window !== 'undefined' ? window.location.origin : ''}/veiculo/${vehicle.slug}`,
          name: vehicle.name,
          image: vehicle.image,
          description: `${vehicle.brand} ${vehicle.model} ${vehicle.year} - R$ ${vehicle.price.toLocaleString('pt-BR')}`
        }))
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [vehicles]);
}

/**
 * Hook para adicionar schema da Organization (informações da empresa)
 */
export function useOrganizationSchema(config?: any) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config?.name || 'AUTOFLIX MULTIMARCAS',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      logo: config?.logo || `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.svg`,
      description: 'Revenda de veículos seminovos com qualidade garantida',
      telephone: config?.phone || '',
      email: config?.email || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: config?.address || '',
        addressLocality: 'Curitiba',
        addressRegion: 'PR',
        addressCountry: 'BR'
      },
      sameAs: [
        config?.instagram || '',
        config?.facebook || '',
        'https://www.google.com/search?q=AUTOFLIX+MULTIMARCAS'
      ].filter(Boolean),
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: config?.phone || '',
        contactType: 'Customer Service',
        email: config?.email || '',
        areaServed: 'BR'
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [config]);
}

/**
 * Hook para adicionar schema de LocalBusiness (negócio local)
 */
export function useLocalBusinessSchema(config?: any) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': typeof window !== 'undefined' ? window.location.origin : '',
      name: config?.name || 'AUTOFLIX MULTIMARCAS',
      image: config?.logo || `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.svg`,
      description: 'Revenda de veículos seminovos com qualidade garantida em Curitiba',
      address: {
        '@type': 'PostalAddress',
        streetAddress: config?.address || 'Rua Exemplo, 1000',
        addressLocality: 'Curitiba',
        addressRegion: 'PR',
        postalCode: '80000-000',
        addressCountry: 'BR'
      },
      telephone: config?.phone || '',
      email: config?.email || '',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      priceRange: 'R$ 10.000 - R$ 500.000',
      areaServed: ['Curitiba', 'Paraná', 'Brasil'],
      hoursOperation: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '13:00'
        }
      ],
      sameAs: [
        config?.instagram || '',
        config?.facebook || '',
      ].filter(Boolean),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1'
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [config]);
}

/**
 * Hook para adicionar schema Breadcrumb
 */
export function useBreadcrumbSchema(items?: Array<{ name: string; url: string }>) {
  useEffect(() => {
    const defaultItems = [
      { name: 'Home', url: `${typeof window !== 'undefined' ? window.location.origin : ''}/` },
      { name: 'Veículos', url: `${typeof window !== 'undefined' ? window.location.origin : ''}/` },
      ...(items || [])
    ];

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: defaultItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [items]);
}
