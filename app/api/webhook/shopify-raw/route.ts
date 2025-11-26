/**
 * Endpoint ULTRA DEBUG - Salva payload RAW completo
 * POST /api/webhook/shopify-raw
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
    const eventData = JSON.parse(bodyText);

    const topic = request.headers.get('x-shopify-topic');
    const shopDomain = request.headers.get('x-shopify-shop-domain');

    console.log('📦 RAW WEBHOOK:', {
      topic,
      shopDomain,
      hasEmail: !!eventData.email,
      hasBillingEmail: !!eventData.billing_address?.email,
      hasShippingEmail: !!eventData.shipping_address?.email,
      hasCustomerEmail: !!eventData.customer?.email,
    });

    // Salvar TUDO no banco para inspeção
    const timestamp = Date.now();
    await supabase.from('webhook_events').insert({
      id: `${timestamp}`,
      integration_id: '1e371393-e54c-45bd-ad5f-5153c3f4032e',
      user_id: 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c',
      event_type: `raw_${topic}`,
      event_data: eventData, // Payload COMPLETO
      customer_email: eventData.email
        || eventData.customer?.email
        || eventData.billing_address?.email
        || eventData.shipping_address?.email
        || 'NENHUM_EMAIL_ENCONTRADO',
      processed: true,
    }).then(({ error }) => {
      if (error) {
        console.error('Erro ao salvar (tentando sem ID):', error);
        // Tentar sem ID se der erro
        return supabase.from('webhook_events').insert({
          integration_id: '1e371393-e54c-45bd-ad5f-5153c3f4032e',
          user_id: 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c',
          event_type: `raw_${topic}`,
          event_data: eventData,
          customer_email: eventData.email
            || eventData.customer?.email
            || eventData.billing_address?.email
            || eventData.shipping_address?.email
            || 'NENHUM_EMAIL_ENCONTRADO',
          processed: true,
        });
      }
    });

    console.log('✅ Raw payload salvo');

    return NextResponse.json({
      success: true,
      message: 'Raw payload saved',
      emailFound: {
        root: !!eventData.email,
        customer: !!eventData.customer?.email,
        billing: !!eventData.billing_address?.email,
        shipping: !!eventData.shipping_address?.email,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint RAW para debug - salva payload completo',
    url: 'https://app.agenciagtx.com.br/api/webhook/shopify-raw',
  });
}
