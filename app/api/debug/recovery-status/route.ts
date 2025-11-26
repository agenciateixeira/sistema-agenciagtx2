/**
 * GET /api/debug/recovery-status
 * Debug endpoint para verificar status da recuperação de carrinhos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório. Use: ?userId=seu-user-id' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug: Verificando status de recuperação para:', userId);

    // 1. Buscar perfil e configurações
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_recovery_settings, nome')
      .eq('id', userId)
      .single();

    // 2. Buscar carrinhos abandonados (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: carts, error: cartsError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('user_id', userId)
      .gte('abandoned_at', sevenDaysAgo.toISOString())
      .order('abandoned_at', { ascending: false })
      .limit(10);

    // 3. Buscar emails enviados (últimos 7 dias)
    const { data: emails, error: emailsError } = await supabase
      .from('automated_actions')
      .select('*')
      .eq('action_type', 'email_sent')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // 4. Buscar webhooks recebidos (últimos 7 dias)
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // 5. Buscar integrações
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('id, platform, store_name, store_url')
      .eq('user_id', userId);

    const settings = profile?.email_recovery_settings || {};
    const now = new Date();

    // Análise dos carrinhos
    const cartsAnalysis = (carts || []).map(cart => {
      const abandonedAt = new Date(cart.abandoned_at);
      const hoursSinceAbandoned = (now.getTime() - abandonedAt.getTime()) / (1000 * 60 * 60);
      const delayHours = settings.delay_hours || 1;
      const maxEmails = settings.max_emails || 3;

      const isEligible =
        cart.status === 'abandoned' &&
        !cart.customer_email.includes('sem-email') &&
        hoursSinceAbandoned >= delayHours &&
        cart.recovery_emails_sent < maxEmails;

      const reasons = [];
      if (cart.status !== 'abandoned') reasons.push(`Status: ${cart.status}`);
      if (cart.customer_email.includes('sem-email')) reasons.push('Sem email válido');
      if (hoursSinceAbandoned < delayHours) reasons.push(`Aguardando ${delayHours}h (faz ${hoursSinceAbandoned.toFixed(1)}h)`);
      if (cart.recovery_emails_sent >= maxEmails) reasons.push(`Atingiu max (${cart.recovery_emails_sent}/${maxEmails})`);

      return {
        id: cart.id,
        email: cart.customer_email,
        value: cart.total_value,
        abandoned_at: cart.abandoned_at,
        hours_since: hoursSinceAbandoned.toFixed(1),
        emails_sent: cart.recovery_emails_sent,
        is_eligible: isEligible,
        reasons: reasons.length > 0 ? reasons : ['Elegível para envio'],
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        id: userId,
        name: profile?.nome,
      },
      settings: {
        enabled: settings.enabled ?? false,
        delay_hours: settings.delay_hours || 1,
        interval_hours: settings.interval_hours || 24,
        max_emails: settings.max_emails || 3,
        has_sender_email: !!settings.sender_email,
        has_logo: !!settings.logo_url,
      },
      integrations: integrations?.map(i => ({
        platform: i.platform,
        store: i.store_name,
      })) || [],
      stats: {
        total_carts: carts?.length || 0,
        eligible_carts: cartsAnalysis.filter(c => c.is_eligible).length,
        total_webhooks: webhooks?.length || 0,
        total_emails_sent: emails?.length || 0,
      },
      recent_carts: cartsAnalysis,
      recent_emails: emails?.map(e => ({
        recipient: e.recipient,
        status: e.status,
        sent_at: e.sent_at,
        opened: e.opened,
        clicked: e.clicked,
        converted: e.converted,
      })) || [],
      recent_webhooks: webhooks?.map(w => ({
        type: w.event_type,
        email: w.customer_email,
        created_at: w.created_at,
        processed: w.processed,
      })) || [],
      errors: {
        profile: profileError?.message,
        carts: cartsError?.message,
        emails: emailsError?.message,
        webhooks: webhooksError?.message,
        integrations: integrationsError?.message,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro no debug:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
