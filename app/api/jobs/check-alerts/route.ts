/**
 * POST /api/jobs/check-alerts
 *
 * Job agendado que verifica condições de alertas e dispara notificações
 * Deve ser chamado por um cron job externo (Vercel Cron, Trigger.dev, etc)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos

// Cliente Supabase com service role para acessar todos os dados
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting alerts check job...');

    // Buscar todos os alertas ativos
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from('alert_configs')
      .select('*')
      .eq('is_active', true);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return NextResponse.json({ error: alertsError.message }, { status: 500 });
    }

    if (!alerts || alerts.length === 0) {
      console.log('✅ No active alerts to check');
      return NextResponse.json({ message: 'No active alerts', checked: 0 });
    }

    console.log(`📊 Checking ${alerts.length} active alerts...`);

    let triggeredCount = 0;

    // Verificar cada alerta
    for (const alert of alerts) {
      try {
        const shouldTrigger = await checkAlertCondition(alert);

        if (shouldTrigger) {
          // Disparar alerta
          await triggerAlert(alert, shouldTrigger.triggerData);
          triggeredCount++;
        }

        // Atualizar last_checked_at
        await supabaseAdmin
          .from('alert_configs')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', alert.id);
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }

    console.log(`✅ Alerts check complete. Triggered: ${triggeredCount}/${alerts.length}`);

    return NextResponse.json({
      success: true,
      checked: alerts.length,
      triggered: triggeredCount,
    });
  } catch (error: any) {
    console.error('Error in check-alerts job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Verifica se a condição do alerta foi atingida
 */
async function checkAlertCondition(alert: any): Promise<false | { triggerData: any }> {
  const { alert_type, config, user_id } = alert;

  // Buscar meta_connection do usuário
  const { data: metaConnection } = await supabaseAdmin
    .from('meta_connections')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (!metaConnection || !metaConnection.primary_ad_account_id) {
    return false;
  }

  // Buscar insights recentes (últimas 24h)
  const accountId = metaConnection.primary_ad_account_id;

  // Aqui você faria uma chamada real à API do Meta para obter dados atuais
  // Por enquanto, vou retornar false para não disparar alertas sem dados reais

  // TODO: Implementar lógica real de verificação para cada tipo de alerta
  // const currentMetrics = await fetchMetaInsights(metaConnection, accountId);

  switch (alert_type) {
    case 'cpc_increase':
      // Verificar se CPC aumentou X% comparado com período anterior
      // const threshold = config.threshold; // ex: 20 (%)
      // const period = config.period; // ex: '24h', '7d', '30d'
      // if (currentCPC > previousCPC * (1 + threshold/100)) {
      //   return { triggerData: { current_cpc: currentCPC, previous_cpc: previousCPC } };
      // }
      break;

    case 'roas_decrease':
      // Verificar se ROAS caiu abaixo do mínimo
      // const minROAS = config.threshold;
      // if (currentROAS < minROAS) {
      //   return { triggerData: { current_roas: currentROAS, min_roas: minROAS } };
      // }
      break;

    case 'spend_limit':
      // Verificar se gasto atingiu o limite
      // const limit = config.threshold;
      // const period = config.period; // 'daily', 'weekly', 'monthly'
      // if (currentSpend >= limit) {
      //   return { triggerData: { current_spend: currentSpend, limit } };
      // }
      break;

    // Outros tipos...
  }

  return false;
}

/**
 * Dispara um alerta (cria histórico e envia notificações)
 */
async function triggerAlert(alert: any, triggerData: any) {
  console.log(`🚨 Triggering alert ${alert.id}: ${alert.name}`);

  // Criar registro no histórico
  const { error: historyError } = await supabaseAdmin
    .from('alert_history')
    .insert({
      alert_config_id: alert.id,
      user_id: alert.user_id,
      triggered_at: new Date().toISOString(),
      trigger_data: triggerData,
      status: 'pending',
      message: generateAlertMessage(alert, triggerData),
      is_read: false,
    });

  if (historyError) {
    console.error('Error creating alert history:', historyError);
    return;
  }

  // Atualizar last_triggered_at na config
  await supabaseAdmin
    .from('alert_configs')
    .update({ last_triggered_at: new Date().toISOString() })
    .eq('id', alert.id);

  // Enviar notificações pelos canais configurados
  const channels = alert.notification_channels || ['email'];

  for (const channel of channels) {
    try {
      if (channel === 'email') {
        // TODO: Enviar email via Resend
        console.log(`📧 Would send email for alert ${alert.id}`);
      } else if (channel === 'in_app') {
        // Já criou o histórico, in-app vai pegar de lá
        console.log(`🔔 In-app notification created for alert ${alert.id}`);
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error);
    }
  }
}

/**
 * Gera mensagem descritiva do alerta
 */
function generateAlertMessage(alert: any, triggerData: any): string {
  const { alert_type, name, config } = alert;

  switch (alert_type) {
    case 'cpc_increase':
      return `O CPC aumentou ${config.threshold}% e atingiu R$ ${triggerData.current_cpc?.toFixed(2)}`;

    case 'roas_decrease':
      return `O ROAS caiu para ${triggerData.current_roas?.toFixed(2)} (abaixo do mínimo de ${config.threshold})`;

    case 'ctr_decrease':
      return `O CTR caiu para ${triggerData.current_ctr?.toFixed(2)}% (abaixo do mínimo de ${config.threshold}%)`;

    case 'spend_limit':
      return `O gasto atingiu R$ ${triggerData.current_spend?.toFixed(2)} (limite: R$ ${config.threshold})`;

    case 'cart_abandonment':
      return `A taxa de abandono atingiu ${triggerData.abandonment_rate?.toFixed(2)}% (máximo: ${config.threshold}%)`;

    case 'no_conversions':
      return `Sem conversões há ${config.days} dias`;

    default:
      return `Alerta "${name}" foi disparado`;
  }
}
