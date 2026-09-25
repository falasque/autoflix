import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('Nova versão do Service Worker disponível');
            }
          });

          console.log('Service Worker registrado com sucesso');
        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      };

      registerSW();
    }
  }, []);
};