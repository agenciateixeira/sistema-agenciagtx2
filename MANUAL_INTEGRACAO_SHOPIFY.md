# 📦 Manual de Integração Shopify → GTX Analytics

**Versão:** 1.0
**Data:** Novembro 2024
**Para:** Clientes GTX Analytics

---

## 🎯 O que você vai conseguir:

Após conectar sua loja Shopify ao GTX Analytics, você terá:

- ✅ **Monitoramento automático** de todos os carrinhos criados
- ✅ **Detecção inteligente** de carrinhos abandonados
- ✅ **Recuperação automática** via email personalizado
- ✅ **Dashboard em tempo real** com vendas e conversões
- ✅ **ROI calculado** de cada email enviado

---

## ⏱️ Tempo necessário: 5-10 minutos

---

## 📋 Pré-requisitos:

- ✅ Ter uma loja Shopify ativa
- ✅ Ter acesso de **Administrador** na loja
- ✅ Conta ativa no GTX Analytics

---

## 🔧 Passo a Passo Completo

### **PASSO 1: Acessar Configurações da Shopify**

1. Faça login no **admin da sua loja Shopify**
2. No menu lateral esquerdo, clique em **Settings** (Configurações)
3. No menu de configurações, clique em **Apps and sales channels**
4. Clique no botão **Develop apps**

> 💡 **Nota:** Se não vê "Develop apps", peça ao dono da loja para habilitar em Settings → Apps and sales channels → App development

---

### **PASSO 2: Criar App Privado**

1. Clique no botão verde **Create an app**
2. Digite o nome: **GTX Analytics**
3. Clique em **Create app**

![Criar App](https://via.placeholder.com/600x200.png?text=Screenshot:+Create+App)

---

### **PASSO 3: Configurar Permissões (IMPORTANTE)**

1. Clique na aba **Configuration**
2. Na seção **Admin API integration**, clique em **Configure**
3. **Marque os seguintes checkboxes:**

#### ✅ Admin API Access Scopes:

| Scope | Nome na Interface | Para que serve |
|-------|-------------------|----------------|
| ✅ `read_orders` | **Orders** → Read access | Ver pedidos e **carrinhos abandonados** (AbandonedCheckout) |
| ✅ `read_products` | **Products** → Read access | Ver quais produtos estão no carrinho |
| ✅ `read_customers` | **Customers** → Read access | Ver email do cliente para enviar recuperação |

4. Clique em **Save**

> ⚠️ **ATENÇÃO:** Marque **APENAS** os 3 scopes listados acima. Não precisa marcar "write" em nenhum deles.
>
> 💡 **Nota:** Os webhooks serão configurados automaticamente pelo nosso sistema após a conexão.

![Configurar Scopes](https://via.placeholder.com/600x300.png?text=Screenshot:+Configure+Scopes)

---

### **PASSO 4: Instalar o App**

1. Depois de salvar as configurações, clique em **Install app** (botão verde no topo)
2. Confirme clicando em **Install**

> ⏳ A instalação leva alguns segundos

---

### **PASSO 5: Copiar Credenciais**

1. Após instalar, você será redirecionado para **API credentials**
2. Clique em **Reveal token once** (botão cinza)

   **⚠️ IMPORTANTE:** Você só pode ver o token UMA VEZ! Copie agora.

3. **Copie e guarde em local seguro:**
   - **Admin API access token** (começa com `shpat_...`)
   - **API secret key** (clique em "Show" para revelar)

![Copiar Credenciais](https://via.placeholder.com/600x250.png?text=Screenshot:+API+Credentials)

---

### **PASSO 6: Conectar no GTX Analytics**

1. Acesse sua conta no **GTX Analytics**
2. No menu lateral, clique em **Integrações**
3. Clique no botão **Adicionar Integração**
4. Selecione **Shopify**
5. Preencha os campos:

   **Nome da Loja:**
   ```
   Digite apenas o nome (ex: se sua loja é minha-loja.myshopify.com, digite apenas "minha-loja")
   ```

   **Admin API Access Token:**
   ```
   Cole o token que começa com shpat_...
   ```

   **API Secret Key:**
   ```
   Cole o secret que você copiou
   ```

6. Clique em **Conectar**

⏳ O sistema vai:
- Testar a conexão com sua loja
- Configurar webhooks automaticamente
- Começar a monitorar carrinhos

---

### **PASSO 7: Confirmar Conexão**

✅ Se tudo deu certo, você verá:
- Status: **Ativo** (bolinha verde)
- Nome da sua loja
- Última sincronização

🎉 **Pronto!** Sua loja está conectada!

---

## 🧪 Como Testar se Está Funcionando

### Teste 1: Criar um carrinho de teste

1. Abra sua loja em **modo anônimo** do navegador
2. Adicione um produto ao carrinho
3. Vá até o checkout (preencha email de teste)
4. **NÃO finalize a compra** - apenas feche a aba

⏰ Aguarde 15 minutos

5. Verifique o email de teste → Deve receber email de recuperação!

### Teste 2: Ver no Dashboard

1. Acesse **Visão Geral** no GTX Analytics
2. Você deve ver:
   - Card "Carrinhos Criados" → Incrementou
   - Lista de carrinhos abandonados com seu teste

---

## ❓ Problemas Comuns

### ⚠️ Erro: "Credenciais inválidas"

**Causa:** Token incorreto ou app não instalado

**Solução:**
1. Volte na Shopify → Apps → GTX Analytics
2. API credentials → Copie novamente o token
3. Certifique-se de ter clicado "Install app"

---

### ⚠️ Status: "Erro" (bolinha vermelha)

**Causa:** Permissões insuficientes

**Solução:**
1. Shopify → Apps → GTX Analytics → Configuration
2. Verifique se TODOS os 3 scopes estão marcados:
   - read_orders ✅ (inclui acesso a carrinhos abandonados)
   - read_products ✅
   - read_customers ✅
3. Save → Reinstall app

---

### ⚠️ Não recebo emails de recuperação

**Causa:** Webhooks não configurados

**Solução:**
1. GTX Analytics → Integrações
2. Clique no botão de **testar** (ícone de atualizar)
3. Se erro persistir, remova e reconecte a integração

---

## 🔒 Segurança

✅ **Seus dados estão seguros:**
- Credenciais criptografadas no banco
- Conexão HTTPS/TLS
- Acesso apenas para seu usuário (RLS ativo)
- Webhooks validados com assinatura HMAC
- Não armazenamos dados de cartão

✅ **Permissões mínimas:**
- Só solicitamos permissões de **leitura**
- Não alteramos produtos, preços ou pedidos
- Não acessamos dados de pagamento

---

## 📞 Suporte

Precisa de ajuda?

📧 **Email:** suporte@agenciagtx.com.br
💬 **WhatsApp:** (XX) XXXXX-XXXX
📚 **Documentação:** https://docs.agenciagtx.com.br

---

## ✅ Checklist Final

Antes de terminar, confirme:

- [ ] App "GTX Analytics" criado na Shopify
- [ ] 3 scopes configurados corretamente (read_orders, read_products, read_customers)
- [ ] App instalado (botão verde clicado)
- [ ] Token e Secret copiados
- [ ] Integração conectada no GTX Analytics
- [ ] Status "Ativo" na lista de integrações
- [ ] Teste de carrinho abandonado realizado

---

## 🎓 Próximos Passos

Agora que está conectado:

1. **Configure alertas** → Receba notificação de carrinhos abandonados
2. **Personalize emails** → Edite templates de recuperação
3. **Veja o Dashboard** → Acompanhe ROI em tempo real
4. **Convide sua equipe** → Adicione gestor de tráfego/designer

---

**Versão 1.0** - Última atualização: Novembro 2024
© 2025 Agência GTX - Todos os direitos reservados
