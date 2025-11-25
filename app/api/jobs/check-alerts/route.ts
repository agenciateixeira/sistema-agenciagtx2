/**
 * POST /api/jobs/check-alerts
 *
 * Job agendado que verifica condições de alertas e dispara notificações
 * Deve ser chamado por um cron job externo (Vercel Cron, Trigger.dev, etc)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { alertEmailTemplate } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos

const resend = new Resend(process.env.RESEND_API_KEY!);

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
 * Busca métricas do Meta Ads
 */
async function fetchMetaInsights(metaConnection: any, datePreset: string) {
  try {
    const accountId = metaConnection.primary_ad_account_id;
    const accessToken = metaConnection.access_token;

    const url = `https://graph.facebook.com/v18.0/act_${accountId}/insights?fields=spend,impressions,clicks,cpc,ctr,reach,actions,action_values,cost_per_action_type&date_preset=${datePreset}&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('Meta API error:', data.error);
      return null;
    }

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const insights = data.data[0];

    // Calcular ROAS se houver compras
    let roas = 0;
    if (insights.action_values) {
      const purchases = insights.action_values.find((a: any) =>
        a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
        a.action_type === 'purchase'
      );
      if (purchases && parseFloat(insights.spend) > 0) {
        roas = (parseFloat(purchases.value) / parseFloat(insights.spend)) * 100;
      }
    }

    // Calcular conversões
    let conversions = 0;
    if (insights.actions) {
      const purchaseAction = insights.actions.find((a: any) =>
        a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
        a.action_type === 'purchase'
      );
      if (purchaseAction) {
        conversions = parseInt(purchaseAction.value);
      }
    }

    return {
      spend: parseFloat(insights.spend || 0),
      impressions: parseInt(insights.impressions || 0),
      clicks: parseInt(insights.clicks || 0),
      cpc: parseFloat(insights.cpc || 0),
      ctr: parseFloat(insights.ctr || 0),
      roas,
      conversions,
    };
  } catch (error) {
    console.error('Error fetching Meta insights:', error);
    return null;
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

  switch (alert_type) {
    case 'cpc_increase': {
      const threshold = parseFloat(config.threshold || 20); // % de aumento
      const period = config.period || 'yesterday'; // período de comparação

      // Buscar métricas atuais (hoje)
      const currentMetrics = await fetchMetaInsights(metaConnection, 'today');
      if (!currentMetrics || currentMetrics.cpc === 0) return false;

      // Buscar métricas anteriores (ontem ou período anterior)
      const previousMetrics = await fetchMetaInsights(metaConnection, period);
      if (!previousMetrics || previousMetrics.cpc === 0) return false;

      // Calcular % de aumento
      const increasePercent = ((currentMetrics.cpc - previousMetrics.cpc) / previousMetrics.cpc) * 100;

      if (increasePercent >= threshold) {
        return {
          triggerData: {
            current_cpc: currentMetrics.cpc,
            previous_cpc: previousMetrics.cpc,
            increase_percent: increasePercent,
          },
        };
      }
      break;
    }

    case 'roas_decrease': {
      const minROAS = parseFloat(config.threshold || 100); // ROAS mínimo (%)

      // Buscar métricas atuais
      const currentMetrics = await fetchMetaInsights(metaConnection, 'today');
      if (!currentMetrics) return false;

      if (currentMetrics.roas < minROAS && currentMetrics.roas > 0) {
        return {
          triggerData: {
            current_roas: currentMetrics.roas,
            min_roas: minROAS,
          },
        };
      }
      break;
    }

    case 'ctr_decrease': {
      const minCTR = parseFloat(config.threshold || 1); // CTR mínimo (%)

      // Buscar métricas atuais
      const currentMetrics = await fetchMetaInsights(metaConnection, 'today');
      if (!currentMetrics) return false;

      if (currentMetrics.ctr < minCTR && currentMetrics.ctr > 0) {
        return {
          triggerData: {
            current_ctr: currentMetrics.ctr,
            min_ctr: minCTR,
          },
        };
      }
      break;
    }

    case 'spend_limit': {
      const limit = parseFloat(config.threshold || 1000); // Limite de gasto
      const period = config.period || 'today'; // 'today', 'this_week', 'this_month'

      // Buscar métricas do período
      const metrics = await fetchMetaInsights(metaConnection, period);
      if (!metrics) return false;

      if (metrics.spend >= limit) {
        return {
          triggerData: {
            current_spend: metrics.spend,
            limit,
            period,
          },
        };
      }
      break;
    }

    case 'no_conversions': {
      const days = parseInt(config.days || 3); // Número de dias sem conversão

      // Verificar cada um dos últimos X dias
      let hasConversions = false;
      for (let i = 0; i < days; i++) {
        const datePreset = i === 0 ? 'today' : i === 1 ? 'yesterday' : `last_${i}d`;
        const metrics = await fetchMetaInsights(metaConnection, datePreset);

        if (metrics && metrics.conversions > 0) {
          hasConversions = true;
          break;
        }
      }

      if (!hasConversions) {
        return {
          triggerData: {
            days_without_conversions: days,
          },
        };
      }
      break;
    }

    case 'cart_abandonment': {
      // Para esse precisaríamos de dados do banco de cart_recovery
      // Vou buscar a taxa de abandono dos últimos dias
      const { data: abandonedCarts } = await supabaseAdmin
        .from('cart_recovery')
        .select('id, recovered')
        .eq('user_id', user_id)
        .gte('abandoned_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!abandonedCarts || abandonedCarts.length === 0) return false;

      const totalCarts = abandonedCarts.length;
      const recoveredCarts = abandonedCarts.filter(c => c.recovered).length;
      const abandonmentRate = ((totalCarts - recoveredCarts) / totalCarts) * 100;

      const maxRate = parseFloat(config.threshold || 80);

      if (abandonmentRate >= maxRate) {
        return {
          triggerData: {
            abandonment_rate: abandonmentRate,
            max_rate: maxRate,
            total_carts: totalCarts,
            recovered_carts: recoveredCarts,
          },
        };
      }
      break;
    }
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
        await sendAlertEmail(alert, triggerData);
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
 * Envia email de alerta via Resend
 */
async function sendAlertEmail(alert: any, triggerData: any) {
  try {
    // Buscar dados do usuário
    const { data: profile } = await supabaseAdmin
      .from('profiles_with_email')
      .select('nome, email')
      .eq('id', alert.user_id)
      .single();

    if (!profile || !profile.email) {
      console.error(`User ${alert.user_id} has no email`);
      return;
    }

    const message = generateAlertMessage(alert, triggerData);

    const emailHTML = alertEmailTemplate({
      userName: profile.nome || 'Usuário',
      alertName: alert.name,
      alertType: alert.alert_type,
      message,
      triggerData,
    });

    const { error } = await resend.emails.send({
      from: 'Sistema GTX <noreply@agenciagtx.com.br>',
      to: profile.email,
      subject: `🚨 Alerta: ${alert.name}`,
      html: emailHTML,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log(`📧 Email sent to ${profile.email} for alert ${alert.id}`);
  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
}

/**
 * Gera mensagem descritiva do alerta
 */
function generateAlertMessage(alert: any, triggerData: any): string {
  const { alert_type, name, config } = alert;

  switch (alert_type) {
    case 'cpc_increase':
      return `🔺 O CPC aumentou ${triggerData.increase_percent?.toFixed(1)}% e passou de R$ ${triggerData.previous_cpc?.toFixed(2)} para R$ ${triggerData.current_cpc?.toFixed(2)}`;

    case 'roas_decrease':
      return `📉 O ROAS caiu para ${triggerData.current_roas?.toFixed(2)}% (abaixo do mínimo de ${triggerData.min_roas}%)`;

    case 'ctr_decrease':
      return `📊 O CTR está em ${triggerData.current_ctr?.toFixed(2)}% (abaixo do mínimo de ${triggerData.min_ctr}%)`;

    case 'spend_limit':
      return `💰 O gasto atingiu R$ ${triggerData.current_spend?.toFixed(2)} (limite configurado: R$ ${triggerData.limit})`;

    case 'cart_abandonment':
      return `🛒 Taxa de abandono em ${triggerData.abandonment_rate?.toFixed(1)}% (${triggerData.recovered_carts}/${triggerData.total_carts} carrinhos recuperados)`;

    case 'no_conversions':
      return `⚠️ Sem conversões há ${triggerData.days_without_conversions} dias`;

    default:
      return `🔔 Alerta "${name}" foi disparado`;
  }
}
