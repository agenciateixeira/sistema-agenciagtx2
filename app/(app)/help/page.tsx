import { SectionTitle } from '@/components/dashboard/section-title';
import {
  Zap,
  ShoppingCart,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-4 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-brand-600 p-3">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo ao GTX Analytics
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Sistema completo de recuperação de vendas e relatórios automatizados para e-commerce
            </p>
          </div>
        </div>
      </div>

      {/* Status Atual */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Sistema em Desenvolvimento</h3>
            <p className="mt-1 text-sm text-yellow-800">
              Atualmente em <strong>Fase 1 (MVP)</strong>. Algumas funcionalidades ainda estão sendo implementadas.
              Você pode usar o sistema de equipe, perfil e configurações. As integrações com lojas estão em desenvolvimento.
            </p>
          </div>
        </div>
      </div>

      {/* O Que É */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="O Que Este Sistema Faz?"
          description="Entenda o poder da plataforma"
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-600 p-2">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recuperação de Carrinho
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-700">
              Sistema inteligente que detecta quando um cliente está abandonando o carrinho
              e automaticamente envia email/WhatsApp com ofertas personalizadas para recuperar a venda.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-purple-700">
              <CheckCircle className="h-4 w-4" />
              Recupere até 30% dos carrinhos abandonados
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Relatórios Automatizados
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-700">
              Receba relatórios completos de vendas, ROI, conversão e muito mais
              automaticamente no seu email. Configure uma vez e pronto!
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-700">
              <CheckCircle className="h-4 w-4" />
              Economize 10+ horas/semana em análises
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-600 p-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Testes A/B Automatizados
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-700">
              Teste diferentes mensagens, ofertas e descontos automaticamente.
              O sistema mostra qual converte mais e otimiza suas campanhas.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" />
              Aumente conversão com dados reais
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-600 p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gestão de Equipe
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-700">
              Convide sua equipe, defina permissões (Admin, Editor, Visualizador)
              e mantenha todos atualizados com os mesmos dados.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-700">
              <CheckCircle className="h-4 w-4" />
              Colaboração em tempo real
            </div>
          </div>
        </div>
      </div>

      {/* Como Começar */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Como Começar Agora"
          description="Siga estes passos para configurar"
        />

        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Configure seu Perfil</h4>
              <p className="mt-1 text-sm text-gray-600">
                Acesse a página <Link href="/profile" className="font-medium text-brand-600 hover:underline">Perfil</Link> e
                complete suas informações. Adicione seu nome e foto.
              </p>
            </div>
            <Link
              href="/profile"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Ir para Perfil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Convide sua Equipe</h4>
              <p className="mt-1 text-sm text-gray-600">
                Acesse <Link href="/team" className="font-medium text-brand-600 hover:underline">Equipe</Link> e
                convide seu gestor de tráfego, designer, ou qualquer pessoa que precise acessar relatórios.
              </p>
            </div>
            <Link
              href="/team"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Convidar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5 opacity-60">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-400 text-sm font-bold text-white">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Conecte sua Loja (Em breve)</h4>
              <p className="mt-1 text-sm text-gray-600">
                Em breve você poderá conectar sua loja Shopify, WooCommerce ou qualquer plataforma via Webhooks.
                O sistema começará a receber dados automaticamente.
              </p>
            </div>
            <button
              disabled
              className="flex shrink-0 items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
            >
              Em Desenvolvimento
            </button>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5 opacity-60">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-400 text-sm font-bold text-white">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Configure Recuperação (Em breve)</h4>
              <p className="mt-1 text-sm text-gray-600">
                Configure mensagens automáticas de recuperação de carrinho.
                Escolha quando enviar (15min? 1h?) e personalize a oferta.
              </p>
            </div>
            <button
              disabled
              className="flex shrink-0 items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
            >
              Em Desenvolvimento
            </button>
          </div>
        </div>
      </div>

      {/* Casos de Uso */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Casos de Uso Reais"
          description="Veja como usar na prática"
        />

        <div className="mt-6 space-y-4">
          <details className="rounded-lg border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
              💰 Gestor de Tráfego: Receber ROI todo dia automaticamente
            </summary>
            <div className="border-t border-gray-200 p-4 text-sm text-gray-700">
              <p><strong>Problema:</strong> Gasto R$ 10.000/mês em anúncios mas não sei o ROI exato em tempo real.</p>
              <p className="mt-2"><strong>Solução com GTX:</strong></p>
              <ol className="mt-2 ml-5 list-decimal space-y-1">
                <li>Conecta sua loja Shopify</li>
                <li>Configura relatório: "ROI Diário"</li>
                <li>Agenda envio: Todo dia às 9h no seu email</li>
                <li>Pronto! Acorda todo dia com relatório mostrando: gasto, vendas, ROI</li>
              </ol>
            </div>
          </details>

          <details className="rounded-lg border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
              🛒 Dono de Loja: Recuperar carrinhos abandonados automaticamente
            </summary>
            <div className="border-t border-gray-200 p-4 text-sm text-gray-700">
              <p><strong>Problema:</strong> Vejo 100 pessoas adicionando produtos no carrinho mas só 30 compram. Perco 70 vendas!</p>
              <p className="mt-2"><strong>Solução com GTX:</strong></p>
              <ol className="mt-2 ml-5 list-decimal space-y-1">
                <li>Sistema detecta: Cliente parado há 15min no checkout</li>
                <li>Envia automaticamente: Email "Esqueceu algo? Aqui está 10% OFF"</li>
                <li>Cliente recebe, volta e compra</li>
                <li>Você recupera 20-30% dos carrinhos perdidos (20-30 vendas a mais!)</li>
              </ol>
            </div>
          </details>

          <details className="rounded-lg border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer p-4 font-semibold text-gray-900 hover:bg-gray-100">
              🎯 Agência: Mostrar resultados claros para clientes
            </summary>
            <div className="border-t border-gray-200 p-4 text-sm text-gray-700">
              <p><strong>Problema:</strong> Cliente pergunta "qual foi o resultado da campanha?" e eu gasto horas fazendo planilhas.</p>
              <p className="mt-2"><strong>Solução com GTX:</strong></p>
              <ol className="mt-2 ml-5 list-decimal space-y-1">
                <li>Configura relatório semanal personalizado</li>
                <li>Sistema envia automaticamente para o email do cliente</li>
                <li>Relatório mostra: vendas, conversão, ROI em PDF bonito</li>
                <li>Cliente feliz, você economiza 10h/semana</li>
              </ol>
            </div>
          </details>
        </div>
      </div>

      {/* Suporte */}
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Precisa de Ajuda?</h3>
            <p className="mt-1 text-sm text-gray-600">
              Estamos aqui para ajudar você a ter sucesso com a plataforma
            </p>
          </div>
          <a
            href="mailto:suporte@agenciagtx.com.br"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Falar com Suporte
          </a>
        </div>
      </div>
    </div>
  );
}
