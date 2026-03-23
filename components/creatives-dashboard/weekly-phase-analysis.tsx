'use client';

interface WeeklyPhase {
  week: number;
  label: string;
  date_start: string;
  date_end: string;
  days: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  frequency: number;
  cost_per_result: number;
}

interface WeeklyPhaseAnalysisProps {
  phases: WeeklyPhase[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function getChangeIndicator(current: number, previous: number, invertColor = false) {
  if (previous === 0) return { pct: 0, color: 'text-gray-500', arrow: '' };
  const pct = ((current - previous) / previous) * 100;
  const isPositive = pct > 0;
  const color = invertColor
    ? (isPositive ? 'text-red-600' : 'text-green-600')
    : (isPositive ? 'text-green-600' : 'text-red-600');
  const arrow = isPositive ? '↑' : pct < 0 ? '↓' : '';
  return { pct, color, arrow };
}

export function WeeklyPhaseAnalysis({ phases }: WeeklyPhaseAnalysisProps) {
  if (phases.length < 2) {
    return <p className="py-8 text-center text-sm text-gray-400">Dados insuficientes para análise semanal (mínimo 2 semanas)</p>;
  }

  // Detect overall trend
  const first = phases[0];
  const last = phases[phases.length - 1];
  const cprChange = first.cost_per_result > 0 && last.cost_per_result > 0
    ? ((last.cost_per_result - first.cost_per_result) / first.cost_per_result) * 100
    : 0;

  const isGettingExpensive = cprChange > 20;
  const isGettingCheaper = cprChange < -20;

  return (
    <div className="space-y-4">
      {/* Trend summary */}
      {(first.cost_per_result > 0 || last.cost_per_result > 0) && (
        <div className={`rounded-lg border p-3 ${
          isGettingExpensive ? 'border-red-200 bg-red-50' : isGettingCheaper ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <p className={`text-sm font-bold ${
            isGettingExpensive ? 'text-red-700' : isGettingCheaper ? 'text-green-700' : 'text-gray-700'
          }`}>
            {isGettingExpensive
              ? `Custo por resultado subiu ${Math.abs(cprChange).toFixed(0)}% da Sem 1 para Sem ${phases.length}`
              : isGettingCheaper
              ? `Custo por resultado caiu ${Math.abs(cprChange).toFixed(0)}% — criativo otimizando bem!`
              : 'Custo por resultado relativamente estável'}
          </p>
        </div>
      )}

      {/* Weekly breakdown table */}
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">Semana</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">Período</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Gasto</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">CTR</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">CPC</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Freq.</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Conv.</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Custo/Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {phases.map((phase, i) => {
              const prev = i > 0 ? phases[i - 1] : null;
              const ctrChange = prev ? getChangeIndicator(phase.ctr, prev.ctr) : null;
              const cpcChange = prev ? getChangeIndicator(phase.cpc, prev.cpc, true) : null;
              const freqChange = prev ? getChangeIndicator(phase.frequency, prev.frequency, true) : null;
              const cprChangeWeek = prev ? getChangeIndicator(phase.cost_per_result, prev.cost_per_result, true) : null;

              return (
                <tr key={phase.week} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-900">{phase.label}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-500">
                    {phase.date_start.slice(5)} → {phase.date_end.slice(5)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-gray-900">{formatCurrency(phase.spend)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span className="font-medium text-gray-900">{phase.ctr.toFixed(2)}%</span>
                    {ctrChange && (
                      <span className={`ml-1 text-[10px] font-bold ${ctrChange.color}`}>
                        {ctrChange.arrow}{Math.abs(ctrChange.pct).toFixed(0)}%
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span className="font-medium text-gray-900">{formatCurrency(phase.cpc)}</span>
                    {cpcChange && (
                      <span className={`ml-1 text-[10px] font-bold ${cpcChange.color}`}>
                        {cpcChange.arrow}{Math.abs(cpcChange.pct).toFixed(0)}%
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span className={`font-medium ${phase.frequency >= 3.5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {phase.frequency.toFixed(1)}x
                    </span>
                    {freqChange && (
                      <span className={`ml-1 text-[10px] font-bold ${freqChange.color}`}>
                        {freqChange.arrow}{Math.abs(freqChange.pct).toFixed(0)}%
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-gray-900">
                    {formatNumber(phase.conversions)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span className="font-medium text-gray-900">
                      {phase.cost_per_result > 0 ? formatCurrency(phase.cost_per_result) : '-'}
                    </span>
                    {cprChangeWeek && phase.cost_per_result > 0 && (
                      <span className={`ml-1 text-[10px] font-bold ${cprChangeWeek.color}`}>
                        {cprChangeWeek.arrow}{Math.abs(cprChangeWeek.pct).toFixed(0)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
