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
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para o Sistema GTX</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <!-- Header GTX -->
          <tr>
            <td style="background-color: #22c55e; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Sistema GTX</h1>
              <p style="margin: 10px 0 0 0; color: #dcfce7; font-size: 15px; font-weight: 500;">Gestão de Marketing e Analytics</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Olá, ${params.inviteeName}!</h2>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>${params.inviterName}</strong> convidou você para fazer parte do <strong style="color: #16a34a;">Sistema GTX</strong>.
              </p>

              <!-- Badge de Role -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Seu Nível de Acesso</p>
                <p style="margin: 0; color: #15803d; font-size: 20px; font-weight: 700;">${roleLabels[params.role] || params.role}</p>
              </div>

              <p style="margin: 24px 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Para começar, clique no botão abaixo e complete seu cadastro:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${params.inviteUrl}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                      Aceitar Convite →
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
  `;
};

export const notificationEmailTemplate = (params: {
  title: string;
  message: string;
  severity: string;
  userName: string;
}) => {
  const severityConfig: Record<string, { bg: string; border: string; text: string; label: string; icon: string }> = {
    HIGH: {
      bg: '#fef2f2',
      border: '#dc2626',
      text: '#991b1b',
      label: 'Alta Prioridade',
      icon: '🔴'
    },
    MEDIUM: {
      bg: '#fffbeb',
      border: '#f59e0b',
      text: '#92400e',
      label: 'Média Prioridade',
      icon: '🟡'
    },
    LOW: {
      bg: '#eff6ff',
      border: '#3b82f6',
      text: '#1e40af',
      label: 'Baixa Prioridade',
      icon: '🔵'
    },
  };

  const config = severityConfig[params.severity] || severityConfig.LOW;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificação - ${params.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <!-- Header GTX -->
          <tr>
            <td style="background-color: #22c55e; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🔔 Sistema GTX</h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">Notificação do Sistema</p>
            </td>
          </tr>

          <!-- Alert Box -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: ${config.bg}; border-left: 4px solid ${config.border}; padding: 20px 30px;">
                <p style="margin: 0 0 8px 0; color: ${config.text}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                  ${config.icon} ${config.label}
                </p>
                <h2 style="margin: 0; color: ${config.text}; font-size: 20px; font-weight: 700;">
                  ${params.title}
                </h2>
              </div>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Olá, ${params.userName}</p>

              <p style="margin: 20px 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.8;">
                ${params.message}
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://app.agenciagtx.com.br/notifications" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      Ver no Sistema →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
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
  `;
};

export const reportEmailTemplate = (params: {
  reportName: string;
  userName: string;
  cadence: string;
  summary: string;
}) => {
  const cadenceLabels: Record<string, string> = {
    DAILY: 'Relatório Diário',
    WEEKLY: 'Relatório Semanal',
    MONTHLY: 'Relatório Mensal',
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório - ${params.reportName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <!-- Header GTX -->
          <tr>
            <td style="background-color: #22c55e; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📊</h1>
              <h2 style="margin: 12px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 700;">${cadenceLabels[params.cadence] || params.cadence}</h2>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">Sistema GTX</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 22px; font-weight: 600;">${params.reportName}</h3>
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 14px;">Olá, ${params.userName}</p>

              <!-- Resumo Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 24px; margin: 30px 0;">
                <h4 style="margin: 0 0 12px 0; color: #15803d; font-size: 16px; font-weight: 600;">📋 Resumo</h4>
                <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.7;">
                  ${params.summary}
                </p>
              </div>

              <!-- Data Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0 30px 0;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Data de Geração</p>
                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://app.agenciagtx.com.br/reports" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Ver Relatório Completo →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 500;">Sistema GTX</p>
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">© 2024 Agência GTX. Todos os direitos reservados.</p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">Este é um relatório automático gerado pelo sistema.</p>
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
