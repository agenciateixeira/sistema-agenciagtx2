import { SectionTitle } from '@/components/dashboard/section-title';
import { notifications } from '@/data/dashboard';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const severityConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Alta: { icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  Média: { icon: Info, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  Baixa: { icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Central de Notificações</h2>
            <p className="text-sm text-gray-600">Acompanhe alertas e eventos importantes do sistema</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Alertas Recentes"
          description="Notificações de eventos críticos e mudanças no sistema"
        />

        <div className="mt-6 space-y-3">
          {notifications.map((alert) => {
            const severity = alert.severity || 'Baixa';
            const config = severityConfig[severity] || severityConfig.Baixa;
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${config.bg}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${config.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold uppercase ${config.color}`}>
                        {alert.type}
                      </span>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-900">{alert.message}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                      <span>Canal: {alert.channel}</span>
                      <span>Severidade: {severity}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle title="Configurações de Notificação" description="Personalize suas preferências" />

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-900">Notificações por e-mail</p>
              <p className="text-sm text-gray-600">Receba alertas importantes por e-mail</p>
            </div>
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              Ativado
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-900">Alertas de desempenho</p>
              <p className="text-sm text-gray-600">Notificações sobre quedas de conversão</p>
            </div>
            <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              Ativado
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-900">Relatórios semanais</p>
              <p className="text-sm text-gray-600">Resumo semanal de métricas e eventos</p>
            </div>
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
              Desativado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
