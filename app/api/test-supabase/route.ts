import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rota de teste para verificar se o Supabase está configurado corretamente
// Acesse: /api/test-supabase?email=teste@example.com
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'teste@example.com';

  console.log('🔍 Testando configuração do Supabase...');

  // Verificar variáveis de ambiente
  const checks = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
  };

  console.log('Variáveis de ambiente:', checks);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      error: 'Supabase não configurado',
      checks,
    }, { status: 500 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Testar criação de usuário
    console.log('🔐 Testando criação de usuário:', email);

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: 'GTX@2025',
      email_confirm: true,
      user_metadata: {
        nome: 'Teste',
      },
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);

      // Se o erro for "user already exists", deletar e tentar novamente
      if (error.message.includes('already') || error.code === '23505') {
        console.log('🗑️ Usuário já existe, deletando...');
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === email);

        if (existingUser) {
          await supabase.auth.admin.deleteUser(existingUser.id);
          console.log('✅ Usuário deletado, tentando criar novamente...');

          const { data: newData, error: newError } = await supabase.auth.admin.createUser({
            email: email,
            password: 'GTX@2025',
            email_confirm: true,
            user_metadata: {
              nome: 'Teste',
            },
          });

          if (newError) {
            return NextResponse.json({
              error: 'Erro ao criar usuário (2ª tentativa)',
              details: newError,
              checks,
            }, { status: 500 });
          }

          return NextResponse.json({
            success: true,
            message: 'Usuário criado com sucesso (após deletar existente)!',
            userId: newData.user?.id,
            email: email,
            password: 'GTX@2025',
            checks,
          });
        }
      }

      return NextResponse.json({
        error: 'Erro ao criar usuário',
        details: error,
        checks,
      }, { status: 500 });
    }

    console.log('✅ Usuário criado:', data.user?.id);

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso!',
      userId: data.user?.id,
      email: email,
      password: 'GTX@2025',
      checks,
      note: 'IMPORTANTE: Você pode fazer login agora com estas credenciais!',
    });
  } catch (error: any) {
    console.error('❌ Exceção:', error);
    return NextResponse.json({
      error: 'Exceção ao testar Supabase',
      details: error.message,
      checks,
    }, { status: 500 });
  }
}
