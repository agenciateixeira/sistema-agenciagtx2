# Dashboard Optmos - Status do Projeto

## O que foi feito

### 1. Motor de Decisão (`lib/motor-decisao.ts`)
- Engine que analisa cada campanha automaticamente
- Calcula CPA real vs CPA alvo e decide: **escalar, manter, observar, reduzir ou pausar**
- Calcula tendência (melhorando/estável/piorando) baseado em dados diários
- Sugere % de ajuste de verba (+20%, -30%, etc.)
- Detecta fadiga de público por frequência alta

### 2. Meta Creatives Service (`lib/meta-creatives.ts`)
- Tipos de conversão customizáveis (mensagens, leads, compras, cadastros, etc.)
- Métricas de imagem: Click Rate, Engagement Rate, Save Rate
- Métricas de vídeo: Hook Rate, Hold Rate, video retention (P25/P50/P75/P95)
- Quality Score (0-10) com nível: poor → excellent
- Fatigue Score (0-100) com nível: low → critical
- Account Health Score (0-100) com 7 métricas e benchmarks
- Raw actions map para conversões dinâmicas
- Helpers: `getConversionsForTypes()`, `getCostPerConversion()`

### 3. APIs Criadas
| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/meta/creatives/daily` | GET | Performance diária por anúncio (time_increment=1) |
| `/api/meta/creatives/placements` | GET | Breakdown por posicionamento (Feed, Stories, Reels) |
| `/api/meta/campaigns/budget` | POST | **Edição real de verba via Meta API** |
| `/api/meta/campaigns/budget` | GET | Consulta budget atual de campanha/adset |

#### API de Budget - Detalhes:
- Converte R$ para centavos automaticamente (Meta espera minor units)
- Limite de segurança: max redução **-80%**, max aumento **+200%** por vez
- Log de auditoria de todas as alterações
- Busca budget anterior e novo para confirmação

### 4. Componentes Frontend (Layout Optmos 3 colunas)

| Componente | Descrição |
|------------|-----------|
| `period-sidebar.tsx` | Sidebar esquerda: período (Hoje/7d/MTD/30d), resumo métricas, canal, reconciliação |
| `alert-banner.tsx` | Banner "CPA acima do alvo" / "CPA dentro do alvo" com strip de KPIs |
| `account-temperature.tsx` | Gauge de temperatura 34-42°C (Normal/Atenção/Quente/Crítico) |
| `kpi-cards-row.tsx` | 4 cards: Investimento Total, Pedidos Reais, ROAS Real, Receita Real |
| `motor-decisao-table.tsx` | Tabela de campanhas com decisão automática, edição de verba inline, export CSV |
| `cohort-panel.tsx` | Sidebar direita: maturação D0→D28 (barras) + performance table |
| `ads-dashboard-client.tsx` | Client principal que orquestra tudo no layout 3 colunas |

### 5. Multi-Tenant (já existia, mantido)
- Dropdown de seleção de conta de anúncios
- Modos: Individual / Comparar / Consolidado
- Salva conta primária via `/api/meta/set-primary-account`

---

## O que falta fazer

### URGENTE - Dashboard não mostra dados
O dashboard mostra "Nenhum dado encontrado para o período selecionado". Possíveis causas:

1. **Conta primária sem dados** - O usuário tem 21 contas mas a `primary_ad_account_id` selecionada pode não ter campanhas ativas. Precisa:
   - Abrir DevTools (F12) → Console → recarregar `/ads-dashboard`
   - Verificar os logs: `🔵 Fetching...` / `📡 Account response status` / `❌ Error`
   - Se erro 401: token expirou, reconectar Meta em Integrações
   - Se dados vazios: trocar conta no dropdown

2. **Token Meta expirado** - Verificar em `meta_connections` no Supabase se `token_expires_at` > now()

3. **O dropdown de contas pode não carregar** - A API `/api/meta/ad-accounts` precisa retornar as 21 contas

### Melhorias pendentes

- [ ] **Cohort real** - Atualmente simulado. Precisa cruzar dados de vendas do Shopify com datas de clique nos ads para ter maturação real D0→D28
- [ ] **CPA Alvo por campanha** - Hoje é um valor global (R$ 60). Ideal: cada campanha ter seu alvo
- [ ] **Reconciliação Meta vs Shopify** - Gap entre conversões reportadas pelo Meta e pedidos reais no Shopify
- [ ] **Edição de verba via Meta API** - O código está pronto mas precisa testar com conta real que tenha permissão `ads_management`
- [ ] **Pausar campanha** - Botão "Pausar" no Motor de Decisão deveria chamar Meta API para pausar (atualmente só mostra toast)
- [ ] **Histórico de alterações de verba** - Salvar no Supabase cada alteração feita pelo Motor de Decisão
- [ ] **Alertas automáticos** - Quando CPA ultrapassa alvo, enviar notificação
- [ ] **Gráfico Custo vs Mensagens** - Para campanhas de mensagem, gráfico scatter de custo por mensagem recebida

### Estrutura de arquivos

```
sistema-agenciagtx2/
├── lib/
│   ├── meta-creatives.ts          # Serviço completo de criativos + Account Health
│   ├── motor-decisao.ts           # Engine de decisão automática
│   ├── meta-insights.ts           # Insights de conta/campanhas (já existia)
│   └── crypto.ts                  # Criptografia de tokens (já existia)
├── app/api/meta/
│   ├── insights/route.ts          # GET insights (account/campaigns/daily)
│   ├── creatives/
│   │   ├── route.ts               # GET criativos com insights
│   │   ├── daily/route.ts         # GET performance diária por anúncio
│   │   └── placements/route.ts    # GET breakdown por posicionamento
│   ├── campaigns/
│   │   └── budget/route.ts        # GET/POST edição de verba real
│   ├── ad-accounts/route.ts       # GET lista de contas
│   └── set-primary-account/route.ts # POST definir conta primária
├── components/ads-dashboard/
│   ├── ads-dashboard-client.tsx    # Orquestrador principal (layout Optmos)
│   ├── period-sidebar.tsx          # Sidebar esquerda
│   ├── alert-banner.tsx            # Banner de alerta CPA
│   ├── account-temperature.tsx     # Gauge de temperatura
│   ├── kpi-cards-row.tsx           # 4 cards de KPIs
│   ├── motor-decisao-table.tsx     # Tabela Motor de Decisão
│   ├── cohort-panel.tsx            # Sidebar direita (Cohort)
│   ├── account-selector.tsx        # Multi-tenant selector
│   ├── campaigns-table.tsx         # Tabela de campanhas (anterior)
│   ├── daily-performance-chart.tsx # Gráfico diário (Recharts)
│   └── export-button.tsx           # Exportar Excel/PDF
└── app/(app)/ads-dashboard/
    └── page.tsx                    # Página server-side com auth
```

### Permissões Meta API necessárias
- `ads_read` - Leitura de dados de campanhas (já tem)
- `ads_management` - Edição de verba/status de campanhas (precisa verificar)
- `pages_show_list` - Lista de páginas (já tem)
