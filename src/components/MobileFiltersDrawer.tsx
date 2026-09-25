import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { VehicleFilters } from '@/components/VehicleFilters';
import { Menu, X } from 'lucide-react';

interface MobileFiltersDrawerProps {
  selectedBrand: string;
  onBrandSelect: (brandId: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const MobileFiltersDrawer = ({
  selectedBrand,
  onBrandSelect,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: MobileFiltersDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden md:hidden"
          aria-label="Abrir filtros"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <img src="/ponto.png" alt="" className="w-2 h-2" aria-hidden="true" />
            Filtros
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <VehicleFilters
            selectedBrand={selectedBrand}
            onBrandSelect={(brand) => {
              onBrandSelect(brand);
              setIsOpen(false);
            }}
            sortBy={sortBy}
            onSortChange={onSortChange}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
