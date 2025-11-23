import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering (não fazer static generation)
export const dynamic = 'force-dynamic';

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

    console.log('🔐 Criando usuário:', {
      email: invite.email,
      name: invite.name,
      password: defaultPassword,
    });

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
      console.error('❌ Erro ao criar usuário:', createError);
      return NextResponse.redirect(new URL('/login?error=create_user_failed', req.url));
    }

    console.log('✅ Usuário criado no Supabase Auth:', newUser.user.id);

    // WORKAROUND: Forçar o Supabase a salvar a senha corretamente
    // Bug conhecido: createUser() às vezes não salva a senha
    console.log('🔄 Atualizando senha do usuário para garantir que funcione...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      newUser.user.id,
      { password: defaultPassword }
    );

    if (updateError) {
      console.error('⚠️ Erro ao atualizar senha (continuando):', updateError);
      // Não vamos falhar por causa disso
    } else {
      console.log('✅ Senha atualizada com sucesso');
    }

    // Criar ou atualizar perfil do usuário (UPSERT)
    console.log('👤 Criando/atualizando perfil do usuário...');
    console.log('Dados do perfil:', {
      id: newUser.user.id,
      nome: invite.name,
      role: invite.role,
    });

    // Usar upsert para evitar erro de duplicate key
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        nome: invite.name,
        role: invite.role,
        updated_at: new Date().toISOString(),
        // created_at vai usar DEFAULT na primeira vez
      }, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select();

    if (profileError) {
      console.error('❌ ERRO ao criar/atualizar perfil:', profileError);
      console.error('Detalhes completos:', JSON.stringify(profileError, null, 2));

      // Tentar deletar o usuário criado
      await supabase.auth.admin.deleteUser(newUser.user.id);

      return NextResponse.redirect(
        new URL(
          `/login?error=create_profile_failed&details=${encodeURIComponent(profileError.message)}`,
          req.url
        )
      );
    }

    console.log('✅ Perfil criado/atualizado com sucesso:', profileData);

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
      console.log('📧 Enviando email de boas-vindas para:', invite.email);
      const { sendWelcomeEmail } = await import('@/lib/email-service');
      const emailResult = await sendWelcomeEmail({
        to: invite.email,
        userName: invite.name,
        tempPassword: defaultPassword,
      });

      if (emailResult.success) {
        console.log('✅ Email de boas-vindas enviado com sucesso!');
      } else {
        console.error('❌ Erro ao enviar email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Exceção ao enviar email de boas-vindas:', emailError);
      // Não falhar se o email não enviar
    }

    // Redirecionar para página de convite aceito com credenciais
    return NextResponse.redirect(
      new URL(
        `/convite-aceito?email=${encodeURIComponent(invite.email)}&password=${encodeURIComponent(defaultPassword)}`,
        req.url
      )
    );
  } catch (error: any) {
    console.error('Erro ao aceitar convite:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
