'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  Clock,
  Calendar,
  Tag,
  Zap,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { exportRecoveryToExcel, exportRecoveryToPDF } from '@/lib/export-utils';
import { RecoveryCrossAnalysis } from './recovery-cross-analysis';

interface AnalyticsData {
  cohorts: any[];
  funnel: any;
  utm: any;
  timeOfDay: any;
  cartValue: any[];
  roi: any;
  crossData?: {
    cohortByUTM: any[];
    cohortByValue: any[];
    timeByValue: any[];
    utmByValue: any[];
  };
}

export function RecoveryAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/recovery/analytics?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analisando dados...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center text-gray-600 py-12">Erro ao carregar analytics</div>;
  }

  const handleExportExcel = async () => {
    if (!analytics) return;
    try {
      await exportRecoveryToExcel(analytics, period);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar para Excel. Tente novamente.');
    }
  };

  const handleExportPDF = async () => {
    if (!analytics) return;
    try {
      await exportRecoveryToPDF(analytics, period);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar para PDF. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtro de Período e Botões de Export */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Avançado</h2>

        <div className="flex items-center gap-3">
          {/* Botões de Export */}
          <button
            onClick={handleExportExcel}
            disabled={!analytics}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </button>

          <button
            onClick={handleExportPDF}
            disabled={!analytics}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <FileText className="h-4 w-4" />
            Exportar PDF
          </button>

          {/* Seletor de Período */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* ROI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Valor Abandonado"
          value={`R$ ${analytics.roi.totalAbandonedValue.toFixed(2)}`}
          icon={BarChart3}
          color="amber"
        />
        <MetricCard
          title="Valor Recuperado"
          value={`R$ ${analytics.roi.totalRecoveredValue.toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="ROI"
          value={`${analytics.roi.roi}x`}
          subtitle={`Custo: R$ ${analytics.roi.estimatedCost.toFixed(2)}`}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Revenue/Email"
          value={`R$ ${analytics.roi.revenuePerEmail}`}
          subtitle={`${analytics.roi.emailsSent} emails enviados`}
          icon={Zap}
          color="purple"
        />
      </div>

      {/* Insights Automáticos */}
      <InsightsCard analytics={analytics} />

      {/* Funil de Conversão */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Funil de Conversão</h3>
        </div>
        <FunnelChart funnel={analytics.funnel} />
      </div>

      {/* Análise de Coorte */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Análise de Coorte Semanal</h3>
        </div>
        <CohortTable cohorts={analytics.cohorts} />
      </div>

      {/* Grid de Análises */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por Horário */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Por Horário do Dia</h3>
          </div>
          <TimeChart data={analytics.timeOfDay.byHour} />
        </div>

        {/* Por Valor do Carrinho */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Por Valor do Carrinho</h3>
          </div>
          <ValueRangeChart data={analytics.cartValue} />
        </div>

        {/* Por UTM Source */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Por UTM Source</h3>
          </div>
          <UTMChart data={analytics.utm.sources} />
        </div>

        {/* Por Dia da Semana */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Por Dia da Semana</h3>
          </div>
          <WeekdayChart data={analytics.timeOfDay.byDayOfWeek} />
        </div>
      </div>

      {/* Cruzamento de Dados Avançado */}
      {analytics.crossData && (
        <div className="mt-8">
          <RecoveryCrossAnalysis crossData={analytics.crossData} />
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares

function MetricCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colors = {
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
  };

  return (
    <div className={`rounded-xl border-2 ${colors[color as keyof typeof colors]} p-5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-6 w-6 ${colors[color as keyof typeof colors].split(' ')[0]}`} />
      </div>
    </div>
  );
}

function FunnelChart({ funnel }: any) {
  const stages = [
    { label: 'Enviados', value: funnel.sent, percent: 100 },
    { label: 'Abertos', value: funnel.opened, percent: funnel.openRate },
    { label: 'Clicados', value: funnel.clicked, percent: funnel.clickRate },
    { label: 'Convertidos', value: funnel.converted, percent: funnel.conversionRate },
  ];

  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-orange-600', 'bg-green-600'];

  return (
    <div className="space-y-4">
      {stages.map((stage, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{stage.label}</span>
            <span className="text-sm font-semibold text-gray-900">
              {stage.value} ({stage.percent}%)
            </span>
          </div>
          <div className="h-8 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full ${colors[idx]} transition-all duration-500`}
              style={{ width: `${stage.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CohortTable({ cohorts }: any) {
  if (cohorts.length === 0) {
    return <p className="text-gray-500 text-center py-8">Sem dados de coorte ainda</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semana</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Carrinhos</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recuperados</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxa</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Médio</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cohorts.map((cohort: any, idx: number) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{new Date(cohort.week).toLocaleDateString('pt-BR')}</td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">{cohort.totalCarts}</td>
              <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{cohort.recoveredCarts}</td>
              <td className="px-4 py-3 text-sm text-right">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {cohort.recoveryRate}%
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">R$ {cohort.avgCartValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimeChart({ data }: any) {
  const maxCarts = Math.max(...data.map((d: any) => d.carts), 1);

  return (
    <div className="space-y-2">
      {data.filter((d: any) => d.carts > 0).map((item: any) => (
        <div key={item.hour} className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600 w-12">{item.hour}:00</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500"
              style={{ width: `${(item.carts / maxCarts) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-16 text-right">{item.carts} ({item.recoveryRate}%)</span>
        </div>
      ))}
    </div>
  );
}

function ValueRangeChart({ data }: any) {
  const maxCarts = Math.max(...data.map((d: any) => d.carts), 1);

  return (
    <div className="space-y-3">
      {data.map((item: any, idx: number) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{item.range}</span>
            <span className="text-sm text-gray-600">{item.carts} carrinhos ({item.recoveryRate}%)</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${(item.carts / maxCarts) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function UTMChart({ data }: any) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-8">Sem dados de UTM ainda</p>;
  }

  const maxCarts = Math.max(...data.map((d: any) => d.carts), 1);

  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((item: any, idx: number) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            <span className="text-sm text-gray-600">{item.carts} ({item.recoveryRate}%)</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${(item.carts / maxCarts) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function WeekdayChart({ data }: any) {
  const maxCarts = Math.max(...data.map((d: any) => d.carts), 1);

  return (
    <div className="space-y-3">
      {data.map((item: any, idx: number) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{item.day}</span>
            <span className="text-sm text-gray-600">{item.carts} ({item.recoveryRate}%)</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500"
              style={{ width: `${(item.carts / maxCarts) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsCard({ analytics }: any) {
  // Calcular insights
  const bestHour = analytics.timeOfDay.byHour.reduce((best: any, current: any) => {
    return parseFloat(current.recoveryRate) > parseFloat(best.recoveryRate) ? current : best;
  }, analytics.timeOfDay.byHour[0]);

  const bestDay = analytics.timeOfDay.byDayOfWeek.reduce((best: any, current: any) => {
    return parseFloat(current.recoveryRate) > parseFloat(best.recoveryRate) ? current : best;
  }, analytics.timeOfDay.byDayOfWeek[0]);

  const bestUTM = analytics.utm.sources.length > 0
    ? analytics.utm.sources.reduce((best: any, current: any) => {
        return parseFloat(current.recoveryRate) > parseFloat(best.recoveryRate) ? current : best;
      }, analytics.utm.sources[0])
    : null;

  const bestValueRange = analytics.cartValue.reduce((best: any, current: any) => {
    return parseFloat(current.recoveryRate) > parseFloat(best.recoveryRate) ? current : best;
  }, analytics.cartValue[0]);

  const avgRecoveryTime = analytics.funnel.clickToConversion;

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Insights Automáticos</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Melhor Horário */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Melhor Horário</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{bestHour.hour}:00</p>
          <p className="text-sm text-gray-600">Taxa de recuperação: {bestHour.recoveryRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{bestHour.carts} carrinhos nesse horário</p>
        </div>

        {/* Melhor Dia */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-pink-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Melhor Dia</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{bestDay.day}</p>
          <p className="text-sm text-gray-600">Taxa de recuperação: {bestDay.recoveryRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{bestDay.carts} carrinhos nesse dia</p>
        </div>

        {/* Melhor Faixa de Valor */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Melhor Faixa</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{bestValueRange.range}</p>
          <p className="text-sm text-gray-600">Taxa de recuperação: {bestValueRange.recoveryRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{bestValueRange.carts} carrinhos</p>
        </div>

        {/* Melhor UTM Source */}
        {bestUTM && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase">Melhor Source</span>
            </div>
            <p className="text-lg font-bold text-gray-900 truncate">{bestUTM.name}</p>
            <p className="text-sm text-gray-600">Taxa de recuperação: {bestUTM.recoveryRate}%</p>
            <p className="text-xs text-gray-500 mt-1">{bestUTM.carts} carrinhos</p>
          </div>
        )}

        {/* Taxa de Click para Conversão */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Click → Conversão</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgRecoveryTime}%</p>
          <p className="text-sm text-gray-600">De quem clica, converte</p>
          <p className="text-xs text-gray-500 mt-1">{analytics.funnel.clicked} cliques totais</p>
        </div>

        {/* Potencial de Recuperação */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase">Potencial</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            R$ {(analytics.roi.totalAbandonedValue - analytics.roi.totalRecoveredValue).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Ainda pode ser recuperado</p>
          <p className="text-xs text-gray-500 mt-1">
            {((analytics.roi.totalRecoveredValue / analytics.roi.totalAbandonedValue) * 100).toFixed(1)}% já recuperado
          </p>
        </div>
      </div>
    </div>
  );
}
