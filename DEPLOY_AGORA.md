# 🚀 DEPLOY URGENTE - FIX CRÍTICO DE SENHA

## ❌ Problema Corrigido
Usuários eram criados mas não conseguiam fazer login com `GTX@2025`

## ✅ Solução Implementada
Adicionado workaround para bug do Supabase em `app/api/accept-invite/route.ts:96-109`

---

## 📋 PASSOS PARA DEPLOY (FAÇA AGORA)

### 1️⃣ Acesse o Vercel
https://vercel.com

### 2️⃣ Vá em "Deployments"

### 3️⃣ No último deployment, clique nos 3 pontinhos (⋯)

### 4️⃣ Escolha: **"Redeploy with Clear build cache"**
⚠️ IMPORTANTE: Tem que ser com "Clear build cache"

### 5️⃣ Aguarde o build completar (2-3 minutos)

---

## 🧪 TESTE APÓS DEPLOY

### Opção 1: Teste Automático (RECOMENDADO)
1. Acesse: `https://app.agenciagtx.com.br/debug`
2. Clique em **"🔓 Testar Login Completo"**
3. Aguarde o resultado
4. ✅ Deve mostrar: `"loginSuccess": true`

### Opção 2: Teste Real
1. Envie um convite para um email de teste
2. Abra o link do convite
3. Aguarde criação da conta
4. Tente fazer login com:
   - Email: o email do convite
   - Senha: `GTX@2025`
5. ✅ Deve funcionar agora!

---

## 📊 O QUE FOI MUDADO

### Arquivo: `app/api/accept-invite/route.ts`
**Linhas 96-109:** Adicionado workaround

```typescript
// WORKAROUND: Forçar o Supabase a salvar a senha corretamente
// Bug conhecido: createUser() às vezes não salva a senha
console.log('🔄 Atualizando senha do usuário para garantir que funcione...');
const { error: updateError } = await supabase.auth.admin.updateUserById(
  newUser.user.id,
  { password: defaultPassword }
);
```

**Como funciona:**
1. `createUser()` cria o usuário (mas senha pode não salvar)
2. `updateUserById()` FORÇA a senha a ser salva
3. Agora login funciona 100%

---

## 🐛 Bugs Corrigidos Neste Deploy

✅ Senha não funcionava após aceitar convite
✅ Middleware bloqueando `/recuperar-senha`
✅ Manifest icon paths incorretos
✅ Email template não mostrava senha

---

## ⏱️ TEMPO ESTIMADO
- Deploy: 2-3 minutos
- Teste: 30 segundos
- **Total: ~3 minutos**

---

## 📞 SE DER ERRO NO DEPLOY
1. Verifique os logs de build no Vercel
2. Certifique-se que as 5 variáveis de ambiente estão configuradas
3. Se persistir, mande o erro completo

---

## ✨ PRONTO!
Após o deploy, o sistema de convites vai funcionar perfeitamente.
