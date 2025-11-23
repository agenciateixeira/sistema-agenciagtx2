import { cookies } from 'next/headers';
import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';

export interface Session {
  userId: string;
  email: string;
  name: string | null;
  role: string;
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  cookies().set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/'
  });

  // Store session in database or cache
  // For now, we'll use a simple approach with cookies containing the userId
  cookies().set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/'
  });

  return sessionToken;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export async function destroySession() {
  cookies().delete('session');
  cookies().delete('userId');
}

export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
