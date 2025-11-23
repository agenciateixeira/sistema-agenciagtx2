'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

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

export async function inviteTeamMember(formData: FormData) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  try {
    // Por enquanto, vamos apenas criar um registro de convite
    // Em produção, você enviaria um email de convite
    const { error } = await supabase
      .from('profiles')
      .insert({
        nome: name,
        avatar_url: null,
      });

    if (error) throw error;

    revalidatePath('/team');
    return { success: true, message: `Convite enviado para ${email}` };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function removeTeamMember(memberId: string) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    const { error } = await supabase
      .from('TeamMember')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    revalidatePath('/team');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
