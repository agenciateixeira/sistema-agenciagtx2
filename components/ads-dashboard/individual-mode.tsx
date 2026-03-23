'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMetaAccount } from '@/contexts/meta-account-context';
import toast from 'react-hot-toast';
import { MetricCard } from './metric-card';
import { AdvancedMultiAxisChart } from './advanced-multi-axis-chart';
import { CohortAnalysis } from './cohort-analysis';
import { MetricsSelector, AVAILABLE_METRICS } from './metrics-selector';
import { CampaignsTable } from './campaigns-table';
import { ROISummary } from './roi-summary';
import { ROICampaignsTable } from './roi-campaigns-table';
import { ExportButton } from './export-button';
import {
  DollarSign,
  MousePointerClick,
  Eye,
  TrendingUp,
  Loader2,
  AlertCircle,
  TrendingDown,
  BarChart3,
} from 'lucide-react';

interface IndividualModeProps {
  userId: string;
  datePreset: string;
  onDatePresetChange: (preset: string) => void;
}

export function IndividualMode({ userId, datePreset, onDatePresetChange }: IndividualModeProps) {
  console.log('[IndividualMode] 🔵 Componente montado - userId:', userId, 'datePreset:', datePreset);
  const { selectedAccount } = useMetaAccount();
  console.log('[IndividualMode] 📊 selectedAccount:', selectedAccount);

  const [accountInsights, setAccountInsights] = useState<any>(null);
  const [campaignsInsights, setCampaignsInsights] = useState<any[]>([]);
  const [dailyInsights, setDailyInsights] = useState<any[]>([]);
  const [roiData, setRoiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para componentes avançados
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    AVAILABLE_METRICS.filter(m => m.defaultVisible).map(m => m.id)
  );
  const [cohortMetric, setCohortMetric] = useState<'spend' | 'conversions' | 'roas' | 'cpc' | 'ctr'>('spend');

  const fetchInsights = useCallback(async () => {
    console.log('[IndividualMode] 📡 fetchInsights iniciado');
    if (!selectedAccount) {
      console.log('[IndividualMode] ❌ selectedAccount é null, abortando');
      return;
    }

    console.log('[IndividualMode] 🔄 setLoading(true)');
    setLoading(true);
    setError(null);

    try {
      // Buscar insights da conta
      const accountUrl = `/api/meta/insights?user_id=${userId}&type=account&date_preset=${datePreset}`;
      console.log('[IndividualMode] 📡 Fetch account insights:', accountUrl);

      const accountResponse = await fetch(accountUrl);
      console.log('[IndividualMode] 📥 Account response status:', accountResponse.status);

      if (!accountResponse.ok) {
        const errorData = await accountResponse.json();
        console.log('[IndividualMode] ❌ Account response error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch account insights');
      }

      const accountData = await accountResponse.json();
      console.log('[IndividualMode] ✅ Account data:', accountData);
      setAccountInsights(accountData.data);

      // Buscar insights de campanhas
      console.log('[IndividualMode] 📡 Fetch campaigns insights');
      const campaignsResponse = await fetch(
        `/api/meta/insights?user_id=${userId}&type=campaigns&date_preset=${datePreset}`
      );

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        console.log('[IndividualMode] ✅ Campaigns data:', campaignsData);
        setCampaignsInsights(campaignsData.data || []);
      }

      // Buscar insights diários
      console.log('[IndividualMode] 📡 Fetch daily insights');
      const dailyResponse = await fetch(
        `/api/meta/insights?user_id=${userId}&type=daily&days=30`
      );

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        console.log('[IndividualMode] ✅ Daily data received');
        setDailyInsights(dailyData.data || []);
      }

      // Buscar ROI
      console.log('[IndividualMode] 📡 Fetch ROI data');
      const roiResponse = await fetch(
        `/api/meta/roi?user_id=${userId}&date_preset=${datePreset}`
      );

      if (roiResponse.ok) {
        const roiResult = await roiResponse.json();
        console.log('[IndividualMode] ✅ ROI data received');
        setRoiData(roiResult.data);
      }

      console.log('[IndividualMode] ✅ fetchInsights completo!');
    } catch (err: any) {
      console.error('[IndividualMode] ❌ Error fetching insights:', err);
      setError(err.message);
      toast.error(err.message || 'Erro ao buscar métricas');
    } finally {
      console.log('[IndividualMode] 🏁 setLoading(false)');
      setLoading(false);
    }
  }, [selectedAccount, userId, datePreset]);

  useEffect(() => {
    console.log('[IndividualMode] 🔄 useEffect triggered - selectedAccount:', selectedAccount?.name);
    if (selectedAccount) {
      console.log('[IndividualMode] ✅ Chamando fetchInsights');
      fetchInsights();
    } else {
      console.log('[IndividualMode] ⚠️ selectedAccount é null, não vai buscar insights');
    }
  }, [selectedAccount, fetchInsights]);

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
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-3 text-sm font-medium text-gray-600">
          Nenhum dado encontrado para o período selecionado
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Tente selecionar outro período ou verifique se há campanhas ativas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Período, Seletor de Métricas e Exportação */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={datePreset}
            onChange={(e) => onDatePresetChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="last_7d">Últimos 7 dias</option>
            <option value="last_14d">Últimos 14 dias</option>
            <option value="last_30d">Últimos 30 dias</option>
            <option value="this_month">Este mês</option>
            <option value="last_month">Mês passado</option>
            <option value="last_3_months">Últimos 3 meses</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {accountInsights.date_start && accountInsights.date_stop && (
            <div className="text-xs text-gray-500">
              {new Date(accountInsights.date_start).toLocaleDateString('pt-BR')} até{' '}
              {new Date(accountInsights.date_stop).toLocaleDateString('pt-BR')}
            </div>
          )}
          <MetricsSelector
            selectedMetrics={selectedMetrics}
            onMetricsChange={setSelectedMetrics}
          />
          <ExportButton
            accountInsights={accountInsights}
            campaignsInsights={campaignsInsights}
            dailyInsights={dailyInsights}
            roiData={roiData}
            datePreset={datePreset}
          />
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gasto Total"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(accountInsights.spend || 0)}
          subtitle={`${(accountInsights.impressions || 0).toLocaleString('pt-BR')} impressões`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />

        <MetricCard
          title="Cliques"
          value={(accountInsights.clicks || 0).toLocaleString('pt-BR')}
          subtitle={`CTR: ${(accountInsights.ctr || 0).toFixed(2)}%`}
          icon={MousePointerClick}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        <MetricCard
          title="CPC Médio"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(accountInsights.cpc || 0)}
          subtitle={`CPM: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(accountInsights.cpm || 0)}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />

        <MetricCard
          title="Alcance"
          value={(accountInsights.reach || 0).toLocaleString('pt-BR')}
          subtitle={`Frequência: ${(accountInsights.frequency || 0).toFixed(2)}`}
          icon={Eye}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* ROAS Card */}
      {accountInsights.roas && accountInsights.roas > 0 && (
        <div className="rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900">
                ROAS (Return on Ad Spend)
              </p>
              <p className="mt-2 text-4xl font-bold text-green-700">
                {accountInsights.roas.toFixed(2)}x
              </p>
              <p className="mt-2 text-sm text-green-700">
                Para cada R$ 1,00 investido, você gerou{' '}
                <span className="font-semibold">
                  R$ {accountInsights.roas.toFixed(2)}
                </span>{' '}
                em conversões
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-green-700">
                Valor de Conversões
              </p>
              <p className="mt-1 text-2xl font-bold text-green-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(accountInsights.conversion_value || 0)}
              </p>
              <div className="mt-2 flex items-center justify-end gap-1 text-xs font-medium text-green-700">
                <TrendingUp className="h-3 w-3" />
                <span>Performando bem</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROI Real */}
      {roiData && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  💰 ROI Real: Ads vs Receita Recuperada
                </h3>
                <p className="mt-2 text-sm text-blue-700">
                  Cruzamento de campanhas Meta Ads com carrinhos abandonados recuperados
                </p>
              </div>
            </div>
          </div>

          <ROISummary roiData={roiData} />

          {roiData.campaigns && roiData.campaigns.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                ROI por Campanha ({roiData.campaigns.length})
              </h3>
              <ROICampaignsTable campaigns={roiData.campaigns} />
            </div>
          )}
        </div>
      )}

      {/* Gráfico Multi-Eixo Avançado */}
      {dailyInsights.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            📈 Performance no Tempo - Análise Multi-Métrica
          </h3>
          <AdvancedMultiAxisChart
            data={dailyInsights}
            selectedMetrics={selectedMetrics}
          />
        </div>
      )}

      {/* Análise de Cohort */}
      {dailyInsights.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              📊 Análise de Cohort Estatística
            </h3>
            <select
              value={cohortMetric}
              onChange={(e) => setCohortMetric(e.target.value as any)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="spend">Gasto</option>
              <option value="conversions">Conversões</option>
              <option value="roas">ROAS</option>
              <option value="cpc">CPC</option>
              <option value="ctr">CTR</option>
            </select>
          </div>
          <CohortAnalysis
            data={dailyInsights}
            metric={cohortMetric}
          />
        </div>
      )}

      {/* Tabela de Campanhas */}
      {campaignsInsights.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Campanhas Ativas ({campaignsInsights.length})
          </h3>
          <CampaignsTable campaigns={campaignsInsights} />
        </div>
      )}

      {/* Empty State para Campanhas */}
      {campaignsInsights.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-600">
            Nenhuma campanha ativa no período
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Crie campanhas no Meta Ads para ver as métricas aqui
          </p>
        </div>
      )}
    </div>
  );
}
