'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye, ShoppingCart, Loader2 } from 'lucide-react';

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  status: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpm: number;
  cpc: number;
  recovered_carts?: number;
  recovered_value?: number;
  roi_percentage?: number;
  roas?: number;
}

interface CampaignsTabProps {
  userId: string;
}

export function CampaignsTab({ userId }: CampaignsTabProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState<'last_7d' | 'last_30d'>('last_7d');

  useEffect(() => {
    loadCampaigns();
  }, [datePreset]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meta/roi?date_preset=${datePreset}`);
      if (!response.ok) throw new Error('Failed to load campaigns');

      const data = await response.json();

      if (data.campaigns && data.campaigns.length > 0) {
        setCampaigns(data.campaigns);
        setSelectedCampaign(data.campaigns[0]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <Target className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-base font-semibold text-gray-900">
          Nenhuma campanha encontrada
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Crie campanhas no Meta Ads Manager para visualizar dados aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtro de período */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard por Campanha</h2>
          <p className="text-sm text-gray-600">Análise detalhada de cada campanha</p>
        </div>

        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value as 'last_7d' | 'last_30d')}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="last_7d">Últimos 7 dias</option>
          <option value="last_30d">Últimos 30 dias</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Campanhas */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Campanhas ({campaigns.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.campaign_id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`w-full p-4 text-left transition hover:bg-gray-50 ${
                    selectedCampaign?.campaign_id === campaign.campaign_id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : ''
                  }`}
                >
                  <p className="font-medium text-gray-900 line-clamp-2">{campaign.campaign_name}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                      campaign.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status}
                    </span>
                    <span>R$ {campaign.spend.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detalhes da Campanha Selecionada */}
        <div className="lg:col-span-2">
          {selectedCampaign && (
            <div className="space-y-6">
              {/* Nome da campanha */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedCampaign.campaign_name}</h3>
                    <p className="mt-1 text-sm text-gray-600">ID: {selectedCampaign.campaign_id}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    selectedCampaign.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedCampaign.status}
                  </span>
                </div>
              </div>

              {/* Métricas de Anúncios */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Métricas de Anúncios</h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Impressões</p>
                        <p className="text-lg font-bold text-gray-900">{selectedCampaign.impressions.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <MousePointerClick className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Cliques</p>
                        <p className="text-lg font-bold text-gray-900">{selectedCampaign.clicks.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <DollarSign className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Investimento</p>
                        <p className="text-lg font-bold text-gray-900">R$ {selectedCampaign.spend.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="text-xs text-gray-600">CTR</p>
                      <p className="text-lg font-bold text-gray-900">{selectedCampaign.ctr.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="text-xs text-gray-600">CPM</p>
                      <p className="text-lg font-bold text-gray-900">R$ {selectedCampaign.cpm.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="text-xs text-gray-600">CPC</p>
                      <p className="text-lg font-bold text-gray-900">R$ {selectedCampaign.cpc.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI e Conversões */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">ROI e Conversões</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-900">Carrinhos Recuperados</p>
                        <p className="text-lg font-bold text-green-700">{selectedCampaign.recovered_carts || 0}</p>
                        <p className="text-xs text-green-700">R$ {(selectedCampaign.recovered_value || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg border p-4 ${
                    (selectedCampaign.roi_percentage || 0) >= 0
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        (selectedCampaign.roi_percentage || 0) >= 0
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {(selectedCampaign.roi_percentage || 0) >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs ${
                          (selectedCampaign.roi_percentage || 0) >= 0
                            ? 'text-green-900'
                            : 'text-red-900'
                        }`}>ROI</p>
                        <p className={`text-lg font-bold ${
                          (selectedCampaign.roi_percentage || 0) >= 0
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          {(selectedCampaign.roi_percentage || 0).toFixed(1)}%
                        </p>
                        <p className={`text-xs ${
                          (selectedCampaign.roi_percentage || 0) >= 0
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          ROAS: {(selectedCampaign.roas || 0).toFixed(2)}x
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerta se não tiver conversões */}
              {(selectedCampaign.recovered_carts || 0) === 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Nenhuma conversão rastreada.</strong> Certifique-se de usar UTMs corretas nos links dos anúncios para rastrear o ROI.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
