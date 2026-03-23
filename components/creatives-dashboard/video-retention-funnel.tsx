'use client';

interface VideoRetentionFunnelProps {
  insights: any;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function VideoRetentionFunnel({ insights }: VideoRetentionFunnelProps) {
  if (!insights) {
    return <p className="py-8 text-center text-sm text-gray-400">Sem dados de retenção</p>;
  }

  const plays = insights.video_plays || 0;
  const p25 = insights.video_p25 || 0;
  const p50 = insights.video_p50 || 0;
  const p75 = insights.video_p75 || 0;
  const p95 = insights.video_p95 || 0;
  const avgTime = insights.video_avg_time || 0;

  if (plays === 0 && p25 === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Este criativo não é um vídeo ou não possui dados de retenção
      </p>
    );
  }

  const maxValue = Math.max(plays, p25, p50, p75, p95, 1);

  const steps = [
    { label: 'Iniciaram', value: plays, pct: 100, color: 'bg-blue-500' },
    { label: '25% assistido', value: p25, pct: plays > 0 ? (p25 / plays) * 100 : 0, color: 'bg-cyan-500' },
    { label: '50% assistido', value: p50, pct: plays > 0 ? (p50 / plays) * 100 : 0, color: 'bg-amber-500' },
    { label: '75% assistido', value: p75, pct: plays > 0 ? (p75 / plays) * 100 : 0, color: 'bg-orange-500' },
    { label: '95% assistido', value: p95, pct: plays > 0 ? (p95 / plays) * 100 : 0, color: 'bg-red-500' },
  ];

  // Find biggest drop-off
  const dropOffs = [
    { label: '0→25%', drop: plays > 0 ? ((plays - p25) / plays) * 100 : 0 },
    { label: '25→50%', drop: p25 > 0 ? ((p25 - p50) / p25) * 100 : 0 },
    { label: '50→75%', drop: p50 > 0 ? ((p50 - p75) / p50) * 100 : 0 },
    { label: '75→95%', drop: p75 > 0 ? ((p75 - p95) / p75) * 100 : 0 },
  ];
  const biggestDrop = dropOffs.reduce((max, d) => d.drop > max.drop ? d : max, dropOffs[0]);

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.label}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm text-gray-600">{step.label}</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(step.value)}{' '}
              <span className="text-gray-400">({step.pct.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${step.color}`}
              style={{ width: `${maxValue > 0 ? (step.value / maxValue) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}

      {/* Biggest drop-off indicator */}
      {biggestDrop.drop > 0 && (
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs font-medium text-orange-700">
            Maior queda de retenção: <span className="font-bold">{biggestDrop.label}</span> ({biggestDrop.drop.toFixed(1)}% abandonaram)
          </p>
        </div>
      )}

      {/* Avg watch time */}
      {avgTime > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
          <p className="text-xs font-medium text-gray-500">Tempo médio assistido</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{avgTime.toFixed(1)}s</p>
        </div>
      )}
    </div>
  );
}
