'use client';

interface DailyPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  frequency: number;
  cost_per_result: number;
}

interface FatigueCurveChartProps {
  data: DailyPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function FatigueCurveChart({ data }: FatigueCurveChartProps) {
  if (data.length < 3) {
    return <p className="py-8 text-center text-sm text-gray-400">Dados insuficientes para curva de fadiga (mínimo 3 dias)</p>;
  }

  // Normalize each metric to 0-100 scale for visualization
  const maxFreq = Math.max(...data.map(d => d.frequency), 0.01);
  const maxCtr = Math.max(...data.map(d => d.ctr), 0.01);
  const maxCpc = Math.max(...data.map(d => d.cpc), 0.01);

  // Detect fatigue trend: is frequency going up while CTR goes down?
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const avgFreqFirst = firstHalf.reduce((s, d) => s + d.frequency, 0) / firstHalf.length;
  const avgFreqSecond = secondHalf.reduce((s, d) => s + d.frequency, 0) / secondHalf.length;
  const avgCtrFirst = firstHalf.reduce((s, d) => s + d.ctr, 0) / firstHalf.length;
  const avgCtrSecond = secondHalf.reduce((s, d) => s + d.ctr, 0) / secondHalf.length;
  const avgCpcFirst = firstHalf.reduce((s, d) => s + d.cpc, 0) / firstHalf.length;
  const avgCpcSecond = secondHalf.reduce((s, d) => s + d.cpc, 0) / secondHalf.length;

  const freqTrend = avgFreqSecond > avgFreqFirst * 1.15 ? 'rising' : avgFreqSecond < avgFreqFirst * 0.85 ? 'falling' : 'stable';
  const ctrTrend = avgCtrSecond < avgCtrFirst * 0.85 ? 'falling' : avgCtrSecond > avgCtrFirst * 1.15 ? 'rising' : 'stable';
  const cpcTrend = avgCpcSecond > avgCpcFirst * 1.2 ? 'rising' : avgCpcSecond < avgCpcFirst * 0.8 ? 'falling' : 'stable';

  const isFatiguing = freqTrend === 'rising' && (ctrTrend === 'falling' || cpcTrend === 'rising');
  const isHealthy = freqTrend !== 'rising' && ctrTrend !== 'falling';

  return (
    <div className="space-y-4">
      {/* Trend diagnosis */}
      <div className={`rounded-lg border p-3 ${
        isFatiguing ? 'border-red-200 bg-red-50' : isHealthy ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
      }`}>
        <p className={`text-sm font-bold ${
          isFatiguing ? 'text-red-700' : isHealthy ? 'text-green-700' : 'text-yellow-700'
        }`}>
          {isFatiguing ? 'Criativo em fadiga — Frequência subindo + CTR caindo'
           : isHealthy ? 'Criativo saudável — Métricas estáveis'
           : 'Atenção — Tendência de desgaste detectada'}
        </p>
      </div>

      {/* Trend indicators */}
      <div className="grid grid-cols-3 gap-3">
        <TrendCard
          label="Frequência"
          firstValue={avgFreqFirst.toFixed(1)}
          secondValue={avgFreqSecond.toFixed(1)}
          trend={freqTrend}
          suffix="x"
          invertColor
        />
        <TrendCard
          label="CTR"
          firstValue={avgCtrFirst.toFixed(2)}
          secondValue={avgCtrSecond.toFixed(2)}
          trend={ctrTrend}
          suffix="%"
        />
        <TrendCard
          label="CPC"
          firstValue={`R$ ${avgCpcFirst.toFixed(2)}`}
          secondValue={`R$ ${avgCpcSecond.toFixed(2)}`}
          trend={cpcTrend}
          invertColor
        />
      </div>

      {/* Multi-line chart representation using bars */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Frequência ao longo do tempo</p>
        <div className="flex items-end gap-[2px]" style={{ height: 80 }}>
          {data.map((point, i) => {
            const height = maxFreq > 0 ? (point.frequency / maxFreq) * 100 : 0;
            const isHigh = point.frequency >= 3.5;
            return (
              <div key={point.date} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
                <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded border border-gray-200 bg-white px-2 py-1 text-[10px] shadow group-hover:block z-10 whitespace-nowrap">
                  <p className="font-semibold">{formatDate(point.date)}</p>
                  <p>Freq: {point.frequency.toFixed(1)}x</p>
                </div>
                <div
                  className={`w-full rounded-t transition-all ${isHigh ? 'bg-red-400' : 'bg-blue-400'} opacity-70 hover:opacity-100`}
                  style={{ height: `${Math.max(height, 3)}%` }}
                />
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">CTR ao longo do tempo</p>
        <div className="flex items-end gap-[2px]" style={{ height: 80 }}>
          {data.map((point) => {
            const height = maxCtr > 0 ? (point.ctr / maxCtr) * 100 : 0;
            const isLow = point.ctr < 1.0;
            return (
              <div key={point.date} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
                <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded border border-gray-200 bg-white px-2 py-1 text-[10px] shadow group-hover:block z-10 whitespace-nowrap">
                  <p className="font-semibold">{formatDate(point.date)}</p>
                  <p>CTR: {point.ctr.toFixed(2)}%</p>
                </div>
                <div
                  className={`w-full rounded-t transition-all ${isLow ? 'bg-red-400' : 'bg-green-400'} opacity-70 hover:opacity-100`}
                  style={{ height: `${Math.max(height, 3)}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-1 flex justify-between">
          <span className="text-[10px] text-gray-400">{formatDate(data[0]?.date)}</span>
          <span className="text-[10px] text-gray-400">{formatDate(data[data.length - 1]?.date)}</span>
        </div>
      </div>
    </div>
  );
}

function TrendCard({
  label,
  firstValue,
  secondValue,
  trend,
  suffix = '',
  invertColor = false,
}: {
  label: string;
  firstValue: string;
  secondValue: string;
  trend: string;
  suffix?: string;
  invertColor?: boolean;
}) {
  const getColor = () => {
    if (trend === 'stable') return 'text-gray-600';
    if (invertColor) {
      return trend === 'rising' ? 'text-red-600' : 'text-green-600';
    }
    return trend === 'rising' ? 'text-green-600' : 'text-red-600';
  };

  const arrow = trend === 'rising' ? '↑' : trend === 'falling' ? '↓' : '→';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
      <p className="text-[10px] font-medium uppercase text-gray-400">{label}</p>
      <div className="mt-1 flex items-center justify-center gap-1">
        <span className="text-xs text-gray-500">{firstValue}{suffix}</span>
        <span className={`text-sm font-bold ${getColor()}`}>{arrow}</span>
        <span className={`text-xs font-bold ${getColor()}`}>{secondValue}{suffix}</span>
      </div>
      <p className={`text-[9px] font-medium ${getColor()}`}>
        {trend === 'rising' ? 'Subindo' : trend === 'falling' ? 'Caindo' : 'Estável'}
      </p>
    </div>
  );
}
