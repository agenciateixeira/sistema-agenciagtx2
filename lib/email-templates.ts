export const teamInviteTemplate = (params: {
  inviteeName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}) => {
  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    EDITOR: 'Editor',
    VIEWER: 'Visualizador',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para GTX Sistema</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">GTX Sistema</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Você foi convidado para a equipe</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Olá, ${params.inviteeName}!</h2>

              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>${params.inviterName}</strong> convidou você para fazer parte da equipe no GTX Sistema.
              </p>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Seu nível de acesso</p>
                <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">${roleLabels[params.role] || params.role}</p>
              </div>

              <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Clique no botão abaixo para aceitar o convite e criar sua conta:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${params.inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Se você não esperava este convite, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                © 2024 GTX Sistema. Todos os direitos reservados.
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                Agência GTX - Marketing Digital
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const notificationEmailTemplate = (params: {
  title: string;
  message: string;
  severity: string;
  userName: string;
}) => {
  const severityColors: Record<string, { bg: string; text: string; label: string }> = {
    HIGH: { bg: '#fee2e2', text: '#991b1b', label: 'Alta Prioridade' },
    MEDIUM: { bg: '#fef3c7', text: '#92400e', label: 'Média Prioridade' },
    LOW: { bg: '#dbeafe', text: '#1e40af', label: 'Baixa Prioridade' },
  };

  const config = severityColors[params.severity] || severityColors.LOW;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificação - ${params.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${config.bg}; padding: 30px; border-left: 4px solid ${config.text};">
              <div style="display: flex; align-items: center;">
                <h2 style="margin: 0; color: ${config.text}; font-size: 20px; font-weight: 700;">
                  🔔 ${params.title}
                </h2>
              </div>
              <p style="margin: 5px 0 0 0; color: ${config.text}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${config.label}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Olá, ${params.userName}</p>

              <p style="margin: 20px 0; color: #1f2937; font-size: 16px; line-height: 1.8;">
                ${params.message}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://app.agenciagtx.com.br/notifications" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      Ver no Sistema
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                © 2024 GTX Sistema. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const reportEmailTemplate = (params: {
  reportName: string;
  userName: string;
  cadence: string;
  summary: string;
}) => {
  const cadenceLabels: Record<string, string> = {
    DAILY: 'Diário',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.reportName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📊 Relatório</h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">${cadenceLabels[params.cadence] || params.cadence}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px;">${params.reportName}</h2>
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 14px;">Olá, ${params.userName}</p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 16px; font-weight: 600;">Resumo</h3>
                <p style="margin: 0; color: #047857; font-size: 15px; line-height: 1.6;">
                  ${params.summary}
                </p>
              </div>

              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Data de Geração</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">${new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://app.agenciagtx.com.br/reports" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      Ver Relatório Completo
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                © 2024 GTX Sistema. Todos os direitos reservados.
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                Este é um relatório automático. Para alterar configurações, acesse o sistema.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
