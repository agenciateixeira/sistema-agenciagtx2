'use server';

import { redirect } from 'next/navigation';
import { validateCredentials, createSession, destroySession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  const user = await validateCredentials(email, password);

  if (!user) {
    return { error: 'Email ou senha inválidos' };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { error: 'Todos os campos são obrigatórios' };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    return { error: 'Este email já está cadastrado' };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'VIEWER'
    }
  });

  await createSession(user.id);
  redirect('/dashboard');
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
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;

  if (!token || !password) {
    return { error: 'Token e senha são obrigatórios' };
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
