/**
 * Verificar webhooks recentes no banco de dados
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bortomadefyundsarhpu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnRvbWFkZWZ5dW5kc2FyaHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA3NzUxOSwiZXhwIjoyMDYyNjUzNTE5fQ.0NlQHZOSdwXTBIm3ir5kXf7HKlhr80Qyy2aeF8fkDfY'
);

async function checkRecentWebhooks() {
  const userId = 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c';

  console.log('🔍 Verificando webhooks recentes...');
  console.log('');

  // Últimos 30 minutos
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  // 1. Verificar webhook_events
  const { data: webhooks, error: webhookError } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyMinsAgo)
    .order('created_at', { ascending: false });

  console.log('📥 WEBHOOKS RECEBIDOS (últimos 30 min):');
  if (webhooks && webhooks.length > 0) {
    console.log(`   Total: ${webhooks.length}`);
    webhooks.forEach((w) => {
      console.log(`   - ${w.event_type} | Email: ${w.customer_email || 'SEM EMAIL'} | ${w.created_at}`);
      console.log(`     Cart Value: ${w.cart_value} | Checkout URL: ${w.checkout_url ? 'Sim' : 'Não'}`);
    });
  } else {
    console.log('   ❌ Nenhum webhook recebido nos últimos 30 minutos');
  }
  console.log('');

  // 2. Verificar abandoned_carts
  const { data: carts, error: cartsError } = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('user_id', userId)
    .gte('abandoned_at', thirtyMinsAgo)
    .order('abandoned_at', { ascending: false });

  console.log('🛒 CARRINHOS ABANDONADOS (últimos 30 min):');
  if (carts && carts.length > 0) {
    console.log(`   Total: ${carts.length}`);
    carts.forEach((c) => {
      console.log(`   - ID: ${c.id.substring(0, 8)}... | Email: ${c.customer_email} | Value: ${c.total_value}`);
      console.log(`     Status: ${c.status} | Abandoned: ${c.abandoned_at}`);
    });
  } else {
    console.log('   ❌ Nenhum carrinho criado nos últimos 30 minutos');
  }
  console.log('');

  // 3. Verificar todos os carrinhos (últimas 24h para comparar)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: allCarts } = await supabase
    .from('abandoned_carts')
    .select('customer_email, abandoned_at')
    .eq('user_id', userId)
    .gte('abandoned_at', oneDayAgo)
    .order('abandoned_at', { ascending: false })
    .limit(10);

  console.log('📊 ÚLTIMOS 10 CARRINHOS (24h):');
  if (allCarts && allCarts.length > 0) {
    allCarts.forEach((c) => {
      const hasEmail = c.customer_email && !c.customer_email.includes('sem-email');
      const emoji = hasEmail ? '✅' : '❌';
      console.log(`   ${emoji} ${c.customer_email} | ${c.abandoned_at}`);
    });
  }
  console.log('');

  // 4. Diagnóstico
  console.log('🔧 DIAGNÓSTICO:');
  if (!webhooks || webhooks.length === 0) {
    console.log('   ❌ Nenhum webhook chegando ao servidor');
    console.log('   📝 Possíveis causas:');
    console.log('      1. Webhooks não estão sendo disparados pela Shopify');
    console.log('      2. Shopify não consegue acessar https://app.agenciagtx.com.br');
    console.log('      3. Webhook está sendo rejeitado (HMAC inválido)');
    console.log('');
    console.log('   💡 Solução: Verificar logs do servidor em tempo real');
    console.log('      - Crie um checkout AGORA');
    console.log('      - Monitore os logs: vercel logs --follow');
  } else {
    console.log('   ✅ Webhooks estão chegando!');
    if (webhooks.some(w => !w.customer_email || w.customer_email.includes('sem-email'))) {
      console.log('   ⚠️  Mas alguns webhooks não contêm email');
      console.log('   📝 Isso acontece quando o cliente não preenche email no checkout');
    }
  }
}

checkRecentWebhooks().catch(console.error);
