'use client';

import { Thermometer } from 'lucide-react';

interface AccountTemperatureProps {
  cpaReal: number;
  cpaTarget: number;
  frequency: number;
  ctr: number;
  roas: number | null;
}

function calculateTemperature(
  cpaReal: number,
  cpaTarget: number,
  frequency: number,
  ctr: number,
): { temp: number; status: 'Normal' | 'Atenção' | 'Quente' | 'Crítico'; color: string } {
  let temp = 36.0;

  // CPA acima do alvo aquece
  if (cpaTarget > 0 && cpaReal > 0) {
    const cpaRatio = cpaReal / cpaTarget;
    if (cpaRatio > 2) temp += 4;
    else if (cpaRatio > 1.5) temp += 2.5;
    else if (cpaRatio > 1.2) temp += 1.5;
    else if (cpaRatio > 1) temp += 0.5;
    else temp -= 0.5; // CPA abaixo do alvo esfria
  }

  // Frequência alta aquece
  if (frequency > 4) temp += 2;
  else if (frequency > 3) temp += 1;
  else if (frequency > 2.5) temp += 0.5;

  // CTR baixo aquece
  if (ctr < 0.5) temp += 1.5;
  else if (ctr < 1) temp += 0.5;

  temp = Math.max(34, Math.min(42, temp));

  let status: 'Normal' | 'Atenção' | 'Quente' | 'Crítico';
  let color: string;

  if (temp <= 36.5) {
    status = 'Normal';
    color = 'text-green-500';
  } else if (temp <= 37.5) {
    status = 'Atenção';
    color = 'text-yellow-500';
  } else if (temp <= 39) {
    status = 'Quente';
    color = 'text-orange-500';
  } else {
    status = 'Crítico';
    color = 'text-red-500';
  }

  return { temp: Math.round(temp * 10) / 10, status, color };
}

export function AccountTemperature({
  cpaReal,
  cpaTarget,
  frequency,
  ctr,
  roas,
}: AccountTemperatureProps) {
  const { temp, status, color } = calculateTemperature(cpaReal, cpaTarget, frequency, ctr);

  // Progress bar position (34-42 mapped to 0-100%)
  const progress = ((temp - 34) / 8) * 100;

  // Gradient based on temperature
  const getBarColor = () => {
    if (temp <= 36.5) return 'bg-green-400';
    if (temp <= 37.5) return 'bg-yellow-400';
    if (temp <= 39) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <Thermometer className={`h-5 w-5 ${color}`} />
        <span className={`text-lg font-bold ${color}`}>
          {temp.toFixed(1)}°C
        </span>
        <span className={`text-sm font-medium ${color}`}>
          {status}
        </span>
      </div>

      {/* Temperature bar */}
      <div className="flex-1">
        <div className="h-2 rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Additional info */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span>Teto Escala</span>
          <span className="font-medium text-gray-700">
            {cpaTarget > 0 ? `R$ ${cpaTarget.toFixed(0)}` : '--'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>Atribuição</span>
          <span className="font-medium text-gray-700">
            Last Click (1x)
          </span>
          <span className="ml-1 text-gray-400">▸ 4%</span>
        </div>
        {roas && (
          <div className="flex items-center gap-1">
            <span>ROAS</span>
            <span className="font-medium text-gray-700">{roas.toFixed(1)}x</span>
          </div>
        )}
      </div>
    </div>
  );
}
