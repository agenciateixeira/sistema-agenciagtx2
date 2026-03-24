-- Creative Analysis: Análise de IA dos criativos
-- Armazena atributos tangíveis e intangíveis extraídos por modelos de IA

CREATE TABLE IF NOT EXISTS public.creative_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id TEXT NOT NULL, -- ID do anúncio no Meta
  ad_account_id TEXT NOT NULL,
  creative_url TEXT NOT NULL, -- URL da imagem/vídeo
  creative_type TEXT NOT NULL, -- 'image', 'video', 'carousel'

  -- Modelo de IA utilizado
  model_used TEXT NOT NULL, -- 'gpt-4o', 'gemini-1.5-pro', 'claude-3.5-sonnet', etc
  model_version TEXT,

  -- ATRIBUTOS TANGÍVEIS (Visão Computacional)
  tangible_attributes JSONB DEFAULT '{}'::jsonb,
  -- Estrutura:
  -- {
  --   "colors": {"dominant": "#FF5733", "palette": ["#FF5733", "#C70039"]},
  --   "objects": ["person", "product", "text_overlay"],
  --   "faces_count": 1,
  --   "has_logo": true,
  --   "text_detected": ["50% OFF", "Compre Agora"],
  --   "composition": {"rule_of_thirds": true, "symmetry": false},
  --   "brightness": 0.75,
  --   "contrast": 0.82
  -- }

  -- ATRIBUTOS INTANGÍVEIS (Raciocínio Criativo)
  intangible_attributes JSONB DEFAULT '{}'::jsonb,
  -- Estrutura:
  -- {
  --   "emotion": "urgency", // urgency, joy, fear, trust
  --   "tone": "commercial", // commercial, ugc, native, educational
  --   "aesthetic_score": 8.5, // 1-10
  --   "professionalism": 7.0, // 1-10
  --   "authenticity": 6.5, // 1-10 (quanto mais "real", menos "ad")
  --   "hook_strength": 9.0, // 1-10 (primeiros 3s)
  --   "information_density": "medium", // low, medium, high
  --   "cta_prominence": 8.0, // 1-10 (quão visível é o CTA)
  --   "narrative_flow": "problem_solution" // storytelling structure
  -- }

  -- ANÁLISE DE VÍDEO (se aplicável)
  video_analysis JSONB DEFAULT '{}'::jsonb,
  -- Estrutura:
  -- {
  --   "duration_seconds": 30,
  --   "hook_analysis": {
  --     "first_3s": "fast_motion + face_closeup + bold_text",
  --     "hook_score": 9.0,
  --     "attention_grabbers": ["quick_cuts", "unexpected_sound"]
  --   },
  --   "pacing": "fast", // slow, medium, fast
  --   "scene_changes": 12,
  --   "text_on_screen_percentage": 65,
  --   "product_screen_time_seconds": 18
  -- }

  -- ANÁLISE TEXTUAL (Headlines, Body Copy)
  text_analysis JSONB DEFAULT '{}'::jsonb,
  -- Estrutura:
  -- {
  --   "headline": "Perca 10kg em 30 dias!",
  --   "headline_length": 22,
  --   "headline_sentiment": "positive",
  --   "uses_numbers": true,
  --   "uses_emoji": false,
  --   "urgency_words": ["agora", "limitado"],
  --   "power_words": ["garantido", "comprovado"],
  --   "body_copy_length": 156,
  --   "reading_ease_score": 72.5 // Flesch Reading Ease
  -- }

  -- CORRELAÇÃO COM PERFORMANCE (preenchido após cruzamento)
  performance_correlation JSONB DEFAULT '{}'::jsonb,
  -- Estrutura:
  -- {
  --   "predicted_ctr": 2.8,
  --   "predicted_cpa": 45.00,
  --   "similar_creatives_avg_ctr": 2.5,
  --   "confidence_score": 0.85,
  --   "strengths": ["strong_hook", "clear_cta", "authentic_tone"],
  --   "weaknesses": ["low_contrast", "information_overload"],
  --   "recommendations": [
  --     "Aumentar contraste do botão CTA em 30%",
  --     "Reduzir texto na tela em 40%"
  --   ]
  -- }

  -- Raw response do modelo (para debug)
  raw_response TEXT,

  -- Metadados
  analysis_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  processing_time_ms INTEGER,
  cost_usd DECIMAL(10, 4), -- Custo da API call

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_creative_analysis_user_id ON public.creative_analysis(user_id);
CREATE INDEX idx_creative_analysis_ad_id ON public.creative_analysis(ad_id);
CREATE INDEX idx_creative_analysis_ad_account_id ON public.creative_analysis(ad_account_id);
CREATE INDEX idx_creative_analysis_status ON public.creative_analysis(analysis_status);
CREATE INDEX idx_creative_analysis_created_at ON public.creative_analysis(created_at DESC);

-- GIN indexes para busca em JSONB
CREATE INDEX idx_creative_analysis_tangible ON public.creative_analysis USING GIN (tangible_attributes);
CREATE INDEX idx_creative_analysis_intangible ON public.creative_analysis USING GIN (intangible_attributes);

-- RLS Policies
ALTER TABLE public.creative_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
  ON public.creative_analysis
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON public.creative_analysis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
  ON public.creative_analysis
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_creative_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_creative_analysis_updated_at
  BEFORE UPDATE ON public.creative_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_creative_analysis_updated_at();

-- View para análises com performance atual
CREATE OR REPLACE VIEW creative_analysis_with_performance AS
SELECT
  ca.*,
  -- Aqui você pode fazer JOIN com suas tabelas de métricas do Meta
  -- para correlacionar análise de IA com performance real
  NULL::numeric AS actual_ctr,
  NULL::numeric AS actual_cpa,
  NULL::numeric AS actual_conversions
FROM creative_analysis ca;

COMMENT ON TABLE public.creative_analysis IS 'Análises de IA dos criativos do Meta Ads com atributos tangíveis e intangíveis';
COMMENT ON COLUMN public.creative_analysis.tangible_attributes IS 'Atributos visuais objetivos: cores, objetos, faces, composição';
COMMENT ON COLUMN public.creative_analysis.intangible_attributes IS 'Atributos subjetivos: emoção, tom, estética, autenticidade';
COMMENT ON COLUMN public.creative_analysis.video_analysis IS 'Análise específica para vídeos: hook, pacing, scene changes';
COMMENT ON COLUMN public.creative_analysis.performance_correlation IS 'Correlação com performance e recomendações de IA';
