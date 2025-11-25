import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SectionTitle } from '@/components/dashboard/section-title';
import { AdsDashboardClient } from '@/components/ads-dashboard/ads-dashboard-client';
import { AlertCircle, ExternalLink } from 'lucide-react';
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

  // Passar dados para componente client
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Meta Ads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Métricas de suas campanhas do Facebook e Instagram
          </p>
        </div>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Gerenciar Conexão
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Informações da Conta Conectada */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0081FB">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{metaConnection.meta_user_name}</p>
            <p className="text-xs text-gray-600">
              {metaConnection.ad_account_ids?.length || 0} {metaConnection.ad_account_ids?.length === 1 ? 'conta de anúncios' : 'contas de anúncios'}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Client Component */}
      <AdsDashboardClient
        metaConnection={metaConnection}
        primaryAdAccountId={metaConnection.primary_ad_account_id}
      />
    </div>
  );
}
