'use client';

import { useState } from 'react';
import { useMetaAccount } from '@/contexts/meta-account-context';
import { AccountSelectorHeader } from './account-selector-header';
import { IndividualMode } from './individual-mode';
import { CompareModeImproved } from './compare-mode-improved';
import { ConsolidatedModeImproved } from './consolidated-mode-improved';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AdsDashboardContentProps {
  userId: string;
  metaConnection: any;
}

export function AdsDashboardContent({ userId, metaConnection }: AdsDashboardContentProps) {
  console.log('[AdsDashboardContent] 🔵 Componente montado - userId:', userId);
  console.log('[AdsDashboardContent] 🔗 metaConnection:', {
    user_name: metaConnection.meta_user_name,
    accounts: metaConnection.ad_account_ids?.length || 0
  });

  const { viewMode, isLoading } = useMetaAccount();
  console.log('[AdsDashboardContent] 📊 viewMode:', viewMode, 'isLoading:', isLoading);

  const [datePreset, setDatePreset] = useState<string>('last_30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Meta Ads</h1>
          <p className="mt-2 text-sm text-gray-600">
            Métricas e performance de suas campanhas no Facebook e Instagram
          </p>
        </div>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-400"
        >
          Gerenciar Conexão
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Info da Conexão */}
      <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {metaConnection.meta_user_name}
            </p>
            <p className="mt-0.5 text-xs text-gray-600">
              {metaConnection.ad_account_ids?.length || 0}{' '}
              {metaConnection.ad_account_ids?.length === 1
                ? 'conta de anúncios conectada'
                : 'contas de anúncios conectadas'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Conectado</span>
          </div>
        </div>
      </div>

      {/* Seletor de Contas e Modos */}
      <AccountSelectorHeader />

      {/* Conteúdo baseado no modo */}
      {!isLoading ? (
        <>
          {viewMode === 'single' && (
            <>
              {console.log('[AdsDashboardContent] 🎯 Renderizando IndividualMode')}
              <IndividualMode
                userId={userId}
                datePreset={datePreset}
                onDatePresetChange={setDatePreset}
              />
            </>
          )}

          {viewMode === 'compare' && (
            <>
              {console.log('[AdsDashboardContent] 🔀 Renderizando CompareModeImproved')}
              <CompareModeImproved userId={userId} datePreset={datePreset} />
            </>
          )}

          {viewMode === 'consolidated' && (
            <>
              {console.log('[AdsDashboardContent] 📊 Renderizando ConsolidatedModeImproved')}
              <ConsolidatedModeImproved userId={userId} datePreset={datePreset} />
            </>
          )}
        </>
      ) : (
        <>
          {console.log('[AdsDashboardContent] ⏳ isLoading=true, mostrando loader')}
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Carregando contas...</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
