import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { getVehicleStandardDescription } from '@/lib/utils';

interface VehicleHeroSectionProps {
  vehicleName: string;
  vehiclePrice: number;
  vehicleBrand: string;
  vehicleYear: number;
  vehicleModel: string;
}

export const VehicleHeroSection = ({
  vehicleName,
  vehiclePrice,
  vehicleBrand,
  vehicleYear,
  vehicleModel
}: VehicleHeroSectionProps) => {
  const { config } = useSiteConfig();
  
  const phoneNumber = config.contact.phone.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Olá,%20tenho%20interesse%20no%20${encodeURIComponent(vehicleName)}%20anunciado%20por%20R$%20${vehiclePrice.toLocaleString('pt-BR')}.%20Pode%20me%20dar%20mais%20informações?`;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-white to-gray-50 pt-4 md:pt-12 pb-4 md:pb-8 px-4 md:px-0 relative z-10">
      <div className="container mx-auto">
        {/* Título do veículo */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <img 
              src="/ponto.png" 
              alt="" 
              className="w-2 h-2 flex-shrink-0"
              aria-hidden="true"
            />
            {vehicleName}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            {vehicleYear} • {vehicleModel}
          </p>
        </div>

        {/* MOBILE: Preço + Botões Vertical (visível e compacto) */}
        <div className="lg:hidden mb-6">
          {/* Preço Mobile - Muito Destacado */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-4 mb-3 border-4 border-blue-400 w-full">
            <p className="text-white text-xs font-semibold mb-2 opacity-90">Valor do Veículo</p>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
              {formatPrice(vehiclePrice)}
            </p>
            <p className="text-blue-100 text-xs font-semibold">✓ Preço à vista</p>
          </div>

          {/* Botões Mobile - 2 colunas compactas */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <a 
              href={`tel:${phoneNumber}`}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-3 rounded-xl transition-all hover:shadow-xl active:scale-95 text-xs sm:text-sm shadow-lg"
            >
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span>Ligar</span>
            </a>
            
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-3 rounded-xl transition-all hover:shadow-xl active:scale-95 text-xs sm:text-sm shadow-lg"
            >
              <MessageCircle className="h-5 w-5 flex-shrink-0" />
              <span>Chat</span>
            </a>
          </div>

          {/* Info Rápida Mobile */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-xs">
            <p className="text-blue-900">
              <span className="font-bold">💳</span> Financiamento até 60x
            </p>
          </div>
        </div>

        {/* DESKTOP: Preço + Botões Lado a Lado */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Preço - Destaque Principal */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl p-8 md:p-10 flex flex-col justify-center border-4 border-blue-400">
            <p className="text-white text-sm md:text-base font-semibold mb-3 opacity-90">Valor do Veículo</p>
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              {formatPrice(vehiclePrice)}
            </p>
            <p className="text-blue-100 text-xs md:text-sm font-semibold">✓ Preço à vista</p>
          </div>

          {/* Botões Desktop - Em destaque */}
          <div className="flex flex-col gap-3 md:gap-4 justify-center">
            <a 
              href={`tel:${phoneNumber}`}
              className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 md:py-5 px-6 md:px-8 rounded-2xl transition-all hover:shadow-2xl active:scale-95 text-base md:text-lg shadow-lg"
            >
              <Phone className="h-6 w-6 md:h-7 md:w-7" />
              <span>Ligar Agora</span>
            </a>
            
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 md:py-5 px-6 md:px-8 rounded-2xl transition-all hover:shadow-2xl active:scale-95 text-base md:text-lg shadow-lg"
            >
              <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Descrição Padrão */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8 mb-4 md:mb-8">
          <p className="text-gray-700 leading-relaxed mb-4 text-xs sm:text-sm md:text-base">
            {getVehicleStandardDescription(vehicleBrand, vehicleModel)}
          </p>
          <div className="flex items-center gap-2">
            <img 
              src="/ponto.png" 
              alt="" 
              className="w-2 h-2"
              aria-hidden="true"
            />
            <span className="text-xs md:text-sm text-green-600 font-semibold">✓ Documentação em dia</span>
          </div>
        </div>

        {/* Informação de financiamento - Desktop apenas */}
        <div className="hidden lg:block bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 md:p-6">
          <p className="text-xs md:text-sm text-blue-900">
            <span className="font-bold block mb-2">💳 Financiamento disponível</span> 
            <span>Parcele em até 60x com as melhores taxas do mercado. Consulte condições.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
