import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email-service';

// Rota de teste para verificar se o email está funcionando
// Acesse: /api/test-email?email=seu@email.com
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({
      error: 'Email não fornecido. Use: /api/test-email?email=seu@email.com'
    }, { status: 400 });
  }

  console.log('📧 Testando envio de email para:', email);

  try {
    const result = await sendWelcomeEmail({
      to: email,
      userName: 'Teste',
      tempPassword: 'GTX@2025',
    });

    console.log('Resultado do envio:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email enviado com sucesso!',
        emailId: result.data?.id,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro ao enviar email de teste:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
