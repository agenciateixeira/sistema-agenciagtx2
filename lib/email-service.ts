import { resend, FROM_EMAIL } from './resend';
import { teamInviteTemplate, notificationEmailTemplate, reportEmailTemplate } from './email-templates';
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
}) {
  try {
    // URL de convite (em produção seria uma URL com token único)
    const inviteUrl = `https://app.agenciagtx.com.br/cadastro?email=${encodeURIComponent(params.to)}&role=${params.role}`;

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
