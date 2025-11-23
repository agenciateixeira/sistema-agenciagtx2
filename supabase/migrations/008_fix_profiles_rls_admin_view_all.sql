-- ========================================
-- FIX: Permitir ADMIN ver todos os perfis
-- ========================================
-- Problema: Política RLS atual só permite ver o próprio perfil
-- Solução: Adicionar política para ADMIN ver todos

-- Remover a política antiga que era muito restritiva
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Criar nova política: Usuários podem ver seu próprio perfil OU
-- ADMINs podem ver todos os perfis
CREATE POLICY "Users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id  -- Pode ver o próprio perfil
    OR
    EXISTS (         -- OU é ADMIN (pode ver todos)
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Comentário explicativo
COMMENT ON POLICY "Users can view profiles" ON public.profiles IS
  'Usuários podem ver seu próprio perfil. ADMINs podem ver todos os perfis da equipe.';
