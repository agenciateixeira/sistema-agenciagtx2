/**
 * POST /api/recovery/send-email
 * Envia email de recuperação manual para um carrinho abandonado
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL } from '@/lib/resend';
import {
  getAbandonedCartEmailHTML,
  getAbandonedCartEmailText,
  getAbandonedCartEmailSubject,
  type AbandonedCartEmailData,
} from '@/lib/abandoned-cart-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json();

    if (!cartId) {
      return NextResponse.json(
        { error: 'cartId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📧 Enviando email de recuperação para carrinho:', cartId);

    // Buscar carrinho abandonado
    const { data: cart, error: cartError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('id', cartId)
      .single();

    if (cartError || !cart) {
      console.error('❌ Carrinho não encontrado:', cartError);
      return NextResponse.json(
        { error: 'Carrinho não encontrado' },
        { status: 404 }
      );
    }

    // Validar se tem email
    if (!cart.customer_email || cart.customer_email.includes('sem-email@placeholder.com')) {
      return NextResponse.json(
        { error: 'Este carrinho não possui email disponível' },
        { status: 400 }
      );
    }

    // Validar se tem URL de checkout
    if (!cart.checkout_url) {
      return NextResponse.json(
        { error: 'URL de checkout não disponível' },
        { status: 400 }
      );
    }

    // Buscar configurações do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_recovery_settings, nome')
      .eq('id', cart.user_id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    const emailSettings = profile.email_recovery_settings || {};

    // Verificar se recuperação está habilitada
    if (emailSettings.enabled === false) {
      return NextResponse.json(
        { error: 'Recuperação de email desabilitada' },
        { status: 400 }
      );
    }

    // Buscar integração para nome da loja
    const { data: integration } = await supabase
      .from('integrations')
      .select('store_name, settings')
      .eq('id', cart.integration_id)
      .single();

    const storeName = integration?.store_name || 'Nossa Loja';
    const logoUrl = emailSettings.logo_url || integration?.settings?.logo_url;
    const customMessage = emailSettings.custom_message;

    // Criar registro de ação primeiro (para tracking)
    const { data: action, error: actionError } = await supabase
      .from('automated_actions')
      .insert({
        action_type: 'email_sent',
        channel: 'email',
        recipient: cart.customer_email,
        status: 'pending',
        integration_id: cart.integration_id,
      })
      .select('id')
      .single();

    if (actionError || !action) {
      console.error('❌ Erro ao criar registro de ação:', actionError);
      return NextResponse.json(
        { error: 'Erro ao criar registro de ação' },
        { status: 500 }
      );
    }

    const actionId = action.id;

    // Preparar dados do email
    const emailData: AbandonedCartEmailData = {
      customerName: cart.customer_name || 'Cliente',
      items: cart.cart_items || [],
      cartTotal: cart.total_value.toString(),
      currency: cart.currency || 'BRL',
      checkoutUrl: cart.checkout_url,
      storeName,
      logoUrl,
      customMessage,
      senderName: emailSettings.sender_name || storeName,
      actionId, // Para tracking
    };

    const subject = getAbandonedCartEmailSubject(emailData);
    const htmlContent = getAbandonedCartEmailHTML(emailData);
    const textContent = getAbandonedCartEmailText(emailData);

    // Configurar remetente
    const senderEmail = emailSettings.sender_email || FROM_EMAIL;
    const senderName = emailSettings.sender_name || storeName;
    const from = senderEmail.includes('@') ? `${senderName} <${senderEmail}>` : FROM_EMAIL;
    const replyTo = emailSettings.reply_to || senderEmail;

    // Enviar email via Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from,
      to: cart.customer_email,
      replyTo,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (emailError) {
      console.error('❌ Erro ao enviar email via Resend:', emailError);

      // Atualizar status para failed
      await supabase
        .from('automated_actions')
        .update({ status: 'failed' })
        .eq('id', actionId);

      return NextResponse.json(
        { error: emailError.message || 'Erro ao enviar email' },
        { status: 500 }
      );
    }

    console.log('✅ Email enviado via Resend:', emailResult?.id);

    // Atualizar ação com informações do email
    await supabase
      .from('automated_actions')
      .update({
        email_subject: subject,
        email_body_html: htmlContent,
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: emailResult?.id,
      })
      .eq('id', actionId);

    // Atualizar contadores no carrinho
    const { error: updateError } = await supabase
      .from('abandoned_carts')
      .update({
        recovery_emails_sent: (cart.recovery_emails_sent || 0) + 1,
        last_recovery_email_at: new Date().toISOString(),
      })
      .eq('id', cartId);

    if (updateError) {
      console.error('⚠️ Erro ao atualizar contadores do carrinho:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email de recuperação enviado com sucesso',
      actionId: action.id,
      emailId: emailResult?.id,
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar email de recuperação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}
