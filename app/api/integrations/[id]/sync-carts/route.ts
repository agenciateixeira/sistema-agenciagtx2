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

    // Usar GraphQL API para buscar abandoned checkouts (inclui email!)
    const graphqlUrl = `https://${shopDomain}/admin/api/2024-10/graphql.json`;
    console.log('📡 Usando GraphQL API:', graphqlUrl);

    const graphqlQuery = `
      query {
        abandonedCheckouts(first: 250) {
          edges {
            node {
              id
              createdAt
              updatedAt
              completedAt
              abandonedCheckoutUrl
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                email
                firstName
                lastName
              }
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      price
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': integration.api_key,
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    console.log('📊 Status da resposta:', response.status);

    const data = await response.json();

    if (!response.ok || data.errors) {
      console.error('❌ Erro GraphQL:', data);
      return NextResponse.json(
        {
          error: data.errors || 'Erro ao buscar checkouts da Shopify',
          details: data,
        },
        { status: response.status }
      );
    }

    const allCheckouts = data.data?.abandonedCheckouts?.edges?.map((edge: any) => edge.node) || [];
    console.log(`📦 Encontrados ${allCheckouts.length} checkouts abandonados via GraphQL`);

    if (allCheckouts.length > 0) {
      allCheckouts.forEach((c: any, idx: number) => {
        console.log(`  ${idx + 1}. ID: ${c.id}, Email: ${c.customer?.email}, Total: ${c.totalPriceSet?.shopMoney?.amount}`);
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

    // Processar cada checkout (GraphQL format)
    for (const checkout of allCheckouts) {
      try {
        // Extrair ID numérico do GID (gid://shopify/Checkout/123 -> 123)
        const checkoutIdMatch = checkout.id.match(/\/(\d+)$/);
        const checkoutId = checkoutIdMatch ? checkoutIdMatch[1] : checkout.id;

        console.log(`\n🔍 Processando checkout ${checkoutId}:`);

        // Email vem direto do customer na GraphQL API
        const customerEmail = checkout.customer?.email;

        console.log(`   - Email: ${customerEmail || 'N/A'}`);
        console.log(`   - Customer: ${checkout.customer?.firstName || 'N/A'} ${checkout.customer?.lastName || ''}`);
        console.log(`   - Total: ${checkout.totalPriceSet?.shopMoney?.amount || '0'} ${checkout.totalPriceSet?.shopMoney?.currencyCode || 'BRL'}`);
        console.log(`   - Created: ${checkout.createdAt}`);
        console.log(`   - Completed: ${checkout.completedAt || 'N/A'}`);

        // Verificar se tem email
        if (!customerEmail) {
          const reason = `Checkout ${checkoutId}: sem email`;
          console.log(`   ⏭️  PULADO: ${reason}`);
          skipReasons.push(reason);
          skipped++;
          continue;
        }

        // Pular checkouts completados
        if (checkout.completedAt) {
          const reason = `Checkout ${checkoutId}: já completado em ${checkout.completedAt}`;
          console.log(`   ⏭️  PULADO: ${reason}`);
          skipReasons.push(reason);
          skipped++;
          continue;
        }

        const customerName = checkout.customer?.firstName
          ? `${checkout.customer.firstName} ${checkout.customer.lastName || ''}`.trim()
          : null;

        const cartValue = parseFloat(checkout.totalPriceSet?.shopMoney?.amount || '0');
        const currency = checkout.totalPriceSet?.shopMoney?.currencyCode || 'BRL';

        // Produtos no carrinho (GraphQL format)
        const lineItems = checkout.lineItems?.edges?.map((edge: any) => {
          const item = edge.node;
          return {
            product_id: item.variant?.id || item.id,
            variant_id: item.variant?.id,
            title: item.title,
            quantity: item.quantity,
            price: item.variant?.price || '0',
            image_url: item.variant?.image?.url,
          };
        }) || [];

        // Extrair Customer ID numérico do GID
        const customerIdMatch = checkout.customer?.id?.match(/\/(\d+)$/);
        const customerId = customerIdMatch ? customerIdMatch[1] : checkout.customer?.id;

        // Salvar na tabela abandoned_carts
        const { error: cartError } = await supabase
          .from('abandoned_carts')
          .upsert({
            id: `shopify_${checkoutId}`,
            user_id: integration.user_id,
            integration_id: integrationId,
            customer_email: customerEmail,
            customer_name: customerName,
            customer_id: customerId?.toString(),
            cart_token: null, // GraphQL não retorna token
            checkout_url: checkout.abandonedCheckoutUrl,
            total_value: cartValue,
            currency: currency,
            cart_items: lineItems,
            utm_source: null, // GraphQL não retorna UTM (podemos adicionar depois)
            utm_medium: null,
            utm_campaign: null,
            utm_term: null,
            utm_content: null,
            status: 'abandoned',
            platform_data: checkout,
            abandoned_at: checkout.createdAt || new Date().toISOString(),
          }, {
            onConflict: 'id',
          });

        if (cartError) {
          console.error(`❌ Erro ao salvar checkout ${checkoutId}:`, cartError);
          errors++;
        } else {
          console.log(`✅ Checkout ${checkoutId} importado`);
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
            customer_email: customerEmail,
            customer_name: customerName,
            cart_value: cartValue,
            currency: currency,
            line_items: lineItems,
            checkout_url: checkout.abandonedCheckoutUrl,
            processed: false,
            created_at: checkout.createdAt || new Date().toISOString(),
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
