import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SectionTitle } from '@/components/dashboard/section-title';
import { MetaCAPIStatus } from '@/components/meta-capi/meta-capi-status';
import { MetaCAPIStats } from '@/components/meta-capi/meta-capi-stats';
import { Send, Settings } from 'lucide-react';
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

export default async function MetaCAPIPage() {
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

  // Buscar estatísticas de eventos CAPI
  const { data: capiStats } = await supabase
    .from('abandoned_carts')
    .select('capi_purchase_sent, capi_add_to_cart_sent, status')
    .eq('user_id', user.id);

  const totalRecovered = capiStats?.filter((c) => c.status === 'recovered').length || 0;
  const purchaseEventsSent = capiStats?.filter((c) => c.capi_purchase_sent).length || 0;
  const pendingEvents = capiStats?.filter(
    (c) => c.status === 'recovered' && !c.capi_purchase_sent
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meta Conversions API (CAPI)</h1>
          <p className="mt-1 text-sm text-gray-600">
            Envie eventos de conversão server-side para otimizar suas campanhas
          </p>
        </div>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
          Configurar Meta Ads
        </Link>
      </div>

      {/* O que é CAPI */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
            <Send className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">O que é Conversions API?</h2>
            <p className="mt-2 text-sm text-gray-700">
              CAPI envia eventos de conversão <strong>direto do seu servidor</strong> para o Meta, sem depender do Pixel do navegador.
              Isso <strong>melhora o rastreamento</strong> (não é afetado por bloqueadores) e <strong>otimiza suas campanhas</strong> automaticamente.
            </p>
            <div className="mt-3 flex gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-700">✅ Rastreamento preciso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700">✅ Sem bloqueadores</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-700">✅ Melhor otimização</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status da Configuração */}
      <MetaCAPIStatus metaConnection={metaConnection} />

      {/* Estatísticas */}
      <MetaCAPIStats
        totalRecovered={totalRecovered}
        purchaseEventsSent={purchaseEventsSent}
        pendingEvents={pendingEvents}
        userId={user.id}
      />

      {/* Como funciona */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Como funciona?"
          description="Fluxo automático de eventos"
        />

        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
              <span className="text-sm font-bold text-blue-700">1</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Cliente abandona carrinho</p>
              <p className="text-sm text-gray-600">Sistema salva o carrinho com UTM da campanha</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
              <span className="text-sm font-bold text-blue-700">2</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Email de recuperação é enviado</p>
              <p className="text-sm text-gray-600">Cliente clica no email e finaliza a compra</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
              <span className="text-sm font-bold text-green-700">3</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Evento Purchase é enviado automaticamente</p>
              <p className="text-sm text-gray-600">
                Sistema envia evento para Meta CAPI com dados da compra (valor, produtos, cliente)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
              <span className="text-sm font-bold text-purple-700">4</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Meta otimiza suas campanhas</p>
              <p className="text-sm text-gray-600">
                Algoritmo do Meta usa esses dados para encontrar mais clientes similares e melhorar o ROAS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Benefícios do CAPI"
          description="Por que usar Conversions API?"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-900">📊 Rastreamento mais preciso</p>
            <p className="mt-1 text-sm text-green-700">
              Não é afetado por bloqueadores de anúncios, cookies ou navegação privada
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="font-semibold text-blue-900">🎯 Melhor otimização</p>
            <p className="mt-1 text-sm text-blue-700">
              Meta recebe mais dados de conversão, melhora o algoritmo e encontra melhores clientes
            </p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="font-semibold text-purple-900">🔒 Mais seguro</p>
            <p className="mt-1 text-sm text-purple-700">
              Dados são hasheados (SHA256) antes de enviar. Meta não vê emails ou nomes em texto plano
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="font-semibold text-orange-900">⚡ Automático</p>
            <p className="mt-1 text-sm text-orange-700">
              Sistema envia eventos automaticamente quando carrinho é recuperado. Sem trabalho manual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
