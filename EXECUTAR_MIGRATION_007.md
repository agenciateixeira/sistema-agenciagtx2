# 🚨 URGENTE: Executar Migration 007 - Tabela Profiles

## ❌ Problema Atual
O sistema está falhando com `create_profile_failed` porque a tabela `profiles` não existe ou não tem as políticas RLS corretas.

---

## 📋 SOLUÇÃO: Executar Migration

### **Passo 1: Acessar Supabase Dashboard**
https://supabase.com/dashboard/project/bortomadefyundsarhpu

### **Passo 2: Abrir SQL Editor**
- Clique em **"SQL Editor"** no menu lateral
- Clique em **"New Query"**

### **Passo 3: Copiar e Colar a Migration**
Copie TODO o conteúdo do arquivo:
```
supabase/migrations/007_create_profiles_table.sql
```

### **Passo 4: Executar**
- Cole o SQL no editor
- Clique em **"Run"** (ou Ctrl+Enter)
- Aguarde a confirmação: **"Success. No rows returned"**

---

## 📊 O QUE ESSA MIGRATION FAZ

### 1. **Cria Enum `user_role`**
```sql
CREATE TYPE public.user_role AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');
```

### 2. **Cria Tabela `profiles`**
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,  -- FK para auth.users
  nome TEXT NOT NULL,
  role user_role DEFAULT 'VIEWER',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **Configura RLS (Row Level Security)**
- Service role pode fazer tudo (usado pelo accept-invite)
- Usuários podem ver/editar seu próprio perfil
- Usuários podem criar seu próprio perfil

### 4. **Adiciona Trigger para `updated_at`**
Atualiza automaticamente o campo `updated_at` quando o perfil é editado.

---

## ✅ VERIFICAR SE FUNCIONOU

Após executar a migration, teste:

### **Teste 1: Verificar se a tabela existe**
```sql
SELECT * FROM public.profiles LIMIT 5;
```
Deve retornar: **"Success. 0 rows returned"** (ou mostrar perfis existentes)

### **Teste 2: Verificar políticas RLS**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```
Deve mostrar 4 políticas.

### **Teste 3: Enviar novo convite**
1. Vá em `/team-management` (ou onde envia convites)
2. Envie um convite para um email de teste
3. Clique no link do convite
4. **Deve funcionar agora!** ✅

---

## 🐛 SE DER ERRO

### Erro: "type 'user_role' already exists"
✅ **NORMAL!** A migration detecta e ignora. Continue.

### Erro: "relation 'profiles' already exists"
✅ **NORMAL!** A tabela já existe, só está criando as políticas que faltam.

### Erro: "policy 'X' already exists"
Execute este comando para remover políticas antigas:
```sql
DROP POLICY IF EXISTS "Service role can do anything" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
```
Depois execute a migration novamente.

---

## 🔍 DEBUG: Ver Perfis Criados

Após aceitar convite, você pode ver os perfis:
```sql
SELECT
  p.id,
  p.nome,
  p.role,
  au.email,
  p.created_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY p.created_at DESC
LIMIT 10;
```

---

## 📞 PRÓXIMOS PASSOS

1. ✅ **Execute a migration 007**
2. 🧪 **Teste enviando um novo convite**
3. 📧 **Clique no link do convite**
4. 🎉 **Deve redirecionar para /convite-aceito e funcionar!**

---

**Execute agora e me avise o resultado!** 🚀
