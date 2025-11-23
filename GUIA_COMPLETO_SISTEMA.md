# 📚 GUIA COMPLETO DO SISTEMA GTX

## 🎯 O QUE É O SISTEMA

Sistema de gestão de equipe e rastreamento para Agência GTX, com:
- Autenticação de usuários
- Sistema de convites por email
- Controle de permissões (ADMIN/EDITOR/VIEWER)
- Dashboard (placeholder para funcionalidades futuras)

---

## 🏗️ ARQUITETURA

### **Tecnologias:**
- **Next.js 14.2.3** - Framework React (App Router)
- **Supabase** - Backend (Auth + Database PostgreSQL)
- **Prisma** - ORM (schema management)
- **Resend** - Serviço de email
- **Tailwind CSS** - Estilização

### **Estrutura de pastas:**
```
├── app/
│   ├── (app)/              ← Páginas autenticadas
│   │   ├── dashboard/      ← Dashboard principal
│   │   ├── team/           ← Gestão de equipe
│   │   └── layout.tsx      ← Layout com sidebar/topbar
│   ├── api/                ← API Routes
│   │   ├── accept-invite/  ← Aceitar convite
│   │   ├── test-*/         ← Endpoints de teste/debug
│   │   └── verify-keys/    ← Verificar env vars
│   ├── actions/            ← Server Actions
│   │   ├── auth.ts         ← Login, logout, reset senha
│   │   └── team.ts         ← Convites, membros
│   ├── login/              ← Página de login
│   ├── cadastro/           ← Página de cadastro
│   ├── convite-aceito/     ← Página após aceitar convite
│   ├── recuperar-senha/    ← Reset de senha
│   └── debug/              ← Página de testes
├── components/
│   ├── layout/             ← Sidebar, Topbar
│   ├── team/               ← Componentes de equipe
│   ├── login/              ← Formulário de login
│   └── logo.tsx            ← Logo GTX
├── lib/
│   ├── supabase-browser.ts ← Cliente Supabase (browser)
│   ├── email-service.ts    ← Envio de emails
│   ├── email-templates.ts  ← Templates HTML dos emails
│   ├── auth-helpers.ts     ← Helpers de autorização
│   └── navigation.ts       ← Navegação do app
├── supabase/
│   └── migrations/         ← Migrations SQL
│       ├── 007_create_profiles_table.sql
│       └── 008_fix_profiles_rls_admin_view_all.sql
├── prisma/
│   └── schema.prisma       ← Schema do banco (Prisma)
└── middleware.ts           ← Middleware de autenticação
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela: auth.users** (Supabase Auth)
```
- id (UUID)
- email (único)
- encrypted_password
- email_confirmed_at
- created_at
- last_sign_in_at
```
**Gerenciada pelo Supabase automaticamente**

### **Tabela: public.profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,           -- FK para auth.users(id)
  nome TEXT NOT NULL,
  role user_role DEFAULT 'VIEWER',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles disponíveis:**
- `ADMIN` → Controle total
- `EDITOR` → Editar conteúdo
- `VIEWER` → Apenas visualizar

### **Tabela: TeamInvite**
```sql
CREATE TABLE TeamInvite (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,    -- Token único do convite
  invitedBy UUID,                -- Quem convidou
  status TEXT DEFAULT 'PENDING', -- PENDING/ACCEPTED/CANCELLED/EXPIRED
  invitedAt TIMESTAMPTZ DEFAULT NOW(),
  acceptedAt TIMESTAMPTZ,
  expiresAt TIMESTAMPTZ,         -- Expira em 7 dias
  metadata JSONB                 -- Email ID, erros, etc
);
```

### **Tabela: EmailLog** (opcional)
```sql
CREATE TABLE EmailLog (
  id UUID PRIMARY KEY,
  emailId TEXT UNIQUE,           -- ID do Resend
  type EMAIL_TYPE,               -- TEAM_INVITE/NOTIFICATION/REPORT
  to TEXT,
  subject TEXT,
  status EMAIL_STATUS,           -- SENT/DELIVERED/OPENED/CLICKED/BOUNCED
  sentAt TIMESTAMPTZ,
  deliveredAt TIMESTAMPTZ,
  metadata JSONB
);
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### **Fluxo de Login:**
1. Usuário acessa `/login`
2. Digita email + senha
3. `LoginForm` chama `supabase.auth.signInWithPassword()`
4. Se sucesso, redireciona para `/dashboard`
5. Middleware verifica sessão em todas as páginas

### **Fluxo de Convite:**
1. **ADMIN** entra em `/team`
2. Preenche formulário: email, nome, role
3. `inviteTeamMember()` server action:
   - Gera token único
   - Salva na tabela `TeamInvite`
   - Envia email com link `/api/accept-invite?token=abc123`
4. **Convidado** clica no link
5. `/api/accept-invite`:
   - Valida token e expiração
   - Cria usuário no `auth.users` com senha `GTX@2025`
   - Aplica workaround `updateUserById()` (bug Supabase)
   - Cria perfil em `profiles`
   - Marca convite como `ACCEPTED`
   - Envia email de boas-vindas
   - Redireciona para `/convite-aceito`
6. **Página `/convite-aceito`:**
   - Mostra email e senha grandes
   - Botão "Fazer Login Agora" (auto-login)
   - Aguarda 2s e faz login automático
   - Redireciona para `/dashboard`

### **Fluxo de Recuperação de Senha:**
1. Usuário clica "Esqueceu a senha?"
2. Acessa `/recuperar-senha`
3. Digita email
4. Supabase envia email com link de reset
5. Usuário clica no link
6. Define nova senha
7. Redireciona para `/login`

---

## 🔒 SISTEMA DE PERMISSÕES

### **RLS (Row Level Security):**

Políticas na tabela `profiles`:

```sql
-- Service role pode tudo (usado em APIs)
CREATE POLICY "Service role can do anything"
  USING (true);

-- Usuários veem seu próprio perfil OU ADMINs veem todos
CREATE POLICY "Users can view profiles"
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update their own profile"
  USING (auth.uid() = id);
```

### **Proteção de Server Actions:**

```typescript
// lib/auth-helpers.ts
export async function requireAdmin(userId: string) {
  const { authorized, role } = await checkUserRole(userId, ['ADMIN']);
  if (!authorized) {
    throw new Error(`Acesso negado. Necessário: ADMIN. Atual: ${role}`);
  }
}

// app/actions/team.ts
export async function inviteTeamMember(formData: FormData) {
  const { user } = await supabase.auth.getUser();
  await requireAdmin(user.id);  // ← Bloqueia se não for ADMIN
  // ... resto do código
}
```

**Actions protegidas:**
- ✅ `inviteTeamMember()` - ADMIN only
- ✅ `cancelInvite()` - ADMIN only
- ✅ `updateMemberRole()` - ADMIN only
- ✅ `removeTeamMember()` - ADMIN only

---

## 📄 PÁGINAS E FUNCIONALIDADES

### **Páginas Públicas (sem autenticação):**

**1. `/` (Home)**
- Redireciona para `/dashboard` se logado
- Redireciona para `/login` se não logado

**2. `/login`**
- Formulário de login
- Link "Esqueceu a senha?"
- Link "Criar nova conta"

**3. `/cadastro`**
- Formulário de cadastro (placeholder)
- Atualmente não funciona (convite é obrigatório)

**4. `/recuperar-senha`**
- Formulário para resetar senha
- Envia email com link de reset

**5. `/recuperar-senha/redefinir`**
- Define nova senha após clicar no email

**6. `/convite-aceito`**
- Mostra credenciais após aceitar convite
- Botão de auto-login

**7. `/debug`**
- Página de testes/diagnóstico
- Verifica env vars
- Testa criação de usuários
- Testa envio de emails
- Testa login

---

### **Páginas Autenticadas:**

**1. `/dashboard`**
- Página principal após login
- Atualmente placeholder (vazio)
- **TODO:** Adicionar métricas, gráficos, analytics

**2. `/team`**
- **Para ADMIN:**
  - Formulário para convidar membros
  - Lista de convites pendentes
  - Lista de todos os membros
  - Botões para editar/remover membros
- **Para EDITOR/VIEWER:**
  - Mensagem informativa
  - Lista de membros (apenas visualização)
  - Sem acesso ao formulário de convite

**3. `/notifications` (placeholder)**
- Ainda não implementado
- Aparece na navegação

**4. `/reports` (placeholder)**
- Ainda não implementado
- Aparece na navegação

**5. `/analytics` (placeholder)**
- Ainda não implementado
- Aparece na navegação

---

## 🎨 COMPONENTES PRINCIPAIS

### **Layout:**
- **`Sidebar`** - Menu lateral com navegação
- **`Topbar`** - Cabeçalho com busca, notificações, perfil do usuário

### **Team:**
- **`InviteMemberForm`** - Formulário de convite
- **`PendingInvitesList`** - Lista de convites pendentes
- **`TeamMembersList`** - Lista de membros da equipe

### **Auth:**
- **`LoginForm`** - Formulário de login
- **`RecoverPasswordForm`** - Formulário de recuperação
- **`ResetPasswordForm`** - Formulário de reset

---

## 🔧 VARIÁVEIS DE AMBIENTE

### **Obrigatórias:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  ← Usado em APIs

# Site
NEXT_PUBLIC_SITE_URL=https://app.agenciagtx.com.br

# Email (Resend)
RESEND_API_KEY=re_...
```

### **Verificar se estão corretas:**
```
https://app.agenciagtx.com.br/api/verify-keys
```

---

## 🐛 DEBUGGING

### **Endpoints de teste:**
- `/debug` - UI visual de testes
- `/api/test-supabase` - Testa criação de usuários
- `/api/test-login` - Testa login completo
- `/api/test-email` - Testa envio de emails
- `/api/test-auth-flow` - Teste definitivo (email único)
- `/api/test-profile-insert` - Testa inserção de perfil
- `/api/verify-keys` - Verifica env vars

### **SQL úteis:**
- `CHECK_ALL_USERS.sql` - Ver todos os usuários
- `CHECK_TRIGGERS.sql` - Ver triggers automáticos

---

## 🚀 PRÓXIMOS PASSOS SUGERIDOS

### **Funcionalidades Faltando:**

**1. Dashboard Real (PRIORIDADE ALTA)**
- Adicionar métricas
- Gráficos de analytics
- KPIs da agência
- Dados de rastreamento

**2. Página de Perfil**
- Editar nome
- Trocar senha
- Upload de avatar
- Preferências

**3. Notificações**
- Sistema de notificações in-app
- Histórico de notificações
- Configurações de notificações

**4. Relatórios**
- Criar relatórios personalizados
- Agendar envio de relatórios
- Templates de relatórios

**5. Analytics**
- Integração com GA4
- Métricas de campanhas
- Funis de conversão

**6. Sistema de Times/Equipes**
- Criar múltiplas equipes
- Isolamento de dados por equipe
- Multi-tenancy completo

---

## 🔑 CONCEITOS IMPORTANTES

### **Server Components vs Client Components:**
- **Server:** Roda no servidor, pode acessar banco diretamente
- **Client:** Roda no navegador, precisa de APIs/Server Actions

### **Server Actions:**
- Funções marcadas com `'use server'`
- Executam no servidor
- Podem ser chamadas de Client Components
- Validação de segurança OBRIGATÓRIA

### **Middleware:**
- Roda antes de TODA requisição
- Verifica autenticação
- Redireciona usuários não autenticados

### **RLS (Row Level Security):**
- Políticas de segurança do PostgreSQL
- Controla quem pode ver/editar cada linha
- Supabase aplica automaticamente

---

## ❓ PERGUNTAS FREQUENTES

**Q: Por que usar UPSERT em vez de INSERT?**
A: Porque pode haver triggers automáticos criando perfis, então UPSERT evita erros de duplicate key.

**Q: Por que o workaround `updateUserById()` após `createUser()`?**
A: Bug conhecido do Supabase onde `createUser()` às vezes não salva a senha corretamente.

**Q: Por que service_role_key em vez de anon_key nas APIs?**
A: Service role bypassa RLS, necessário para criar usuários e perfis via API.

**Q: Como adicionar uma nova página?**
A: Criar em `app/(app)/nova-pagina/page.tsx` e adicionar em `lib/navigation.ts`

**Q: Como adicionar uma nova role?**
A: Atualizar enum no banco + atualizar `auth-helpers.ts` + adicionar em interfaces TypeScript

---

## 📞 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Prisma
npx prisma generate
npx prisma db push

# Git
git status
git add .
git commit -m "mensagem"
git push
```

---

**Este guia será atualizado conforme o sistema evolui.**
