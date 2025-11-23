import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service role para criar usuário
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    const supabase = getSupabaseAdmin();

    // Buscar convite pelo token
    const { data: invite, error: inviteError } = await supabase
      .from('TeamInvite')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.redirect(new URL('/login?error=invite_not_found', req.url));
    }

    // Verificar se o convite ainda é válido
    if (invite.status !== 'PENDING') {
      return NextResponse.redirect(
        new URL(`/login?error=invite_${invite.status.toLowerCase()}`, req.url)
      );
    }

    // Verificar se expirou
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      await supabase
        .from('TeamInvite')
        .update({ status: 'EXPIRED' })
        .eq('id', invite.id);

      return NextResponse.redirect(new URL('/login?error=invite_expired', req.url));
    }

    // Verificar se o email já está cadastrado
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.find((u) => u.email === invite.email);

    if (userExists) {
      return NextResponse.redirect(new URL('/login?error=user_already_exists', req.url));
    }

    // Senha padrão
    const defaultPassword = 'GTX@2025';

    // Criar usuário no Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: invite.email,
      password: defaultPassword,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        nome: invite.name,
        invited_by: invite.invitedBy,
        invited_at: invite.invitedAt,
      },
    });

    if (createError || !newUser.user) {
      console.error('Erro ao criar usuário:', createError);
      return NextResponse.redirect(new URL('/login?error=create_user_failed', req.url));
    }

    // Criar perfil do usuário
    const { error: profileError } = await supabase.from('profiles').insert({
      id: newUser.user.id,
      email: invite.email,
      nome: invite.name,
      role: invite.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Tentar deletar o usuário criado
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.redirect(new URL('/login?error=create_profile_failed', req.url));
    }

    // Marcar convite como aceito
    await supabase
      .from('TeamInvite')
      .update({
        status: 'ACCEPTED',
        acceptedAt: new Date().toISOString(),
      })
      .eq('id', invite.id);

    // Enviar email com credenciais
    try {
      const { sendWelcomeEmail } = await import('@/lib/email-service');
      await sendWelcomeEmail({
        to: invite.email,
        userName: invite.name,
        tempPassword: defaultPassword,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
      // Não falhar se o email não enviar
    }

    // Redirecionar para login com mensagem de sucesso
    return NextResponse.redirect(
      new URL(
        `/login?success=account_created&email=${encodeURIComponent(invite.email)}&password=${encodeURIComponent(defaultPassword)}`,
        req.url
      )
    );
  } catch (error: any) {
    console.error('Erro ao aceitar convite:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
