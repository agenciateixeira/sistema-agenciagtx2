'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { deleteIntegration, testIntegration } from '@/app/actions/integrations';

interface Integration {
  id: string;
  platform: string;
  store_name: string;
  store_url: string | null;
  status: string;
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface IntegrationsListProps {
  integrations: Integration[];
}

export function IntegrationsList({ integrations }: IntegrationsListProps) {
  const [testing, setTesting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const platformIcons: Record<string, string> = {
    shopify: '📦',
    yampi: '🛒',
    woocommerce: '🔌',
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
            <div className="text-3xl">
              {platformIcons[integration.platform] || '🔗'}
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
    </div>
  );
}
