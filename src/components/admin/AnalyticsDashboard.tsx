import { useState, useEffect } from 'react';
import { localAnalytics, AnalyticsStats } from '@/lib/local-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Eye, 
  MessageCircle, 
  CreditCard, 
  Phone, 
  TrendingUp,
  Calendar,
  Clock,
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [period, setPeriod] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = () => {
    setLoading(true);
    try {
      const data = localAnalytics.getStats(period);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const json = localAnalytics.exportEvents();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de analytics? Esta ação não pode ser desfeita.')) {
      localAnalytics.clearEvents();
      loadStats();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Carregando analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Nenhum dado disponível</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Insights e métricas de uso do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={365}>Último ano</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">páginas visitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos Vistos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicleViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">detalhes acessados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWhatsAppClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">cliques no botão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financiamento</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFinanceClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">simulações abertas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telefone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhoneClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">cliques para ligar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalhamento */}
      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="conversions">Conversões</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="recent">Eventos Recentes</TabsTrigger>
        </TabsList>

        {/* Tab: Veículos Mais Vistos */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Veículos Mais Visualizados</CardTitle>
              <CardDescription>
                Top 10 veículos com mais acessos aos detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.mostViewedVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma visualização registrada</p>
              ) : (
                <div className="space-y-3">
                  {stats.mostViewedVehicles.map((vehicle, index) => (
                    <div key={vehicle.vehicleId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.vehicleName}</p>
                          <p className="text-xs text-muted-foreground">ID: {vehicle.vehicleId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{vehicle.views}</p>
                        <p className="text-xs text-muted-foreground">visualizações</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Top Conversões */}
        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Veículos com Maior Taxa de Conversão</CardTitle>
              <CardDescription>
                Veículos que mais geram cliques em WhatsApp e Financiamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topConversionVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma conversão registrada</p>
              ) : (
                <div className="space-y-3">
                  {stats.topConversionVehicles.map((vehicle, index) => (
                    <div key={vehicle.vehicleId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.vehicleName}</p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.whatsappClicks} WhatsApp · {vehicle.financeClicks} Financiamento
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {vehicle.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">taxa conversão</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Cliques por Hora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Cliques por Hora do Dia
                </CardTitle>
                <CardDescription>Distribuição de cliques ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.clicksByHour)
                    .filter(([_, count]) => count > 0)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 10)
                    .map(([hour, count]) => (
                      <div key={hour} className="flex items-center gap-3">
                        <div className="w-12 text-sm text-muted-foreground">
                          {hour.padStart(2, '0')}:00
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-primary/20 rounded-sm relative overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-sm"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(stats.clicksByHour))) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-8 text-sm font-medium text-right">{count}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Cliques por Dia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Cliques nos Últimos 7 Dias
                </CardTitle>
                <CardDescription>Evolução diária de cliques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.clicksByDay).map(([day, count]) => (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-muted-foreground">
                        {new Date(day).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="h-6 bg-primary/20 rounded-sm relative overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-sm"
                            style={{ 
                              width: `${count > 0 ? (count / Math.max(...Object.values(stats.clicksByDay))) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-sm font-medium text-right">{count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Eventos Recentes */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimos 50 Eventos</CardTitle>
              <CardDescription>Atividade recente no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {stats.recentEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground"
                  >
                    <div className="mt-1">
                      {event.type === 'page_view' && <Eye className="w-4 h-4 text-blue-500" />}
                      {event.type === 'vehicle_view' && <BarChart3 className="w-4 h-4 text-purple-500" />}
                      {event.type === 'whatsapp_click' && <MessageCircle className="w-4 h-4 text-green-500" />}
                      {event.type === 'finance_click' && <CreditCard className="w-4 h-4 text-orange-500" />}
                      {event.type === 'phone_click' && <Phone className="w-4 h-4 text-cyan-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {event.type === 'page_view' && 'Visualização de Página'}
                        {event.type === 'vehicle_view' && 'Visualização de Veículo'}
                        {event.type === 'whatsapp_click' && 'Clique WhatsApp'}
                        {event.type === 'finance_click' && 'Clique Financiamento'}
                        {event.type === 'phone_click' && 'Clique Telefone'}
                      </p>
                      {event.data.vehicleName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {event.data.vehicleName}
                        </p>
                      )}
                      {event.data.page && (
                        <p className="text-xs text-muted-foreground truncate">
                          Página: {event.data.page}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
