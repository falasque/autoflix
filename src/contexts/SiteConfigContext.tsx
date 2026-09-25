import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteConfig } from '@/lib/admin-types';
import { SiteConfigManager } from '@/lib/config-manager';

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  isLoading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};

interface SiteConfigProviderProps {
  children: ReactNode;
}

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(SiteConfigManager.getDefaultConfig());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carrega a configuração salva
    const loadedConfig = SiteConfigManager.loadConfig();
    setConfig(loadedConfig);
    setIsLoading(false);

    // Escuta mudanças na configuração
    const handleConfigChange = (event: CustomEvent<SiteConfig>) => {
      setConfig(event.detail);
    };

    window.addEventListener('siteConfigChanged', handleConfigChange as EventListener);

    return () => {
      window.removeEventListener('siteConfigChanged', handleConfigChange as EventListener);
    };
  }, []);

  const updateConfig = (newConfig: Partial<SiteConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    SiteConfigManager.saveConfig(updatedConfig);
  };

  const resetConfig = () => {
    const defaultConfig = SiteConfigManager.resetToDefault();
    setConfig(defaultConfig);
  };

  const value: SiteConfigContextType = {
    config,
    updateConfig,
    resetConfig,
    isLoading
  };

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
};