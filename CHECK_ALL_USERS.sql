-- ========================================
-- VERIFICAR TODOS OS USUÁRIOS DO SISTEMA
-- ========================================
-- Execute este SQL no Supabase Dashboard

-- 1. Ver TODOS os usuários no auth.users
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver TODOS os perfis na tabela profiles
SELECT
  p.id,
  p.nome,
  p.role,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- 3. Verificar se há usuários SEM perfil
SELECT
  u.id,
  u.email,
  u.created_at,
  'SEM PERFIL' as status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Verificar políticas RLS da tabela profiles
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
WHERE tablename = 'profiles';

-- 5. Contar usuários
SELECT
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) as usuarios_com_perfil,
  COUNT(*) FILTER (WHERE p.id IS NULL) as usuarios_sem_perfil,
  COUNT(*) as total_usuarios_auth
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id;
