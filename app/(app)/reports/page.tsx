import { SectionTitle } from '@/components/dashboard/section-title';
import { scheduledReports, notifications } from '@/data/dashboard';
import { Download, Plus, Settings, Calendar } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Relatórios Personalizados"
          description="Crie e agende relatórios customizados"
          action={
            <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              Novo relatório
            </button>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {scheduledReports.map((report) => (
            <div key={report.id} className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {report.cadence}
                  </p>
                </div>
                <span className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {report.channel}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">Próxima execução</p>
                <p className="mt-1 font-semibold text-gray-900">{report.nextRun}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Settings className="h-4 w-4" />
                  Configurar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Histórico de Entregas"
          description="Acompanhe notificações e relatórios enviados"
        />

        <div className="mt-6 space-y-3">
          {notifications.map((alert) => (
            <div key={alert.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {alert.type}
                </span>
                <span className="text-xs text-gray-500">{alert.time}</span>
              </div>
              <p className="mt-3 text-sm text-gray-900">{alert.message}</p>
              <p className="mt-2 text-xs text-gray-600">Canal de entrega: {alert.channel}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
