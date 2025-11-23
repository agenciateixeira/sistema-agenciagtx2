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
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Sistema GTX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <tr>
            <td style="background-color: #22c55e; padding: 40px 30px; text-align: center;">
              <img src="https://app.agenciagtx.com.br/favicon.png" alt="GTX Logo" style="width: 64px; height: 64px; margin: 0 auto 16px auto; display: block;" />
              <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Bem-vindo ao Sistema GTX!</h2>
              <p style="margin: 10px 0 0 0; color: #dcfce7; font-size: 15px; font-weight: 500;">Gestão de Marketing e Analytics</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 22px; font-weight: 600;">Olá, ${params.userName}!</h3>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px;">Sua conta foi criada com sucesso! 🎉</p>

              <!-- SENHA DESTACADA -->
              <div style="background-color: #15803d; border-radius: 12px; padding: 32px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 12px 0; color: #dcfce7; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">🔑 SUA SENHA DE PRIMEIRO ACESSO</p>
                <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 16px 0;">
                  <p style="margin: 0; color: #15803d; font-size: 32px; font-weight: 900; font-family: 'Courier New', monospace; letter-spacing: 4px;">${params.tempPassword}</p>
                </div>
                <p style="margin: 16px 0 0 0; color: #dcfce7; font-size: 13px;">Use esta senha para fazer seu primeiro login</p>
              </div>

              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 24px; margin: 30px 0;">
                <h4 style="margin: 0 0 16px 0; color: #15803d; font-size: 16px; font-weight: 600;">📋 Suas Credenciais Completas</h4>
                <div style="background-color: #ffffff; border-radius: 6px; padding: 16px; margin-bottom: 12px;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email</p>
                  <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">${params.to}</p>
                </div>
                <div style="background-color: #ffffff; border-radius: 6px; padding: 16px;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Senha</p>
                  <p style="margin: 0; color: #15803d; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace;">${params.tempPassword}</p>
                </div>
              </div>

              <!-- Instruções de Acesso -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h4 style="margin: 0 0 16px 0; color: #1f2937; font-size: 15px; font-weight: 600;">📋 Instruções de Acesso</h4>
                <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Clique no botão "Acessar Sistema" abaixo</li>
                  <li style="margin-bottom: 8px;">Digite seu email e a senha temporária acima</li>
                  <li style="margin-bottom: 8px;">Após o login, vá em <strong>Perfil → Alterar Senha</strong></li>
                  <li>Escolha uma nova senha segura e salve</li>
                </ol>
              </div>

              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  ⚠️ <strong>Importante:</strong> Por segurança, altere sua senha no primeiro acesso.
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://app.agenciagtx.com.br/login" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Acessar Sistema →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 500;">Sistema GTX</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2024 Agência GTX. Todos os direitos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
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
