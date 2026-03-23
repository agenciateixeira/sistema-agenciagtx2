'use client';

import { LayoutGrid, List, Search, ArrowUpDown } from 'lucide-react';

interface CreativeFiltersProps {
  datePreset: string;
  setDatePreset: (v: any) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (v: 'grid' | 'table') => void;
  sortBy: string;
  setSortBy: (v: any) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (v: 'asc' | 'desc') => void;
  filterType: string;
  setFilterType: (v: any) => void;
  filterStatus: string;
  setFilterStatus: (v: any) => void;
  filterFatigue: string;
  setFilterFatigue: (v: any) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  totalResults: number;
}

export function CreativeFilters({
  datePreset,
  setDatePreset,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterFatigue,
  setFilterFatigue,
  searchTerm,
  setSearchTerm,
  totalResults,
}: CreativeFiltersProps) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Linha 1: Busca, período, view mode */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do anúncio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Período */}
        <select
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500"
        >
          <option value="last_7d">Últimos 7 dias</option>
          <option value="last_30d">Últimos 30 dias</option>
          <option value="this_month">Este mês</option>
          <option value="last_month">Mês passado</option>
        </select>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-l-lg px-3 py-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-r-lg px-3 py-2 ${viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Linha 2: Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tipo */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 outline-none"
        >
          <option value="all">Todos os tipos</option>
          <option value="image">Imagens</option>
          <option value="video">Vídeos</option>
          <option value="carousel">Carrossel</option>
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="PAUSED">Pausados</option>
        </select>

        {/* Fadiga */}
        <select
          value={filterFatigue}
          onChange={(e) => setFilterFatigue(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 outline-none"
        >
          <option value="all">Todas as fadigas</option>
          <option value="low">Saudável</option>
          <option value="medium">Atenção</option>
          <option value="high">Fadiga Alta</option>
          <option value="critical">Crítico</option>
        </select>

        {/* Ordenar */}
        <div className="flex items-center gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 outline-none"
          >
            <option value="spend">Ordenar: Gasto</option>
            <option value="ctr">Ordenar: CTR</option>
            <option value="cpc">Ordenar: CPC</option>
            <option value="frequency">Ordenar: Frequência</option>
            <option value="fatigue">Ordenar: Fadiga</option>
            <option value="quality">Ordenar: Quality Score</option>
            <option value="hook_rate">Ordenar: Hook Rate</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100"
            title={sortOrder === 'desc' ? 'Maior para menor' : 'Menor para maior'}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="ml-auto text-xs text-gray-400">{totalResults} criativos</span>
      </div>
    </div>
  );
}
