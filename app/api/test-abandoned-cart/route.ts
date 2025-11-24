import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Endpoint de teste para simular um carrinho abandonado
 * Cria um webhook_event artificial para testar o sistema
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || 'teste@example.com';

    // Buscar primeira integração ativa
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Nenhuma integração ativa encontrada' },
        { status: 404 }
      );
    }

    console.log('🧪 Criando carrinho de teste para:', email);

    // Criar evento de webhook de teste (como se viesse do Shopify)
    const testCheckoutEvent = {
      id: `test_${Date.now()}`,
      integration_id: integration.id,
      user_id: integration.user_id,
      event_type: 'checkout_created',
      event_data: {
        id: Date.now(),
        email: email,
        customer: {
          email: email,
          first_name: 'Cliente',
          last_name: 'Teste',
        },
        line_items: [
          {
            title: 'Produto de Teste',
            quantity: 1,
            price: '99.90',
            image_url: 'https://via.placeholder.com/150',
          },
          {
            title: 'Outro Produto',
            quantity: 2,
            price: '49.90',
            image_url: 'https://via.placeholder.com/150',
          },
        ],
        total_price: '199.70',
        currency: 'BRL',
        abandoned_checkout_url: `https://teste.myshopify.com/checkout/${Date.now()}`,
      },
      customer_email: email,
      customer_name: 'Cliente Teste',
      line_items: [
        {
          title: 'Produto de Teste',
          quantity: 1,
          price: '99.90',
          image_url: 'https://via.placeholder.com/150',
        },
        {
          title: 'Outro Produto',
          quantity: 2,
          price: '49.90',
          image_url: 'https://via.placeholder.com/150',
        },
      ],
      cart_value: 199.70,
      currency: 'BRL',
      checkout_url: `https://teste.myshopify.com/checkout/${Date.now()}`,
      processed: false,
      // Criar com data de 20 minutos atrás para ser detectado imediatamente
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    };

    const { data: webhookEvent, error: webhookError } = await supabase
      .from('webhook_events')
      .insert(testCheckoutEvent)
      .select()
      .single();

    if (webhookError) {
      console.error('❌ Erro ao criar evento de teste:', webhookError);
      return NextResponse.json(
        { error: webhookError.message },
        { status: 500 }
      );
    }

    console.log('✅ Carrinho de teste criado:', webhookEvent.id);

    return NextResponse.json({
      success: true,
      message: 'Carrinho de teste criado com sucesso!',
      webhook_event: {
        id: webhookEvent.id,
        email: email,
        cart_value: 199.70,
        created_at: webhookEvent.created_at,
      },
      next_steps: [
        '1. Execute o job de detecção: POST /api/jobs/detect-abandoned-carts',
        '2. Ou aguarde o cron automático (a cada 5 minutos)',
        '3. Verifique o email em: ' + email,
        '4. Veja estatísticas em: /recovery',
      ],
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar carrinho de teste:', error);
    return NextResponse.json(
      { error: error.message || 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

/**
 * GET para listar carrinhos de teste criados
 */
export async function GET(request: NextRequest) {
  try {
    const { data: testCarts, error } = await supabase
      .from('webhook_events')
      .select('*')
      .ilike('id', 'test_%')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      test_carts: testCarts || [],
      count: testCarts?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
