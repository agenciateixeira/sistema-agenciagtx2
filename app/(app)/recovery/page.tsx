import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { RecoverySettingsForm } from '@/components/recovery/recovery-settings-form';
import { RecoveryStats } from '@/components/recovery/recovery-stats';

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
    .select('status, opened, clicked, converted, conversion_value')
    .gte('created_at', thirtyDaysAgo.toISOString());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recuperação de Vendas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure emails de recuperação de carrinho abandonado e acompanhe resultados
        </p>
      </div>

      <RecoveryStats stats={stats || []} />
      <RecoverySettingsForm user={user} profile={profile} />
    </div>
  );
}
