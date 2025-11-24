import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SectionTitle } from '@/components/dashboard/section-title';
import { IntegrationsList } from '@/components/integrations/integrations-list';
import { AddIntegrationButton } from '@/components/integrations/add-integration-button';

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

export default async function IntegrationsPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar integrações do usuário
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar integrações:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
          <p className="mt-1 text-sm text-gray-600">
            Conecte sua loja Shopify, Yampi ou WooCommerce
          </p>
        </div>
        <AddIntegrationButton />
      </div>

      {/* Status Card */}
      {integrations && integrations.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
            <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhuma integração configurada
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Conecte sua primeira loja para começar a recuperar vendas automaticamente
          </p>
          <div className="mt-6">
            <AddIntegrationButton />
          </div>
        </div>
      )}

      {/* Lista de Integrações */}
      {integrations && integrations.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle
            title="Suas Integrações"
            description="Lojas conectadas ao sistema"
          />
          <div className="mt-6">
            <IntegrationsList integrations={integrations} />
          </div>
        </div>
      )}

      {/* Guia de Configuração */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Como Configurar"
          description="Passo a passo para conectar sua loja"
        />

        <div className="mt-6 space-y-6">
          {/* Shopify */}
          <details className="rounded-lg border border-gray-200">
            <summary className="cursor-pointer bg-gray-50 p-4 font-semibold text-gray-900 hover:bg-gray-100">
              📦 Shopify - Como conectar
            </summary>
            <div className="space-y-4 p-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">1. Criar App Privado na Shopify</p>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Acesse: Admin da sua loja → Settings → Apps and sales channels</li>
                  <li>Clique em "Develop apps" → "Create an app"</li>
                  <li>Dê um nome: "GTX Analytics"</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900">2. Configurar Permissões (Access Scopes)</p>
                <p className="mt-1">Vá em "Configuration" → "Admin API integration" e selecione os seguintes scopes:</p>
                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-700 uppercase">Scopes Necessários:</p>
                  <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
                    <li><code className="rounded bg-gray-200 px-1 py-0.5 text-xs">read_orders</code> - Ver pedidos, vendas e carrinhos abandonados</li>
                    <li><code className="rounded bg-gray-200 px-1 py-0.5 text-xs">read_products</code> - Ver produtos do carrinho</li>
                    <li><code className="rounded bg-gray-200 px-1 py-0.5 text-xs">read_customers</code> - Ver dados dos clientes</li>
                  </ul>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  💡 O scope <code>read_orders</code> inclui acesso aos checkouts abandonados (AbandonedCheckout). Webhooks são configurados automaticamente via API.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">3. Instalar e Obter Credenciais</p>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Clique em "Install app"</li>
                  <li>Vá em "API credentials"</li>
                  <li>Copie: <strong>Admin API access token</strong></li>
                  <li>Copie também: <strong>API secret key</strong></li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900">4. Conectar no GTX Analytics</p>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Clique em "Adicionar Integração" acima</li>
                  <li>Escolha "Shopify"</li>
                  <li>Cole as credenciais</li>
                  <li>Clique em "Conectar"</li>
                </ul>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-blue-900">
                  💡 <strong>Dica:</strong> Nosso sistema configura os webhooks automaticamente após conectar!
                </p>
              </div>
            </div>
          </details>

          {/* Yampi */}
          <details className="rounded-lg border border-gray-200">
            <summary className="cursor-pointer bg-gray-50 p-4 font-semibold text-gray-900 hover:bg-gray-100">
              🛒 Yampi - Como conectar
            </summary>
            <div className="space-y-4 p-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">1. Obter Token da Yampi</p>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Acesse: Painel Yampi → Configurações → Integrações</li>
                  <li>Clique em "Gerar Token de API"</li>
                  <li>Copie o token gerado</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-900">2. Conectar no GTX Analytics</p>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Clique em "Adicionar Integração"</li>
                  <li>Escolha "Yampi"</li>
                  <li>Cole o token</li>
                  <li>Clique em "Conectar"</li>
                </ul>
              </div>

              <div className="rounded-lg bg-yellow-50 p-3">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>Em desenvolvimento:</strong> Integração Yampi chegando em breve!
                </p>
              </div>
            </div>
          </details>

          {/* WooCommerce */}
          <details className="rounded-lg border border-gray-200">
            <summary className="cursor-pointer bg-gray-50 p-4 font-semibold text-gray-900 hover:bg-gray-100">
              🔌 WooCommerce - Como conectar
            </summary>
            <div className="space-y-4 p-4 text-sm text-gray-700">
              <div className="rounded-lg bg-yellow-50 p-3">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>Em desenvolvimento:</strong> Integração WooCommerce chegando em breve!
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
