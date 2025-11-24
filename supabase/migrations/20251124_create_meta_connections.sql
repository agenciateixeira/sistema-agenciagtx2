-- Migration: Meta Ads Connections (Multi-tenant)
-- Armazena conexões OAuth dos clientes com suas contas Meta Ads
-- FASE 1.1 do Roadmap

-- Criar tabela meta_connections
CREATE TABLE IF NOT EXISTS public.meta_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant: cada usuário tem sua própria conexão
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados da conta Meta
  meta_user_id TEXT NOT NULL, -- ID do usuário no Facebook/Meta
  meta_user_name TEXT, -- Nome do usuário
  meta_user_email TEXT, -- Email (se autorizado)

  -- Token OAuth (SEMPRE criptografado)
  access_token_encrypted TEXT NOT NULL, -- Token criptografado com AES-256-GCM
  token_expires_at TIMESTAMPTZ NOT NULL, -- Quando o token expira

  -- Permissões concedidas
  granted_scopes TEXT[] DEFAULT ARRAY['ads_read', 'business_management'], -- Scopes autorizados

  -- Assets da conta
  business_ids JSONB DEFAULT '[]'::jsonb, -- IDs dos negócios autorizados
  ad_account_ids JSONB DEFAULT '[]'::jsonb, -- IDs das contas de anúncios
  pixel_ids JSONB DEFAULT '[]'::jsonb, -- IDs dos pixels autorizados

  -- Conta principal selecionada pelo usuário
  primary_ad_account_id TEXT, -- Conta de anúncios principal
  primary_pixel_id TEXT, -- Pixel principal

  -- Status da conexão
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'disconnected', 'error')),
  last_sync_at TIMESTAMPTZ, -- Última vez que sincronizou dados
  error_message TEXT, -- Mensagem de erro se status = error

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_meta_connection UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX idx_meta_connections_user_id ON public.meta_connections(user_id);
CREATE INDEX idx_meta_connections_status ON public.meta_connections(status);
CREATE INDEX idx_meta_connections_token_expires ON public.meta_connections(token_expires_at);

-- RLS (Row Level Security)
ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;

-- Policy: usuário só vê sua própria conexão
CREATE POLICY "Users can view own meta connection"
  ON public.meta_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: usuário só pode inserir sua própria conexão
CREATE POLICY "Users can insert own meta connection"
  ON public.meta_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: usuário só pode atualizar sua própria conexão
CREATE POLICY "Users can update own meta connection"
  ON public.meta_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: usuário só pode deletar sua própria conexão
CREATE POLICY "Users can delete own meta connection"
  ON public.meta_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_meta_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meta_connections_updated_at
  BEFORE UPDATE ON public.meta_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_meta_connections_updated_at();

-- Comentários
COMMENT ON TABLE public.meta_connections IS 'Armazena conexões OAuth dos usuários com Meta Ads (multi-tenant)';
COMMENT ON COLUMN public.meta_connections.access_token_encrypted IS 'Token de acesso SEMPRE criptografado com AES-256-GCM';
COMMENT ON COLUMN public.meta_connections.status IS 'Status: connected, expired, disconnected, error';
COMMENT ON COLUMN public.meta_connections.primary_ad_account_id IS 'Conta de anúncios principal selecionada pelo usuário';
