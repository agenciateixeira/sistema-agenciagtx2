'use client';

import { X, TrendingUp, TrendingDown, Eye, MousePointerClick, DollarSign, ShoppingCart, Target } from 'lucide-react';

interface CampaignDetailsProps {
  campaign: any;
  onClose: () => void;
}

export function CampaignDetails({ campaign, onClose }: CampaignDetailsProps) {
  const roi = campaign.roi_percentage || 0;
  const roas = campaign.roas || 0;
  const isPositiveROI = roi >= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-lg border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 p-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{campaign.campaign_name}</h2>
              <p className="mt-1 text-sm text-gray-600">ID: {campaign.campaign_id}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status e Objetivo */}
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                campaign.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {campaign.status}
              </span>
              {campaign.objective && (
                <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  {campaign.objective}
                </span>
              )}
            </div>

            {/* Métricas de Anúncios */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Métricas de Anúncios</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Impressões</p>
                      <p className="text-lg font-bold text-gray-900">
                        {campaign.impressions?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <MousePointerClick className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Cliques</p>
                      <p className="text-lg font-bold text-gray-900">
                        {campaign.clicks?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Investimento</p>
                      <p className="text-lg font-bold text-gray-900">
                        R$ {campaign.spend?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="text-xs text-gray-600">CTR</p>
                    <p className="text-lg font-bold text-gray-900">
                      {campaign.ctr?.toFixed(2) || 0}%
                    </p>
                    <p className="text-xs text-gray-500">
                      CPC: R$ {campaign.cpc?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas Adicionais */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Métricas Adicionais</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-600">CPM</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {campaign.cpm?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {campaign.reach && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-600">Alcance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {campaign.reach.toLocaleString()}
                    </p>
                  </div>
                )}

                {campaign.frequency && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-600">Frequência</p>
                    <p className="text-lg font-bold text-gray-900">
                      {campaign.frequency.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ROI e Conversões */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">ROI e Conversões</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-900">Carrinhos Recuperados</p>
                      <p className="text-lg font-bold text-green-700">
                        {campaign.recovered_carts || 0}
                      </p>
                      <p className="text-xs text-green-700">
                        R$ {(campaign.recovered_value || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${
                  isPositiveROI
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isPositiveROI ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isPositiveROI ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs ${
                        isPositiveROI ? 'text-green-900' : 'text-red-900'
                      }`}>ROI</p>
                      <p className={`text-lg font-bold ${
                        isPositiveROI ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {roi.toFixed(1)}%
                      </p>
                      <p className={`text-xs ${
                        isPositiveROI ? 'text-green-700' : 'text-red-700'
                      }`}>
                        ROAS: {roas.toFixed(2)}x
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta se não tiver conversões */}
            {(campaign.recovered_carts || 0) === 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Nenhuma conversão rastreada.</strong> Certifique-se de usar UTMs corretas nos links dos anúncios para rastrear o ROI.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
