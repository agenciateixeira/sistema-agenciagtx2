'use client';

import { useState } from 'react';

interface DailyPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  reach: number;
  conversions: number;
  likes: number;
  comments: number;
}

interface DailyPerformanceChartProps {
  data: DailyPoint[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

type MetricKey = 'spend' | 'impressions' | 'clicks' | 'ctr' | 'conversions' | 'likes';

const metricConfig: Record<MetricKey, { label: string; format: (v: number) => string; color: string }> = {
  spend: { label: 'Gasto (R$)', format: formatCurrency, color: 'bg-green-500' },
  impressions: { label: 'Impressões', format: formatNumber, color: 'bg-blue-500' },
  clicks: { label: 'Cliques', format: formatNumber, color: 'bg-purple-500' },
  ctr: { label: 'CTR (%)', format: (v) => `${v.toFixed(2)}%`, color: 'bg-amber-500' },
  conversions: { label: 'Conversões', format: formatNumber, color: 'bg-pink-500' },
  likes: { label: 'Curtidas', format: formatNumber, color: 'bg-red-500' },
};

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  const [metric, setMetric] = useState<MetricKey>('spend');

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Nenhum dado diário disponível</p>;
  }

  const config = metricConfig[metric];
  const values = data.map((d) => d[metric] as number);
  const maxVal = Math.max(...values, 0.01);
  const minVal = Math.min(...values);
  const avgVal = values.reduce((a, b) => a + b, 0) / values.length;

  // Find peak day
  const peakIndex = values.indexOf(Math.max(...values));
  const peakDate = data[peakIndex]?.date;

  // Find first day with significant performance (above average)
  const firstGoodDay = data.find((d) => (d[metric] as number) > avgVal);

  return (
    <div>
      {/* Metric selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.entries(metricConfig) as [MetricKey, typeof config][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              metric === key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Info cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase text-gray-400">Mínimo</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{config.format(minVal)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase text-gray-400">Média</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{config.format(avgVal)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase text-gray-400">Máximo</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{config.format(maxVal)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase text-gray-400">Dias</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{data.length}</p>
        </div>
      </div>

      {/* Peak & start indicators */}
      {peakDate && (
        <div className="mb-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs">
          <span className="text-gray-500">Pico: </span>
          <span className="font-bold text-green-700">{peakDate}</span>
          <span className="text-gray-500"> com </span>
          <span className="font-bold text-gray-900">{config.format(values[peakIndex])}</span>
        </div>
      )}

      {firstGoodDay && firstGoodDay.date !== data[0]?.date && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
          <span className="text-gray-500">Começou a performar acima da média em: </span>
          <span className="font-bold text-blue-700">{firstGoodDay.date}</span>
        </div>
      )}

      {/* Bar chart */}
      <div className="flex items-end gap-[2px]" style={{ height: 180 }}>
        {data.map((point, i) => {
          const val = point[metric] as number;
          const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isPeak = i === peakIndex;

          return (
            <div
              key={point.date}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: '100%' }}
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg group-hover:block z-10 whitespace-nowrap">
                <p className="font-semibold text-gray-900">{point.date}</p>
                <p className="text-gray-600">{config.format(val)}</p>
              </div>
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isPeak ? 'bg-green-500' : `${config.color} opacity-70 hover:opacity-100`
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Date labels */}
      <div className="mt-2 flex justify-between">
        <span className="text-[10px] text-gray-400">{data[0]?.date}</span>
        <span className="text-[10px] text-gray-400">{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
