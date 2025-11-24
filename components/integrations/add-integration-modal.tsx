'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { addIntegration } from '@/app/actions/integrations';

interface AddIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddIntegrationModal({ isOpen, onClose }: AddIntegrationModalProps) {
  const [platform, setPlatform] = useState<'shopify' | 'yampi' | 'woocommerce'>('shopify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('platform', platform);

    const result = await addIntegration(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
      window.location.reload();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nova Integração</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Escolher Plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plataforma
            </label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPlatform('shopify')}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  platform === 'shopify'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl">📦</div>
                <div className="mt-1 text-sm font-medium">Shopify</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('yampi')}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  platform === 'yampi'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                }`}
                disabled
              >
                <div className="text-2xl">🛒</div>
                <div className="mt-1 text-sm font-medium">Yampi</div>
                <div className="text-xs text-gray-500">Em breve</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('woocommerce')}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  platform === 'woocommerce'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                }`}
                disabled
              >
                <div className="text-2xl">🔌</div>
                <div className="mt-1 text-sm font-medium">WooCommerce</div>
                <div className="text-xs text-gray-500">Em breve</div>
              </button>
            </div>
          </div>

          {/* Campos Shopify */}
          {platform === 'shopify' && (
            <>
              <div>
                <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  name="store_name"
                  id="store_name"
                  placeholder="minha-loja"
                  required
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Apenas o nome (ex: se sua loja é minha-loja.myshopify.com, digite apenas "minha-loja")
                </p>
              </div>

              <div>
                <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
                  Admin API Access Token
                </label>
                <input
                  type="text"
                  name="api_key"
                  id="api_key"
                  placeholder="shpat_..."
                  required
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Encontre em: API credentials → Admin API access token
                </p>
              </div>

              <div>
                <label htmlFor="api_secret" className="block text-sm font-medium text-gray-700">
                  API Secret Key
                </label>
                <input
                  type="password"
                  name="api_secret"
                  id="api_secret"
                  placeholder="shpss_..."
                  required
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Encontre em: API credentials → API secret key
                </p>
              </div>
            </>
          )}

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
              {loading ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
