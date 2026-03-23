'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  Pencil,
  ArrowUpCircle,
  ArrowDownCircle,
  PauseCircle,
  Eye,
  PlayCircle,
  Download,
} from 'lucide-react';
import type { CampaignDecision, DecisionAction } from '@/lib/motor-decisao';

interface MotorDecisaoTableProps {
  campaigns: CampaignDecision[];
  totalSpend: number;
  totalConversions: number;
  avgCpa: number;
  activeAdsetsCount: number;
  userId: string;
  onBudgetUpdated?: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

const DECISION_CONFIG: Record<DecisionAction, {
  label: string;
  icon: any;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  escalar: {
    label: 'Escalar',
    icon: ArrowUpCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  manter: {
    label: 'Manter',
    icon: PlayCircle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  observar: {
    label: 'Observar',
    icon: Eye,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  reduzir: {
    label: 'Reduzir',
    icon: ArrowDownCircle,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  pausar: {
    label: 'Pausar',
    icon: PauseCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
};

export function MotorDecisaoTable({
  campaigns,
  totalSpend,
  totalConversions,
  avgCpa,
  activeAdsetsCount,
  userId,
  onBudgetUpdated,
}: MotorDecisaoTableProps) {
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState('');
  const [viewMode, setViewMode] = useState<'CPA' | 'ROAS'>('CPA');
  const [updatingBudget, setUpdatingBudget] = useState<string | null>(null);

  const updateBudgetViaAPI = useCallback(async (
    campaignId: string,
    newBudgetReais: number,
    campaignName: string
  ) => {
    setUpdatingBudget(campaignId);
    const toastId = toast.loading(`Atualizando verba de "${campaignName}"...`);

    try {
      const response = await fetch(`/api/meta/campaigns/budget?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          budget_amount: newBudgetReais,
          level: 'campaign',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar verba');
      }

      toast.success(
        `Verba de "${campaignName}" atualizada: R$ ${result.data.previous_daily_budget?.toFixed(2) || '?'} → R$ ${result.data.daily_budget?.toFixed(2) || newBudgetReais.toFixed(2)}`,
        { id: toastId, duration: 5000 }
      );

      onBudgetUpdated?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar verba', { id: toastId });
    } finally {
      setUpdatingBudget(null);
    }
  }, [userId, onBudgetUpdated]);

  const applyDecision = useCallback(async (campaign: CampaignDecision) => {
    if (campaign.suggested_budget_change === 0 || campaign.suggested_budget_change === -100) {
      toast.error('Pausar campanha requer ação manual no Meta Ads Manager');
      return;
    }

    // Calculate new budget based on current spend and suggested change
    // spend is for the period, estimate daily budget as spend / 7 (for last_7d)
    const estimatedDailyBudget = campaign.spend / 7;
    const changeMultiplier = 1 + (campaign.suggested_budget_change / 100);
    const newBudget = Math.round(estimatedDailyBudget * changeMultiplier * 100) / 100;

    if (newBudget <= 0) {
      toast.error('Novo valor de verba inválido');
      return;
    }

    await updateBudgetViaAPI(campaign.campaign_id, newBudget, campaign.campaign_name);
  }, [updateBudgetViaAPI]);

  const handleToggle = (campaignId: string) => {
    setExpandedCampaign(prev => prev === campaignId ? null : campaignId);
  };

  const handleStartEdit = (campaignId: string, currentBudget: number) => {
    setEditingBudget(campaignId);
    setBudgetValue(currentBudget.toFixed(2));
  };

  const handleSaveEdit = async (campaignId: string, campaignName: string) => {
    const newBudget = parseFloat(budgetValue);
    if (isNaN(newBudget) || newBudget <= 0) {
      toast.error('Valor inválido');
      return;
    }
    setEditingBudget(null);
    await updateBudgetViaAPI(campaignId, newBudget, campaignName);
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Cenário', 'Gasto', 'CPA Médio', 'CPA Real', 'Conversões', 'Decisão', 'Sugestão'];
    const rows = campaigns.map(c => [
      c.campaign_name,
      c.scenario,
      c.spend.toFixed(2),
      c.cpa_medio.toFixed(2),
      c.cpa_real.toFixed(2),
      c.conversions,
      DECISION_CONFIG[c.decision].label,
      c.suggested_budget_change > 0 ? `+${c.suggested_budget_change}%` : `${c.suggested_budget_change}%`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'motor-decisao.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-gray-900">
            CAMPANHAS — MOTOR DE DECISÃO
          </h3>
          <div className="flex rounded-md border border-gray-200">
            <button
              onClick={() => setViewMode('CPA')}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === 'CPA'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              CPA
            </button>
            <button
              onClick={() => setViewMode('ROAS')}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === 'ROAS'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              ROAS
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            <Download className="h-3 w-3" />
            breakdown CSV
          </button>
          <span className="text-xs text-gray-500">
            {activeAdsetsCount} ad sets ativos
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500">
              <th className="px-4 py-2 text-left font-medium">NOME</th>
              <th className="px-3 py-2 text-left font-medium">CENÁRIO</th>
              <th className="px-3 py-2 text-right font-medium">GASTO</th>
              <th className="px-3 py-2 text-right font-medium">CPA MÉDIO</th>
              <th className="px-3 py-2 text-right font-medium">CPA REAL</th>
              <th className="px-3 py-2 text-right font-medium">CPA INCR.</th>
              <th className="px-3 py-2 text-center font-medium">TENDÊNCIA</th>
              <th className="px-3 py-2 text-center font-medium">DECISÃO</th>
              <th className="px-3 py-2 text-center font-medium">AÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const config = DECISION_CONFIG[campaign.decision];
              const DecisionIcon = config.icon;
              const isExpanded = expandedCampaign === campaign.campaign_id;

              return (
                <>
                  <tr
                    key={campaign.campaign_id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleToggle(campaign.campaign_id)}
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {campaign.campaign_name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            ({campaign.adsets_count} ad sets)
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Scenario */}
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {campaign.scenario}
                    </td>

                    {/* Spend */}
                    <td className="px-3 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(campaign.spend)}
                    </td>

                    {/* CPA Medio */}
                    <td className="px-3 py-3 text-right text-sm text-gray-600">
                      {formatCurrency(campaign.cpa_medio)}
                    </td>

                    {/* CPA Real */}
                    <td className="px-3 py-3 text-right">
                      <span className={`text-sm font-bold ${
                        campaign.cpa_real > campaign.cpa_target
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {campaign.conversions > 0
                          ? formatCurrency(campaign.cpa_real)
                          : '--'}
                      </span>
                    </td>

                    {/* CPA Incremental */}
                    <td className="px-3 py-3 text-right text-sm text-gray-500">
                      {campaign.cpa_incremental > 0
                        ? formatCurrency(campaign.cpa_incremental)
                        : '--'}
                    </td>

                    {/* Trend */}
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center">
                        {campaign.trend === 'improving' ? (
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4 text-green-500" />
                            <svg width="40" height="16" viewBox="0 0 40 16">
                              <path d="M0 14 Q10 10, 20 8 Q30 4, 40 2" stroke="#22c55e" fill="none" strokeWidth="2" />
                            </svg>
                          </div>
                        ) : campaign.trend === 'worsening' ? (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-red-500" />
                            <svg width="40" height="16" viewBox="0 0 40 16">
                              <path d="M0 2 Q10 6, 20 8 Q30 12, 40 14" stroke="#ef4444" fill="none" strokeWidth="2" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Minus className="h-4 w-4 text-gray-400" />
                            <svg width="40" height="16" viewBox="0 0 40 16">
                              <path d="M0 8 Q20 8, 40 8" stroke="#9ca3af" fill="none" strokeWidth="2" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Decision */}
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
                        <DecisionIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                      {campaign.conversions > 0 && (
                        <p className="mt-0.5 text-[10px] text-gray-500">
                          {campaign.conversions} conv
                        </p>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {campaign.suggested_budget_change !== 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applyDecision(campaign);
                            }}
                            disabled={updatingBudget === campaign.campaign_id}
                            className={`rounded-md px-2 py-1 text-xs font-medium transition disabled:opacity-50 ${
                              campaign.suggested_budget_change > 0
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : campaign.suggested_budget_change === -100
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                          >
                            {updatingBudget === campaign.campaign_id
                              ? '...'
                              : campaign.suggested_budget_change === -100
                                ? 'Pausar'
                                : `${campaign.suggested_budget_change > 0 ? '+' : ''}${campaign.suggested_budget_change}%`}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(campaign.campaign_id, campaign.spend);
                          }}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Editar verba"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isExpanded && (
                    <tr key={`${campaign.campaign_id}-expanded`} className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={9} className="px-8 py-4">
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500">Impressões</p>
                            <p className="font-medium text-gray-900">
                              {campaign.impressions.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cliques</p>
                            <p className="font-medium text-gray-900">
                              {campaign.clicks.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">CTR</p>
                            <p className="font-medium text-gray-900">
                              {campaign.ctr.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Frequência</p>
                            <p className={`font-medium ${
                              campaign.frequency > 3 ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {campaign.frequency.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">ROAS</p>
                            <p className="font-medium text-gray-900">
                              {campaign.roas ? `${campaign.roas.toFixed(2)}x` : '--'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Alcance</p>
                            <p className="font-medium text-gray-900">
                              {campaign.reach.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Conversões</p>
                            <p className="font-medium text-gray-900">
                              {campaign.conversions}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Razão</p>
                            <p className="font-medium text-gray-700">
                              {campaign.decision_reason}
                            </p>
                          </div>
                        </div>

                        {/* Edit budget inline */}
                        {editingBudget === campaign.campaign_id && (
                          <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3">
                            <span className="text-xs text-gray-600">Nova verba diária:</span>
                            <input
                              type="number"
                              value={budgetValue}
                              onChange={(e) => setBudgetValue(e.target.value)}
                              className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit(campaign.campaign_id, campaign.campaign_name);
                              }}
                              disabled={updatingBudget === campaign.campaign_id}
                              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {updatingBudget === campaign.campaign_id ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBudget(null);
                              }}
                              className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}

            {/* Total row */}
            <tr className="border-t-2 border-gray-200 bg-gray-50 font-medium">
              <td className="px-4 py-3 text-sm text-gray-900">Total Geral</td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3 text-right text-sm text-gray-900">
                {formatCurrency(totalSpend)}
              </td>
              <td className="px-3 py-3 text-right text-sm text-gray-600">
                {formatCurrency(avgCpa)}
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">
                {totalConversions > 0
                  ? formatCurrency(totalSpend / totalConversions)
                  : '--'}
              </td>
              <td className="px-3 py-3" />
              <td className="px-3 py-3" />
              <td className="px-3 py-3 text-center text-xs text-gray-600">
                {totalConversions} pedidos reais
              </td>
              <td className="px-3 py-3" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
