// EXEMPLO DE COMO ATUALIZAR COMPONENTES EXISTENTES
// Para usar o novo sistema de SQLite

import { useVehicles, useFilterOptions } from '@/hooks/use-vehicle-data';
import VehicleCard from '@/components/VehicleCard';
import VehicleFilters from '@/components/VehicleFilters';
import { useState } from 'react';

export default function Index() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    brand: undefined,
    year: undefined,
    fuel: undefined,
    priceMin: undefined,
    priceMax: undefined,
    search: undefined
  });

  // Hook para buscar veículos com TanStack Query
  const { data: vehiclesData, isLoading, error } = useVehicles(filters);
  
  // Hook para buscar opções de filtros
  const { data: filterOptions, isLoading: filtersLoading } = useFilterOptions();

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Erro ao carregar veículos
        </h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filtros */}
      {filterOptions && (
        <VehicleFilters 
          options={filterOptions}
          onFilterChange={setFilters}
          isLoading={filtersLoading}
        />
      )}

      {/* Lista de Veículos */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando veículos...</p>
            </div>
          </div>
        ) : vehiclesData?.data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum veículo encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div>
            {/* Grid de veículos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiclesData?.data.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Paginação */}
            {vehiclesData?.pagination && vehiclesData.pagination.pages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: vehiclesData.pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, page })}
                    className={`px-4 py-2 rounded ${
                      filters.page === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}

            {/* Info de resultados */}
            <div className="text-center mt-6 text-gray-600">
              Mostrando {vehiclesData?.data.length} de {vehiclesData?.pagination.total} veículos
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
