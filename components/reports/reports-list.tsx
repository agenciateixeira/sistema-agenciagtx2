'use client';

import { useState } from 'react';
import { deleteReport } from '../../app/actions/reports';
import { Calendar, Trash2, FileText } from 'lucide-react';

interface ReportsListProps {
  schedules: any[];
}

export function ReportsList({ schedules }: ReportsListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    setDeleting(id);
    await deleteReport(id);
    setDeleting(null);
  }

  if (schedules.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Nenhum relatório criado
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Crie seu primeiro relatório acima
        </p>
      </div>
    );
  }

  const cadenceLabels: Record<string, string> = {
    DAILY: 'Diário',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
  };

  const channelLabels: Record<string, string> = {
    EMAIL: 'E-mail',
    WEBHOOK: 'Webhook',
    IN_APP: 'Dashboard',
  };

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{schedule.template?.name || 'Sem nome'}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {cadenceLabels[schedule.cadence] || schedule.cadence}
              </p>
              {schedule.template?.description && (
                <p className="mt-2 text-sm text-gray-600">{schedule.template.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(schedule.id)}
              disabled={deleting === schedule.id}
              className="ml-2 rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
              {channelLabels[schedule.channels?.[0]] || 'E-mail'}
            </span>
            {schedule.nextRunAt && (
              <p className="text-xs text-gray-500">
                Próxima: {new Date(schedule.nextRunAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
