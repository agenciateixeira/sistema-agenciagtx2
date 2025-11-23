-- Habilitar Row Level Security na tabela TeamInvite
ALTER TABLE "TeamInvite" ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ver convites que eles enviaram
CREATE POLICY "Usuários podem ver convites enviados por eles"
  ON "TeamInvite"
  FOR SELECT
  TO authenticated
  USING (
    "invitedBy" = auth.uid()
  );

-- Policy: Usuários podem ver convites pendentes para o próprio email
CREATE POLICY "Usuários podem ver convites para eles"
  ON "TeamInvite"
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'PENDING'
  );

-- Policy: Admins podem ver todos os convites
CREATE POLICY "Admins podem ver todos convites"
  ON "TeamInvite"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Policy: Usuários autenticados podem criar convites
CREATE POLICY "Usuários podem criar convites"
  ON "TeamInvite"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "invitedBy" = auth.uid()
  );

-- Policy: Usuários podem atualizar convites que eles enviaram
CREATE POLICY "Usuários podem atualizar seus convites"
  ON "TeamInvite"
  FOR UPDATE
  TO authenticated
  USING (
    "invitedBy" = auth.uid()
  )
  WITH CHECK (
    "invitedBy" = auth.uid()
  );

-- Policy: Admins podem atualizar qualquer convite
CREATE POLICY "Admins podem atualizar convites"
  ON "TeamInvite"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (true);

-- Policy: Usuários podem deletar convites que eles enviaram (cancelar)
CREATE POLICY "Usuários podem deletar seus convites"
  ON "TeamInvite"
  FOR DELETE
  TO authenticated
  USING (
    "invitedBy" = auth.uid()
  );

-- Policy: Admins podem deletar qualquer convite
CREATE POLICY "Admins podem deletar convites"
  ON "TeamInvite"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Comentários
COMMENT ON POLICY "Usuários podem ver convites enviados por eles" ON "TeamInvite" IS 'Permite ver convites que o próprio usuário enviou';
COMMENT ON POLICY "Usuários podem ver convites para eles" ON "TeamInvite" IS 'Permite ver convites pendentes enviados para o email do usuário';
COMMENT ON POLICY "Admins podem ver todos convites" ON "TeamInvite" IS 'Administradores veem todos os convites do sistema';
