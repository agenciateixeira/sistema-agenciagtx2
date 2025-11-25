import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Tabs } from '@/components/ui/tabs';
import { OverviewTab } from '@/components/meta-ads/overview-tab';
import { CampaignsTab } from '@/components/meta-ads/campaigns-tab';
import { CAPITab } from '@/components/meta-ads/capi-tab';
import { ReportsTab } from '@/components/meta-ads/reports-tab';
import { LayoutDashboard, Target, Send, FileText, AlertCircle, ExternalLink, Settings } from 'lucide-react';
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

export default async function MetaAdsPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar conexão Meta
  const { data: metaConnection } = await supabase
    .from('meta_connections')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Se não tiver conexão Meta
  if (!metaConnection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meta Ads</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie suas campanhas do Facebook e Instagram
            </p>
          </div>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Integrações
          </Link>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Meta Ads não conectado
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Você precisa conectar sua conta do Meta Ads para acessar este dashboard.
          </p>
          <div className="mt-4">
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Conectar Meta Ads
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meta Ads</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie suas campanhas do Facebook e Instagram
            </p>
          </div>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Integrações
          </Link>
        </div>

        <div className="rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Token expirado
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Seu token de acesso ao Meta Ads expirou. Reconecte sua conta para continuar.
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

  // Buscar estatísticas CAPI
  const { data: capiStats } = await supabase
    .from('abandoned_carts')
    .select('capi_purchase_sent, capi_add_to_cart_sent, status')
    .eq('user_id', user.id);

  const totalRecovered = capiStats?.filter((c) => c.status === 'recovered').length || 0;
  const purchaseEventsSent = capiStats?.filter((c) => c.capi_purchase_sent).length || 0;
  const pendingEvents = capiStats?.filter(
    (c) => c.status === 'recovered' && !c.capi_purchase_sent
  ).length || 0;

  // Definir abas
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      content: <OverviewTab metaConnection={metaConnection} />,
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      icon: Target,
      content: <CampaignsTab userId={user.id} />,
    },
    {
      id: 'capi',
      label: 'CAPI',
      icon: Send,
      content: (
        <CAPITab
          metaConnection={metaConnection}
          totalRecovered={totalRecovered}
          purchaseEventsSent={purchaseEventsSent}
          pendingEvents={pendingEvents}
          userId={user.id}
        />
      ),
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileText,
      content: <ReportsTab />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meta Ads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie suas campanhas do Facebook e Instagram
          </p>
        </div>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
          Gerenciar Conexão
        </Link>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}
