# Supabase Edge Functions

## Automação de Emails de Recuperação

### Opção 1: Vercel Cron (Recomendado) ✅

O sistema usa **Vercel Cron Jobs** para executar automaticamente o envio de emails de recuperação.

**Configuração:**
- Arquivo: `vercel.json`
- Endpoint: `/api/jobs/send-recovery-emails`
- Frequência: A cada hora (`0 * * * *`)

**Funcionamento:**
1. Vercel executa o endpoint automaticamente a cada hora
2. O job busca carrinhos abandonados elegíveis
3. Envia emails baseado nas configurações de cada usuário
4. Registra resultados e atualiza contadores

**Logs:**
- Acesse: Vercel Dashboard → Seu Projeto → Logs → Cron
- Ou: Settings → Cron Jobs

### Opção 2: Supabase Edge Function (Alternativa)

Caso queira usar Edge Functions do Supabase:

**Deploy:**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link com projeto
supabase link --project-ref <seu-project-id>

# Deploy da função
supabase functions deploy send-recovery-emails

# Configurar secrets
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set APP_URL=https://sistema-agenciagtx2.vercel.app
```

**Executar manualmente:**
```bash
curl -X GET https://<project-ref>.supabase.co/functions/v1/send-recovery-emails \
  -H "Authorization: Bearer <anon-key>"
```

**Configurar Cron no Supabase:**
```sql
-- No Supabase SQL Editor
SELECT cron.schedule(
  'send-recovery-emails',
  '0 * * * *', -- A cada hora
  $$
  SELECT net.http_post(
    url:='https://<project-ref>.supabase.co/functions/v1/send-recovery-emails',
    headers:='{"Authorization": "Bearer <anon-key>"}'::jsonb
  ) as request_id;
  $$
);
```

## Configurações do Usuário

Cada usuário pode configurar em `profiles.email_recovery_settings`:

```json
{
  "enabled": true,
  "delay_hours": 1,        // Aguardar 1h após abandono antes do 1º email
  "interval_hours": 24,    // Aguardar 24h entre emails subsequentes
  "max_emails": 3,         // Máximo de 3 emails por carrinho
  "sender_email": "loja@example.com",
  "sender_name": "Minha Loja",
  "reply_to": "contato@example.com",
  "logo_url": "https://...",
  "custom_message": "Não perca esta oportunidade!"
}
```

## Variáveis de Ambiente

Adicione no Vercel:

```bash
CRON_SECRET=seu-token-secreto-para-proteger-endpoints
NEXT_PUBLIC_APP_URL=https://sistema-agenciagtx2.vercel.app
```

## Testar Manualmente

```bash
# Com secret
curl -X GET https://sistema-agenciagtx2.vercel.app/api/jobs/send-recovery-emails \
  -H "Authorization: Bearer seu-cron-secret"

# Ou localmente
curl -X GET http://localhost:3000/api/jobs/send-recovery-emails \
  -H "Authorization: Bearer dev-secret-change-in-production"
```

## Monitoramento

**Métricas importantes:**
- Total de emails enviados
- Taxa de abertura (via `automated_actions.opened`)
- Taxa de clique (via `automated_actions.clicked`)
- Taxa de conversão (via `automated_actions.converted`)

**Consultas úteis:**
```sql
-- Emails enviados hoje
SELECT COUNT(*) FROM automated_actions
WHERE action_type = 'email_sent'
AND sent_at >= CURRENT_DATE;

-- Taxa de conversão
SELECT
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE opened) as opened,
  COUNT(*) FILTER (WHERE clicked) as clicked,
  COUNT(*) FILTER (WHERE converted) as converted
FROM automated_actions
WHERE action_type = 'email_sent';
```
