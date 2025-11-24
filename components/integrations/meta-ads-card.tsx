'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface MetaConnection {
  id: string;
  meta_user_name: string;
  status: 'connected' | 'expired' | 'disconnected' | 'error';
  primary_ad_account_id: string | null;
  ad_account_ids: any[];
  token_expires_at: string;
  last_sync_at: string;
}

interface MetaAdsCardProps {
  connection: MetaConnection | null;
}

export function MetaAdsCard({ connection }: MetaAdsCardProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Redirecionar para rota OAuth
    window.location.href = '/api/auth/meta/start';
  };

  const getStatusBadge = () => {
    if (!connection) {
      return null;
    }

    const statusConfig = {
      connected: {
        icon: CheckCircle,
        text: 'Conectado',
        className: 'bg-green-100 text-green-800',
      },
      expired: {
        icon: AlertCircle,
        text: 'Token Expirado',
        className: 'bg-yellow-100 text-yellow-800',
      },
      disconnected: {
        icon: AlertCircle,
        text: 'Desconectado',
        className: 'bg-gray-100 text-gray-800',
      },
      error: {
        icon: AlertCircle,
        text: 'Erro',
        className: 'bg-red-100 text-red-800',
      },
    };

    const config = statusConfig[connection.status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Meta Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#0081FB">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Meta Ads</h3>
            <p className="mt-1 text-sm text-gray-600">
              Conecte sua conta de anúncios do Facebook/Instagram
            </p>
          </div>
        </div>

        {connection && getStatusBadge()}
      </div>

      {/* Detalhes da Conexão */}
      {connection && connection.status === 'connected' && (
        <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Conta:</span>
            <span className="font-medium text-gray-900">{connection.meta_user_name}</span>
          </div>

          {connection.ad_account_ids && connection.ad_account_ids.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Contas de Anúncios:</span>
              <span className="font-medium text-gray-900">
                {connection.ad_account_ids.length} {connection.ad_account_ids.length === 1 ? 'conta' : 'contas'}
              </span>
            </div>
          )}

          {connection.primary_ad_account_id && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Conta Principal:</span>
              <span className="font-mono text-xs text-gray-700">
                {connection.primary_ad_account_id}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Token expira em:</span>
            <span className="font-medium text-gray-900">
              {formatDate(connection.token_expires_at)}
            </span>
          </div>

          {connection.last_sync_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Última sincronização:</span>
              <span className="text-gray-700">
                {formatDate(connection.last_sync_at)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="mt-4 flex gap-3">
        {!connection || connection.status !== 'connected' ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Conectar Meta Ads
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleConnect}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Reconectar
            </button>
            <a
              href="/ads-dashboard"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Ver Métricas
              <ExternalLink className="h-4 w-4" />
            </a>
          </>
        )}
      </div>

      {/* Benefícios */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          💡 O que você pode fazer:
        </h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• Ver métricas de anúncios em tempo real</li>
          <li>• Calcular ROI: Gasto em Ads vs Receita Recuperada</li>
          <li>• Ver quais campanhas geram mais carrinhos abandonados</li>
          <li>• Dashboard unificado com tudo em um lugar</li>
        </ul>
      </div>
    </div>
  );
}
