/**
 * POST /api/integrations/[id]/sync-carts
 * Sincroniza carrinhos abandonados existentes da Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;

    // Buscar integração
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json(
        { error: 'Integração não encontrada' },
        { status: 404 }
      );
    }

    if (integration.platform !== 'shopify') {
      return NextResponse.json(
        { error: 'Esta funcionalidade é apenas para Shopify' },
        { status: 400 }
      );
    }

    console.log('🔄 Sincronizando carrinhos abandonados:', integration.store_name);

    // Extrair domínio da store_url
    const storeUrl = integration.store_url.replace('https://', '').replace('http://', '');
    const shopDomain = storeUrl.split('/')[0];

    // Usar REST API pedindo TODOS os campos possíveis
    const apiUrl = `https://${shopDomain}/admin/api/2024-10/checkouts.json?limit=250`;
    console.log('📡 Usando REST API (todos os campos):', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': integration.api_key,
      },
    });

    console.log('📊 Status da resposta:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro ao buscar checkouts:', data);
      return NextResponse.json(
        {
          error: data.errors || 'Erro ao buscar checkouts da Shopify',
          details: data,
        },
        { status: response.status }
      );
    }

    const allCheckouts = data.checkouts || [];
    console.log(`📦 Encontrados ${allCheckouts.length} checkouts`);

    if (allCheckouts.length > 0) {
      allCheckouts.forEach((c: any, idx: number) => {
        console.log(`  ${idx + 1}. ID: ${c.id}, Email: ${c.email}, Customer Email: ${c.customer?.email}, Billing: ${c.billing_address?.email}`);
      });
    }

    if (allCheckouts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum carrinho abandonado encontrado.',
        imported: 0,
        suggestion: 'Crie um checkout de teste na loja e tente novamente.',
      });
    }

    let imported = 0;
    let errors = 0;
    let skipped = 0;
    const skipReasons: string[] = [];

    // Processar cada checkout (REST format)
    for (const checkout of allCheckouts) {
      try {
        const checkoutId = checkout.id;

        console.log(`\n🔍 Processando checkout ${checkoutId}:`);

        // Tentar extrair email de todos os lugares possíveis
        const customerEmail =
          checkout.email ||
          checkout.customer?.email ||
          checkout.billing_address?.email ||
          checkout.shipping_address?.email;

        console.log(`   - checkout.email: ${checkout.email || 'N/A'}`);
        console.log(`   - customer.email: ${checkout.customer?.email || 'N/A'}`);
        console.log(`   - billing_address.email: ${checkout.billing_address?.email || 'N/A'}`);
        console.log(`   - shipping_address.email: ${checkout.shipping_address?.email || 'N/A'}`);
        console.log(`   - Email final: ${customerEmail || 'N/A'}`);
        console.log(`   - Total: ${checkout.total_price || '0'} ${checkout.currency || 'BRL'}`);
        console.log(`   - Created: ${checkout.created_at}`);
        console.log(`   - Completed: ${checkout.completed_at || 'N/A'}`);

        // IMPORTANTE: Se não tem email, importar mesmo assim mas marcar como "sem_email"
        // Os webhooks futuros vão ter email
        const skipIfNoEmail = false; // Mudei para false - vamos importar sem email também

        if (!customerEmail && skipIfNoEmail) {
          const reason = `Checkout ${checkoutId}: sem email`;
          console.log(`   ⏭️  PULADO: ${reason}`);
          skipReasons.push(reason);
          skipped++;
          continue;
        }

        // Pular checkouts completados
        if (checkout.completed_at) {
          const reason = `Checkout ${checkoutId}: já completado em ${checkout.completed_at}`;
          console.log(`   ⏭️  PULADO: ${reason}`);
          skipReasons.push(reason);
          skipped++;
          continue;
        }

        const customerName = checkout.customer?.first_name
          ? `${checkout.customer.first_name} ${checkout.customer.last_name || ''}`.trim()
          : null;

        const cartValue = parseFloat(checkout.total_price || '0');
        const currency = checkout.currency || 'BRL';

        // Produtos no carrinho (REST format)
        const lineItems = checkout.line_items?.map((item: any) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image_url: item.image_url,
        })) || [];

        const customerId = checkout.customer?.id?.toString();

        // Salvar na tabela abandoned_carts
        const { error: cartError } = await supabase
          .from('abandoned_carts')
          .upsert({
            platform_cart_id: `shopify_${checkoutId}`, // ID externo único
            user_id: integration.user_id,
            integration_id: integrationId,
            customer_email: customerEmail || 'sem-email@placeholder.com', // Placeholder se não tiver email
            customer_name: customerName,
            customer_id: customerId,
            cart_token: checkout.token,
            checkout_url: checkout.abandoned_checkout_url,
            total_value: cartValue,
            currency: currency,
            cart_items: lineItems,
            utm_source: null,
            utm_medium: null,
            utm_campaign: null,
            utm_term: null,
            utm_content: null,
            status: 'abandoned', // Sempre abandoned (webhook atualiza depois)
            platform_data: checkout,
            abandoned_at: checkout.created_at || new Date().toISOString(),
          }, {
            onConflict: 'platform_cart_id',
          });

        if (cartError) {
          console.error(`❌ Erro ao salvar checkout ${checkoutId}:`, cartError);
          errors++;
        } else {
          console.log(`✅ Checkout ${checkoutId} importado${!customerEmail ? ' (sem email)' : ''}`);
          imported++;
        }

        // Também salvar em webhook_events para compatibilidade
        await supabase
          .from('webhook_events')
          .upsert({
            id: `shopify_${checkoutId}`,
            integration_id: integrationId,
            user_id: integration.user_id,
            event_type: 'checkout_created',
            event_data: checkout,
            customer_email: customerEmail || 'sem-email@placeholder.com',
            customer_name: customerName,
            cart_value: cartValue,
            currency: currency,
            line_items: lineItems,
            checkout_url: checkout.abandoned_checkout_url,
            processed: false,
            created_at: checkout.created_at || new Date().toISOString(),
          }, {
            onConflict: 'id',
          });

      } catch (error: any) {
        console.error(`❌ Erro ao processar checkout:`, error);
        errors++;
      }
    }

    console.log(`\n✅ Sincronização completa:`);
    console.log(`   - Total encontrado: ${allCheckouts.length}`);
    console.log(`   - Importados: ${imported}`);
    console.log(`   - Pulados: ${skipped}`);
    console.log(`   - Erros: ${errors}`);

    if (skipReasons.length > 0) {
      console.log(`\n📋 Motivos dos pulos:`);
      skipReasons.forEach(reason => console.log(`   - ${reason}`));
    }

    return NextResponse.json({
      success: true,
      message: `${imported} carrinhos importados${skipped > 0 ? `, ${skipped} pulados` : ''}${errors > 0 ? `, ${errors} erros` : ''}`,
      imported,
      skipped,
      errors,
      total: allCheckouts.length,
      skipReasons: skipReasons.length > 0 ? skipReasons : undefined,
    });
  } catch (error: any) {
    console.error('❌ Erro ao sincronizar carrinhos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar carrinhos' },
      { status: 500 }
    );
  }
}

/**
 * Extrai parâmetros UTM de uma URL ou note attributes
 */
function extractUtmParams(landingSite: string, noteAttributes?: any[]): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
} {
  const params = {
    utm_source: null as string | null,
    utm_medium: null as string | null,
    utm_campaign: null as string | null,
    utm_term: null as string | null,
    utm_content: null as string | null,
  };

  try {
    // Tentar extrair da landing_site
    if (landingSite && landingSite.includes('?')) {
      const url = new URL(landingSite);
      params.utm_source = url.searchParams.get('utm_source');
      params.utm_medium = url.searchParams.get('utm_medium');
      params.utm_campaign = url.searchParams.get('utm_campaign');
      params.utm_term = url.searchParams.get('utm_term');
      params.utm_content = url.searchParams.get('utm_content');
    }

    // Tentar extrair dos note_attributes
    if (noteAttributes && Array.isArray(noteAttributes)) {
      noteAttributes.forEach((attr: any) => {
        const name = attr.name?.toLowerCase();
        const value = attr.value;

        if (name === 'utm_source') params.utm_source = value;
        if (name === 'utm_medium') params.utm_medium = value;
        if (name === 'utm_campaign') params.utm_campaign = value;
        if (name === 'utm_term') params.utm_term = value;
        if (name === 'utm_content') params.utm_content = value;
      });
    }
  } catch (error) {
    console.error('⚠️ Erro ao extrair UTM params:', error);
  }

  return params;
}
