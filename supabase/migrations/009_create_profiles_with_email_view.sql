-- ========================================
-- CREATE VIEW: profiles_with_email
-- ========================================
-- View que junta profiles com auth.users para pegar o email

-- Remover view antiga se existir
DROP VIEW IF EXISTS public.profiles_with_email CASCADE;

-- Criar view que une profiles com auth.users
CREATE VIEW public.profiles_with_email AS
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

-- Comentário
COMMENT ON VIEW public.profiles_with_email IS
  'View que une profiles com auth.users para obter email e dados de login';

-- Habilitar RLS na view (herda das tabelas base)
ALTER VIEW public.profiles_with_email SET (security_invoker = true);

-- Dar permissão para authenticated users
GRANT SELECT ON public.profiles_with_email TO authenticated;
GRANT SELECT ON public.profiles_with_email TO service_role;
