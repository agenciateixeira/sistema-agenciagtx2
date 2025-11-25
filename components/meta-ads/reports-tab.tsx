'use client';

import { FileText, Download } from 'lucide-react';

export function ReportsTab() {
  return (
    <div className="space-y-6">
      {/* Placeholder para FASE 7 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
          <FileText className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900">
          Relatórios em Desenvolvimento
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Em breve você poderá gerar relatórios completos em PDF e Excel com todas as métricas do Meta Ads.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-xs font-medium text-gray-500">Recursos Planejados:</p>
          <div className="grid gap-2 text-left text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <span>Exportar relatórios em PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-green-600" />
              <span>Exportar dados em Excel</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span>Relatórios personalizados por período</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <span>Comparativos entre campanhas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
