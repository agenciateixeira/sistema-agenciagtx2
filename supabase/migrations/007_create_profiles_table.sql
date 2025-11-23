-- Tabela de perfis dos usuários (separada de auth.users)
-- Esta tabela armazena informações adicionais dos usuários

-- Criar enum de roles se não existir
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'VIEWER',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
-- 1. Service role pode tudo (usado no accept-invite)
CREATE POLICY "Service role can do anything"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Permitir INSERT durante registro (via service_role ou authenticated)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Comentários na tabela
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários com informações adicionais além do auth.users';
COMMENT ON COLUMN public.profiles.id IS 'FK para auth.users(id), deletado em cascata';
COMMENT ON COLUMN public.profiles.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.role IS 'Nível de permissão: VIEWER, EDITOR ou ADMIN';
