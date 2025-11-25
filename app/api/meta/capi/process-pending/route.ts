/**
 * POST /api/meta/capi/process-pending
 *
 * Processa carrinhos recuperados que ainda não enviaram evento Purchase para Meta CAPI
 * FASE 6: CAPI
 *
 * Esta rota deve ser chamada por:
 * - Cron job (ex: a cada 5 minutos)
 * - Manualmente após recuperar um carrinho
 * - Webhook após confirmação de compra
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verificar auth token (opcional, para segurança)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token';

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.warn('⚠️ Unauthorized access to process-pending');
      // Comentar a linha abaixo se quiser permitir acesso sem auth (desenvolvimento)
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Iniciando processamento de eventos CAPI pendentes...');

    // Buscar carrinhos recuperados que não enviaram evento Purchase
    const { data: pendingCarts, error: fetchError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'recovered')
      .eq('capi_purchase_sent', false)
      .not('recovered_at', 'is', null)
      .limit(50); // Processar no máximo 50 por vez

    if (fetchError) {
      console.error('❌ Erro ao buscar carrinhos pendentes:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingCarts || pendingCarts.length === 0) {
      console.log('✅ Nenhum carrinho pendente para processar');
      return NextResponse.json({
        success: true,
        message: 'No pending carts to process',
        processed: 0,
      });
    }

    console.log(`📊 Encontrados ${pendingCarts.length} carrinhos pendentes`);

    // Processar cada carrinho
    const results = await Promise.allSettled(
      pendingCarts.map(async (cart) => {
        try {
          // Chamar API para enviar evento
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/capi/send-event`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cart_id: cart.id,
                event_type: 'Purchase',
              }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send event');
          }

          const result = await response.json();

          console.log(`✅ Evento enviado para carrinho ${cart.id}:`, result.event_id);

          return {
            cart_id: cart.id,
            success: true,
            event_id: result.event_id,
          };
        } catch (error: any) {
          console.error(`❌ Erro ao processar carrinho ${cart.id}:`, error.message);

          return {
            cart_id: cart.id,
            success: false,
            error: error.message,
          };
        }
      })
    );

    // Contar sucessos e falhas
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`📊 Processamento concluído: ${successful} sucesso, ${failed} falhas`);

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful,
      failed,
      results: results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason })),
    });
  } catch (error: any) {
    console.error('❌ Erro ao processar eventos pendentes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process pending events' },
      { status: 500 }
    );
  }
}

// GET para verificar quantos eventos pendentes existem
export async function GET(request: NextRequest) {
  try {
    const { count } = await supabase
      .from('abandoned_carts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'recovered')
      .eq('capi_purchase_sent', false)
      .not('recovered_at', 'is', null);

    return NextResponse.json({
      pending_events: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
