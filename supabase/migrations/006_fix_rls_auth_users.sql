-- Corrigir políticas RLS que tentam acessar auth.users diretamente
-- Usar auth.email() que pega o email direto do JWT do Supabase Auth

-- 1. Corrigir política do TeamInvite
DROP POLICY IF EXISTS "Usuários podem ver convites para eles" ON "TeamInvite";

CREATE POLICY "Usuários podem ver convites para eles"
  ON "TeamInvite"
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email()
    AND status = 'PENDING'
  );

COMMENT ON POLICY "Usuários podem ver convites para eles" ON "TeamInvite" IS 'Permite ver convites pendentes enviados para o email do usuário (usando auth.email())';

-- 2. Corrigir política do EmailLog
DROP POLICY IF EXISTS "Usuários podem ver seus emails" ON "EmailLog";

CREATE POLICY "Usuários podem ver seus emails"
  ON "EmailLog"
  FOR SELECT
  TO authenticated
  USING (
    "to" = auth.email()
  );

COMMENT ON POLICY "Usuários podem ver seus emails" ON "EmailLog" IS 'Usuários só podem ver emails enviados para o endereço da conta deles (usando auth.email())';
