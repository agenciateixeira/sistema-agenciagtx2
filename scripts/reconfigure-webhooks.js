/**
 * Script para reconfigurar webhooks no Shopify com domínio correto
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bortomadefyundsarhpu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnRvbWFkZWZ5dW5kc2FyaHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA3NzUxOSwiZXhwIjoyMDYyNjUzNTE5fQ.0NlQHZOSdwXTBIm3ir5kXf7HKlhr80Qyy2aeF8fkDfY'
);

const INTEGRATION_ID = '1e371393-e54c-45bd-ad5f-5153c3f4032e';
const WEBHOOK_URL = 'https://app.agenciagtx.com.br/api/webhook/shopify';

async function reconfigureWebhooks() {
  console.log('🔧 Reconfigurando webhooks...');
  console.log('📍 Integration ID:', INTEGRATION_ID);
  console.log('🌐 Webhook URL:', WEBHOOK_URL);
  console.log('');

  // Buscar integração
  const { data: integration, error: fetchError } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', INTEGRATION_ID)
    .single();

  if (fetchError || !integration) {
    console.error('❌ Erro ao buscar integração:', fetchError);
    return;
  }

  console.log('🏪 Loja:', integration.store_name);
  console.log('🔗 URL:', integration.store_url);
  console.log('');

  const storeUrl = integration.store_url.replace('https://', '').replace('http://', '');
  const shopDomain = storeUrl.split('/')[0];

  // 1. Listar webhooks existentes
  console.log('📋 Listando webhooks existentes...');
  const listResponse = await fetch(
    `https://${shopDomain}/admin/api/2024-10/webhooks.json`,
    {
      headers: {
        'X-Shopify-Access-Token': integration.api_key,
      },
    }
  );

  const listData = await listResponse.json();
  const existingWebhooks = listData.webhooks || [];

  console.log(`   Encontrados ${existingWebhooks.length} webhooks:`);
  existingWebhooks.forEach((w) => {
    console.log(`   - ${w.topic} → ${w.address} (ID: ${w.id})`);
  });
  console.log('');

  // 2. Deletar webhooks antigos do sistema (com domínio Vercel)
  const oldDomainWebhooks = existingWebhooks.filter(
    (w) => w.address.includes('sistema-agenciagtx2.vercel.app')
  );

  if (oldDomainWebhooks.length > 0) {
    console.log(`🗑️  Removendo ${oldDomainWebhooks.length} webhooks com domínio antigo...`);

    for (const webhook of oldDomainWebhooks) {
      console.log(`   Deletando: ${webhook.topic} (ID: ${webhook.id})`);

      const deleteResponse = await fetch(
        `https://${shopDomain}/admin/api/2024-10/webhooks/${webhook.id}.json`,
        {
          method: 'DELETE',
          headers: {
            'X-Shopify-Access-Token': integration.api_key,
          },
        }
      );

      if (deleteResponse.ok) {
        console.log(`   ✅ Deletado com sucesso`);
      } else {
        const errorData = await deleteResponse.json();
        console.error(`   ❌ Erro ao deletar:`, errorData);
      }
    }
    console.log('');
  }

  // 3. Criar novos webhooks com domínio correto
  const topics = ['checkouts/create', 'checkouts/update', 'orders/create'];

  console.log('📡 Criando webhooks com domínio correto...');

  for (const topic of topics) {
    // Verificar se já existe
    const exists = existingWebhooks.find(
      (w) => w.topic === topic && w.address === WEBHOOK_URL
    );

    if (exists) {
      console.log(`   ✅ ${topic} já existe (ID: ${exists.id})`);
      continue;
    }

    console.log(`   Criando: ${topic}`);

    const createResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-10/webhooks.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': integration.api_key,
        },
        body: JSON.stringify({
          webhook: {
            topic,
            address: WEBHOOK_URL,
            format: 'json',
          },
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error(`   ❌ Erro ao criar:`, createData);
    } else {
      console.log(`   ✅ Criado com sucesso (ID: ${createData.webhook.id})`);
    }
  }

  console.log('');
  console.log('🎉 Reconfiguração concluída!');
  console.log('');
  console.log('📝 Próximos passos:');
  console.log('1. Crie um novo checkout na loja Shopify com um email real');
  console.log('2. Abandone o carrinho (não finalize a compra)');
  console.log('3. Aguarde 1-2 minutos');
  console.log('4. Verifique se o webhook chegou usando:');
  console.log('   curl "https://app.agenciagtx.com.br/api/debug/recovery-status?userId=ebe65fa6-f26b-4686-8ac2-557d03c89a6c"');
}

reconfigureWebhooks().catch(console.error);
