import { SectionTitle } from '@/components/dashboard/section-title';
import { Bell } from 'lucide-react';

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

        <div className="mt-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhuma notificação
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Você receberá alertas importantes aqui
          </p>
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
