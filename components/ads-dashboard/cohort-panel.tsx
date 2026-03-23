'use client';

import { useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

interface CohortData {
  day: string; // D0, D1, D3, D7, D14, D28
  conversions: number;
  revenue: number;
  convRate: number;
  cpa: number;
  maturationPercent: number; // 0-100
}

interface CohortPanelProps {
  cohortStart: string;
  cohortEnd: string;
  totalConversions: number;
  totalRevenue: number;
  totalSpend: number;
  data: CohortData[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function CohortPanel({
  cohortStart,
  cohortEnd,
  totalConversions,
  totalRevenue,
  totalSpend,
  data,
}: CohortPanelProps) {
  const [activeTab, setActiveTab] = useState<'maturation' | 'performance'>('maturation');

  return (
    <div className="w-[280px] flex-shrink-0 space-y-4 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          Cohort · Maturação
        </h3>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
          {cohortStart} a {cohortEnd}
        </span>
      </div>

      {/* D0 info */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Calendar className="h-3 w-3" />
        <span>
          D0 = {cohortStart} · Último dia consolidado: {cohortEnd}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-md border border-gray-200 p-0.5">
        <button
          onClick={() => setActiveTab('maturation')}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${
            activeTab === 'maturation'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Maturação
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${
            activeTab === 'performance'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Performance
        </button>
      </div>

      {activeTab === 'maturation' ? (
        <>
          {/* Maturation bars */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-700">
              Maturação de Receita
            </p>
            <div className="space-y-2">
              {data.map((d) => (
                <div key={d.day} className="flex items-center gap-2">
                  <span className="w-8 text-right text-xs font-medium text-gray-600">
                    {d.day}
                  </span>
                  <div className="relative flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${d.maturationPercent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-bold text-gray-900">
                    {d.maturationPercent.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] text-gray-500">
              Total: {totalConversions} compras · {formatCurrency(totalRevenue)}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Performance table */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-700">
              Performance do Cohort
            </p>

            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-gray-600">Investimento</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(totalSpend)}
              </span>
            </div>

            {/* Header */}
            <div className="grid grid-cols-4 gap-1 border-b border-gray-100 pb-1 text-[10px] text-gray-500">
              <span />
              <span className="text-right">Conv.</span>
              <span className="text-right">Tx Conv.</span>
              <span className="text-right">CPA</span>
            </div>

            {/* Rows */}
            <div className="space-y-1 pt-1">
              {data.map((d) => (
                <div key={d.day} className="grid grid-cols-4 gap-1 text-xs">
                  <span className="font-medium text-gray-700">{d.day}</span>
                  <span className="text-right text-gray-600">
                    {d.conversions}
                  </span>
                  <span className="text-right text-gray-600">
                    {d.convRate.toFixed(2)}%
                  </span>
                  <span className="text-right text-gray-600">
                    {d.cpa > 0 ? formatCurrency(d.cpa) : '--'}
                  </span>
                </div>
              ))}
            </div>

            {/* CPA Meta and Maduro */}
            <div className="mt-3 space-y-1 border-t border-gray-100 pt-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">CPA Meta D7</span>
                <span className="font-medium text-gray-900">
                  {data.find(d => d.day === 'D7')?.cpa
                    ? formatCurrency(data.find(d => d.day === 'D7')!.cpa)
                    : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CPA Maduro (est.)</span>
                <span className="font-medium text-gray-900">
                  {data.find(d => d.day === 'D28')?.cpa
                    ? formatCurrency(data.find(d => d.day === 'D28')!.cpa)
                    : '--'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
