# 🛒 Sistema GTX - Recuperação de Vendas

Sistema completo de recuperação de carrinhos abandonados com integração Shopify.

## ✨ Funcionalidades

- 🔌 **Integração Shopify** - Conexão automática via API
- 📧 **Emails de Recuperação** - Envio automático personalizado
- 📊 **Dashboard de Métricas** - Acompanhamento de performance
- ⚙️ **Personalização** - Logo, mensagem e remetente customizáveis
- 🤖 **100% Automático** - Detecção e envio sem intervenção manual

## 🚀 Stack Tecnológica

- **Framework**: Next.js 14.2.3 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Hosting**: Vercel
- **Cron**: GitHub Actions (gratuito)
- **Integrações**: Shopify Admin API 2024-10

## 📦 Setup Rápido

### 1. Clone e Instale

```bash
git clone https://github.com/agenciateixeira/sistema-agenciagtx2.git
cd sistema-agenciagtx2
npm install
```

### 2. Configure Variáveis de Ambiente

Crie `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Resend
RESEND_API_KEY=re_sua_api_key

# Cron Secret
CRON_SECRET=seu-token-secreto
```

### 3. Execute Migrations

```bash
# No painel do Supabase, execute as migrations em ordem:
# supabase/migrations/*.sql
```

### 4. Configure GitHub Actions

Siga as instruções em: **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)**

### 5. Deploy na Vercel

```bash
vercel --prod
```

## 📚 Documentação

- **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** - Configuração do cron job (GRATUITO)
- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Alternativa usando Vercel Cron (PRO)

## 🎯 Como Usar

### 1. Conectar Shopify

1. Acesse `/integrations`
2. Clique em "Nova Integração"
3. Selecione "Shopify"
4. Preencha:
   - Nome da loja
   - URL (minhaloja.myshopify.com)
   - Access Token
   - Webhook Secret

### 2. Configurar Recuperação

1. Acesse `/recovery`
2. Faça upload da logo da sua loja
3. Personalize a mensagem do email
4. Configure email remetente (opcional)
5. Ative o sistema (toggle on)

### 3. Acompanhar Resultados

No dashboard `/recovery` você verá:
- 📧 Emails enviados
- 👁️ Taxa de abertura
- 🖱️ Taxa de cliques
- 🛒 Conversões
- 💰 Receita recuperada

## 🔄 Como Funciona

```
1. Cliente abandona carrinho no Shopify
   ↓
2. Shopify envia webhook → /api/webhook/shopify
   ↓
3. Sistema salva em webhook_events
   ↓
4. GitHub Actions roda a cada 5 minutos
   ↓
5. Job detecta carrinhos +15min abandonados
   ↓
6. Sistema envia email personalizado via Resend
   ↓
7. Métricas são rastreadas (aberto, clicado, convertido)
   ↓
8. Dashboard exibe resultados em tempo real
```

## 🛠️ Estrutura do Projeto

```
sistema-agenciagtx2/
├── app/
│   ├── (app)/
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── integrations/       # Gestão de integrações
│   │   ├── recovery/           # Configurações de recuperação
│   │   └── ...
│   └── api/
│       ├── webhook/shopify/    # Webhook Shopify
│       └── jobs/               # Jobs automáticos
├── components/
│   ├── recovery/               # Componentes de recuperação
│   └── ...
├── lib/
│   ├── email-service.ts        # Serviço de email
│   ├── abandoned-cart-templates.ts  # Templates HTML
│   └── ...
├── supabase/
│   └── migrations/             # Migrações do banco
└── .github/
    └── workflows/              # GitHub Actions
```

## 📊 Database Schema

### Principais Tabelas

- **`profiles`** - Usuários e configurações
- **`integrations`** - Integrações conectadas (Shopify, etc)
- **`webhook_events`** - Eventos recebidos dos webhooks
- **`automated_actions`** - Emails enviados e métricas

## 🔐 Segurança

- ✅ HMAC validation nos webhooks Shopify
- ✅ RLS (Row Level Security) no Supabase
- ✅ Service Role Key apenas no backend
- ✅ Autenticação via Supabase Auth
- ✅ CRON_SECRET para proteção do job

## 💰 Custos

- **GitHub Actions**: Gratuito (2000 min/mês)
- **Vercel Hobby**: Gratuito
- **Supabase**: Gratuito até 500MB
- **Resend**: Gratuito até 3000 emails/mês

**Total**: R$ 0/mês para começar 🎉

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 License

MIT License - veja [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@agenciagtx.com.br
- 📖 Documentação: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

---

**Desenvolvido com ❤️ pela Agência GTX**
