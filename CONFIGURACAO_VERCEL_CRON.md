# Configuração do Vercel Cron Jobs

## ✅ O que foi implementado:

1. **Envio Manual de Emails** - Botão "Recuperar" na aba Carrinhos
2. **Envio Automático de Emails** - Job que roda a cada hora via Vercel Cron

## 🚀 Próximos passos para ativar:

### 1. Adicionar variável de ambiente no Vercel

Acesse: https://vercel.com/agenciateixeira/sistema-agenciagtx2/settings/environment-variables

Adicione:
```
CRON_SECRET = [gere um token secreto aleatório]
```

**Gerar token secreto:**
```bash
# No terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ou use qualquer string longa e aleatória, exemplo:
```
CRON_SECRET=minha-chave-super-secreta-12345-nao-compartilhar
```

### 2. Verificar Cron Jobs no Vercel

Após o próximo deploy, o Vercel vai automaticamente detectar o arquivo `vercel.json` e criar os cron jobs.

**Verificar:**
1. Acesse: https://vercel.com/agenciateixeira/sistema-agenciagtx2/settings/crons
2. Você deve ver:
   - `send-recovery-emails` - Executa a cada hora (0 * * * *)
   - `check-alerts` - Executa a cada 15 min (*/15 * * * *)

### 3. Configurar email de recuperação no sistema

Acesse `/recovery` → aba "Configurações" e configure:

- ✅ **Habilitar recuperação automática**
- ⏱️ **Delay inicial**: 1 hora (tempo após abandono antes do 1º email)
- 🔄 **Intervalo entre emails**: 24 horas
- 📧 **Máximo de emails**: 3 por carrinho
- ✉️ **Email remetente**: seu-email@dominio.com
- 🏷️ **Nome remetente**: Sua Loja
- 📬 **Reply-to**: contato@dominio.com
- 🖼️ **Logo URL**: https://...
- 💬 **Mensagem personalizada**: "Seus produtos ainda estão esperando!"

### 4. Testar manualmente

Antes de esperar 1 hora, teste manualmente:

```bash
curl -X GET https://sistema-agenciagtx2.vercel.app/api/jobs/send-recovery-emails \
  -H "Authorization: Bearer SEU-CRON-SECRET-AQUI"
```

Ou acesse direto no navegador (com autenticação):
```
https://sistema-agenciagtx2.vercel.app/api/jobs/send-recovery-emails
```

## 📊 Como funciona:

### Fluxo automático:

1. **Cliente abandona carrinho** → Webhook Shopify registra
2. **Aguarda X horas** (configurável, padrão 1h)
3. **Cron job executa** a cada hora
4. **Verifica carrinhos elegíveis**:
   - Status = abandonado
   - Tem email válido
   - Passou tempo mínimo desde abandono
   - Não atingiu máximo de emails
   - Passou intervalo mínimo desde último email
5. **Envia email** via Resend
6. **Registra ação** em `automated_actions`
7. **Atualiza contadores** em `abandoned_carts`

### Exemplo de timeline:

```
00:00 - Cliente abandona carrinho
01:00 - Cron roda → Envia 1º email
02:00 - Cron roda → Pula (aguardando intervalo de 24h)
03:00 - Cron roda → Pula (aguardando intervalo de 24h)
...
25:00 - Cron roda → Envia 2º email
...
49:00 - Cron roda → Envia 3º email (último, atingiu max_emails=3)
```

## 🔍 Monitoramento

### Ver logs do Cron:

1. Acesse: https://vercel.com/agenciateixeira/sistema-agenciagtx2/logs
2. Filtre por: `/api/jobs/send-recovery-emails`

### Consultar banco:

```sql
-- Emails enviados nas últimas 24h
SELECT
  recipient,
  email_subject,
  status,
  sent_at,
  opened,
  clicked,
  converted
FROM automated_actions
WHERE action_type = 'email_sent'
AND sent_at >= NOW() - INTERVAL '24 hours'
ORDER BY sent_at DESC;

-- Carrinhos com emails enviados
SELECT
  customer_email,
  total_value,
  currency,
  recovery_emails_sent,
  last_recovery_email_at,
  status
FROM abandoned_carts
WHERE recovery_emails_sent > 0
ORDER BY last_recovery_email_at DESC;
```

## 🎯 Métricas importantes:

Acompanhe no dashboard `/recovery`:

- **Taxa de envio**: Quantos carrinhos receberam email
- **Taxa de abertura**: `automated_actions.opened = true`
- **Taxa de clique**: `automated_actions.clicked = true`
- **Taxa de conversão**: `automated_actions.converted = true`
- **Receita recuperada**: `SUM(conversion_value)`

## ⚠️ Importante:

1. **Domínio de email**: Configure DNS do Resend para seu domínio
2. **CRON_SECRET**: Nunca commite no git, apenas no Vercel
3. **Testes**: Use carrinhos de teste antes de ativar em produção
4. **Limite Resend**: Plano gratuito tem 100 emails/dia
5. **Shopify Webhooks**: Devem estar ativos e funcionando

## 🆘 Troubleshooting:

**Cron não está rodando:**
- Verifique se está no plano Pro do Vercel (Free tem limites)
- Confirme que `vercel.json` foi deployado
- Veja logs em Settings → Crons

**Emails não estão sendo enviados:**
- Verifique RESEND_API_KEY no Vercel
- Teste endpoint manualmente com curl
- Veja logs em /api/jobs/send-recovery-emails
- Confirme email_recovery_settings.enabled = true

**Carrinhos não aparecem:**
- Webhooks Shopify configurados?
- Verifique tabela `abandoned_carts`
- Email é válido? (não placeholder)
- Status é "abandoned"?
