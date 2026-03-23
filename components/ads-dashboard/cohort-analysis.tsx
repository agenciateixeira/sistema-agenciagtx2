'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CohortData {
  date: string;
  spend: number;
  conversions: number;
  revenue: number;
  roas: number;
  cpc: number;
  ctr: number;
  retention?: {
    day1: number;
    day3: number;
    day7: number;
    day14: number;
    day30: number;
  };
}

interface CohortAnalysisProps {
  data: CohortData[];
  metric: 'spend' | 'conversions' | 'roas' | 'cpc' | 'ctr';
}

export function CohortAnalysis({ data, metric }: CohortAnalysisProps) {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'absolute' | 'relative'>('absolute');

  const metricConfig = {
    spend: {
      label: 'Gasto',
      format: (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
      color: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    conversions: {
      label: 'Conversões',
      format: (value: number) => value.toFixed(0),
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    roas: {
      label: 'ROAS',
      format: (value: number) => `${value.toFixed(2)}x`,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50'
    },
    cpc: {
      label: 'CPC',
      format: (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
      color: 'text-orange-700',
      bgColor: 'bg-orange-50'
    },
    ctr: {
      label: 'CTR',
      format: (value: number) => `${value.toFixed(2)}%`,
      color: 'text-pink-700',
      bgColor: 'bg-pink-50'
    }
  };

  const config = metricConfig[metric];

  // Calcular estatísticas por cohort
  const cohortStats = data.map((cohort, idx) => {
    const previous = data[idx - 1];
    const change = previous ? ((cohort[metric] - previous[metric]) / previous[metric]) * 100 : 0;

    return {
      ...cohort,
      change,
      isImproving: metric === 'roas' || metric === 'conversions' || metric === 'ctr'
        ? change > 0
        : change < 0 // Para CPC e Spend, menor é melhor
    };
  });

  // Calcular média móvel (7 dias)
  const getMovingAverage = (index: number, window: number = 7) => {
    const start = Math.max(0, index - window + 1);
    const subset = data.slice(start, index + 1);
    const sum = subset.reduce((acc, item) => acc + item[metric], 0);
    return sum / subset.length;
  };

  // Identificar tendência
  const getTrend = () => {
    if (data.length < 7) return 'stable';
    const recentAvg = getMovingAverage(data.length - 1, 7);
    const olderAvg = getMovingAverage(data.length - 8, 7);
    const diff = ((recentAvg - olderAvg) / olderAvg) * 100;

    const isPositiveTrend = metric === 'roas' || metric === 'conversions' || metric === 'ctr';

    if (Math.abs(diff) < 2) return 'stable';
    if (isPositiveTrend) {
      return diff > 0 ? 'up' : 'down';
    } else {
      return diff < 0 ? 'up' : 'down';
    }
  };

  const trend = getTrend();

  // Calcular percentis
  const values = data.map(d => d[metric]).sort((a, b) => a - b);
  const p25 = values[Math.floor(values.length * 0.25)];
  const p50 = values[Math.floor(values.length * 0.50)];
  const p75 = values[Math.floor(values.length * 0.75)];
  const min = values[0];
  const max = values[values.length - 1];

  // Função para determinar cor da célula baseado em performance
  const getCellColor = (value: number) => {
    if (value >= p75) return 'bg-green-100 text-green-900';
    if (value >= p50) return 'bg-yellow-50 text-yellow-900';
    if (value >= p25) return 'bg-orange-50 text-orange-900';
    return 'bg-red-50 text-red-900';
  };

  return (
    <div className="space-y-6">
      {/* Header com Tendência */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Análise de Cohort: {config.label}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Performance diária com análise de tendências e retenção
          </p>
        </div>

        {/* Indicador de Tendência */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2',
            trend === 'up' ? 'border-green-200 bg-green-50' :
            trend === 'down' ? 'border-red-200 bg-red-50' :
            'border-gray-200 bg-gray-50'
          )}>
            {trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
            {trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
            {trend === 'stable' && <Minus className="h-5 w-5 text-gray-600" />}
            <div>
              <p className="text-xs font-medium text-gray-600">Tendência 7d</p>
              <p className={cn(
                'text-sm font-semibold',
                trend === 'up' ? 'text-green-700' :
                trend === 'down' ? 'text-red-700' :
                'text-gray-700'
              )}>
                {trend === 'up' ? 'Em alta' : trend === 'down' ? 'Em queda' : 'Estável'}
              </p>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewType('absolute')}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition',
                viewType === 'absolute'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Absoluto
            </button>
            <button
              onClick={() => setViewType('relative')}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-medium transition',
                viewType === 'relative'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Variação %
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600">Mínimo</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{config.format(min)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600">P25</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{config.format(p25)}</p>
        </div>
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="text-xs font-medium text-brand-700">Mediana (P50)</p>
          <p className="mt-1 text-lg font-semibold text-brand-900">{config.format(p50)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600">P75</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{config.format(p75)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-600">Máximo</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{config.format(max)}</p>
        </div>
      </div>

      {/* Tabela de Cohort */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Data
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  {config.label}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Variação
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Média Móvel 7d
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cohortStats.map((cohort, idx) => {
                const movingAvg = getMovingAverage(idx);
                const perfClass = cohort[metric] >= p75 ? 'Excelente' :
                                 cohort[metric] >= p50 ? 'Bom' :
                                 cohort[metric] >= p25 ? 'Regular' : 'Ruim';

                return (
                  <tr
                    key={cohort.date}
                    className={cn(
                      'transition hover:bg-gray-50',
                      selectedCohort === cohort.date && 'bg-brand-50'
                    )}
                    onClick={() => setSelectedCohort(cohort.date)}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {new Date(cohort.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {config.format(cohort[metric])}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      {idx > 0 ? (
                        <span className={cn(
                          'inline-flex items-center gap-1 font-medium',
                          cohort.isImproving ? 'text-green-700' : 'text-red-700'
                        )}>
                          {cohort.isImproving ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(cohort.change).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {config.format(movingAvg)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        getCellColor(cohort[metric])
                      )}>
                        {perfClass}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-900">💡 Insights Automáticos</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>
                • <strong>Melhor dia:</strong> {
                  data.reduce((best, curr) => curr[metric] > best[metric] ? curr : best).date
                } com {config.format(max)}
              </li>
              <li>
                • <strong>Pior dia:</strong> {
                  data.reduce((worst, curr) => curr[metric] < worst[metric] ? curr : worst).date
                } com {config.format(min)}
              </li>
              <li>
                • <strong>Volatilidade:</strong> {
                  ((max - min) / min * 100).toFixed(1)
                }% de variação entre melhor e pior dia
              </li>
              {trend === 'up' && (
                <li>
                  • <strong>Tendência positiva:</strong> Últimos 7 dias mostram melhora consistente
                </li>
              )}
              {trend === 'down' && (
                <li className="text-red-700">
                  • <strong>⚠️ Atenção:</strong> Últimos 7 dias mostram queda. Revisar campanhas
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
