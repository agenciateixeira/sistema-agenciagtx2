-- Adicionar campos de conta de anúncio e integração (loja) aos alertas

ALTER TABLE alert_configs
ADD COLUMN IF NOT EXISTS ad_account_id TEXT,
ADD COLUMN IF NOT EXISTS integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL;

COMMENT ON COLUMN alert_configs.ad_account_id IS 'ID da conta de anúncios do Meta Ads a monitorar';
COMMENT ON COLUMN alert_configs.integration_id IS 'ID da integração (loja) para monitorar carrinhos/conversões';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_alert_configs_ad_account ON alert_configs(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_alert_configs_integration ON alert_configs(integration_id);
