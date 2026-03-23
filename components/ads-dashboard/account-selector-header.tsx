'use client';

import { useMetaAccount } from '@/contexts/meta-account-context';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AccountSelectorHeader() {
  const {
    accounts,
    selectedAccount,
    isLoading,
    switchAccount,
    viewMode,
    setViewMode,
  } = useMetaAccount();

  if (isLoading) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="text-sm text-gray-600">Carregando contas...</span>
        </div>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">
          Nenhuma conta de anúncios encontrada
        </p>
        <p className="mt-1 text-xs text-yellow-700">
          Conecte sua conta do Meta Ads em Integrações para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seletor de Conta e Modo de Visualização */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* Seletor de Conta */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>

          <div className="flex flex-col">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedAccount?.name || 'Selecione uma conta'}
                        </p>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {selectedAccount?.account_id && `ID: ${selectedAccount.account_id}`}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Contas de Anúncios</span>
                  <Badge variant="secondary">{accounts.length}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {accounts.map((account) => {
                    const accountId = account.account_id || account.id;
                    const isSelected =
                      selectedAccount?.account_id === accountId ||
                      selectedAccount?.id === accountId;

                    return (
                      <DropdownMenuItem
                        key={accountId}
                        onClick={() => switchAccount(accountId)}
                        className={cn(
                          'cursor-pointer',
                          isSelected && 'bg-blue-50'
                        )}
                      >
                        <div className="flex w-full items-start gap-3">
                          <div className="flex h-5 w-5 items-center justify-center">
                            {isSelected && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {account.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {accountId}
                            </p>
                            {account.business && (
                              <p className="text-xs text-gray-400">
                                Business: {account.business.name}
                              </p>
                            )}
                          </div>
                          {account.account_status === 1 && (
                            <Badge variant="success" className="text-xs">
                              Ativa
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <p className="text-xs text-gray-500">
              {accounts.length} {accounts.length === 1 ? 'conta disponível' : 'contas disponíveis'}
            </p>
          </div>
        </div>

        {/* Modo de Visualização */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Modo:</span>
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode('single')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'single'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Individual
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'compare'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Comparar
            </button>
            <button
              onClick={() => setViewMode('consolidated')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'consolidated'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Consolidado
            </button>
          </div>
        </div>
      </div>

      {/* Info de Modo Ativo */}
      {viewMode === 'compare' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-900">
            💡 Modo Comparar: Selecione 2-4 contas para comparar lado a lado
          </p>
        </div>
      )}

      {viewMode === 'consolidated' && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <p className="text-xs font-medium text-purple-900">
            💡 Modo Consolidado: Visualize a soma de todas as contas
          </p>
        </div>
      )}
    </div>
  );
}
