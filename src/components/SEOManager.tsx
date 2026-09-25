import { useEffect } from 'react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { Vehicle } from '@/lib/types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  vehicle?: Vehicle;
  noIndex?: boolean;
}

const SEOManager: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  vehicle,
  noIndex = false
}) => {
  const { config } = useSiteConfig();

  useEffect(() => {
    // Meta tags básicas
    const siteTitle = title ? `${title} | ${config.name}` : config.name;
    const siteDescription = description || config.description;
    const siteImage = image || config.logo;
    const currentUrl = url || window.location.href;

    // Title
    document.title = siteTitle;

    // Description
    updateMetaTag('description', siteDescription);

    // Keywords
    const allKeywords = [
      ...keywords,
      'carros seminovos',
      'veículos usados',
      'concessionária',
      config.address.city,
      config.address.state
    ];
    updateMetaTag('keywords', allKeywords.join(', '));

    // Robots
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Canonical URL
    updateLinkTag('canonical', currentUrl);

    // Open Graph
    updateMetaProperty('og:title', siteTitle);
    updateMetaProperty('og:description', siteDescription);
    updateMetaProperty('og:type', type);
    updateMetaProperty('og:url', currentUrl);
    updateMetaProperty('og:site_name', config.name);
    updateMetaProperty('og:locale', 'pt_BR');
    
    if (siteImage) {
      updateMetaProperty('og:image', siteImage);
      updateMetaProperty('og:image:width', '1200');
      updateMetaProperty('og:image:height', '630');
      updateMetaProperty('og:image:alt', siteTitle);
    }

    // Twitter Cards
    updateMetaProperty('twitter:card', 'summary_large_image');
    updateMetaProperty('twitter:title', siteTitle);
    updateMetaProperty('twitter:description', siteDescription);
    if (siteImage) {
      updateMetaProperty('twitter:image', siteImage);
    }

    // JSON-LD para veículo
    if (vehicle) {
      insertVehicleStructuredData(vehicle, config);
    } else {
      insertOrganizationStructuredData(config);
    }

  }, [title, description, keywords, image, url, type, vehicle, noIndex, config]);

  return null;
};

// Funções utilitárias
const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
};

const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
};

const updateLinkTag = (rel: string, href: string) => {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
};

const insertVehicleStructuredData = (vehicle: Vehicle, config: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": vehicle.name,
    "description": vehicle.description,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand
    },
    "model": vehicle.model,
    "vehicleModelDate": vehicle.year.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": vehicle.mileage,
      "unitCode": "KMT"
    },
    "fuelType": vehicle.fuel,
    "vehicleTransmission": vehicle.transmission,
    "color": vehicle.color,
    "numberOfDoors": vehicle.doors,
    "image": vehicle.images,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BRL",
      "price": vehicle.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutoDealer",
        "name": config.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": config.address.street,
          "addressLocality": config.address.city,
          "addressRegion": config.address.state,
          "postalCode": config.address.zipCode,
          "addressCountry": config.address.country
        },
        "telephone": config.contact.phone,
        "email": config.contact.email
      }
    },
    "url": window.location.href
  };

  insertJSONLD('vehicle-data', structuredData);
};

const insertOrganizationStructuredData = (config: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": config.name,
    "description": config.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.address.street,
      "addressLocality": config.address.city,
      "addressRegion": config.address.state,
      "postalCode": config.address.zipCode,
      "addressCountry": config.address.country
    },
    "telephone": config.contact.phone,
    "email": config.contact.email,
    "url": window.location.origin,
    "sameAs": Object.values(config.socialMedia).filter(Boolean),
    "openingHours": "Mo-Fr 08:00-18:00, Sa 08:00-12:00",
    "priceRange": "$$"
  };

  insertJSONLD('organization-data', structuredData);
};

const insertJSONLD = (id: string, data: any) => {
  // Remove script anterior se existir
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Cria novo script
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export default SEOManager;