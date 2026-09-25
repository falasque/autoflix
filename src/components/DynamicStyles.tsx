import React, { useEffect } from 'react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

const DynamicStyles: React.FC = () => {
  const { config } = useSiteConfig();

  useEffect(() => {
    // Remove estilos anteriores se existirem
    const existingStyle = document.getElementById('dynamic-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Cria novos estilos
    const style = document.createElement('style');
    style.id = 'dynamic-theme-styles';
    style.textContent = `
      :root {
        --primary: ${config.colors.primary};
        --secondary: ${config.colors.secondary};
        --accent: ${config.colors.accent};
        --background: ${config.colors.background};
        --foreground: ${config.colors.foreground};
        
        /* Variações para hover states */
        --primary-hover: ${config.colors.primary}dd;
        --secondary-hover: ${config.colors.secondary}dd;
        --accent-hover: ${config.colors.accent}dd;
      }
      
      /* Aplicar cores personalizadas */
      .bg-primary { background-color: ${config.colors.primary} !important; }
      .text-primary { color: ${config.colors.primary} !important; }
      .border-primary { border-color: ${config.colors.primary} !important; }
      
      .bg-secondary { background-color: ${config.colors.secondary} !important; }
      .text-secondary { color: ${config.colors.secondary} !important; }
      .border-secondary { border-color: ${config.colors.secondary} !important; }
      
      .bg-accent { background-color: ${config.colors.accent} !important; }
      .text-accent { color: ${config.colors.accent} !important; }
      .border-accent { border-color: ${config.colors.accent} !important; }
      
      /* Hover states */
      .hover\\:bg-primary:hover { background-color: ${config.colors.primary}dd !important; }
      .hover\\:text-primary:hover { color: ${config.colors.primary}dd !important; }
      
      /* Gradientes */
      .bg-gradient-primary {
        background: linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary}) !important;
      }
      
      /* Botões customizados */
      .btn-primary {
        background-color: ${config.colors.primary} !important;
        color: white !important;
        border: none !important;
      }
      
      .btn-primary:hover {
        background-color: ${config.colors.primary}dd !important;
      }
      
      /* Links */
      a:hover {
        color: ${config.colors.primary} !important;
      }
    `;
    
    document.head.appendChild(style);
  }, [config.colors]);

  // Também atualiza as meta tags do site
  useEffect(() => {
    document.title = config.name;
    
    // Atualiza a meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);
    
    // Atualiza o favicon se especificado
    if (config.favicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }
      favicon.href = config.favicon;
    }
  }, [config.name, config.description, config.favicon]);

  return null; // Este componente não renderiza nada visível
};

export default DynamicStyles;