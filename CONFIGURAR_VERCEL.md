# ⚙️ Guia Completo de Configuração do Vercel

## 🎯 **Passo a Passo COMPLETO**

Siga esta ordem EXATA:

---

## **PASSO 1: Adicionar Variáveis de Ambiente**

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em: **Settings** → **Environment Variables**
4. Adicione TODAS estas variáveis (uma de cada vez):

### **Variável 1:**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://bortomadefyundsarhpu.supabase.co
Environment: ✅ Production
```
Clique em **Save**

### **Variável 2:**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnRvbWFkZWZ5dW5kc2FyaHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzc1MTksImV4cCI6MjA2MjY1MzUxOX0.kmGDRBZ_yBpyDcRfG94tON9B5WbT8GCTUEHhCBpVaho
Environment: ✅ Production
```
Clique em **Save**

### **Variável 3: ⚠️ CRÍTICA - ESTÁ FALTANDO**
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnRvbWFkZWZ5dW5kc2FyaHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA3NzUxOSwiZXhwIjoyMDYyNjUzNTE5fQ.0NlQHZOSdwXTBIm3ir5kXf7HKlhr80Qyy2aeF8fkDfY
Environment: ✅ Production
```
**⚠️ ESSA É A MAIS IMPORTANTE! Sem ela, não cria usuários!**
Clique em **Save**

### **Variável 4:**
```
Key: NEXT_PUBLIC_SITE_URL
Value: https://app.agenciagtx.com.br
Environment: ✅ Production
```
Clique em **Save**

### **Variável 5:**
```
Key: RESEND_API_KEY
Value: re_KzT9ktaT_EAWBb6bDpGUqAusCqUrLuK2d
Environment: ✅ Production
```
Clique em **Save**

---

## **PASSO 2: Fazer Redeploy COMPLETO**

**IMPORTANTE:** Não é só "Redeploy", tem que ser um rebuild completo!

### **Opção A: Redeploy com Clear Cache (RECOMENDADO)**

1. Vá em: **Deployments**
2. Clique nos **3 pontinhos (...)** do deployment mais recente
3. Clique em: **Redeploy**
4. ✅ **MARQUE:** "Clear build cache and redeploy"
5. Clique em: **Redeploy**

### **Opção B: Forçar novo commit (ALTERNATIVA)**

Se a Opção A não funcionar:

1. No terminal local, rode:
```bash
git commit --allow-empty -m "Force redeploy"
git push origin main
```

---

## **PASSO 3: Aguardar Deploy Completar**

- Aguarde 2-5 minutos
- Veja o status em: **Deployments**
- Quando aparecer: **✅ Ready** → Próximo passo

---

## **PASSO 4: Testar**

### **4.1 - Teste a página de DEBUG:**
```
https://app.agenciagtx.com.br/debug
```

**Deve mostrar:**
- ✅ NEXT_PUBLIC_SUPABASE_URL: Configurado
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configurado
- ✅ NEXT_PUBLIC_SITE_URL: https://app.agenciagtx.com.br

**Clique nos 3 botões de teste:**
- 🔐 Testar Criação de Usuário → Deve passar ✅
- 🔓 Testar Login Completo → Deve passar ✅
- 📧 Testar Envio de Email → Deve passar ✅

### **4.2 - Teste LOGIN completo:**
```
https://app.agenciagtx.com.br/api/test-login?email=teste@test.com
```

**Deve retornar JSON com:**
```json
{
  "success": true,
  "message": "TESTE COMPLETO PASSOU!",
  "steps": {
    "5_login": "OK - LOGIN FUNCIONOU! ✅"
  }
}
```

### **4.3 - Enviar convite REAL:**

1. Acesse: `https://app.agenciagtx.com.br/team`
2. Envie convite para um email SEU
3. **Verifique o email:**
   - ✅ Deve ter logo do GTX
   - ✅ Deve mostrar senha **GTX@2025** em VERDE GRANDE
   - ✅ Deve ter 2 boxes: um verde destacado e outro com credenciais
4. **Clique no link do convite**
5. Deve redirecionar para `/login` com mensagem de sucesso
6. **Faça login** com:
   - Email: o que você convidou
   - Senha: `GTX@2025`
7. Deve funcionar! ✅

### **4.4 - Testar "Esqueceu a senha":**

1. Vá em: `https://app.agenciagtx.com.br/login`
2. Clique em: **"Esqueceu a senha?"**
3. Deve ir para: `/recuperar-senha` (NÃO recarregar a página!)
4. Digite um email cadastrado
5. Clique em: **"Enviar Link de Recuperação"**
6. Verifique o email do Supabase
7. Clique no link
8. Defina nova senha
9. Deve redirecionar para login ✅

---

## ✅ **Checklist Final**

Marque conforme for fazendo:

- [ ] Todas 5 variáveis de ambiente adicionadas no Vercel
- [ ] Redeploy com "Clear build cache" feito
- [ ] Deploy completou (Status: Ready)
- [ ] Página `/debug` mostra todas variáveis OK
- [ ] Teste de criação de usuário passou
- [ ] Teste de login passou
- [ ] Teste de email passou
- [ ] Email do convite chegou com logo + senha
- [ ] Login com GTX@2025 funcionou
- [ ] Botão "Esqueceu a senha" funcionou

---

## 🆘 **Se ainda não funcionar:**

1. Tire print da página `/debug`
2. Copie o JSON do `/api/test-login`
3. Me envie os dois
4. Verifique logs no Vercel: Deployments → Latest → Functions → Runtime Logs

---

## 📞 **Suporte:**

Se TODOS os passos acima foram seguidos e ainda não funciona:

1. Verifique se está acessando o domínio correto (app.agenciagtx.com.br)
2. Limpe cache do navegador (Ctrl+Shift+Del)
3. Teste em navegador anônimo
4. Verifique se não tem outro deploy antigo ativo
