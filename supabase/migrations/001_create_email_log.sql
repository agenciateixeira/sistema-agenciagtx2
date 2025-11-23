-- Criar enum para status de email (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_status') THEN
    CREATE TYPE email_status AS ENUM (
      'SENT',
      'DELIVERED',
      'OPENED',
      'CLICKED',
      'BOUNCED',
      'COMPLAINED',
      'FAILED'
    );
  END IF;
END$$;

-- Criar enum para tipo de email (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type') THEN
    CREATE TYPE email_type AS ENUM (
      'TEAM_INVITE',
      'NOTIFICATION',
      'REPORT'
    );
  END IF;
END$$;

-- Criar tabela EmailLog para tracking de emails (se não existir)
CREATE TABLE IF NOT EXISTS "EmailLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emailId" VARCHAR(255) UNIQUE NOT NULL, -- ID do Resend
  type email_type NOT NULL,
  "to" VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  status email_status DEFAULT 'SENT' NOT NULL,
  "sentAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "deliveredAt" TIMESTAMPTZ,
  "openedAt" TIMESTAMPTZ,
  "clickedAt" TIMESTAMPTZ,
  "bouncedAt" TIMESTAMPTZ,
  metadata JSONB,
  events JSONB[] DEFAULT ARRAY[]::JSONB[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_email_log_email_id ON "EmailLog"("emailId");
CREATE INDEX IF NOT EXISTS idx_email_log_to ON "EmailLog"("to");
CREATE INDEX IF NOT EXISTS idx_email_log_status ON "EmailLog"(status);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON "EmailLog"("sentAt" DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON "EmailLog"(type);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
CREATE TRIGGER update_email_log_updated_at
  BEFORE UPDATE ON "EmailLog"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE "EmailLog" IS 'Armazena todos os emails enviados pelo sistema e seus eventos de tracking via webhook do Resend';
COMMENT ON COLUMN "EmailLog"."emailId" IS 'ID único retornado pelo Resend quando o email é enviado';
COMMENT ON COLUMN "EmailLog".events IS 'Array de eventos recebidos via webhook (sent, delivered, opened, clicked, bounced, complained)';
COMMENT ON COLUMN "EmailLog".metadata IS 'Dados adicionais como nome do destinatário, tipo de relatório, etc';
