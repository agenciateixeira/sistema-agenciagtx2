'use client';

import { useState } from 'react';
import { Calendar, Filter, Search } from 'lucide-react';

export type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'this_month' | 'last_month' | 'lifetime';
export type CampaignStatus = 'all' | 'ACTIVE' | 'PAUSED';

interface AdvancedFiltersProps {
  onFilterChange: (filters: {
    datePreset: DatePreset;
    status: CampaignStatus;
    searchTerm: string;
  }) => void;
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_7d');
  const [status, setStatus] = useState<CampaignStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDateChange = (value: DatePreset) => {
    setDatePreset(value);
    onFilterChange({ datePreset: value, status, searchTerm });
  };

  const handleStatusChange = (value: CampaignStatus) => {
    setStatus(value);
    onFilterChange({ datePreset, status: value, searchTerm });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({ datePreset, status, searchTerm: value });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Filtros</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Filtro de Período */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4" />
            Período
          </label>
          <select
            value={datePreset}
            onChange={(e) => handleDateChange(e.target.value as DatePreset)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="today">Hoje</option>
            <option value="yesterday">Ontem</option>
            <option value="last_7d">Últimos 7 dias</option>
            <option value="last_30d">Últimos 30 dias</option>
            <option value="this_month">Este mês</option>
            <option value="last_month">Mês passado</option>
            <option value="lifetime">Todo período</option>
          </select>
        </div>

        {/* Filtro de Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as CampaignStatus)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="ACTIVE">Ativas</option>
            <option value="PAUSED">Pausadas</option>
          </select>
        </div>

        {/* Busca por Nome */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Search className="h-4 w-4" />
            Buscar campanha
          </label>
          <input
            type="text"
            placeholder="Digite o nome..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
