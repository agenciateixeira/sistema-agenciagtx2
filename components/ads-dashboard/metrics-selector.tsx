'use client';

import { useState } from 'react';
import { Check, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricConfig {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'cost' | 'engagement' | 'conversion';
  defaultVisible: boolean;
}

export const AVAILABLE_METRICS: MetricConfig[] = [
  // Performance
  { id: 'spend', name: 'Gasto', description: 'Total investido em anúncios', category: 'performance', defaultVisible: true },
  { id: 'impressions', name: 'Impressões', description: 'Número de vezes que o anúncio foi exibido', category: 'performance', defaultVisible: true },
  { id: 'reach', name: 'Alcance', description: 'Pessoas únicas que viram o anúncio', category: 'performance', defaultVisible: true },
  { id: 'frequency', name: 'Frequência', description: 'Média de vezes que cada pessoa viu o anúncio', category: 'performance', defaultVisible: false },

  // Cost
  { id: 'cpc', name: 'CPC', description: 'Custo por clique', category: 'cost', defaultVisible: true },
  { id: 'cpm', name: 'CPM', description: 'Custo por mil impressões', category: 'cost', defaultVisible: true },
  { id: 'cpp', name: 'CPP', description: 'Custo por pessoa alcançada', category: 'cost', defaultVisible: false },

  // Engagement
  { id: 'clicks', name: 'Cliques', description: 'Total de cliques no anúncio', category: 'engagement', defaultVisible: true },
  { id: 'ctr', name: 'CTR', description: 'Taxa de cliques (clicks/impressions)', category: 'engagement', defaultVisible: true },
  { id: 'link_clicks', name: 'Cliques no Link', description: 'Cliques específicos no link do anúncio', category: 'engagement', defaultVisible: false },
  { id: 'engagement_rate', name: 'Taxa de Engajamento', description: 'Engajamentos / Alcance', category: 'engagement', defaultVisible: false },

  // Conversion
  { id: 'conversions', name: 'Conversões', description: 'Total de conversões rastreadas', category: 'conversion', defaultVisible: true },
  { id: 'conversion_rate', name: 'Taxa de Conversão', description: 'Conversões / Cliques', category: 'conversion', defaultVisible: true },
  { id: 'roas', name: 'ROAS', description: 'Return on Ad Spend', category: 'conversion', defaultVisible: true },
  { id: 'conversion_value', name: 'Valor das Conversões', description: 'Receita gerada pelas conversões', category: 'conversion', defaultVisible: true },
  { id: 'cost_per_conversion', name: 'Custo por Conversão', description: 'Gasto / Conversões', category: 'conversion', defaultVisible: false },
];

interface MetricsSelectorProps {
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export function MetricsSelector({ selectedMetrics, onMetricsChange }: MetricsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = {
    performance: 'Performance',
    cost: 'Custos',
    engagement: 'Engajamento',
    conversion: 'Conversão'
  };

  const toggleMetric = (metricId: string) => {
    if (selectedMetrics.includes(metricId)) {
      // Garantir que pelo menos 3 métricas fiquem selecionadas
      if (selectedMetrics.length > 3) {
        onMetricsChange(selectedMetrics.filter(id => id !== metricId));
      }
    } else {
      // Limitar a 8 métricas selecionadas
      if (selectedMetrics.length < 8) {
        onMetricsChange([...selectedMetrics, metricId]);
      }
    }
  };

  const selectPreset = (preset: 'basic' | 'advanced' | 'conversion' | 'cost') => {
    const presets = {
      basic: ['spend', 'impressions', 'clicks', 'ctr', 'cpc'],
      advanced: ['spend', 'reach', 'frequency', 'ctr', 'conversions', 'roas', 'cpm'],
      conversion: ['spend', 'conversions', 'conversion_rate', 'roas', 'conversion_value', 'cost_per_conversion'],
      cost: ['spend', 'cpc', 'cpm', 'cpp', 'clicks', 'impressions']
    };
    onMetricsChange(presets[preset]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        <Settings2 className="h-4 w-4" />
        <span>Personalizar Métricas</span>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {selectedMetrics.length}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-[500px] rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Personalizar Métricas</h3>
              <p className="mt-1 text-xs text-gray-500">
                Selecione de 3 a 8 métricas para visualizar nos gráficos e tabelas
              </p>
            </div>

            {/* Presets */}
            <div className="border-b border-gray-100 px-6 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Presets Rápidos
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => selectPreset('basic')}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  <div className="font-semibold text-gray-900">Básico</div>
                  <div className="text-gray-500">Gasto, Impressões, Cliques, CTR, CPC</div>
                </button>
                <button
                  onClick={() => selectPreset('advanced')}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  <div className="font-semibold text-gray-900">Avançado</div>
                  <div className="text-gray-500">Alcance, Frequência, ROAS, CPM</div>
                </button>
                <button
                  onClick={() => selectPreset('conversion')}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  <div className="font-semibold text-gray-900">Conversão</div>
                  <div className="text-gray-500">Foco em conversões e ROAS</div>
                </button>
                <button
                  onClick={() => selectPreset('cost')}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  <div className="font-semibold text-gray-900">Custos</div>
                  <div className="text-gray-500">CPC, CPM, CPP, Cliques</div>
                </button>
              </div>
            </div>

            {/* Métricas por Categoria */}
            <div className="max-h-[400px] overflow-y-auto px-6 py-4">
              {Object.entries(categories).map(([categoryKey, categoryName]) => {
                const categoryMetrics = AVAILABLE_METRICS.filter(m => m.category === categoryKey);

                return (
                  <div key={categoryKey} className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {categoryName}
                    </p>
                    <div className="space-y-1">
                      {categoryMetrics.map((metric) => {
                        const isSelected = selectedMetrics.includes(metric.id);
                        const canToggle = isSelected || selectedMetrics.length < 8;

                        return (
                          <button
                            key={metric.id}
                            onClick={() => canToggle && toggleMetric(metric.id)}
                            disabled={!canToggle}
                            className={cn(
                              'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition',
                              isSelected
                                ? 'bg-brand-50 text-brand-900'
                                : canToggle
                                ? 'hover:bg-gray-50'
                                : 'cursor-not-allowed opacity-50'
                            )}
                          >
                            <div
                              className={cn(
                                'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition',
                                isSelected
                                  ? 'border-brand-600 bg-brand-600'
                                  : 'border-gray-300 bg-white'
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                              <p className="text-xs text-gray-500">{metric.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {selectedMetrics.length}/8 métricas selecionadas
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
