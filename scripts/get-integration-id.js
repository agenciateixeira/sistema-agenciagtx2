/**
 * Script temporário para buscar ID da integração Shopify
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bortomadefyundsarhpu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnRvbWFkZWZ5dW5kc2FyaHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA3NzUxOSwiZXhwIjoyMDYyNjUzNTE5fQ.0NlQHZOSdwXTBIm3ir5kXf7HKlhr80Qyy2aeF8fkDfY'
);

async function getIntegrationId() {
  const userId = 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c';

  const { data, error } = await supabase
    .from('integrations')
    .select('id, platform, store_name, store_url')
    .eq('user_id', userId)
    .eq('platform', 'shopify');

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('🔍 Integrações encontradas:');
  console.log(JSON.stringify(data, null, 2));

  if (data && data.length > 0) {
    console.log('\n✅ ID da integração:', data[0].id);
    console.log('🏪 Loja:', data[0].store_name);
  }
}

getIntegrationId();
