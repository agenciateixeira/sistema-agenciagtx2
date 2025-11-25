'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
}

interface AccountSelectorProps {
  accounts: AdAccount[];
  currentAccountId?: string;
  onSelectAccount: (accountId: string) => void;
}

export function AccountSelector({ accounts, currentAccountId, onSelectAccount }: AccountSelectorProps) {
  const [selectedId, setSelectedId] = useState(currentAccountId || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedId) return;

    setSaving(true);
    try {
      const response = await fetch('/api/meta/set-primary-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_account_id: selectedId }),
      });

      if (!response.ok) throw new Error('Failed to save account');

      onSelectAccount(selectedId);
      window.location.reload();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Erro ao salvar conta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Selecione a Conta de Anúncios Principal
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Você tem {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'} de anúncios. Escolha qual deseja usar como principal para visualizar métricas.
      </p>

      <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => setSelectedId(account.id)}
            className={`w-full rounded-lg border-2 p-4 text-left transition ${
              selectedId === account.id
                ? 'border-blue-500 bg-blue-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{account.name}</p>
                <p className="mt-1 text-xs text-gray-600">ID: {account.id}</p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                    account.account_status === 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {account.account_status === 1 ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="text-gray-500">Moeda: {account.currency}</span>
                </div>
              </div>
              {selectedId === account.id && (
                <Check className="h-5 w-5 flex-shrink-0 text-blue-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          Você pode mudar a conta principal depois nas configurações
        </p>
        <button
          onClick={handleSave}
          disabled={!selectedId || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Confirmar Seleção'
          )}
        </button>
      </div>
    </div>
  );
}
