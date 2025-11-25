'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, Loader2, Trash2, Settings, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface MetaConnection {
  id: string;
  meta_user_name: string;
  status: 'connected' | 'expired' | 'disconnected' | 'error';
  primary_ad_account_id: string | null;
  ad_account_ids: any[];
  token_expires_at: string;
  last_sync_at: string;
  user_id: string;
}

interface MetaAdsCardProps {
  connection: MetaConnection | null;
}

export function MetaAdsCard({ connection }: MetaAdsCardProps) {
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [changingPrimary, setChangingPrimary] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Redirecionar para rota OAuth
    window.location.href = '/api/auth/meta/start';
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Meta Ads? Você perderá acesso às métricas.')) {
      return;
    }

    setDisconnecting(true);
    try {
      const response = await fetch('/api/meta/disconnect', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to disconnect');

      // Recarregar página para atualizar UI
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Erro ao desconectar. Tente novamente.');
      setDisconnecting(false);
    }
  };

  // Carregar contas disponíveis quando expandir gerenciamento
  useEffect(() => {
    if (showAccountManagement && connection && availableAccounts.length === 0) {
      loadAvailableAccounts();
    }
  }, [showAccountManagement]);

  const loadAvailableAccounts = async () => {
    if (!connection) return;

    setLoadingAccounts(true);
    try {
      const response = await fetch(`/api/meta/ad-accounts?user_id=${connection.user_id}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSetPrimaryAccount = async (accountId: string) => {
    setChangingPrimary(true);
    try {
      const response = await fetch('/api/meta/set-primary-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_account_id: accountId }),
      });

      if (!response.ok) throw new Error('Failed to set primary account');

      // Recarregar página para atualizar UI
      window.location.href = '/integrations';
    } catch (error) {
      console.error('Error setting primary account:', error);
      alert('Erro ao alterar conta principal. Tente novamente.');
      setChangingPrimary(false);
    }
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

      {/* Gerenciamento de Contas */}
      {connection && connection.status === 'connected' && connection.ad_account_ids && connection.ad_account_ids.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAccountManagement(!showAccountManagement)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <span>Gerenciar Contas de Anúncios</span>
            </div>
            {showAccountManagement ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {showAccountManagement && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
              {loadingAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : availableAccounts.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 mb-3">
                    Selecione qual conta será usada como padrão no dashboard:
                  </p>
                  {availableAccounts.map((account) => {
                    const accountId = account.account_id || account.id.replace('act_', '');
                    const isPrimary = connection.primary_ad_account_id === accountId;

                    return (
                      <div
                        key={account.id}
                        className={`flex items-center justify-between rounded-lg border-2 p-3 transition ${
                          isPrimary
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isPrimary && (
                            <Star className="h-4 w-4 flex-shrink-0 text-blue-600 fill-blue-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isPrimary ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {account.name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              ID: {accountId}
                            </p>
                            {account.currency && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Moeda: {account.currency}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isPrimary && (
                          <button
                            onClick={() => handleSetPrimaryAccount(accountId)}
                            disabled={changingPrimary}
                            className="ml-3 flex-shrink-0 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                          >
                            {changingPrimary ? 'Salvando...' : 'Definir como principal'}
                          </button>
                        )}

                        {isPrimary && (
                          <span className="ml-3 flex-shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700">
                            Principal
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  Nenhuma conta disponível
                </p>
              )}
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
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {disconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Desconectando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Desconectar
                </>
              )}
            </button>
            <button
              onClick={handleConnect}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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

      {/* Como usamos a API */}
      <details className="mt-4 rounded-lg border border-gray-200 bg-white">
        <summary className="cursor-pointer p-4 font-medium text-gray-900 hover:bg-gray-50">
          🔐 Como usamos sua API da Meta?
        </summary>
        <div className="space-y-4 border-t border-gray-200 p-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-900 mb-2">📊 Dados que coletamos (somente leitura):</p>
            <ul className="ml-5 list-disc space-y-1 text-xs">
              <li><strong>Métricas de Campanhas:</strong> Gasto, impressões, cliques, CPC, CTR, ROAS</li>
              <li><strong>Informações de Contas:</strong> Nome das campanhas, ad sets e anúncios</li>
              <li><strong>Resultados:</strong> Conversões e valores de conversão (quando configurado)</li>
              <li><strong>Períodos:</strong> Dados históricos para comparativos e relatórios</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-2">🎯 Como usamos esses dados:</p>
            <ul className="ml-5 list-disc space-y-1 text-xs">
              <li><strong>Dashboard Unificado:</strong> Mostramos todas suas métricas em um só lugar</li>
              <li><strong>Cálculo de ROI:</strong> Cruzamos gasto em ads com receita recuperada de carrinhos</li>
              <li><strong>Rastreamento de Origem:</strong> Identificamos quais campanhas geram mais carrinhos abandonados</li>
              <li><strong>Alertas Inteligentes:</strong> Notificamos quando CPC sobe, ROAS cai ou abandono aumenta</li>
              <li><strong>Relatórios:</strong> Geramos relatórios PDF/Excel com análise completa</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-2">🔒 Segurança e Privacidade:</p>
            <ul className="ml-5 list-disc space-y-1 text-xs">
              <li><strong>Tokens Criptografados:</strong> Seu token de acesso é guardado com criptografia AES-256-GCM</li>
              <li><strong>Somente Leitura:</strong> NUNCA modificamos, pausamos ou editamos seus anúncios</li>
              <li><strong>Multi-tenant Isolado:</strong> Seus dados não são compartilhados com outros usuários</li>
              <li><strong>GDPR Compliant:</strong> Você pode desconectar e deletar todos dados a qualquer momento</li>
              <li><strong>Sincronização Diária:</strong> Buscamos dados 1x por dia (não sobrecarrega sua conta)</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-2">🔄 Exemplo de Fluxo:</p>
            <ol className="ml-5 list-decimal space-y-1 text-xs">
              <li>Cliente vê seu anúncio no Facebook/Instagram</li>
              <li>Clica e vai para sua loja (capturamos utm_source=facebook)</li>
              <li>Adiciona produtos mas abandona o carrinho</li>
              <li>Nosso sistema envia email de recuperação</li>
              <li>Cliente abre email, clica e finaliza compra</li>
              <li><strong>Você vê:</strong> "Campanha X → 1 carrinho → 1 venda recuperada → ROI +150%"</li>
            </ol>
          </div>

          <div className="rounded-lg bg-green-50 p-3 border border-green-200">
            <p className="text-xs text-green-900">
              <strong>✅ Garantia:</strong> Suas credenciais ficam 100% no seu controle.
              Você pode revogar acesso a qualquer momento pelo{' '}
              <a
                href="https://www.facebook.com/settings?tab=business_tools"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-green-700"
              >
                Facebook Business Settings
              </a>
              .
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
