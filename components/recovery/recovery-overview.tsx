'use client';

import { RecoveryMetricsCards } from './recovery-metrics-cards';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CartMetrics {
  total: number;
  totalValue: number;
  recovered: number;
  recoveredValue: number;
  withEmail: number;
}

interface RecoveryOverviewProps {
  stats: Array<{
    status: string;
    opened: boolean | null;
    clicked: boolean | null;
    converted: boolean | null;
    conversion_value: number | null;
    created_at: string;
  }>;
  cartMetrics: CartMetrics;
}

export function RecoveryOverview({ stats, cartMetrics }: RecoveryOverviewProps) {
  // Calcular estatísticas de email
  const emailsSent = stats.length;
  const emailsOpened = stats.filter(s => s.opened).length;
  const emailsClicked = stats.filter(s => s.clicked).length;
  const conversions = stats.filter(s => s.converted).length;
  const totalRevenue = stats
    .filter(s => s.converted && s.conversion_value)
    .reduce((sum, s) => sum + (s.conversion_value || 0), 0);

  const openRate = emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) : '0.0';
  const clickRate = emailsSent > 0 ? ((emailsClicked / emailsSent) * 100).toFixed(1) : '0.0';
  const conversionRate = emailsSent > 0 ? ((conversions / emailsSent) * 100).toFixed(1) : '0.0';

  const emailStats = {
    sent: emailsSent,
    opened: emailsOpened,
    clicked: emailsClicked,
    converted: conversions,
    revenue: totalRevenue,
    openRate: parseFloat(openRate),
    clickRate: parseFloat(clickRate),
    conversionRate: parseFloat(conversionRate),
  };

  // Calcular estatísticas dos últimos 7 dias vs 7 dias anteriores
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const statsLast7 = stats.filter(s => new Date(s.created_at) >= last7Days);
  const statsPrevious7 = stats.filter(
    s => new Date(s.created_at) >= previous7Days && new Date(s.created_at) < last7Days
  );

  const calculateRate = (items: any[], condition: (item: any) => boolean) => {
    if (items.length === 0) return 0;
    return (items.filter(condition).length / items.length) * 100;
  };

  const last7Conversions = statsLast7.filter(s => s.converted).length;
  const previous7Conversions = statsPrevious7.filter(s => s.converted).length;

  const last7Revenue = statsLast7
    .filter(s => s.converted && s.conversion_value)
    .reduce((sum, s) => sum + (s.conversion_value || 0), 0);

  const previous7Revenue = statsPrevious7
    .filter(s => s.converted && s.conversion_value)
    .reduce((sum, s) => sum + (s.conversion_value || 0), 0);

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) {
      if (current > 0) return { direction: 'up', value: 100 };
      return { direction: 'neutral', value: 0 };
    }

    const percentChange = ((current - previous) / previous) * 100;

    if (percentChange > 5) return { direction: 'up', value: percentChange };
    if (percentChange < -5) return { direction: 'down', value: Math.abs(percentChange) };
    return { direction: 'neutral', value: Math.abs(percentChange) };
  };

  const conversionTrend = getTrend(last7Conversions, previous7Conversions);
  const revenueTrend = getTrend(last7Revenue, previous7Revenue);

  const TrendIcon = ({ direction }: { direction: string }) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (direction: string) => {
    if (direction === 'up') return 'text-green-600';
    if (direction === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <RecoveryMetricsCards cartMetrics={cartMetrics} emailStats={emailStats} />

      {/* Comparativo Semanal */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Últimos 7 Dias</h3>
          <p className="text-sm text-gray-600">Comparado com a semana anterior</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Conversões */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversões</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{last7Conversions}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(conversionTrend.direction)}`}>
                <TrendIcon direction={conversionTrend.direction} />
                {conversionTrend.value.toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Semana anterior: {previous7Conversions}
            </div>
          </div>

          {/* Receita */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Recuperada</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  R$ {last7Revenue.toFixed(2)}
                </p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(revenueTrend.direction)}`}>
                <TrendIcon direction={revenueTrend.direction} />
                {revenueTrend.value.toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Semana anterior: R$ {previous7Revenue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Funil de Conversão */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Funil de Recuperação</h3>
          <p className="text-sm text-gray-600">Taxa de conversão em cada etapa</p>
        </div>

        <div className="space-y-4">
          {/* Enviados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Emails Enviados</span>
              <span className="text-sm font-semibold text-gray-900">{stats.length}</span>
            </div>
            <div className="h-3 rounded-full bg-blue-100 overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Abertos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Abertos</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.filter(s => s.opened).length} ({calculateRate(stats, s => s.opened).toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 rounded-full bg-purple-100 overflow-hidden">
              <div
                className="h-full bg-purple-600"
                style={{ width: `${calculateRate(stats, s => s.opened)}%` }}
              />
            </div>
          </div>

          {/* Clicados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Clicados</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.filter(s => s.clicked).length} ({calculateRate(stats, s => s.clicked).toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 rounded-full bg-orange-100 overflow-hidden">
              <div
                className="h-full bg-orange-600"
                style={{ width: `${calculateRate(stats, s => s.clicked)}%` }}
              />
            </div>
          </div>

          {/* Convertidos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Convertidos</span>
              <span className="text-sm font-semibold text-gray-900">
                {stats.filter(s => s.converted).length} ({calculateRate(stats, s => s.converted).toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 rounded-full bg-green-100 overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{ width: `${calculateRate(stats, s => s.converted)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dicas */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h4 className="text-sm font-semibold text-amber-900 mb-2">💡 Dicas para Melhorar suas Taxas:</h4>
        <ul className="space-y-1 text-xs text-amber-800">
          <li>• <strong>Taxa de Abertura baixa?</strong> Teste assuntos mais chamativos ou personalizados</li>
          <li>• <strong>Taxa de Clique baixa?</strong> Melhore a mensagem personalizada e destaque o CTA</li>
          <li>• <strong>Conversão baixa?</strong> Considere oferecer desconto ou frete grátis no email</li>
        </ul>
      </div>
    </div>
  );
}
