'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CreativeCard } from './creative-card';
import { CreativesTable } from './creatives-table';
import { FatigueSummary } from './fatigue-summary';
import { CreativeFilters } from './creative-filters';
import {
  Loader2,
  AlertCircle,
  LayoutGrid,
  List,
  Image,
  Video,
  Layers,
} from 'lucide-react';

interface CreativesDashboardClientProps {
  userId: string;
  primaryAdAccountId: string;
}

export function CreativesDashboardClient({
  userId,
  primaryAdAccountId,
}: CreativesDashboardClientProps) {
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

  useEffect(() => {
    fetchCreatives();
  }, [datePreset]);

  const fetchCreatives = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/meta/creatives?user_id=${userId}&date_preset=${datePreset}&type=full`
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
        case 'spend':
          aVal = a.insights?.spend || 0;
          bVal = b.insights?.spend || 0;
          break;
        case 'ctr':
          aVal = a.insights?.ctr || 0;
          bVal = b.insights?.ctr || 0;
          break;
        case 'fatigue':
          aVal = a.fatigue_score || 0;
          bVal = b.fatigue_score || 0;
          break;
        case 'frequency':
          aVal = a.insights?.frequency || 0;
          bVal = b.insights?.frequency || 0;
          break;
        case 'cpc':
          aVal = a.insights?.cpc || 0;
          bVal = b.insights?.cpc || 0;
          break;
        default:
          aVal = 0;
          bVal = 0;
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
      {filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-sm text-gray-500">Nenhum criativo encontrado para os filtros selecionados</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creative) => (
            <CreativeCard key={creative.ad_id} creative={creative} />
          ))}
        </div>
      ) : (
        <CreativesTable creatives={filtered} />
      )}
    </div>
  );
}
