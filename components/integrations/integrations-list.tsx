'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, RefreshCw, Edit } from 'lucide-react';
import Image from 'next/image';
import { deleteIntegration, testIntegration } from '@/app/actions/integrations';
import { EditIntegrationModal } from './edit-integration-modal';

interface Integration {
  id: string;
  platform: string;
  store_name: string;
  store_url: string | null;
  status: string;
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
  api_key: string;
  api_secret: string | null;
  settings: any;
}

interface IntegrationsListProps {
  integrations: Integration[];
}

export function IntegrationsList({ integrations }: IntegrationsListProps) {
  const [testing, setTesting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);

  async function handleTest(id: string) {
    setTesting(id);
    const result = await testIntegration(id);

    if (result.error) {
      alert(`Erro: ${result.error}`);
    } else {
      alert('Conexão testada com sucesso!');
      window.location.reload();
    }
    setTesting(null);
  }

  async function handleDelete(id: string, storeName: string) {
    if (!confirm(`Tem certeza que deseja remover a integração com ${storeName}?`)) {
      return;
    }

    setDeleting(id);
    const result = await deleteIntegration(id);

    if (result.error) {
      alert(`Erro: ${result.error}`);
      setDeleting(null);
    } else {
      window.location.reload();
    }
  }

  const platformLogos: Record<string, JSX.Element> = {
    shopify: (
      <Image
        src="/images/shopify.png"
        alt="Shopify"
        width={32}
        height={32}
        className="object-contain"
      />
    ),
    yampi: (
      <Image
        src="/images/logo-yampi-smartenvios.webp"
        alt="Yampi"
        width={32}
        height={32}
        className="object-contain"
      />
    ),
    woocommerce: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#96588A">
        <path d="M23.004 8.5c-.001 4.97-4.031 9-9.001 9-4.968 0-9-4.03-9-9 0-4.968 4.032-9 9-9 4.97 0 9.001 4.032 9.001 9zm-1.498 0c0-4.14-3.362-7.502-7.503-7.502-4.139 0-7.502 3.361-7.502 7.502 0 4.142 3.363 7.502 7.502 7.502 4.141 0 7.503-3.36 7.503-7.502zm-2.764 2.973c-.471.846-.765 1.312-1.153 2.013-.422.726-1.002.902-1.567.425-.566-.446-.819-1.156-.738-1.924.045-.425.164-.842.308-1.253.32-.909.723-1.775 1.107-2.651.205-.464.376-.939.535-1.426.097-.297.136-.606.02-.894-.16-.396-.49-.612-.906-.596-.466.015-.87.24-1.211.561-.496.467-.878 1.03-1.127 1.668-.344.895-.544 1.829-.683 2.774-.047.327-.095.657-.173.975-.128.529-.494.819-1.028.807-.495-.01-.855-.338-.943-.864-.051-.305-.023-.619.007-.93.053-.545.134-1.087.22-1.626.146-.905.312-1.804.468-2.707.062-.357.108-.717.139-1.078.032-.373-.152-.647-.485-.738-.197-.054-.408-.072-.613-.088-.38-.03-.592-.263-.591-.649 0-.385.214-.622.596-.645.715-.042 1.432-.065 2.147-.074.459-.005.744.295.797.742.075.637-.058 1.263-.128 1.893-.015.133-.029.268-.042.402-.008.079-.008.159-.015.253.037.015.058.021.073.036.011.011.015.03.023.044.302-.321.577-.677.893-.98.72-.684 1.543-1.15 2.545-1.21 1.024-.062 1.732.48 1.953 1.482.092.414.098.84.048 1.263-.09.746-.25 1.484-.44 2.21-.167.631-.373 1.253-.56 1.879-.035.119-.066.239-.095.36-.06.257-.04.482.152.667.174.169.384.259.627.212.26-.049.45-.215.604-.414.467-.601.802-1.279 1.068-1.99.043-.115.072-.236.111-.352.035-.107.076-.21.188-.256.114-.047.234-.076.342.009.068.053.098.148.095.234-.002.077-.03.155-.055.227-.173.49-.352.978-.55 1.457z"/>
      </svg>
    ),
  };

  const platformLabels: Record<string, string> = {
    shopify: 'Shopify',
    yampi: 'Yampi',
    woocommerce: 'WooCommerce',
  };

  return (
    <div className="space-y-3">
      {integrations.map((integration) => (
        <div
          key={integration.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center">
              {platformLogos[integration.platform] || '🔗'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {integration.store_name}
                </h3>
                {integration.status === 'active' ? (
                  <span className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Ativo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    <XCircle className="h-3 w-3" />
                    Erro
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-sm text-gray-600">
                {platformLabels[integration.platform] || integration.platform}
              </p>

              {integration.store_url && (
                <p className="mt-1 text-xs text-gray-500">
                  {integration.store_url}
                </p>
              )}

              {integration.last_sync_at && (
                <p className="mt-1 text-xs text-gray-500">
                  Última sincronização: {new Date(integration.last_sync_at).toLocaleString('pt-BR')}
                </p>
              )}

              {integration.error_message && (
                <p className="mt-1 text-xs text-red-600">
                  Erro: {integration.error_message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTest(integration.id)}
              disabled={testing === integration.id}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              title="Testar conexão"
            >
              <RefreshCw className={`h-4 w-4 ${testing === integration.id ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setEditingIntegration(integration)}
              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
              title="Editar integração"
            >
              <Edit className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleDelete(integration.id, integration.store_name)}
              disabled={deleting === integration.id}
              className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="Remover integração"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {editingIntegration && (
        <EditIntegrationModal
          integration={editingIntegration}
          isOpen={!!editingIntegration}
          onClose={() => setEditingIntegration(null)}
        />
      )}
    </div>
  );
}
