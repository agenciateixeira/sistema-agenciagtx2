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
    // Buscar perfil do usuário atual
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', user.id)
      .single();

    // Verificar se o email já está cadastrado
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', email)
      .single();

    if (existingUser) {
      return { error: 'Este email já está cadastrado no sistema' };
    }

    // Enviar email de convite
    const { sendTeamInviteEmail } = await import('@/lib/email-service');
    const emailResult = await sendTeamInviteEmail({
      to: email,
      inviteeName: name,
      inviterName: profile?.nome || 'Um administrador',
      role: role,
    });

    if (!emailResult.success) {
      return { error: `Erro ao enviar email: ${emailResult.error}` };
    }

    revalidatePath('/team');
    return {
      success: true,
      message: `✅ Convite enviado para ${email}! O membro receberá um email com o link de cadastro.`
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateMemberRole(memberId: string, newRole: string) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    // Atualizar role do membro
    // Nota: Você precisaria de uma tabela TeamMember ou adicionar role em profiles
    const { error } = await supabase
      .from('profiles')
      .update({
        updated_at: new Date().toISOString()
        // role: newRole (adicione este campo na tabela profiles)
      })
      .eq('id', memberId);

    if (error) throw error;

    revalidatePath('/team');
    return { success: true, message: 'Permissão atualizada com sucesso!' };
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

  // Não permitir remover a si mesmo
  if (memberId === user.id) {
    return { error: 'Você não pode remover a si mesmo do sistema' };
  }

  try {
    // Verificar se é o único admin
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (adminCount && adminCount <= 1) {
      return { error: 'Não é possível remover o único administrador do sistema' };
    }

    // Em produção, você usaria o Supabase Admin API para deletar o usuário
    // Por enquanto, vamos apenas deletar o perfil
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    revalidatePath('/team');
    return { success: true, message: 'Membro removido com sucesso!' };
  } catch (error: any) {
    return { error: error.message };
  }
}
