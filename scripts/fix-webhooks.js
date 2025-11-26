/**
 * Script para DELETAR webhooks com domínio Vercel e criar novos com domínio correto
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bortomadefyundsarhpu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnRvbWFkZWZ5dW5kc2FyaHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA3NzUxOSwiZXhwIjoyMDYyNjUzNTE5fQ.0NlQHZOSdwXTBIm3ir5kXf7HKlhr80Qyy2aeF8fkDfY'
);

const INTEGRATION_ID = '1e371393-e54c-45bd-ad5f-5153c3f4032e';
const OLD_WEBHOOK_URL = 'https://sistema-agenciagtx2.vercel.app/api/webhook/shopify';
const NEW_WEBHOOK_URL = 'https://app.agenciagtx.com.br/api/webhook/shopify';

async function fixWebhooks() {
  console.log('🔧 Corrigindo webhooks...');
  console.log('❌ Domínio antigo:', OLD_WEBHOOK_URL);
  console.log('✅ Domínio novo:', NEW_WEBHOOK_URL);
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

  const storeUrl = integration.store_url.replace('https://', '').replace('http://', '');
  const shopDomain = storeUrl.split('/')[0];

  // 1. Listar TODOS os webhooks
  console.log('📋 Listando todos os webhooks...');
  const listResponse = await fetch(
    `https://${shopDomain}/admin/api/2024-10/webhooks.json`,
    {
      headers: {
        'X-Shopify-Access-Token': integration.api_key,
      },
    }
  );

  const listData = await listResponse.json();
  const allWebhooks = listData.webhooks || [];

  console.log(`   Total de webhooks: ${allWebhooks.length}`);
  allWebhooks.forEach((w) => {
    const emoji = w.address.includes('sistema-agenciagtx2.vercel.app') ? '❌' : '✅';
    console.log(`   ${emoji} ${w.topic} → ${w.address} (ID: ${w.id})`);
  });
  console.log('');

  // 2. Deletar TODOS os webhooks antigos (com domínio Vercel)
  const webhooksToDelete = allWebhooks.filter(
    (w) => w.address.includes('sistema-agenciagtx2.vercel.app')
  );

  if (webhooksToDelete.length > 0) {
    console.log(`🗑️  Deletando ${webhooksToDelete.length} webhooks com domínio antigo...`);

    for (const webhook of webhooksToDelete) {
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
        console.log(`   ✅ Deletado`);
      } else {
        const errorData = await deleteResponse.json();
        console.error(`   ❌ Erro:`, errorData);
      }
    }
    console.log('');
  } else {
    console.log('✅ Nenhum webhook antigo encontrado');
    console.log('');
  }

  // 3. Criar novos webhooks com domínio correto
  const topics = ['checkouts/create', 'checkouts/update', 'orders/create'];

  console.log('📡 Criando webhooks com domínio correto...');

  for (const topic of topics) {
    // Verificar se já existe (com domínio novo)
    const exists = allWebhooks.find(
      (w) => w.topic === topic && w.address === NEW_WEBHOOK_URL
    );

    if (exists) {
      console.log(`   ✅ ${topic} já existe corretamente (ID: ${exists.id})`);
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
            address: NEW_WEBHOOK_URL,
            format: 'json',
          },
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error(`   ❌ Erro:`, createData);
    } else {
      console.log(`   ✅ Criado (ID: ${createData.webhook.id})`);
    }
  }

  console.log('');
  console.log('🎉 Webhooks corrigidos!');
  console.log('');
  console.log('📝 Agora faça o teste:');
  console.log('1. Abra: https://5us7uu-fu.myshopify.com (aba anônima)');
  console.log('2. Adicione produto ao carrinho');
  console.log('3. Vá para checkout e coloque um EMAIL REAL');
  console.log('4. NÃO finalize - apenas abandone');
  console.log('5. Aguarde 2 minutos');
  console.log('6. Verifique se chegou: curl "https://app.agenciagtx.com.br/api/debug/recovery-status?userId=ebe65fa6-f26b-4686-8ac2-557d03c89a6c"');
}

fixWebhooks().catch(console.error);
