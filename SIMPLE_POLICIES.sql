-- ========================================
-- POLICIES ULTRA SIMPLES (sem subqueries)
-- ========================================

-- 1. REMOVER TODAS
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. CRIAR POLICIES SIMPLES

-- SELECT: Todo mundo autenticado vê todos os perfis (simplificado)
CREATE POLICY "allow_select_profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);  -- Todos veem todos (simplificado para debug)

-- INSERT: Só pode inserir próprio perfil
CREATE POLICY "allow_insert_own_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Só pode atualizar próprio perfil (SEM subquery)
CREATE POLICY "allow_update_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. VERIFICAR
SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 4. TESTAR UPDATE manualmente (se quiser - precisa autenticação)
-- UPDATE public.profiles
-- SET nome = 'Teste Manual'
-- WHERE id = 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c';
