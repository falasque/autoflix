import { useEffect, useState, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const FloatingTip = () => {
  const [showTip, setShowTip] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Não mostrar em desktop
    if (!isMobile) return;

    const resetTimer = () => {
      // Limpar timer anterior
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      setShowTip(false);

      // Iniciar novo timer - aparecer após 5 segundos de inatividade
      const timer = setTimeout(() => {
        setShowTip(true);
      }, 5000);

      inactivityTimerRef.current = timer;
    };

    // Eventos de atividade do usuário
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    // Iniciar timer na montagem
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isMobile]);

  if (!showTip || !isMobile) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 animate-bounce">
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl max-w-xs text-sm font-bold flex items-center gap-3">
        <span className="text-xl animate-pulse">👉</span>
        <div>
          <p>Clique aqui!</p>
          <p className="text-xs opacity-90">Use os filtros para encontrar seu carro</p>
        </div>
      </div>
      <div className="w-2 h-2 bg-green-600 rounded-full absolute bottom-[-8px] right-6 animate-pulse"></div>
    </div>
  );
};
