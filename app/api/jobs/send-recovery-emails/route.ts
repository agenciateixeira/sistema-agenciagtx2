/**
 * GET /api/jobs/send-recovery-emails
 * Job automático que envia emails de recuperação para carrinhos abandonados
 * Pode ser executado via Vercel Cron ou manualmente
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Proteção: apenas chamadas autorizadas
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';

  // Aceitar: Bearer token ou Vercel Cron
  return (
    authHeader === `Bearer ${cronSecret}` ||
    request.headers.get('user-agent')?.includes('vercel-cron') === true
  );
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autorização
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Iniciando job de envio automático de emails de recuperação...');

    // Buscar configurações de todos os usuários com recuperação ativa
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email_recovery_settings')
      .not('email_recovery_settings', 'is', null);

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      throw profilesError;
    }

    console.log(`📋 Encontrados ${profiles?.length || 0} perfis com configurações`);

    let totalSent = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const results: any[] = [];

    // Processar cada usuário
    for (const profile of profiles || []) {
      const settings = profile.email_recovery_settings || {};

      // Verificar se recuperação está habilitada
      if (settings.enabled === false) {
        console.log(`⏭️  Usuário ${profile.id}: recuperação desabilitada`);
        continue;
      }

      // Configurações padrão
      const delayHours = settings.delay_hours || 1; // Padrão: 1 hora após abandono
      const maxEmails = settings.max_emails || 3; // Padrão: máximo 3 emails por carrinho
      const intervalHours = settings.interval_hours || 24; // Padrão: 24h entre emails

      console.log(`👤 Processando usuário ${profile.id}:`);
      console.log(`   - Delay inicial: ${delayHours}h`);
      console.log(`   - Intervalo entre emails: ${intervalHours}h`);
      console.log(`   - Máximo de emails: ${maxEmails}`);

      // Calcular timestamp mínimo (carrinho deve ter pelo menos X horas)
      const minAbandonedTime = new Date();
      minAbandonedTime.setHours(minAbandonedTime.getHours() - delayHours);

      // Buscar carrinhos abandonados deste usuário que precisam de email
      const { data: carts, error: cartsError } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'abandoned')
        .lte('abandoned_at', minAbandonedTime.toISOString())
        .lt('recovery_emails_sent', maxEmails)
        .not('customer_email', 'like', '%sem-email%');

      if (cartsError) {
        console.error(`❌ Erro ao buscar carrinhos do usuário ${profile.id}:`, cartsError);
        totalErrors++;
        continue;
      }

      console.log(`   📦 Encontrados ${carts?.length || 0} carrinhos elegíveis`);

      // Enviar email para cada carrinho
      for (const cart of carts || []) {
        try {
          // Verificar se já passou tempo suficiente desde o último email
          if (cart.last_recovery_email_at) {
            const lastEmailTime = new Date(cart.last_recovery_email_at);
            const hoursSinceLastEmail = (Date.now() - lastEmailTime.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastEmail < intervalHours) {
              console.log(`   ⏳ Carrinho ${cart.id}: aguardando intervalo (${Math.round(hoursSinceLastEmail)}h/${intervalHours}h)`);
              totalSkipped++;
              continue;
            }
          }

          console.log(`   📧 Enviando email #${cart.recovery_emails_sent + 1} para ${cart.customer_email}...`);

          // Chamar endpoint interno de envio de email
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sistema-agenciagtx2.vercel.app';
          const response = await fetch(`${appUrl}/api/recovery/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cartId: cart.id,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Erro ao enviar email');
          }

          console.log(`   ✅ Email enviado: ${cart.customer_email} (total: ${cart.recovery_emails_sent + 1})`);
          totalSent++;
          results.push({
            cartId: cart.id,
            email: cart.customer_email,
            emailNumber: cart.recovery_emails_sent + 1,
            status: 'sent',
          });
        } catch (error: any) {
          console.error(`   ❌ Erro ao enviar para carrinho ${cart.id}:`, error.message);
          totalErrors++;
          results.push({
            cartId: cart.id,
            email: cart.customer_email,
            status: 'error',
            error: error.message,
          });
        }
      }
    }

    console.log(`\n✅ Job concluído:`);
    console.log(`   - Emails enviados: ${totalSent}`);
    console.log(`   - Pulados: ${totalSkipped}`);
    console.log(`   - Erros: ${totalErrors}`);

    return NextResponse.json({
      success: true,
      summary: {
        sent: totalSent,
        skipped: totalSkipped,
        errors: totalErrors,
        timestamp: new Date().toISOString(),
      },
      results,
    });
  } catch (error: any) {
    console.error('❌ Erro no job de recuperação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
