# 🔍 Debug: Email não chegou

## Checklist Rápido

### 1. Verificar Domínio no Resend
1. Acesse https://resend.com/dashboard
2. Vá em **Domains**
3. Verifique se `agenciagtx.com.br` está com status **"Verified"** ✅

**Se não estiver verificado:**
- Status aparecerá como "Pending" ou "Failed"
- Emails serão enviados mas **cairão em spam** ou **não serão entregues**
- Solução: Configurar registros DNS corretos (SPF, DKIM)

### 2. Verificar Logs do Resend
1. Acesse https://resend.com/dashboard
2. Vá em **Logs** ou **Emails**
3. Procure pelo email enviado

**Possíveis status:**
- ✅ **Delivered**: Email foi entregue, verificar pasta de spam
- ⏳ **Queued/Sending**: Email ainda está sendo enviado
- ❌ **Bounced**: Email foi rejeitado (email inválido ou domínio não existe)
- ❌ **Failed**: Falha no envio (verificar erro)

### 3. Verificar API Key no Vercel
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto `sistema-agenciagtx2`
3. Vá em **Settings** → **Environment Variables**
4. Confirme que existe: `RESEND_API_KEY` (valor deve começar com `re_`)

### 4. Verificar Logs do Vercel (se já fez deploy)
1. Acesse https://vercel.com/dashboard
2. Vá em **Functions** ou **Logs**
3. Procure por erros relacionados ao Resend

## 🚨 Problemas Comuns

### Problema 1: Domínio não verificado
**Sintoma:** Email não chega ou vai para spam

**Solução:**
1. Vá em Resend Dashboard → Domains → agenciagtx.com.br
2. Copie os registros DNS fornecidos
3. Adicione no seu provedor de DNS (GoDaddy, Registro.br, etc):
   - **SPF Record** (tipo TXT)
   - **DKIM Records** (tipo TXT, geralmente 2)
   - **DMARC Record** (tipo TXT, opcional)
4. Aguarde propagação (pode levar de minutos a 48h)
5. Clique em "Verify" no Resend

### Problema 2: Email em spam
**Sintoma:** Email enviado mas está na pasta de spam

**Causas:**
- Domínio não verificado
- Primeira vez enviando deste domínio
- Conteúdo do email disparou filtros

**Solução:**
- Marque como "Não é spam" algumas vezes
- Verifique domínio no Resend
- Aguarde reputação do domínio melhorar (envie mais emails)

### Problema 3: API Key inválida
**Sintoma:** Erro 401 ou "Unauthorized" nos logs

**Solução:**
1. Gere nova API Key no Resend Dashboard
2. Atualize no Vercel Environment Variables
3. Redeploy a aplicação

### Problema 4: Email para domínio inválido
**Sintoma:** Status "Bounced" no Resend

**Causas:**
- Email digitado incorretamente
- Domínio não existe
- Caixa de entrada cheia

**Solução:**
- Confirme o email está correto
- Teste com outro email
- Use email de teste (Gmail, Outlook, etc)

## 🧪 Como Testar

### Teste Local (desenvolvimento)
```bash
# 1. Certifique-se que .env.local tem a API key
cat .env.local | grep RESEND_API_KEY

# 2. Inicie o servidor de desenvolvimento
npm run dev

# 3. Acesse o sistema e teste o envio
# http://localhost:3001/team
```

### Teste em Produção
1. Acesse: https://app.agenciagtx.com.br/team
2. Convide um membro com **seu próprio email**
3. Aguarde 1-2 minutos
4. Verifique:
   - ✉️ Caixa de entrada
   - 📧 Pasta de spam
   - 🗑️ Lixeira

## 📊 Verificar no Dashboard do Resend

1. **API Keys**: https://resend.com/api-keys
   - Confirme que sua API key está ativa (deve começar com `re_`)

2. **Domains**: https://resend.com/domains
   - Status deve ser: ✅ Verified
   - Se não estiver, clique no domínio para ver instruções DNS

3. **Emails**: https://resend.com/emails
   - Veja todos os emails enviados
   - Status de cada um (Delivered, Bounced, etc)
   - Clique em um email para ver detalhes completos

4. **Webhooks**: https://resend.com/webhooks
   - Configure webhook para tracking automático
   - URL: `https://app.agenciagtx.com.br/api/webhooks/resend`
   - Events: Todos (sent, delivered, opened, clicked, bounced, complained)

## 🔧 Comandos Úteis

### Testar envio direto (usando curl)
```bash
curl -X POST https://api.resend.com/emails \\
  -H "Authorization: Bearer $RESEND_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Sistema GTX <noreply@agenciagtx.com.br>",
    "to": ["seu-email@gmail.com"],
    "subject": "Teste de Email",
    "html": "<h1>Teste</h1><p>Este é um email de teste.</p>"
  }'
```

### Verificar status de um email específico
```bash
# Substitua EMAIL_ID pelo ID retornado ao enviar
curl https://api.resend.com/emails/EMAIL_ID \\
  -H "Authorization: Bearer $RESEND_API_KEY"
```

## 📝 Checklist de Configuração Completa

- [ ] API Key configurada no .env.local
- [ ] API Key configurada no Vercel (Production, Preview, Development)
- [ ] Domínio agenciagtx.com.br adicionado no Resend
- [ ] Domínio está com status "Verified" no Resend
- [ ] Registros DNS configurados (SPF, DKIM)
- [ ] Webhook configurado no Resend
- [ ] RESEND_WEBHOOK_SECRET no Vercel (opcional, mas recomendado)
- [ ] Deploy realizado no Vercel
- [ ] Tabela EmailLog criada no Supabase
- [ ] Teste de envio realizado e email recebido

## 🆘 Ainda não funcionou?

1. **Verifique os logs do Vercel**: https://vercel.com/dashboard → Functions
2. **Verifique os logs do Resend**: https://resend.com/emails
3. **Teste com email diferente**: Use Gmail, Outlook, etc
4. **Aguarde**: Pode levar alguns minutos para o email chegar
5. **Verifique spam**: Primeira entrega quase sempre vai para spam

## 💡 Dicas

- Use **Gmail** para testes iniciais (melhor entregabilidade)
- Marque emails como "Não é spam" para melhorar reputação
- Domínio novo leva ~1 semana para ganhar boa reputação
- Envie para você mesmo primeiro antes de enviar para clientes
- Verifique se o firewall/antispam da empresa não está bloqueando

## 📞 Suporte

Se nada funcionar:
- Suporte Resend: https://resend.com/support
- Documentação: https://resend.com/docs
- Status: https://status.resend.com
