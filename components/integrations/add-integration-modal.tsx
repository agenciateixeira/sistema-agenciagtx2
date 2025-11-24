'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
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
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="mx-auto h-12 w-12 flex items-center justify-center">
                  <Image
                    src="/images/shopify.png"
                    alt="Shopify"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-900">Shopify</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('yampi')}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  platform === 'yampi'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                }`}
                disabled
              >
                <div className="mx-auto h-12 w-12 flex items-center justify-center">
                  <Image
                    src="/images/logo-yampi-smartenvios.webp"
                    alt="Yampi"
                    width={48}
                    height={48}
                    className="object-contain opacity-50"
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-400">Yampi</div>
                <div className="text-xs text-gray-500">Em breve</div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('woocommerce')}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  platform === 'woocommerce'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                }`}
                disabled
              >
                <div className="mx-auto h-12 w-12 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-10 w-10" fill="#96588A">
                    <path d="M23.004 8.5c-.001 4.97-4.031 9-9.001 9-4.968 0-9-4.03-9-9 0-4.968 4.032-9 9-9 4.97 0 9.001 4.032 9.001 9zm-1.498 0c0-4.14-3.362-7.502-7.503-7.502-4.139 0-7.502 3.361-7.502 7.502 0 4.142 3.363 7.502 7.502 7.502 4.141 0 7.503-3.36 7.503-7.502zm-2.764 2.973c-.471.846-.765 1.312-1.153 2.013-.422.726-1.002.902-1.567.425-.566-.446-.819-1.156-.738-1.924.045-.425.164-.842.308-1.253.32-.909.723-1.775 1.107-2.651.205-.464.376-.939.535-1.426.097-.297.136-.606.02-.894-.16-.396-.49-.612-.906-.596-.466.015-.87.24-1.211.561-.496.467-.878 1.03-1.127 1.668-.344.895-.544 1.829-.683 2.774-.047.327-.095.657-.173.975-.128.529-.494.819-1.028.807-.495-.01-.855-.338-.943-.864-.051-.305-.023-.619.007-.93.053-.545.134-1.087.22-1.626.146-.905.312-1.804.468-2.707.062-.357.108-.717.139-1.078.032-.373-.152-.647-.485-.738-.197-.054-.408-.072-.613-.088-.38-.03-.592-.263-.591-.649 0-.385.214-.622.596-.645.715-.042 1.432-.065 2.147-.074.459-.005.744.295.797.742.075.637-.058 1.263-.128 1.893-.015.133-.029.268-.042.402-.008.079-.008.159-.015.253.037.015.058.021.073.036.011.011.015.03.023.044.302-.321.577-.677.893-.98.72-.684 1.543-1.15 2.545-1.21 1.024-.062 1.732.48 1.953 1.482.092.414.098.84.048 1.263-.09.746-.25 1.484-.44 2.21-.167.631-.373 1.253-.56 1.879-.035.119-.066.239-.095.36-.06.257-.04.482.152.667.174.169.384.259.627.212.26-.049.45-.215.604-.414.467-.601.802-1.279 1.068-1.99.043-.115.072-.236.111-.352.035-.107.076-.21.188-.256.114-.047.234-.076.342.009.068.053.098.148.095.234-.002.077-.03.155-.055.227-.173.49-.352.978-.55 1.457z"/>
                  </svg>
                </div>
                <div className="mt-2 text-sm font-medium text-gray-400">WooCommerce</div>
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
