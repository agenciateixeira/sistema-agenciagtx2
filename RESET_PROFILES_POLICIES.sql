-- ========================================
-- RESET COMPLETO: Limpar e recriar policies
-- ========================================

-- 1. REMOVER TODAS AS POLICIES ANTIGAS (menos service_role)
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

-- 2. RECRIAR POLICIES SIMPLES E FUNCIONAIS

-- SELECT: Ver próprio perfil OU ser ADMIN (vê todos)
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()  -- Próprio perfil
    OR
    EXISTS (  -- OU é ADMIN
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

-- INSERT: Só ao criar conta (trigger do Supabase Auth)
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: Só pode atualizar próprio perfil
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. VERIFICAR RESULTADO
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 4. TESTAR UPDATE (substitua pelo seu ID)
-- Primeiro descubra seu ID:
SELECT auth.uid() as meu_user_id;

-- Depois teste o UPDATE:
-- UPDATE public.profiles
-- SET nome = 'Teste Final', updated_at = NOW()
-- WHERE id = auth.uid();
