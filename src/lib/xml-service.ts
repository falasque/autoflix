import { Vehicle } from './types';
import { apiVehicleService } from './api-vehicle-service';
import { localVehicleService } from './local-vehicle-service';

/**
 * Função principal para buscar veículos
 * Agora usa sistema de API com fallback para sistema local
 */
export const fetchVehiclesFromXml = async (): Promise<Vehicle[]> => {
  try {
    console.log('🔄 Buscando veículos via API...');
    
    // Primeiro tenta usar a API
    try {
      const vehicles = await apiVehicleService.getVehicles();
      
      if (vehicles.length > 0) {
        console.log(`✅ ${vehicles.length} veículos carregados via API`);
        console.log('🚗 Primeiros 3 veículos:', vehicles.slice(0, 3).map(v => ({
          id: v.id,
          name: v.name,
          brand: v.brand,
          price: v.price,
          image: v.image
        })));
        
        return vehicles;
      }
    } catch (apiError) {
      console.warn('⚠️ API falhou, tentando sistema local como fallback:', apiError);
    }
    
    // Fallback para sistema local se API falhar
    console.log('🔄 Usando sistema local como fallback...');
    const vehicles = await localVehicleService.getVehicles();
    
    console.log(`✅ ${vehicles.length} veículos carregados via fallback local`);
    return vehicles;

  } catch (error) {
    console.error('❌ Erro crítico ao buscar veículos:', error);
    throw error;
  }
};

/**
 * Força uma nova sincronização manual dos dados
 */
export const forceSyncVehicles = async (): Promise<Vehicle[]> => {
  try {
    console.log('🔄 Forçando sincronização manual...');
    
    // Primeiro tenta sincronizar via API
    try {
      const vehicles = await apiVehicleService.forceSync();
      console.log(`✅ Sincronização manual via API concluída: ${vehicles.length} veículos`);
      return vehicles;
    } catch (apiError) {
      console.warn('⚠️ Sincronização via API falhou, tentando sistema local:', apiError);
      
      // Fallback para sistema local
      const vehicles = await localVehicleService.forceSync();
      console.log(`✅ Sincronização manual via sistema local concluída: ${vehicles.length} veículos`);
      return vehicles;
    }
  } catch (error) {
    console.error('❌ Erro na sincronização manual:', error);
    throw error;
  }
};

/**
 * Carregamento manual forçado pelo admin (ignora cache, tenta todos os proxies)
 */
export const forceLoadFromXml = async (): Promise<{ success: boolean; message: string; vehicleCount: number }> => {
  try {
    console.log('🔧 Iniciando carregamento manual forçado...');
    
    // Primeiro tenta via API
    try {
      const vehicles = await apiVehicleService.forceSync();
      return {
        success: true,
        message: `✅ Carregamento via API bem-sucedido! ${vehicles.length} veículos sincronizados.`,
        vehicleCount: vehicles.length
      };
    } catch (apiError) {
      console.warn('⚠️ Carregamento via API falhou, tentando sistema local:', apiError);
      
      // Fallback para sistema local
      return await localVehicleService.forceLoadFromXml();
    }
  } catch (error) {
    console.error('❌ Erro no carregamento manual forçado:', error);
    return {
      success: false,
      message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      vehicleCount: 0
    };
  }
};

/**
 * Obtém informações sobre a última sincronização
 */
export const getSyncInfo = () => {
  // Primeiro tenta obter info da API, senão usa sistema local
  const apiInfo = apiVehicleService.getCacheInfo();
  if (apiInfo) {
    return apiInfo;
  }
  
  return localVehicleService.getCacheInfo();
};

/**
 * Limpa o cache de veículos
 */
export const clearVehicleCache = () => {
  // Limpa cache tanto da API quanto do sistema local
  apiVehicleService.clearCache();
  localVehicleService.clearCache();
};

/**
 * Força refresh completo (limpa cache e recarrega)
 */
export const forceRefreshVehicles = async (): Promise<Vehicle[]> => {
  try {
    console.log('🔄 Forçando refresh completo...');
    
    // Primeiro tenta via API
    try {
      const vehicles = await apiVehicleService.forceRefresh();
      console.log(`✅ Refresh completo via API concluído: ${vehicles.length} veículos`);
      return vehicles;
    } catch (apiError) {
      console.warn('⚠️ Refresh via API falhou, tentando sistema local:', apiError);
      
      // Fallback para sistema local
      const vehicles = await localVehicleService.forceRefresh();
      console.log(`✅ Refresh completo via sistema local concluído: ${vehicles.length} veículos`);
      return vehicles;
    }
  } catch (error) {
    console.error('❌ Erro no refresh completo:', error);
    throw error;
  }
};

/**
 * Testa a conexão com o XML configurado
 */
export const testXmlConnection = async (xmlUrl: string): Promise<{ success: boolean; message: string; vehicleCount?: number }> => {
  try {
    console.log('🧪 Testando conexão XML:', xmlUrl);
    
    // Usa o serviço local para testar a conexão
    const result = await localVehicleService.testXmlConnection(xmlUrl);
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    return {
      success: false,
      message: `Erro na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};

/**
 * Obtém estatísticas da API
 */
export const getApiStats = async () => {
  try {
    return await apiVehicleService.getApiStats();
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas da API:', error);
    throw error;
  }
};

/**
 * Obtém logs da API
 */
export const getApiLogs = async (limit: number = 20) => {
  try {
    return await apiVehicleService.getApiLogs(limit);
  } catch (error) {
    console.error('❌ Erro ao obter logs da API:', error);
    throw error;
  }
};

/**
 * Testa conexão com a API
 */
export const testApiConnection = async (): Promise<{ success: boolean; message: string; vehicleCount?: number }> => {
  try {
    return await apiVehicleService.testApiConnection();
  } catch (error) {
    return {
      success: false,
      message: `Erro no teste da API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};