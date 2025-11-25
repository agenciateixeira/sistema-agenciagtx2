'use client';

import { TrendingUp, TrendingDown, ShoppingCart, DollarSign } from 'lucide-react';

interface CampaignROI {
  campaign_name: string;
  utm_campaign: string;
  ad_spend: number;
  total_carts: number;
  recovered_carts: number;
  recovered_value: number;
  roi_percentage: number;
  roas: number;
  recovery_rate: number;
}

interface ROICampaignsTableProps {
  campaigns: CampaignROI[];
}

export function ROICampaignsTable({ campaigns }: ROICampaignsTableProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Nenhuma campanha com carrinhos abandonados encontrada
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getROIBadge = (roi: number) => {
    if (roi > 50) {
      return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
        <TrendingUp className="h-3 w-3" />
        +{roi.toFixed(1)}%
      </span>;
    } else if (roi > 0) {
      return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        <TrendingUp className="h-3 w-3" />
        +{roi.toFixed(1)}%
      </span>;
    } else if (roi > -20) {
      return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
        <TrendingDown className="h-3 w-3" />
        {roi.toFixed(1)}%
      </span>;
    } else {
      return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
        <TrendingDown className="h-3 w-3" />
        {roi.toFixed(1)}%
      </span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                Campanha
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Gasto em Ads
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Carrinhos
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Recuperados
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Receita
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                ROAS
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                ROI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map((campaign, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {campaign.campaign_name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      utm_campaign={campaign.utm_campaign}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-semibold text-red-700">
                    {formatCurrency(campaign.ad_spend)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm text-gray-700">
                    {campaign.total_carts}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-sm font-semibold text-blue-700">
                      {campaign.recovered_carts}
                    </p>
                    {campaign.recovery_rate > 0 && (
                      <span className="text-xs text-gray-500">
                        ({campaign.recovery_rate.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-semibold text-green-700">
                    {formatCurrency(campaign.recovered_value)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {campaign.roas.toFixed(2)}x
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  {getROIBadge(campaign.roi_percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-900 mb-2">📊 Como interpretar:</p>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>
            <strong>ROAS (Return on Ad Spend):</strong> Para cada R$ 1 gasto, quanto você recuperou.
            Exemplo: 2.5x = R$ 2,50 recuperado para cada R$ 1 gasto.
          </li>
          <li>
            <strong>ROI (Return on Investment):</strong> Lucro percentual.
            Exemplo: +150% = você lucrou 1,5x o valor investido.
          </li>
          <li>
            <strong className="text-green-700">Verde:</strong> Campanha lucrativa! Continue investindo.
          </li>
          <li>
            <strong className="text-red-700">Vermelho:</strong> Campanha com prejuízo. Revise a estratégia ou pause.
          </li>
        </ul>
      </div>
    </div>
  );
}
