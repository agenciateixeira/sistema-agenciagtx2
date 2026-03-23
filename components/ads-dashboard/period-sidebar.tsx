'use client';

import { useState } from 'react';
import {
  DollarSign,
  MousePointerClick,
  ShoppingCart,
  Receipt,
  Ticket,
  TrendingUp,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface PeriodSidebarProps {
  datePreset: string;
  onDatePresetChange: (preset: string) => void;
  dateRange: { start: string; end: string };
  data: {
    investimento: number;
    cliques: number;
    ctr: number;
    pedidos: number;
    cpa_real: number;
    receita_real: number;
    ticket_medio: number;
    roas_real: number;
    campaigns_count: number;
    // Per channel
    meta_ads_spend: number;
    meta_ads_conversions: number;
    meta_ads_cpa: number;
    // Reconciliation
    conv_reportadas: number;
    pedidos_reais: number;
    gap: number;
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function PeriodSidebar({
  datePreset,
  onDatePresetChange,
  dateRange,
  data,
}: PeriodSidebarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const presets = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last_7d', label: '7d' },
    { value: 'this_month', label: 'MTD' },
    { value: 'last_30d', label: '30d' },
  ];

  return (
    <div className="w-[260px] flex-shrink-0 space-y-4 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Calendar className="h-4 w-4" />
        <span>Histórico</span>
      </div>

      {/* Period selector */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Período</p>
        <div className="flex gap-1">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => onDatePresetChange(p.value)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                datePreset === p.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="mt-2 flex w-full items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          <Calendar className="h-3 w-3" />
          {dateRange.start} → {dateRange.end}
          <ChevronDown className="ml-auto h-3 w-3" />
        </button>
      </div>

      {/* Summary */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-gray-500">Resumo do Período</p>

        <div className="space-y-3">
          <SidebarMetric
            icon={DollarSign}
            label="Investimento"
            value={formatCurrency(data.investimento)}
            sublabel={`${data.campaigns_count} campanhas`}
          />
          <SidebarMetric
            icon={MousePointerClick}
            label="Cliques no Link"
            value={formatNumber(data.cliques)}
            sublabel={`CTR ${data.ctr.toFixed(2)}%`}
            trend={{ value: 0, positive: true }}
          />
          <SidebarMetric
            icon={ShoppingCart}
            label="Pedidos"
            value={String(data.pedidos)}
            sublabel={`CPA R$ ${data.cpa_real.toFixed(2)}`}
          />
          <SidebarMetric
            icon={Receipt}
            label="Receita Real"
            value={formatCurrency(data.receita_real)}
          />
          <SidebarMetric
            icon={Ticket}
            label="Ticket Médio"
            value={formatCurrency(data.ticket_medio)}
          />
          <SidebarMetric
            icon={TrendingUp}
            label="ROAS Real"
            value={`${data.roas_real.toFixed(1)}x`}
          />
        </div>
      </div>

      {/* Por Canal */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Por Canal</p>
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-gray-700">Meta Ads</span>
            </div>
            <span className="text-xs font-bold text-gray-900">
              {formatCurrency(data.meta_ads_spend)}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-gray-500">
            {data.meta_ads_conversions} conv · CPA {formatCurrency(data.meta_ads_cpa)}
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-blue-200">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Reconciliação */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Reconciliação</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Conv. Reportadas</span>
            <span className="font-medium text-gray-900">{data.conv_reportadas}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pedidos Reais</span>
            <span className="font-medium text-gray-900">{data.pedidos_reais}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gap</span>
            <span className={`font-medium ${data.gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {data.gap > 0 ? '+' : ''}{data.gap}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarMetric({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
}: {
  icon: any;
  label: string;
  value: string;
  sublabel?: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-gray-400" />
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-gray-600">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
        {sublabel && (
          <span className="text-[10px] text-gray-500">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
