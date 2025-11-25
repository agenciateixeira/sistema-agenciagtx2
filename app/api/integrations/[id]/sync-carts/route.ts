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

    // Buscar checkouts abandonados da Shopify
    // API: /admin/api/2024-10/checkouts.json?status=open
    const apiUrl = `https://${shopDomain}/admin/api/2024-10/checkouts.json?status=open&limit=250`;
    console.log('📡 URL da API:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': integration.api_key,
      },
    });

    console.log('📊 Status da resposta:', response.status);

    const data = await response.json();
    console.log('📦 Dados recebidos:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Erro ao buscar checkouts:', data);
      return NextResponse.json(
        {
          error: data.errors || data.error || 'Erro ao buscar checkouts da Shopify',
          details: data,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const checkouts = data.checkouts || [];
    console.log(`📦 Encontrados ${checkouts.length} checkouts`);

    // Log de cada checkout encontrado
    if (checkouts.length > 0) {
      checkouts.forEach((c: any, idx: number) => {
        console.log(`  ${idx + 1}. ID: ${c.id}, Email: ${c.email}, Total: ${c.total_price}, Created: ${c.created_at}`);
      });
    } else {
      console.log('⚠️ Nenhum checkout encontrado. Verifique:');
      console.log('  - Se existem checkouts abandonados na Shopify');
      console.log('  - Se a API key tem permissão read_checkouts');
      console.log('  - Se os checkouts têm status "open"');
    }

    // Se não encontrou com status=open, tentar sem filtro de status
    let allCheckouts = checkouts;
    if (checkouts.length === 0) {
      console.log('🔄 Tentando buscar checkouts sem filtro de status...');
      const response2 = await fetch(
        `https://${shopDomain}/admin/api/2024-10/checkouts.json?limit=250`,
        {
          headers: {
            'X-Shopify-Access-Token': integration.api_key,
          },
        }
      );

      if (response2.ok) {
        const data2 = await response2.json();
        allCheckouts = data2.checkouts || [];
        console.log(`📦 Encontrados ${allCheckouts.length} checkouts (sem filtro)`);
      }
    }

    if (allCheckouts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum carrinho abandonado encontrado. Verifique se a API key tem permissão "read_checkouts" e se existem checkouts na loja.',
        imported: 0,
        suggestion: 'Crie um checkout de teste na loja e tente novamente.',
      });
    }

    let imported = 0;
    let errors = 0;
    let skipped = 0;
    const skipReasons: string[] = [];

    // Processar cada checkout
    for (const checkout of allCheckouts) {
      try {
        console.log(`\n🔍 Processando checkout ${checkout.id}:`);

        // Primeiro, tentar pegar email direto do checkout
        let customerEmail = checkout.email || checkout.billing_address?.email || checkout.shipping_address?.email;

        console.log(`   - Email no checkout: ${customerEmail || 'N/A'}`);
        console.log(`   - Customer ID: ${checkout.customer?.id || 'N/A'}`);

        // Se não tem email mas tem customer ID, buscar na API de Customers
        if (!customerEmail && checkout.customer?.id) {
          console.log(`   🔍 Buscando email do customer ${checkout.customer.id}...`);

          try {
            const customerResponse = await fetch(
              `https://${shopDomain}/admin/api/2024-10/customers/${checkout.customer.id}.json`,
              {
                headers: {
                  'X-Shopify-Access-Token': integration.api_key,
                },
              }
            );

            if (customerResponse.ok) {
              const customerData = await customerResponse.json();
              customerEmail = customerData.customer?.email;
              console.log(`   ✅ Email encontrado: ${customerEmail}`);
            } else {
              console.log(`   ⚠️ Erro ao buscar customer: ${customerResponse.status}`);
            }
          } catch (error: any) {
            console.log(`   ⚠️ Erro na API de customer: ${error.message}`);
          }
        }

        console.log(`   - Total: ${checkout.total_price || '0'}`);
        console.log(`   - Created: ${checkout.created_at}`);
        console.log(`   - Completed: ${checkout.completed_at || 'N/A'}`);

        // Verificar se conseguimos o email
        if (!customerEmail) {
          const reason = `Checkout ${checkout.id}: sem email (customer ID: ${checkout.customer?.id || 'N/A'})`;
          console.log(`   ⏭️  PULADO: ${reason}`);
          skipReasons.push(reason);
          skipped++;
          continue;
        }

        // Pular checkouts completados
        if (checkout.completed_at) {
          const reason = `Checkout ${checkout.id}: já completado em ${checkout.completed_at}`;
          console.log(`   ⏭️  PULADO: ${reason}`);
          skipReasons.push(reason);
          skipped++;
          continue;
        }

        const customerName = checkout.customer?.first_name
          ? `${checkout.customer.first_name} ${checkout.customer.last_name || ''}`.trim()
          : null;

        const cartValue = parseFloat(checkout.total_price || '0');

        // Produtos no carrinho
        const lineItems = checkout.line_items?.map((item: any) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image_url: item.image_url,
        })) || [];

        // Extrair UTM params
        const landingSite = checkout.landing_site || '';
        const utmParams = extractUtmParams(landingSite, checkout.note_attributes);

        // Salvar na tabela abandoned_carts
        const { error: cartError } = await supabase
          .from('abandoned_carts')
          .upsert({
            id: `shopify_${checkout.id}`,
            user_id: integration.user_id,
            integration_id: integrationId,
            customer_email: customerEmail,
            customer_name: customerName,
            customer_id: checkout.customer?.id?.toString(),
            cart_token: checkout.token,
            checkout_url: checkout.abandoned_checkout_url,
            total_value: cartValue,
            currency: checkout.currency || 'BRL',
            cart_items: lineItems,
            utm_source: utmParams.utm_source,
            utm_medium: utmParams.utm_medium,
            utm_campaign: utmParams.utm_campaign,
            utm_term: utmParams.utm_term,
            utm_content: utmParams.utm_content,
            status: 'abandoned',
            platform_data: checkout,
            abandoned_at: checkout.created_at || new Date().toISOString(),
          }, {
            onConflict: 'id',
          });

        if (cartError) {
          console.error(`❌ Erro ao salvar checkout ${checkout.id}:`, cartError);
          errors++;
        } else {
          console.log(`✅ Checkout ${checkout.id} importado`);
          imported++;
        }

        // Também salvar em webhook_events para compatibilidade
        await supabase
          .from('webhook_events')
          .upsert({
            id: `shopify_${checkout.id}`,
            integration_id: integrationId,
            user_id: integration.user_id,
            event_type: 'checkout_created',
            event_data: checkout,
            customer_email: customerEmail,
            customer_name: customerName,
            cart_value: cartValue,
            currency: checkout.currency || 'BRL',
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
