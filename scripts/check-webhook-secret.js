/**
 * Verificar webhook secret da integração
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bortomadefyundsarhpu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnRvbWFkZWZ5dW5kc2FyaHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA3NzUxOSwiZXhwIjoyMDYyNjUzNTE5fQ.0NlQHZOSdwXTBIm3ir5kXf7HKlhr80Qyy2aeF8fkDfY'
);

async function checkWebhookSecret() {
  console.log('🔐 Verificando webhook secret...');
  console.log('');

  const { data: integration } = await supabase
    .from('integrations')
    .select('id, store_name, webhook_secret')
    .eq('id', '1e371393-e54c-45bd-ad5f-5153c3f4032e')
    .single();

  if (integration) {
    console.log('🏪 Loja:', integration.store_name);
    console.log('🔑 Webhook Secret:', integration.webhook_secret || '❌ NÃO CONFIGURADO');
    console.log('');

    if (!integration.webhook_secret) {
      console.log('⚠️  PROBLEMA ENCONTRADO:');
      console.log('   O webhook_secret está VAZIO na integração!');
      console.log('');
      console.log('📝 Como corrigir:');
      console.log('   1. Acesse Shopify Admin → Settings → Notifications');
      console.log('   2. Role até "Webhooks"');
      console.log('   3. Veja se há um "Webhook secret" configurado');
      console.log('   4. Se não houver, está OK! Shopify usa o API secret key');
      console.log('   5. Se houver, copie e atualize na integração');
    } else {
      console.log('✅ Webhook secret está configurado');
      console.log('');
      console.log('📝 Verifique se este secret está correto na Shopify:');
      console.log('   Shopify Admin → Settings → Notifications → Webhooks');
    }
  }
}

checkWebhookSecret().catch(console.error);
