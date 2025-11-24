-- Migration: OAuth States (CSRF Protection)
-- Armazena states temporários para validar callbacks OAuth
-- FASE 1.2 do Roadmap

CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- State CSRF token
  state TEXT NOT NULL UNIQUE,

  -- Provider (meta, google, etc)
  provider TEXT NOT NULL,

  -- Expira em 10 minutos
  expires_at TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Índice para limpeza de expirados
  CONSTRAINT check_expires_future CHECK (expires_at > created_at)
);

-- Índices
CREATE INDEX idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX idx_oauth_states_expires ON public.oauth_states(expires_at);

-- Função para limpar states expirados (executa via cron ou trigger)
CREATE OR REPLACE FUNCTION clean_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.oauth_states
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE public.oauth_states IS 'Armazena CSRF tokens para OAuth (expiram em 10min)';
