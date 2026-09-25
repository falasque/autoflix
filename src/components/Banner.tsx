import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BANNER_IMAGES = [
  { src: '/banner1.png', alt: 'Banner 1' },
  { src: '/banner2.png', alt: 'Banner 2' }
];

export const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [availableImages, setAvailableImages] = useState<typeof BANNER_IMAGES>([]);

  // Verificar quais imagens existem
  useEffect(() => {
    const checkImages = async () => {
      const existingImages = [];
      
      for (const image of BANNER_IMAGES) {
        try {
          const img = new Image();
          img.src = image.src;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          existingImages.push(image);
        } catch (error) {
          console.log(`Banner ${image.src} não encontrado`);
        }
      }
      
      setAvailableImages(existingImages);
      setIsLoading(false);
    };

    checkImages();
  }, []);

  // Auto-play do carrossel
  useEffect(() => {
    if (availableImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % availableImages.length);
    }, 5000); // Troca a cada 5 segundos

    return () => clearInterval(interval);
  }, [availableImages.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % availableImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Não renderizar se não há imagens ou ainda está carregando
  if (isLoading || availableImages.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-40 sm:h-56 md:h-96 lg:h-[500px] overflow-hidden bg-gray-100 mt-16 sm:mt-20 md:mt-0">
      {/* Elementos decorativos AUTOFLIX */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <img 
          src="/xis.svg" 
          alt="" 
          className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 w-6 sm:w-7 md:w-8 opacity-20 animate-pulse hidden md:block"
          aria-hidden="true"
        />
        <img 
          src="/ponto.png" 
          alt="" 
          className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-6 sm:left-10 md:left-12 w-2 sm:w-2.5 md:w-3 opacity-30 hidden md:block"
          aria-hidden="true"
        />
        <img 
          src="/xis.svg" 
          alt="" 
          className="absolute top-1/2 left-4 sm:left-6 md:left-8 w-5 sm:w-6 md:w-6 opacity-15 transform rotate-45 hidden md:block"
          aria-hidden="true"
        />
      </div>

      {/* Imagens do banner - responsivas */}
      <div className="relative w-full h-full">
        {availableImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Controles do carrossel (apenas se houver mais de uma imagem) */}
      {availableImages.length > 1 && (
        <>
          {/* Botões de navegação - responsivos */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 border-white/30 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
            onClick={prevSlide}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 border-white/30 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
            onClick={nextSlide}
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </Button>

          {/* Indicadores - responsivos */}
          <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 md:gap-2">
            {availableImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white scale-110 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3'
                    : 'bg-white/50 hover:bg-white/75 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Overlay gradiente para melhor legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};