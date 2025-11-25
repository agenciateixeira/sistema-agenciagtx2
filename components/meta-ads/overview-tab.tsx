'use client';

import { AdsDashboardClient } from '@/components/ads-dashboard/ads-dashboard-client';

interface OverviewTabProps {
  metaConnection: any;
}

export function OverviewTab({ metaConnection }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Informações da Conta Conectada */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0081FB">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{metaConnection.meta_user_name}</p>
            <p className="text-xs text-gray-600">
              {metaConnection.ad_account_ids?.length || 0} {metaConnection.ad_account_ids?.length === 1 ? 'conta de anúncios' : 'contas de anúncios'}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Client Component */}
      <AdsDashboardClient
        metaConnection={metaConnection}
        primaryAdAccountId={metaConnection.primary_ad_account_id}
      />
    </div>
  );
}
