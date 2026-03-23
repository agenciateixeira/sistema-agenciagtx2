'use client';

interface CTAAnalysisProps {
  creatives: any[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('pt-BR').format(value);
}

const ctaLabels: Record<string, string> = {
  LEARN_MORE: 'Saiba Mais',
  SHOP_NOW: 'Compre Agora',
  SIGN_UP: 'Cadastre-se',
  SUBSCRIBE: 'Inscreva-se',
  CONTACT_US: 'Fale Conosco',
  DOWNLOAD: 'Baixar',
  GET_OFFER: 'Obter Oferta',
  BOOK_TRAVEL: 'Reservar',
  WATCH_MORE: 'Assistir Mais',
  SEND_MESSAGE: 'Enviar Mensagem',
  WHATSAPP_MESSAGE: 'WhatsApp',
  CALL_NOW: 'Ligar Agora',
  APPLY_NOW: 'Aplicar Agora',
  BUY_NOW: 'Comprar',
  GET_QUOTE: 'Solicitar Orçamento',
  NO_BUTTON: 'Sem CTA',
  ORDER_NOW: 'Pedir Agora',
  OPEN_LINK: 'Abrir Link',
};

interface CTAGroup {
  cta: string;
  label: string;
  count: number;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCostPerResult: number;
  avgQualityScore: number;
}

export function CTAAnalysis({ creatives }: CTAAnalysisProps) {
  const creativesWithInsights = creatives.filter(c => c.insights);

  if (creativesWithInsights.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Sem dados para análise de CTA</p>;
  }

  // Group by CTA
  const groups = new Map<string, CTAGroup>();

  for (const c of creativesWithInsights) {
    const cta = c.call_to_action || 'NO_BUTTON';
    const ins = c.insights;

    if (!groups.has(cta)) {
      groups.set(cta, {
        cta,
        label: ctaLabels[cta] || cta.replace(/_/g, ' '),
        count: 0,
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        avgCtr: 0,
        avgCpc: 0,
        avgCostPerResult: 0,
        avgQualityScore: 0,
      });
    }

    const group = groups.get(cta)!;
    group.count++;
    group.totalSpend += ins.spend;
    group.totalImpressions += ins.impressions;
    group.totalClicks += ins.clicks;
    group.totalConversions += ins.conversions;
    group.avgQualityScore += c.quality_score || 0;
  }

  // Calculate averages
  const ctaGroups = Array.from(groups.values()).map(g => ({
    ...g,
    avgCtr: g.totalImpressions > 0 ? (g.totalClicks / g.totalImpressions) * 100 : 0,
    avgCpc: g.totalClicks > 0 ? g.totalSpend / g.totalClicks : 0,
    avgCostPerResult: g.totalConversions > 0 ? g.totalSpend / g.totalConversions : 0,
    avgQualityScore: g.count > 0 ? g.avgQualityScore / g.count : 0,
  })).sort((a, b) => b.totalSpend - a.totalSpend);

  if (ctaGroups.length <= 1) {
    return <p className="py-8 text-center text-sm text-gray-400">Apenas um tipo de CTA encontrado — sem comparação possível</p>;
  }

  // Find best CTA by CTR
  const bestCtrCta = [...ctaGroups].sort((a, b) => b.avgCtr - a.avgCtr)[0];
  // Find best CTA by cost per result (only those with conversions)
  const withConv = ctaGroups.filter(g => g.totalConversions > 0);
  const bestCprCta = withConv.length > 0 ? withConv.sort((a, b) => a.avgCostPerResult - b.avgCostPerResult)[0] : null;

  return (
    <div className="space-y-4">
      {/* Highlights */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-[10px] font-medium uppercase text-green-600">Melhor CTR</p>
          <p className="text-sm font-bold text-green-700">{bestCtrCta.label}</p>
          <p className="text-xs text-green-600">CTR: {bestCtrCta.avgCtr.toFixed(2)}% · {bestCtrCta.count} criativos</p>
        </div>
        {bestCprCta && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-[10px] font-medium uppercase text-blue-600">Menor Custo por Resultado</p>
            <p className="text-sm font-bold text-blue-700">{bestCprCta.label}</p>
            <p className="text-xs text-blue-600">CPR: {formatCurrency(bestCprCta.avgCostPerResult)} · {bestCprCta.totalConversions} conv.</p>
          </div>
        )}
      </div>

      {/* CTA comparison table */}
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase text-gray-500">CTA</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Qtd</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Gasto</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">CTR</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">CPC</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Conv.</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">CPR</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold uppercase text-gray-500">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ctaGroups.map((g) => (
              <tr key={g.cta} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {g.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-gray-600">{g.count}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-gray-900">{formatCurrency(g.totalSpend)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  <span className={`font-medium ${g.avgCtr >= 1.5 ? 'text-green-600' : g.avgCtr < 0.8 ? 'text-red-600' : 'text-gray-900'}`}>
                    {g.avgCtr.toFixed(2)}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-gray-900">{formatCurrency(g.avgCpc)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-gray-900">{formatNumber(g.totalConversions)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-gray-900">
                  {g.avgCostPerResult > 0 ? formatCurrency(g.avgCostPerResult) : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    g.avgQualityScore >= 6 ? 'bg-green-100 text-green-700'
                    : g.avgQualityScore >= 4 ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {g.avgQualityScore.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
