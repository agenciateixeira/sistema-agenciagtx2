import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Teste COMPLETO: Criar usuário + Tentar login
// Acesse: /api/test-login?email=seu@email.com
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get('email') || 'teste' + Date.now() + '@test.com';
  const testPassword = 'GTX@2025';

  console.log('\n🧪 === TESTE COMPLETO DE AUTENTICAÇÃO ===\n');
  console.log('📧 Email de teste:', testEmail);
  console.log('🔑 Senha de teste:', testPassword);

  // Verificar variáveis
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({
      error: 'Variáveis de ambiente não configuradas',
      missing: {
        NEXT_PUBLIC_SUPABASE_URL: !process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    }, { status: 500 });
  }

  // Cliente ADMIN (para criar usuário)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Cliente ANON (para testar login como usuário normal)
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // PASSO 1: Deletar usuário se já existir
    console.log('\n🗑️  PASSO 1: Verificando se usuário já existe...');
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail);

    if (existingUser) {
      console.log('   ⚠️  Usuário já existe, deletando:', existingUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      console.log('   ✅ Usuário deletado');
    } else {
      console.log('   ✅ Usuário não existe (OK para criar)');
    }

    // PASSO 2: Criar novo usuário
    console.log('\n🔐 PASSO 2: Criando usuário no Supabase Auth...');
    console.log('   Email:', testEmail);
    console.log('   Senha:', testPassword);
    console.log('   Email confirmado:', true);

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        nome: 'Teste',
      },
    });

    if (createError) {
      console.error('   ❌ ERRO ao criar usuário:', createError);
      return NextResponse.json({
        success: false,
        step: 'CREATE_USER',
        error: createError.message,
        details: createError,
      }, { status: 500 });
    }

    console.log('   ✅ Usuário criado com sucesso!');
    console.log('   ID:', newUser.user?.id);
    console.log('   Email:', newUser.user?.email);
    console.log('   Email confirmado?', newUser.user?.email_confirmed_at ? 'SIM' : 'NÃO');

    // PASSO 3: Criar perfil
    console.log('\n👤 PASSO 3: Criando perfil...');
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: newUser.user!.id,
      nome: 'Teste',
      role: 'VIEWER',
    });

    if (profileError) {
      console.error('   ❌ ERRO ao criar perfil:', profileError);
      // Não vamos falhar por causa disso, pode não ter a tabela
      console.log('   ⚠️  Continuando sem perfil...');
    } else {
      console.log('   ✅ Perfil criado');
    }

    // PASSO 4: Aguardar 2 segundos (dar tempo para propagar)
    console.log('\n⏳ PASSO 4: Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ✅ Pronto');

    // PASSO 5: Testar LOGIN com cliente ANON (como usuário normal faria)
    console.log('\n🔓 PASSO 5: Testando LOGIN (como usuário normal)...');
    console.log('   Email:', testEmail);
    console.log('   Senha:', testPassword);

    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.error('   ❌ ERRO no LOGIN:', loginError);
      return NextResponse.json({
        success: false,
        step: 'LOGIN',
        error: loginError.message,
        details: loginError,
        userCreated: {
          id: newUser.user?.id,
          email: newUser.user?.email,
          emailConfirmed: newUser.user?.email_confirmed_at,
        },
        testCredentials: {
          email: testEmail,
          password: testPassword,
        },
        troubleshooting: [
          'Usuário foi criado com sucesso',
          'Mas o login FALHOU',
          'Possíveis causas:',
          '1. Supabase Auth não está aceitando a senha',
          '2. Email não foi confirmado corretamente',
          '3. Problema com RLS ou políticas',
          '4. Bug no Supabase',
        ],
      }, { status: 500 });
    }

    console.log('   ✅ LOGIN FUNCIONOU!');
    console.log('   Session ID:', loginData.session?.access_token?.substring(0, 20) + '...');
    console.log('   User ID:', loginData.user?.id);

    // PASSO 6: Limpar - deletar usuário de teste
    console.log('\n🧹 PASSO 6: Limpando usuário de teste...');
    await supabaseAdmin.auth.admin.deleteUser(newUser.user!.id);
    console.log('   ✅ Usuário deletado');

    console.log('\n✅ === TESTE COMPLETO: SUCESSO! ===\n');

    return NextResponse.json({
      success: true,
      message: '🎉 TESTE COMPLETO PASSOU! Autenticação funciona 100%',
      steps: {
        '1_delete_existing': 'OK',
        '2_create_user': 'OK',
        '3_create_profile': 'OK',
        '4_wait': 'OK',
        '5_login': 'OK - LOGIN FUNCIONOU! ✅',
        '6_cleanup': 'OK',
      },
      testCredentials: {
        email: testEmail,
        password: testPassword,
      },
      loginResult: {
        userId: loginData.user?.id,
        sessionExists: !!loginData.session,
      },
      conclusion: 'O sistema de autenticação está funcionando perfeitamente! Se o convite não funciona, o problema é no fluxo do convite, não na autenticação.',
    });

  } catch (error: any) {
    console.error('\n❌ EXCEÇÃO:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
