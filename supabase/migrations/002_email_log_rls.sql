-- Habilitar Row Level Security na tabela EmailLog
ALTER TABLE "EmailLog" ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir inserção apenas para service_role (sistema)
CREATE POLICY "Sistema pode inserir emails"
  ON "EmailLog"
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Permitir atualização apenas para service_role (webhooks)
CREATE POLICY "Sistema pode atualizar emails"
  ON "EmailLog"
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Usuários autenticados podem ver seus próprios emails
CREATE POLICY "Usuários podem ver seus emails"
  ON "EmailLog"
  FOR SELECT
  TO authenticated
  USING (
    "to" = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Policy: Admins podem ver todos os emails
CREATE POLICY "Admins podem ver todos emails"
  ON "EmailLog"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Comentário
COMMENT ON POLICY "Sistema pode inserir emails" ON "EmailLog" IS 'Apenas o sistema (service_role) pode inserir logs de email';
COMMENT ON POLICY "Usuários podem ver seus emails" ON "EmailLog" IS 'Usuários só podem ver emails enviados para o endereço da conta deles';
COMMENT ON POLICY "Admins podem ver todos emails" ON "EmailLog" IS 'Administradores podem ver todos os emails do sistema';
