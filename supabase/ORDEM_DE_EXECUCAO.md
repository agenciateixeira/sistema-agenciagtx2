# ⚡ Ordem de Execução das Migrations

Execute os SQLs **NESTA ORDEM EXATA** no Supabase SQL Editor:

## 🎯 Como Executar:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Cole o SQL completo
6. Clique em **Run** (ou Ctrl/Cmd + Enter)

---

## 📋 Ordem de Execução:

### 000 - Adicionar Role na Tabela Profiles
```
supabase/migrations/000_add_role_to_profiles.sql
```
**O que faz:**
- Cria enum `user_role` (VIEWER, EDITOR, ADMIN)
- Adiciona coluna `role` na tabela `profiles`
- Define o primeiro usuário como ADMIN automaticamente

**⚠️ EXECUTE PRIMEIRO!** As outras migrations dependem dessa coluna.

---

### 001 - Criar Tabela EmailLog
```
supabase/migrations/001_create_email_log.sql
```
**O que faz:**
- Cria enums: `email_status`, `email_type`
- Cria tabela `EmailLog` para rastrear emails enviados
- Adiciona índices para performance
- Cria trigger para `updated_at`

---

### 002 - Políticas RLS do EmailLog
```
supabase/migrations/002_email_log_rls.sql
```
**O que faz:**
- Habilita Row Level Security
- Service role pode inserir/atualizar
- Usuários veem apenas seus emails
- Admins veem todos os emails

**⚠️ Depende da migration 000 (coluna role) e 001 (tabela EmailLog)**

---

### 003 - Criar Tabela TeamInvite
```
supabase/migrations/003_create_team_invites.sql
```
**O que faz:**
- Cria enum `invite_status` (PENDING, ACCEPTED, EXPIRED, CANCELLED)
- Cria tabela `TeamInvite` para rastrear convites
- Adiciona token único para aceitar convite
- Convites expiram em 7 dias
- Índices para performance

---

### 004 - Políticas RLS do TeamInvite
```
supabase/migrations/004_team_invites_rls.sql
```
**O que faz:**
- Habilita Row Level Security
- Usuários veem convites que enviaram
- Usuários veem convites para o próprio email
- Admins veem todos os convites
- Controle de inserção/atualização/deleção

**⚠️ Depende da migration 000 (coluna role) e 003 (tabela TeamInvite)**

---

## ✅ Verificação

Após executar todas as migrations, verifique no **Table Editor**:

### Tabelas criadas:
- ✅ `EmailLog`
- ✅ `TeamInvite`

### Coluna adicionada:
- ✅ `profiles.role` (tipo: user_role)

### Enums criados:
- ✅ `user_role` (VIEWER, EDITOR, ADMIN)
- ✅ `email_status` (SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, FAILED)
- ✅ `email_type` (TEAM_INVITE, NOTIFICATION, REPORT)
- ✅ `invite_status` (PENDING, ACCEPTED, EXPIRED, CANCELLED)

---

## 🐛 Troubleshooting

### Erro: "column profiles.role does not exist"
**Solução:** Execute a migration 000 primeiro

### Erro: "relation EmailLog does not exist"
**Solução:** Execute a migration 001 antes da 002

### Erro: "relation TeamInvite does not exist"
**Solução:** Execute a migration 003 antes da 004

### Erro: "type user_role already exists"
**Solução:** Ignore, o SQL já trata isso com `IF NOT EXISTS`

### Erro: "permission denied for table profiles"
**Solução:** Use o usuário admin do Supabase ou o service_role

---

## 🔄 Re-executar Migrations

As migrations são **idempotentes** (podem ser executadas múltiplas vezes sem causar erro):
- Usam `IF NOT EXISTS` para evitar duplicação
- Usam `CREATE OR REPLACE` para funções
- Verificam existência antes de criar

Se algo der errado, você pode re-executar o SQL sem problemas.

---

## 📞 Suporte

Se encontrar erros:
1. Copie a mensagem de erro completa
2. Informe qual migration estava executando
3. Verifique se executou na ordem correta
