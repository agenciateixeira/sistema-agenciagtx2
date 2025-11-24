import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/debug/webhooks
 * Debug endpoint para verificar configuração de webhooks
 */
export async function GET(request: NextRequest) {
  try {
    // Buscar todas as integrações
    const { data: integrations, error: intError } = await supabase
      .from('integrations')
      .select('id, store_name, store_url, platform, webhook_secret, created_at')
      .eq('platform', 'shopify');

    if (intError) {
      return NextResponse.json({ error: intError.message }, { status: 500 });
    }

    // Buscar últimos webhook events (últimas 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: webhookEvents, error: webhookError } = await supabase
      .from('webhook_events')
      .select('id, event_type, customer_email, checkout_url, created_at, cart_value')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // Buscar últimas automated actions (últimas 24h)
    const { data: actions, error: actionsError } = await supabase
      .from('automated_actions')
      .select('id, action_type, recipient, status, created_at, sent_at')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // Verificar configurações de email recovery
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nome, email_recovery_settings')
      .not('email_recovery_settings', 'is', null);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        integrations: integrations?.map(int => ({
          id: int.id,
          store_name: int.store_name,
          store_url: int.store_url,
          has_webhook_secret: !!int.webhook_secret,
          webhook_secret_length: int.webhook_secret?.length || 0,
          created_at: int.created_at,
        })) || [],
        webhook_events_last_24h: {
          count: webhookEvents?.length || 0,
          events: webhookEvents || [],
        },
        automated_actions_last_24h: {
          count: actions?.length || 0,
          actions: actions || [],
        },
        email_recovery_configs: {
          count: profiles?.length || 0,
          profiles: profiles?.map(p => ({
            id: p.id,
            nome: p.nome,
            has_resend_key: !!(p.email_recovery_settings as any)?.resend_api_key,
            enabled: (p.email_recovery_settings as any)?.enabled || false,
          })) || [],
        },
      },
      troubleshooting: {
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://sistema-agenciagtx2.vercel.app'}/api/webhook/shopify`,
        expected_headers: [
          'x-shopify-hmac-sha256',
          'x-shopify-topic',
          'x-shopify-shop-domain',
        ],
        notes: [
          'Webhooks devem ser configurados na Shopify: Settings > Notifications > Webhooks',
          'Tópicos necessários: checkouts/create, checkouts/update, orders/create',
          'O store_url na integração deve corresponder ao x-shopify-shop-domain do webhook',
          'Carrinhos só são elegíveis após 30 minutos de abandono',
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
