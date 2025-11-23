-- Corrigir políticas RLS que tentam acessar auth.users diretamente
-- Trocar por profiles para evitar erro "permission denied for table users"

-- 1. Corrigir política do TeamInvite
DROP POLICY IF EXISTS "Usuários podem ver convites para eles" ON "TeamInvite";

CREATE POLICY "Usuários podem ver convites para eles"
  ON "TeamInvite"
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
    AND status = 'PENDING'
  );

COMMENT ON POLICY "Usuários podem ver convites para eles" ON "TeamInvite" IS 'Permite ver convites pendentes enviados para o email do usuário (usando profiles ao invés de auth.users)';

-- 2. Corrigir política do EmailLog
DROP POLICY IF EXISTS "Usuários podem ver seus emails" ON "EmailLog";

CREATE POLICY "Usuários podem ver seus emails"
  ON "EmailLog"
  FOR SELECT
  TO authenticated
  USING (
    "to" = (SELECT email FROM profiles WHERE id = auth.uid())
  );

COMMENT ON POLICY "Usuários podem ver seus emails" ON "EmailLog" IS 'Usuários só podem ver emails enviados para o endereço da conta deles (usando profiles ao invés de auth.users)';
