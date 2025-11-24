import { NextRequest, NextResponse } from 'next/server';
import { trackEmailClick } from '@/lib/email-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/track/click/[actionId]?url=...
 * Registra clique e redireciona para URL original
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const { actionId } = params;
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Registrar clique no email
    await trackEmailClick(actionId);

    // Buscar o checkout_url do webhook_event
    const { data: action } = await supabase
      .from('automated_actions')
      .select('webhook_event_id')
      .eq('id', actionId)
      .single();

    if (action?.webhook_event_id) {
      const { data: webhookEvent } = await supabase
        .from('webhook_events')
        .select('checkout_url')
        .eq('id', action.webhook_event_id)
        .single();

      if (webhookEvent?.checkout_url) {
        // Redirecionar para o checkout
        return NextResponse.redirect(webhookEvent.checkout_url, 302);
      }
    }

    // Fallback: redirecionar para URL fornecida
    return NextResponse.redirect(targetUrl, 302);
  } catch (error) {
    console.error('❌ Erro ao registrar clique:', error);

    // Em caso de erro, redirecionar para URL fornecida
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (targetUrl) {
      return NextResponse.redirect(targetUrl, 302);
    }

    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
