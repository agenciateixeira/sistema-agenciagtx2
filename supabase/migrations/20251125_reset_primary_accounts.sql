-- Limpa primary_ad_account_id e primary_pixel_id para forçar usuários a escolherem
-- Isso permite que o seletor de contas apareça para todos

UPDATE public.meta_connections
SET
  primary_ad_account_id = NULL,
  primary_pixel_id = NULL
WHERE
  primary_ad_account_id IS NOT NULL
  OR primary_pixel_id IS NOT NULL;
