/**
 * Serviço de Analytics Local
 * Armazena eventos de interação do usuário no localStorage
 * para exibir insights no dashboard admin
 */

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'vehicle_view' | 'whatsapp_click' | 'finance_click' | 'phone_click' | 'filter_used';
  timestamp: number;
  data: {
    vehicleId?: string;
    vehicleName?: string;
    vehicleSlug?: string;
    page?: string;
    filterType?: string;
    filterValue?: string;
    [key: string]: any;
  };
}

export interface AnalyticsStats {
  totalPageViews: number;
  totalVehicleViews: number;
  totalWhatsAppClicks: number;
  totalFinanceClicks: number;
  totalPhoneClicks: number;
  mostViewedVehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    views: number;
  }>;
  topConversionVehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    whatsappClicks: number;
    financeClicks: number;
    conversionRate: number;
  }>;
  clicksByHour: Record<number, number>;
  clicksByDay: Record<string, number>;
  recentEvents: AnalyticsEvent[];
}

class LocalAnalyticsService {
  private STORAGE_KEY = 'autoflix-analytics-events';
  private MAX_EVENTS = 5000; // Limite de eventos armazenados

  /**
   * Registra um novo evento
   */
  trackEvent(type: AnalyticsEvent['type'], data: AnalyticsEvent['data'] = {}): void {
    try {
      const event: AnalyticsEvent = {
        id: this.generateId(),
        type,
        timestamp: Date.now(),
        data
      };

      const events = this.getEvents();
      events.push(event);

      // Limita o número de eventos
      if (events.length > this.MAX_EVENTS) {
        events.splice(0, events.length - this.MAX_EVENTS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.warn('Erro ao salvar evento de analytics:', error);
    }
  }

  /**
   * Busca todos os eventos
   */
  getEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Erro ao carregar eventos de analytics:', error);
      return [];
    }
  }

  /**
   * Busca eventos filtrados por período
   */
  getEventsByPeriod(days: number = 30): AnalyticsEvent[] {
    const events = this.getEvents();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return events.filter(e => e.timestamp >= cutoff);
  }

  /**
   * Calcula estatísticas consolidadas
   */
  getStats(days: number = 30): AnalyticsStats {
    const events = this.getEventsByPeriod(days);

    // Contadores gerais
    const totalPageViews = events.filter(e => e.type === 'page_view').length;
    const totalVehicleViews = events.filter(e => e.type === 'vehicle_view').length;
    const totalWhatsAppClicks = events.filter(e => e.type === 'whatsapp_click').length;
    const totalFinanceClicks = events.filter(e => e.type === 'finance_click').length;
    const totalPhoneClicks = events.filter(e => e.type === 'phone_click').length;

    // Veículos mais vistos
    const vehicleViews = new Map<string, { name: string; count: number }>();
    events
      .filter(e => e.type === 'vehicle_view' && e.data.vehicleId)
      .forEach(e => {
        const key = e.data.vehicleId!;
        const current = vehicleViews.get(key) || { name: e.data.vehicleName || 'Desconhecido', count: 0 };
        current.count++;
        vehicleViews.set(key, current);
      });

    const mostViewedVehicles = Array.from(vehicleViews.entries())
      .map(([vehicleId, data]) => ({
        vehicleId,
        vehicleName: data.name,
        views: data.count
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top conversão (WhatsApp + Finance por veículo)
    const vehicleConversions = new Map<string, { 
      name: string; 
      views: number;
      whatsappClicks: number; 
      financeClicks: number;
    }>();

    events.forEach(e => {
      if (!e.data.vehicleId) return;
      const key = e.data.vehicleId;
      const current = vehicleConversions.get(key) || { 
        name: e.data.vehicleName || 'Desconhecido',
        views: 0,
        whatsappClicks: 0, 
        financeClicks: 0 
      };

      if (e.type === 'vehicle_view') current.views++;
      if (e.type === 'whatsapp_click') current.whatsappClicks++;
      if (e.type === 'finance_click') current.financeClicks++;

      vehicleConversions.set(key, current);
    });

    const topConversionVehicles = Array.from(vehicleConversions.entries())
      .map(([vehicleId, data]) => ({
        vehicleId,
        vehicleName: data.name,
        whatsappClicks: data.whatsappClicks,
        financeClicks: data.financeClicks,
        conversionRate: data.views > 0 
          ? ((data.whatsappClicks + data.financeClicks) / data.views) * 100 
          : 0
      }))
      .filter(v => v.whatsappClicks + v.financeClicks > 0)
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);

    // Cliques por hora do dia (0-23)
    const clicksByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) clicksByHour[i] = 0;
    
    events
      .filter(e => e.type === 'whatsapp_click' || e.type === 'finance_click')
      .forEach(e => {
        const hour = new Date(e.timestamp).getHours();
        clicksByHour[hour]++;
      });

    // Cliques por dia (últimos 7 dias)
    const clicksByDay: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(day => clicksByDay[day] = 0);

    events
      .filter(e => e.type === 'whatsapp_click' || e.type === 'finance_click')
      .forEach(e => {
        const day = new Date(e.timestamp).toISOString().split('T')[0];
        if (clicksByDay[day] !== undefined) {
          clicksByDay[day]++;
        }
      });

    // Eventos recentes
    const recentEvents = events
      .slice(-50)
      .reverse();

    return {
      totalPageViews,
      totalVehicleViews,
      totalWhatsAppClicks,
      totalFinanceClicks,
      totalPhoneClicks,
      mostViewedVehicles,
      topConversionVehicles,
      clicksByHour,
      clicksByDay,
      recentEvents
    };
  }

  /**
   * Limpa todos os eventos
   */
  clearEvents(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Exporta eventos como JSON
   */
  exportEvents(): string {
    const events = this.getEvents();
    return JSON.stringify(events, null, 2);
  }

  /**
   * Gera ID único para evento
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const localAnalytics = new LocalAnalyticsService();
