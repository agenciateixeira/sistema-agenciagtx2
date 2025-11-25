'use client';

import { useState, useEffect } from 'react';
import { Loader2, DollarSign, MousePointerClick, Eye, TrendingUp } from 'lucide-react';

interface ConsolidatedModeProps {
  userId: string;
  availableAccounts: any[];
  datePreset: string;
}

export function ConsolidatedMode({ userId, availableAccounts, datePreset }: ConsolidatedModeProps) {
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsolidatedData();
  }, [datePreset]);

  const fetchConsolidatedData = async () => {
    setLoading(true);

    // Buscar dados de todas as contas
    const promises = availableAccounts.map(async (account) => {
      try {
        const accountId = account.account_id || account.id.replace('act_', '');
        const response = await fetch(
          `/api/meta/insights?user_id=${userId}&type=account&date_preset=${datePreset}`
        );
        if (response.ok) {
          const data = await response.json();
          return data.data;
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validData = results.filter((d) => d !== null);

    if (validData.length > 0) {
      // Consolidar dados
      const consolidated = {
        totalAccounts: validData.length,
        spend: validData.reduce((sum, d) => sum + d.spend, 0),
        clicks: validData.reduce((sum, d) => sum + d.clicks, 0),
        impressions: validData.reduce((sum, d) => sum + d.impressions, 0),
        reach: validData.reduce((sum, d) => sum + d.reach, 0),
        cpc: validData.reduce((sum, d) => sum + d.cpc, 0) / validData.length,
        cpm: validData.reduce((sum, d) => sum + d.cpm, 0) / validData.length,
        ctr: validData.reduce((sum, d) => sum + d.ctr, 0) / validData.length,
        frequency: validData.reduce((sum, d) => sum + d.frequency, 0) / validData.length,
      };

      setConsolidatedData(consolidated);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!consolidatedData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          Nenhum dado encontrado para consolidação.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <h3 className="text-lg font-semibold text-blue-900">
          Relatório Consolidado
        </h3>
        <p className="mt-1 text-sm text-blue-700">
          Soma de {consolidatedData.totalAccounts} {consolidatedData.totalAccounts === 1 ? 'conta' : 'contas'} de anúncios
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Gasto Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(consolidatedData.spend)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {consolidatedData.impressions.toLocaleString('pt-BR')} impressões
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <MousePointerClick className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Cliques Totais</p>
              <p className="text-2xl font-bold text-gray-900">
                {consolidatedData.clicks.toLocaleString('pt-BR')}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                CTR Médio: {consolidatedData.ctr.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">CPC Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(consolidatedData.cpc)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                CPM: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(consolidatedData.cpm)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Alcance Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {consolidatedData.reach.toLocaleString('pt-BR')}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Frequência: {consolidatedData.frequency.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes por Conta */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Contribuição por Conta
        </h3>
        <div className="space-y-2">
          {availableAccounts.map((account) => {
            const accountId = account.account_id || account.id.replace('act_', '');
            return (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <span className="text-sm font-medium text-gray-900">{account.name}</span>
                <span className="text-xs text-gray-500">ID: {accountId}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
