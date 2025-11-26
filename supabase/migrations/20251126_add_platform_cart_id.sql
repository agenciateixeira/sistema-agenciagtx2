/**
 * Adiciona campo platform_cart_id para IDs externos
 *
 * O campo id continua sendo UUID gerado automaticamente
 * platform_cart_id armazena IDs como "shopify_123" ou "yampi_456"
 */

-- Adicionar campo para ID externo da plataforma
ALTER TABLE public.abandoned_carts
ADD COLUMN IF NOT EXISTS platform_cart_id TEXT UNIQUE;

-- Criar índice para busca rápida por platform_cart_id
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_platform_cart_id
ON public.abandoned_carts(platform_cart_id);

-- Comentário
COMMENT ON COLUMN public.abandoned_carts.platform_cart_id IS 'ID único do carrinho na plataforma externa (ex: shopify_123, yampi_456)';
