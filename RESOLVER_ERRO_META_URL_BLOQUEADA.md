# 🔧 Resolver Erro: URL Bloqueada - Integração Meta

## 📌 **PROBLEMA**

Ao tentar conectar a integração Meta, aparecia o erro:

```
URL bloqueada
O redirecionamento falhou porque o URL usado não está na lista de
liberação nas configurações de OAuth do cliente do app.
```

**URL que estava sendo bloqueada:**
```
https://app.agenciagtx.com.br/api/auth/meta/callback
```

---

## ✅ **CAUSA RAIZ**

As **variáveis de ambiente da Meta** não estavam configuradas no sistema:
- ❌ `.env.local` não tinha as variáveis META_*
- ❌ Vercel (produção) também não tinha as variáveis
- ✅ URLs já estavam corretas no Facebook App

---

## 🔧 **SOLUÇÃO APLICADA**

### **1. Variáveis adicionadas no `.env.local`**

As seguintes variáveis foram adicionadas no arquivo `.env.local`:

```env
# Criptografia (para criptografar tokens da Meta)
ENCRYPTION_SECRET=sua_chave_de_64_caracteres_hex

# Meta Ads API (OAuth Multi-tenant)
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
META_GRAPH_VERSION=v22.0
META_OAUTH_REDIRECT_URI=https://app.agenciagtx.com.br/api/auth/meta/callback
META_DEAUTHORIZE_URI=https://app.agenciagtx.com.br/api/auth/meta/deauthorize
META_DATA_DELETION_URI=https://app.agenciagtx.com.br/api/auth/meta/data-deletion
```

> ⚠️ **IMPORTANTE:** Substitua `sua_chave_de_64_caracteres_hex`, `seu_app_id` e `seu_app_secret` pelos valores reais.

**Localização:** `/sistema-agenciagtx2/.env.local` (linhas 21-30)

---

### **2. Configurações no Facebook App**

**Como encontrar seu App ID e Secret:**
1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app
3. Vá em **Settings** → **Basic**
4. Copie o **App ID** e **App Secret**

**URLs que devem estar configuradas:**

1. **URI de redirecionamento OAuth válido:**
   - Menu: **Facebook Login** → **Settings**
   - Campo: **Valid OAuth Redirect URIs**
   - Adicione: `https://app.agenciagtx.com.br/api/auth/meta/callback`

2. **URL de desautorização:**
   - Menu: **Settings** → **Basic**
   - Campo: **Deauthorize Callback URL**
   - Adicione: `https://app.agenciagtx.com.br/api/auth/meta/deauthorize`

3. **URL de exclusão de dados:**
   - Menu: **Settings** → **Basic**
   - Campo: **Data Deletion Request URL**
   - Adicione: `https://app.agenciagtx.com.br/api/auth/meta/data-deletion`

**Configurações necessárias:**
- ✅ **Login de OAuth do cliente:** Ativado
- ✅ **Login Web de OAuth:** Ativado
- ✅ **Forçar HTTPS:** Ativado (recomendado)

---

### **3. Migrations Supabase**

As tabelas necessárias devem ser criadas no banco:
- `oauth_states` - Armazena CSRF tokens temporários
- `meta_connections` - Armazena conexões OAuth dos usuários

**Para executar as migrations:**
1. Acesse: https://supabase.com/dashboard/project/seu_project_id/sql/new
2. Execute os arquivos em ordem:
   - `supabase/migrations/20251124_create_oauth_states.sql`
   - `supabase/migrations/20251124_create_meta_connections.sql`

---

## ⚠️ **O QUE AINDA PRECISA SER FEITO**

### **🔴 URGENTE: Adicionar variáveis na Vercel (Produção)**

**Por que é obrigatório?**
Sem essas variáveis na Vercel, a integração **NÃO funciona em produção** (https://app.agenciagtx.com.br).

---

## 📋 **PASSO A PASSO: Configurar Vercel**

### **1. Acessar Environment Variables**

Link: https://vercel.com/seu_usuario/sistema-agenciagtx2/settings/environment-variables

### **2. Adicionar as 7 variáveis**

Clique em **"Add New"** e adicione **uma por uma**:

#### **Variável 1: ENCRYPTION_SECRET**
```
Name: ENCRYPTION_SECRET
Value: [sua_chave_de_64_caracteres_hex]
Environments: ✅ Production ✅ Preview ✅ Development
```
> **Como gerar:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### **Variável 2: META_APP_ID**
```
Name: META_APP_ID
Value: [seu_app_id]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variável 3: META_APP_SECRET**
```
Name: META_APP_SECRET
Value: [seu_app_secret]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variável 4: META_GRAPH_VERSION**
```
Name: META_GRAPH_VERSION
Value: v22.0
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variável 5: META_OAUTH_REDIRECT_URI**
```
Name: META_OAUTH_REDIRECT_URI
Value: https://app.agenciagtx.com.br/api/auth/meta/callback
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variável 6: META_DEAUTHORIZE_URI**
```
Name: META_DEAUTHORIZE_URI
Value: https://app.agenciagtx.com.br/api/auth/meta/deauthorize
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variável 7: META_DATA_DELETION_URI**
```
Name: META_DATA_DELETION_URI
Value: https://app.agenciagtx.com.br/api/auth/meta/data-deletion
Environments: ✅ Production ✅ Preview ✅ Development
```

### **3. Fazer Redeploy**

Após adicionar todas as variáveis:

1. Acesse: https://vercel.com/seu_usuario/sistema-agenciagtx2/deployments
2. No último deployment, clique nos **⋯** (3 pontinhos)
3. Selecione **"Redeploy"**
4. Aguarde o deploy completar (1-2 minutos)

---

## 🧪 **COMO TESTAR**

### **Ambiente Local:**

1. **Reiniciar o servidor:**
   ```bash
   npm run dev
   ```

2. **Acessar:**
   ```
   http://localhost:3000/integrations
   ```

3. **Testar conexão Meta**

### **Ambiente Produção:**

Após fazer o redeploy na Vercel:

1. **Acessar:**
   ```
   https://app.agenciagtx.com.br/integrations
   ```

2. **Clicar em "Conectar Meta"**

3. **Deve redirecionar para Facebook** e pedir autorização

4. **Após autorizar**, deve redirecionar de volta para:
   ```
   https://app.agenciagtx.com.br/ads-dashboard
   ```

---

## 🔍 **TROUBLESHOOTING**

### **Erro: "URL bloqueada" ainda aparece**

✅ **Verifique:**
1. As variáveis foram adicionadas na Vercel?
2. Foi feito redeploy após adicionar as variáveis?
3. As URLs estão corretas no Facebook App?

### **Erro: "Invalid state"**

**Causa:** Token CSRF expirado (expira em 10 minutos)

**Solução:** Tente conectar novamente

### **Erro: "Not authenticated"**

**Causa:** Usuário não está logado no sistema

**Solução:** Fazer login primeiro em `/login`

### **Erro: "Token expired"**

**Causa:** Token do Meta expirou (dura 60 dias)

**Solução:** Reconectar a integração

---

## 📊 **ARQUITETURA DA INTEGRAÇÃO**

### **Fluxo OAuth:**

```
1. Usuário clica "Conectar Meta"
   ↓
2. Sistema gera CSRF token (state)
   ↓
3. Redireciona para Facebook OAuth
   ↓
4. Usuário autoriza no Facebook
   ↓
5. Facebook redireciona para /api/auth/meta/callback
   ↓
6. Sistema valida CSRF token
   ↓
7. Troca code por access token
   ↓
8. Obtém long-lived token (60 dias)
   ↓
9. Busca businesses, ad accounts e pixels
   ↓
10. Criptografa token com AES-256-GCM
   ↓
11. Salva em meta_connections (Supabase)
   ↓
12. Redireciona para /ads-dashboard
```

### **Arquivos importantes:**

- **Rotas OAuth:**
  - `app/api/auth/meta/start/route.ts` - Inicia OAuth
  - `app/api/auth/meta/callback/route.ts` - Processa callback
  - `app/api/auth/meta/deauthorize/route.ts` - Desautorização
  - `app/api/auth/meta/data-deletion/route.ts` - GDPR compliance

- **Biblioteca Meta:**
  - `lib/meta-client.ts` - Cliente para Meta Graph API

- **Criptografia:**
  - `lib/crypto.ts` - Funções de encrypt/decrypt

- **Migrations:**
  - `supabase/migrations/20251124_create_oauth_states.sql`
  - `supabase/migrations/20251124_create_meta_connections.sql`

---

## 🔐 **SEGURANÇA**

### **Boas práticas implementadas:**

- ✅ **Tokens criptografados:** AES-256-GCM no banco
- ✅ **CSRF protection:** State tokens com expiração
- ✅ **Multi-tenant:** Cada usuário tem sua conexão isolada
- ✅ **RLS:** Row Level Security no Supabase
- ✅ **GDPR compliance:** Endpoints de desautorização e deleção
- ✅ **Secrets no backend:** Nunca expostos ao frontend

### **Variáveis sensíveis:**

⚠️ **NUNCA expor no frontend ou versionamento:**
- `META_APP_SECRET`
- `ENCRYPTION_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

✅ **Podem ser públicas:**
- `META_APP_ID`
- `NEXT_PUBLIC_*`

### **⚠️ IMPORTANTE: Gerenciamento de Credenciais**

- **Nunca commite arquivos `.env.local`, `.env`, ou similares**
- **Nunca inclua credenciais em documentação versionada**
- **Use o `.gitignore` para proteger arquivos sensíveis**
- **Rotacione credenciais se houver suspeita de vazamento**

---

## ✅ **CHECKLIST FINAL**

- [ ] Obter App ID e App Secret do Facebook Developers
- [ ] URLs configuradas no Facebook App
- [ ] Variáveis adicionadas no `.env.local`
- [ ] Migrations executadas no Supabase
- [ ] Variáveis adicionadas na Vercel
- [ ] Redeploy feito na Vercel
- [ ] Testar em produção

---

## 📞 **SUPORTE**

- **Documentação Meta:** https://developers.facebook.com/docs/
- **Meta Marketing API:** https://developers.facebook.com/docs/marketing-apis
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Guia completo:** `META_INTEGRATION_README.md`

---

## 📅 **HISTÓRICO**

- **2024-12-08:** Problema identificado e resolvido
  - Adicionadas variáveis META no `.env.local`
  - Documentação criada (sem credenciais)

---

**Desenvolvido com ❤️ pela Agência GTX**
