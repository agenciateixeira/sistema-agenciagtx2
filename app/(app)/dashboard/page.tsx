import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SectionTitle } from '@/components/dashboard/section-title';
import { StatCard } from '@/components/dashboard/stat-card';
import { Download, Bell, FileText, Webhook, Users, Activity } from 'lucide-react';
import Link from 'next/link';

async function getSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles_with_email')
    .select('id, nome, role, email, avatar_url')
    .eq('id', user.id)
    .single();

  // Buscar estatísticas
  const { count: reportsCount } = await supabase
    .from('ReportSchedule')
    .select('*', { count: 'exact', head: true })
    .eq('ownerId', user.id);

  const { count: notificationsCount } = await supabase
    .from('Notification')
    .select('*', { count: 'exact', head: true })
    .eq('userId', user.id)
    .is('readAt', null);

  const { count: webhooksCount } = await supabase
    .from('WebhookEndpoint')
    .select('*', { count: 'exact', head: true })
    .eq('teamId', user.id)
    .eq('active', true);

  const { count: membersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Buscar notificações recentes
  const { data: recentNotifications } = await supabase
    .from('Notification')
    .select('*')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })
    .limit(5);

  // Buscar relatórios recentes
  const { data: recentReports } = await supabase
    .from('ReportSchedule')
    .select(`
      *,
      template:ReportTemplate(*)
    `)
    .eq('ownerId', user.id)
    .order('createdAt', { ascending: false })
    .limit(3);

  // Buscar webhooks ativos
  const { data: activeWebhooks } = await supabase
    .from('WebhookEndpoint')
    .select('*')
    .eq('teamId', user.id)
    .eq('active', true)
    .limit(3);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {profile?.nome || 'Usuário'}!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Visão geral do seu sistema
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Relatórios Agendados"
          value={`${reportsCount || 0}`}
          helper="Total de relatórios"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Notificações não lidas"
          value={`${notificationsCount || 0}`}
          helper="Aguardando leitura"
          icon={<Bell className="h-5 w-5" />}
        />
        <StatCard
          label="Webhooks Ativos"
          value={`${webhooksCount || 0}`}
          helper="Integrações ativas"
          icon={<Webhook className="h-5 w-5" />}
        />
        <StatCard
          label="Membros da Equipe"
          value={`${membersCount || 0}`}
          helper="Total de usuários"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Notificações Recentes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <SectionTitle
              title="Notificações Recentes"
              description="Últimas atualizações"
            />
            <Link
              href="/notifications"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todas
            </Link>
          </div>

          {recentNotifications && recentNotifications.length > 0 ? (
            <div className="mt-6 space-y-3">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-600">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-900">{notification.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-gray-500">Nenhuma notificação</p>
          )}
        </div>

        {/* Relatórios Agendados */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <SectionTitle
              title="Relatórios Agendados"
              description="Próximas entregas"
            />
            <Link
              href="/reports"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todos
            </Link>
          </div>

          {recentReports && recentReports.length > 0 ? (
            <div className="mt-6 space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">{report.template?.name || 'Sem nome'}</p>
                  <p className="mt-1 text-sm text-gray-600">{report.cadence}</p>
                  {report.nextRunAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      Próxima: {new Date(report.nextRunAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-gray-500">Nenhum relatório agendado</p>
          )}
        </div>
      </div>

      {/* Webhooks Ativos */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <SectionTitle
            title="Webhooks Ativos"
            description="Integrações configuradas"
          />
          <Link
            href="/webhooks"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Ver todos
          </Link>
        </div>

        {activeWebhooks && activeWebhooks.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {activeWebhooks.map((webhook) => (
              <div key={webhook.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <p className="font-semibold text-gray-900">{webhook.name}</p>
                </div>
                <p className="mt-2 text-xs text-gray-600 truncate">{webhook.url}</p>
                <p className="mt-1 text-xs text-green-600">Ativo</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-gray-500">Nenhum webhook ativo</p>
        )}
      </div>
    </div>
  );
}
