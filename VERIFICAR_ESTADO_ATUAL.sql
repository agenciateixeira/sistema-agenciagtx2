-- ========================================
-- VERIFICAR ESTADO ATUAL DO SISTEMA
-- ========================================
-- Execute este SQL para ver se está tudo OK

-- 1. Ver todos os perfis (deve mostrar 2)
SELECT
  p.id,
  p.nome,
  p.role,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- 2. Verificar se a nova política RLS existe
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname = 'Users can view profiles';

-- 3. Ver usuários SEM perfil (órfãos que podem ser deletados)
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 4. Ver convites pendentes
SELECT
  id,
  email,
  name,
  role,
  status,
  invitedAt,
  expiresAt
FROM public."TeamInvite"
WHERE status = 'PENDING'
ORDER BY invitedAt DESC;

-- 5. Resumo geral
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_usuarios_auth,
  (SELECT COUNT(*) FROM public.profiles) as total_perfis,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'ADMIN') as admins,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'EDITOR') as editors,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'VIEWER') as viewers,
  (SELECT COUNT(*) FROM public."TeamInvite" WHERE status = 'PENDING') as convites_pendentes;
