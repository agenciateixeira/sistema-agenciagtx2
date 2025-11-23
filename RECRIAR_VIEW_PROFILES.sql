-- ========================================
-- RECRIAR VIEW profiles_with_email
-- ========================================
-- Use CREATE OR REPLACE para forçar recriação

-- Recriar a view (substitui se já existir)
CREATE OR REPLACE VIEW public.profiles_with_email AS
SELECT
  p.id,
  p.nome,
  p.role,
  p.avatar_url,
  p.created_at,
  p.updated_at,
  u.email,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;

-- Dar permissões
GRANT SELECT ON public.profiles_with_email TO authenticated;
GRANT SELECT ON public.profiles_with_email TO service_role;

-- Testar a view
SELECT
  id,
  nome,
  email,
  role,
  created_at
FROM public.profiles_with_email
ORDER BY created_at DESC;
