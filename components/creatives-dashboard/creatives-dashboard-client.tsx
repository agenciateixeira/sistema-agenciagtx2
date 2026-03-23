'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CreativeCard } from './creative-card';
import { CreativesTable } from './creatives-table';
import { FatigueSummary } from './fatigue-summary';
import { CreativeFilters } from './creative-filters';
import { VideoRetentionFunnel } from './video-retention-funnel';
import { DailyPerformanceChart } from './daily-performance-chart';
import { EngagementSummary } from './engagement-summary';
import {
  Loader2,
  AlertCircle,
  Image,
  Video,
  Layers,
  ChevronDown,
  Building2,
  X,
} from 'lucide-react';

interface AdAccount {
  id: string;
  account_id: string;
  name: string;
  business_id?: string;
}

interface CreativesDashboardClientProps {
  userId: string;
  primaryAdAccountId: string;
  adAccounts?: AdAccount[];
}

export function CreativesDashboardClient({
  userId,
  primaryAdAccountId,
  adAccounts = [],
}: CreativesDashboardClientProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(primaryAdAccountId);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [datePreset, setDatePreset] = useState<'last_7d' | 'last_30d' | 'this_month' | 'last_month'>('last_30d');
  const [creatives, setCreatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'spend' | 'ctr' | 'fatigue' | 'frequency' | 'cpc'>('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'carousel'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'PAUSED'>('all');
  const [filterFatigue, setFilterFatigue] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreative, setSelectedCreative] = useState<any | null>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  const fetchCreatives = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accountParam = selectedAccountId !== primaryAdAccountId
        ? `&ad_account_id=${selectedAccountId}`
        : '';
      const response = await fetch(
        `/api/meta/creatives?user_id=${userId}&date_preset=${datePreset}&type=full${accountParam}`
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao buscar criativos');
      }

      const json = await response.json();
      setCreatives(json.data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar criativos');
    } finally {
      setLoading(false);
    }
  }, [datePreset, selectedAccountId, userId, primaryAdAccountId]);

  useEffect(() => {
    fetchCreatives();
  }, [fetchCreatives]);

  // Fetch daily performance for selected creative
  const fetchDailyPerformance = async (adId: string) => {
    setLoadingDaily(true);
    try {
      const res = await fetch(
        `/api/meta/creatives/daily?user_id=${userId}&ad_id=${adId}&date_preset=${datePreset}`
      );
      const json = await res.json();
      setDailyData(json.data || []);
    } catch {
      setDailyData([]);
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleSelectCreative = (creative: any) => {
    if (selectedCreative?.ad_id === creative.ad_id) {
      setSelectedCreative(null);
      setDailyData([]);
    } else {
      setSelectedCreative(creative);
      fetchDailyPerformance(creative.ad_id);
    }
  };

  const handleSwitchAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setShowAccountSelector(false);
    setSelectedCreative(null);
    setDailyData([]);
  };

  // Filtrar e ordenar
  const filtered = creatives
    .filter((c) => {
      if (filterType !== 'all' && c.creative_type !== filterType) return false;
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterFatigue !== 'all' && c.fatigue_level !== filterFatigue) return false;
      if (searchTerm && !c.ad_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case 'spend': aVal = a.insights?.spend || 0; bVal = b.insights?.spend || 0; break;
        case 'ctr': aVal = a.insights?.ctr || 0; bVal = b.insights?.ctr || 0; break;
        case 'fatigue': aVal = a.fatigue_score || 0; bVal = b.fatigue_score || 0; break;
        case 'frequency': aVal = a.insights?.frequency || 0; bVal = b.insights?.frequency || 0; break;
        case 'cpc': aVal = a.insights?.cpc || 0; bVal = b.insights?.cpc || 0; break;
        default: aVal = 0; bVal = 0;
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

  // Resumo
  const totalCreatives = creatives.length;
  const activeCreatives = creatives.filter(c => c.status === 'ACTIVE').length;
  const typeCounts = {
    image: creatives.filter(c => c.creative_type === 'image').length,
    video: creatives.filter(c => c.creative_type === 'video').length,
    carousel: creatives.filter(c => c.creative_type === 'carousel').length,
  };
  const fatigueCounts = {
    low: creatives.filter(c => c.fatigue_level === 'low').length,
    medium: creatives.filter(c => c.fatigue_level === 'medium').length,
    high: creatives.filter(c => c.fatigue_level === 'high').length,
    critical: creatives.filter(c => c.fatigue_level === 'critical').length,
  };

  // Engagement totals
  const engagementTotals = creatives.reduce(
    (acc, c) => {
      const ins = c.insights;
      if (!ins) return acc;
      return {
        likes: acc.likes + (ins.likes || 0),
        comments: acc.comments + (ins.comments || 0),
        shares: acc.shares + (ins.shares || 0),
        saves: acc.saves + (ins.saves || 0),
        link_clicks: acc.link_clicks + (ins.link_clicks || 0),
        impressions: acc.impressions + (ins.impressions || 0),
        video_plays: acc.video_plays + (ins.video_plays || 0),
        video_thru_plays: acc.video_thru_plays + (ins.video_thru_plays || 0),
      };
    },
    { likes: 0, comments: 0, shares: 0, saves: 0, link_clicks: 0, impressions: 0, video_plays: 0, video_thru_plays: 0 }
  );

  const selectedAccountName = adAccounts.find(
    a => (a.account_id || a.id)?.replace('act_', '') === selectedAccountId?.replace('act_', '')
  )?.name;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="mt-4 text-sm text-gray-500">Carregando criativos da Meta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm font-medium text-red-800">{error}</p>
        <button
          onClick={fetchCreatives}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Switcher */}
      {adAccounts.length > 1 && (
        <div className="relative">
          <button
            onClick={() => setShowAccountSelector(!showAccountSelector)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-green-300 hover:bg-green-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedAccountName || 'Conta selecionada'}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {selectedAccountId?.replace('act_', '')} · {adAccounts.length} contas disponíveis
                </p>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showAccountSelector ? 'rotate-180' : ''}`} />
          </button>

          {showAccountSelector && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {adAccounts.map((acct) => {
                const acctId = (acct.account_id || acct.id || '').replace('act_', '');
                const isActive = acctId === selectedAccountId?.replace('act_', '');
                return (
                  <button
                    key={acctId}
                    onClick={() => handleSwitchAccount(acctId)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
                      isActive ? 'bg-green-50 border-l-2 border-green-500' : ''
                    }`}
                  >
                    <Building2 className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isActive ? 'text-green-700' : 'text-gray-900'}`}>
                        {acct.name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {acctId}</p>
                    </div>
                    {isActive && (
                      <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        Ativa
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Resumo por tipo */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCreatives}</p>
              <p className="text-xs text-gray-500">Total de Criativos</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Layers className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCreatives}</p>
              <p className="text-xs text-gray-500">Ativos</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Image className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{typeCounts.image}</p>
              <p className="text-xs text-gray-500">Imagens</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
              <Video className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{typeCounts.video}</p>
              <p className="text-xs text-gray-500">Vídeos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Summary */}
      <EngagementSummary totals={engagementTotals} />

      {/* Fadiga Summary */}
      <FatigueSummary counts={fatigueCounts} total={totalCreatives} />

      {/* Filtros e controles */}
      <CreativeFilters
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterFatigue={filterFatigue}
        setFilterFatigue={setFilterFatigue}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalResults={filtered.length}
      />

      {/* Lista de criativos */}
      <p className="text-xs text-gray-500">
        Clique em um criativo para ver o funil de retenção de vídeo e a performance diária
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-sm text-gray-500">Nenhum criativo encontrado para os filtros selecionados</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creative) => (
            <div
              key={creative.ad_id}
              onClick={() => handleSelectCreative(creative)}
              className={`cursor-pointer rounded-lg transition-all ${
                selectedCreative?.ad_id === creative.ad_id
                  ? 'ring-2 ring-green-500 ring-offset-2'
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
            >
              <CreativeCard creative={creative} />
            </div>
          ))}
        </div>
      ) : (
        <CreativesTable creatives={filtered} onSelectCreative={handleSelectCreative} selectedAdId={selectedCreative?.ad_id} />
      )}

      {/* Detail Panel for Selected Creative */}
      {selectedCreative && (
        <div className="space-y-6 rounded-xl border-2 border-green-200 bg-green-50/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Detalhes: {selectedCreative.ad_name}
              </h3>
              <p className="text-sm text-gray-500">{selectedCreative.insights?.campaign_name}</p>
            </div>
            <button
              onClick={() => { setSelectedCreative(null); setDailyData([]); }}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Video Retention Funnel */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Funil de Retenção de Vídeo
              </h4>
              <VideoRetentionFunnel insights={selectedCreative.insights} />
            </div>

            {/* Engagement Breakdown */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Engajamento do Criativo
              </h4>
              <CreativeEngagementDetail insights={selectedCreative.insights} />
            </div>
          </div>

          {/* Daily Performance Chart */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Performance ao Longo do Tempo
            </h4>
            {loadingDaily ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                <span className="ml-3 text-sm text-gray-500">Carregando dados diários...</span>
              </div>
            ) : (
              <DailyPerformanceChart data={dailyData} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline: Creative Engagement Detail ──────────────────

function CreativeEngagementDetail({ insights }: { insights: any }) {
  if (!insights) {
    return <p className="py-8 text-center text-sm text-gray-400">Sem dados de engajamento</p>;
  }

  const totalEngagement = (insights.likes || 0) + (insights.comments || 0) + (insights.shares || 0);
  const engagementRate = insights.impressions > 0
    ? ((totalEngagement / insights.impressions) * 100).toFixed(2)
    : '0.00';

  const items = [
    { label: 'Curtidas / Reações', value: insights.likes || 0, color: 'text-pink-600 bg-pink-50' },
    { label: 'Comentários', value: insights.comments || 0, color: 'text-amber-600 bg-amber-50' },
    { label: 'Compartilhamentos', value: insights.shares || 0, color: 'text-green-600 bg-green-50' },
    { label: 'Cliques no link', value: insights.link_clicks || 0, color: 'text-blue-600 bg-blue-50' },
    { label: 'Salvamentos', value: insights.saves || 0, color: 'text-purple-600 bg-purple-50' },
    { label: 'Cliques totais', value: insights.clicks || 0, color: 'text-cyan-600 bg-cyan-50' },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-xs font-medium text-gray-500">Taxa de Engajamento</p>
        <p className="mt-1 text-3xl font-bold text-green-600">{engagementRate}%</p>
        <p className="mt-1 text-[10px] text-gray-400">(curtidas + comentários + shares) / impressões</p>
      </div>

      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between rounded-lg p-2.5 transition hover:bg-gray-50">
          <span className="text-sm text-gray-700">{item.label}</span>
          <span className={`rounded-lg px-3 py-1 text-sm font-bold ${item.color}`}>
            {new Intl.NumberFormat('pt-BR').format(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
