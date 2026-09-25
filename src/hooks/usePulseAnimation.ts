import { useEffect, useRef } from 'react';

export const usePulseAnimation = () => {
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let frameCount = 0;
    let animationId: number;

    const animate = () => {
      frameCount = (frameCount + 1) % 180; // 180 frames para 3 segundos em 60fps
      
      // Movimento muito sutil - apenas 2px e escala mínima
      // Pausa nos primeiros 120 frames (2 segundos), depois movimento nos 60 frames seguintes
      let translateX = 0;
      let scale = 1;
      
      if (frameCount >= 120) {
        // Apenas última terça parte da animação tem movimento
        const activePhase = (frameCount - 120) / 60;
        const pulse = Math.sin(activePhase * Math.PI * 2);
        translateX = pulse * 2; // Apenas 2px de movimento
        scale = 1 + pulse * 0.05; // Apenas escala de 0.95 a 1.05
      }
      
      element.style.transform = `translateX(${translateX}px) scale(${scale})`;
      element.style.display = 'inline-block';
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      element.style.transform = '';
    };
  }, []);

  return elementRef;
};
