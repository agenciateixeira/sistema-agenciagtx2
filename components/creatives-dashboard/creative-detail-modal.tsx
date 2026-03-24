'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye, Zap, Heart, MessageCircle, Share2, Bookmark, ExternalLink, Users, Repeat, Target } from 'lucide-react';
import { AIAnalyzeButton } from '@/components/creative-analytics/ai-analyze-button';
import { AnalysisInsightsPanel } from '@/components/creative-analytics/analysis-insights-panel';
import { QualityScoreBadge } from './quality-score-badge';
import { VideoRetentionFunnel } from './video-retention-funnel';
import { HookHoldRates } from './hook-hold-rates';
import { FatigueCurveChart } from './fatigue-curve-chart';
import { WeeklyPhaseAnalysis } from './weekly-phase-analysis';
import { PlacementBreakdown } from './placement-breakdown';
import { DailyPerformanceChart } from './daily-performance-chart';

interface CreativeDetailModalProps {
  creative: any;
  userId: string;
  adAccountId: string;
  datePreset: string;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`;
}

export function CreativeDetailModal({ creative, userId, adAccountId, datePreset, onClose }: CreativeDetailModalProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyPhases, setWeeklyPhases] = useState<any[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'placements' | 'analysis'>('overview');

  const insights = creative.insights || {};

  // Fetch daily performance
  useEffect(() => {
    const fetchDailyPerformance = async () => {
      setLoadingDaily(true);
      try {
        const res = await fetch(
          `/api/meta/creatives/daily?user_id=${userId}&ad_id=${creative.ad_id}&date_preset=${datePreset}`
        );
        const json = await res.json();
        setDailyData(json.data || []);
        setWeeklyPhases(json.weekly_phases || []);
      } catch {
        setDailyData([]);
        setWeeklyPhases([]);
      } finally {
        setLoadingDaily(false);
      }
    };

    fetchDailyPerformance();
  }, [userId, creative.ad_id, datePreset]);

  const handleAnalysisComplete = (analysisData: any) => {
    setAnalysis(analysisData);
  };

  // Calculate engagement metrics
  const totalEngagement = (insights.likes || 0) + (insights.comments || 0) + (insights.shares || 0);
  const engagementRate = insights.impressions > 0
    ? ((totalEngagement / insights.impressions) * 100).toFixed(2)
    : '0.00';

  // Fatigue badge
  const fatigueColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative h-[90vh] w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 p-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{creative.ad_name}</h2>
              <QualityScoreBadge
                score={creative.quality_score || 0}
                level={creative.quality_level || 'poor'}
                size="md"
              />
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${fatigueColors[creative.fatigue_level || 'low']}`}>
                Fadiga: {creative.fatigue_level || 'Baixa'}
              </span>
              {creative.status === 'ACTIVE' && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Ativo
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">{insights.campaign_name}</p>
            <p className="text-xs text-gray-500">ID: {creative.ad_id}</p>
          </div>
          <div className="flex items-center gap-2">
            <AIAnalyzeButton
              userId={userId}
              adId={creative.ad_id}
              adAccountId={adAccountId}
              creativeUrl={creative.thumbnail_url || creative.image_url || creative.video_url}
              creativeType={creative.creative_type}
              onAnalysisComplete={handleAnalysisComplete}
              variant="compact"
            />
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === 'overview' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === 'performance' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Performance ao Longo do Tempo
          </button>
          <button
            onClick={() => setActiveTab('placements')}
            className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === 'placements' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Posicionamentos
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === 'analysis' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Análise de IA
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(90vh-160px)] overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Creative Preview + Main Metrics */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Creative Preview */}
                <div className="lg:col-span-1">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Criativo
                    </h3>
                    {creative.creative_type === 'video' && creative.video_url ? (
                      <video
                        src={creative.video_url}
                        controls
                        className="w-full rounded-lg"
                        poster={creative.thumbnail_url}
                      />
                    ) : creative.image_url ? (
                      <img
                        src={creative.image_url}
                        alt={creative.ad_name}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                        <p className="text-sm text-gray-500">Sem preview disponível</p>
                      </div>
                    )}
                    {creative.body && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-500">Texto do anúncio:</p>
                        <p className="mt-1 text-sm text-gray-700">{creative.body}</p>
                      </div>
                    )}
                    {creative.link_url && (
                      <a
                        href={creative.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver link do anúncio
                      </a>
                    )}
                  </div>
                </div>

                {/* Main Metrics Grid */}
                <div className="lg:col-span-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Spend */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Gasto Total</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatCurrency(insights.spend || 0)}
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </div>

                    {/* Impressions */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Impressões</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatNumber(insights.impressions || 0)}
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                          <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Reach */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Alcance</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatNumber(insights.reach || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Frequência: {(insights.frequency || 0).toFixed(2)}x
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    {/* CTR */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">CTR (Taxa de Clique)</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatPercentage(insights.ctr || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatNumber(insights.clicks || 0)} cliques
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                          <MousePointerClick className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    {/* CPC */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">CPC (Custo por Clique)</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatCurrency(insights.cpc || 0)}
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                          <Target className="h-6 w-6 text-teal-600" />
                        </div>
                      </div>
                    </div>

                    {/* CPM */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">CPM (Custo por Mil)</p>
                          <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatCurrency(insights.cpm || 0)}
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                          <Zap className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                    </div>

                    {/* Messaging Conversations */}
                    {(insights.messaging_conversation_started_7d || insights.onsite_conversion_messaging_conversation_started_7d) && (
                      <>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Mensagens Iniciadas (7d)</p>
                              <p className="mt-1 text-2xl font-bold text-blue-600">
                                {formatNumber(insights.messaging_conversation_started_7d || 0)}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                              <MessageCircle className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Conversões de Mensagens (7d)</p>
                              <p className="mt-1 text-2xl font-bold text-purple-600">
                                {formatNumber(insights.onsite_conversion_messaging_conversation_started_7d || 0)}
                              </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                              <MessageCircle className="h-6 w-6 text-purple-600" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Engajamento
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Curtidas / Reações</p>
                        <p className="mt-1 text-xl font-bold text-pink-600">
                          {formatNumber(insights.likes || 0)}
                        </p>
                      </div>
                      <Heart className="h-8 w-8 text-pink-400" />
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Comentários</p>
                        <p className="mt-1 text-xl font-bold text-amber-600">
                          {formatNumber(insights.comments || 0)}
                        </p>
                      </div>
                      <MessageCircle className="h-8 w-8 text-amber-400" />
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Compartilhamentos</p>
                        <p className="mt-1 text-xl font-bold text-green-600">
                          {formatNumber(insights.shares || 0)}
                        </p>
                      </div>
                      <Share2 className="h-8 w-8 text-green-400" />
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Salvamentos</p>
                        <p className="mt-1 text-xl font-bold text-purple-600">
                          {formatNumber(insights.saves || 0)}
                        </p>
                      </div>
                      <Bookmark className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-xs font-medium text-gray-500">Taxa de Engajamento</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">{engagementRate}%</p>
                  <p className="mt-1 text-[10px] text-gray-400">
                    (curtidas + comentários + compartilhamentos) / impressões
                  </p>
                </div>
              </div>

              {/* Video Metrics (if video) */}
              {creative.creative_type === 'video' && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Hook Rate & Hold Rate
                    </h3>
                    <HookHoldRates insights={insights} />
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Funil de Retenção
                    </h3>
                    <VideoRetentionFunnel insights={insights} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {loadingDaily ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  <span className="ml-3 text-sm text-gray-500">Carregando dados...</span>
                </div>
              ) : (
                <>
                  {dailyData.length >= 3 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Curva de Fadiga (Evolução ao Longo do Tempo)
                      </h3>
                      <FatigueCurveChart data={dailyData} />
                    </div>
                  )}

                  {weeklyPhases.length >= 2 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Custo por Resultado por Fase (Semana a Semana)
                      </h3>
                      <WeeklyPhaseAnalysis phases={weeklyPhases} />
                    </div>
                  )}

                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Performance Diária
                    </h3>
                    <DailyPerformanceChart data={dailyData} />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'placements' && (
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Performance por Posicionamento
              </h3>
              <PlacementBreakdown
                userId={userId}
                adAccountId={adAccountId}
                datePreset={datePreset}
                adId={creative.ad_id}
              />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {analysis ? (
                <AnalysisInsightsPanel analysis={analysis} />
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    Análise de IA Indisponível
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Clique no botão "IA" no canto superior direito para gerar uma análise detalhada deste criativo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
