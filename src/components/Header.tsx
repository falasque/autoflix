import { Link, useNavigate } from 'react-router-dom';
import { Menu, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaWhatsapp } from 'react-icons/fa';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { VehicleFilters } from '@/components/VehicleFilters';
import { useEffect, useState, useRef } from 'react';

interface HeaderProps {
  selectedBrand?: string;
  onBrandChange?: (brand: string) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onResetPage?: () => void; // Nova prop para resetar página
}

export const Header = ({ 
  selectedBrand = '', 
  onBrandChange, 
  sortBy = 'random', 
  onSortChange,
  searchQuery = '',
  onSearchChange,
  onResetPage
}: HeaderProps) => {
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const [localBrand, setLocalBrand] = useState(selectedBrand);
  const [localSort, setLocalSort] = useState(sortBy);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  
  // Função para ir ao início e resetar página
  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onResetPage) {
      onResetPage();
    }
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  useEffect(() => {
    // Ensure header stays fixed even if something tries to change it
    const header = document.querySelector('header');
    if (header) {
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.left = '0';
      header.style.right = '0';
      header.style.zIndex = '9999';
      header.style.width = '100%';
      header.style.margin = '0';
      header.style.padding = '0';
      
      // Watch for any changes to the header
      const observer = new MutationObserver(() => {
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.left = '0';
        header.style.right = '0';
      });
      
      observer.observe(header, { attributes: true, attributeFilter: ['style', 'class'] });
      
      return () => observer.disconnect();
    }
  }, []);
  
  const navItems = [
    { label: 'INÍCIO', href: '/' },
    { label: 'SIMULAR FINANCIAMENTO', action: 'finance' },
    { label: 'CONTATO', href: '/contato' },
  ];

  return (
    <header className="fixed !top-0 !left-0 !right-0 z-[9999] w-full bg-white shadow-md pointer-events-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, margin: 0, padding: 0, pointerEvents: 'auto' }}>
      <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo à esquerda - 20% menor e responsiva */}
          <div className="flex items-center">
            <a 
              href="/" 
              onClick={handleGoHome}
              className="flex items-center cursor-pointer" 
              aria-label={`${config.name} - Página inicial`}
            >
              {config.logo ? (
                <img 
                  src={config.logo} 
                  alt={`${config.name} - Revenda de carros`} 
                  className="h-6 sm:h-7 md:h-8 lg:h-9 xl:h-10 transition-all duration-200" 
                />
              ) : (
                <div 
                  className="bg-gradient-to-r bg-clip-text text-2xl sm:text-2xl md:text-3xl font-bold text-transparent transition-all duration-200"
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${config.colors.primary}, ${config.colors.secondary})`,
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {config.name}
                </div>
              )}
            </a>
          </div>

          {/* Navegação principal - centralizada */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
            {navItems.map((item: any, index) => (
              <div key={`nav-${index}-${item.label}`} className="flex items-center gap-6">
                {item.href ? (
                  item.href === '/' ? (
                    <a
                      href="/"
                      onClick={handleGoHome}
                      className="text-base font-extrabold text-gray-900 hover:text-green-700 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-base font-extrabold text-gray-900 hover:text-green-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
                ) : (
                  <button
                    onClick={() => item.action === 'finance' && setShowFinanceModal(true)}
                    className="text-base font-extrabold text-gray-900 hover:text-green-700 transition-colors"
                  >
                    {item.label}
                  </button>
                )}
                {index < navItems.length - 1 && (
                  <img 
                    src="/ponto.png" 
                    alt="" 
                    className="w-2 h-2 opacity-80"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </nav>

          {/* Botões à direita */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Botão de Endereço */}
            <a 
              href="https://maps.app.goo.gl/FPyAzpdhQUgVXhr39" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors" 
              aria-label="Ver localização no mapa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 md:h-5 w-4 md:w-5" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="hidden sm:inline">ENDEREÇO</span>
            </a>
            
            {/* Botão WhatsApp */}
            {config.contact.whatsapp && (
              <a 
                href={`https://wa.me/${config.contact.whatsapp}?text=Olá%2C+gostaria+de+mais+informações+sobre+os+veículos`}
                target="_blank" 
                rel="noopener" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors" 
                aria-label="Contato via WhatsApp"
              >
                <FaWhatsapp className="h-4 md:h-5 w-4 md:w-5" aria-hidden="true" />
                <span className="hidden sm:inline">WHATSAPP</span>
              </a>
            )}

            {/* Mobile menu button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden ml-4 p-2 rounded-md hover:bg-green-100 text-green-600 transition-colors" aria-label="Abrir menu de navegação">
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm bg-gradient-to-b from-gray-50 to-gray-100 border-0 shadow-2xl p-0 overflow-y-auto pt-20">
                
                {/* Filtros - Seção Principal (somente se as props de filtro forem fornecidas) */}
                {onBrandChange && onSortChange && onSearchChange && (
                  <div className="bg-white border-b-2 border-green-600 px-6 py-4">
                    <VehicleFilters
                      selectedBrand={localBrand}
                      onBrandSelect={(brand) => {
                        const newBrand = brand === localBrand ? '' : brand;
                        setLocalBrand(newBrand);
                        onBrandChange?.(newBrand);
                        // Fechar menu após selecionar marca
                        setIsMenuOpen(false);
                      }}
                      sortBy={localSort}
                      onSortChange={(sort) => {
                        setLocalSort(sort);
                        onSortChange?.(sort);
                      }}
                      searchQuery={localSearch}
                      onSearchChange={(query) => {
                        setLocalSearch(query);
                        onSearchChange?.(query);
                      }}
                    />
                  </div>
                )}
                
                {/* Navegação */}
                <div className="p-6 space-y-3 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                    <img src="/ponto.png" alt="" className="w-2 h-2" aria-hidden="true" />
                    Navegação
                  </h3>
                  <nav className="flex flex-col gap-2" aria-label="Navegação mobile">
                    {navItems.map((item, idx) => (
                      item.href === '/' ? (
                        <a
                          key={`${item.label}-${idx}`}
                          href="/"
                          onClick={(e) => {
                            e.preventDefault();
                            handleGoHome(e);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-white hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 cursor-pointer"
                        >
                          <img 
                            src="/xis.svg" 
                            alt="" 
                            className="w-4 h-4 opacity-40"
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </a>
                      ) : (
                        <Link
                          key={`${item.label}-${idx}`}
                          to={item.href || '#'}
                          onClick={() => {
                            if (item.action === 'finance') {
                              setShowFinanceModal(true);
                            }
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-white hover:text-green-600 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200"
                        >
                          <img 
                            src="/xis.svg" 
                            alt="" 
                            className="w-4 h-4 opacity-40"
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </Link>
                      )
                    ))}
                  </nav>
                </div>
                
                {/* Contato */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <img src="/ponto.png" alt="" className="w-2 h-2" aria-hidden="true" />
                    Contato Direto
                  </h3>
                  <div className="flex flex-col gap-2">
                    <a 
                      href={`tel:${config.contact.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-gray-900 font-bold"
                    >
                      <Phone className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">Telefone</p>
                        <p className="font-bold text-gray-900 text-sm truncate">{config.contact.phone}</p>
                      </div>
                    </a>
                    {config.contact.whatsapp && (
                      <a 
                        href={`https://wa.me/${config.contact.whatsapp}?text=Olá%2C+gostaria+de+mais+informações+sobre+os+veículos`}
                        target="_blank" 
                        rel="noopener" 
                        className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 hover:bg-green-100 transition-all duration-200 text-gray-900 font-bold"
                      >
                        <FaWhatsapp className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">WhatsApp</p>
                          <p className="font-bold text-gray-900 text-sm">Enviar Mensagem</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Rodapé */}
                <div className="p-4 text-center text-xs text-gray-600">
                  <p className="flex items-center justify-center gap-2">
                    <img src="/xis.svg" alt="" className="w-3 h-3 opacity-30" aria-hidden="true" />
                    {config.name}
                  </p>
                </div>
                
              </SheetContent>
            </Sheet>
          </div>
      </div>

      {/* Finance Modal Global */}
      {showFinanceModal && <GlobalFinanceModal onClose={() => setShowFinanceModal(false)} config={config} />}

      {/* Gradient Line */}
      <div 
        className="h-2 w-full bg-gradient-to-r"
        style={{
          backgroundImage: `linear-gradient(to right, #2d7f3f, #1e5a2f, #155a1f)`
        }}
        aria-hidden="true"
      ></div>
    </header>
  );
};

// Global Finance Modal Component
const GlobalFinanceModal = ({ onClose, config }: any) => {
  const [formData, setFormData] = useState({
    nome: '',
    valorFinanciamento: '',
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
    
    if (!formData.nome || !formData.valorFinanciamento) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const valorFinanc = parseFloat(formData.valorFinanciamento.replace(/\D/g, '')) / 100 || 0;
    const entrada = parseFloat(formData.valorEntrada.replace(/\D/g, '')) / 100 || 0;
    const parcelas = parseInt(formData.parcelas);
    
    let mensagem = `*SIMULAÇÃO DE FINANCIAMENTO*%0A%0A*Valor do Veículo:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFinanc)}%0A`;
    
    if (entrada > 0) {
      mensagem += `*Entrada:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entrada)}%0A`;
    }
    
    mensagem += `*Parcelas:* ${parcelas}x%0A%0A*DADOS DO CLIENTE*%0A*Nome:* ${formData.nome}%0A%0AQuero simular o financiamento de um veículo.`;
    
    const phoneNumber = config.contact.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${mensagem}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
          aria-label="Fechar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 p-6 pb-4">
          Simulação de Financiamento
        </h2>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label htmlFor="finance-nome" className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
              Nome Completo *
            </label>
            <input 
              type="text" 
              id="finance-nome" 
              required 
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              placeholder="Digite seu nome"
            />
          </div>
          
          <div>
            <label htmlFor="finance-valorFinanciamento" className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
              Valor do Veículo *
            </label>
            <input 
              type="text" 
              id="finance-valorFinanciamento" 
              required 
              value={formData.valorFinanciamento}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({
                  ...prev,
                  valorFinanciamento: value
                }));
              }}
              placeholder="R$ 0,00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
          
          <div>
            <label htmlFor="finance-valorEntrada" className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
              Valor de Entrada (Opcional)
            </label>
            <input 
              type="text" 
              id="finance-valorEntrada" 
              value={formData.valorEntrada}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({
                  ...prev,
                  valorEntrada: value
                }));
              }}
              placeholder="R$ 0,00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
          
          <div>
            <label htmlFor="finance-parcelas" className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
              Parcelas
            </label>
            <select 
              id="finance-parcelas"
              value={formData.parcelas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="12">12x</option>
              <option value="24">24x</option>
              <option value="36">36x</option>
              <option value="48">48x</option>
              <option value="60">60x</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors uppercase"
          >
            SIMULAR FINANCIAMENTO
          </button>
        </form>
      </div>
    </div>
  );
};
