# 🔍 INVESTIGAÇÃO: Problema de Login no Supabase

## 🚨 Situação Atual

**Problema:** Usuários são criados com sucesso mas não conseguem fazer login.

```
✅ Usuário criado: ID correto, email confirmado
✅ updateUserById() chamado para forçar senha
❌ Login falha com "Invalid login credentials"
```

## 📋 CHECKLIST DE INVESTIGAÇÃO

### 1️⃣ Verificar Configuração do Supabase Auth

Acesse: https://supabase.com/dashboard/project/bortomadefyundsarhpu

#### **Authentication → Settings**

Verifique:
- [ ] **"Enable Email Confirmations"** → Deve estar **DESABILITADO** (porque estamos usando `email_confirm: true` na criação)
- [ ] **"Secure email change"** → Pode estar habilitado
- [ ] **"Enable phone confirmations"** → Desabilitado
- [ ] **"Minimum Password Length"** → Deve ser menor ou igual a 8 (nossa senha tem 8 chars: GTX@2025)

#### **Authentication → URL Configuration**

Verifique:
- [ ] **Site URL** → `https://app.agenciagtx.com.br`
- [ ] **Redirect URLs** → Adicionar `https://app.agenciagtx.com.br/**`

---

### 2️⃣ Verificar Usuário no Dashboard

Acesse: **Authentication → Users**

1. Procure pelo usuário de teste: `debug@test.com` ou `test-{timestamp}@gtx.test`
2. Clique no usuário
3. Verifique:
   - [ ] **Email Confirmed?** → Deve estar ✅
   - [ ] **Last Sign In** → Provavelmente vazio (porque o login falha)
   - [ ] **Created At** → Data recente

4. **TESTE MANUAL:**
   - Clique em **"Send Password Reset Email"** (ou equivalente)
   - OU clique em **"Reset Password"** e defina uma nova senha manualmente
   - Tente fazer login com a senha que você definiu manualmente
   - Se funcionar → Confirma que o problema é com a criação programática da senha

---

### 3️⃣ Verificar Logs do Supabase

Acesse: **Logs → Auth Logs**

Procure por:
- Tentativas de login falhadas
- Mensagens de erro específicas
- Qualquer warning sobre passwords

---

### 4️⃣ Verificar Políticas RLS

Acesse: **Table Editor → profiles → RLS**

Certifique-se que:
- [ ] RLS está habilitado
- [ ] Existe política para permitir INSERT/SELECT do próprio usuário

```sql
-- Política de exemplo que deve existir:
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

---

### 5️⃣ Testar com Novo Teste

Após o deploy, acesse:
```
https://app.agenciagtx.com.br/debug
```

Clique no botão: **🚨 Teste DEFINITIVO (Email Único)**

Este teste:
- ✅ Usa email único a cada execução (não reutiliza usuários antigos)
- ✅ Chama `updateUserById()` com workaround
- ✅ Aguarda 3 segundos
- ✅ Tenta login
- ✅ Se falhar, mostra diagnóstico detalhado

---

## 🔧 SOLUÇÕES POSSÍVEIS

### Se o problema for "Email Confirmations"

No Supabase Dashboard → **Authentication → Settings**:
- Desabilite "Enable Email Confirmations"
- Salve
- Teste novamente

### Se o problema for "Password Length"

No Supabase Dashboard → **Authentication → Settings**:
- Verifique "Minimum Password Length"
- Deve ser ≤ 8 (nossa senha tem 8 caracteres)
- Se for > 8, diminua para 6 ou 8

### Se o problema for RLS

Execute no SQL Editor:
```sql
-- Ver todas as políticas
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Desabilitar RLS temporariamente (CUIDADO: só para teste!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Depois teste o login novamente.

---

## 📊 TESTE ALTERNATIVO: API Direto

Você também pode testar a API do Supabase diretamente:

```bash
# 1. Criar usuário
curl -X POST 'https://bortomadefyundsarhpu.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-manual@test.com",
    "password": "GTX@2025",
    "email_confirm": true
  }'

# 2. Tentar login
curl -X POST 'https://bortomadefyundsarhpu.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-manual@test.com",
    "password": "GTX@2025"
  }'
```

Se o segundo comando retornar `{"error":"Invalid login credentials"}`, confirma que é um problema do Supabase.

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Aguardar deploy (2-3 minutos)
2. 🧪 Testar novo endpoint: `/api/test-auth-flow`
3. 🔍 Verificar configurações no Supabase Dashboard
4. 📞 Se persistir, considerar abrir ticket no suporte do Supabase

---

## 📞 Suporte Supabase

Se nada funcionar, considere:
- GitHub Issues: https://github.com/supabase/auth/issues
- Discord: https://discord.supabase.com
- Email: support@supabase.io

Forneça:
- Project ID: `bortomadefyundsarhpu`
- Descrição: "Users created via admin.createUser() can't login even after updateUserById()"
- Logs e erros detalhados
