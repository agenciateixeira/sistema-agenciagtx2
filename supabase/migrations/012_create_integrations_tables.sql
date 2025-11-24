-- ========================================
-- TABELAS PARA INTEGRAÇÕES
-- ========================================

-- 1. Tabela de Integrações (Shopify, Yampi, etc)
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'shopify', 'yampi', 'woocommerce', etc
  store_name TEXT NOT NULL, -- Nome da loja
  store_url TEXT, -- URL da loja
  api_key TEXT NOT NULL, -- Chave API (criptografada)
  api_secret TEXT, -- Secret (criptografado)
  access_token TEXT, -- Token OAuth (se aplicável)
  webhook_secret TEXT, -- Secret para validar webhooks
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'error'
  last_sync_at TIMESTAMPTZ, -- Última sincronização
  error_message TEXT, -- Último erro
  settings JSONB DEFAULT '{}', -- Configurações extras
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Eventos de Webhook
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'cart_created', 'checkout_started', 'order_created', etc
  event_data JSONB NOT NULL, -- Dados completos do evento
  customer_email TEXT, -- Email do cliente (para facilitar queries)
  cart_value NUMERIC(10,2), -- Valor do carrinho
  cart_id TEXT, -- ID do carrinho na plataforma
  order_id TEXT, -- ID do pedido (se converteu)
  processed BOOLEAN DEFAULT FALSE, -- Se já processamos (enviamos email, etc)
  processed_at TIMESTAMPTZ, -- Quando processamos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Ações Automáticas (Emails enviados, etc)
CREATE TABLE IF NOT EXISTS public.automated_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id UUID REFERENCES public.webhook_events(id) ON DELETE SET NULL,
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'email_sent', 'sms_sent', 'whatsapp_sent', etc
  recipient TEXT NOT NULL, -- Email/telefone do destinatário
  subject TEXT, -- Assunto (se email)
  content TEXT, -- Conteúdo da mensagem
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  external_id TEXT, -- ID do Resend/Twilio/etc
  opened BOOLEAN DEFAULT FALSE, -- Se abriu o email
  clicked BOOLEAN DEFAULT FALSE, -- Se clicou no link
  converted BOOLEAN DEFAULT FALSE, -- Se voltou e comprou
  error_message TEXT, -- Se falhou, por quê
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON public.integrations(status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_integration_id ON public.webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_customer_email ON public.webhook_events(customer_email);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_automated_actions_integration_id ON public.automated_actions(integration_id);
CREATE INDEX IF NOT EXISTS idx_automated_actions_webhook_event_id ON public.automated_actions(webhook_event_id);
CREATE INDEX IF NOT EXISTS idx_automated_actions_status ON public.automated_actions(status);
CREATE INDEX IF NOT EXISTS idx_automated_actions_converted ON public.automated_actions(converted);

-- RLS Policies

-- Integrations: Usuário só vê suas próprias integrações
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON public.integrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own integrations"
  ON public.integrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own integrations"
  ON public.integrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own integrations"
  ON public.integrations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Webhook Events: Usuário vê eventos das suas integrações
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhook events"
  ON public.webhook_events FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.integrations WHERE user_id = auth.uid()
    )
  );

-- Automated Actions: Usuário vê ações das suas integrações
ALTER TABLE public.automated_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automated actions"
  ON public.automated_actions FOR SELECT
  TO authenticated
  USING (
    integration_id IN (
      SELECT id FROM public.integrations WHERE user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
