-- ========================================
-- FIX: Política RLS para UPDATE de profiles
-- ========================================
-- Garantir que usuários podem atualizar seu próprio perfil

-- Verificar políticas atuais
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- Remover políticas de UPDATE antigas/duplicadas
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

-- Criar política correta de UPDATE
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)       -- Pode atualizar se é o próprio usuário
  WITH CHECK (auth.uid() = id); -- Garantir que não mude o ID

-- Verificar se ficou correto
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Testar UPDATE (substitua pelo seu ID real)
-- UPDATE public.profiles
-- SET nome = 'Teste Update', updated_at = NOW()
-- WHERE id = auth.uid();
