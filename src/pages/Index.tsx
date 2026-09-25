import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VehicleCard } from '@/components/VehicleCard';
import { VehicleFilters } from '@/components/VehicleFilters';
import { FaqSection } from '@/components/FaqSection';
import { Banner } from '@/components/Banner';
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton';
import Skeleton from '@/components/Skeleton';
import { useVehicles } from '@/hooks/use-vehicle-data';
import { useVehiclesCollectionSchema, useBreadcrumbSchema } from '@/hooks/use-schema';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useDynamicMeta } from '@/hooks/use-dynamic-meta';
import { Loader2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { shuffle } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSessionRandomOrder } from '@/hooks/use-session-order';
import { localAnalytics } from '@/lib/local-analytics';

const Index = () => {
  const { config } = useSiteConfig();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState('random');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Track page view
  useEffect(() => {
    localAnalytics.trackEvent('page_view', {
      page: '/',
      pageTitle: 'Home - Listagem de Veículos'
    });
  }, []);

  // Track filter usage
  useEffect(() => {
    if (selectedBrand) {
      localAnalytics.trackEvent('filter_used', {
        filterType: 'brand',
        filterValue: selectedBrand,
        page: '/'
      });
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (searchQuery) {
      localAnalytics.trackEvent('filter_used', {
        filterType: 'search',
        filterValue: searchQuery,
        page: '/'
      });
    }
  }, [searchQuery]);

  // Meta tags para página inicial
  useDynamicMeta({
    title: 'AUTOFLIX MULTIMARCAS - Veículos Seminovos em Curitiba | Garantia e Financiamento',
    description: '🚗 AUTOFLIX MULTIMARCAS em Curitiba - Veículos seminovos das melhores marcas com garantia, financiamento facilitado e procedência. 2 lojas para melhor atendê-lo. Confira!',
    image: '/logobranco.svg',
    url: window.location.href,
    type: 'website'
  });

  // Carregar veículos da API SQLite
  const { data: vehicleResponse, isLoading, error } = useVehicles({
    limit: 1000, // Carregar muitos para permitir filtros client-side
    page: 1,
  });
  
  // Extrair array de veículos da resposta
  const vehicles = vehicleResponse?.data || [];

  // Aplicar ordem aleatória consistente durante a sessão
  // Apenas quando sortBy === 'random'
  const sessionOrderedVehicles = useSessionRandomOrder(vehicles, sortBy === 'random');

  // Adicionar schema JSON-LD para SEO
  useVehiclesCollectionSchema(vehicles.length > 0 ? vehicles : undefined);
  
  // Adicionar breadcrumb schema
  useBreadcrumbSchema([
    { name: 'Home', url: window.location.origin },
    { name: 'Veículos', url: window.location.href }
  ]);

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId === selectedBrand ? '' : brandId);
  };

  const filteredAndSortedVehicles = useMemo(() => {
    // Usa a lista com ordem de sessão se sortBy === 'random'
    let filtered = sortBy === 'random' ? [...sessionOrderedVehicles] : [...vehicles];

    // Filtro por marca
    if (selectedBrand) {
      filtered = filtered.filter((vehicle) =>
        vehicle.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Filtro por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.brand.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query)
      );
    }

    // Ordenação (EXCETO random que já foi aplicado)
    switch (sortBy) {
      case 'random':
        // Já está embaralhado com ordem de sessão
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'year-desc':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        filtered.sort((a, b) => a.year - b.year);
        break;
      case 'mileage-asc':
        filtered.sort((a, b) => a.mileage - b.mileage);
        break;
      default:
        break;
    }

    return filtered;
  }, [vehicles, sessionOrderedVehicles, selectedBrand, sortBy, searchQuery]);

  // Reset page when filters/sort/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, sortBy, searchQuery, vehicles.length]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedVehicles.length / PAGE_SIZE));
  const displayedVehicles = useMemo(() => {
    const page = Math.min(Math.max(1, currentPage), totalPages);
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSortedVehicles.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedVehicles, currentPage, totalPages]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erro ao carregar veículos</h2>
            <p className="text-muted-foreground">Tente novamente mais tarde.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetPage={() => setCurrentPage(1)}
      />
      
      {/* Banner Carrossel */}
      <Banner />

      <main className="flex-1 pt-2 md:pt-0">
        {/* Vehicles Grid */}
        <section className="py-8 sm:py-12 md:py-16 bg-gray-50 relative">
          {/* Elementos decorativos de fundo */}
          <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
            <img 
              src="/xis.svg" 
              alt="" 
              className="absolute top-20 right-20 w-12 h-12 transform rotate-12 autoflix-float"
              aria-hidden="true"
            />
            <img 
              src="/xis.svg" 
              alt="" 
              className="absolute bottom-40 left-16 w-8 h-8 transform -rotate-45 autoflix-pulse"
              aria-hidden="true"
            />
            <img 
              src="/ponto.png" 
              alt="" 
              className="absolute top-1/2 right-1/3 w-4 h-4 autoflix-pulse"
              aria-hidden="true"
            />
            <img 
              src="/xis.svg" 
              alt="" 
              className="absolute top-1/3 left-1/4 w-6 h-6 transform rotate-45 opacity-3 autoflix-float"
              aria-hidden="true"
            />
          </div>
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 md:gap-8 auto-rows-max lg:auto-rows-auto">
              {/* Sidebar Filters - Sticky (Desktop Only) */}
              <div className="hidden lg:block lg:sticky lg:top-32 h-fit">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="font-bold text-2xl mb-8 text-gray-900 flex items-center gap-2">
                    <img src="/ponto.png" alt="" className="w-2 h-2" aria-hidden="true" />
                    Filtros
                  </h2>
                  <VehicleFilters
                    selectedBrand={selectedBrand}
                    onBrandSelect={handleBrandSelect}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>
              </div>

              {/* Vehicles Grid */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    {/* Mensagem de carregamento */}
                    <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100">
                      <div className="flex items-center justify-center mb-4">
                        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">Carregando veículos...</p>
                      <p className="text-sm text-gray-600">Aguarde enquanto buscamos nosso estoque</p>
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-8">
                      <Skeleton count={8} className="h-96 w-full rounded-2xl" />
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Erro ao carregar veículos</h3>
                    <p className="text-gray-600 mb-6">Ocorreu um erro ao buscar os veículos. Por favor, recarregue a página.</p>
                  </div>
                ) : (
                  <>
                    {/* Cabeçalho com Título e Ordenação - Responsivo */}
                    <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-6 md:mb-8">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 flex-1">
                        <img src="/ponto.png" alt="" className="w-2 h-2 flex-shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1">{selectedBrand || searchQuery ? 'Veículos Filtrados' : 'Veículos em Destaque'}</span>
                      </h2>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-24 sm:w-28 md:w-32 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-900 bg-white h-8 sm:h-9 flex-shrink-0 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 focus:bg-green-50">
                          <SelectValue placeholder="Aleatório" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-xl z-50">
                          <SelectItem value="random" className="text-gray-900">Aleatório</SelectItem>
                          <SelectItem value="price-asc" className="text-gray-900">Menor preço</SelectItem>
                          <SelectItem value="price-desc" className="text-gray-900">Maior preço</SelectItem>
                          <SelectItem value="year-desc" className="text-gray-900">Mais novo</SelectItem>
                          <SelectItem value="year-asc" className="text-gray-900">Mais antigo</SelectItem>
                          <SelectItem value="mileage-asc" className="text-gray-900">Menor KM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Contador de Veículos */}
                    <div className="mb-6 text-sm text-gray-600">
                      Exibindo <span className="font-semibold">{displayedVehicles.length}</span> de{' '}
                      <span className="font-semibold">{filteredAndSortedVehicles.length}</span> veículos
                      {totalPages > 1 && (
                        <span> (página {currentPage} de {totalPages})</span>
                      )}
                    </div>
                    {filteredAndSortedVehicles.length > 0 ? (
                      <>
                        {/* Grid de Veículos - Responsivo melhorado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-8 md:mb-12">
                          {displayedVehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                          ))}
                        </div>
                        
                        {/* Paginação */}
                        {totalPages > 1 && (
                          <div className="flex justify-center mt-8 md:mt-12">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={(p) => {
                                setCurrentPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-md border border-gray-100 mx-auto max-w-md sm:max-w-lg md:max-w-2xl">
                        <div className="max-w-md mx-auto">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Nenhum veículo encontrado
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {selectedBrand || searchQuery ? 
                              'Não foram encontrados veículos com os filtros aplicados. Tente ajustar os critérios de busca.' :
                              'Nosso estoque está sendo atualizado. Volte em breve!'
                            }
                          </p>
                          {(selectedBrand || searchQuery) && (
                            <Button 
                              onClick={() => {
                                setSelectedBrand('');
                                setSearchQuery('');
                                setSortBy('random');
                                setCurrentPage(1);
                              }}
                              variant="outline"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              Limpar Filtros
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FaqSection />
      </main>

      <Footer />
      
      {/* Botão Flutuante WhatsApp */}
      <FloatingWhatsAppButton />
    </div>
  );
};

export default Index;
