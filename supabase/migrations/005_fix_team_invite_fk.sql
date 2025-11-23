-- Corrigir foreign key do TeamInvite para referenciar profiles ao invés de auth.users
-- Isso evita problemas de permissão com RLS

-- Remover constraint antiga
ALTER TABLE "TeamInvite" DROP CONSTRAINT IF EXISTS fk_invited_by;

-- Adicionar nova constraint referenciando profiles
ALTER TABLE "TeamInvite"
  ADD CONSTRAINT fk_invited_by
  FOREIGN KEY ("invitedBy")
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Comentário
COMMENT ON CONSTRAINT fk_invited_by ON "TeamInvite" IS 'Referencia profiles ao invés de auth.users para evitar problemas de RLS';
