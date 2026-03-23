'use client';

import { useState, useEffect } from 'react';
import { useMetaAccount } from '@/contexts/meta-account-context';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle, DollarSign, MousePointerClick, Eye, TrendingUp, PieChart } from 'lucide-react';
import { MetricCard } from './metric-card';

interface ConsolidatedModeImprovedProps {
  userId: string;
  datePreset: string;
}

export function ConsolidatedModeImproved({ userId, datePreset }: ConsolidatedModeImprovedProps) {
  const { accounts } = useMetaAccount();
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [accountsBreakdown, setAccountsBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsolidatedInsights();
  }, [datePreset]);

  const fetchConsolidatedInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar insights de todas as contas
      const promises = accounts.map(async (account) => {
        const accountId = account.account_id || account.id;
        const response = await fetch(
          `/api/meta/insights?user_id=${userId}&account_id=${accountId}&type=account&date_preset=${datePreset}`
        );

        if (!response.ok) throw new Error(`Failed to fetch data for account ${accountId}`);

        const data = await response.json();
        return {
          accountId,
          accountName: account.name,
          insights: data.data,
        };
      });

      const results = await Promise.all(promises);
      setAccountsBreakdown(results);

      // Consolidar dados
      const consolidated = results.reduce(
        (acc, current) => {
          const insights = current.insights;
          return {
            spend: (acc.spend || 0) + (insights.spend || 0),
            impressions: (acc.impressions || 0) + (insights.impressions || 0),
            clicks: (acc.clicks || 0) + (insights.clicks || 0),
            reach: (acc.reach || 0) + (insights.reach || 0),
            conversion_value: (acc.conversion_value || 0) + (insights.conversion_value || 0),
          };
        },
        {
          spend: 0,
          impressions: 0,
          clicks: 0,
          reach: 0,
          conversion_value: 0,
        }
      );

      // Calcular métricas derivadas
      consolidated.cpc = consolidated.clicks > 0 ? consolidated.spend / consolidated.clicks : 0;
      consolidated.cpm = consolidated.impressions > 0 ? (consolidated.spend / consolidated.impressions) * 1000 : 0;
      consolidated.ctr = consolidated.impressions > 0 ? (consolidated.clicks / consolidated.impressions) * 100 : 0;
      consolidated.roas = consolidated.spend > 0 ? consolidated.conversion_value / consolidated.spend : 0;

      setConsolidatedData(consolidated);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao buscar dados consolidados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-600" />
          <p className="mt-4 text-sm text-gray-600">Consolidando dados de todas as contas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Erro ao carregar dados consolidados</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchConsolidatedInsights}
              className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-800"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!consolidatedData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">
              📊 Visão Consolidada
            </h3>
            <p className="mt-1 text-sm text-purple-700">
              Performance agregada de {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
            </p>
          </div>
          <div className="rounded-lg bg-purple-100 px-3 py-1">
            <p className="text-sm font-semibold text-purple-900">
              {accounts.length} Contas
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Consolidadas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gasto Total"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(consolidatedData.spend)}
          subtitle={`${consolidatedData.impressions.toLocaleString('pt-BR')} impressões`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />

        <MetricCard
          title="Cliques Totais"
          value={consolidatedData.clicks.toLocaleString('pt-BR')}
          subtitle={`CTR: ${consolidatedData.ctr.toFixed(2)}%`}
          icon={MousePointerClick}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        <MetricCard
          title="CPC Médio"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(consolidatedData.cpc)}
          subtitle={`CPM: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(consolidatedData.cpm)}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />

        <MetricCard
          title="Alcance Total"
          value={consolidatedData.reach.toLocaleString('pt-BR')}
          subtitle={`${accounts.length} contas somadas`}
          icon={Eye}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* ROAS Consolidado */}
      {consolidatedData.roas && consolidatedData.roas > 0 && (
        <div className="rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900">
                ROAS Consolidado
              </p>
              <p className="mt-2 text-4xl font-bold text-green-700">
                {consolidatedData.roas.toFixed(2)}x
              </p>
              <p className="mt-2 text-sm text-green-700">
                Retorno médio de todas as contas combinadas
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-green-700">
                Conversões Totais
              </p>
              <p className="mt-1 text-2xl font-bold text-green-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(consolidatedData.conversion_value)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Distribuição por Conta */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Distribuição de Gasto por Conta
          </h3>
        </div>

        <div className="space-y-4">
          {accountsBreakdown
            .sort((a, b) => b.insights.spend - a.insights.spend)
            .map((account, index) => {
              const percentage = consolidatedData.spend > 0
                ? (account.insights.spend / consolidatedData.spend) * 100
                : 0;

              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-purple-500',
                'bg-orange-500',
                'bg-pink-500',
                'bg-indigo-500',
                'bg-teal-500',
                'bg-red-500',
              ];

              const barColor = colors[index % colors.length];

              return (
                <div key={account.accountId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${barColor}`} />
                      <span className="font-medium text-gray-900">
                        {account.accountName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(account.insights.spend)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100">
                    <div
                      className={`h-3 rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Conta
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Gasto
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Impressões
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Cliques
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  CPC
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  CTR
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {accountsBreakdown.map((account) => {
                const insights = account.insights;
                return (
                  <tr key={account.accountId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {account.accountName}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(insights.spend || 0)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {(insights.impressions || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {(insights.clicks || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(insights.cpc || 0)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {(insights.ctr || 0).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {insights.roas ? `${insights.roas.toFixed(2)}x` : '-'}
                    </td>
                  </tr>
                );
              })}
              {/* Linha de Total */}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(consolidatedData.spend)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {consolidatedData.impressions.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {consolidatedData.clicks.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(consolidatedData.cpc)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {consolidatedData.ctr.toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {consolidatedData.roas ? `${consolidatedData.roas.toFixed(2)}x` : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
