# Supabase Migrations

Esta pasta contém todas as migrations SQL para o banco de dados Supabase do Sistema GTX.

## 📁 Estrutura

```
supabase/
├── migrations/
│   ├── 001_create_email_log.sql      # Tabela de tracking de emails
│   └── 002_email_log_rls.sql         # Políticas de segurança RLS
└── README.md
```

## 🚀 Como Aplicar as Migrations

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo de cada arquivo SQL na ordem
6. Execute cada query clicando em **Run**

**Ordem de execução:**
1. `001_create_email_log.sql` - Cria a tabela e índices
2. `002_email_log_rls.sql` - Configura segurança RLS

### Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link com o projeto
supabase link --project-ref <seu-project-ref>

# Aplicar migrations
supabase db push
```

## 📊 Migrations Disponíveis

### 001_create_email_log.sql
**Objetivo:** Criar sistema de tracking de emails enviados pelo Resend

**O que cria:**
- ✅ Enum `email_status` (SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, FAILED)
- ✅ Enum `email_type` (TEAM_INVITE, NOTIFICATION, REPORT)
- ✅ Tabela `EmailLog` com todos os campos necessários
- ✅ Índices para otimizar queries (por emailId, to, status, sentAt, type)
- ✅ Trigger automático para atualizar `updated_at`

**Campos principais:**
- `emailId`: ID único do Resend
- `type`: Tipo do email (convite, notificação, relatório)
- `to`: Destinatário
- `status`: Status atual do email
- `sentAt`, `deliveredAt`, `openedAt`, `clickedAt`, `bouncedAt`: Timestamps dos eventos
- `metadata`: Dados adicionais em JSON
- `events`: Array de eventos recebidos via webhook

### 002_email_log_rls.sql
**Objetivo:** Configurar segurança Row Level Security (RLS)

**Políticas criadas:**
- ✅ `Sistema pode inserir emails`: Apenas service_role pode inserir
- ✅ `Sistema pode atualizar emails`: Apenas service_role pode atualizar (webhooks)
- ✅ `Usuários podem ver seus emails`: Usuários veem apenas seus próprios emails
- ✅ `Admins podem ver todos emails`: Administradores veem tudo

## 🔧 Webhook do Resend

Após aplicar as migrations, configure o webhook no Resend Dashboard:

1. Acesse https://resend.com/dashboard
2. Vá em **Webhooks**
3. Clique em **Add Webhook**
4. Configure:
   - **URL**: `https://app.agenciagtx.com.br/api/webhooks/resend`
   - **Events**: Selecione todos (sent, delivered, opened, clicked, bounced, complained)
   - **Secret**: Copie o secret gerado

5. Adicione o secret no Vercel:
   - Variável: `RESEND_WEBHOOK_SECRET`
   - Value: O secret copiado do Resend

## 📈 Queries Úteis

### Ver todos os emails enviados (últimos 50)
```sql
SELECT
  id,
  type,
  "to",
  subject,
  status,
  "sentAt",
  "deliveredAt",
  "openedAt"
FROM "EmailLog"
ORDER BY "sentAt" DESC
LIMIT 50;
```

### Verificar taxa de entrega
```sql
SELECT
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM "EmailLog"
GROUP BY status
ORDER BY total DESC;
```

### Emails com problemas (bounced/complained)
```sql
SELECT
  "to",
  subject,
  status,
  "sentAt",
  metadata
FROM "EmailLog"
WHERE status IN ('BOUNCED', 'COMPLAINED', 'FAILED')
ORDER BY "sentAt" DESC;
```

### Taxa de abertura por tipo de email
```sql
SELECT
  type,
  COUNT(*) as total_sent,
  COUNT("openedAt") as total_opened,
  ROUND(COUNT("openedAt") * 100.0 / COUNT(*), 2) as open_rate
FROM "EmailLog"
GROUP BY type;
```

## 🔒 Segurança

- ✅ RLS habilitado em todas as tabelas
- ✅ Apenas service_role pode escrever
- ✅ Usuários veem apenas seus próprios dados
- ✅ Admins têm acesso total para analytics
- ✅ Webhook validado com assinatura HMAC

## 📝 Notas

- Todas as timestamps são armazenadas em UTC (TIMESTAMPTZ)
- O campo `events` armazena histórico completo de webhooks
- Índices otimizados para queries de dashboard e analytics
- Compatível com Prisma (caso queira usar no futuro)

## 🆘 Troubleshooting

**Erro: "relation EmailLog does not exist"**
- Certifique-se de executar `001_create_email_log.sql` primeiro

**Erro: "permission denied for table EmailLog"**
- Verifique se as policies RLS de `002_email_log_rls.sql` foram aplicadas

**Webhook não está atualizando status**
- Confirme que `RESEND_WEBHOOK_SECRET` está no Vercel
- Verifique logs em Vercel Functions
- Teste o endpoint: `POST https://app.agenciagtx.com.br/api/webhooks/resend`
