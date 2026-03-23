'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  date: string;
  spend?: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
  roas?: number;
  cpc?: number;
  cpm?: number;
  ctr?: number;
  reach?: number;
  frequency?: number;
}

interface AdvancedMultiAxisChartProps {
  data: ChartDataPoint[];
  selectedMetrics: string[];
}

const METRIC_CONFIGS = {
  spend: {
    label: 'Gasto',
    color: '#10b981',
    yAxisId: 'left',
    format: (value: number) => `R$ ${value.toFixed(0)}`,
    type: 'bar' as const
  },
  clicks: {
    label: 'Cliques',
    color: '#3b82f6',
    yAxisId: 'right',
    format: (value: number) => value.toFixed(0),
    type: 'line' as const
  },
  impressions: {
    label: 'Impressões',
    color: '#8b5cf6',
    yAxisId: 'right',
    format: (value: number) => (value / 1000).toFixed(1) + 'k',
    type: 'area' as const
  },
  conversions: {
    label: 'Conversões',
    color: '#f59e0b',
    yAxisId: 'right',
    format: (value: number) => value.toFixed(0),
    type: 'line' as const
  },
  roas: {
    label: 'ROAS',
    color: '#ec4899',
    yAxisId: 'left',
    format: (value: number) => value.toFixed(2) + 'x',
    type: 'line' as const
  },
  cpc: {
    label: 'CPC',
    color: '#f97316',
    yAxisId: 'left',
    format: (value: number) => `R$ ${value.toFixed(2)}`,
    type: 'line' as const
  },
  cpm: {
    label: 'CPM',
    color: '#06b6d4',
    yAxisId: 'left',
    format: (value: number) => `R$ ${value.toFixed(2)}`,
    type: 'line' as const
  },
  ctr: {
    label: 'CTR',
    color: '#84cc16',
    yAxisId: 'right',
    format: (value: number) => value.toFixed(2) + '%',
    type: 'line' as const
  },
  reach: {
    label: 'Alcance',
    color: '#6366f1',
    yAxisId: 'right',
    format: (value: number) => (value / 1000).toFixed(1) + 'k',
    type: 'area' as const
  },
  frequency: {
    label: 'Frequência',
    color: '#a855f7',
    yAxisId: 'right',
    format: (value: number) => value.toFixed(2),
    type: 'line' as const
  }
};

export function AdvancedMultiAxisChart({ data, selectedMetrics }: AdvancedMultiAxisChartProps) {
  const [chartType, setChartType] = useState<'composed' | 'line' | 'area'>('composed');
  const [showGrid, setShowGrid] = useState(true);
  const [showDots, setShowDots] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-3 text-sm font-medium text-gray-600">
          Nenhum dado disponível para o período selecionado
        </p>
      </div>
    );
  }

  // Preparar dados com formatação de data
  const chartData = data.map(d => ({
    ...d,
    dateFormatted: new Date(d.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    })
  }));

  // Identificar métricas que vão em cada eixo Y
  const leftAxisMetrics = selectedMetrics.filter(
    m => METRIC_CONFIGS[m as keyof typeof METRIC_CONFIGS]?.yAxisId === 'left'
  );
  const rightAxisMetrics = selectedMetrics.filter(
    m => METRIC_CONFIGS[m as keyof typeof METRIC_CONFIGS]?.yAxisId === 'right'
  );

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
        <p className="mb-2 font-semibold text-gray-900">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-600">{entry.name}:</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {METRIC_CONFIGS[entry.dataKey as keyof typeof METRIC_CONFIGS]?.format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Chart = chartType === 'composed' ? ComposedChart :
                chartType === 'line' ? LineChart :
                AreaChart;

  return (
    <div className="space-y-4">
      {/* Controles do Gráfico */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('composed')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition',
              chartType === 'composed'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Composto
          </button>
          <button
            onClick={() => setChartType('line')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition',
              chartType === 'line'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Linhas
          </button>
          <button
            onClick={() => setChartType('area')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition',
              chartType === 'area'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <Activity className="h-4 w-4" />
            Área
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Grid
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showDots}
              onChange={(e) => setShowDots(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Pontos
          </label>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <ResponsiveContainer width="100%" height={400}>
          <Chart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            )}

            <XAxis
              dataKey="dateFormatted"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#d1d5db' }}
            />

            {/* Eixo Y Esquerdo (Custos, ROAS, etc) */}
            {leftAxisMetrics.length > 0 && (
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) =>
                  METRIC_CONFIGS[leftAxisMetrics[0] as keyof typeof METRIC_CONFIGS]?.format(value)
                }
              />
            )}

            {/* Eixo Y Direito (Cliques, Conversões, etc) */}
            {rightAxisMetrics.length > 0 && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) =>
                  METRIC_CONFIGS[rightAxisMetrics[0] as keyof typeof METRIC_CONFIGS]?.format(value)
                }
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
              iconType="circle"
            />

            {/* Renderizar linhas/barras/áreas para cada métrica selecionada */}
            {selectedMetrics.map((metricKey) => {
              const config = METRIC_CONFIGS[metricKey as keyof typeof METRIC_CONFIGS];
              if (!config) return null;

              if (chartType === 'composed') {
                // No modo composto, usa o tipo preferido de cada métrica
                if (config.type === 'bar') {
                  return (
                    <Bar
                      key={metricKey}
                      dataKey={metricKey}
                      fill={config.color}
                      yAxisId={config.yAxisId}
                      name={config.label}
                      radius={[4, 4, 0, 0]}
                    />
                  );
                } else if (config.type === 'area') {
                  return (
                    <Area
                      key={metricKey}
                      type="monotone"
                      dataKey={metricKey}
                      stroke={config.color}
                      fill={config.color}
                      fillOpacity={0.1}
                      yAxisId={config.yAxisId}
                      name={config.label}
                      strokeWidth={2}
                      dot={showDots ? { r: 3, fill: config.color } : false}
                    />
                  );
                } else {
                  return (
                    <Line
                      key={metricKey}
                      type="monotone"
                      dataKey={metricKey}
                      stroke={config.color}
                      yAxisId={config.yAxisId}
                      name={config.label}
                      strokeWidth={2}
                      dot={showDots ? { r: 3, fill: config.color } : false}
                      activeDot={{ r: 5 }}
                    />
                  );
                }
              } else if (chartType === 'line') {
                return (
                  <Line
                    key={metricKey}
                    type="monotone"
                    dataKey={metricKey}
                    stroke={config.color}
                    yAxisId={config.yAxisId}
                    name={config.label}
                    strokeWidth={2}
                    dot={showDots ? { r: 3, fill: config.color } : false}
                    activeDot={{ r: 5 }}
                  />
                );
              } else {
                return (
                  <Area
                    key={metricKey}
                    type="monotone"
                    dataKey={metricKey}
                    stroke={config.color}
                    fill={config.color}
                    fillOpacity={0.2}
                    yAxisId={config.yAxisId}
                    name={config.label}
                    strokeWidth={2}
                    dot={showDots ? { r: 3, fill: config.color } : false}
                  />
                );
              }
            })}
          </Chart>
        </ResponsiveContainer>
      </div>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-3 gap-4">
        {selectedMetrics.slice(0, 6).map((metricKey) => {
          const config = METRIC_CONFIGS[metricKey as keyof typeof METRIC_CONFIGS];
          if (!config) return null;

          const values = chartData
            .map(d => d[metricKey as keyof ChartDataPoint] as number)
            .filter(v => v !== undefined && v !== null);

          const total = values.reduce((sum, v) => sum + v, 0);
          const avg = total / values.length;
          const max = Math.max(...values);
          const min = Math.min(...values);

          return (
            <div
              key={metricKey}
              className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {config.label}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-gray-500">Média</p>
                  <p className="mt-0.5 text-sm font-bold text-gray-900">
                    {config.format(avg)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Mín</p>
                  <p className="mt-0.5 text-sm font-bold text-gray-900">
                    {config.format(min)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Máx</p>
                  <p className="mt-0.5 text-sm font-bold text-gray-900">
                    {config.format(max)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
