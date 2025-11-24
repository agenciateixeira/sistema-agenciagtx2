# 🚀 Configuração do Sistema na Vercel

Este documento explica como configurar o sistema de recuperação de vendas na Vercel.

## ✅ O que já está configurado no código

- ✅ Cron job configurado no `vercel.json` (roda a cada 5 minutos)
- ✅ Endpoint `/api/jobs/detect-abandoned-carts` preparado
- ✅ Autenticação automática via header `x-vercel-cron`

## 📋 Checklist de Deploy

### 1. Variáveis de Ambiente Obrigatórias

No painel da Vercel, adicione estas variáveis em **Settings → Environment Variables**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Resend (Email)
RESEND_API_KEY=re_sua_api_key

# Opcional - para chamadas manuais ao cron
CRON_SECRET=seu-token-secreto-aqui
```

### 2. Deploy

```bash
git push origin main
```

A Vercel detecta automaticamente:
- ✅ O arquivo `vercel.json` com a configuração de cron
- ✅ Cria o cron job automaticamente
- ✅ Executa `/api/jobs/detect-abandoned-carts` a cada 5 minutos

### 3. Verificar se o Cron está Ativo

1. Acesse o painel da Vercel
2. Vá em **Settings → Cron Jobs**
3. Verifique se aparece:
   - Path: `/api/jobs/detect-abandoned-carts`
   - Schedule: `*/5 * * * *` (a cada 5 minutos)
   - Status: ✅ Active

### 4. Testar Manualmente

Você pode testar o job manualmente com:

```bash
curl -X GET https://seu-dominio.vercel.app/api/jobs/detect-abandoned-carts \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

Ou simplesmente aguardar 5 minutos para o Vercel executar automaticamente.

## 📊 Monitoramento

### Ver Logs do Cron Job

1. Painel Vercel → **Deployments**
2. Clique no deployment ativo
3. Vá em **Functions**
4. Procure por `/api/jobs/detect-abandoned-carts`
5. Veja os logs de execução

### Ver Resultados no Sistema

1. Acesse `/recovery` no seu sistema
2. Veja as estatísticas:
   - Emails enviados
   - Taxa de abertura
   - Taxa de cliques
   - Conversões
   - Receita recuperada

## 🔧 Troubleshooting

### Cron não aparece no painel da Vercel

- Certifique-se que o `vercel.json` está na raiz do projeto
- Faça um novo deploy após adicionar a configuração

### Erro 401 Unauthorized

- O Vercel Cron envia o header `x-vercel-cron: true` automaticamente
- Se chamar manualmente, use: `Authorization: Bearer SEU_CRON_SECRET`

### Emails não são enviados

1. Verifique se a integração Shopify está conectada
2. Verifique se há carrinhos em `webhook_events` com `processed: false`
3. Verifique se a configuração em `/recovery` está com `enabled: true`
4. Veja os logs no painel da Vercel

## 📝 Notas Importantes

- O cron job só funciona em **planos Pro ou superiores** na Vercel
- No plano **Hobby (gratuito)**, o cron NÃO funciona
- Alternativas gratuitas: GitHub Actions, Cron-job.org, EasyCron

## ⏰ Frequência do Cron

Atualmente configurado para **a cada 5 minutos**.

Para alterar, edite o `schedule` em `vercel.json`:

```json
{
  "schedule": "*/5 * * * *"  // A cada 5 minutos
  "schedule": "*/10 * * * *" // A cada 10 minutos
  "schedule": "0 * * * *"    // A cada hora
}
```

Formato: Cron expression (minuto hora dia mês dia-da-semana)
