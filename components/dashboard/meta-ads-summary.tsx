'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, TrendingUp, DollarSign, MousePointerClick, Loader2 } from 'lucide-react';

interface MetaAdsSummaryProps {
  userId: string;
  metaConnection: any;
}

export function MetaAdsSummary({ userId, metaConnection }: MetaAdsSummaryProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (metaConnection && metaConnection.status === 'connected') {
      fetchQuickInsights();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchQuickInsights = async () => {
    try {
      const response = await fetch(
        `/api/meta/insights?user_id=${userId}&type=account&date_preset=last_7d`
      );

      if (response.ok) {
        const data = await response.json();
        setInsights(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Se não tiver conexão
  if (!metaConnection) {
    return (
      <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#0081FB">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Meta Ads</h3>
              <p className="mt-1 text-sm text-gray-600">
                Conecte sua conta para ver métricas de anúncios
              </p>
            </div>
          </div>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Conectar
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Se token expirou
  const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
  if (tokenExpired || metaConnection.status !== 'connected') {
    return (
      <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#f59e0b">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Meta Ads - Token Expirado</h3>
              <p className="mt-1 text-sm text-gray-600">
                Reconecte sua conta para continuar visualizando métricas
              </p>
            </div>
          </div>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
          >
            Reconectar
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Se está carregando
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Se não tem dados
  if (!insights) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#0081FB">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Meta Ads Conectado</h3>
              <p className="mt-1 text-sm text-gray-600">
                Nenhum dado disponível para os últimos 7 dias
              </p>
            </div>
          </div>
          <Link
            href="/ads-dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Ver Dashboard
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar resumo com dados
  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="#0081FB">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Meta Ads - Últimos 7 dias</h3>
            <p className="mt-1 text-sm text-gray-600">
              {metaConnection.meta_user_name} • {insights.impressions.toLocaleString('pt-BR')} impressões
            </p>
          </div>
        </div>
        <Link
          href="/ads-dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Ver Dashboard Completo
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Métricas Rápidas */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-green-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Gasto Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(insights.spend)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Cliques</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {insights.clicks.toLocaleString('pt-BR')}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">CTR: {insights.ctr.toFixed(2)}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <MousePointerClick className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-purple-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">CPC Médio</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(insights.cpc)}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                CPM: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(insights.cpm)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ROAS se disponível */}
      {insights.roas && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-900">ROAS (Return on Ad Spend)</p>
              <p className="mt-0.5 text-sm text-green-700">
                Para cada R$ 1,00 gasto, você gerou R$ {insights.roas.toFixed(2)} em conversões
              </p>
            </div>
            <p className="text-2xl font-bold text-green-700">{insights.roas.toFixed(2)}x</p>
          </div>
        </div>
      )}
    </div>
  );
}
