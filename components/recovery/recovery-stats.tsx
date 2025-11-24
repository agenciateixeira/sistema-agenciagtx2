'use client';

import { Mail, Eye, MousePointer, ShoppingCart, TrendingUp } from 'lucide-react';

interface RecoveryStatsProps {
  stats: Array<{
    status: string;
    opened: boolean | null;
    clicked: boolean | null;
    converted: boolean | null;
    conversion_value: number | null;
  }>;
}

export function RecoveryStats({ stats }: RecoveryStatsProps) {
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

  const statsData = [
    {
      title: 'Emails Enviados',
      value: emailsSent,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Taxa de Abertura',
      value: `${openRate}%`,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Taxa de Cliques',
      value: `${clickRate}%`,
      icon: MousePointer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Conversões',
      value: conversions,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Receita Recuperada',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Estatísticas (Últimos 30 dias)</h2>
        <p className="text-sm text-gray-600">Performance de recuperação de carrinhos abandonados</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg ${stat.bgColor} p-2.5`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-0.5 text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {emailsSent === 0 && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-800">
            Nenhum email de recuperação foi enviado ainda. Configure suas preferências abaixo e aguarde carrinhos abandonados.
          </p>
        </div>
      )}
    </div>
  );
}
