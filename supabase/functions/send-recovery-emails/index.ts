// Edge Function: send-recovery-emails
// Envia emails de recuperação automaticamente para carrinhos abandonados

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AbandonedCart {
  id: string;
  customer_email: string;
  customer_name: string | null;
  total_value: number;
  currency: string;
  cart_items: any[];
  checkout_url: string;
  abandoned_at: string;
  recovery_emails_sent: number;
  last_recovery_email_at: string | null;
  user_id: string;
  integration_id: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando envio automático de emails de recuperação...');

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      const delayHours = settings.delay_hours || 1; // Padrão: 1 hora
      const maxEmails = settings.max_emails || 3; // Padrão: 3 emails

      console.log(`👤 Processando usuário ${profile.id} (delay: ${delayHours}h, max: ${maxEmails})`);

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

      console.log(`   📦 Encontrados ${carts?.length || 0} carrinhos para enviar email`);

      // Enviar email para cada carrinho
      for (const cart of carts || []) {
        try {
          // Verificar se já passou tempo suficiente desde o último email
          if (cart.last_recovery_email_at) {
            const lastEmailTime = new Date(cart.last_recovery_email_at);
            const hoursSinceLastEmail = (Date.now() - lastEmailTime.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastEmail < delayHours) {
              console.log(`   ⏳ Carrinho ${cart.id}: ainda não passou ${delayHours}h desde último email`);
              totalSkipped++;
              continue;
            }
          }

          console.log(`   📧 Enviando email para ${cart.customer_email}...`);

          // Chamar endpoint interno de envio de email
          const appUrl = Deno.env.get('APP_URL') || 'https://sistema-agenciagtx2.vercel.app';
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

          console.log(`   ✅ Email enviado com sucesso para ${cart.customer_email}`);
          totalSent++;
          results.push({
            cartId: cart.id,
            email: cart.customer_email,
            status: 'sent',
          });
        } catch (error: any) {
          console.error(`   ❌ Erro ao enviar email para carrinho ${cart.id}:`, error.message);
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

    console.log(`\n✅ Processo concluído:`);
    console.log(`   - Emails enviados: ${totalSent}`);
    console.log(`   - Pulados: ${totalSkipped}`);
    console.log(`   - Erros: ${totalErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          sent: totalSent,
          skipped: totalSkipped,
          errors: totalErrors,
        },
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erro na edge function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
