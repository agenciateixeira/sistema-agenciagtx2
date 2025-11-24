'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function recoverPassword(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email é obrigatório' };
  }

  try {
    const supabase = await getSupabaseServer();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/recuperar-senha/redefinir`,
    });

    if (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      return { error: 'Erro ao enviar email de recuperação' };
    }

    return {
      success: true,
      message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
    };
  } catch (error: any) {
    console.error('Erro ao recuperar senha:', error);
    return { error: 'Erro ao processar solicitação' };
  }
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Senha é obrigatória' };
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter no mínimo 6 caracteres' };
  }

  try {
    const supabase = await getSupabaseServer();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Erro ao redefinir senha:', error);
      return { error: 'Link de recuperação inválido ou expirado' };
    }

    return { success: true, message: 'Senha alterada com sucesso!' };
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return { error: 'Erro ao processar solicitação' };
  }
}
