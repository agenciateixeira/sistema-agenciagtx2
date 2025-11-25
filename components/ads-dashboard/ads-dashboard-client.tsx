'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from './metric-card';
import { DailyPerformanceChart } from './daily-performance-chart';
import { CampaignsTable } from './campaigns-table';
import {
  DollarSign,
  MousePointerClick,
  Eye,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface AdsDashboardClientProps {
  metaConnection: any;
  primaryAdAccountId: string;
}

export function AdsDashboardClient({
  metaConnection,
  primaryAdAccountId,
}: AdsDashboardClientProps) {
  const [datePreset, setDatePreset] = useState<'last_7d' | 'last_30d' | 'this_month' | 'last_month'>('last_30d');
  const [accountInsights, setAccountInsights] = useState<any>(null);
  const [campaignsInsights, setCampaignsInsights] = useState<any[]>([]);
  const [dailyInsights, setDailyInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [datePreset]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar insights da conta
      const accountResponse = await fetch(
        `/api/meta/insights?user_id=${metaConnection.user_id}&type=account&date_preset=${datePreset}`
      );

      if (!accountResponse.ok) {
        const errorData = await accountResponse.json();
        throw new Error(errorData.error || 'Failed to fetch account insights');
      }

      const accountData = await accountResponse.json();
      setAccountInsights(accountData.data);

      // Buscar insights de campanhas
      const campaignsResponse = await fetch(
        `/api/meta/insights?user_id=${metaConnection.user_id}&type=campaigns&date_preset=${datePreset}`
      );

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaignsInsights(campaignsData.data || []);
      }

      // Buscar insights diários (últimos 30 dias)
      const dailyResponse = await fetch(
        `/api/meta/insights?user_id=${metaConnection.user_id}&type=daily&days=30`
      );

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        setDailyInsights(dailyData.data || []);
      }
    } catch (err: any) {
      console.error('Erro ao buscar insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Erro ao carregar métricas</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchInsights}
              className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-800"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!accountInsights) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          Nenhum dado encontrado para o período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as any)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="last_7d">Últimos 7 dias</option>
            <option value="last_30d">Últimos 30 dias</option>
            <option value="this_month">Este mês</option>
            <option value="last_month">Mês passado</option>
          </select>
        </div>
        <div className="text-xs text-gray-500">
          {accountInsights.date_start} até {accountInsights.date_stop}
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gasto Total"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(accountInsights.spend)}
          subtitle={`${accountInsights.impressions.toLocaleString('pt-BR')} impressões`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />

        <MetricCard
          title="Cliques"
          value={accountInsights.clicks.toLocaleString('pt-BR')}
          subtitle={`CTR: ${accountInsights.ctr.toFixed(2)}%`}
          icon={MousePointerClick}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        <MetricCard
          title="CPC Médio"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(accountInsights.cpc)}
          subtitle={`CPM: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(accountInsights.cpm)}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />

        <MetricCard
          title="Alcance"
          value={accountInsights.reach.toLocaleString('pt-BR')}
          subtitle={`Frequência: ${accountInsights.frequency.toFixed(2)}`}
          icon={Eye}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* ROAS Card (se disponível) */}
      {accountInsights.roas && (
        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900">ROAS (Return on Ad Spend)</p>
              <p className="mt-1 text-3xl font-bold text-green-700">
                {accountInsights.roas.toFixed(2)}x
              </p>
              <p className="mt-1 text-xs text-green-700">
                Para cada R$ 1,00 gasto, você gerou R$ {accountInsights.roas.toFixed(2)} em conversões
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-700">Valor de Conversões</p>
              <p className="text-xl font-bold text-green-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(accountInsights.conversion_value || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Performance Diária */}
      {dailyInsights.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Diária (Últimos 30 dias)
          </h3>
          <DailyPerformanceChart data={dailyInsights} />
        </div>
      )}

      {/* Tabela de Campanhas */}
      {campaignsInsights.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Campanhas ({campaignsInsights.length})
          </h3>
          <CampaignsTable campaigns={campaignsInsights} />
        </div>
      )}
    </div>
  );
}
