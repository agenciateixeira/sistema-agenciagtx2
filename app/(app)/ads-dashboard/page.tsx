import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { MetaAccountProvider } from '@/contexts/meta-account-context';
import { AdsDashboardContent } from '@/components/ads-dashboard/ads-dashboard-content';

// FORÇAR PÁGINA DINÂMICA (SEM CACHE)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSupabaseServer() {
  const cookieStore = await cookies();

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

export default async function AdsDashboardPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar conexão Meta do usuário
  const { data: metaConnection } = await supabase
    .from('meta_connections')
    .select('*')
    .eq('user_id', user.id)
    .single();

  console.log('🔍 Meta Connection Data:', {
    user_id: user.id,
    has_connection: !!metaConnection,
    primary_ad_account_id: metaConnection?.primary_ad_account_id,
    primary_pixel_id: metaConnection?.primary_pixel_id,
    ad_accounts_count: metaConnection?.ad_account_ids?.length || 0,
  });

  // Se não tiver conexão, redirecionar para integrações
  if (!metaConnection) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Meta Ads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualize métricas de suas campanhas do Facebook e Instagram
          </p>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Meta Ads não conectado
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Você precisa conectar sua conta do Meta Ads para visualizar o dashboard.
          </p>
          <div className="mt-4">
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Ir para Integrações
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Verificar se token expirou
  const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();

  if (tokenExpired || metaConnection.status !== 'connected') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Meta Ads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualize métricas de suas campanhas do Facebook e Instagram
          </p>
        </div>

        <div className="rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Token expirado
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Seu token de acesso ao Meta Ads expirou. Reconecte sua conta para continuar visualizando as métricas.
          </p>
          <div className="mt-4">
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Reconectar Meta Ads
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Buscar contas disponíveis
  const initialAccounts = metaConnection.ad_account_ids || [];

  // Passar dados para componente client com Provider
  return (
    <MetaAccountProvider userId={user.id} initialAccounts={initialAccounts}>
      <AdsDashboardContent userId={user.id} metaConnection={metaConnection} />
    </MetaAccountProvider>
  );
}
