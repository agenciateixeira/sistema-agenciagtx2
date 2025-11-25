'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AccountSelector } from './account-selector';

interface AccountSetupProps {
  userId: string;
  primaryAccountId?: string;
}

export function AccountSetup({ userId, primaryAccountId }: AccountSetupProps) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [pixels, setPixels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch(`/api/meta/ad-accounts?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to load accounts');

      const data = await response.json();
      setAccounts(data.accounts || []);
      setPixels(data.pixels || []);
    } catch (error) {
      console.error('Error loading ad accounts:', error);
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

  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
        <h3 className="font-semibold text-yellow-900">
          Nenhuma conta de anúncios encontrada
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          Não encontramos contas de anúncios na sua conta do Meta. Verifique se você tem permissão de acesso.
        </p>
      </div>
    );
  }

  return (
    <AccountSelector
      accounts={accounts}
      pixels={pixels}
      currentAccountId={primaryAccountId}
      currentPixelId={undefined}
      onSelectAccount={() => {}}
    />
  );
}
