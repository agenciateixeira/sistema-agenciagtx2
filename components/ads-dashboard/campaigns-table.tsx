'use client';

import { CheckCircle, XCircle, Pause, AlertCircle } from 'lucide-react';

interface CampaignInsights {
  campaign_id: string;
  campaign_name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  conversions?: number;
  roas?: number;
}

interface CampaignsTableProps {
  campaigns: CampaignInsights[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Nenhuma campanha encontrada
      </div>
    );
  }

  // Ordenar por gasto (maior primeiro)
  const sortedCampaigns = [...campaigns].sort((a, b) => b.spend - a.spend);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, {
      icon: typeof CheckCircle;
      text: string;
      className: string;
    }> = {
      ACTIVE: {
        icon: CheckCircle,
        text: 'Ativa',
        className: 'bg-green-100 text-green-800',
      },
      PAUSED: {
        icon: Pause,
        text: 'Pausada',
        className: 'bg-yellow-100 text-yellow-800',
      },
      ARCHIVED: {
        icon: XCircle,
        text: 'Arquivada',
        className: 'bg-gray-100 text-gray-800',
      },
    };

    const config = statusConfig[status] || {
      icon: AlertCircle,
      text: status,
      className: 'bg-gray-100 text-gray-800',
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Campanha
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
              Gasto
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
              Impressões
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
              Cliques
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
              CPC
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
              CTR
            </th>
            {sortedCampaigns.some(c => c.roas !== undefined) && (
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                ROAS
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedCampaigns.map((campaign) => (
            <tr
              key={campaign.campaign_id}
              className="hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">
                <div className="max-w-xs">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {campaign.campaign_name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {campaign.campaign_id}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                {getStatusBadge(campaign.status)}
              </td>
              <td className="px-4 py-3 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(campaign.spend)}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <p className="text-sm text-gray-700">
                  {campaign.impressions.toLocaleString('pt-BR')}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <p className="text-sm text-gray-700">
                  {campaign.clicks.toLocaleString('pt-BR')}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <p className="text-sm text-gray-700">
                  {formatCurrency(campaign.cpc)}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <p className="text-sm text-gray-700">
                  {campaign.ctr.toFixed(2)}%
                </p>
              </td>
              {sortedCampaigns.some(c => c.roas !== undefined) && (
                <td className="px-4 py-3 text-right">
                  {campaign.roas ? (
                    <p className="text-sm font-semibold text-green-700">
                      {campaign.roas.toFixed(2)}x
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">-</p>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totais */}
      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-600">Total Gasto</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatCurrency(sortedCampaigns.reduce((sum, c) => sum + c.spend, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Impressões</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {sortedCampaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Cliques</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {sortedCampaigns.reduce((sum, c) => sum + c.clicks, 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">CTR Médio</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {(sortedCampaigns.reduce((sum, c) => sum + c.ctr, 0) / sortedCampaigns.length).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
