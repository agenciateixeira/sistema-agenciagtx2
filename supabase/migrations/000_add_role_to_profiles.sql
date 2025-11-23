-- Adicionar coluna role na tabela profiles (se não existir)

-- Criar enum para roles (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');
  END IF;
END$$;

-- Adicionar coluna role se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'VIEWER' NOT NULL;
  END IF;
END$$;

-- Criar índice para role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Atualizar roles existentes (opcional - ajuste conforme necessário)
-- Se quiser que o primeiro usuário seja admin:
UPDATE profiles
SET role = 'ADMIN'
WHERE id IN (
  SELECT id FROM profiles
  ORDER BY created_at ASC
  LIMIT 1
) AND role = 'VIEWER';

-- Comentários
COMMENT ON COLUMN profiles.role IS 'Nível de acesso do usuário: VIEWER (visualização), EDITOR (edição), ADMIN (administração completa)';
