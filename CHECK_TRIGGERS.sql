-- ========================================
-- VERIFICAR TRIGGERS AUTOMÁTICOS
-- ========================================
-- Execute este SQL no Supabase Dashboard para verificar
-- se há triggers criando perfis automaticamente

-- 1. Verificar triggers na tabela auth.users
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';

-- 2. Verificar funções que mencionam 'profiles'
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition ILIKE '%profiles%'
  AND routine_type = 'FUNCTION';

-- 3. Ver quantos perfis órfãos existem
-- (perfis que não têm usuário correspondente)
SELECT COUNT(*) as perfis_orfaos
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE u.id IS NULL;

-- 4. Ver quantos usuários não têm perfil
SELECT COUNT(*) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 5. Listar últimos 10 perfis criados
SELECT
  p.id,
  p.nome,
  p.role,
  u.email,
  p.created_at,
  CASE
    WHEN u.id IS NULL THEN '❌ Órfão (usuário não existe)'
    ELSE '✅ OK'
  END as status
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC
LIMIT 10;
