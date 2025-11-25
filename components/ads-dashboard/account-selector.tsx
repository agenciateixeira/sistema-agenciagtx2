'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface AdAccount {
  id: string;
  account_id: string;
  name: string;
  business_id: string;
  account_status?: number;
  currency?: string;
}

interface Pixel {
  id: string;
  name: string;
  business_id: string;
}

interface AccountSelectorProps {
  accounts: AdAccount[];
  pixels: Pixel[];
  currentAccountId?: string;
  currentPixelId?: string;
  onSelectAccount: (accountId: string, pixelId: string) => void;
}

export function AccountSelector({ accounts, pixels, currentAccountId, currentPixelId, onSelectAccount }: AccountSelectorProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(currentAccountId || '');
  const [selectedPixelId, setSelectedPixelId] = useState(currentPixelId || '');
  const [saving, setSaving] = useState(false);

  // Encontrar business_id da conta selecionada
  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const selectedBusinessId = selectedAccount?.business_id;

  // Filtrar pixels pela mesma business da conta selecionada
  const availablePixels = selectedBusinessId
    ? pixels.filter((pixel) => pixel.business_id === selectedBusinessId)
    : [];

  // Resetar pixel selecionado se não estiver na lista filtrada
  useEffect(() => {
    if (selectedPixelId && !availablePixels.find((p) => p.id === selectedPixelId)) {
      setSelectedPixelId('');
    }
  }, [selectedAccountId, availablePixels, selectedPixelId]);

  const handleSave = async () => {
    if (!selectedAccountId) {
      alert('Selecione uma conta de anúncios');
      return;
    }

    if (availablePixels.length > 0 && !selectedPixelId) {
      alert('Selecione um Pixel para usar com CAPI');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/meta/set-primary-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_account_id: selectedAccountId,
          pixel_id: selectedPixelId,
        }),
      });

      if (!response.ok) throw new Error('Failed to save account');

      onSelectAccount(selectedAccountId, selectedPixelId);
      window.location.reload();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Conta de Anúncios */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          1. Selecione a Conta de Anúncios
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Você tem {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'} de anúncios disponíveis.
        </p>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccountId(account.id)}
              className={`w-full rounded-lg border-2 p-4 text-left transition ${
                selectedAccountId === account.id
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{account.name}</p>
                  <p className="mt-1 text-xs text-gray-600">ID: {account.account_id || account.id}</p>
                  {(account.account_status !== undefined || account.currency) && (
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      {account.account_status !== undefined && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                          account.account_status === 1
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {account.account_status === 1 ? 'Ativa' : 'Inativa'}
                        </span>
                      )}
                      {account.currency && (
                        <span className="text-gray-500">Moeda: {account.currency}</span>
                      )}
                    </div>
                  )}
                </div>
                {selectedAccountId === account.id && (
                  <Check className="h-5 w-5 flex-shrink-0 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de Pixel */}
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          2. Selecione o Pixel (para CAPI)
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {!selectedAccountId
            ? 'Selecione uma conta de anúncios primeiro para ver os pixels disponíveis.'
            : availablePixels.length > 0
            ? `${availablePixels.length} ${availablePixels.length === 1 ? 'Pixel disponível' : 'Pixels disponíveis'} para esta conta.`
            : 'Nenhum Pixel encontrado para esta conta. CAPI não funcionará sem um Pixel.'}
        </p>

        {selectedAccountId && availablePixels.length > 0 ? (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {availablePixels.map((pixel) => (
              <button
                key={pixel.id}
                onClick={() => setSelectedPixelId(pixel.id)}
                className={`w-full rounded-lg border-2 p-4 text-left transition ${
                  selectedPixelId === pixel.id
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pixel.name}</p>
                    <p className="mt-1 font-mono text-xs text-gray-600">ID: {pixel.id}</p>
                  </div>
                  {selectedPixelId === pixel.id && (
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : selectedAccountId ? (
          <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              <strong>Nenhum Pixel encontrado para esta conta.</strong> Crie um Pixel no Gerenciador de Eventos do Meta vinculado a esta Business e reconecte sua conta.
            </p>
          </div>
        ) : null}
      </div>

      {/* Botão de Confirmação */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-600">
          Você pode mudar essas configurações depois em Integrações
        </p>
        <button
          onClick={handleSave}
          disabled={!selectedAccountId || (availablePixels.length > 0 && !selectedPixelId) || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
