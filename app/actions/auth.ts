'use server';

import { redirect } from 'next/navigation';
import { validateCredentials, createSession, destroySession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
