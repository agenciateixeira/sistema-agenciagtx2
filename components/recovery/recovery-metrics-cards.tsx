'use client';

import {
  ShoppingCart,
  Mail,
  Eye,
  MousePointer,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface CartMetrics {
  total: number;
  totalValue: number;
  recovered: number;
  recoveredValue: number;
  withEmail: number;
}

interface EmailStats {
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface RecoveryMetricsCardsProps {
  cartMetrics: CartMetrics;
  emailStats: EmailStats;
}

export function RecoveryMetricsCards({ cartMetrics, emailStats }: RecoveryMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const recoveryRate = cartMetrics.total > 0
    ? ((cartMetrics.recovered / cartMetrics.total) * 100).toFixed(1)
    : '0.0';

  const pendingCarts = cartMetrics.total - cartMetrics.recovered;
  const pendingValue = cartMetrics.totalValue - cartMetrics.recoveredValue;

  const metrics = [
    {
      title: 'Carrinhos Abandonados',
      value: cartMetrics.total,
      subtitle: formatCurrency(cartMetrics.totalValue),
      icon: ShoppingCart,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Carrinhos Recuperados',
      value: cartMetrics.recovered,
      subtitle: `${recoveryRate}% de taxa`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Receita Recuperada',
      value: formatCurrency(cartMetrics.recoveredValue),
      subtitle: `de ${formatCurrency(cartMetrics.totalValue)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Emails Enviados',
      value: emailStats.sent,
      subtitle: `${emailStats.openRate}% abertura`,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Taxa de Cliques',
      value: `${emailStats.clickRate}%`,
      subtitle: `${emailStats.clicked} cliques`,
      icon: MousePointer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Taxa de Conversão',
      value: `${emailStats.conversionRate}%`,
      subtitle: `${emailStats.converted} conversões`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`rounded-xl border-2 ${metric.borderColor} ${metric.bgColor} p-5 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {metric.subtitle}
                  </p>
                </div>
                <div className={`rounded-lg ${metric.bgColor} p-3 ring-2 ring-white`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas e Insights */}
      {pendingCarts > 0 && (
        <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-orange-100 p-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-orange-900 mb-2">
                Oportunidade de Recuperação
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-orange-800">
                <div>
                  <p className="font-medium">Carrinhos Pendentes</p>
                  <p className="text-2xl font-bold text-orange-900">{pendingCarts}</p>
                </div>
                <div>
                  <p className="font-medium">Valor Potencial</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(pendingValue)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-orange-700">
                💡 Configure emails automáticos para recuperar mais vendas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {cartMetrics.total === 0 && emailStats.sent === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aguardando Dados
          </h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Configure seus webhooks na Shopify e habilite o envio automático de emails
            para começar a ver métricas de recuperação.
          </p>
        </div>
      )}
    </div>
  );
}
