import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseVehicleService } from '@/lib/database-vehicle-service';

/**
 * Hooks personalizados para acessar dados de veículos via TanStack Query
 */

export function useVehicles(filters?: any) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => databaseVehicleService.getVehicles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!databaseVehicleService
  });
}

export function useVehicleById(identifier: string) {
  return useQuery({
    queryKey: ['vehicle', identifier],
    queryFn: () => databaseVehicleService.getVehicleById(identifier),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Não retry em 404 (veículo não existe)
      if (error?.message?.includes('404')) return false;
      // Retry até 2 vezes para outros erros
      return failureCount < 2;
    },
    retryDelay: 500, // Delay mínimo entre retries
    enabled: !!identifier
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filterOptions'],
    queryFn: () => databaseVehicleService.getFilterOptions(),
    staleTime: 1000 * 60 * 60 // 1 hour
  });
}

export function useVehicleStatistics() {
  return useQuery({
    queryKey: ['vehicleStats'],
    queryFn: () => databaseVehicleService.getStatistics(),
    staleTime: 30 * 60 * 1000 // 30 minutes
  });
}

export function useSyncInfo() {
  return useQuery({
    queryKey: ['syncInfo'],
    queryFn: () => databaseVehicleService.getSyncInfo(),
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

export function useManualSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => databaseVehicleService.triggerSync(),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['syncInfo'] });
      queryClient.invalidateQueries({ queryKey: ['filterOptions'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleStats'] });
    },
    onError: (error) => {
      console.error('❌ Sync failed:', error);
    }
  });
}

export function useSyncHistory(limit = 10) {
  return useQuery({
    queryKey: ['syncHistory', limit],
    queryFn: () => databaseVehicleService.getSyncHistory(limit),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}
