import { Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
  </svg>
);

const WhatsAppIcon = () => (
  <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
  </svg>
);

export const Footer = () => {
  const { config } = useSiteConfig();
  
  const phoneNumber = config.contact.phone.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Olá%2C+gostaria+de+mais+informações+sobre+os+veículos`;
  
  const secondaryPhoneNumber = config.secondaryStore?.phone.replace(/\D/g, '') || '';
  const secondaryWhatsappLink = `https://wa.me/${secondaryPhoneNumber}?text=Olá%2C+gostaria+de+mais+informações+sobre+os+veículos`;
  
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 md:mt-16 relative">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Redes Sociais - Canto Superior Direito (Desktop) */}
        <div className="hidden md:block absolute top-6 right-6">
          <div className="flex gap-4">
            {config.socialMedia.instagram && (
              <a
                href={config.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            )}
          </div>
        </div>

        {/* Lojas - 2 colunas lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-12">
          {/* LOJA 1 */}
          <div className="flex flex-col">
            <div className="mb-6">
              <img src="/logobranco.svg" alt={config.name} className="h-6 md:h-8 mb-3" />
              <h3 className="text-2xl md:text-3xl font-bold text-white">LOJA 1</h3>
            </div>
            
            <div className="space-y-4">
              {/* Telefone */}
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Telefone</p>
                  <a 
                    href={`tel:${phoneNumber}`} 
                    className="text-xl md:text-2xl font-bold text-white hover:text-green-400 transition-colors"
                  >
                    {config.contact.phone}
                  </a>
                </div>
              </div>
              
              {/* WhatsApp */}
              <div className="flex items-center gap-3">
                <div className="text-green-500 h-6 w-6">
                  <WhatsAppIcon />
                </div>
                <div>
                  <p className="text-xs text-gray-400">WhatsApp</p>
                  <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg md:text-xl font-bold text-white hover:text-green-400 transition-colors"
                  >
                    {config.contact.phone}
                  </a>
                </div>
              </div>
              
              {/* Endereço */}
              <div className="flex gap-3 pt-2">
                <MapPin className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Endereço</p>
                  <p className="text-sm md:text-base text-white">{config.address.street}</p>
                  <p className="text-sm md:text-base text-white">{config.address.city} - {config.address.state}</p>
                  <p className="text-sm md:text-base text-white">{config.address.zipCode}</p>
                </div>
              </div>
              
              {/* Horário */}
              <div className="flex gap-3 pt-2">
                <Clock className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Horário</p>
                  <p className="text-sm md:text-base text-white">Seg-Sex: 9h às 18h</p>
                  <p className="text-sm md:text-base text-white">Sábado: 9h às 16h</p>
                </div>
              </div>
            </div>
          </div>

          {/* LOJA 2 */}
          {config.secondaryStore && (
            <div className="flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white">LOJA 2</h3>
              </div>
              
              <div className="space-y-4">
                {/* Telefone */}
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Telefone</p>
                    <a 
                      href={`tel:${secondaryPhoneNumber}`}
                      className="text-xl md:text-2xl font-bold text-white hover:text-green-400 transition-colors"
                    >
                      {config.secondaryStore.phone}
                    </a>
                  </div>
                </div>
                
                {/* WhatsApp */}
                <div className="flex items-center gap-3">
                  <div className="text-green-500 h-6 w-6">
                    <WhatsAppIcon />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">WhatsApp</p>
                    <a 
                      href={secondaryWhatsappLink}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-lg md:text-xl font-bold text-white hover:text-green-400 transition-colors"
                    >
                      {config.secondaryStore.phone}
                    </a>
                  </div>
                </div>
                
                {/* Endereço */}
                <div className="flex gap-3 pt-2">
                  <MapPin className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Endereço</p>
                    <p className="text-sm md:text-base text-white">{config.secondaryStore.address.street}</p>
                    <p className="text-sm md:text-base text-white">{config.secondaryStore.address.city} - {config.secondaryStore.address.state}</p>
                    <p className="text-sm md:text-base text-white">{config.secondaryStore.address.zipCode}</p>
                  </div>
                </div>
                
                {/* Horário */}
                <div className="flex gap-3 pt-2">
                  <Clock className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Horário</p>
                    <p className="text-sm md:text-base text-white">Seg-Sex: 9h às 18h</p>
                    <p className="text-sm md:text-base text-white">Sábado: 9h às 16h</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mapas - Um embaixo do outro em desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12 border-t border-gray-800 pt-12">
          {/* Mapa LOJA 1 */}
          <div className="hidden md:flex flex-col">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">MAPA - LOJA 1</h3>
            <div className="rounded-lg overflow-hidden h-[300px] border border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3600.0096798395625!2d-49.28441942301325!3d-25.538054477493016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfb420f9a9ae1%3A0x5f86fd536f55637e!2sAutoflix%20Multimarcas%20Ve%C3%ADculos%20Seminovos!5e0!3m2!1spt-BR!2sbr!4v1761777686574!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                title="Localização Loja 1"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>

          {/* Mapa LOJA 2 */}
          {config.secondaryStore && (
            <div className="hidden md:flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">MAPA - LOJA 2</h3>
              <div className="rounded-lg overflow-hidden h-[300px] border border-gray-700">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3599.9180128938156!2d-49.26381262301321!3d-25.541107777491202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dcfb29433cd83b%3A0xef4353bb78dc3b!2sLoja%202%20Autoflix%20Multimarcas%20Seminovos%20Ve%C3%ADculos!5e0!3m2!1spt-BR!2sbr!4v1761777720909!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  title="Localização Loja 2"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* Redes Sociais - Mobile */}
        <div className="md:hidden border-t border-gray-800 pt-6 text-center">
          <h3 className="text-lg font-bold text-white mb-3">REDES SOCIAIS</h3>
          <div className="flex gap-4 justify-center">
            {config.socialMedia.instagram && (
              <a
                href={config.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 text-xs md:text-sm text-center">
          <p>© {new Date().getFullYear()} {config.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
