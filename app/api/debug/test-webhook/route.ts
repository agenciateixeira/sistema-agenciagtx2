/**
 * POST /api/debug/test-webhook
 * Endpoint para testar webhooks manualmente
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🧪 TESTE DE WEBHOOK');
    console.log('Headers:', Object.fromEntries(request.headers));
    console.log('Body:', JSON.stringify(body, null, 2));

    // Simular criação de um checkout abandonado
    const { data, error } = await supabase
      .from('abandoned_carts')
      .insert({
        user_id: body.user_id,
        integration_id: body.integration_id,
        customer_email: body.customer_email || 'teste@exemplo.com',
        customer_name: body.customer_name || 'Cliente Teste',
        total_value: parseFloat(body.total_value || '100'),
        currency: 'BRL',
        cart_items: body.items || [
          {
            title: 'Produto Teste',
            quantity: 1,
            price: '100.00',
          }
        ],
        checkout_url: 'https://loja.myshopify.com/checkout/test',
        status: 'abandoned',
        utm_source: body.utm_source || 'facebook',
        utm_medium: body.utm_medium || 'cpc',
        utm_campaign: body.utm_campaign || 'test-campaign',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Carrinho teste criado:', data);

    return NextResponse.json({
      success: true,
      message: 'Carrinho teste criado com sucesso',
      data,
    });
  } catch (error: any) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
