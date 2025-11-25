'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Bell,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Loader2,
  Settings,
  Trash2,
  Power,
} from 'lucide-react';

interface AlertConfig {
  id: string;
  alert_type: string;
  name: string;
  description: string;
  config: any;
  is_active: boolean;
  check_frequency: string;
  notification_channels: string[];
  last_checked_at: string | null;
  last_triggered_at: string | null;
  created_at: string;
}

interface AlertsClientProps {
  userId: string;
}

const ALERT_TYPES = [
  {
    type: 'cpc_increase',
    name: 'CPC Aumentou',
    description: 'Alerta quando o CPC aumentar acima do limite',
    icon: TrendingUp,
    color: 'red',
    fields: [
      { name: 'threshold', label: 'Percentual de aumento (%)', type: 'number', placeholder: '20' },
      { name: 'period', label: 'Comparar com período', type: 'select', options: [
        { value: '24h', label: 'Últimas 24 horas' },
        { value: '7d', label: 'Últimos 7 dias' },
        { value: '30d', label: 'Últimos 30 dias' },
      ]},
    ],
  },
  {
    type: 'roas_decrease',
    name: 'ROAS Diminuiu',
    description: 'Alerta quando o ROAS cair abaixo do limite',
    icon: TrendingDown,
    color: 'orange',
    fields: [
      { name: 'threshold', label: 'ROAS mínimo', type: 'number', placeholder: '2.0', step: '0.1' },
    ],
  },
  {
    type: 'ctr_decrease',
    name: 'CTR Diminuiu',
    description: 'Alerta quando o CTR cair abaixo do limite',
    icon: TrendingDown,
    color: 'yellow',
    fields: [
      { name: 'threshold', label: 'CTR mínimo (%)', type: 'number', placeholder: '1.5', step: '0.1' },
    ],
  },
  {
    type: 'spend_limit',
    name: 'Limite de Gasto',
    description: 'Alerta quando o gasto atingir um valor',
    icon: DollarSign,
    color: 'green',
    fields: [
      { name: 'threshold', label: 'Valor limite (R$)', type: 'number', placeholder: '1000' },
      { name: 'period', label: 'Por período', type: 'select', options: [
        { value: 'daily', label: 'Por dia' },
        { value: 'weekly', label: 'Por semana' },
        { value: 'monthly', label: 'Por mês' },
      ]},
    ],
  },
  {
    type: 'cart_abandonment',
    name: 'Taxa de Abandono Alta',
    description: 'Alerta quando a taxa de abandono subir',
    icon: ShoppingCart,
    color: 'purple',
    fields: [
      { name: 'threshold', label: 'Taxa máxima (%)', type: 'number', placeholder: '70' },
    ],
  },
  {
    type: 'no_conversions',
    name: 'Sem Conversões',
    description: 'Alerta quando ficar sem conversões',
    icon: AlertTriangle,
    color: 'red',
    fields: [
      { name: 'days', label: 'Dias sem conversão', type: 'number', placeholder: '3' },
    ],
  },
];

export function AlertsClient({ userId }: AlertsClientProps) {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (alertId: string, currentStatus: boolean) => {
    const toastId = toast.loading(currentStatus ? 'Desativando alerta...' : 'Ativando alerta...');

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to toggle alert');

      toast.success(currentStatus ? 'Alerta desativado!' : 'Alerta ativado!', { id: toastId });
      loadAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Erro ao alterar status do alerta', { id: toastId });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) return;

    const toastId = toast.loading('Excluindo alerta...');

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete alert');

      toast.success('Alerta excluído com sucesso!', { id: toastId });
      loadAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Erro ao excluir alerta', { id: toastId });
    }
  };

  const getAlertTypeInfo = (type: string) => {
    return ALERT_TYPES.find((t) => t.type === type) || ALERT_TYPES[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão criar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {alerts.length} {alerts.length === 1 ? 'alerta configurado' : 'alertas configurados'}
          </span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Criar Alerta
        </button>
      </div>

      {/* Lista de Alertas */}
      {alerts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhum alerta configurado
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Crie alertas para monitorar suas métricas automaticamente
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Criar Primeiro Alerta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {alerts.map((alert) => {
            const typeInfo = getAlertTypeInfo(alert.alert_type);
            const Icon = typeInfo.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-lg border-2 p-4 transition ${
                  alert.is_active
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg bg-${typeInfo.color}-100 p-2`}>
                      <Icon className={`h-5 w-5 text-${typeInfo.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{typeInfo.description}</p>

                      {/* Config info */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(alert.config).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>

                      {/* Last triggered */}
                      {alert.last_triggered_at && (
                        <p className="mt-2 text-xs text-gray-500">
                          Último disparo:{' '}
                          {new Date(alert.last_triggered_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(alert.id, alert.is_active)}
                      className={`rounded-lg p-2 transition ${
                        alert.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={alert.is_active ? 'Desativar' : 'Ativar'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criar Alerta */}
      {showCreateModal && (
        <CreateAlertModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedType(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedType(null);
            loadAlerts();
          }}
          alertTypes={ALERT_TYPES}
        />
      )}
    </div>
  );
}

// Modal de criação de alerta
function CreateAlertModal({
  onClose,
  onSuccess,
  alertTypes,
}: {
  onClose: () => void;
  onSuccess: () => void;
  alertTypes: any[];
}) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedType, setSelectedType] = useState<any>(null);
  const [name, setName] = useState('');
  const [config, setConfig] = useState<any>({});
  const [creating, setCreating] = useState(false);

  const handleSelectType = (type: any) => {
    setSelectedType(type);
    setName(type.name);
    setStep('configure');
  };

  const handleCreate = async () => {
    if (!name || Object.keys(config).length === 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    setCreating(true);
    const toastId = toast.loading('Criando alerta...');

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: selectedType.type,
          name,
          description: selectedType.description,
          config,
          check_frequency: 'daily',
          notification_channels: ['email'],
        }),
      });

      if (!response.ok) throw new Error('Failed to create alert');

      toast.success('Alerta criado com sucesso!', { id: toastId });
      onSuccess();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Erro ao criar alerta', { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">
          {step === 'select' ? 'Escolha o tipo de alerta' : 'Configure o alerta'}
        </h2>

        {step === 'select' ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {alertTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.type}
                  onClick={() => handleSelectType(type)}
                  className="flex items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <div className={`rounded-lg bg-${type.color}-100 p-2`}>
                    <Icon className={`h-5 w-5 text-${type.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome do Alerta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: CPC muito alto"
              />
            </div>

            {selectedType?.fields.map((field: any) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={config[field.name] || ''}
                    onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {field.options.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    step={field.step}
                    placeholder={field.placeholder}
                    value={config[field.name] || ''}
                    onChange={(e) =>
                      setConfig({ ...config, [field.name]: parseFloat(e.target.value) || e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            disabled={creating}
          >
            Cancelar
          </button>
          {step === 'configure' && (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Criando...' : 'Criar Alerta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
