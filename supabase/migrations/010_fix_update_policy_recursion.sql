-- ========================================
-- FIX: Recursão infinita na policy de UPDATE
-- ========================================
-- O problema é que a policy está verificando a tabela profiles
-- dentro da própria query de UPDATE, causando recursão

-- Remover policy problemática
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Criar policy simples sem recursão
-- Usando apenas auth.uid() diretamente (não consulta a tabela)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())           -- Simples: só o próprio user
  WITH CHECK (id = auth.uid());      -- Garante que não muda o ID

-- Verificar políticas finais
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
