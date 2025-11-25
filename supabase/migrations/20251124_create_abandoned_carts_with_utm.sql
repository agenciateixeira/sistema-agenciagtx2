/**
 * Migration: Criar tabela de carrinhos abandonados com UTM tracking
 * FASE 3: ROI Real - Cruzar Ads com Carrinhos
 *
 * Esta tabela armazena todos os carrinhos abandonados com dados de origem (UTM)
 * para calcular ROI real de campanhas de anúncios
 */

-- Criar tabela de carrinhos abandonados
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,

  -- Dados do cliente
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_id TEXT, -- ID do cliente na plataforma (Shopify, Yampi, etc)

  -- Dados do carrinho
  cart_token TEXT, -- Token único do carrinho na plataforma
  checkout_url TEXT, -- URL para finalizar a compra
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  cart_items JSONB DEFAULT '[]'::jsonb, -- Array de produtos no carrinho

  -- UTM Parameters (rastreamento de origem)
  utm_source TEXT, -- facebook, instagram, google, tiktok
  utm_medium TEXT, -- cpc, social, email
  utm_campaign TEXT, -- nome da campanha
  utm_term TEXT, -- termo de pesquisa
  utm_content TEXT, -- conteúdo específico

  -- Status do carrinho
  status TEXT NOT NULL DEFAULT 'abandoned' CHECK (status IN ('abandoned', 'recovered', 'expired', 'cancelled')),

  -- Rastreamento de recuperação
  recovery_emails_sent INTEGER DEFAULT 0,
  last_recovery_email_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  recovered_value DECIMAL(10, 2),

  -- Metadados
  platform_data JSONB DEFAULT '{}'::jsonb, -- Dados extras da plataforma
  abandoned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user_id
ON public.abandoned_carts(user_id);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_integration_id
ON public.abandoned_carts(integration_id);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_customer_email
ON public.abandoned_carts(customer_email);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status
ON public.abandoned_carts(status);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_utm_campaign
ON public.abandoned_carts(utm_campaign)
WHERE utm_campaign IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_utm_source
ON public.abandoned_carts(utm_source)
WHERE utm_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_abandoned_at
ON public.abandoned_carts(abandoned_at DESC);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered
ON public.abandoned_carts(status, recovered_at)
WHERE status = 'recovered';

-- Criar índice composto para queries de ROI (campanha + recuperado)
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_roi
ON public.abandoned_carts(utm_campaign, status, recovered_value)
WHERE utm_campaign IS NOT NULL AND status = 'recovered';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_abandoned_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_abandoned_carts_updated_at
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION update_abandoned_carts_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios carrinhos
CREATE POLICY "Users can view own abandoned carts"
ON public.abandoned_carts FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir seus próprios carrinhos
CREATE POLICY "Users can insert own abandoned carts"
ON public.abandoned_carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios carrinhos
CREATE POLICY "Users can update own abandoned carts"
ON public.abandoned_carts FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios carrinhos
CREATE POLICY "Users can delete own abandoned carts"
ON public.abandoned_carts FOR DELETE
USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE public.abandoned_carts IS 'Carrinhos abandonados com rastreamento UTM para cálculo de ROI';
COMMENT ON COLUMN public.abandoned_carts.utm_source IS 'Origem do tráfego (ex: facebook, google, instagram)';
COMMENT ON COLUMN public.abandoned_carts.utm_medium IS 'Meio de marketing (ex: cpc, social, email)';
COMMENT ON COLUMN public.abandoned_carts.utm_campaign IS 'Nome da campanha (ex: black-friday-2024)';
COMMENT ON COLUMN public.abandoned_carts.utm_term IS 'Termo de pesquisa paga';
COMMENT ON COLUMN public.abandoned_carts.utm_content IS 'Diferenciação de conteúdo (ex: banner-azul)';
COMMENT ON COLUMN public.abandoned_carts.recovered_value IS 'Valor recuperado quando o cliente finaliza a compra';
COMMENT ON COLUMN public.abandoned_carts.cart_items IS 'Array JSON com produtos do carrinho [{product_id, name, quantity, price}]';
