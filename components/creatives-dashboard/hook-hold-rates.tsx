'use client';

import { Zap, Shield } from 'lucide-react';

interface HookHoldRatesProps {
  insights: any;
}

export function HookHoldRates({ insights }: HookHoldRatesProps) {
  if (!insights) {
    return <p className="py-4 text-center text-sm text-gray-400">Sem dados</p>;
  }

  const hookRate = insights.hook_rate || 0;
  const holdRate = insights.hold_rate || 0;
  const isVideo = insights.video_thru_plays > 0;

  if (!isVideo) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        Hook Rate e Hold Rate disponíveis apenas para vídeos
      </p>
    );
  }

  const hookColor = hookRate >= 20 ? 'text-green-600' : hookRate >= 10 ? 'text-yellow-600' : 'text-red-600';
  const hookBg = hookRate >= 20 ? 'bg-green-50 border-green-200' : hookRate >= 10 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const hookLabel = hookRate >= 20 ? 'Excelente' : hookRate >= 10 ? 'Bom' : 'Precisa melhorar';

  const holdColor = holdRate >= 30 ? 'text-green-600' : holdRate >= 15 ? 'text-yellow-600' : 'text-red-600';
  const holdBg = holdRate >= 30 ? 'bg-green-50 border-green-200' : holdRate >= 15 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const holdLabel = holdRate >= 30 ? 'Excelente' : holdRate >= 15 ? 'Bom' : 'Precisa melhorar';

  return (
    <div className="space-y-4">
      {/* Hook Rate */}
      <div className={`rounded-lg border p-4 ${hookBg}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className={`h-5 w-5 ${hookColor}`} />
          <h4 className="text-sm font-bold text-gray-900">Hook Rate</h4>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${hookColor}`}>{hookRate.toFixed(1)}%</span>
          <span className={`text-xs font-medium ${hookColor}`}>{hookLabel}</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-500">
          ThruPlay / Impressões — Quantos % viram o anúncio e assistiram 3s+
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className={`h-full rounded-full transition-all ${
              hookRate >= 20 ? 'bg-green-500' : hookRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(hookRate * 2, 100)}%` }}
          />
        </div>
      </div>

      {/* Hold Rate */}
      <div className={`rounded-lg border p-4 ${holdBg}`}>
        <div className="flex items-center gap-2 mb-2">
          <Shield className={`h-5 w-5 ${holdColor}`} />
          <h4 className="text-sm font-bold text-gray-900">Hold Rate</h4>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${holdColor}`}>{holdRate.toFixed(1)}%</span>
          <span className={`text-xs font-medium ${holdColor}`}>{holdLabel}</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-500">
          95% assistido / ThruPlay — Dos que foram fisgados, quantos ficaram até o fim
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className={`h-full rounded-full transition-all ${
              holdRate >= 30 ? 'bg-green-500' : holdRate >= 15 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(holdRate * 2, 100)}%` }}
          />
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">Diagnóstico:</p>
        {hookRate < 10 && holdRate < 15 && (
          <p className="text-xs text-gray-600">O hook e o conteúdo precisam de melhoria. Teste novos primeiros 3 segundos E roteiro.</p>
        )}
        {hookRate < 10 && holdRate >= 15 && (
          <p className="text-xs text-gray-600">O conteúdo é bom, mas o gancho inicial não prende. Foque nos primeiros 3 segundos.</p>
        )}
        {hookRate >= 10 && holdRate < 15 && (
          <p className="text-xs text-gray-600">O hook funciona, mas o conteúdo não segura. Melhore o roteiro/oferta depois dos 3s.</p>
        )}
        {hookRate >= 10 && holdRate >= 15 && (
          <p className="text-xs text-gray-600">Criativo sólido! Hook e conteúdo funcionam bem juntos.</p>
        )}
      </div>
    </div>
  );
}
