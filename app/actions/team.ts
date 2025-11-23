'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

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
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      return { error: 'Este email já está cadastrado no sistema' };
    }

    // Verificar se já existe convite pendente para este email
    const { data: existingInvite } = await supabase
      .from('TeamInvite')
      .select('id, status')
      .eq('email', email)
      .eq('status', 'PENDING')
      .maybeSingle();

    if (existingInvite) {
      return { error: 'Já existe um convite pendente para este email' };
    }

    // Gerar token único para o convite
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Salvar convite no banco
    const { data: invite, error: inviteError } = await supabase
      .from('TeamInvite')
      .insert({
        email,
        name,
        role: role.toUpperCase(),
        invitedBy: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
        status: 'PENDING',
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Enviar email de convite
    const { sendTeamInviteEmail } = await import('@/lib/email-service');
    const emailResult = await sendTeamInviteEmail({
      to: email,
      inviteeName: name,
      inviterName: profile?.nome || 'Um administrador',
      role: role,
      token: token, // Passar o token para o email
    });

    // Atualizar convite com ID do email enviado
    if (emailResult.success && emailResult.data?.id) {
      await supabase
        .from('TeamInvite')
        .update({
          metadata: {
            emailId: emailResult.data.id,
            sentAt: new Date().toISOString(),
          },
        })
        .eq('id', invite.id);
    }

    if (!emailResult.success) {
      // Marcar convite como falho mas não retornar erro
      await supabase
        .from('TeamInvite')
        .update({
          metadata: {
            emailError: emailResult.error,
            emailAttempts: 1
          }
        })
        .eq('id', invite.id);

      return {
        error: `Convite salvo, mas erro ao enviar email: ${emailResult.error}. Tente reenviar.`
      };
    }

    revalidatePath('/team');
    return {
      success: true,
      message: `✅ Convite enviado para ${email}! Válido por 7 dias.`
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function cancelInvite(inviteId: string) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    // Verificar se o convite existe e foi enviado pelo usuário atual
    const { data: invite } = await supabase
      .from('TeamInvite')
      .select('*')
      .eq('id', inviteId)
      .eq('invitedBy', user.id)
      .single();

    if (!invite) {
      return { error: 'Convite não encontrado ou você não tem permissão para cancelá-lo' };
    }

    if (invite.status !== 'PENDING') {
      return { error: 'Apenas convites pendentes podem ser cancelados' };
    }

    // Atualizar status para CANCELLED
    const { error } = await supabase
      .from('TeamInvite')
      .update({
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
      })
      .eq('id', inviteId);

    if (error) throw error;

    revalidatePath('/team');
    return { success: true, message: 'Convite cancelado com sucesso!' };
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

  // Não permitir alterar a própria permissão
  if (memberId === user.id) {
    return { error: 'Você não pode alterar suas próprias permissões' };
  }

  try {
    // Verificar se o membro existe
    const { data: member } = await supabase
      .from('profiles')
      .select('id, nome, email, role')
      .eq('id', memberId)
      .single();

    if (!member) {
      return { error: 'Membro não encontrado' };
    }

    // Se estiver removendo permissão de admin, verificar se não é o último admin
    if (member.role === 'ADMIN' && newRole !== 'ADMIN') {
      const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'ADMIN');

      if (adminCount && adminCount <= 1) {
        return { error: 'Não é possível remover o último administrador do sistema' };
      }
    }

    // Atualizar role do membro
    const { error } = await supabase
      .from('profiles')
      .update({
        role: newRole.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (error) throw error;

    revalidatePath('/team');
    return {
      success: true,
      message: `Permissão de ${member.nome || member.email} atualizada para ${newRole}!`
    };
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
    // Buscar informações do membro
    const { data: member } = await supabase
      .from('profiles')
      .select('id, nome, email, role')
      .eq('id', memberId)
      .single();

    if (!member) {
      return { error: 'Membro não encontrado' };
    }

    // Se for admin, verificar se não é o único
    if (member.role === 'ADMIN') {
      const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'ADMIN');

      if (adminCount && adminCount <= 1) {
        return { error: 'Não é possível remover o único administrador do sistema' };
      }
    }

    // Deletar o perfil (o Supabase vai deletar em cascata)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    revalidatePath('/team');
    return {
      success: true,
      message: `${member.nome || member.email} foi removido da equipe.`
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTeamInvites() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado', data: [] };
  }

  try {
    const { data: invites, error } = await supabase
      .from('TeamInvite')
      .select(`
        id,
        email,
        name,
        role,
        status,
        invitedAt,
        expiresAt,
        metadata
      `)
      .eq('status', 'PENDING')
      .order('invitedAt', { ascending: false });

    if (error) throw error;

    return { success: true, data: invites || [] };
  } catch (error: any) {
    return { error: error.message, data: [] };
  }
}

export async function getTeamMembers() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado', data: [] };
  }

  try {
    const { data: members, error } = await supabase
      .from('profiles')
      .select(`
        id,
        nome,
        email,
        role,
        created_at,
        avatar_url
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: members || [] };
  } catch (error: any) {
    return { error: error.message, data: [] };
  }
}
