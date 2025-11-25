/**
 * Migration: Adicionar campos CAPI aos carrinhos abandonados
 * FASE 6: Conversions API
 *
 * Registra eventos enviados para Meta Conversions API
 */

-- Adicionar colunas para rastrear eventos CAPI
ALTER TABLE public.abandoned_carts
ADD COLUMN IF NOT EXISTS capi_purchase_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS capi_purchase_event_id TEXT,
ADD COLUMN IF NOT EXISTS capi_purchase_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS capi_add_to_cart_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS capi_add_to_cart_event_id TEXT,
ADD COLUMN IF NOT EXISTS capi_add_to_cart_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS capi_error_message TEXT;

-- Criar índice para consultas de eventos pendentes
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_capi_purchase_pending
ON public.abandoned_carts(status, capi_purchase_sent)
WHERE status = 'recovered' AND capi_purchase_sent = FALSE;

-- Comentários
COMMENT ON COLUMN public.abandoned_carts.capi_purchase_sent IS 'Se evento Purchase foi enviado para Meta CAPI';
COMMENT ON COLUMN public.abandoned_carts.capi_purchase_event_id IS 'ID único do evento Purchase na Meta CAPI';
COMMENT ON COLUMN public.abandoned_carts.capi_purchase_sent_at IS 'Timestamp de quando evento Purchase foi enviado';
COMMENT ON COLUMN public.abandoned_carts.capi_add_to_cart_sent IS 'Se evento AddToCart foi enviado para Meta CAPI';
COMMENT ON COLUMN public.abandoned_carts.capi_add_to_cart_event_id IS 'ID único do evento AddToCart na Meta CAPI';
COMMENT ON COLUMN public.abandoned_carts.capi_add_to_cart_sent_at IS 'Timestamp de quando evento AddToCart foi enviado';
COMMENT ON COLUMN public.abandoned_carts.capi_error_message IS 'Mensagem de erro se envio CAPI falhar';
