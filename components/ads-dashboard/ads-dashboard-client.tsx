'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PeriodSidebar } from './period-sidebar';
import { AlertBanner } from './alert-banner';
import { AccountTemperature } from './account-temperature';
import { KPICardsRow } from './kpi-cards-row';
import { MotorDecisaoTable } from './motor-decisao-table';
import { CohortPanel } from './cohort-panel';
import { DailyPerformanceChart } from './daily-performance-chart';
import { CampaignsTable } from './campaigns-table';
import { CompareMode } from './compare-mode';
import { ConsolidatedMode } from './consolidated-mode';
import { ExportButton } from './export-button';
import { AccountSelector } from './account-selector';
import { analyzeMotorDecisao } from '@/lib/motor-decisao';
import {
  Loader2,
  AlertCircle,
  Settings2,
} from 'lucide-react';

interface AdsDashboardClientProps {
  userId: string;
  primaryAdAccountId: string;
}

export function AdsDashboardClient({
  userId,
  primaryAdAccountId,
}: AdsDashboardClientProps) {
  const [datePreset, setDatePreset] = useState<string>('last_7d');
  const [accountInsights, setAccountInsights] = useState<any>(null);
  const [campaignsInsights, setCampaignsInsights] = useState<any[]>([]);
  const [dailyInsights, setDailyInsights] = useState<any[]>([]);
  const [roiData, setRoiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cpaTarget, setCpaTarget] = useState(60);
  const [showSettings, setShowSettings] = useState(false);

  // Multi-conta
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(primaryAdAccountId);
  const [viewMode, setViewMode] = useState<'single' | 'compare' | 'consolidated'>('single');

  useEffect(() => {
    loadAvailableAccounts();
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [datePreset, selectedAccountId]);

  const loadAvailableAccounts = async () => {
    try {
      const response = await fetch(`/api/meta/ad-accounts?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleAccountChange = async (accountId: string) => {
    setSelectedAccountId(accountId);
    const toastId = toast.loading('Trocando conta...');
    try {
      const response = await fetch('/api/meta/set-primary-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_account_id: accountId }),
      });
      if (response.ok) {
        toast.success('Conta alterada com sucesso!', { id: toastId });
      } else {
        throw new Error('Failed to set primary account');
      }
    } catch (error) {
      console.error('Error setting primary account:', error);
      toast.error('Erro ao trocar conta.', { id: toastId });
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const accountResponse = await fetch(
        `/api/meta/insights?user_id=${userId}&type=account&date_preset=${datePreset}`
      );

      if (!accountResponse.ok) {
        const errorData = await accountResponse.json();
        throw new Error(errorData.error || 'Failed to fetch account insights');
      }

      const accountData = await accountResponse.json();
      setAccountInsights(accountData.data);

      const campaignsResponse = await fetch(
        `/api/meta/insights?user_id=${userId}&type=campaigns&date_preset=${datePreset}`
      );

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaignsInsights(campaignsData.data || []);
      }

      const dailyResponse = await fetch(
        `/api/meta/insights?user_id=${userId}&type=daily&days=30`
      );

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        setDailyInsights(dailyData.data || []);
      }

      const roiResponse = await fetch(
        `/api/meta/roi?user_id=${userId}&date_preset=${datePreset}`
      );

      if (roiResponse.ok) {
        const roiResult = await roiResponse.json();
        setRoiData(roiResult.data);
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

  // Motor de Decisão
  const motorResult = analyzeMotorDecisao(campaignsInsights, cpaTarget);

  // Cohort data (from daily insights)
  const cohortData = buildCohortData(dailyInsights, accountInsights);

  // Calculate sidebar data
  const sidebarData = {
    investimento: accountInsights.spend,
    cliques: accountInsights.clicks,
    ctr: accountInsights.ctr,
    pedidos: motorResult.total_conversions,
    cpa_real: motorResult.overall_cpa_real,
    receita_real: roiData?.total_revenue || (accountInsights.conversion_value || 0),
    ticket_medio: motorResult.total_conversions > 0
      ? (roiData?.total_revenue || accountInsights.conversion_value || 0) / motorResult.total_conversions
      : 0,
    roas_real: motorResult.roas_overall || 0,
    campaigns_count: campaignsInsights.length,
    meta_ads_spend: accountInsights.spend,
    meta_ads_conversions: motorResult.total_conversions,
    meta_ads_cpa: motorResult.overall_cpa_real,
    conv_reportadas: motorResult.total_conversions,
    pedidos_reais: roiData?.real_orders || motorResult.total_conversions,
    gap: roiData
      ? Math.round(((roiData.real_orders - motorResult.total_conversions) / Math.max(motorResult.total_conversions, 1)) * 100)
      : 0,
  };

  // Motor decisão summary
  const escalarCount = motorResult.campaigns.filter(c => c.decision === 'escalar').length;
  const motorDecisaoLabel = escalarCount > 0
    ? `${escalarCount} escalar`
    : `${motorResult.campaigns.filter(c => c.decision === 'manter').length} manter`;

  // Date label
  const today = new Date();
  const dayNames = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dateLabel = `${dayNames[today.getDay()]}, ${today.getDate()} De ${monthNames[today.getMonth()]}`;

  const receita = roiData?.total_revenue || accountInsights.conversion_value || 0;

  // View mode handling
  if (viewMode === 'compare') {
    return (
      <div className="space-y-4">
        <ViewModeBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          availableAccounts={availableAccounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={handleAccountChange}
        />
        <CompareMode
          userId={userId}
          availableAccounts={availableAccounts}
          datePreset={datePreset}
        />
      </div>
    );
  }

  if (viewMode === 'consolidated') {
    return (
      <div className="space-y-4">
        <ViewModeBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          availableAccounts={availableAccounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={handleAccountChange}
        />
        <ConsolidatedMode
          userId={userId}
          availableAccounts={availableAccounts}
          datePreset={datePreset}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Left Sidebar - Period */}
      <PeriodSidebar
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        dateRange={{
          start: accountInsights.date_start || '',
          end: accountInsights.date_stop || '',
        }}
        data={sidebarData}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Account selector + view mode */}
        <ViewModeBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          availableAccounts={availableAccounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={handleAccountChange}
        />

        {/* Alert Banner */}
        <AlertBanner
          cpaReal={motorResult.overall_cpa_real}
          cpaTarget={cpaTarget}
          totalSpend={motorResult.total_spend}
          totalConversions={motorResult.total_conversions}
          roas={motorResult.roas_overall}
          receita={receita}
          campaignsCount={campaignsInsights.length}
          motorDecisao={motorDecisaoLabel}
          dateLabel={dateLabel}
        />

        {/* Temperature */}
        <AccountTemperature
          cpaReal={motorResult.overall_cpa_real}
          cpaTarget={cpaTarget}
          frequency={accountInsights.frequency}
          ctr={accountInsights.ctr}
          roas={motorResult.roas_overall}
        />

        {/* KPI Cards */}
        <KPICardsRow
          investimentoTotal={accountInsights.spend}
          investimentoCampanhas={campaignsInsights.length}
          pedidosReais={motorResult.total_conversions}
          cpaReal={motorResult.overall_cpa_real}
          roasReal={motorResult.roas_overall}
          metaReportaRoas={accountInsights.roas || null}
          receitaReal={receita}
          ticketMedio={motorResult.total_conversions > 0 ? receita / motorResult.total_conversions : 0}
        />

        {/* CPA Target Settings */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">CPA Alvo:</span>
            {showSettings ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={cpaTarget}
                  onChange={(e) => setCpaTarget(Number(e.target.value))}
                  className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSettings(true)}
                className="text-sm font-bold text-gray-900 hover:underline"
              >
                R$ {cpaTarget.toFixed(2)}
              </button>
            )}
          </div>
          <ExportButton
            accountInsights={accountInsights}
            campaignsInsights={campaignsInsights}
            dailyInsights={dailyInsights}
            roiData={roiData}
            datePreset={datePreset}
          />
        </div>

        {/* Motor de Decisão Table */}
        <MotorDecisaoTable
          campaigns={motorResult.campaigns}
          totalSpend={motorResult.total_spend}
          totalConversions={motorResult.total_conversions}
          avgCpa={motorResult.avg_cpa}
          activeAdsetsCount={motorResult.campaigns.reduce((s, c) => s + c.adsets_count, 0)}
          userId={userId}
          onBudgetUpdated={() => {
            // Recarregar dados após alteração de verba
            fetchInsights();
          }}
        />

        {/* Daily Performance Chart */}
        {dailyInsights.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-900">
              Performance Diária
            </h3>
            <DailyPerformanceChart data={dailyInsights} />
          </div>
        )}
      </div>

      {/* Right Sidebar - Cohort */}
      <CohortPanel
        cohortStart={cohortData.start}
        cohortEnd={cohortData.end}
        totalConversions={motorResult.total_conversions}
        totalRevenue={receita}
        totalSpend={accountInsights.spend}
        data={cohortData.data}
      />
    </div>
  );
}

// Helper: Build cohort data from daily insights
function buildCohortData(dailyInsights: any[], accountInsights: any) {
  const sorted = [...dailyInsights].sort((a, b) =>
    new Date(a.date_start || a.date || '').getTime() - new Date(b.date_start || b.date || '').getTime()
  );

  const totalConversions = sorted.reduce((s, d) => {
    const conv = d.actions?.reduce((sum: number, a: any) => {
      if (['lead', 'purchase', 'offsite_conversion.fb_pixel_lead',
           'onsite_conversion.messaging_first_reply'].includes(a.action_type)) {
        return sum + parseInt(a.value || 0);
      }
      return sum;
    }, 0) || d.conversions || 0;
    return s + conv;
  }, 0);

  const totalSpend = sorted.reduce((s, d) => s + parseFloat(d.spend || 0), 0);

  // Simulate cohort maturation (D0 to D28)
  const cohortDays = ['D0', 'D1', 'D3', 'D7', 'D14', 'D28'];
  const maturationRates = [0.86, 0.91, 0.97, 1.0, 1.0, 1.0]; // Typical maturation curve
  const estimatedFinalConversions = totalConversions > 0 ? Math.round(totalConversions / 0.86) : 0;

  const data = cohortDays.map((day, i) => {
    const conv = Math.round(estimatedFinalConversions * maturationRates[i]);
    const rate = totalSpend > 0 && conv > 0 ? (conv / (accountInsights?.clicks || 1)) * 100 : 0;
    return {
      day,
      conversions: conv,
      revenue: 0,
      convRate: rate,
      cpa: conv > 0 ? totalSpend / conv : 0,
      maturationPercent: maturationRates[i] * 100,
    };
  });

  const start = sorted.length > 0
    ? (sorted[0].date_start || sorted[0].date || '').slice(5)
    : '';
  const end = sorted.length > 0
    ? (sorted[sorted.length - 1].date_start || sorted[sorted.length - 1].date || '').slice(5)
    : '';

  return { data, start, end };
}

// View mode bar component
function ViewModeBar({
  viewMode,
  setViewMode,
  availableAccounts,
  selectedAccountId,
  onAccountChange,
}: {
  viewMode: string;
  setViewMode: (mode: 'single' | 'compare' | 'consolidated') => void;
  availableAccounts: any[];
  selectedAccountId: string;
  onAccountChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <select
          value={selectedAccountId}
          onChange={(e) => onAccountChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
        >
          {availableAccounts.map((account) => (
            <option key={account.id} value={account.account_id || account.id.replace('act_', '')}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        {(['single', 'compare', 'consolidated'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              viewMode === mode
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {mode === 'single' ? 'Individual' : mode === 'compare' ? 'Comparar' : 'Consolidado'}
          </button>
        ))}
      </div>
    </div>
  );
}
