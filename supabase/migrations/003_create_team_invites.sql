-- Criar enum para status de convite (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
    CREATE TYPE invite_status AS ENUM (
      'PENDING',
      'ACCEPTED',
      'EXPIRED',
      'CANCELLED'
    );
  END IF;
END$$;

-- Criar tabela TeamInvite para rastrear convites pendentes (se não existir)
CREATE TABLE IF NOT EXISTS "TeamInvite" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
  status invite_status DEFAULT 'PENDING' NOT NULL,
  "invitedBy" UUID NOT NULL, -- ID do usuário que enviou o convite
  "invitedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "expiresAt" TIMESTAMPTZ, -- Data de expiração (opcional)
  "acceptedAt" TIMESTAMPTZ,
  "cancelledAt" TIMESTAMPTZ,
  token VARCHAR(255) UNIQUE, -- Token único para aceitar convite
  metadata JSONB, -- Dados adicionais

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key para o usuário que convidou
  CONSTRAINT fk_invited_by FOREIGN KEY ("invitedBy") REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_team_invite_email ON "TeamInvite"(email);
CREATE INDEX IF NOT EXISTS idx_team_invite_status ON "TeamInvite"(status);
CREATE INDEX IF NOT EXISTS idx_team_invite_invited_by ON "TeamInvite"("invitedBy");
CREATE INDEX IF NOT EXISTS idx_team_invite_token ON "TeamInvite"(token);
CREATE INDEX IF NOT EXISTS idx_team_invite_expires_at ON "TeamInvite"("expiresAt") WHERE "expiresAt" IS NOT NULL;

-- Criar trigger para updated_at
CREATE TRIGGER update_team_invite_updated_at
  BEFORE UPDATE ON "TeamInvite"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar função para expirar convites automaticamente
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
  UPDATE "TeamInvite"
  SET status = 'EXPIRED'
  WHERE status = 'PENDING'
    AND "expiresAt" IS NOT NULL
    AND "expiresAt" < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE "TeamInvite" IS 'Armazena convites de equipe enviados por email, rastreando status e aceitação';
COMMENT ON COLUMN "TeamInvite".token IS 'Token único gerado para aceitar o convite via link';
COMMENT ON COLUMN "TeamInvite"."expiresAt" IS 'Data de expiração do convite (padrão: 7 dias)';
COMMENT ON COLUMN "TeamInvite".metadata IS 'Informações adicionais como emailId do Resend, tentativas de envio, etc';
