-- Adicionar campos de branding para relatórios na tabela profiles

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS report_logo_url TEXT,
ADD COLUMN IF NOT EXISTS report_company_name TEXT;

COMMENT ON COLUMN profiles.report_logo_url IS 'URL da logo para usar nos relatórios (Supabase Storage)';
COMMENT ON COLUMN profiles.report_company_name IS 'Nome da empresa/agência para exibir nos relatórios';

-- Criar bucket no Supabase Storage para logos
-- (isso deve ser feito manualmente no dashboard do Supabase ou via migrations)
-- Nome do bucket: report-logos
-- Public: true (para poder exibir nos relatórios)
-- Allowed MIME types: image/png, image/jpeg, image/svg+xml
-- Max file size: 2MB
