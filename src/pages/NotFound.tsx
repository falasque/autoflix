import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, Phone, MessageCircle } from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { config } = useSiteConfig();

  const handleWhatsApp = () => {
    const whatsappNumber = config.contact.phone.replace(/\D/g, '');
    const message = encodeURIComponent('Olá! Estava navegando no site e preciso de ajuda.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 opacity-5 pointer-events-none hidden lg:block">
        <img src="/ponto.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="fixed bottom-20 right-10 w-40 h-40 opacity-5 pointer-events-none hidden lg:block">
        <img src="/xis.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="fixed top-1/2 right-1/4 w-24 h-24 opacity-5 pointer-events-none hidden lg:block">
        <img src="/ponto.png" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logobranco.svg" 
            alt="Autoflix" 
            className="h-16 md:h-20 w-auto filter brightness-0"
          />
        </div>

        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-black text-gray-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Search className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4 -mt-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Ops! Página Não Encontrada
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
            Parece que você tentou acessar uma página que não existe ou foi removida.
          </p>
        </div>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4 py-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300"></div>
          <img src="/ponto.png" alt="" className="w-3 h-3" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <img src="/ponto.png" alt="" className="w-3 h-3" />
            O que você pode fazer?
          </h3>
          <ul className="text-left space-y-3 text-gray-600 max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-xl leading-none">•</span>
              <span>Verificar se digitou o endereço corretamente</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-xl leading-none">•</span>
              <span>Voltar para a página inicial e explorar nosso catálogo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-xl leading-none">•</span>
              <span>Entrar em contato conosco via WhatsApp</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-8 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar para Início
          </Button>

          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-6 px-8 text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Falar no WhatsApp
          </Button>
        </div>

        {/* Contact Info */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Precisa de ajuda? Estamos aqui para você!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href={`tel:${config.contact.phone}`}
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              <Phone className="w-4 h-4" />
              {config.contact.phone}
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a
              href={`https://wa.me/${config.contact.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Footer Brand */}
        <div className="pt-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
            AUTOFLIX MULTIMARCAS
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Veículos Seminovos com Garantia
          </p>
        </div>
      </div>
    </div>
  );
}

