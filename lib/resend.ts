import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY não está configurada');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email remetente configurado com domínio customizado
export const FROM_EMAIL = 'Sistema GTX <noreply@agenciagtx.com.br>';
