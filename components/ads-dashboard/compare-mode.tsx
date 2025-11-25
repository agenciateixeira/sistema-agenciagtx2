'use client';

import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

interface CompareModeProps {
  userId: string;
  availableAccounts: any[];
  datePreset: string;
}

export function CompareMode({ userId, availableAccounts, datePreset }: CompareModeProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accountsData, setAccountsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAccounts.length > 0) {
      fetchCompareData();
    }
  }, [selectedAccounts, datePreset]);

  const fetchCompareData = async () => {
    setLoading(true);
    const promises = selectedAccounts.map(async (accountId) => {
      try {
        // Temporariamente salvar como primary para buscar dados
        const response = await fetch(
          `/api/meta/insights?user_id=${userId}&type=account&date_preset=${datePreset}`
        );
        if (response.ok) {
          const data = await response.json();
          const account = availableAccounts.find(
            (acc) => (acc.account_id || acc.id.replace('act_', '')) === accountId
          );
          return {
            accountId,
            accountName: account?.name || accountId,
            data: data.data,
          };
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    setAccountsData(results.filter((r) => r !== null));
    setLoading(false);
  };

  const toggleAccount = (accountId: string) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter((id) => id !== accountId));
    } else if (selectedAccounts.length < 3) {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Contas */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Selecione até 3 contas para comparar:
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableAccounts.map((account) => {
            const accountId = account.account_id || account.id.replace('act_', '');
            const isSelected = selectedAccounts.includes(accountId);
            return (
              <button
                key={account.id}
                onClick={() => toggleAccount(accountId)}
                disabled={!isSelected && selectedAccounts.length >= 3}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 disabled:opacity-50'
                }`}
              >
                {account.name}
                {isSelected && <X className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Comparação */}
      {!loading && accountsData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accountsData.map((account) => (
            <div
              key={account.accountId}
              className="rounded-lg border-2 border-gray-200 bg-white p-4"
            >
              <h4 className="mb-4 font-semibold text-gray-900">{account.accountName}</h4>

              {account.data ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Gasto Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(account.data.spend)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Cliques</p>
                    <p className="text-lg font-bold text-gray-900">
                      {account.data.clicks.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">CTR</p>
                    <p className="text-lg font-bold text-gray-900">
                      {account.data.ctr.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">CPC Médio</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(account.data.cpc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Impressões</p>
                    <p className="text-lg font-bold text-gray-900">
                      {account.data.impressions.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sem dados para este período</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && selectedAccounts.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">
            Selecione pelo menos uma conta para começar a comparação.
          </p>
        </div>
      )}
    </div>
  );
}
