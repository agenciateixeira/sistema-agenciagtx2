# 🛒 Guia Completo: Integração Shopify

## 📋 Access Scopes Necessários

Segundo a [documentação oficial da Shopify](https://shopify.dev/docs/api/usage/access-scopes), precisamos dos seguintes scopes:

### Scopes para o MVP:

| Scope | Permissão | Para que serve |
|-------|-----------|----------------|
| `read_checkouts` | Ler checkouts | Detectar carrinhos criados e abandonados |
| `read_orders` | Ler pedidos | Ver quando um carrinho abandonado converteu em venda |
| `read_products` | Ler produtos | Mostrar quais produtos estão no carrinho |
| `read_customers` | Ler clientes | Obter email/nome do cliente para enviar recuperação |
| `write_webhooks` | Criar webhooks | Configurar webhooks automaticamente via API |

### Scopes Opcionais (Futuro):

| Scope | Para que serve |
|-------|----------------|
| `read_discounts` | Criar cupons de desconto automáticos |
| `read_price_rules` | Gerenciar regras de preço |
| `read_script_tags` | Injetar JavaScript para tracking em tempo real |

---

## 🔄 Webhooks que Vamos Usar

Segundo a [documentação de webhooks da Shopify](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook):

### Webhooks Essenciais:

1. **`checkouts/create`**
   - Disparado: Quando cliente adiciona produtos no carrinho
   - Payload: Email, produtos, valor total, checkout_id
   - Uso: Iniciar tracking do carrinho

2. **`checkouts/update`**
   - Disparado: Quando cliente atualiza carrinho (adiciona/remove produtos)
   - Payload: Checkout atualizado
   - Uso: Atualizar valor do carrinho

3. **`orders/create`**
   - Disparado: Quando cliente finaliza a compra
   - Payload: Pedido completo
   - Uso: Marcar carrinho como CONVERTIDO

### Webhooks Futuros:

- `carts/create` - Carrinho criado (diferente de checkout)
- `carts/update` - Carrinho atualizado
- `checkouts/delete` - Checkout deletado

---

## 🔐 Autenticação

### Custom App (Atual - MVP):

Cliente cria app privado e obtém:
- **Admin API access token** - Token permanente para fazer requests
- **API secret key** - Para validar webhooks recebidos

### OAuth App (Futuro - Produção):

Quando listarmos no Shopify App Store:
- OAuth 2.0 flow automático
- Token com refresh automático
- Melhor experiência do usuário

---

## 🛠️ Implementação Técnica

### 1. Testar Conexão Shopify

```typescript
// GET https://{store}.myshopify.com/admin/api/2024-01/shop.json
// Headers:
{
  'X-Shopify-Access-Token': 'shpat_...',
  'Content-Type': 'application/json'
}

// Resposta:
{
  "shop": {
    "id": 123456,
    "name": "Minha Loja",
    "email": "loja@exemplo.com",
    "currency": "BRL",
    "money_format": "R$ {{amount}}"
  }
}
```

### 2. Configurar Webhooks Automaticamente

```typescript
// POST https://{store}.myshopify.com/admin/api/2024-01/webhooks.json
// Headers: X-Shopify-Access-Token
// Body:
{
  "webhook": {
    "topic": "checkouts/create",
    "address": "https://nossodominio.com/api/webhook/shopify",
    "format": "json"
  }
}
```

### 3. Validar Webhook Recebido

```typescript
// Shopify envia header: X-Shopify-Hmac-SHA256
// Validar usando API secret:

const hmac = req.headers['x-shopify-hmac-sha256'];
const body = JSON.stringify(req.body);
const hash = crypto
  .createHmac('sha256', API_SECRET)
  .update(body, 'utf8')
  .digest('base64');

if (hash !== hmac) {
  throw new Error('Webhook inválido');
}
```

---

## 📊 Fluxo Completo

```
1. CLIENTE CONECTA SHOPIFY
   ↓
   - Salva credenciais no banco
   - Testa conexão via /shop.json
   - Status: ACTIVE

2. AUTO-CONFIGURAR WEBHOOKS
   ↓
   - POST /webhooks.json (checkouts/create)
   - POST /webhooks.json (checkouts/update)
   - POST /webhooks.json (orders/create)
   - Salva webhook_ids no banco

3. SHOPIFY ENVIA WEBHOOK
   ↓
   - Evento: checkouts/create
   - Payload: { checkout_id, email, line_items, total_price }
   - Nossa API: POST /api/webhook/shopify

4. PROCESSAMOS EVENTO
   ↓
   - Validar HMAC
   - Salvar em webhook_events
   - Marcar processed=false

5. JOB DETECTA ABANDONO (15min depois)
   ↓
   - Query: checkout_created && !order_created && 15min passed
   - Envia email via Resend
   - Salvar em automated_actions

6. CLIENTE VOLTA E COMPRA
   ↓
   - Shopify envia: orders/create
   - Encontra carrinho original
   - Marca automated_action.converted = true
   - ROI CALCULADO! 🎉
```

---

## 🧪 Teste Manual

### 1. Criar Loja de Teste:

- Acesse: https://www.shopify.com/partners
- Criar "Development Store"
- Loja gratuita para testar

### 2. Criar Custom App:

- Settings → Apps and sales channels → Develop apps
- Create an app: "GTX Analytics Test"
- Configuration → Admin API scopes → Selecionar scopes acima

### 3. Obter Credentials:

- API credentials → Reveal token once
- Copiar: Admin API access token
- Copiar: API secret key

### 4. Testar no GTX Analytics:

- /integrations → Adicionar Integração
- Cola token e secret
- Clica "Conectar"
- Status deve ficar "Ativo" ✅

---

## 📚 Documentação Útil

- **Access Scopes:** https://shopify.dev/docs/api/usage/access-scopes
- **Webhooks:** https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook
- **Admin API:** https://shopify.dev/docs/api/admin-rest
- **Checkouts:** https://shopify.dev/docs/api/admin-rest/2024-01/resources/checkout
- **Orders:** https://shopify.dev/docs/api/admin-rest/2024-01/resources/order

---

## 🚀 Roadmap de Implementação

### ✅ Fase 1: Conexão (FEITO)
- [x] Interface /integrations
- [x] Validar credenciais Shopify
- [x] Salvar no banco
- [x] Testar conexão

### 🔨 Fase 2: Webhooks (PRÓXIMO)
- [ ] Endpoint /api/webhook/shopify
- [ ] Validar HMAC
- [ ] Salvar eventos no banco
- [ ] Auto-configurar webhooks na Shopify

### 🔨 Fase 3: Processamento
- [ ] Job que roda a cada 5min
- [ ] Detectar carrinhos abandonados (15min)
- [ ] Enviar email via Resend
- [ ] Template de email bonito

### 🔨 Fase 4: Dashboard
- [ ] Cards com dados reais
- [ ] Lista de carrinhos abandonados
- [ ] Gráfico de conversão
- [ ] ROI calculado

### 🔨 Fase 5: Otimizações
- [ ] Testes A/B de mensagens
- [ ] Múltiplos intervalos (15min, 1h, 24h)
- [ ] WhatsApp via Twilio
- [ ] Score preditivo de abandono
