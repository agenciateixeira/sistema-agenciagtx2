/**
 * Endpoint de DEBUG - SEM validação HMAC
 * POST /api/webhook/shopify-debug
 *
 * Use este endpoint temporariamente nos webhooks da Shopify para debug
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const topic = request.headers.get('x-shopify-topic');
    const shopDomain = request.headers.get('x-shopify-shop-domain');
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    console.log('🐛 DEBUG WEBHOOK RECEBIDO:', {
      topic,
      shopDomain,
      hasHmac: !!hmacHeader,
      bodyLength: bodyText.length,
      timestamp: new Date().toISOString(),
    });

    // Salvar log completo
    await supabase.from('webhook_events').insert({
      id: `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      integration_id: '1e371393-e54c-45bd-ad5f-5153c3f4032e',
      user_id: 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c',
      event_type: `debug_${topic}`,
      event_data: {
        topic,
        shopDomain,
        hmac: hmacHeader,
        bodyPreview: bodyText.substring(0, 500),
        receivedAt: new Date().toISOString(),
      },
      processed: true,
    });

    console.log('✅ Debug webhook salvo no banco');

    // Tentar processar mesmo sem HMAC
    if (topic && bodyText) {
      const eventData = JSON.parse(bodyText);

      if (topic === 'checkouts/create' || topic === 'checkouts/update') {
        const customerEmail = eventData.email
          || eventData.customer?.email
          || eventData.billing_address?.email
          || eventData.shipping_address?.email
          || 'sem-email-no-webhook@debug.com';

        console.log('📧 Email no webhook:', customerEmail);
        console.log('🔍 Fontes:', {
          root: eventData.email,
          customer: eventData.customer?.email,
          billing: eventData.billing_address?.email,
          shipping: eventData.shipping_address?.email,
        });

        await supabase.from('abandoned_carts').upsert({
          platform_cart_id: `debug_shopify_${eventData.id}`,
          user_id: 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c',
          integration_id: '1e371393-e54c-45bd-ad5f-5153c3f4032e',
          customer_email: customerEmail,
          customer_name: eventData.customer?.first_name || eventData.billing_address?.first_name || null,
          total_value: parseFloat(eventData.total_price || '0'),
          cart_items: eventData.line_items || [],
          status: 'abandoned',
          platform_data: eventData,
          abandoned_at: eventData.created_at || new Date().toISOString(),
        }, {
          onConflict: 'platform_cart_id',
        });

        console.log('✅ Carrinho debug salvo');
      }
    }

    return NextResponse.json({
      success: true,
      debug: true,
      message: 'Webhook recebido e salvo para debug',
      topic,
      shopDomain,
    });
  } catch (error: any) {
    console.error('❌ Erro no debug webhook:', error);

    // Salvar erro também
    await supabase.from('webhook_events').insert({
      id: `debug_error_${Date.now()}`,
      integration_id: '1e371393-e54c-45bd-ad5f-5153c3f4032e',
      user_id: 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c',
      event_type: 'debug_error',
      event_data: {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      processed: true,
    });

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de debug para webhooks Shopify',
    instructions: 'Configure este endpoint nos webhooks da Shopify para debug sem HMAC',
    url: 'https://app.agenciagtx.com.br/api/webhook/shopify-debug',
  });
}
