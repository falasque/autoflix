import React from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackImage?: string;
}

/**
 * Componente SIMPLIFICADO de imagem
 * REGRA: Imagens do S3 (carro57) NUNCA usam fallback, apenas esperam carregar
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  onLoad,
  onError
}) => {
  const [hasLoaded, setHasLoaded] = React.useState(false);

  // Verifica se é URL do S3
  const isS3Image = (url: string): boolean => {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    return urlLower.includes('s3.carro57.com.br') || 
           urlLower.includes('carro57') ||
           urlLower.includes('/fc/11466/');
  };

  // Determina a URL final da imagem
  const getImageSrc = (): string => {
    // Se não tem src ou é vazio, retorna empty para forçar erro e usar fallback
    if (!src || src.trim() === '') {
      return '/empreparacao.png';
    }

    const srcLower = src.toLowerCase();

    // Se é placeholder conhecido, retorna direto
    if (
      srcLower.includes('placeholder') ||
      srcLower.includes('no-image') ||
      srcLower.includes('sem-foto') ||
      srcLower === '/empreparacao.png'
    ) {
      return '/empreparacao.png';
    }

    // Se é URL externa válida (http:// ou https://), retorna como está
    if (srcLower.startsWith('http://') || srcLower.startsWith('https://')) {
      return src;
    }

    // Se é caminho local (começa com /), retorna como está
    if (src.startsWith('/')) {
      return src;
    }

    // Qualquer outra coisa, tenta usar como está
    return src;
  };

  const imageSrc = getImageSrc();
  const imageIsS3 = isS3Image(src);

  // LOG 1: Inicialização
  React.useEffect(() => {
    console.log('🖼️ [OptimizedImage] INICIALIZADO:', {
      srcOriginal: src,
      imageSrcCalculado: imageSrc,
      isS3: imageIsS3,
      timestamp: new Date().toISOString()
    });
  }, [src]);

  // Handler de carga bem-sucedida
  const handleLoad = () => {
    console.log('✅ [OptimizedImage] CARREGOU COM SUCESSO:', {
      src: src,
      imageSrc: imageSrc,
      isS3: imageIsS3,
      timestamp: new Date().toISOString()
    });
    setHasLoaded(true);
    onLoad?.();
  };

  // Handler de erro
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    console.error('❌ [OptimizedImage] ERRO AO CARREGAR:', {
      srcOriginal: src,
      imgSrcAtual: img.src,
      isS3: imageIsS3,
      willUseFallback: !imageIsS3,
      timestamp: new Date().toISOString()
    });

    // REGRA PRINCIPAL: Se é imagem do S3, NUNCA troca para fallback
    // Deixa o navegador tentar carregar naturalmente
    if (imageIsS3) {
      console.log('🔄 [OptimizedImage] É S3 - NÃO USA FALLBACK, mantendo URL');
      // Não faz NADA, apenas retorna
      return;
    }

    // Para URLs que NÃO são do S3, usa fallback
    if (!img.src.includes('empreparacao.png')) {
      console.warn('⚠️ [OptimizedImage] NÃO É S3 - TROCANDO PARA FALLBACK');
      img.src = '/empreparacao.png';
    } else {
      console.log('ℹ️ [OptimizedImage] Já está usando fallback, não faz nada');
    }

    onError?.();
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('w-full h-full object-cover', className)}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default OptimizedImage;
