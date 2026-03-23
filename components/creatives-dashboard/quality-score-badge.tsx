'use client';

interface QualityScoreBadgeProps {
  score: number;
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig = {
  excellent: { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500' },
  good: { label: 'Bom', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-500' },
  average: { label: 'Médio', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-500' },
  below_average: { label: 'Abaixo da média', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', ring: 'ring-orange-500' },
  poor: { label: 'Fraco', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-500' },
};

export function QualityScoreBadge({ score, level, size = 'md' }: QualityScoreBadgeProps) {
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.poor;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${config.bg} ${config.color} border ${config.border}`}>
        {score.toFixed(1)}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-center rounded-xl border-2 ${config.border} ${config.bg} p-4`}>
        <div className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 ${config.border} bg-white`}>
          <span className={`text-2xl font-black ${config.color}`}>{score.toFixed(1)}</span>
          <span className={`absolute -bottom-1 text-[8px] font-bold ${config.color}`}>/10</span>
        </div>
        <p className={`mt-2 text-sm font-bold ${config.color}`}>{config.label}</p>
        <p className="mt-0.5 text-[10px] text-gray-500">Quality Score</p>
      </div>
    );
  }

  // md
  return (
    <div className={`flex items-center gap-2 rounded-lg border ${config.border} ${config.bg} px-3 py-2`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${config.border} bg-white`}>
        <span className={`text-sm font-black ${config.color}`}>{score.toFixed(1)}</span>
      </div>
      <div>
        <p className={`text-xs font-bold ${config.color}`}>{config.label}</p>
        <p className="text-[9px] text-gray-400">Quality Score</p>
      </div>
    </div>
  );
}
