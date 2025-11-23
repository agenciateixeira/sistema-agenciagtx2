-- ========================================
-- VERIFICAÇÃO SIMPLES (sem erros de case)
-- ========================================

-- 1. Ver todos os perfis (MAIS IMPORTANTE)
SELECT
  p.id,
  p.nome,
  p.role,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- 2. Resumo geral
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_usuarios_auth,
  (SELECT COUNT(*) FROM public.profiles) as total_perfis,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'ADMIN') as admins,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'EDITOR') as editors,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'VIEWER') as viewers;

-- 3. Ver se a política RLS nova está ativa
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
