# 🛍️ Tutorial Completo: Integração Shopify

Guia passo a passo para conectar sua loja Shopify ao sistema de recuperação de vendas.

---

## 📋 O Que Você Vai Precisar

- ✅ Conta Shopify (plano básico ou superior)
- ✅ Acesso ao Admin da sua loja
- ✅ 10-15 minutos para configuração

---

## 🚀 PARTE 1: Criar App Custom no Shopify

### **Passo 1: Acessar Configurações de Apps**

1. Faça login no **Admin da sua loja Shopify**
   ```
   https://SUA-LOJA.myshopify.com/admin
   ```

2. No menu lateral esquerdo, clique em **"Settings"** (Configurações)

3. No menu de Settings, clique em **"Apps and sales channels"**

4. Clique em **"Develop apps"** (Desenvolver apps)

5. Se aparecer um aviso sobre desenvolvimento de apps, clique em **"Allow custom app development"** (Permitir desenvolvimento de apps personalizados)

---

### **Passo 2: Criar Novo App**

1. Clique no botão verde **"Create an app"** (Criar um app)

2. Preencha:
   - **App name:** `Sistema GTX - Recuperação de Vendas`
   - **App developer:** Seu email ou nome

3. Clique em **"Create app"**

---

### **Passo 3: Configurar Permissões (Scopes)**

1. Na página do app, clique na aba **"Configuration"**

2. Role até **"Admin API access scopes"**

3. Clique em **"Configure"**

4. **Marque as seguintes permissões:**

   #### **Orders (Pedidos):**
   - ✅ `read_orders` - Ler pedidos

   #### **Checkouts:**
   - ✅ `read_checkouts` - Ler checkouts
   - ✅ `write_checkouts` - Escrever checkouts

   #### **Customers (Clientes):**
   - ✅ `read_customers` - Ler clientes

   #### **Products (Produtos):**
   - ✅ `read_products` - Ler produtos
   - ✅ `read_product_listings` - Ler listagens de produtos

5. Clique em **"Save"** no final da página

---

### **Passo 4: Instalar o App**

1. Volte para a página principal do app

2. Clique na aba **"API credentials"**

3. Role até o final e clique no botão **"Install app"**

4. Confirme clicando em **"Install"**

---

### **Passo 5: Copiar Credenciais**

Após instalar, você verá as credenciais. **COPIE ESSES VALORES:**

#### **1. Admin API access token:**
```
shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
📝 **Guarde este token!** Ele só aparece uma vez.

#### **2. API key:**
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### **3. API secret key:**
```
shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔗 PARTE 2: Configurar Webhooks

### **Passo 1: Acessar Configurações de Notificações**

1. No Admin Shopify, vá em **"Settings"** → **"Notifications"**

2. Role a página até o **FINAL**

3. Você verá a seção **"Webhooks"**

---

### **Passo 2: Ver o Webhook Secret**

Logo acima da lista de webhooks, você verá uma mensagem:

```
Seus webhooks serão assinados com [código-longo-aqui]
```

**COPIE ESTE CÓDIGO!** Exemplo:
```
5734c1fe379aaa143ba10e8aab8ca12d9cd7cebabe2331582774d700554cf65f
```

📝 Este é o **Webhook Secret** que você vai precisar!

---

### **Passo 3: Criar os 3 Webhooks**

Você precisa criar **3 webhooks** apontando para o sistema GTX.

#### **Webhook 1: Checkout Creation (Criação de Carrinho)**

1. Clique em **"Create webhook"**

2. Preencha:
   - **Event:** `Checkout creation`
   - **Format:** `JSON`
   - **URL:**
     ```
     https://sistema-agenciagtx2.vercel.app/api/webhook/shopify
     ```
   - **Webhook API version:** `2024-10` (ou a mais recente disponível)

3. Clique em **"Save webhook"**

---

#### **Webhook 2: Checkout Update (Atualização de Carrinho)**

1. Clique em **"Create webhook"** novamente

2. Preencha:
   - **Event:** `Checkout update`
   - **Format:** `JSON`
   - **URL:**
     ```
     https://sistema-agenciagtx2.vercel.app/api/webhook/shopify
     ```
   - **Webhook API version:** `2024-10`

3. Clique em **"Save webhook"**

---

#### **Webhook 3: Order Creation (Criação de Pedido)**

1. Clique em **"Create webhook"** novamente

2. Preencha:
   - **Event:** `Order creation`
   - **Format:** `JSON`
   - **URL:**
     ```
     https://sistema-agenciagtx2.vercel.app/api/webhook/shopify
     ```
   - **Webhook API version:** `2024-10`

3. Clique em **"Save webhook"**

---

### ✅ Verificação: Você deve ter 3 webhooks na lista!

```
✓ Checkout creation → https://sistema-agenciagtx2.vercel.app/api/webhook/shopify
✓ Checkout update → https://sistema-agenciagtx2.vercel.app/api/webhook/shopify
✓ Order creation → https://sistema-agenciagtx2.vercel.app/api/webhook/shopify
```

Todos devem estar com status **"Active"** (verde).

---

## 💻 PARTE 3: Conectar no Sistema GTX

### **Passo 1: Acessar Integrações**

1. Acesse: **https://sistema-agenciagtx2.vercel.app/integrations**

2. Clique em **"Nova Integração"**

3. Selecione **"Shopify"**

---

### **Passo 2: Preencher Formulário**

Preencha com os dados que você copiou:

#### **1. Nome da Integração:**
```
Minha Loja Shopify
```
(Qualquer nome para identificar)

#### **2. URL da Loja:**
```
https://SUA-LOJA.myshopify.com
```
⚠️ **Use exatamente:** `https://` + seu domínio `.myshopify.com`

#### **3. Access Token (Admin API):**
```
shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Cole o **Admin API access token** que você copiou no Passo 5 da Parte 1

#### **4. API Secret:**
```
shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Cole a **API secret key** que você copiou

#### **5. Webhook Secret:**
```
5734c1fe379aaa143ba10e8aab8ca12d9cd7cebabe2331582774d700554cf65f
```
Cole o código que apareceu em "Seus webhooks serão assinados com..."

---

### **Passo 3: Salvar Integração**

1. Clique em **"Conectar Integração"**

2. Aguarde a validação (alguns segundos)

3. Se tudo estiver correto, aparecerá: ✅ **"Integração conectada com sucesso!"**

---

## 📧 PARTE 4: Configurar Emails de Recuperação

### **Passo 1: Personalizar Email**

1. Acesse: **https://sistema-agenciagtx2.vercel.app/recovery**

2. Faça upload da **logo da sua loja**

3. Escreva uma **mensagem personalizada:**
   ```
   Exemplo:
   "Notamos que você deixou alguns produtos incríveis no carrinho!
   Não perca essa oportunidade de levar produtos exclusivos com desconto."
   ```

4. (Opcional) Configure **email remetente** customizado:
   - Email: `vendas@sualore.com`
   - Nome: `Equipe Sua Loja`

5. **Ative o sistema** (toggle verde)

6. Clique em **"Salvar Configurações"**

---

## 🧪 PARTE 5: Testar o Sistema

### **Teste 1: Criar Carrinho Abandonado**

1. Abra sua loja Shopify (em modo incógnito ou navegador diferente)

2. Adicione produtos ao carrinho

3. Vá até o checkout e preencha:
   - **Email:** Seu email real (para receber o teste)
   - **Nome:** Seu nome
   - **Endereço:** Qualquer endereço

4. **NÃO finalize a compra** - simplesmente feche a aba

---

### **Teste 2: Verificar Webhook Recebido**

1. Aguarde 10-30 segundos

2. Vá em: **Sistema GTX → Recovery** (ou verifique os logs da Vercel)

3. Se tudo funcionar, você verá logs indicando que o webhook foi recebido

---

### **Teste 3: Aguardar Email (15 minutos)**

1. O sistema detecta carrinhos abandonados após **15 minutos**

2. A cada **5 minutos**, o sistema verifica automaticamente

3. Após 15-20 minutos do abandono, você receberá o **email de recuperação**!

---

## 📊 PARTE 6: Acompanhar Resultados

### **Dashboard de Estatísticas**

Acesse: **https://sistema-agenciagtx2.vercel.app/recovery**

Você verá:

```
📧 Emails Enviados: 45
👁️ Taxa de Abertura: 32.5%
🖱️ Taxa de Cliques: 18.2%
🛒 Conversões: 8
💰 Receita Recuperada: R$ 2.450,00
```

Todas as métricas são atualizadas automaticamente!

---

## ❓ Problemas Comuns

### **1. Erro: "HMAC inválido"**

**Causa:** O Webhook Secret está incorreto

**Solução:**
1. Copie novamente o código de "Seus webhooks serão assinados com..."
2. Atualize a integração no sistema GTX
3. Ou execute no Supabase SQL Editor:
   ```sql
   UPDATE integrations
   SET webhook_secret = 'SEU-CODIGO-CORRETO-AQUI'
   WHERE platform = 'shopify';
   ```

---

### **2. Webhooks não estão chegando**

**Verificar:**
- ✅ Os 3 webhooks estão com status "Active" no Shopify?
- ✅ A URL está correta (https://sistema-agenciagtx2.vercel.app/api/webhook/shopify)?
- ✅ Você criou um carrinho DEPOIS de configurar os webhooks?

**Teste:**
No Shopify Admin → Settings → Notifications → Webhooks:
- Clique em cada webhook
- Clique em "Send test notification"
- Veja se chegam logs na Vercel

---

### **3. Emails não estão sendo enviados**

**Verificar:**
- ✅ Sistema de recuperação está ATIVO em /recovery? (toggle verde)
- ✅ RESEND_API_KEY está configurada na Vercel?
- ✅ O carrinho tem mais de 15 minutos de abandono?
- ✅ GitHub Actions está rodando? (veja em Actions no repositório)

---

## 🎯 Resumo Rápido

**Dados que você precisa copiar:**

1. ✅ **Admin API access token** (começa com `shpat_`)
2. ✅ **API secret key** (começa com `shpss_`)
3. ✅ **Webhook Secret** (código longo que aparece em "assinados com...")

**Webhooks para criar (3):**

1. ✅ Checkout creation → URL do sistema
2. ✅ Checkout update → URL do sistema
3. ✅ Order creation → URL do sistema

**Configurações no Sistema:**

1. ✅ Conectar integração com as 3 credenciais
2. ✅ Personalizar email (logo + mensagem)
3. ✅ Ativar sistema de recuperação

---

## 🆘 Suporte

Dúvidas? Entre em contato:
- 📧 Email: suporte@agenciagtx.com.br
- 💬 WhatsApp: (XX) XXXXX-XXXX

---

**Desenvolvido com ❤️ pela Agência GTX**
