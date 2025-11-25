'use client';

import { DollarSign, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';

interface ROISummaryProps {
  roiData: {
    date_start: string;
    date_stop: string;
    total_ad_spend: number;
    total_recovered_value: number;
    total_carts: number;
    total_recovered_carts: number;
    overall_roi: number;
    overall_roas: number;
    overall_recovery_rate: number;
  };
}

export function ROISummary({ roiData }: ROISummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const profit = roiData.total_recovered_value - roiData.total_ad_spend;
  const isPositiveROI = roiData.overall_roi > 0;

  return (
    <div className="space-y-4">
      {/* Card Principal de ROI */}
      <div className={`rounded-lg border-2 p-6 ${
        isPositiveROI
          ? 'border-green-200 bg-gradient-to-br from-green-50 to-white'
          : 'border-red-200 bg-gradient-to-br from-red-50 to-white'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-600">ROI Real da Campanha</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <p className={`text-4xl font-bold ${isPositiveROI ? 'text-green-700' : 'text-red-700'}`}>
                {isPositiveROI ? '+' : ''}{roiData.overall_roi.toFixed(1)}%
              </p>
              {isPositiveROI ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
            <p className="mt-2 text-sm text-gray-700">
              {isPositiveROI
                ? `Você lucrou ${formatCurrency(profit)} com suas campanhas!`
                : `Você teve prejuízo de ${formatCurrency(Math.abs(profit))} nas campanhas.`
              }
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-gray-600">ROAS</p>
            <p className={`mt-1 text-3xl font-bold ${isPositiveROI ? 'text-green-700' : 'text-red-700'}`}>
              {roiData.overall_roas.toFixed(2)}x
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Para cada R$ 1 gasto<br />você recuperou {formatCurrency(roiData.overall_roas)}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Gasto em Ads */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-900">Gasto em Ads</p>
              <p className="mt-1 text-2xl font-bold text-red-700">
                {formatCurrency(roiData.total_ad_spend)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Receita Recuperada */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-900">Receita Recuperada</p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {formatCurrency(roiData.total_recovered_value)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Carrinhos Recuperados */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-900">Carrinhos Recuperados</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {roiData.total_recovered_carts} / {roiData.total_carts}
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                Taxa: {roiData.overall_recovery_rate.toFixed(1)}%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
