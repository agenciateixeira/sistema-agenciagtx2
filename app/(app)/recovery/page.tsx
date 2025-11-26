import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { RecoverySettingsForm } from '@/components/recovery/recovery-settings-form';
import { RecoveryTabs, TabPanel } from '@/components/recovery/recovery-tabs';
import { RecoveryOverview } from '@/components/recovery/recovery-overview';
import { RecoveryHistory } from '@/components/recovery/recovery-history';
import { RecoveryCarts } from '@/components/recovery/recovery-carts';

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

export default async function RecoveryPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar perfil do usuário com configurações de email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_recovery_settings, nome')
    .eq('id', user.id)
    .single();

  // Buscar estatísticas de recuperação (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: stats } = await supabase
    .from('automated_actions')
    .select('status, opened, clicked, converted, conversion_value, created_at')
    .eq('action_type', 'email_sent')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  // Buscar histórico completo de emails enviados (últimos 30 dias)
  const { data: emailHistory } = await supabase
    .from('automated_actions')
    .select('id, recipient, email_subject, status, sent_at, opened, opened_at, clicked, clicked_at, converted, converted_at, conversion_value')
    .eq('action_type', 'email_sent')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  // Buscar carrinhos abandonados (últimos 30 dias)
  const { data: abandonedCarts } = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('user_id', user.id)
    .gte('abandoned_at', thirtyDaysAgo.toISOString())
    .order('abandoned_at', { ascending: false });

  // Calcular métricas de carrinhos
  const cartMetrics = {
    total: abandonedCarts?.length || 0,
    totalValue: abandonedCarts?.reduce((sum, cart) => sum + cart.total_value, 0) || 0,
    recovered: abandonedCarts?.filter(cart => cart.status === 'recovered').length || 0,
    recoveredValue: abandonedCarts
      ?.filter(cart => cart.status === 'recovered')
      .reduce((sum, cart) => sum + (cart.recovered_value || 0), 0) || 0,
    withEmail: abandonedCarts?.filter(cart => !cart.customer_email.includes('sem-email')).length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recuperação de Vendas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure emails de recuperação de carrinho abandonado e acompanhe resultados em tempo real
        </p>
      </div>

      <RecoveryTabs defaultTab="overview">
        <TabPanel id="overview">
          <RecoveryOverview stats={stats || []} cartMetrics={cartMetrics} />
        </TabPanel>

        <TabPanel id="carts">
          <RecoveryCarts carts={abandonedCarts || []} />
        </TabPanel>

        <TabPanel id="history">
          <RecoveryHistory actions={emailHistory || []} />
        </TabPanel>

        <TabPanel id="settings">
          <RecoverySettingsForm user={user} profile={profile} />
        </TabPanel>
      </RecoveryTabs>
    </div>
  );
}
