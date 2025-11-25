import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Cliente Supabase service role (para operações do servidor)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Valida assinatura HMAC do webhook Shopify
 */
function validateShopifyWebhook(body: string, hmacHeader: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
}

/**
 * POST /api/webhook/shopify
 * Recebe webhooks da Shopify (checkouts, orders)
 */
export async function POST(request: NextRequest) {
  try {
    // Ler body como texto para validar HMAC
    const bodyText = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    const topic = request.headers.get('x-shopify-topic');
    const shopDomain = request.headers.get('x-shopify-shop-domain');

    console.log('📥 Webhook recebido:', {
      topic,
      shopDomain,
      hasHmac: !!hmacHeader,
      bodyLength: bodyText.length,
    });

    if (!hmacHeader || !topic || !shopDomain) {
      console.error('❌ Headers obrigatórios faltando');
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
    }

    // Buscar integração pelo shop domain
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('id, webhook_secret, user_id, platform')
      .eq('store_url', `https://${shopDomain}`)
      .eq('platform', 'shopify')
      .single();

    if (integrationError || !integration) {
      console.error('❌ Integração não encontrada:', shopDomain);
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Validar HMAC (pode ser desabilitado para testes)
    const skipHmacValidation = process.env.SKIP_WEBHOOK_HMAC_VALIDATION === 'true';

    if (!skipHmacValidation) {
      const isValid = validateShopifyWebhook(bodyText, hmacHeader, integration.webhook_secret);

      if (!isValid) {
        console.error('❌ HMAC inválido para:', shopDomain);
        console.error('💡 Dica: Adicione SKIP_WEBHOOK_HMAC_VALIDATION=true nas env vars para desabilitar temporariamente');
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }

      console.log('✅ HMAC válido');
    } else {
      console.warn('⚠️ HMAC validation DESABILITADA - apenas para testes!');
    }

    // Parse do body
    const eventData = JSON.parse(bodyText);

    // Processar evento baseado no tipo
    if (topic === 'checkouts/create' || topic === 'checkouts/update') {
      await processCheckoutEvent(integration.id, integration.user_id, topic, eventData);
    } else if (topic === 'orders/create') {
      await processOrderEvent(integration.id, integration.user_id, eventData);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Processa evento de checkout (criado/atualizado)
 */
async function processCheckoutEvent(
  integrationId: string,
  userId: string,
  topic: string,
  checkout: any
) {
  console.log('🛒 Processando checkout:', {
    checkoutId: checkout.id,
    email: checkout.email,
    total: checkout.total_price,
    currency: checkout.currency,
  });

  // Extrair dados importantes
  const customerEmail = checkout.email || checkout.customer?.email;
  const customerName = checkout.customer?.first_name
    ? `${checkout.customer.first_name} ${checkout.customer.last_name || ''}`.trim()
    : null;

  const cartValue = parseFloat(checkout.total_price || '0');
  const currency = checkout.currency || 'BRL';

  // Produtos no carrinho
  const lineItems = checkout.line_items?.map((item: any) => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
    title: item.title,
    quantity: item.quantity,
    price: item.price,
    image_url: item.image_url,
  })) || [];

  // Salvar/atualizar evento no banco
  const { error } = await supabase
    .from('webhook_events')
    .upsert({
      id: `shopify_${checkout.id}`, // ID único para evitar duplicatas
      integration_id: integrationId,
      user_id: userId,
      event_type: topic === 'checkouts/create' ? 'checkout_created' : 'checkout_updated',
      event_data: checkout,
      customer_email: customerEmail,
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

  if (error) {
    console.error('❌ Erro ao salvar webhook_event:', error);
    throw error;
  }

  console.log('✅ Checkout salvo no banco (webhook_events)');

  // Extrair UTM params das landing_site ou note_attributes
  const landingSite = checkout.landing_site || '';
  const utmParams = extractUtmParams(landingSite, checkout.note_attributes);

  // Também salvar na tabela abandoned_carts (nova estrutura)
  const { error: cartError } = await supabase
    .from('abandoned_carts')
    .upsert({
      id: `shopify_${checkout.id}`,
      user_id: userId,
      integration_id: integrationId,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_id: checkout.customer?.id?.toString(),
      cart_token: checkout.token,
      checkout_url: checkout.abandoned_checkout_url,
      total_value: cartValue,
      currency: currency,
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
    console.error('❌ Erro ao salvar abandoned_cart:', cartError);
    // Não falha o webhook, só loga o erro
  } else {
    console.log('✅ Carrinho salvo no banco (abandoned_carts)');
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

    // Tentar extrair dos note_attributes (caso a loja salve lá)
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

/**
 * Processa evento de pedido criado (conversão)
 */
async function processOrderEvent(
  integrationId: string,
  userId: string,
  order: any
) {
  console.log('💰 Processando pedido:', {
    orderId: order.id,
    checkoutId: order.checkout_id,
    email: order.email,
    total: order.total_price,
  });

  const customerEmail = order.email || order.customer?.email;

  // Buscar webhook_event do checkout original
  const { data: checkoutEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('id', `shopify_${order.checkout_id}`)
    .eq('integration_id', integrationId)
    .single();

  if (checkoutEvent) {
    // Marcar ações automáticas como convertidas
    await supabase
      .from('automated_actions')
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
        conversion_value: parseFloat(order.total_price || '0'),
      })
      .eq('webhook_event_id', checkoutEvent.id)
      .eq('converted', false);

    console.log('✅ Conversão registrada (automated_actions)');
  }

  // Marcar carrinho como recuperado na tabela abandoned_carts
  if (order.checkout_id) {
    const { error: updateCartError } = await supabase
      .from('abandoned_carts')
      .update({
        status: 'recovered',
        recovered_at: new Date().toISOString(),
        recovered_value: parseFloat(order.total_price || '0'),
      })
      .eq('id', `shopify_${order.checkout_id}`)
      .eq('integration_id', integrationId);

    if (updateCartError) {
      console.error('❌ Erro ao atualizar abandoned_cart:', updateCartError);
    } else {
      console.log('✅ Carrinho marcado como recuperado (abandoned_carts)');
    }
  }

  // Salvar evento de order também
  const { error } = await supabase
    .from('webhook_events')
    .insert({
      id: `shopify_order_${order.id}`,
      integration_id: integrationId,
      user_id: userId,
      event_type: 'order_created',
      event_data: order,
      customer_email: customerEmail,
      cart_value: parseFloat(order.total_price || '0'),
      currency: order.currency || 'BRL',
      processed: true, // Ordem já está completa
      created_at: order.created_at || new Date().toISOString(),
    });

  if (error) {
    console.error('❌ Erro ao salvar order event:', error);
  }

  console.log('✅ Pedido salvo no banco');
}
