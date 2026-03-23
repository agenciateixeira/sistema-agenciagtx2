'use client';

interface FatigueSummaryProps {
  counts: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  total: number;
}

export function FatigueSummary({ counts, total }: FatigueSummaryProps) {
  if (total === 0) return null;

  const items = [
    { label: 'Saudável', count: counts.low, color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
    { label: 'Atenção', count: counts.medium, color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    { label: 'Fadiga Alta', count: counts.high, color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
    { label: 'Crítico', count: counts.critical, color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Saúde dos Criativos</h3>
      <p className="mt-1 text-xs text-gray-500">
        Análise de fadiga baseada em frequência, CTR, CPC e CPM
      </p>

      {/* Barra de progresso empilhada */}
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {items.map((item) => (
          item.count > 0 && (
            <div
              key={item.label}
              className={`${item.color} transition-all`}
              style={{ width: `${(item.count / total) * 100}%` }}
              title={`${item.label}: ${item.count}`}
            />
          )
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-lg ${item.bgColor} p-3 text-center`}>
            <p className={`text-xl font-bold ${item.textColor}`}>{item.count}</p>
            <p className="text-[10px] font-medium text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
