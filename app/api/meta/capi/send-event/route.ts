/**
 * POST /api/meta/capi/send-event
 *
 * Envia evento de conversão para Meta Conversions API
 * FASE 6: CAPI
 *
 * Chamado quando:
 * - Carrinho é recuperado (Purchase event)
 * - Carrinho é abandonado (AddToCart event - opcional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';
import {
  sendMetaCAPIEvent,
  createPurchaseEvent,
  createAddToCartEvent,
  isPixelConfigured,
} from '@/lib/meta-capi';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart_id, event_type } = body;

    if (!cart_id) {
      return NextResponse.json({ error: 'cart_id is required' }, { status: 400 });
    }

    if (!event_type || !['Purchase', 'AddToCart'].includes(event_type)) {
      return NextResponse.json(
        { error: 'event_type must be Purchase or AddToCart' },
        { status: 400 }
      );
    }

    // 1. Buscar carrinho
    const { data: cart, error: cartError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('id', cart_id)
      .single();

    if (cartError || !cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // 2. Verificar se já enviou esse evento
    if (event_type === 'Purchase' && cart.capi_purchase_sent) {
      return NextResponse.json({
        success: true,
        message: 'Purchase event already sent',
        event_id: cart.capi_purchase_event_id,
      });
    }

    if (event_type === 'AddToCart' && cart.capi_add_to_cart_sent) {
      return NextResponse.json({
        success: true,
        message: 'AddToCart event already sent',
        event_id: cart.capi_add_to_cart_event_id,
      });
    }

    // 3. Buscar conexão Meta do usuário
    const { data: metaConnection, error: connectionError } = await supabase
      .from('meta_connections')
      .select('*')
      .eq('user_id', cart.user_id)
      .single();

    if (connectionError || !metaConnection) {
      return NextResponse.json(
        { error: 'Meta connection not found' },
        { status: 404 }
      );
    }

    // 4. Verificar se Pixel está configurado
    if (!isPixelConfigured(metaConnection.primary_pixel_id)) {
      return NextResponse.json(
        {
          error: 'Pixel ID not configured. Please configure in Meta Ads settings.',
        },
        { status: 400 }
      );
    }

    // 5. Verificar se token expirou
    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
    if (tokenExpired || metaConnection.status !== 'connected') {
      return NextResponse.json(
        { error: 'Meta token expired or connection not active' },
        { status: 401 }
      );
    }

    // 6. Descriptografar token
    const accessToken = decrypt(metaConnection.access_token_encrypted);

    // 7. Criar evento CAPI
    const eventSourceUrl = cart.checkout_url || process.env.NEXT_PUBLIC_APP_URL || 'https://minhaloja.com.br';

    let event;

    if (event_type === 'Purchase') {
      event = createPurchaseEvent(
        cart.customer_email,
        cart.customer_name,
        parseFloat(cart.recovered_value || cart.total_value),
        cart.currency || 'BRL',
        cart.cart_items || [],
        eventSourceUrl
      );
    } else {
      // AddToCart
      event = createAddToCartEvent(
        cart.customer_email,
        cart.customer_name,
        parseFloat(cart.total_value),
        cart.currency || 'BRL',
        cart.cart_items || [],
        eventSourceUrl
      );
    }

    // 8. Enviar evento para Meta CAPI
    const result = await sendMetaCAPIEvent(
      metaConnection.primary_pixel_id,
      accessToken,
      event
    );

    // 9. Registrar no banco que evento foi enviado
    const updateData: any = {
      capi_error_message: null,
    };

    if (event_type === 'Purchase') {
      updateData.capi_purchase_sent = true;
      updateData.capi_purchase_event_id = result.event_id;
      updateData.capi_purchase_sent_at = new Date().toISOString();
    } else {
      updateData.capi_add_to_cart_sent = true;
      updateData.capi_add_to_cart_event_id = result.event_id;
      updateData.capi_add_to_cart_sent_at = new Date().toISOString();
    }

    await supabase
      .from('abandoned_carts')
      .update(updateData)
      .eq('id', cart_id);

    console.log(`✅ Evento ${event_type} enviado para Meta CAPI:`, {
      cart_id,
      event_id: result.event_id,
      pixel_id: metaConnection.primary_pixel_id,
    });

    return NextResponse.json({
      success: true,
      event_type,
      event_id: result.event_id,
      pixel_id: metaConnection.primary_pixel_id,
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar evento CAPI:', error);

    // Tentar registrar erro no banco
    try {
      const body = await request.json();
      await supabase
        .from('abandoned_carts')
        .update({
          capi_error_message: error.message,
        })
        .eq('id', body.cart_id);
    } catch (e) {
      // Ignorar erro ao registrar erro
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send CAPI event' },
      { status: 500 }
    );
  }
}
