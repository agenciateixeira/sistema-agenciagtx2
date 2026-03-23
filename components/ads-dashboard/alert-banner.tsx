'use client';

import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface AlertBannerProps {
  cpaReal: number;
  cpaTarget: number;
  totalSpend: number;
  totalConversions: number;
  roas: number | null;
  receita: number;
  campaignsCount: number;
  motorDecisao: string; // ex: "1 escalar"
  dateLabel: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function AlertBanner({
  cpaReal,
  cpaTarget,
  totalSpend,
  totalConversions,
  roas,
  receita,
  campaignsCount,
  motorDecisao,
  dateLabel,
}: AlertBannerProps) {
  const isCpaAbove = cpaTarget > 0 && cpaReal > cpaTarget;
  const cpaStatus = isCpaAbove ? 'above' : 'below';

  return (
    <div className={`rounded-lg border p-4 ${
      isCpaAbove
        ? 'border-yellow-200 bg-yellow-50'
        : 'border-green-200 bg-green-50'
    }`}>
      {/* Date and Alert */}
      <div className="mb-3">
        <p className="text-xs text-gray-500">{dateLabel}</p>
        <div className="flex items-center gap-2">
          {isCpaAbove ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          <h2 className={`text-lg font-bold ${
            isCpaAbove ? 'text-yellow-900' : 'text-green-900'
          }`}>
            {isCpaAbove
              ? 'CPA acima do alvo'
              : 'CPA dentro do alvo'}
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-gray-600">
          CPA real {formatCurrency(cpaReal)} {isCpaAbove ? '>' : '<'} alvo {formatCurrency(cpaTarget)}
          {roas ? ` · ROAS ${roas.toFixed(1)}x (min: 2.4x)` : ''}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
            Investimento Total
          </p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSpend)}</p>
          <p className="text-[10px] text-gray-500">{campaignsCount} campanhas</p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-400" />
            Pedidos Reais
          </p>
          <p className="text-xl font-bold text-gray-900">{totalConversions}</p>
          <p className="text-[10px] text-gray-500">CPA Real {formatCurrency(cpaReal)}</p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            ROAS Real
          </p>
          <p className="text-xl font-bold text-gray-900">
            {roas ? `${roas.toFixed(1)}x` : '--'}
          </p>
          <p className="text-[10px] text-gray-500">
            {roas ? `Meta reporta: ${(roas * 0.9).toFixed(1)}x` : 'Sem dados'}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
            Motor de Decisão
          </p>
          <p className="text-xl font-bold text-gray-900">{motorDecisao}</p>
          <p className="text-[10px] text-gray-500">
            Receita Real {formatCurrency(receita)}
          </p>
        </div>
      </div>
    </div>
  );
}
