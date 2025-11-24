-- ========================================
-- ADICIONAR COLUNAS FALTANTES EM WEBHOOK_EVENTS
-- ========================================
-- Colunas necessárias para recuperação de carrinho abandonado

-- Adicionar user_id para facilitar queries
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar checkout_url (link para finalizar compra)
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS checkout_url TEXT;

-- Adicionar line_items (produtos do carrinho)
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS line_items JSONB;

-- Adicionar customer_name (nome do cliente)
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Adicionar currency (moeda)
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- Atualizar user_id baseado na integration_id para registros existentes
UPDATE public.webhook_events we
SET user_id = i.user_id
FROM public.integrations i
WHERE we.integration_id = i.id
  AND we.user_id IS NULL;

-- Criar índice para user_id
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON public.webhook_events(user_id);

-- Adicionar colunas faltantes em automated_actions
ALTER TABLE public.automated_actions
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'email';

ALTER TABLE public.automated_actions
ADD COLUMN IF NOT EXISTS conversion_value NUMERIC(10,2);

-- Comentários
COMMENT ON COLUMN public.webhook_events.user_id IS 'ID do usuário dono da integração (denormalizado para performance)';
COMMENT ON COLUMN public.webhook_events.checkout_url IS 'URL para finalizar a compra (Shopify abandoned_checkout_url)';
COMMENT ON COLUMN public.webhook_events.line_items IS 'Produtos do carrinho em formato JSON';
COMMENT ON COLUMN public.webhook_events.customer_name IS 'Nome do cliente';
COMMENT ON COLUMN public.webhook_events.currency IS 'Moeda do carrinho (BRL, USD, etc)';
COMMENT ON COLUMN public.automated_actions.channel IS 'Canal de comunicação: email, sms, whatsapp';
COMMENT ON COLUMN public.automated_actions.conversion_value IS 'Valor da conversão se o cliente comprou';
