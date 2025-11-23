import { resend, FROM_EMAIL } from './resend';
import { teamInviteTemplate, notificationEmailTemplate, reportEmailTemplate } from './email-templates';

export async function sendTeamInviteEmail(params: {
  to: string;
  inviteeName: string;
  inviterName: string;
  role: string;
}) {
  try {
    // URL de convite (em produção seria uma URL com token único)
    const inviteUrl = `https://app.agenciagtx.com.br/cadastro?email=${encodeURIComponent(params.to)}&role=${params.role}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Você foi convidado para o GTX Sistema`,
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
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `[${params.severity}] ${params.title}`,
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
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `📊 Relatório: ${params.reportName}`,
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

    console.log('Email de relatório enviado:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao enviar email de relatório:', error);
    return { success: false, error: error.message };
  }
}
