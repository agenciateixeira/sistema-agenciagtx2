-- Tabela de configurações de alertas
-- Armazena as regras de alertas configuradas por cada usuário

CREATE TABLE IF NOT EXISTS alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de alerta
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'cpc_increase',      -- CPC aumentou X%
    'roas_decrease',     -- ROAS diminuiu X%
    'ctr_decrease',      -- CTR diminuiu X%
    'spend_limit',       -- Gasto atingiu R$ X
    'cart_abandonment',  -- Taxa de abandono acima de X%
    'no_conversions'     -- Sem conversões em X dias
  )),

  -- Nome customizado do alerta
  name TEXT NOT NULL,

  -- Descrição
  description TEXT,

  -- Configurações específicas (JSON)
  -- Ex: { "threshold": 20, "period": "24h", "metric": "cpc" }
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Status do alerta
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Frequência de checagem
  check_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (check_frequency IN ('hourly', 'daily', 'weekly')),

  -- Canais de notificação
  notification_channels JSONB NOT NULL DEFAULT '["email"]'::jsonb,

  -- Última vez que foi checado
  last_checked_at TIMESTAMP WITH TIME ZONE,

  -- Última vez que foi disparado
  last_triggered_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_alert_configs_user_id ON alert_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_configs_active ON alert_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_alert_configs_type ON alert_configs(alert_type);

-- Tabela de histórico de alertas disparados
-- Armazena cada vez que um alerta foi disparado

CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_config_id UUID NOT NULL REFERENCES alert_configs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados do momento que disparou
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Valores que causaram o alerta
  trigger_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Ex: { "current_cpc": 2.50, "previous_cpc": 2.00, "increase_percentage": 25 }

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'dismissed')),

  -- Mensagem enviada
  message TEXT,

  -- Visto pelo usuário?
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_alert_history_user_id ON alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_config_id ON alert_history(alert_config_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered ON alert_history(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_unread ON alert_history(is_read) WHERE is_read = false;

-- Row Level Security (RLS)

ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- Policies para alert_configs

CREATE POLICY "Users can view their own alert configs"
ON alert_configs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alert configs"
ON alert_configs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert configs"
ON alert_configs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert configs"
ON alert_configs FOR DELETE
USING (auth.uid() = user_id);

-- Policies para alert_history

CREATE POLICY "Users can view their own alert history"
ON alert_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert history"
ON alert_history FOR UPDATE
USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para alert_configs

CREATE TRIGGER update_alert_configs_updated_at
BEFORE UPDATE ON alert_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação

COMMENT ON TABLE alert_configs IS 'Configurações de alertas personalizados por usuário';
COMMENT ON TABLE alert_history IS 'Histórico de alertas disparados';

COMMENT ON COLUMN alert_configs.alert_type IS 'Tipo do alerta: cpc_increase, roas_decrease, ctr_decrease, spend_limit, cart_abandonment, no_conversions';
COMMENT ON COLUMN alert_configs.config IS 'Configurações específicas do alerta em JSON (threshold, period, etc)';
COMMENT ON COLUMN alert_configs.check_frequency IS 'Frequência de checagem: hourly, daily, weekly';
COMMENT ON COLUMN alert_configs.notification_channels IS 'Canais de notificação: ["email", "in_app", "webhook"]';

COMMENT ON COLUMN alert_history.trigger_data IS 'Dados que causaram o disparo do alerta (valores atuais vs anteriores)';
COMMENT ON COLUMN alert_history.status IS 'Status da notificação: pending, sent, failed, dismissed';
