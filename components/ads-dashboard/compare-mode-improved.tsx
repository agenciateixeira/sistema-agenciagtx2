'use client';

import { useState, useEffect } from 'react';
import { useMetaAccount } from '@/contexts/meta-account-context';
import toast from 'react-hot-toast';
import { Check, Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareModeImprovedProps {
  userId: string;
  datePreset: string;
}

export function CompareModeImproved({ userId, datePreset }: CompareModeImprovedProps) {
  const { accounts, compareAccounts, setCompareAccounts } = useMetaAccount();
  const [insightsData, setInsightsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (compareAccounts.length >= 2) {
      fetchCompareInsights();
    }
  }, [compareAccounts, datePreset]);

  const fetchCompareInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const promises = compareAccounts.map(async (accountId) => {
        const response = await fetch(
          `/api/meta/insights?user_id=${userId}&account_id=${accountId}&type=account&date_preset=${datePreset}`
        );

        if (!response.ok) throw new Error(`Failed to fetch data for account ${accountId}`);

        const data = await response.json();
        const account = accounts.find(acc => acc.account_id === accountId || acc.id === accountId);

        return {
          accountId,
          accountName: account?.name || accountId,
          insights: data.data,
        };
      });

      const results = await Promise.all(promises);
      setInsightsData(results);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao buscar dados para comparação');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountSelection = (accountId: string) => {
    if (compareAccounts.includes(accountId)) {
      setCompareAccounts(compareAccounts.filter(id => id !== accountId));
    } else {
      if (compareAccounts.length < 4) {
        setCompareAccounts([...compareAccounts, accountId]);
      } else {
        toast.error('Você pode comparar no máximo 4 contas');
      }
    }
  };

  const metrics = [
    { key: 'spend', label: 'Gasto', format: 'currency' },
    { key: 'impressions', label: 'Impressões', format: 'number' },
    { key: 'clicks', label: 'Cliques', format: 'number' },
    { key: 'cpc', label: 'CPC', format: 'currency' },
    { key: 'cpm', label: 'CPM', format: 'currency' },
    { key: 'ctr', label: 'CTR', format: 'percentage' },
    { key: 'reach', label: 'Alcance', format: 'number' },
    { key: 'frequency', label: 'Frequência', format: 'decimal' },
  ];

  const formatValue = (value: number, format: string) => {
    if (!value && value !== 0) return '-';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      case 'number':
        return value.toLocaleString('pt-BR');
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'decimal':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  const getBestPerformer = (metricKey: string, lowerIsBetter = false) => {
    if (insightsData.length === 0) return null;

    const values = insightsData.map(data => ({
      accountId: data.accountId,
      value: data.insights[metricKey] || 0,
    }));

    if (lowerIsBetter) {
      return values.reduce((min, current) =>
        current.value < min.value && current.value > 0 ? current : min
      );
    } else {
      return values.reduce((max, current) =>
        current.value > max.value ? current : max
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Contas */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Selecione as contas para comparar (2-4)
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const accountId = account.account_id || account.id;
            const isSelected = compareAccounts.includes(accountId);

            return (
              <button
                key={accountId}
                onClick={() => toggleAccountSelection(accountId)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center">
                  <div
                    className={cn(
                      'h-5 w-5 rounded border-2 transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {account.name}
                  </p>
                  <p className="text-xs text-gray-500">ID: {accountId}</p>
                </div>
              </button>
            );
          })}
        </div>

        {compareAccounts.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">
              {compareAccounts.length} {compareAccounts.length === 1 ? 'conta selecionada' : 'contas selecionadas'}
            </p>
            {compareAccounts.length >= 2 && (
              <button
                onClick={fetchCompareInsights}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Comparar Agora
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-600">Carregando comparação...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Erro ao carregar dados</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Comparação */}
      {!loading && !error && insightsData.length >= 2 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Métrica
                  </th>
                  {insightsData.map((data) => (
                    <th
                      key={data.accountId}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700"
                    >
                      <div className="flex flex-col">
                        <span className="truncate">{data.accountName}</span>
                        <span className="text-xs font-normal normal-case text-gray-500">
                          {data.accountId}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metrics.map((metric) => {
                  const bestPerformer = getBestPerformer(
                    metric.key,
                    metric.key === 'cpc' || metric.key === 'cpm'
                  );

                  return (
                    <tr key={metric.key} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium text-gray-900">
                        {metric.label}
                      </td>
                      {insightsData.map((data) => {
                        const value = data.insights[metric.key] || 0;
                        const isBest = bestPerformer?.accountId === data.accountId && value > 0;

                        return (
                          <td
                            key={data.accountId}
                            className={cn(
                              'px-6 py-4 text-sm',
                              isBest
                                ? 'bg-green-50 font-semibold text-green-900'
                                : 'text-gray-900'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {formatValue(value, metric.format)}
                              {isBest && (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights Automáticos */}
      {!loading && !error && insightsData.length >= 2 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">
            💡 Insights Automáticos
          </h3>
          <div className="space-y-2">
            {(() => {
              const bestCPC = getBestPerformer('cpc', true);
              const bestROAS = getBestPerformer('roas', false);
              const bestCTR = getBestPerformer('ctr', false);

              const insights = [];

              if (bestCPC && bestCPC.value > 0) {
                const account = insightsData.find(d => d.accountId === bestCPC.accountId);
                insights.push(
                  <p key="cpc" className="text-sm text-blue-800">
                    ✓ <strong>{account?.accountName}</strong> tem o menor CPC (R$ {bestCPC.value.toFixed(2)})
                  </p>
                );
              }

              if (bestCTR && bestCTR.value > 0) {
                const account = insightsData.find(d => d.accountId === bestCTR.accountId);
                insights.push(
                  <p key="ctr" className="text-sm text-blue-800">
                    ✓ <strong>{account?.accountName}</strong> tem a melhor CTR ({bestCTR.value.toFixed(2)}%)
                  </p>
                );
              }

              if (bestROAS && bestROAS.value > 0) {
                const account = insightsData.find(d => d.accountId === bestROAS.accountId);
                insights.push(
                  <p key="roas" className="text-sm text-blue-800">
                    ✓ <strong>{account?.accountName}</strong> tem o melhor ROAS ({bestROAS.value.toFixed(2)}x)
                  </p>
                );
              }

              return insights.length > 0 ? insights : (
                <p className="text-sm text-blue-800">
                  Selecione pelo menos 2 contas e clique em "Comparar Agora" para ver os insights
                </p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
