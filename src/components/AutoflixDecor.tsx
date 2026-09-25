interface AutoflixDecorProps {
  variant?: 'subtle' | 'visible' | 'accent';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  className?: string;
}

export const AutoflixDecor = ({ 
  variant = 'subtle', 
  position = 'top-right',
  className = '' 
}: AutoflixDecorProps) => {
  const getOpacity = () => {
    switch (variant) {
      case 'subtle': return 'opacity-5';
      case 'visible': return 'opacity-20';
      case 'accent': return 'opacity-30';
      default: return 'opacity-5';
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'top-left': return 'top-8 left-8';
      case 'top-right': return 'top-8 right-8';
      case 'bottom-left': return 'bottom-8 left-8';
      case 'bottom-right': return 'bottom-8 right-8';
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default: return 'top-8 right-8';
    }
  };

  return (
    <div className={`absolute ${getPosition()} pointer-events-none ${getOpacity()} ${className}`}>
      <div className="relative">
        <img 
          src="/xis.svg" 
          alt="" 
          className="w-6 h-6 transform rotate-12 animate-pulse duration-3000"
          aria-hidden="true"
        />
        <img 
          src="/ponto.png" 
          alt="" 
          className="absolute -bottom-2 -right-2 w-2 h-2"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

// Componente para pontos decorativos em linha
interface AutoflixDotProps {
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
  className?: string;
}

export const AutoflixDot = ({ 
  size = 'md', 
  opacity = 1,
  className = '' 
}: AutoflixDotProps) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-1 h-1';
      case 'md': return 'w-2 h-2';
      case 'lg': return 'w-3 h-3';
      default: return 'w-2 h-2';
    }
  };

  return (
    <img 
      src="/ponto.png" 
      alt="" 
      className={`${getSize()} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};

// Componente para separadores com ponto
interface AutoflixSeparatorProps {
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export const AutoflixSeparator = ({ 
  children, 
  showDot = true,
  className = '' 
}: AutoflixSeparatorProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showDot && <AutoflixDot />}
      {children}
    </div>
  );
};