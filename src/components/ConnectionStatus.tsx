import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Wifi,
  WifiOff,
  Info
} from 'lucide-react';
import { getSyncInfo, forceSyncVehicles, clearVehicleCache, forceRefreshVehicles, forceLoadFromXml } from '@/lib/xml-service';

interface ConnectionStatusProps {
  xmlUrl?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ xmlUrl }) => {
  const [syncInfo, setSyncInfo] = useState(() => getSyncInfo());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForceSync = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Sincronizando dados...');
    
    try {
      const vehicles = await forceSyncVehicles();
      setSyncStatus('success');
      setSyncMessage(`Sincronização concluída! ${vehicles.length} veículos atualizados.`);
      setSyncInfo(getSyncInfo());
      
      // Limpa mensagem após 5 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 5000);
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Limpa mensagem após 10 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 10000);
    }
  };

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar o cache? Isso forçará uma nova sincronização na próxima visualização.')) {
      clearVehicleCache();
      setSyncInfo(null);
      setSyncStatus('idle');
      setSyncMessage('');
    }
  };

  const handleForceRefresh = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Forçando refresh completo...');
    
    try {
      const vehicles = await forceRefreshVehicles();
      setSyncStatus('success');
      setSyncMessage(`Refresh concluído! ${vehicles.length} veículos carregados.`);
      setSyncInfo(getSyncInfo());
      
      // Limpa mensagem após 5 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 5000);
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`Erro no refresh: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Limpa mensagem após 10 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 10000);
    }
  };

  const handleForceLoadXml = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Carregando XML manualmente (ignorando proxies que falharam)...');
    
    try {
      const result = await forceLoadFromXml();
      
      if (result.success) {
        setSyncStatus('success');
        setSyncMessage(result.message);
        setSyncInfo(getSyncInfo());
      } else {
        setSyncStatus('error');
        setSyncMessage(result.message);
      }
      
      // Limpa mensagem após 10 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 10000);
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`Erro no carregamento manual: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Limpa mensagem após 10 segundos
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 10000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCacheAge = () => {
    if (!syncInfo) return null;
    
    const lastSync = new Date(syncInfo.lastSync);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Menos de 1 hora';
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-4">
      {/* Status da Conexão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span>Sistema Online</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Conectado
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span>Sistema Offline</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Desconectado
                </Badge>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground">
            {isOnline ? (
              'Conexão com a internet ativa. Sistema funcionando normalmente.'
            ) : (
              'Sem conexão com a internet. Usando dados em cache.'
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status do Cache */}
      {syncInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-blue-600" />
              Status do Cache Local
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Última Atualização</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {formatDate(syncInfo.lastSync)}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Idade do Cache</div>
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  {getCacheAge()}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Veículos em Cache</div>
                <div className="font-semibold">{syncInfo.totalVehicles} veículos</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Hash dos Dados</div>
                <div className="font-mono text-xs">{syncInfo.hash}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Controles de Sincronização</CardTitle>
          <CardDescription>
            Gerencie os dados dos veículos e o cache local
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleForceSync}
              disabled={syncStatus === 'syncing' || !isOnline}
              className="col-span-2"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Sincronizar Agora
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleForceRefresh}
              disabled={syncStatus === 'syncing'}
            >
              🔄 Refresh Completo
            </Button>

            <Button
              variant="outline"
              onClick={handleClearCache}
              disabled={syncStatus === 'syncing'}
            >
              🗑️ Limpar Cache
            </Button>
          </div>

          {/* Botão de Carregamento Manual Forçado */}
          <div className="pt-2 border-t">
            <Button
              onClick={handleForceLoadXml}
              disabled={syncStatus === 'syncing'}
              variant="secondary"
              className="w-full"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  🚨 Carregar XML Manualmente
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Use se a sincronização automática falhar no servidor
            </p>
          </div>

          {!isOnline && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                <WifiOff className="h-4 w-4" />
                <span>Sincronização desabilitada - sem conexão com a internet</span>
              </div>
            </div>
          )}

          {/* Status da última operação */}
          {syncStatus !== 'idle' && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              syncStatus === 'success' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' :
              syncStatus === 'error' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' :
              'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}>
              {syncStatus === 'success' && <CheckCircle className="h-4 w-4" />}
              {syncStatus === 'error' && <XCircle className="h-4 w-4" />}
              {syncStatus === 'syncing' && <RefreshCcw className="h-4 w-4 animate-spin" />}
              <span className="text-sm">{syncMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>O sistema usa proxy local (Vite) para evitar problemas de CORS</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>Dados são atualizados automaticamente a cada 24 horas</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>Em caso de erro, usa dados do cache anterior se disponível</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionStatus;