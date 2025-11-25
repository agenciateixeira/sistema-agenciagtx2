'use client';

interface DailyInsights {
  date: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions?: number;
}

interface DailyPerformanceChartProps {
  data: DailyInsights[];
}

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  // Ordenar por data
  const sortedData = [...data].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calcular valores máximos para escala
  const maxSpend = Math.max(...sortedData.map(d => d.spend));
  const maxClicks = Math.max(...sortedData.map(d => d.clicks));

  // Dimensões do gráfico
  const width = 100; // porcentagem
  const height = 300;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Função para calcular posição X
  const getX = (index: number) => {
    return padding.left + (index / (sortedData.length - 1)) * chartWidth;
  };

  // Função para calcular posição Y (para gasto)
  const getYSpend = (value: number) => {
    return padding.top + chartHeight - (value / maxSpend) * chartHeight;
  };

  // Função para calcular posição Y (para cliques)
  const getYClicks = (value: number) => {
    return padding.top + chartHeight - (value / maxClicks) * chartHeight;
  };

  // Gerar path para linha de gasto
  const spendPath = sortedData.map((d, i) => {
    const x = getX(i);
    const y = getYSpend(d.spend);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Gerar path para linha de cliques
  const clicksPath = sortedData.map((d, i) => {
    const x = getX(i);
    const y = getYClicks(d.clicks);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Formatar data (dia/mês)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Mostrar apenas algumas labels no eixo X para não ficar poluído
  const xLabelInterval = Math.ceil(sortedData.length / 6);

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">Gasto (R$)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-600">Cliques</span>
        </div>
      </div>

      {/* Gráfico SVG Responsivo */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ minWidth: '600px' }}
        >
          {/* Grid horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.2"
                  strokeDasharray="1,1"
                />
              </g>
            );
          })}

          {/* Eixo Y esquerdo (Gasto) */}
          <text
            x={padding.left - 5}
            y={padding.top - 5}
            fontSize="2.5"
            fill="#10b981"
            textAnchor="end"
            className="font-medium"
          >
            R$ {maxSpend.toFixed(0)}
          </text>
          <text
            x={padding.left - 5}
            y={padding.top + chartHeight + 2}
            fontSize="2.5"
            fill="#10b981"
            textAnchor="end"
          >
            R$ 0
          </text>

          {/* Eixo Y direito (Cliques) */}
          <text
            x={padding.left + chartWidth + 5}
            y={padding.top - 5}
            fontSize="2.5"
            fill="#3b82f6"
            textAnchor="start"
            className="font-medium"
          >
            {maxClicks} cliques
          </text>
          <text
            x={padding.left + chartWidth + 5}
            y={padding.top + chartHeight + 2}
            fontSize="2.5"
            fill="#3b82f6"
            textAnchor="start"
          >
            0
          </text>

          {/* Linha de Gasto */}
          <path
            d={spendPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Linha de Cliques */}
          <path
            d={clicksPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pontos de Gasto */}
          {sortedData.map((d, i) => (
            <circle
              key={`spend-${i}`}
              cx={getX(i)}
              cy={getYSpend(d.spend)}
              r="0.8"
              fill="#10b981"
            >
              <title>{`${formatDate(d.date)}: R$ ${d.spend.toFixed(2)}`}</title>
            </circle>
          ))}

          {/* Pontos de Cliques */}
          {sortedData.map((d, i) => (
            <circle
              key={`clicks-${i}`}
              cx={getX(i)}
              cy={getYClicks(d.clicks)}
              r="0.8"
              fill="#3b82f6"
            >
              <title>{`${formatDate(d.date)}: ${d.clicks} cliques`}</title>
            </circle>
          ))}

          {/* Labels do eixo X (datas) */}
          {sortedData.map((d, i) => {
            if (i % xLabelInterval !== 0 && i !== sortedData.length - 1) return null;
            return (
              <text
                key={`label-${i}`}
                x={getX(i)}
                y={padding.top + chartHeight + 8}
                fontSize="2"
                fill="#6b7280"
                textAnchor="middle"
              >
                {formatDate(d.date)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-xs text-gray-600">Gasto Total</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(sortedData.reduce((sum, d) => sum + d.spend, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Total de Cliques</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {sortedData.reduce((sum, d) => sum + d.clicks, 0).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Total de Impressões</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {sortedData.reduce((sum, d) => sum + d.impressions, 0).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
