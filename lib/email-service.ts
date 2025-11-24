import { resend, FROM_EMAIL } from './resend';
import { teamInviteTemplate, notificationEmailTemplate, reportEmailTemplate, welcomeEmailTemplate } from './email-templates';
import { createClient } from '@supabase/supabase-js';

// Função para criar cliente Supabase (evita erro de build)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Retornar null se não configurado (desenvolvimento local)
    return null;
  }

  return createClient(url, key);
}

export async function sendTeamInviteEmail(params: {
  to: string;
  inviteeName: string;
  inviterName: string;
  role: string;
  token?: string;
}) {
  try {
    // URL de convite com token único
    const inviteUrl = params.token
      ? `https://app.agenciagtx.com.br/api/accept-invite?token=${params.token}`
      : `https://app.agenciagtx.com.br/cadastro?email=${encodeURIComponent(params.to)}&role=${params.role}`;

    const subject = `Você foi convidado para o GTX Sistema`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: teamInviteTemplate({
        inviteeName: params.inviteeName,
        inviterName: params.inviterName,
        role: params.role,
        inviteUrl,
      }),
    });

    if (error) {
      console.error('Erro ao enviar email de convite:', error);
      return { success: false, error: error.message };
    }

    // Salvar log do email enviado
    if (data?.id) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('EmailLog').insert({
          emailId: data.id,
          type: 'TEAM_INVITE',
          to: params.to,
          subject,
          status: 'SENT',
          metadata: {
            inviteeName: params.inviteeName,
            inviterName: params.inviterName,
            role: params.role,
          },
        });
      }
    }

    console.log('Email de convite enviado:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao enviar email de convite:', error);
    return { success: false, error: error.message };
  }
}

export async function sendNotificationEmail(params: {
  to: string;
  userName: string;
  title: string;
  message: string;
  severity: string;
}) {
  try {
    const subject = `[${params.severity}] ${params.title}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: notificationEmailTemplate({
        userName: params.userName,
        title: params.title,
        message: params.message,
        severity: params.severity,
      }),
    });

    if (error) {
      console.error('Erro ao enviar email de notificação:', error);
      return { success: false, error: error.message };
    }

    // Salvar log do email enviado
    if (data?.id) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('EmailLog').insert({
          emailId: data.id,
          type: 'NOTIFICATION',
          to: params.to,
          subject,
          status: 'SENT',
          metadata: {
            userName: params.userName,
            title: params.title,
            severity: params.severity,
          },
        });
      }
    }

    console.log('Email de notificação enviado:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao enviar email de notificação:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
  tempPassword: string;
}) {
  try {
    const subject = `Bem-vindo ao Sistema GTX!`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: welcomeEmailTemplate({
        to: params.to,
        userName: params.userName,
        tempPassword: params.tempPassword,
      }),
    });

    if (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      return { success: false, error: error.message };
    }

    console.log('Email de boas-vindas enviado:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    return { success: false, error: error.message };
  }
}

export async function sendReportEmail(params: {
  to: string;
  userName: string;
  reportName: string;
  cadence: string;
  summary: string;
}) {
  try {
    const subject = `📊 Relatório: ${params.reportName}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: reportEmailTemplate({
        userName: params.userName,
        reportName: params.reportName,
        cadence: params.cadence,
        summary: params.summary,
      }),
    });

    if (error) {
      console.error('Erro ao enviar email de relatório:', error);
      return { success: false, error: error.message };
    }

    // Salvar log do email enviado
    if (data?.id) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('EmailLog').insert({
          emailId: data.id,
          type: 'REPORT',
          to: params.to,
          subject,
          status: 'SENT',
          metadata: {
            userName: params.userName,
            reportName: params.reportName,
            cadence: params.cadence,
          },
        });
      }
    }

    console.log('Email de relatório enviado:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao enviar email de relatório:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envia email de recuperação de carrinho abandonado
 */
import {
  getAbandonedCartEmailHTML,
  getAbandonedCartEmailText,
  getAbandonedCartEmailSubject,
  type AbandonedCartEmailData,
} from './abandoned-cart-templates';

interface SendAbandonedCartEmailParams {
  webhookEventId: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    title: string;
    quantity: number;
    price: string;
    image_url?: string;
  }>;
  cartTotal: string;
  currency: string;
  checkoutUrl: string;
  userId: string;
  integrationId: string;
}

export async function sendAbandonedCartEmail(
  params: SendAbandonedCartEmailParams
): Promise<{ success: boolean; error?: string; actionId?: string }> {
  try {
    console.log('📧 Preparando email de recuperação:', {
      email: params.customerEmail,
      webhookEventId: params.webhookEventId,
    });

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase não configurado' };
    }

    // Buscar configurações de email do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_recovery_settings, nome')
      .eq('id', params.userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return { success: false, error: 'Perfil não encontrado' };
    }

    const emailSettings = profile.email_recovery_settings || {};

    // Verificar se recuperação está habilitada
    if (emailSettings.enabled === false) {
      console.log('⚠️ Recuperação de email desabilitada para este usuário');
      return { success: false, error: 'Recuperação desabilitada' };
    }

    // Buscar integração para pegar nome da loja
    const { data: integration } = await supabase
      .from('integrations')
      .select('store_name, settings')
      .eq('id', params.integrationId)
      .single();

    const storeName = integration?.store_name || 'Nossa Loja';
    const logoUrl = emailSettings.logo_url || integration?.settings?.logo_url;
    const customMessage = emailSettings.custom_message;

    // Preparar dados do email
    const emailData: AbandonedCartEmailData = {
      customerName: params.customerName || 'Cliente',
      items: params.items,
      cartTotal: params.cartTotal,
      currency: params.currency,
      checkoutUrl: params.checkoutUrl,
      storeName,
      logoUrl,
      customMessage,
      senderName: emailSettings.sender_name || storeName,
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
      to: params.customerEmail,
      replyTo,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (emailError) {
      console.error('❌ Erro ao enviar email via Resend:', emailError);
      return { success: false, error: emailError.message };
    }

    console.log('✅ Email enviado via Resend:', emailResult?.id);

    // Salvar ação automática no banco
    const { data: action, error: actionError } = await supabase
      .from('automated_actions')
      .insert({
        webhook_event_id: params.webhookEventId,
        action_type: 'email_sent',
        channel: 'email',
        recipient: params.customerEmail,
        email_subject: subject,
        email_body_html: htmlContent,
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: emailResult?.id,
      })
      .select('id')
      .single();

    if (actionError) {
      console.error('⚠️ Erro ao salvar automated_action:', actionError);
      // Não retorna erro pois o email foi enviado com sucesso
    }

    // Marcar webhook_event como processado
    await supabase
      .from('webhook_events')
      .update({ processed: true })
      .eq('id', params.webhookEventId);

    return {
      success: true,
      actionId: action?.id,
    };
  } catch (error: any) {
    console.error('❌ Erro ao enviar email de recuperação:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
    };
  }
}

/**
 * Registra abertura de email (tracking pixel)
 */
export async function trackEmailOpen(actionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase
    .from('automated_actions')
    .update({
      opened: true,
      opened_at: new Date().toISOString(),
    })
    .eq('id', actionId);
}

/**
 * Registra clique em link do email
 */
export async function trackEmailClick(actionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase
    .from('automated_actions')
    .update({
      clicked: true,
      clicked_at: new Date().toISOString(),
    })
    .eq('id', actionId);
}
