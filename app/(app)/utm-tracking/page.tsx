import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SectionTitle } from '@/components/dashboard/section-title';
import { UTMBuilder } from '@/components/utm/utm-builder';
import { Link2, TrendingUp, HelpCircle, Lightbulb } from 'lucide-react';
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

export default async function UTMTrackingPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar integrações para pegar o domínio da loja
  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .limit(1);

  const storeDomain = integrations?.[0]?.shop_domain || 'minhaloja.com.br';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerador de URLs com UTM</h1>
          <p className="mt-1 text-sm text-gray-600">
            Crie links rastreáveis para suas campanhas de anúncios
          </p>
        </div>
        <Link
          href="/ads-dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <TrendingUp className="h-4 w-4" />
          Ver Dashboard
        </Link>
      </div>

      {/* O que é UTM? - Resumo */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
            <Link2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">O que são parâmetros UTM?</h2>
            <p className="mt-2 text-sm text-gray-700">
              UTM são códigos adicionados à URL para rastrear de onde vem cada visitante. Com eles, você consegue
              saber exatamente qual <strong>campanha de anúncio</strong> trouxe cada carrinho abandonado e calcular
              o <strong>ROI Real</strong> do seu investimento.
            </p>
            <div className="mt-3 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-700">✅ Calcular ROI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700">✅ Otimizar campanhas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-700">✅ Decisões baseadas em dados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gerador de UTM - Destaque Principal */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">🔗 Criar URL com UTM</h2>
          <p className="mt-1 text-sm text-gray-600">
            Preencha os campos abaixo para gerar uma URL rastreável
          </p>
        </div>

        <UTMBuilder storeDomain={storeDomain} />
      </div>

      {/* Accordions - Informações extras */}
      <div className="space-y-3">
        {/* O que significa cada campo? */}
        <details className="rounded-lg border border-gray-200 bg-white">
          <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-50 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            O que significa cada campo?
          </summary>
          <div className="space-y-3 border-t border-gray-200 p-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">utm_source</p>
              <p className="mt-1 text-gray-600">
                Onde o anúncio foi exibido. Ex: <code className="rounded bg-gray-200 px-1">facebook</code>,{' '}
                <code className="rounded bg-gray-200 px-1">instagram</code>,{' '}
                <code className="rounded bg-gray-200 px-1">google</code>
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">utm_medium</p>
              <p className="mt-1 text-gray-600">
                Tipo de marketing. Ex: <code className="rounded bg-gray-200 px-1">cpc</code> (anúncio pago),{' '}
                <code className="rounded bg-gray-200 px-1">social</code> (mídia social)
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">utm_campaign</p>
              <p className="mt-1 text-gray-600">
                Nome da campanha. Ex: <code className="rounded bg-gray-200 px-1">black-friday-2024</code>,{' '}
                <code className="rounded bg-gray-200 px-1">lancamento-verao</code>
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">utm_content <span className="text-gray-500">(opcional)</span></p>
              <p className="mt-1 text-gray-600">
                Diferencia anúncios similares. Ex: <code className="rounded bg-gray-200 px-1">banner-azul</code>,{' '}
                <code className="rounded bg-gray-200 px-1">video-1</code>
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">utm_term <span className="text-gray-500">(opcional)</span></p>
              <p className="mt-1 text-gray-600">
                Palavra-chave do Google Ads. Ex: <code className="rounded bg-gray-200 px-1">tenis-corrida</code>
              </p>
            </div>
          </div>
        </details>

        {/* Exemplos Práticos */}
        <details className="rounded-lg border border-gray-200 bg-white">
          <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-50 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Exemplos práticos por plataforma
          </summary>
          <div className="space-y-4 border-t border-gray-200 p-4">
            {/* Facebook Ads */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="font-semibold text-blue-900">📘 Facebook Ads - Campanha de Conversão</p>
              <div className="mt-2 rounded bg-gray-900 p-3">
                <code className="text-xs text-green-400 break-all">
                  https://{storeDomain}?utm_source=facebook&utm_medium=cpc&utm_campaign=black-friday-2024&utm_content=carousel
                </code>
              </div>
              <p className="mt-2 text-xs text-blue-700">
                💡 Cole essa URL no campo "URL do site" no Gerenciador de Anúncios do Meta
              </p>
            </div>

            {/* Instagram Stories */}
            <div className="rounded-lg border border-pink-200 bg-pink-50 p-4">
              <p className="font-semibold text-pink-900">📸 Instagram Stories</p>
              <div className="mt-2 rounded bg-gray-900 p-3">
                <code className="text-xs text-green-400 break-all">
                  https://{storeDomain}?utm_source=instagram&utm_medium=stories&utm_campaign=lancamento-colecao&utm_content=swipe-up
                </code>
              </div>
            </div>

            {/* Google Ads */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-green-900">🔍 Google Ads - Pesquisa</p>
              <div className="mt-2 rounded bg-gray-900 p-3">
                <code className="text-xs text-green-400 break-all">
                  https://{storeDomain}?utm_source=google&utm_medium=cpc&utm_campaign=produtos-esportivos&utm_term=tenis-corrida
                </code>
              </div>
              <p className="mt-2 text-xs text-green-700">
                💡 Use utm_term para identificar qual palavra-chave trouxe o visitante
              </p>
            </div>
          </div>
        </details>

        {/* Como usar */}
        <details className="rounded-lg border border-gray-200 bg-white">
          <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-50 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Como usar a URL no Meta Ads?
          </summary>
          <div className="space-y-3 border-t border-gray-200 p-4">
            <ol className="ml-5 list-decimal space-y-2 text-sm text-gray-700">
              <li>Gere a URL acima e clique em "Copiar"</li>
              <li>Abra o <strong>Gerenciador de Anúncios</strong> do Meta (Facebook/Instagram)</li>
              <li>Crie ou edite uma campanha</li>
              <li>No campo <strong>"URL do site"</strong> ou <strong>"Link de destino"</strong>, cole a URL gerada</li>
              <li>Publique o anúncio</li>
              <li>Quando alguém clicar, o UTM será capturado automaticamente</li>
              <li>Acompanhe o ROI em <Link href="/ads-dashboard" className="font-semibold text-blue-600 underline">Meta Ads Dashboard</Link></li>
            </ol>

            <div className="mt-4 rounded-lg bg-green-50 p-3 border border-green-200">
              <p className="text-sm text-green-900">
                <strong>✅ Pronto!</strong> Agora todo carrinho abandonado que vier dessa campanha será rastreado.
                Você poderá ver quanto gastou na campanha vs quanto recuperou em vendas!
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
