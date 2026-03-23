'use client';

import { DollarSign, ShoppingCart, TrendingUp, Receipt } from 'lucide-react';

interface KPICardsRowProps {
  investimentoTotal: number;
  investimentoCampanhas: number;
  pedidosReais: number;
  cpaReal: number;
  roasReal: number | null;
  metaReportaRoas: number | null;
  receitaReal: number;
  ticketMedio: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function KPICardsRow({
  investimentoTotal,
  investimentoCampanhas,
  pedidosReais,
  cpaReal,
  roasReal,
  metaReportaRoas,
  receitaReal,
  ticketMedio,
}: KPICardsRowProps) {
  const cards = [
    {
      icon: DollarSign,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Investimento Total',
      value: formatCurrency(investimentoTotal),
      subtitle: `${investimentoCampanhas} campanhas`,
    },
    {
      icon: ShoppingCart,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Pedidos Reais',
      value: String(pedidosReais),
      subtitle: `CPA Real: ${formatCurrency(cpaReal)}`,
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'ROAS Real',
      value: roasReal ? `${roasReal.toFixed(1)}x` : '--',
      subtitle: metaReportaRoas ? `Meta reporta: ${metaReportaRoas.toFixed(1)}x` : '',
    },
    {
      icon: Receipt,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Receita Real',
      value: formatCurrency(receitaReal),
      subtitle: `Ticket médio: ${formatCurrency(ticketMedio)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                {card.subtitle && (
                  <p className="mt-0.5 text-[10px] text-gray-500">{card.subtitle}</p>
                )}
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
