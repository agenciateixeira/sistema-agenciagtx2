-- ========================================
-- DEBUG COMPLETO: Encontrar causa do erro 500
-- ========================================

-- 1. Verificar estrutura da tabela profiles
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar se há TRIGGERS (podem causar erro 500)
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- 3. Testar UPDATE direto (bypass RLS - usando service_role)
-- SUBSTITUA 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c' pelo seu ID real
UPDATE public.profiles
SET nome = 'Teste Service Role', updated_at = NOW()
WHERE id = 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c';

-- 4. Verificar se o update funcionou
SELECT id, nome, email, role, updated_at
FROM public.profiles_with_email
WHERE id = 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c';

-- 5. Ver logs de erro (se disponível)
-- No dashboard do Supabase, vá em: Logs > Postgres Logs
-- Procure por erros com timestamp recente
