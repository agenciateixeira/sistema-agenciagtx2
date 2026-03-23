'use client';

import { useState } from 'react';
import { X, ArrowRight, Trophy } from 'lucide-react';
import { QualityScoreBadge } from './quality-score-badge';

interface ABComparisonProps {
  creatives: any[];
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function MetricRow({
  label,
  valueA,
  valueB,
  format = 'number',
  higherIsBetter = true,
}: {
  label: string;
  valueA: number;
  valueB: number;
  format?: 'number' | 'currency' | 'percent' | 'decimal';
  higherIsBetter?: boolean;
}) {
  const formatFn = (v: number) => {
    switch (format) {
      case 'currency': return formatCurrency(v);
      case 'percent': return `${v.toFixed(2)}%`;
      case 'decimal': return v.toFixed(1);
      default: return formatNumber(v);
    }
  };

  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
  const tie = valueA === valueB;

  return (
    <div className="grid grid-cols-3 items-center gap-2 py-2 border-b border-gray-50">
      <div className={`text-right text-sm font-medium ${aWins ? 'text-green-600' : tie ? 'text-gray-900' : 'text-gray-500'}`}>
        {aWins && <span className="mr-1">*</span>}
        {formatFn(valueA)}
      </div>
      <div className="text-center text-xs font-medium text-gray-500">{label}</div>
      <div className={`text-left text-sm font-medium ${bWins ? 'text-green-600' : tie ? 'text-gray-900' : 'text-gray-500'}`}>
        {formatFn(valueB)}
        {bWins && <span className="ml-1">*</span>}
      </div>
    </div>
  );
}

export function ABComparison({ creatives, onClose }: ABComparisonProps) {
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');

  const creativeA = creatives.find(c => c.ad_id === selectedA);
  const creativeB = creatives.find(c => c.ad_id === selectedB);

  const creativesWithInsights = creatives.filter(c => c.insights);

  // Count wins for each
  const countWins = () => {
    if (!creativeA?.insights || !creativeB?.insights) return { a: 0, b: 0 };
    const insA = creativeA.insights;
    const insB = creativeB.insights;

    let a = 0, b = 0;

    // Higher is better
    if (insA.ctr > insB.ctr) a++; else if (insB.ctr > insA.ctr) b++;
    if (insA.conversions > insB.conversions) a++; else if (insB.conversions > insA.conversions) b++;
    if (insA.hook_rate > insB.hook_rate) a++; else if (insB.hook_rate > insA.hook_rate) b++;
    if (insA.hold_rate > insB.hold_rate) a++; else if (insB.hold_rate > insA.hold_rate) b++;

    // Lower is better
    if (insA.cpc < insB.cpc) a++; else if (insB.cpc < insA.cpc) b++;
    if (insA.cpm < insB.cpm) a++; else if (insB.cpm < insA.cpm) b++;
    if (insA.frequency < insB.frequency) a++; else if (insB.frequency < insA.frequency) b++;

    // Cost per result (lower is better, but 0 means no conversions)
    if (insA.cost_per_result > 0 && insB.cost_per_result > 0) {
      if (insA.cost_per_result < insB.cost_per_result) a++; else if (insB.cost_per_result < insA.cost_per_result) b++;
    }

    return { a, b };
  };

  const wins = creativeA && creativeB ? countWins() : { a: 0, b: 0 };

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Comparação A/B</h3>
          <p className="text-xs text-gray-500">Selecione dois criativos para comparar lado a lado</p>
        </div>
        <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-blue-700 mb-1 block">Criativo A</label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecione...</option>
            {creativesWithInsights.map(c => (
              <option key={c.ad_id} value={c.ad_id} disabled={c.ad_id === selectedB}>
                {c.ad_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-blue-700 mb-1 block">Criativo B</label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecione...</option>
            {creativesWithInsights.map(c => (
              <option key={c.ad_id} value={c.ad_id} disabled={c.ad_id === selectedA}>
                {c.ad_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison */}
      {creativeA?.insights && creativeB?.insights && (
        <div className="space-y-4">
          {/* Winner banner */}
          {wins.a !== wins.b && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 py-2">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-sm font-bold text-green-700">
                {wins.a > wins.b ? creativeA.ad_name : creativeB.ad_name} vence {Math.max(wins.a, wins.b)} × {Math.min(wins.a, wins.b)}
              </span>
            </div>
          )}

          {/* Quality scores side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <QualityScoreBadge score={creativeA.quality_score} level={creativeA.quality_level} size="md" />
            </div>
            <div className="text-center">
              <QualityScoreBadge score={creativeB.quality_score} level={creativeB.quality_level} size="md" />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-2 gap-4">
            {[creativeA, creativeB].map((c) => {
              const thumb = c.thumbnail_url || c.image_url || c.video_thumbnail_url;
              return (
                <div key={c.ad_id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {thumb ? (
                    <img src={thumb} alt={c.ad_name} className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-xs text-gray-400">Sem preview</div>
                  )}
                  <p className="truncate px-3 py-2 text-xs font-medium text-gray-900">{c.ad_name}</p>
                </div>
              );
            })}
          </div>

          {/* Metrics comparison */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <MetricRow label="Gasto" valueA={creativeA.insights.spend} valueB={creativeB.insights.spend} format="currency" higherIsBetter={false} />
            <MetricRow label="CTR" valueA={creativeA.insights.ctr} valueB={creativeB.insights.ctr} format="percent" />
            <MetricRow label="CPC" valueA={creativeA.insights.cpc} valueB={creativeB.insights.cpc} format="currency" higherIsBetter={false} />
            <MetricRow label="CPM" valueA={creativeA.insights.cpm} valueB={creativeB.insights.cpm} format="currency" higherIsBetter={false} />
            <MetricRow label="Frequência" valueA={creativeA.insights.frequency} valueB={creativeB.insights.frequency} format="decimal" higherIsBetter={false} />
            <MetricRow label="Conversões" valueA={creativeA.insights.conversions} valueB={creativeB.insights.conversions} />
            <MetricRow label="Hook Rate" valueA={creativeA.insights.hook_rate} valueB={creativeB.insights.hook_rate} format="percent" />
            <MetricRow label="Hold Rate" valueA={creativeA.insights.hold_rate} valueB={creativeB.insights.hold_rate} format="percent" />
            <MetricRow label="Curtidas" valueA={creativeA.insights.likes} valueB={creativeB.insights.likes} />
            <MetricRow label="Comentários" valueA={creativeA.insights.comments} valueB={creativeB.insights.comments} />
            <MetricRow label="Shares" valueA={creativeA.insights.shares} valueB={creativeB.insights.shares} />
            {creativeA.insights.cost_per_result > 0 && creativeB.insights.cost_per_result > 0 && (
              <MetricRow label="Custo/Resultado" valueA={creativeA.insights.cost_per_result} valueB={creativeB.insights.cost_per_result} format="currency" higherIsBetter={false} />
            )}
          </div>
        </div>
      )}

      {(!creativeA || !creativeB) && (
        <div className="rounded-lg border-2 border-dashed border-blue-200 bg-white/50 p-8 text-center">
          <ArrowRight className="mx-auto h-8 w-8 text-blue-300" />
          <p className="mt-2 text-sm text-gray-500">Selecione dois criativos acima para comparar</p>
        </div>
      )}
    </div>
  );
}
