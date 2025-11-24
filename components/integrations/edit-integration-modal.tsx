'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateIntegration } from '@/app/actions/integrations';

interface Integration {
  id: string;
  platform: string;
  store_name: string;
  store_url: string | null;
  api_key: string;
  api_secret: string | null;
  settings: any;
}

interface EditIntegrationModalProps {
  integration: Integration;
  isOpen: boolean;
  onClose: () => void;
}

export function EditIntegrationModal({ integration, isOpen, onClose }: EditIntegrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await updateIntegration(integration.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
      window.location.reload();
    }
  }

  if (!isOpen) return null;

  // Extrair dados para preencher o formulário
  const storeUrlWithoutProtocol = integration.store_url?.replace('https://', '') || '';
  const apiKeyNormal = integration.settings?.api_key_normal || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Editar Integração</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
              Nome da integração
            </label>
            <input
              type="text"
              name="store_name"
              id="store_name"
              defaultValue={integration.store_name}
              required
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="store_url" className="block text-sm font-medium text-gray-700">
              URL original da sua loja Shopify
            </label>
            <input
              type="text"
              name="store_url"
              id="store_url"
              defaultValue={storeUrlWithoutProtocol}
              required
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Exemplo: sua-loja.myshopify.com
            </p>
          </div>

          <div>
            <label htmlFor="access_token" className="block text-sm font-medium text-gray-700">
              Token de acesso
            </label>
            <input
              type="text"
              name="access_token"
              id="access_token"
              defaultValue={integration.api_key}
              placeholder="shpat_..."
              required
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Admin API access token
            </p>
          </div>

          <div>
            <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
              Chave de API
            </label>
            <input
              type="text"
              name="api_key"
              id="api_key"
              defaultValue={apiKeyNormal}
              placeholder="a1b2c3d4e5f6..."
              required
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              API key (32 caracteres)
            </p>
          </div>

          <div>
            <label htmlFor="api_secret" className="block text-sm font-medium text-gray-700">
              Chave secreta da API
            </label>
            <input
              type="password"
              name="api_secret"
              id="api_secret"
              defaultValue={integration.api_secret || ''}
              placeholder="shpss_..."
              required
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              API secret key (32 caracteres)
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
