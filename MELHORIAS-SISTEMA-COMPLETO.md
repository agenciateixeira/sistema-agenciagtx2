# MELHORIAS SISTEMA AGENCIAGTX2 - OVERVIEW COMPLETO

## ANÁLISE SITUAÇÃO ATUAL

### O QUE ESTÁ FUNCIONANDO ✅
1. **Autenticação** - Login, logout, recuperação de senha, convites por email
2. **Integração Shopify** - Webhooks, detecção de carrinhos, tracking UTM
3. **Meta Ads OAuth** - Conexão, token encryption (AES-256), refresh automático
4. **Email Recovery** - Sistema automatizado de recuperação de carrinhos
5. **Tracking** - Open rates, click rates, conversões
6. **ROI Analysis** - Cruzamento Ads + Carrinhos recuperados
7. **Multi-tenant (Backend)** - RLS implementado, isolamento de dados perfeito
8. **Alerts System** - 6 tipos de alertas configuráveis
9. **Team Management** - Convites, roles (ADMIN/EDITOR/VIEWER)

### PROBLEMAS CRÍTICOS ❌

#### 1. **INTERFACE AMADORA**
- Dashboard mostra dados de tabelas que não existem/não são usadas (ReportSchedule, WebhookEndpoint)
- Design inconsistente entre páginas
- Componentes genéricos sem identidade visual
- Falta design system coeso
- Cores e espaçamentos sem padrão

#### 2. **MULTI-TENANT MAL IMPLEMENTADO NA UI**
- Seletor de contas **EXISTE** mas está escondido no ads-dashboard
- Não há seletor global de contas
- Usuário não vê claramente quais contas tem acesso
- Troca de conta não é intuitiva
- Falta persistência da conta selecionada entre páginas

#### 3. **MENU DESORGANIZADO**
Atualmente tem 12 itens em lista plana:
```
- Visão geral
- Integrações
- Recuperação de Vendas
- Meta Ads Dashboard
- UTM Tracking
- Meta CAPI
- Alertas
- Relatórios
- Notificações
- Equipe
- Perfil
- Como Usar
```

**Problemas:**
- Sem hierarquia ou categorias
- Itens relacionados estão separados
- Muitos itens para um menu lateral
- Priorização ruim (itens importantes perdidos)

#### 4. **FUNCIONALIDADES INCOMPLETAS**
- **Relatórios**: Página existe mas funcionalidade não implementada
- **Notificações**: Estrutura parcial, não integrada
- **Webhooks**: UI placeholder, CRUD incompleto
- **Perfil**: Página básica, falta configurações
- **Help**: Página vazia
- **Yampi/WooCommerce**: Mencionados mas não implementados

#### 5. **DASHBOARD GENÉRICO**
Exibe contadores de tabelas que podem estar vazias:
- "Relatórios Agendados" (tabela não usada)
- "Webhooks Ativos" (funcionalidade incompleta)
- "Notificações não lidas" (sistema parcial)

Deveria mostrar:
- Métricas reais do negócio (vendas, conversões, ROI)
- Carrinhos abandonados hoje/semana
- Performance de campanhas Meta
- Emails enviados/abertos/convertidos

#### 6. **FALTA PRIORIZAÇÃO DE FEATURES**
O sistema tenta fazer muita coisa, mas:
- Core business (recuperação + Meta Ads) funciona ✅
- Features secundárias estão pela metade ⚠️
- Isso dá impressão de "amador" e "inacabado"

---

## PLANO DE MELHORIAS COMPLETO

### FASE 1: REDESIGN UI/UX (PRIORIDADE MÁXIMA) 🎨

#### 1.1. **NOVO MENU HIERÁRQUICO**

**Estrutura proposta:**

```
┌─────────────────────────────────┐
│ [LOGO GTX]                      │
│                                 │
│ 🏠 Dashboard                    │
│                                 │
│ 📊 ANÁLISE                      │
│   └─ Meta Ads                   │
│   └─ ROI & Atribuição          │
│   └─ Relatórios                 │
│                                 │
│ 🛒 RECUPERAÇÃO                  │
│   └─ Carrinhos Abandonados     │
│   └─ Histórico de Emails       │
│   └─ Configurações             │
│                                 │
│ 🔗 INTEGRAÇÕES                  │
│   └─ E-commerce                 │
│   └─ Meta Ads & Pixel          │
│   └─ Conversions API           │
│                                 │
│ 🔔 Alertas [badge: 3]          │
│                                 │
│ ⚙️  CONFIGURAÇÕES               │
│   └─ Equipe                     │
│   └─ Perfil                     │
│   └─ Webhooks                   │
│                                 │
│ ❓ Ajuda & Documentação         │
│                                 │
│ ─────────────────────────────  │
│ [Avatar] Nome Usuário           │
│ ADMIN • 5 contas conectadas     │
│ [Trocar Conta ▼]               │
└─────────────────────────────────┘
```

**Benefícios:**
- Reduz de 12 para 6 itens principais
- Agrupa funcionalidades relacionadas
- Prioriza core features (Dashboard, Meta Ads, Recuperação)
- Remove ruído (move Equipe/Perfil/Webhooks para submenu Configurações)
- **Seletor de contas visível no rodapé do menu**

#### 1.2. **SELETOR GLOBAL DE CONTAS (MULTI-TENANT)**

**Implementação:**

```tsx
// No rodapé do Sidebar
<div className="border-t pt-4 space-y-3">
  {/* User Info */}
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={user.avatar_url} />
      <AvatarFallback>{user.nome[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{user.nome}</p>
      <p className="text-xs text-gray-500">{user.role}</p>
    </div>
  </div>

  {/* Account Selector */}
  <Popover>
    <PopoverTrigger>
      <button className="w-full rounded-lg border bg-white p-2 text-left hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">
              {selectedAccount?.name || 'Selecione uma conta'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {accounts.length} contas disponíveis
        </p>
      </button>
    </PopoverTrigger>
    <PopoverContent>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-semibold">Trocar Conta</h4>
          <Badge variant="secondary">{accounts.length}</Badge>
        </div>
        <Separator />
        <div className="max-h-60 overflow-y-auto">
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => handleAccountSwitch(account.id)}
              className={cn(
                "w-full rounded-md p-2 text-left hover:bg-gray-100",
                selectedAccount?.id === account.id && "bg-blue-50"
              )}
            >
              <div className="flex items-center gap-2">
                {selectedAccount?.id === account.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{account.name}</p>
                  <p className="text-xs text-gray-500">ID: {account.account_id}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PopoverContent>
  </Popover>
</div>
```

**Funcionalidades:**
- Popover elegante com lista de contas
- Indicador visual de conta ativa
- Contador de contas disponíveis
- Persistência no localStorage + cookie
- Sincronização entre abas (BroadcastChannel API)
- Loading state durante troca

**Context Provider:**

```tsx
// contexts/AccountContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Account {
  id: string;
  account_id: string;
  name: string;
  status: string;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  switchAccount: (accountId: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carregar contas disponíveis
  const loadAccounts = async () => {
    try {
      const response = await fetch(`/api/meta/ad-accounts?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);

        // Verificar conta salva no localStorage
        const savedAccountId = localStorage.getItem('selected_account_id');
        const savedAccount = data.accounts.find((acc: Account) => acc.account_id === savedAccountId);

        if (savedAccount) {
          setSelectedAccount(savedAccount);
        } else if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trocar conta
  const switchAccount = async (accountId: string) => {
    const toastId = toast.loading('Trocando conta...');

    try {
      // Salvar no backend como primary
      const response = await fetch('/api/meta/set-primary-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_account_id: accountId }),
      });

      if (!response.ok) throw new Error('Failed to switch account');

      // Atualizar estado local
      const account = accounts.find(acc => acc.account_id === accountId);
      if (account) {
        setSelectedAccount(account);
        localStorage.setItem('selected_account_id', accountId);

        // Notificar outras abas
        new BroadcastChannel('account_switch').postMessage({ accountId });

        toast.success('Conta alterada com sucesso!', { id: toastId });

        // Refresh da página para recarregar dados
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao trocar conta', { id: toastId });
    }
  };

  useEffect(() => {
    loadAccounts();

    // Listener para sincronizar entre abas
    const channel = new BroadcastChannel('account_switch');
    channel.onmessage = (event) => {
      const { accountId } = event.data;
      const account = accounts.find(acc => acc.account_id === accountId);
      if (account) {
        setSelectedAccount(account);
        router.refresh();
      }
    };

    return () => channel.close();
  }, []);

  return (
    <AccountContext.Provider value={{
      accounts,
      selectedAccount,
      switchAccount,
      refreshAccounts: loadAccounts,
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return context;
}
```

**Onde usar:**
- Sidebar (selector sempre visível)
- Dashboard (exibir métricas da conta selecionada)
- Meta Ads Dashboard (filtrar por conta)
- Recuperação (filtrar carrinhos por conta)
- Alertas (filtrar alertas por conta)

#### 1.3. **NOVO DASHBOARD REAL**

Remover dados fake e exibir métricas reais:

```tsx
// Dashboard Sections:

┌────────────────────────────────────────────────┐
│ Bem-vindo, {nome}!                             │
│ Última atualização: há 5 minutos         [🔄] │
└────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬──────────────┐
│ Gasto Ads   │ Carrinhos   │ Recuperados │ ROI Real     │
│ R$ 5.240    │ 143 hoje    │ 12 (8.4%)   │ 3.2x         │
│ ↑ 15% vs    │ ↓ 5% vs     │ ↑ 22% vs    │ ↑ 1.1x vs    │
│ ontem       │ ontem       │ ontem       │ ontem        │
└─────────────┴─────────────┴─────────────┴──────────────┘

┌──────────────────── ÚLTIMOS 7 DIAS ────────────────────┐
│ [Gráfico de linha: Gasto vs Receita Recuperada]       │
│                                                         │
│   R$                                                    │
│   8k ┤                                        ●         │
│   6k ┤                           ●         ●            │
│   4k ┤               ●         ●         ●              │
│   2k ┤     ●       ●         ●                          │
│   0  └──────────────────────────────────────            │
│       Seg  Ter  Qua  Qui  Sex  Sáb  Dom                │
│                                                         │
│       ── Gasto em Ads    ── Receita Recuperada         │
└─────────────────────────────────────────────────────────┘

┌─────────────────── AÇÕES RÁPIDAS ───────────────────────┐
│ [📧 Enviar Recovery Manual]  [📊 Exportar Relatório]    │
│ [🔔 Configurar Alerta]       [🔗 Conectar Loja]         │
└──────────────────────────────────────────────────────────┘

┌──────────── CAMPANHAS COM MELHOR ROAS ─────────────────┐
│ 1. Black Friday 2024       ROAS: 8.5x   Gasto: R$ 2.1k │
│ 2. Prospecção Q1           ROAS: 4.2x   Gasto: R$ 850  │
│ 3. Retargeting Carrinho    ROAS: 6.1x   Gasto: R$ 1.3k │
└──────────────────────────────────────────────────────────┘

┌─────────── CARRINHOS ABANDONADOS RECENTES ──────────────┐
│ cliente@email.com          R$ 349,90    há 2 horas      │
│   [📧 Enviar Email]  [👁️ Ver Detalhes]                  │
│                                                          │
│ joao@email.com             R$ 189,00    há 5 horas      │
│   [📧 Enviar Email]  [👁️ Ver Detalhes]                  │
│                                                          │
│ [Ver todos os 143 carrinhos →]                          │
└──────────────────────────────────────────────────────────┘

┌──────────────── ALERTAS ATIVOS ──────────────────────────┐
│ ⚠️  CPC aumentou 35% na campanha "Verão 2024"           │
│     Há 3 horas                          [Ver Campanha]  │
│                                                          │
│ ✅ Meta de ROAS 5x atingida em "Black Friday"           │
│     Há 1 dia                            [Ver Detalhes]  │
└──────────────────────────────────────────────────────────┘
```

**Queries necessárias:**

```typescript
// lib/dashboard-queries.ts

export async function getDashboardMetrics(userId: string, accountId: string, period: '24h' | '7d' | '30d') {
  const supabase = createServerClient(/*...*/);

  // 1. Gasto em Ads (Meta API)
  const adsSpend = await fetch(`/api/meta/insights?user_id=${userId}&account_id=${accountId}&date_preset=today`);

  // 2. Carrinhos abandonados hoje
  const { count: cartsToday } = await supabase
    .from('abandoned_carts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date().toISOString().split('T')[0]);

  // 3. Carrinhos recuperados
  const { count: recovered, data: recoveredCarts } = await supabase
    .from('abandoned_carts')
    .select('recovered_value')
    .eq('user_id', userId)
    .eq('status', 'recovered')
    .gte('recovered_at', new Date().toISOString().split('T')[0]);

  const totalRecovered = recoveredCarts?.reduce((sum, cart) => sum + (cart.recovered_value || 0), 0) || 0;

  // 4. ROI Real (receita recuperada / gasto ads)
  const roi = adsSpend > 0 ? totalRecovered / adsSpend : 0;

  return {
    adsSpend,
    cartsToday,
    recovered: {
      count: recovered || 0,
      percentage: cartsToday > 0 ? ((recovered || 0) / cartsToday) * 100 : 0,
      revenue: totalRecovered,
    },
    roi,
  };
}

export async function getRecentAbandonedCarts(userId: string, limit = 5) {
  const supabase = createServerClient(/*...*/);

  return await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'abandoned')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function getTopCampaignsByROAS(userId: string, accountId: string, limit = 3) {
  // Buscar campanhas do Meta API
  const campaigns = await fetch(`/api/meta/insights?user_id=${userId}&account_id=${accountId}&type=campaigns`);

  // Buscar ROI de cada campanha (cruzar com abandoned_carts por UTM)
  // ... lógica de cruzamento ...

  // Ordenar por ROAS
  return campaigns.sort((a, b) => b.roas - a.roas).slice(0, limit);
}
```

#### 1.4. **DESIGN SYSTEM PROFISSIONAL**

**Implementar shadcn/ui completamente:**

```bash
# Componentes a adicionar:
npx shadcn@latest add badge
npx shadcn@latest add card
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add popover
npx shadcn@latest add avatar
npx shadcn@latest add command
npx shadcn@latest add skeleton
npx shadcn@latest add tooltip
npx shadcn@latest add sonner  # Toast notifications modernas
```

**Theme customizado:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
      }
    }
  }
}
```

**Componentes padronizados:**

```tsx
// components/ui/metric-card.tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
    label: string;
  };
  icon?: React.ReactNode;
  loading?: boolean;
}

export function MetricCard({ title, value, change, icon, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon && (
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              {icon}
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-sm font-medium",
            change.trend === 'up' ? 'text-success-700' : 'text-danger-700'
          )}>
            {change.trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
            <span className="text-gray-500 ml-1">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### FASE 2: FINALIZAR FUNCIONALIDADES CORE 🚀

#### 2.1. **REMOVER OU FINALIZAR FEATURES INCOMPLETAS**

**Opção A: Remover do menu (recomendado)**
- Relatórios Agendados → Remover (não é core)
- Webhooks → Mover para aba em Integrações
- Notificações → Usar apenas Alertas (consolidar)

**Opção B: Finalizar (se tiver tempo)**
- Relatórios: Implementar exportação PDF/Excel agendada
- Webhooks: Finalizar CRUD e management
- Notificações: Consolidar com Alertas

**Decisão recomendada:** Opção A (remover)
- Foco no core: Recuperação + Meta Ads
- Menos é mais (aparência profissional)
- Pode adicionar depois se necessário

#### 2.2. **MELHORAR PÁGINA DE RECUPERAÇÃO**

Reorganizar abas:

```
┌──────────────────────────────────────────────┐
│ Recuperação de Vendas                         │
├──────────────────────────────────────────────┤
│ [📊 Overview] [🛒 Carrinhos] [📧 Emails] [⚙️ Config] │
└──────────────────────────────────────────────┘

ABA: Overview
- Total de carrinhos (hoje/semana/mês)
- Taxa de recuperação
- Receita recuperada
- Gráfico de performance
- Top produtos abandonados

ABA: Carrinhos
- Lista de carrinhos abandonados
- Filtros: Status, Data, Valor, UTM Campaign
- Ações em massa: Enviar email, Marcar como perdido
- Detalhes: Timeline, produtos, cliente

ABA: Emails
- Histórico de emails enviados
- Métricas: Taxa de abertura, cliques, conversão
- Visualização de templates usados
- Logs de envio

ABA: Config
- Templates de email (editor visual)
- Configurar delays (1h, 24h, 72h)
- Logo da marca
- Assinatura
- Testar email
```

#### 2.3. **MELHORAR META ADS DASHBOARD**

Adicionar funcionalidades:

```
┌────────────────────────────────────────────────┐
│ Meta Ads Dashboard                              │
│                                                 │
│ [Conta: Loja Principal ▼]  [Período: 30d ▼]   │
│ [Individual] [Comparar] [Consolidado]          │
└─────────────────────────────────────────────────┘

MODO INDIVIDUAL:
- Métricas da conta selecionada
- Gráficos de performance
- Tabela de campanhas
- ROI vs Shopify

MODO COMPARAR:
- Selecionar 2-4 contas
- Gráfico lado a lado
- Tabela comparativa
- Insights automáticos ("Conta A tem CPC 25% menor")

MODO CONSOLIDADO:
- Soma de todas as contas
- Performance geral
- Distribuição de budget
- Identificar melhor/pior conta
```

#### 2.4. **ADICIONAR ONBOARDING**

Para novos usuários:

```tsx
// components/onboarding/onboarding-wizard.tsx

<Steps>
  <Step 1>
    Bem-vindo ao Sistema GTX!
    Vamos configurar tudo em 3 passos.
  </Step>

  <Step 2>
    Conectar Shopify
    [Input: URL da loja]
    [Input: API Token]
    [Botão: Conectar]
  </Step>

  <Step 3>
    Conectar Meta Ads
    [Botão: Conectar com Facebook]
    Após conectar:
    [Dropdown: Selecionar conta de anúncios]
    [Dropdown: Selecionar Pixel]
  </Step>

  <Step 4>
    Configurar Email Recovery
    [Upload: Logo da marca]
    [Textarea: Mensagem personalizada]
    [Checkbox: Enviar email após 1h]
    [Checkbox: Enviar email após 24h]
  </Step>

  <Step 5>
    Tudo pronto! 🎉
    Seu sistema está configurado.
    [Botão: Ir para Dashboard]
  </Step>
</Steps>
```

**Quando exibir:**
- Primeiro login do usuário
- Quando não tem nenhuma integração conectada
- Quando falta configurar email recovery

---

### FASE 3: OTIMIZAÇÕES TÉCNICAS ⚡

#### 3.1. **PERFORMANCE**

```typescript
// Adicionar React Query para cache
npm install @tanstack/react-query

// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      cacheTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

// Usar em todos os componentes que fazem fetch
const { data, isLoading, error } = useQuery({
  queryKey: ['meta-insights', userId, datePreset],
  queryFn: () => fetch(`/api/meta/insights?...`).then(res => res.json()),
});
```

**Otimizar queries Supabase:**

```sql
-- Adicionar índices compostos para queries comuns
CREATE INDEX idx_abandoned_carts_user_status ON abandoned_carts(user_id, status);
CREATE INDEX idx_abandoned_carts_user_created ON abandoned_carts(user_id, created_at DESC);
CREATE INDEX idx_automated_actions_integration ON automated_actions(integration_id, action_type);

-- Índice para ROI queries (cruzamento UTM)
CREATE INDEX idx_abandoned_carts_utm_campaign ON abandoned_carts(user_id, utm_campaign, status)
WHERE utm_campaign IS NOT NULL;
```

#### 3.2. **ERROR HANDLING CONSISTENTE**

```tsx
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// Middleware de erro global
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Log para Sentry/monitoring
  console.error('Unhandled error:', error);

  return Response.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Usar em todas as API routes
export async function GET(request: Request) {
  try {
    // ... lógica ...
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Error Boundary:**

```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log para monitoring
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Algo deu errado
        </h2>
        <p className="mb-6 text-gray-600">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  );
}
```

#### 3.3. **LOADING STATES CONSISTENTES**

```tsx
// components/ui/loading-states.tsx

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-600" />
        <p className="mt-4 text-sm text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}

export function TableLoader({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
```

#### 3.4. **ADICIONAR MONITORING**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Não enviar erros de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

// Capturar erros em API routes
export function withSentry(handler: Function) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  };
}
```

---

### FASE 4: MOBILE & RESPONSIVIDADE 📱

#### 4.1. **SIDEBAR RESPONSIVO**

Já existe, mas melhorar:

```tsx
// Mobile: Drawer que abre da esquerda
// Desktop: Sidebar fixa

<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="lg:hidden">
      <Menu className="h-6 w-6" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-64 p-0">
    <Sidebar />
  </SheetContent>
</Sheet>
```

#### 4.2. **CARDS RESPONSIVOS**

```tsx
// Desktop: 4 colunas
// Tablet: 2 colunas
// Mobile: 1 coluna

<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {metrics.map(metric => (
    <MetricCard key={metric.id} {...metric} />
  ))}
</div>
```

#### 4.3. **TABELAS RESPONSIVAS**

```tsx
// Mobile: Cards empilhados
// Desktop: Tabela normal

<div className="hidden md:block">
  <Table>
    {/* Tabela normal */}
  </Table>
</div>

<div className="space-y-4 md:hidden">
  {data.map(item => (
    <Card key={item.id}>
      {/* Card com informações */}
    </Card>
  ))}
</div>
```

---

### FASE 5: DOCUMENTAÇÃO & HELP 📚

#### 5.1. **PÁGINA DE AJUDA**

```tsx
// app/(app)/help/page.tsx

<Tabs defaultValue="getting-started">
  <TabsList>
    <TabsTrigger value="getting-started">Começando</TabsTrigger>
    <TabsTrigger value="shopify">Shopify</TabsTrigger>
    <TabsTrigger value="meta-ads">Meta Ads</TabsTrigger>
    <TabsTrigger value="recovery">Recuperação</TabsTrigger>
    <TabsTrigger value="faq">FAQ</TabsTrigger>
  </TabsList>

  <TabsContent value="getting-started">
    <h2>Como começar</h2>
    <ol>
      <li>Conecte sua loja Shopify</li>
      <li>Conecte sua conta Meta Ads</li>
      <li>Configure o email de recuperação</li>
      <li>Ative os alertas</li>
    </ol>
  </TabsContent>

  {/* ... outras abas ... */}
</Tabs>
```

#### 5.2. **TOOLTIPS E HINTS**

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Esta métrica mostra o custo por clique médio das suas campanhas</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## CHECKLIST DE IMPLEMENTAÇÃO ✅

### Prioridade CRÍTICA (Fazer primeiro)
- [ ] Redesign do menu com hierarquia
- [ ] Seletor global de contas (multi-tenant visível)
- [ ] Novo dashboard com métricas reais
- [ ] Remover funcionalidades incompletas do menu
- [ ] Design system consistente (shadcn/ui)
- [ ] Loading states em todas as páginas
- [ ] Error handling consistente

### Prioridade ALTA (Semana 2)
- [ ] Reorganizar página de Recuperação (abas)
- [ ] Melhorar Meta Ads Dashboard (modos: individual/comparar/consolidado)
- [ ] Adicionar onboarding para novos usuários
- [ ] Context API para gerenciar conta selecionada
- [ ] Persistência de conta selecionada (localStorage + cookie)
- [ ] Mobile responsividade completa

### Prioridade MÉDIA (Semana 3-4)
- [ ] Otimizar queries (índices Supabase)
- [ ] Adicionar React Query para cache
- [ ] Implementar monitoring (Sentry)
- [ ] Página de Help com documentação
- [ ] Tooltips e hints em métricas
- [ ] Exportação de relatórios melhorada

### Prioridade BAIXA (Backlog)
- [ ] Yampi integration
- [ ] WooCommerce integration
- [ ] Relatórios agendados
- [ ] Webhooks management completo
- [ ] Testes automatizados (E2E com Playwright)

---

## ARQUITETURA PROPOSTA - MULTI TENANT

### Como funciona atualmente (Backend):
✅ RLS (Row Level Security) implementado perfeitamente
✅ Isolamento total por `user_id`
✅ Meta connections: 1 por usuário
✅ Ad accounts: N por meta_connection

### Problema:
❌ Usuário não vê claramente as contas disponíveis
❌ Troca de conta não é intuitiva
❌ Sem persistência de preferência

### Solução:

```
┌─────────────────────────────────────────────┐
│                  USER                        │
│  - id                                        │
│  - nome                                      │
│  - role                                      │
└─────────────────────────────────────────────┘
                    │
                    │ 1:1
                    ▼
┌─────────────────────────────────────────────┐
│           META_CONNECTION                    │
│  - user_id                                   │
│  - access_token_encrypted                    │
│  - ad_account_ids (array)                   │
│  - primary_ad_account_id                    │
└─────────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌─────────────────────────────────────────────┐
│         AD ACCOUNTS (Meta API)               │
│  Retornados via /api/meta/ad-accounts       │
│  [                                           │
│    { id: "act_123", name: "Loja Principal" }│
│    { id: "act_456", name: "Loja 2" }       │
│    { id: "act_789", name: "Loja 3" }       │
│  ]                                           │
└─────────────────────────────────────────────┘
```

**Fluxo de troca de conta:**

1. User clica no seletor de contas (sidebar rodapé)
2. Popover mostra lista de `ad_account_ids` disponíveis
3. User seleciona conta
4. Frontend:
   - Chama `/api/meta/set-primary-account` (já existe!)
   - Salva no `localStorage` a escolha
   - Emite evento via `BroadcastChannel` (sincroniza abas)
   - Atualiza Context API
   - Faz `router.refresh()` para recarregar páginas
5. Backend:
   - Atualiza `meta_connections.primary_ad_account_id`
6. Todas as páginas usam `useAccount()` para pegar conta ativa
7. APIs recebem `account_id` como query param

**Vantagens:**
- Simples (sem mudanças no DB)
- Usa infraestrutura existente
- Persistência cross-tabs
- UX clara e profissional

---

## ESTIMATIVA DE ESFORÇO

| Fase | Tempo Estimado | Prioridade |
|------|----------------|------------|
| Fase 1: Redesign UI/UX | 5-7 dias | 🔴 CRÍTICA |
| Fase 2: Finalizar Core | 3-4 dias | 🟠 ALTA |
| Fase 3: Otimizações | 2-3 dias | 🟡 MÉDIA |
| Fase 4: Mobile | 2-3 dias | 🟡 MÉDIA |
| Fase 5: Documentação | 1-2 dias | 🟢 BAIXA |
| **TOTAL** | **13-19 dias** | |

**Com 1 dev full-time: ~3-4 semanas**

---

## RESULTADO ESPERADO

### Antes:
- Interface genérica e amadora
- Menu desorganizado com 12 itens
- Multi-tenant escondido
- Dashboard com dados fake
- Funcionalidades incompletas expostas
- Sem identidade visual
- Confuso para novos usuários

### Depois:
- Interface profissional e moderna
- Menu hierárquico com 6 seções
- Multi-tenant visível e intuitivo (rodapé do sidebar)
- Dashboard com métricas reais do negócio
- Apenas features completas no menu
- Design system consistente (shadcn/ui)
- Onboarding guiado para novos usuários
- Loading states e error handling em tudo
- Mobile-first e responsivo
- Performance otimizada (cache, índices)
- Monitoring e observability

---

## REFERÊNCIAS DE UI (Inspiração)

Sites profissionais de SaaS para se inspirar:

1. **Vercel Dashboard**: https://vercel.com/dashboard
   - Menu lateral clean
   - Seletor de projetos no topo
   - Cards de métricas bem desenhados

2. **Linear**: https://linear.app
   - Design minimalista e profissional
   - Hierarquia de informação clara
   - Animações sutis

3. **Stripe Dashboard**: https://dashboard.stripe.com
   - Métricas de negócio bem apresentadas
   - Gráficos informativos
   - Ações rápidas visíveis

4. **Notion**: https://notion.so
   - Sidebar colapsável
   - Hierarquia de navegação
   - Interface limpa

5. **Clerk Dashboard**: https://dashboard.clerk.com
   - Multi-tenant bem implementado
   - Seletor de workspace no topo
   - Onboarding excelente

---

## PRÓXIMOS PASSOS

1. **Revisar este documento** com o time/cliente
2. **Priorizar fases** (recomendo: Fase 1 completa primeiro)
3. **Criar branch**: `feature/redesign-ui-ux`
4. **Começar pelo menu** (impacto visual imediato)
5. **Implementar seletor de contas** (resolver multi-tenant)
6. **Novo dashboard** (métricas reais)
7. **Iterar e refinar** com feedback

**Quer que eu comece a implementação?** Me diga por onde prefere começar! 🚀
