import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Phone, MessageCircle, Share2, Copy, ExternalLink, Zap, Gauge, Fuel, Cog, Check, Star, MapPin as MapPinIcon, Share2 as ShareIcon, CreditCard, Briefcase, X } from 'lucide-react';
import { useVehicleById } from '@/hooks/use-vehicle-data';
import { useVehicleSchema } from '@/hooks/use-schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useDynamicMeta } from '@/hooks/use-dynamic-meta';
import { sanitizeImageUrl, sanitizeImageUrls } from '@/lib/image-service';
import { localAnalytics } from '@/lib/local-analytics';
import '../styles/finance-modal.css';

const WhatsAppIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
  </svg>
);

const VehicleDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [liked, setLiked] = useState(false);

  // Scroll para o topo quando o veículo muda
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  // Buscar veículo único pela slug da API
  const { data: vehicle, isLoading, error } = useVehicleById(slug);

  // Track vehicle view quando o veículo carregar (desktop + mobile)
  useEffect(() => {
    if (vehicle) {
      localAnalytics.trackEvent('vehicle_view', {
        vehicleId: vehicle.id.toString(),
        vehicleName: vehicle.name,
        vehicleSlug: slug,
        page: window.location.pathname,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
    }
  }, [vehicle, slug]);

  // Adicionar schema JSON-LD para SEO
  useVehicleSchema(vehicle || undefined);

  // Para buscar veículos similares, precisamos de todos os veículos
  // Vamos usar um fallback ou comentar essa funcionalidade por enquanto
  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    
    // TODO: Implementar busca de similares via API ou usar recomendações do backend
    // Por enquanto, retorna vazio
    return [];
  }, [vehicle]);

  // Helpers e dados para meta tags
  const images = vehicle?.images && vehicle.images.length > 0 
    ? sanitizeImageUrls(vehicle.images)
    : ['/empreparacao.png'];
  const mainImage = images[activeImageIndex] || images[0];
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Meta tags dinâmicas - sempre chamar hooks na mesma ordem
  useDynamicMeta({
    title: vehicle ? `${vehicle.name.toUpperCase()} - AUTOFLIX MULTIMARCAS` : 'Veículo - AUTOFLIX MULTIMARCAS',
    description: vehicle ? `${vehicle.name.toUpperCase()} ${vehicle.year} em excelente estado. Preço: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}. Veículos seminovos com garantia em Curitiba.` : 'Veículos seminovos com garantia',
    image: mainImage,
    url: currentUrl,
    type: 'product'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Tracking functions
  const trackWhatsAppClick = () => {
    if (vehicle) {
      localAnalytics.trackEvent('whatsapp_click', {
        vehicleId: vehicle.id.toString(),
        vehicleName: vehicle.name,
        vehicleSlug: slug,
        page: window.location.pathname
      });
    }
  };

  const trackFinanceClick = () => {
    if (vehicle) {
      localAnalytics.trackEvent('finance_click', {
        vehicleId: vehicle.id.toString(),
        vehicleName: vehicle.name,
        vehicleSlug: slug,
        page: window.location.pathname
      });
    }
  };

  const trackPhoneClick = () => {
    if (vehicle) {
      localAnalytics.trackEvent('phone_click', {
        vehicleId: vehicle.id.toString(),
        vehicleName: vehicle.name,
        vehicleSlug: slug,
        page: window.location.pathname
      });
    }
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando veículo...</p>
        </div>
      </div>
    );
  }

  // Erro 404 ou veículo não encontrado - mostrar imediatamente
  if (error || !vehicle) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-20 lg:pt-24 py-8 lg:py-16">
          {/* Decorative Elements */}
          <div className="fixed top-20 left-10 w-32 h-32 opacity-5 pointer-events-none hidden lg:block">
            <img src="/ponto.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="fixed bottom-20 right-10 w-40 h-40 opacity-5 pointer-events-none hidden lg:block">
            <img src="/xis.svg" alt="" className="w-full h-full object-contain" />
          </div>

          <div className="container mx-auto px-4 max-w-4xl">
            {/* Main Content */}
            <div className="text-center mb-12 lg:mb-16">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6 lg:mb-8">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
                Veículo Já Foi Vendido! 🎉
              </h1>
              
              {/* Description */}
              <p className="text-base lg:text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
                Infelizmente este veículo já encontrou um novo dono!
              </p>
              <p className="text-sm lg:text-lg text-gray-500 max-w-xl mx-auto">
                Mas não se preocupe, temos diversos outros modelos incríveis esperando por você em nosso estoque.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 lg:mb-16">
              <Button 
                onClick={() => navigate('/')} 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-base lg:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ver Nosso Estoque Completo
              </Button>
              
              <Button 
                onClick={() => {
                  const whatsappNumber = config.contact.phone.replace(/\D/g, '');
                  const message = encodeURIComponent(
                    `Olá! Vi que um veículo já foi vendido e gostaria de conhecer outros modelos disponíveis.`
                  );
                  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                }}
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-base lg:text-lg font-bold"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar com Consultor
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12 lg:mb-16">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-2">Veículos Revisados</h3>
                <p className="text-sm text-gray-600 text-center">Todos os nossos carros passam por inspeção completa</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-2">Financiamento Facilitado</h3>
                <p className="text-sm text-gray-600 text-center">Parcelas que cabem no seu bolso</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-2">Garantia Inclusa</h3>
                <p className="text-sm text-gray-600 text-center">Sua segurança é nossa prioridade</p>
              </div>
            </div>

            {/* Visit Us Section */}
            <div className="mt-12 lg:mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 lg:p-8 text-white text-center shadow-xl">
              <h2 className="text-xl lg:text-3xl font-bold mb-4">
                Visite Nossa Loja!
              </h2>
              <p className="text-base lg:text-lg mb-6 opacity-90">
                Temos 2 lojas em Curitiba. Venha nos visitar e conhecer nosso estoque completo de veículos seminovos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/contato')}
                  className="bg-white text-green-600 hover:bg-gray-100 font-bold px-6 py-3"
                >
                  Ver Endereços
                </Button>
                <Button
                  onClick={() => {
                    const whatsappNumber = config.contact.phone.replace(/\D/g, '');
                    const message = encodeURIComponent(
                      `Olá! Gostaria de agendar uma visita para conhecer os veículos disponíveis.`
                    );
                    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                  }}
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-bold px-6 py-3"
                >
                  Agendar Visita
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Schema.org JSON-LD para SEO
  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": vehicle.name,
    "description": vehicle.description || `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${vehicle.mileage.toLocaleString('pt-BR')} km`,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand
    },
    "model": vehicle.model,
    "vehicleModelDate": vehicle.year.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": vehicle.mileage,
      "unitCode": "KMT"
    },
    "fuelType": vehicle.fuel,
    "vehicleTransmission": vehicle.transmission,
    "color": vehicle.color,
    "numberOfDoors": vehicle.doors,
    "image": images,
    "offers": {
      "@type": "Offer",
      "price": vehicle.price,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutoDealer",
        "name": "AUTOFLIX MULTIMARCAS"
      },
      "url": currentUrl
    },
    "url": currentUrl
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": vehicle.brand,
        "item": `${window.location.origin}/?brand=${vehicle.brand}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": vehicle.name,
        "item": currentUrl
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(vehicleSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Elementos decorativos de fundo - Desktop only */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
        <img 
          src="/xis.svg" 
          alt="" 
          className="absolute top-40 right-32 w-20 h-20 transform rotate-12 animate-pulse"
          aria-hidden="true"
        />
        <img 
          src="/ponto.png" 
          alt="" 
          className="absolute top-1/4 left-16 w-5 h-5"
          aria-hidden="true"
        />
        <img 
          src="/xis.svg" 
          alt="" 
          className="absolute bottom-1/3 left-1/4 w-16 h-16 transform rotate-45 opacity-40"
          aria-hidden="true"
        />
        <img 
          src="/ponto.png" 
          alt="" 
          className="absolute top-2/3 right-1/4 w-4 h-4"
          aria-hidden="true"
        />
      </div>
      
      <Header />
      
      <main className="flex-1 w-full pt-20 lg:pt-24 relative z-10">
        {/* Desktop: Wrapper com max-width e padding */}
        <div className="lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
          
          {/* Desktop: Layout em Grid 2 colunas */}
          <div className="lg:grid lg:grid-cols-[60%_40%] lg:gap-8">
            
            {/* COLUNA ESQUERDA - Galeria e Descrição */}
            <div className="lg:space-y-6 lg:relative">
              
        {/* ===== 1. TÍTULO EM CAPS ===== */}
        <div className="px-4 py-2 bg-white mt-0 lg:rounded-2xl lg:shadow-xl lg:px-8 lg:py-6 lg:border-2 lg:border-gray-100 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img src="/ponto.png" alt="" className="w-3 h-3 hidden lg:block flex-shrink-0" aria-hidden="true" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 uppercase">
              {vehicle.name.toUpperCase()}
            </h1>
          </div>
        </div>

        {/* ===== 2. PREÇO + SUPER OFERTA ===== */}
        <div className="px-4 py-4 bg-white flex items-center justify-between lg:rounded-2xl lg:shadow-xl lg:px-8 lg:py-6 lg:border-2 lg:border-green-100 lg:bg-gradient-to-r lg:from-white lg:to-green-50 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img src="/ponto.png" alt="" className="w-3 h-3 hidden lg:block flex-shrink-0" aria-hidden="true" />
            <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-green-600">
              {formatPrice(vehicle.price)}
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-4 py-2 text-sm lg:text-base font-bold uppercase shadow-lg">
            SUPER OFERTA
          </Badge>
        </div>

        {/* ===== 3. GALERIA DE FOTOS ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:border-0 lg:rounded-2xl lg:shadow-xl lg:p-8 lg:border-2 lg:border-gray-100 relative">
          {/* Imagem Principal */}
          <div className="relative bg-gray-200 rounded-xl overflow-hidden aspect-[4/3] mb-4 cursor-pointer group lg:rounded-2xl lg:shadow-lg"
            onClick={() => setShowLightbox(true)}>
            {images[activeImageIndex] && (
              <img
                src={images[activeImageIndex]}
                alt={`${vehicle.name} - Imagem ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e: any) => {
                  // Fallback para empreparacao.png se falhar
                  if (e.target.src !== '/empreparacao.png') {
                    e.target.src = '/empreparacao.png';
                  }
                }}
              />
            )}
            
            {/* Botões de Navegação */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-all"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-all"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Contador de Imagens */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold uppercase">
              {activeImageIndex + 1} DE {images.length}
            </div>
          </div>

          {/* Miniaturas - Scroll Horizontal com Auto-Scroll */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth" ref={(el) => {
              if (el) {
                const activeThumb = el.querySelector(`button:nth-child(${activeImageIndex + 1})`);
                if (activeThumb) {
                  activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
              }
            }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImageIndex ? 'border-green-600 shadow-md scale-110' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`MINIATURA ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    onError={(e: any) => {
                      // Fallback para empreparacao.png se falhar
                      if (e.target.src !== '/empreparacao.png') {
                        e.target.src = '/empreparacao.png';
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== 4. DESCRIÇÃO BONITA ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:border-0 lg:rounded-2xl lg:shadow-xl lg:p-8 lg:border-2 lg:border-gray-100 relative">
          <div className="hidden lg:flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-100">
            <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <h2 className="text-xl font-bold text-gray-900 uppercase">Sobre o Veículo</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-base lg:text-lg lg:leading-relaxed">
            {vehicle.name.toUpperCase()} em excelente estado. Veículo completo, revisado e com garantia. Entre em contato para mais informações e agende um test drive!
          </p>
        </div>
            
            </div>{/* Fim COLUNA ESQUERDA */}
            
            {/* COLUNA DIREITA - Informações e CTAs (Desktop only) */}
            <div className="hidden lg:block lg:space-y-6 lg:sticky lg:top-24 lg:self-start">
              
              {/* Card de Informações Principais */}
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 relative overflow-hidden border border-gray-100">
                
                <div className="flex items-center gap-3 border-b pb-4">
                  <img src="/ponto.png" alt="" className="w-3 h-3" aria-hidden="true" />
                  <h2 className="text-2xl font-bold text-gray-900 uppercase">Informações</h2>
                </div>
                
                {/* MARCA, MODELO, ANO, KM */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs text-gray-600 font-bold uppercase">MARCA</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 uppercase pl-5">{vehicle.brand || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs text-gray-600 font-bold uppercase">MODELO</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 uppercase pl-5">{vehicle.model || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs text-gray-600 font-bold uppercase">ANO</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 uppercase pl-5">{vehicle.year}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs text-gray-600 font-bold uppercase">KM</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 uppercase pl-5">{vehicle.mileage?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Características */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-bold text-gray-700 uppercase">Câmbio</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 uppercase">{vehicle.transmission || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-bold text-gray-700 uppercase">Combustível</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 uppercase">{vehicle.fuel || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-bold text-gray-700 uppercase">Cor</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 uppercase">{vehicle.color || 'N/A'}</span>
                  </div>
                </div>
                
                {/* CTAs Desktop */}
                <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                  <a
                    href={`https://wa.me/${config.contact.phone.replace(/\D/g, '')}?text=Olá,%20tenho%20interesse%20no%20${encodeURIComponent(vehicle.name.toUpperCase())}%20anunciado%20por%20R$%20${vehicle.price.toLocaleString('pt-BR')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackWhatsAppClick}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all uppercase text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <WhatsAppIcon />
                    <span>WHATSAPP</span>
                  </a>
                  
                  <a
                    href={`https://wa.me/${config.contact.whatsapp}?text=Olá!%20Gostaria%20de%20simular%20um%20financiamento%20para%20o%20veículo%20*${encodeURIComponent(vehicle.name)}*%20no%20valor%20de%20*${formatPrice(vehicle.price)}*`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackFinanceClick}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-black py-5 px-6 rounded-2xl transition-all uppercase text-lg shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 border-2 border-amber-400 animate-pulse hover:animate-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <CreditCard className="h-6 w-6 relative z-10" />
                    <span className="relative z-10">💰 SIMULAR FINANCIAMENTO</span>
                  </a>
                </div>
                
                {/* Garantias */}
                <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-bold text-sm text-green-800 uppercase">Garantia de 3 meses</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-bold text-sm text-green-800 uppercase">Procedência verificada</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-bold text-sm text-green-800 uppercase">Veículo revisado</span>
                  </div>
                </div>
                
                {/* Compartilhar - Desktop only */}
                <div className="space-y-3 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <img src="/ponto.png" alt="" className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-gray-900 uppercase">Compartilhar</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${vehicle.name.toUpperCase()} - ${formatPrice(vehicle.price)} - ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <WhatsAppIcon />
                      <span className="text-xs font-semibold text-gray-900 uppercase">WHATSAPP</span>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copiado!');
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <Copy className="h-6 w-6 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-900 uppercase">COPIAR LINK</span>
                    </button>
                  </div>
                </div>
              </div>
              
            </div>{/* Fim COLUNA DIREITA */}

        {/* ===== 5. MARCA, MODELO, ANO, KM (Mobile only) ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:hidden">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <img src="/ponto.png" alt="ponto" className="w-3 h-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">MARCA</p>
                <p className="text-sm font-bold text-gray-900 uppercase">{vehicle.brand || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <img src="/ponto.png" alt="ponto" className="w-3 h-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">MODELO</p>
                <p className="text-sm font-bold text-gray-900 uppercase">{vehicle.model || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <img src="/ponto.png" alt="ponto" className="w-3 h-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">ANO</p>
                <p className="text-sm font-bold text-gray-900 uppercase">{vehicle.year}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <img src="/ponto.png" alt="ponto" className="w-3 h-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">KM</p>
                <p className="text-sm font-bold text-gray-900 uppercase">{vehicle.mileage?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 6. CARACTERÍSTICAS EM QUADRADINHOS (2 POR LINHA) - Mobile only ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase">CARACTERÍSTICAS</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <img src="/ponto.png" alt="ponto" className="w-5 h-5" />
                <p className="text-xs text-gray-600 font-semibold uppercase">CÂMBIO</p>
              </div>
              <p className="text-sm font-bold text-gray-900 uppercase ml-7">{vehicle.transmission || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <img src="/ponto.png" alt="ponto" className="w-5 h-5" />
                <p className="text-xs text-gray-600 font-semibold uppercase">COMBUSTÍVEL</p>
              </div>
              <p className="text-sm font-bold text-gray-900 uppercase ml-7">{vehicle.fuel || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <img src="/ponto.png" alt="ponto" className="w-5 h-5" />
                <p className="text-xs text-gray-600 font-semibold uppercase">COR</p>
              </div>
              <p className="text-sm font-bold text-gray-900 uppercase ml-7">{vehicle.color || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <img src="/ponto.png" alt="ponto" className="w-5 h-5" />
                <p className="text-xs text-gray-600 font-semibold uppercase">PORTAS</p>
              </div>
              <p className="text-sm font-bold text-gray-900 uppercase ml-7">4</p>
            </div>
          </div>
        </div>

        {/* ===== 6.5. SIMULAR FINANCIAMENTO - Mobile only ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <CreditCard className="h-5 w-5 text-green-600" />
            SIMULAR FINANCIAMENTO
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-900 font-semibold uppercase">
              PARCELADO EM ATÉ 60X<br/>
              ENTRADA FACILITADA<br/>
              MELHORES TAXAS DO MERCADO
            </p>
          </div>
          <a
            href={`https://wa.me/${config.contact.whatsapp}?text=Olá!%20Gostaria%20de%20simular%20um%20financiamento%20para%20o%20veículo%20*${encodeURIComponent(vehicle.name)}*%20no%20valor%20de%20*${formatPrice(vehicle.price)}*`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-black py-4 px-6 rounded-xl transition-all uppercase text-base shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 border-2 border-amber-400 animate-pulse hover:animate-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <CreditCard className="h-5 w-5 relative z-10" />
            <span className="relative z-10">💰 SIMULAR AGORA</span>
          </a>
        </div>

        {/* ===== 7. INFORMAÇÕES ADICIONAIS - Mobile only ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase">INFORMAÇÕES ADICIONAIS</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm uppercase">DOCUMENTAÇÃO</p>
                <p className="text-xs text-gray-600">Documentação 100% em dia, pronto para transferência.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Cog className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm uppercase">MANUTENÇÃO</p>
                <p className="text-xs text-gray-600">Veículo com todas as revisões em dia.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm uppercase">ENTREGA</p>
                <p className="text-xs text-gray-600">Possibilidade de entrega em domicílio.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 8. GARANTIA E PROCEDÊNCIA - Mobile only ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <Check className="h-5 w-5 text-green-600" />
            GARANTIA E PROCEDÊNCIA
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm uppercase">GARANTIA DE 3 MESES</p>
                <p className="text-xs text-green-700">Cobertura completa em caso de defeitos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm uppercase">PROCEDÊNCIA VERIFICADA</p>
                <p className="text-xs text-green-700">Veículo com procedência garantida.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm uppercase">REVISADO</p>
                <p className="text-xs text-green-700">Todos os veículos passam por revisão completa.</p>
              </div>
            </div>
          </div>
        </div>

          </div>{/* Fim Grid 2 colunas */}
        </div>{/* Fim wrapper desktop */}

        {/* ===== 9. MAPA (100% WIDTH - FORA DO GRID) ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:border-0 lg:rounded-2xl lg:shadow-xl lg:px-10 lg:py-10 lg:border-2 lg:border-gray-100 lg:max-w-7xl lg:mx-auto lg:mt-8 relative">
          <div className="flex items-center gap-3 mb-4 lg:mb-6 pb-4 lg:pb-6 border-b-2 border-gray-100">
            <img src="/ponto.png" alt="" className="w-3 h-3 hidden lg:block flex-shrink-0" aria-hidden="true" />
            <MapPinIcon className="h-5 w-5 text-green-600 lg:h-7 lg:w-7" />
            <h2 className="text-lg font-bold text-gray-900 uppercase lg:text-3xl">
              NOSSAS LOJAS
            </h2>
          </div>
          
          {/* Grid com 2 mapas no desktop, 1 coluna no mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
            {/* Loja 1 */}
            <div>
              <h3 className="text-base lg:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <img src="/ponto.png" alt="" className="w-2 h-2 lg:w-3 lg:h-3" aria-hidden="true" />
                LOJA 1 - AUTOFLIX MULTIMARCAS
              </h3>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden lg:rounded-xl lg:shadow-md mb-3">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3600.0096798395625!2d-49.28441942301325!3d-25.538054477493016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfb420f9a9ae1%3A0x5f86fd536f55637e!2sAutoflix%20Multimarcas%20Ve%C3%ADculos%20Seminovos!5e0!3m2!1spt-BR!2sbr!4v1761777686574!5m2!1spt-BR!2sbr"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da Loja 1"
                />
              </div>
              <a
                href="https://maps.app.goo.gl/CTzzr2ozXy6xX33R9"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg uppercase font-bold text-sm lg:text-base lg:shadow-md hover:shadow-lg transform hover:scale-105 transition-all text-center"
              >
                <MapPinIcon className="h-4 w-4 mr-2 inline-block" />
                COMO CHEGAR LOJA 1
              </a>
            </div>

            {/* Loja 2 */}
            <div>
              <h3 className="text-base lg:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <img src="/ponto.png" alt="" className="w-2 h-2 lg:w-3 lg:h-3" aria-hidden="true" />
                LOJA 2 - AUTOFLIX MULTIMARCAS
              </h3>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden lg:rounded-xl lg:shadow-md mb-3">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3599.9180128938156!2d-49.26381262301321!3d-25.541107777491202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfb29433cd83b%3A0xef4353bb78dc3b!2sLoja%202%20Autoflix%20Multimarcas%20Seminovos%20Ve%C3%ADculos!5e0!3m2!1spt-BR!2sbr!4v1761777720909!5m2!1spt-BR!2sbr"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da Loja 2"
                />
              </div>
              <a
                href="https://maps.app.goo.gl/zQ4bLpPR2WnJaHFJ6"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg uppercase font-bold text-sm lg:text-base lg:shadow-md hover:shadow-lg transform hover:scale-105 transition-all text-center"
              >
                <MapPinIcon className="h-4 w-4 mr-2 inline-block" />
                COMO CHEGAR LOJA 2
              </a>
            </div>
          </div>
        </div>

        {/* ===== 10. COMPARTILHAR - Mobile only ===== */}
        <div className="px-4 py-6 bg-white border-t border-gray-200 lg:hidden">
          <div className="flex items-center gap-3 mb-4">
            <ShareIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900 uppercase">
              COMPARTILHAR
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${vehicle.name.toUpperCase()} - ${formatPrice(vehicle.price)} - ${window.location.href}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <WhatsAppIcon />
              <span className="text-xs font-semibold text-gray-900 uppercase">WHATSAPP</span>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copiado!');
              }}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Copy className="h-6 w-6 text-gray-600" />
              <span className="text-xs font-semibold text-gray-900 uppercase">COPIAR LINK</span>
            </button>
          </div>
        </div>

        {/* ===== 12. BOTÕES CTA FLUTUANTES - Mobile only ===== */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-200 flex gap-3 z-50 lg:hidden">
          <AnimatedButton
            href={`tel:${config.contact.phone.replace(/\D/g, '')}`}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg uppercase"
          >
            <Phone className="h-5 w-5" />
            <span>LIGAR</span>
          </AnimatedButton>
          <a
            href={`https://wa.me/${config.contact.phone.replace(/\D/g, '')}?text=Olá,%20tenho%20interesse%20no%20${encodeURIComponent(vehicle.name.toUpperCase())}%20anunciado%20por%20R$%20${vehicle.price.toLocaleString('pt-BR')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all uppercase"
          >
            <WhatsAppIcon />
            <span>TENHO INTERESSE</span>
          </a>
        </div>

        {/* ===== 13. VEÍCULOS SIMILARES - 100% WIDTH COM CARDS MAIORES ===== */}
        {similarVehicles.length > 0 && (
          <div className="px-4 py-6 bg-white border-t border-gray-200 lg:border-0 lg:rounded-2xl lg:shadow-xl lg:px-10 lg:py-10 lg:border-2 lg:border-gray-100 lg:max-w-7xl lg:mx-auto lg:mt-8 relative">
            <div className="flex items-center gap-3 mb-4 lg:mb-8 pb-4 lg:pb-6 border-b-2 border-gray-100">
              <img src="/ponto.png" alt="" className="w-3 h-3 hidden lg:block flex-shrink-0" aria-hidden="true" />
              <h3 className="text-lg font-bold text-gray-900 uppercase lg:text-3xl">VEÍCULOS SIMILARES</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
              {similarVehicles.slice(0, 4).map((sim) => (
                <a
                  key={sim.id}
                  href={`/veiculo/${sim.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative">
                    {sim.images && sim.images[0] ? (
                      <img
                        src={sim.images[0]}
                        alt={sim.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500">Sem imagem</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                      <p className="text-white font-bold text-sm uppercase line-clamp-2">{sim.name}</p>
                      <p className="text-white/90 text-xs uppercase">{sim.year}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50">
                    <p className="text-green-600 font-bold text-sm mb-2 uppercase">{formatPrice(sim.price)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            ✕
          </button>

          <div className="relative max-w-5xl w-full">
            <img
              src={images[activeImageIndex]}
              alt={`${vehicle.name} - Imagem Ampliada`}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {activeImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {/* ===== SEO KEYWORDS SECTION ===== */}
      <div className="px-4 py-8 bg-gray-50 text-gray-700 text-sm leading-relaxed lg:bg-white lg:py-12">
        <div className="lg:max-w-7xl lg:mx-auto lg:px-8">
          <div className="lg:bg-gradient-to-br lg:from-gray-50 lg:to-gray-100 lg:rounded-2xl lg:shadow-xl lg:p-10 lg:border-2 lg:border-gray-200">
            <div className="flex items-center gap-3 mb-6 lg:mb-8 lg:pb-6 lg:border-b-2 lg:border-gray-300">
              <img src="/ponto.png" alt="" className="w-3 h-3 hidden lg:block flex-shrink-0" aria-hidden="true" />
              <h3 className="font-bold text-gray-900 uppercase text-base lg:text-3xl">SOBRE ESTE VEÍCULO</h3>
            </div>
            
            <div className="lg:bg-white lg:rounded-xl lg:p-8 lg:shadow-md lg:mb-8">
              <p className="text-xs lg:text-base lg:leading-relaxed text-gray-700 lg:text-gray-800">
                <strong className="lg:text-lg lg:text-green-700">{vehicle.name.toUpperCase()}</strong> ano <strong>{vehicle.year}</strong> por apenas <strong className="lg:text-lg lg:text-green-600">{formatPrice(vehicle.price)}</strong>. 
                Compre <strong>{vehicle.brand.toLowerCase()} {vehicle.model.toLowerCase()}</strong> seminovo com segurança. 
                Veículo com <strong>{vehicle.mileage?.toLocaleString()} km</strong>, <strong>{vehicle.transmission || 'cambio'}</strong> e combustível <strong>{vehicle.fuel?.toLowerCase() || 'gasolina'}</strong>. 
                Carro à venda com <strong className="lg:text-green-700">garantia</strong>, <strong className="lg:text-green-700">documentação em dia</strong> e pronto para transferência. 
                Melhor preço de {vehicle.brand.toLowerCase()} na região.
              </p>
            </div>
            
            <div className="text-xs lg:text-sm text-gray-600 space-y-2 lg:bg-white lg:rounded-xl lg:p-8 lg:shadow-md">
              <p className="lg:mb-4 lg:text-base lg:font-semibold lg:text-gray-800 flex items-center gap-2">
                <img src="/ponto.png" alt="" className="w-2 h-2 hidden lg:block flex-shrink-0" aria-hidden="true" />
                <strong>Palavras-chave:</strong>
              </p>
              <div className="flex flex-wrap gap-2 lg:gap-3">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-green-200 transition-colors">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </span>
                <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-gray-300 transition-colors">
                  carro seminovo {vehicle.brand}
                </span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-green-200 transition-colors">
                  venda {vehicle.brand} {vehicle.year}
                </span>
                <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-gray-300 transition-colors">
                  {vehicle.transmission}
                </span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-green-200 transition-colors">
                  {vehicle.fuel}
                </span>
                <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-gray-300 transition-colors">
                  carros usados
                </span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-green-200 transition-colors">
                  auto seminovos
                </span>
                <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-gray-300 transition-colors">
                  melhor preço veículos
                </span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs lg:text-sm lg:px-4 lg:py-2 hover:bg-green-200 transition-colors">
                  financiamento de carros
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FINANCE MODAL ===== */}
      {showFinanceModal && <FinanceModalComponent vehicle={vehicle} onClose={() => setShowFinanceModal(false)} config={config} formatPrice={formatPrice} />}

      <Footer />
    </div>
  );
};

// Finance Modal Component
const FinanceModalComponent = ({ vehicle, onClose, config, formatPrice }: any) => {
  const [formData, setFormData] = useState({
    nome: '',
    celular: '',
    email: '',
    valorEntrada: '',
    parcelas: '48'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('finance-', '');
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.nome || !formData.celular || !formData.email || !formData.valorEntrada) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const entrada = parseFloat(formData.valorEntrada.replace(/\D/g, '')) / 100 || 0;
    const parcelas = parseInt(formData.parcelas);
    const valorParcelado = vehicle.price - entrada;
    const parcela = valorParcelado / parcelas;

    const mensagem = `*SIMULAÇÃO DE FINANCIAMENTO*%0A%0A*Veículo:* ${vehicle.name}%0A*Preço:* ${formatPrice(vehicle.price)}%0A*Entrada:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entrada)}%0A*Parcelas:* ${parcelas}x%0A*Valor da Parcela:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela)}%0A%0A*DADOS DO CLIENTE*%0A*Nome:* ${formData.nome}%0A*Celular:* ${formData.celular}%0A*Email:* ${formData.email}`;
    
    const phoneNumber = config.contact.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${mensagem}`, '_blank');
    onClose();
  };

  const entrada = formData.valorEntrada ? parseFloat(formData.valorEntrada.replace(/\D/g, '')) / 100 : 0;
  const parcelas = parseInt(formData.parcelas);
  const valorParcelado = vehicle.price - entrada;
  const parcelaValor = valorParcelado > 0 ? valorParcelado / parcelas : 0;

  return (
    <div className="finance-modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          id="closeFinanceModal" 
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333', padding: '20px 20px 0 20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Simulação de Financiamento
        </h2>

        <form id="financeForm" style={{ padding: '0 20px 20px 20px' }} onSubmit={handleSubmit}>
          <input type="hidden" id="finance-vehicle-price" value={vehicle.price} />
          <input type="hidden" id="finance-vehicle-name" value={vehicle.name} />
          <input type="hidden" id="finance-vehicle-url" value={window.location.href} />
          
          <div className="form-group">
            <label htmlFor="finance-nome">Nome Completo</label>
            <input 
              type="text" 
              id="finance-nome" 
              required 
              value={formData.nome}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="finance-celular">Celular</label>
            <input 
              type="text" 
              id="finance-celular" 
              required 
              value={formData.celular}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="finance-email">E-mail</label>
            <input 
              type="email" 
              id="finance-email" 
              required 
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="finance-valor-entrada">Valor de Entrada</label>
            <input 
              type="text" 
              id="finance-valor-entrada" 
              required 
              value={formData.valorEntrada}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({
                  ...prev,
                  valorEntrada: value
                }));
              }}
              placeholder="R$ 0,00"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="finance-parcelas">Parcelas</label>
            <select 
              id="finance-parcelas"
              value={formData.parcelas}
              onChange={handleChange}
            >
              <option value="12">12x</option>
              <option value="24">24x</option>
              <option value="36">36x</option>
              <option value="48" selected>48x</option>
              <option value="60">60x</option>
            </select>
          </div>

          {parcelaValor > 0 && (
            <div className="instalments-info">
              <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcelaValor)}</strong>
              <span>Por mês em {parcelas}x</span>
            </div>
          )}
          
          <button type="submit" id="submitFinanceForm" className="submit-button">
            Enviar para WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};

export default VehicleDetails;