'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface MetaAccount {
  id: string;
  account_id: string;
  name: string;
  currency?: string;
  account_status?: number;
  business?: {
    id: string;
    name: string;
  };
}

interface MetaAccountContextType {
  accounts: MetaAccount[];
  selectedAccount: MetaAccount | null;
  isLoading: boolean;
  switchAccount: (accountId: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  viewMode: 'single' | 'compare' | 'consolidated';
  setViewMode: (mode: 'single' | 'compare' | 'consolidated') => void;
  compareAccounts: string[];
  setCompareAccounts: (accountIds: string[]) => void;
}

const MetaAccountContext = createContext<MetaAccountContextType | undefined>(undefined);

export function MetaAccountProvider({
  children,
  userId,
  initialAccounts = []
}: {
  children: React.ReactNode;
  userId: string;
  initialAccounts?: MetaAccount[];
}) {
  const [accounts, setAccounts] = useState<MetaAccount[]>(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState<MetaAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'compare' | 'consolidated'>('single');
  const [compareAccounts, setCompareAccounts] = useState<string[]>([]);
  const router = useRouter();

  // Carregar contas disponíveis
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/meta/ad-accounts?user_id=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to load accounts');
      }

      const data = await response.json();
      const accountsList = data.accounts || [];
      setAccounts(accountsList);

      // Verificar conta salva no localStorage
      const savedAccountId = localStorage.getItem('meta_selected_account_id');
      const savedAccount = accountsList.find((acc: MetaAccount) =>
        acc.account_id === savedAccountId || acc.id === savedAccountId
      );

      if (savedAccount) {
        setSelectedAccount(savedAccount);
      } else if (accountsList.length > 0) {
        // Se não tiver salvo, usar a primeira conta
        setSelectedAccount(accountsList[0]);
        localStorage.setItem('meta_selected_account_id', accountsList[0].account_id || accountsList[0].id);
      }

      // Carregar modo de visualização salvo
      const savedViewMode = localStorage.getItem('meta_view_mode');
      if (savedViewMode === 'compare' || savedViewMode === 'consolidated') {
        setViewMode(savedViewMode);
      }

      // Carregar contas para comparar
      const savedCompareAccounts = localStorage.getItem('meta_compare_accounts');
      if (savedCompareAccounts) {
        try {
          setCompareAccounts(JSON.parse(savedCompareAccounts));
        } catch (e) {
          console.error('Error parsing compare accounts:', e);
        }
      }
    } catch (error) {
      console.error('Error loading Meta accounts:', error);
      toast.error('Erro ao carregar contas do Meta Ads');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Trocar conta
  const switchAccount = async (accountId: string) => {
    const toastId = toast.loading('Trocando conta...');

    try {
      // Salvar no backend como primary
      const response = await fetch('/api/meta/set-primary-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_account_id: accountId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to switch account');
      }

      // Atualizar estado local
      const account = accounts.find(acc =>
        acc.account_id === accountId || acc.id === accountId
      );

      if (account) {
        setSelectedAccount(account);
        localStorage.setItem('meta_selected_account_id', account.account_id || account.id);

        // Notificar outras abas
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const channel = new BroadcastChannel('meta_account_switch');
          channel.postMessage({ accountId });
          channel.close();
        }

        toast.success('Conta alterada com sucesso!', { id: toastId });

        // Refresh da página para recarregar dados
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error switching account:', error);
      toast.error(error.message || 'Erro ao trocar conta', { id: toastId });
    }
  };

  // Atualizar modo de visualização
  const handleSetViewMode = (mode: 'single' | 'compare' | 'consolidated') => {
    setViewMode(mode);
    localStorage.setItem('meta_view_mode', mode);
  };

  // Atualizar contas para comparar
  const handleSetCompareAccounts = (accountIds: string[]) => {
    setCompareAccounts(accountIds);
    localStorage.setItem('meta_compare_accounts', JSON.stringify(accountIds));
  };

  useEffect(() => {
    loadAccounts();

    // Listener para sincronizar entre abas
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('meta_account_switch');
      channel.onmessage = (event) => {
        const { accountId } = event.data;
        const account = accounts.find(acc =>
          acc.account_id === accountId || acc.id === accountId
        );
        if (account) {
          setSelectedAccount(account);
          router.refresh();
        }
      };

      return () => channel.close();
    }
  }, [loadAccounts, router, accounts]);

  return (
    <MetaAccountContext.Provider value={{
      accounts,
      selectedAccount,
      isLoading,
      switchAccount,
      refreshAccounts: loadAccounts,
      viewMode,
      setViewMode: handleSetViewMode,
      compareAccounts,
      setCompareAccounts: handleSetCompareAccounts,
    }}>
      {children}
    </MetaAccountContext.Provider>
  );
}

export function useMetaAccount() {
  const context = useContext(MetaAccountContext);
  if (!context) {
    throw new Error('useMetaAccount must be used within MetaAccountProvider');
  }
  return context;
}
