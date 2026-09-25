import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { brands } from '@/lib/mock-data';

interface VehicleFiltersProps {
  selectedBrand: string;
  onBrandSelect: (brandId: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  minimal?: boolean;
}

export const VehicleFilters = ({
  selectedBrand,
  onBrandSelect,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  minimal = false,
}: VehicleFiltersProps) => {
  // Modo minimal - apenas busca
  if (minimal) {
    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por modelo, marca ou ano..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por modelo, marca ou ano..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
        />
      </div>

      {/* Filtros de Marca */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <img src="/ponto.png" alt="" className="w-2 h-2" aria-hidden="true" />
            Filtrar por marca
          </label>
          {selectedBrand && (
            <button
              onClick={() => onBrandSelect('')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar
            </button>
          )}
        </div>
        <form>
          <div className="grid grid-cols-4 gap-3">
            {brands.map((brand) => (
              <label key={brand.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="marca"
                  value={brand.id}
                  checked={selectedBrand === brand.id}
                  onChange={() => onBrandSelect(brand.id)}
                  className="sr-only"
                />
                <div className={`
                  w-16 h-16 flex items-center justify-center rounded-xl border-2 transition-all duration-300 hover:scale-105
                  ${
                    selectedBrand === brand.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white'
                  }
                `}>
                  <img
                    src={`/${brand.name.toLowerCase()}.png`}
                    alt={brand.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // Fallback para emoji se imagem não carregar
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-2xl">${brand.logo}</span>`;
                    }}
                  />
                </div>
              </label>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
