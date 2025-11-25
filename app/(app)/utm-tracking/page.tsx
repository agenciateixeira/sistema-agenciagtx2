import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SectionTitle } from '@/components/dashboard/section-title';
import { Link2, Copy, CheckCircle, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';
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

  const storeDomain = integrations?.[0]?.shop_domain || 'suaminhaloja.com.br';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UTM Tracking</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure parâmetros UTM para rastrear origem dos carrinhos abandonados
          </p>
        </div>
        <Link
          href="/ads-dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <TrendingUp className="h-4 w-4" />
          Ver Dashboard Ads
        </Link>
      </div>

      {/* O que é UTM? */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <Link2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">O que são parâmetros UTM?</h2>
            <p className="mt-2 text-sm text-gray-700">
              UTM (Urchin Tracking Module) são parâmetros adicionados às URLs para rastrear a origem do tráfego.
              Com eles, você consegue identificar exatamente de qual <strong>campanha de anúncio</strong> veio cada carrinho abandonado.
            </p>
            <div className="mt-4 rounded-lg bg-white p-4">
              <p className="text-sm font-semibold text-gray-900">💡 Exemplo prático:</p>
              <p className="mt-2 text-sm text-gray-700">
                Se você tem uma campanha no Facebook chamada "Black Friday 2024", adiciona UTMs na URL do anúncio.
                Quando o cliente clica, abandona o carrinho e depois recebe o email de recuperação, <strong>você saberá
                exatamente quanto gastou nessa campanha e quanto recuperou!</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Por que usar UTMs? */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="🎯 Por que usar UTMs no seu negócio?"
          description="Benefícios de rastrear a origem dos carrinhos"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Calcular ROI Real</h3>
            </div>
            <p className="mt-2 text-sm text-green-700">
              Saiba exatamente quanto você gastou em anúncios e quanto recuperou de vendas. Exemplo: Gastou R$ 500 na
              campanha, recuperou R$ 1.200 = ROI de 140%!
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Otimizar Campanhas</h3>
            </div>
            <p className="mt-2 text-sm text-blue-700">
              Identifique quais campanhas geram mais carrinhos abandonados (e consequentemente mais oportunidades
              de recuperação).
            </p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Decisões Data-Driven</h3>
            </div>
            <p className="mt-2 text-sm text-purple-700">
              Pare de adivinhar! Veja dados reais de qual fonte traz mais carrinhos, qual converte mais,
              e onde investir mais budget.
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Dashboard Unificado</h3>
            </div>
            <p className="mt-2 text-sm text-orange-700">
              Veja em um só lugar: Gastos em Ads (Meta Ads) + Carrinhos Gerados + Vendas Recuperadas + ROI.
              Tudo automatizado!
            </p>
          </div>
        </div>
      </div>

      {/* Parâmetros UTM */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="📋 Parâmetros UTM Disponíveis"
          description="Entenda cada parâmetro e quando usar"
        />

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-sm font-semibold text-gray-900">utm_source</p>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>Obrigatório.</strong> A origem do tráfego (onde o anúncio foi exibido)
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Exemplos: <code className="rounded bg-gray-200 px-1 py-0.5">facebook</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">instagram</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">google</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">tiktok</code>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-sm font-semibold text-gray-900">utm_medium</p>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>Obrigatório.</strong> O tipo de marketing usado
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Exemplos: <code className="rounded bg-gray-200 px-1 py-0.5">cpc</code> (custo por clique),{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">social</code> (mídia social),{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">email</code>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-sm font-semibold text-gray-900">utm_campaign</p>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>Obrigatório.</strong> O nome da sua campanha específica
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Exemplos: <code className="rounded bg-gray-200 px-1 py-0.5">black-friday-2024</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">lancamento-produto-x</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">promocao-natal</code>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-sm font-semibold text-gray-900">utm_content</p>
                <p className="mt-1 text-sm text-gray-600">
                  Opcional. Para diferenciar anúncios similares ou links no mesmo conteúdo
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Exemplos: <code className="rounded bg-gray-200 px-1 py-0.5">banner-azul</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">botao-topo</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">video-1</code>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-mono text-sm font-semibold text-gray-900">utm_term</p>
                <p className="mt-1 text-sm text-gray-600">
                  Opcional. Para campanhas de pesquisa paga (palavras-chave)
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Exemplos: <code className="rounded bg-gray-200 px-1 py-0.5">tenis-esportivo</code>,{' '}
                  <code className="rounded bg-gray-200 px-1 py-0.5">roupa-fitness</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Como criar URLs com UTM */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="🔗 Como criar URLs com UTM?"
          description="Passo a passo para configurar suas campanhas"
        />

        <div className="mt-6 space-y-6">
          {/* Método 1: Manual */}
          <div>
            <h3 className="text-base font-semibold text-gray-900">Método 1: Construção Manual</h3>
            <p className="mt-2 text-sm text-gray-600">
              Adicione os parâmetros no final da URL da sua loja, começando com <code className="rounded bg-gray-100 px-1 py-0.5">?</code> e separando com <code className="rounded bg-gray-100 px-1 py-0.5">&</code>
            </p>

            <div className="mt-4 rounded-lg bg-gray-900 p-4">
              <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Exemplo:</p>
              <code className="block text-sm text-green-400 break-all">
                https://{storeDomain}/produtos?utm_source=facebook&utm_medium=cpc&utm_campaign=black-friday-2024
              </code>
            </div>
          </div>

          {/* Método 2: Google Campaign URL Builder */}
          <div>
            <h3 className="text-base font-semibold text-gray-900">Método 2: Google Campaign URL Builder (Recomendado)</h3>
            <p className="mt-2 text-sm text-gray-600">
              Use a ferramenta gratuita do Google para gerar URLs automaticamente
            </p>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Google Campaign URL Builder</p>
                  <p className="mt-1 text-xs text-blue-700">
                    Ferramenta oficial do Google Analytics para criar URLs com UTM
                  </p>
                  <a
                    href="https://ga-dev-tools.google/ga4/campaign-url-builder/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                  >
                    Abrir ferramenta
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Passo a passo:</p>
              <ol className="ml-5 list-decimal space-y-2 text-sm text-gray-700">
                <li>Acesse o URL Builder do Google</li>
                <li>Preencha:
                  <ul className="ml-5 mt-1 list-disc space-y-1 text-xs text-gray-600">
                    <li><strong>Website URL:</strong> https://{storeDomain}/produtos</li>
                    <li><strong>Campaign source:</strong> facebook</li>
                    <li><strong>Campaign medium:</strong> cpc</li>
                    <li><strong>Campaign name:</strong> black-friday-2024</li>
                  </ul>
                </li>
                <li>Copie a URL gerada</li>
                <li>Cole no seu anúncio do Facebook/Instagram/Google</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Exemplos Práticos por Plataforma */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="💡 Exemplos Práticos por Plataforma"
          description="URLs prontas para copiar e adaptar"
        />

        <div className="mt-6 space-y-4">
          {/* Facebook/Instagram Ads */}
          <details className="rounded-lg border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
              📘 Facebook / Instagram Ads
            </summary>
            <div className="space-y-4 border-t border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Campanha de Conversão:</p>
                <div className="mt-2 rounded bg-gray-900 p-3">
                  <code className="text-xs text-green-400 break-all">
                    https://{storeDomain}?utm_source=facebook&utm_medium=cpc&utm_campaign=conversao-verao-2024&utm_content=carousel-praia
                  </code>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">Instagram Stories:</p>
                <div className="mt-2 rounded bg-gray-900 p-3">
                  <code className="text-xs text-green-400 break-all">
                    https://{storeDomain}?utm_source=instagram&utm_medium=stories&utm_campaign=lancamento-colecao&utm_content=stories-swipe-up
                  </code>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-900">
                  <strong>💡 Dica:</strong> No Gerenciador de Anúncios do Meta, cole a URL com UTM no campo "URL do site".
                  Todos os cliques serão rastreados automaticamente!
                </p>
              </div>
            </div>
          </details>

          {/* Google Ads */}
          <details className="rounded-lg border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
              🔍 Google Ads
            </summary>
            <div className="space-y-4 border-t border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Campanha de Pesquisa:</p>
                <div className="mt-2 rounded bg-gray-900 p-3">
                  <code className="text-xs text-green-400 break-all">
                    https://{storeDomain}?utm_source=google&utm_medium=cpc&utm_campaign=pesquisa-produto-x&utm_term=tenis-corrida
                  </code>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">Google Shopping:</p>
                <div className="mt-2 rounded bg-gray-900 p-3">
                  <code className="text-xs text-green-400 break-all">
                    https://{storeDomain}/produto/tenis-x?utm_source=google&utm_medium=shopping&utm_campaign=shopping-performance-max
                  </code>
                </div>
              </div>
            </div>
          </details>

          {/* TikTok Ads */}
          <details className="rounded-lg border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
              🎵 TikTok Ads
            </summary>
            <div className="space-y-4 border-t border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">In-Feed Ads:</p>
                <div className="mt-2 rounded bg-gray-900 p-3">
                  <code className="text-xs text-green-400 break-all">
                    https://{storeDomain}?utm_source=tiktok&utm_medium=cpc&utm_campaign=viral-produto-x&utm_content=video-dance
                  </code>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Como testar */}
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">✅ Como testar se está funcionando?</h3>
            <ol className="mt-4 ml-5 list-decimal space-y-2 text-sm text-gray-700">
              <li>Crie uma URL com UTM (use o Google URL Builder)</li>
              <li>Abra a URL no navegador</li>
              <li>Adicione produtos ao carrinho</li>
              <li>Feche a aba (simule abandono)</li>
              <li>Acesse <Link href="/recovery" className="font-semibold text-green-700 underline">Recuperação de Vendas</Link></li>
              <li>Veja se o carrinho aparece com os parâmetros UTM preenchidos!</li>
            </ol>
            <div className="mt-4 rounded-lg bg-white p-3">
              <p className="text-xs text-gray-600">
                <strong>Importante:</strong> Após configurar os UTMs, pode levar até 24h para os dados aparecerem
                no Dashboard de ROI, pois precisamos cruzar com os gastos da Meta Ads.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos passos */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="🚀 Próximos Passos"
          description="Configure e comece a rastrear hoje"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            href="/integrations"
            className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 transition hover:border-blue-300 hover:bg-blue-100"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <h4 className="font-semibold text-blue-900">Conecte Meta Ads</h4>
            </div>
            <p className="mt-2 text-sm text-blue-700">
              Conecte sua conta para importar gastos automaticamente
            </p>
          </Link>

          <Link
            href="https://ga-dev-tools.google/ga4/campaign-url-builder/"
            target="_blank"
            className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 transition hover:border-purple-300 hover:bg-purple-100"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <h4 className="font-semibold text-purple-900">Crie URLs com UTM</h4>
            </div>
            <p className="mt-2 text-sm text-purple-700">
              Use o Google URL Builder para gerar suas URLs
            </p>
          </Link>

          <Link
            href="/ads-dashboard"
            className="rounded-lg border-2 border-green-200 bg-green-50 p-4 transition hover:border-green-300 hover:bg-green-100"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <h4 className="font-semibold text-green-900">Veja o ROI Real</h4>
            </div>
            <p className="mt-2 text-sm text-green-700">
              Acompanhe gasto vs receita recuperada por campanha
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
