'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface AlertHistory {
  id: string;
  alert_config_id: string;
  triggered_at: string;
  message: string;
  status: string;
  is_read: boolean;
  alert_config: {
    name: string;
    alert_type: string;
  };
}

interface AlertsHistoryProps {
  userId: string;
}

export function AlertsHistory({ userId }: AlertsHistoryProps) {
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const url = `/api/alerts/notifications${filter === 'unread' ? '?unread_only=true' : ''}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to load history');

      const data = await response.json();
      setHistory(data.notifications || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (historyId: string) => {
    try {
      const response = await fetch(`/api/alerts/notifications/${historyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      // Atualizar local
      setHistory(prev =>
        prev.map(item =>
          item.id === historyId ? { ...item, is_read: true } : item
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Erro ao marcar como lido');
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    const icons: Record<string, string> = {
      cpc_increase: '🔺',
      roas_decrease: '📉',
      ctr_decrease: '📊',
      spend_limit: '💰',
      cart_abandonment: '🛒',
      no_conversions: '⚠️',
    };
    return icons[alertType] || '🔔';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      ignored: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      resolved: 'Resolvido',
      ignored: 'Ignorado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Não Lidos
        </button>
      </div>

      {/* Lista de histórico */}
      {history.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhum alerta disparado
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {filter === 'unread'
              ? 'Todos os alertas foram lidos'
              : 'Quando seus alertas forem disparados, eles aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border ${
                item.is_read ? 'border-gray-200 bg-white' : 'border-brand-200 bg-brand-50'
              } p-4 transition hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getAlertTypeIcon(item.alert_config.alert_type)}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.alert_config.name}
                      </h4>
                      <p className="text-sm text-gray-600">{item.message}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.triggered_at).toLocaleString('pt-BR')}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      title="Marcar como lido"
                    >
                      <Eye className="h-3 w-3" />
                      Marcar como lido
                    </button>
                  )}
                  {item.is_read && (
                    <CheckCircle className="h-5 w-5 text-green-600" title="Lido" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
