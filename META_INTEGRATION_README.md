# 🎯 Integração Meta Ads - Guia de Configuração

## ✅ FASE 0 e FASE 1 Implementadas

### O que foi implementado:

- ✅ **Módulo de criptografia** (`lib/crypto.ts`)
- ✅ **Client Meta Graph API** (`lib/meta-client.ts`)
- ✅ **Tabelas Supabase**: `meta_connections`, `oauth_states`
- ✅ **Rotas OAuth completas**:
  - `GET /api/auth/meta/start` - Inicia OAuth
  - `GET /api/auth/meta/callback` - Processa autorização
  - `POST /api/auth/meta/deauthorize` - Desautorização
  - `POST /api/auth/meta/data-deletion` - GDPR compliance

---

## 📋 Configuração Necessária

### 1. **Adicionar Variáveis de Ambiente na Vercel**

Acesse: https://vercel.com/guilhermes-projects-2870101b/sistema-agenciagtx2/settings/environment-variables

Adicione as seguintes variáveis:

```env
# Criptografia (OBRIGATÓRIO)
ENCRYPTION_SECRET=6cc092dc3609cb60789dcec55388b0f92e213029383a53fbf660897ed5614714

# Meta Ads API (OAuth Multi-tenant)
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
META_GRAPH_VERSION=v22.0
META_OAUTH_REDIRECT_URI=https://sistema-agenciagtx2.vercel.app/api/auth/meta/callback
META_DEAUTHORIZE_URI=https://sistema-agenciagtx2.vercel.app/api/auth/meta/deauthorize
META_DATA_DELETION_URI=https://sistema-agenciagtx2.vercel.app/api/auth/meta/data-deletion
```

> ⚠️ **IMPORTANTE:** Marque todas as variáveis para **Production**, **Preview** e **Development**

---

### 2. **Configurar App no Meta for Developers**

Acesse: https://developers.facebook.com/apps/

#### 2.1 Criar/Configurar App

1. Vá no seu app existente (ou crie um novo)
2. No painel esquerdo → **Settings** → **Basic**
3. Copie:
   - **App ID** → Use em `META_APP_ID`
   - **App Secret** → Use em `META_APP_SECRET`

#### 2.2 Configurar OAuth Redirect

1. No painel esquerdo → **Facebook Login** → **Settings**
2. Em **Valid OAuth Redirect URIs**, adicione:
   ```
   https://sistema-agenciagtx2.vercel.app/api/auth/meta/callback
   ```
3. Salve

#### 2.3 Configurar Data Deletion (GDPR)

1. No painel esquerdo → **Settings** → **Basic**
2. Em **Data Deletion Instructions URL**:
   ```
   https://sistema-agenciagtx2.vercel.app/api/auth/meta/data-deletion
   ```
3. Em **Deauthorize Callback URL**:
   ```
   https://sistema-agenciagtx2.vercel.app/api/auth/meta/deauthorize
   ```
4. Salve

#### 2.4 Adicionar Permissões

1. No painel esquerdo → **App Review** → **Permissions and Features**
2. Solicitar revisão para:
   - ✅ `ads_read` - Ver anúncios e métricas
   - ✅ `business_management` - Ver businesses e contas de anúncios
3. Aguarde aprovação (pode levar alguns dias)

> 💡 **Para desenvolvimento:** Adicione usuários teste no **Roles** → **Test Users**

---

### 3. **Rodar Migrations no Supabase**

Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

Execute os SQLs (na ordem):

#### 3.1 Tabela oauth_states

```sql
-- Copie e cole o conteúdo de:
supabase/migrations/20251124_create_oauth_states.sql
```

#### 3.2 Tabela meta_connections

```sql
-- Copie e cole o conteúdo de:
supabase/migrations/20251124_create_meta_connections.sql
```

---

### 4. **Redeploy na Vercel**

Após adicionar as ENV vars:

1. Acesse: https://vercel.com/guilhermes-projects-2870101b/sistema-agenciagtx2/deployments
2. No último deploy, clique nos 3 pontinhos (⋯)
3. Clique em **"Redeploy"**
4. Aguarde o deploy completar

---

## 🧪 Testar a Integração

### Próximos Passos:

1. **Criar UI** (FASE 1.3):
   - Botão "Conectar Meta Ads" em `/integrations`
   - Tela de seleção de conta se tiver múltiplas
   - Indicador de status da conexão

2. **Dashboard Ads** (FASE 2):
   - Mostrar spend, clicks, CPC
   - Histórico de métricas
   - Job para sincronizar diariamente

3. **Cruzar com Recovery** (FASE 3):
   - UTM tracking nos carrinhos
   - ROI: Ads vs Receita Recuperada
   - Funil completo: Ad → Carrinho → Email → Venda

---

## 🔐 Segurança

### ✅ Boas práticas implementadas:

- **Tokens criptografados**: AES-256-GCM (nunca em plain text)
- **CSRF protection**: State tokens com expiração (10min)
- **GDPR compliance**: Endpoints de desautorização e deleção
- **Multi-tenant**: Cada usuário tem sua própria conexão isolada
- **RLS (Row Level Security)**: Usuário só vê seus próprios dados

### ⚠️ NUNCA:

- Expor `META_APP_SECRET` para frontend
- Expor `ENCRYPTION_SECRET` para frontend
- Expor tokens descriptografados para frontend
- Compartilhar tokens entre usuários

---

## 📚 Próximas Fases

- [ ] **FASE 1.3**: UI de conexão
- [ ] **FASE 2**: Dashboard básico
- [ ] **FASE 3**: Cruzar Ads com Recovery
- [ ] **FASE 4**: Dashboard completo por campanha
- [ ] **FASE 5**: Alertas inteligentes
- [ ] **FASE 6**: Conversions API (CAPI)
- [ ] **FASE 7**: Relatórios exportáveis

---

## 🚀 Status Atual

- ✅ **FASE 0**: Infra base COMPLETA
- ✅ **FASE 1.1**: Tabelas COMPLETAS
- ✅ **FASE 1.2**: OAuth COMPLETO
- ⏳ **FASE 1.3**: UI em desenvolvimento

---

## 📞 Suporte

Se tiver dúvidas, consulte:
- [Meta for Developers Docs](https://developers.facebook.com/docs/)
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
