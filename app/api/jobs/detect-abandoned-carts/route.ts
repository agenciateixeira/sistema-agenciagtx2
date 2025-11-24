import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAbandonedCartEmail } from '@/lib/email-service';

// Cliente Supabase service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Job para detectar carrinhos abandonados e enviar emails de recuperação
 *
 * Roda a cada 5 minutos (configurar no Vercel Cron ou via chamada externa)
 * Detecta carrinhos criados há mais de 15 minutos que não foram finalizados
 */
export async function GET(request: NextRequest) {
  try {
    // Validar autorização (opcional - para proteger o endpoint)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`;

    if (authHeader !== expectedAuth) {
      console.warn('⚠️ Tentativa de acesso não autorizado ao job');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Iniciando job de detecção de carrinhos abandonados...');

    // Calcular timestamp de 15 minutos atrás
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // Buscar checkout events não processados criados há mais de 15min
    const { data: abandonedCheckouts, error: fetchError } = await supabase
      .from('webhook_events')
      .select('*')
      .in('event_type', ['checkout_created', 'checkout_updated'])
      .eq('processed', false)
      .lt('created_at', fifteenMinutesAgo)
      .not('customer_email', 'is', null)
      .not('checkout_url', 'is', null);

    if (fetchError) {
      console.error('❌ Erro ao buscar checkouts:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!abandonedCheckouts || abandonedCheckouts.length === 0) {
      console.log('✅ Nenhum carrinho abandonado encontrado');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'Nenhum carrinho abandonado'
      });
    }

    console.log(`📦 ${abandonedCheckouts.length} carrinhos abandonados encontrados`);

    let emailsSent = 0;
    let errors = 0;

    // Processar cada checkout abandonado
    for (const checkout of abandonedCheckouts) {
      try {
        // Verificar se já enviamos email para este checkout
        const { data: existingAction } = await supabase
          .from('automated_actions')
          .select('id')
          .eq('webhook_event_id', checkout.id)
          .eq('action_type', 'email_sent')
          .single();

        if (existingAction) {
          console.log(`⏭️  Email já enviado para checkout ${checkout.id}, pulando...`);
          // Marcar como processado mesmo assim
          await supabase
            .from('webhook_events')
            .update({ processed: true })
            .eq('id', checkout.id);
          continue;
        }

        // Preparar itens do carrinho
        const items = checkout.line_items || [];
        if (items.length === 0) {
          console.log(`⏭️  Carrinho ${checkout.id} sem itens, pulando...`);
          await supabase
            .from('webhook_events')
            .update({ processed: true })
            .eq('id', checkout.id);
          continue;
        }

        // Enviar email de recuperação
        const result = await sendAbandonedCartEmail({
          webhookEventId: checkout.id,
          customerEmail: checkout.customer_email,
          customerName: checkout.customer_name || checkout.customer_email.split('@')[0],
          items: items.map((item: any) => ({
            title: item.title || 'Produto',
            quantity: item.quantity || 1,
            price: item.price || '0.00',
            image_url: item.image_url,
          })),
          cartTotal: checkout.cart_value?.toString() || '0.00',
          currency: checkout.currency || 'R$',
          checkoutUrl: checkout.checkout_url,
          userId: checkout.user_id,
          integrationId: checkout.integration_id,
        });

        if (result.success) {
          console.log(`✅ Email enviado para ${checkout.customer_email}`);
          emailsSent++;
        } else {
          console.error(`❌ Erro ao enviar email para ${checkout.customer_email}:`, result.error);
          errors++;
        }
      } catch (error: any) {
        console.error(`❌ Erro ao processar checkout ${checkout.id}:`, error);
        errors++;
      }
    }

    console.log(`✅ Job finalizado: ${emailsSent} emails enviados, ${errors} erros`);

    return NextResponse.json({
      success: true,
      processed: abandonedCheckouts.length,
      emailsSent,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Erro no job de detecção:', error);
    return NextResponse.json(
      { error: error.message || 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint para trigger manual (útil para testes)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
