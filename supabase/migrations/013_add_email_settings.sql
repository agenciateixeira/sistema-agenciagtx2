-- Adicionar configurações de email de recuperação
-- Campos para personalizar o remetente e templates

-- 1. Adicionar campos de configuração de email no profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_recovery_settings JSONB DEFAULT '{
  "sender_email": null,
  "sender_name": null,
  "reply_to": null,
  "enabled": true
}'::jsonb;

-- 2. Adicionar campos de template de email na tabela automated_actions
ALTER TABLE public.automated_actions
ADD COLUMN IF NOT EXISTS email_subject TEXT,
ADD COLUMN IF NOT EXISTS email_body_html TEXT;

-- 3. Comentários explicativos
COMMENT ON COLUMN public.profiles.email_recovery_settings IS 'Configurações de email para recuperação de carrinho: sender_email, sender_name, reply_to, enabled';
COMMENT ON COLUMN public.automated_actions.email_subject IS 'Assunto do email enviado';
COMMENT ON COLUMN public.automated_actions.email_body_html IS 'Corpo HTML do email enviado';
