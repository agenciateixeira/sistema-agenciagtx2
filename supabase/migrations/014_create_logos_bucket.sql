-- ========================================
-- CRIAR BUCKET PARA LOGOS DE LOJAS
-- ========================================
-- Bucket público para armazenar logos das lojas para emails de recuperação

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,  -- Público para que as imagens possam ser acessadas em emails
  2097152,  -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Política: Qualquer usuário autenticado pode fazer upload de sua própria logo
CREATE POLICY "Users can upload their own logo"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Qualquer usuário autenticado pode atualizar sua própria logo
CREATE POLICY "Users can update their own logo"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Qualquer usuário autenticado pode deletar sua própria logo
CREATE POLICY "Users can delete their own logo"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Todos podem ver logos (bucket público)
CREATE POLICY "Anyone can view logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'logos');
