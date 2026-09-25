import { useEffect, useRef } from 'react';

export const useShakeAnimation = () => {
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let frameCount = 0;
    let animationId: number;

    const animate = () => {
      frameCount = (frameCount + 1) % 180; // 180 frames para 3 segundos em 60fps
      
      // Movimento muito sutil - apenas 2px
      // Pausa nos primeiros 120 frames (2 segundos), depois movimento nos 60 frames seguintes
      let translateX = 0;
      let rotate = 0;
      
      if (frameCount >= 120) {
        // Apenas última terça parte da animação tem movimento
        const activePhase = (frameCount - 120) / 60;
        const shake = Math.sin(activePhase * Math.PI * 2);
        translateX = shake * 2; // Apenas 2px de movimento
        rotate = shake * 0.5; // Apenas 0.5 graus de rotação
      }
      
      element.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
      
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
