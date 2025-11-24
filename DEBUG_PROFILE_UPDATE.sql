-- ========================================
-- DEBUG: Verificar o que está bloqueando UPDATE
-- ========================================

-- 1. Ver TODAS as policies de profiles (inclusive conflitantes)
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

-- 2. Ver se há VIEWS com regras que possam interferir
SELECT
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE '%profile%';

-- 3. Testar UPDATE diretamente (substitua pelo seu user ID)
-- IMPORTANTE: Execute isso primeiro para pegar seu ID:
SELECT auth.uid() as my_user_id;

-- Depois execute o UPDATE (substitua 'SEU_ID_AQUI' pelo resultado acima):
-- UPDATE public.profiles
-- SET nome = 'Teste Update Debug', updated_at = NOW()
-- WHERE id = 'SEU_ID_AQUI';

-- 4. Ver se há triggers que podem causar erro
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 5. Ver constraints da tabela
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;
