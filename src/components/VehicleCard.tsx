import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/lib/types';
import OptimizedImage from '@/components/OptimizedImage';
import { usePulseAnimation } from '@/hooks/usePulseAnimation';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const PulseArrow = () => {
  const arrowRef = usePulseAnimation();
  return <ArrowRight ref={arrowRef as unknown as React.Ref<SVGSVGElement>} className="h-4 w-4 sm:h-5 sm:w-5" />;
};

export const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  };

  return (
    <Link to={`/veiculo/${vehicle.slug}`} className="group block h-full">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-green-200 h-full flex flex-col active:shadow-sm active:translate-y-0">
        {/* Badge de Destaque */}
        {vehicle.featured && (
          <Badge className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg text-xs sm:text-sm">
            ⭐ DESTAQUE
          </Badge>
        )}

        {/* Imagem com melhor proporção */}
        <div className="relative aspect-[4/3] lg:aspect-[16/11] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <OptimizedImage
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-active:scale-100"
            placeholder="/empreparacao.png"
            fallbackImage="/empreparacao.png"
          />
          
          {/* X discreto no canto superior direito */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
            <img 
              src="/xis.svg" 
              alt="" 
              className="w-3 h-3 sm:w-4 sm:h-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
              aria-hidden="true"
            />
          </div>
          
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Preço sobreposto - melhorado para mobile */}
          <div className="absolute bottom-2 right-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm md:text-base shadow-lg backdrop-blur-sm">
            {formatPrice(vehicle.price)}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-3 sm:p-5 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 bg-white flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-base sm:text-lg md:text-2xl mb-1 sm:mb-2 text-gray-900 group-hover:text-green-600 transition-colors duration-300 uppercase tracking-wide line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
              <div className="flex items-baseline gap-2 sm:gap-3 md:gap-4">
                <img 
                  src="/ponto.png" 
                  alt="" 
                  className="w-2 h-2 flex-shrink-0 inline-block align-baseline"
                  aria-hidden="true"
                />
                <span className="leading-tight">{vehicle.name.replace(/\d{4}/g, '').trim()}</span>
              </div>
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm font-medium bg-gray-50 inline-block px-2 sm:px-3 py-1 rounded-full">
              {vehicle.year} • {formatMileage(vehicle.mileage)} km
            </p>
          </div>

          {/* Especificações com ícones modernos */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2 sm:py-3">
            <div className="flex flex-col items-center gap-1 p-1.5 sm:p-2 bg-green-50 rounded-lg">
              <img src="/xis.svg" alt="" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <span className="text-xs font-medium text-gray-700">{vehicle.transmission}</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-1.5 sm:p-2 bg-green-50 rounded-lg">
              <img src="/xis.svg" alt="" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <span className="text-xs font-medium text-gray-700">{vehicle.fuel}</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-1.5 sm:p-2 bg-green-50 rounded-lg">
              <img src="/xis.svg" alt="" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <span className="text-xs font-medium text-gray-700">{formatMileage(vehicle.mileage)} km</span>
            </div>
          </div>

          {/* Link Ver Detalhes com estilo moderno */}
          <div className="flex items-center justify-center pt-2 sm:pt-3 md:pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-1 sm:gap-2 text-green-600 font-semibold group-hover:text-green-700 transition-colors duration-300 text-sm sm:text-base">
              <span>Ver detalhes</span>
              <PulseArrow />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
