import { useEffect } from 'react';

interface MetaTagProps {
  title: string;
  description: string;
  image: string;
  url?: string;
  type?: string;
}

export const useDynamicMeta = ({ title, description, image, url, type = 'website' }: MetaTagProps) => {
  useEffect(() => {
    // Garantir que a imagem seja uma URL absoluta
    const absoluteImage = image.startsWith('http') ? image : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
    const absoluteUrl = url || window.location.href;
    
    // Atualizar título
    document.title = title;

    // Atualizar ou criar meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Atualizar OG tags
    const setOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOGTag('og:title', title);
    setOGTag('og:description', description);
    setOGTag('og:image', absoluteImage);
    setOGTag('og:image:secure_url', absoluteImage);
    setOGTag('og:image:alt', title);
    setOGTag('og:type', type);
    setOGTag('og:url', absoluteUrl);
    setOGTag('og:site_name', 'AUTOFLIX MULTIMARCAS');
    setOGTag('og:locale', 'pt_BR');

    // Atualizar Twitter tags
    const setTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setTwitterTag('twitter:title', title);
    setTwitterTag('twitter:description', description);
    setTwitterTag('twitter:image', absoluteImage);
    setTwitterTag('twitter:image:alt', title);
    setTwitterTag('twitter:card', 'summary_large_image');

    // Schema.org LD-JSON para SEO
    let schemaScript = document.querySelector('script#dynamic-schema') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'dynamic-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': type === 'product' ? 'Product' : 'WebPage',
      name: title,
      description: description,
      image: absoluteImage,
      url: absoluteUrl,
      brand: {
        '@type': 'Brand',
        name: 'AUTOFLIX MULTIMARCAS'
      }
    };

    schemaScript.textContent = JSON.stringify(schema);

  }, [title, description, image, url, type]);
};
