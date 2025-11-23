import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Verifica se o usuário atual tem uma role específica
 * Usado em Server Components e API Routes
 */
export async function checkUserRole(userId: string, allowedRoles: ('ADMIN' | 'EDITOR' | 'VIEWER')[]) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase env vars not configured');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { authorized: false, role: null };
  }

  const authorized = allowedRoles.includes(profile.role);

  return { authorized, role: profile.role };
}

/**
 * Pega o usuário autenticado do servidor
 * Usado em Server Components
 */
export async function getServerUser() {
  const cookieStore = cookies();

  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser();

  return user;
}

/**
 * Verifica se usuário é ADMIN
 * Atalho para checkUserRole com apenas ADMIN
 */
export async function requireAdmin(userId: string) {
  const { authorized, role } = await checkUserRole(userId, ['ADMIN']);

  if (!authorized) {
    throw new Error(`Acesso negado. Necessário: ADMIN. Atual: ${role}`);
  }

  return true;
}

/**
 * Verifica se usuário é ADMIN ou EDITOR
 */
export async function requireEditor(userId: string) {
  const { authorized, role } = await checkUserRole(userId, ['ADMIN', 'EDITOR']);

  if (!authorized) {
    throw new Error(`Acesso negado. Necessário: ADMIN ou EDITOR. Atual: ${role}`);
  }

  return true;
}
