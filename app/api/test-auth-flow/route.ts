import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Teste DEFINITIVO: Email único a cada execução
export async function GET() {
  const timestamp = Date.now();
  const testEmail = `test-${timestamp}@gtx.test`;
  const testPassword = 'GTX@2025';

  console.log('\n🧪 === TESTE DEFINITIVO DE AUTENTICAÇÃO ===\n');
  console.log('📧 Email ÚNICO:', testEmail);
  console.log('🔑 Senha:', testPassword);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({
      error: 'Variáveis de ambiente não configuradas'
    }, { status: 500 });
  }

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

  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const steps: any = {};

  try {
    // STEP 1: Criar usuário
    console.log('\n📝 STEP 1: Criando usuário...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { nome: 'Test User' },
    });

    if (createError || !newUser.user) {
      console.error('❌ ERRO ao criar:', createError);
      return NextResponse.json({
        success: false,
        step: 'CREATE',
        error: createError?.message,
      }, { status: 500 });
    }

    console.log('✅ Usuário criado:', newUser.user.id);
    steps.create = { success: true, userId: newUser.user.id };

    // STEP 2: WORKAROUND - Forçar update da senha
    console.log('\n🔄 STEP 2: Forçando update da senha (workaround)...');
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      newUser.user.id,
      { password: testPassword }
    );

    if (updateError) {
      console.error('⚠️ ERRO ao atualizar senha:', updateError);
      steps.update = { success: false, error: updateError.message };
    } else {
      console.log('✅ Senha atualizada');
      steps.update = { success: true };
    }

    // STEP 3: Aguardar 3 segundos
    console.log('\n⏳ STEP 3: Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Pronto');
    steps.wait = { success: true };

    // STEP 4: Tentar login
    console.log('\n🔓 STEP 4: Tentando LOGIN...');
    console.log('Email:', testEmail);
    console.log('Senha:', testPassword);

    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.error('❌ LOGIN FALHOU:', loginError);
      steps.login = { success: false, error: loginError.message };

      // Vamos tentar verificar o usuário diretamente
      console.log('\n🔍 Investigando usuário no Supabase...');
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(newUser.user.id);

      return NextResponse.json({
        success: false,
        step: 'LOGIN',
        error: loginError.message,
        loginError,
        userInvestigation: {
          id: userData?.user?.id,
          email: userData?.user?.email,
          emailConfirmed: userData?.user?.email_confirmed_at,
          createdAt: userData?.user?.created_at,
          updatedAt: userData?.user?.updated_at,
        },
        testCredentials: {
          email: testEmail,
          password: testPassword,
        },
        allSteps: steps,
        diagnosis: [
          '❌ Usuário foi criado com sucesso',
          '❌ UpdateUserById foi chamado',
          '❌ Mas o LOGIN ainda falha',
          '',
          '🔍 POSSÍVEIS CAUSAS:',
          '1. Bug crítico do Supabase com passwords',
          '2. Configuração Auth no Supabase Dashboard incorreta',
          '3. Problema com o email_confirm: true',
          '4. Service Role Key sem permissões adequadas',
          '',
          '💡 PRÓXIMO PASSO:',
          '→ Verifique o Supabase Dashboard → Authentication → Users',
          '→ Clique no usuário criado',
          '→ Tente resetar a senha MANUALMENTE',
          '→ Veja se consegue fazer login depois',
        ],
      }, { status: 500 });
    }

    console.log('✅ LOGIN FUNCIONOU!');
    console.log('Session:', !!loginData.session);
    console.log('User ID:', loginData.user?.id);
    steps.login = { success: true, userId: loginData.user?.id };

    // STEP 5: Cleanup
    console.log('\n🧹 STEP 5: Limpando...');
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
    console.log('✅ Usuário deletado');
    steps.cleanup = { success: true };

    console.log('\n✅ === TESTE COMPLETO: SUCESSO! ===\n');

    return NextResponse.json({
      success: true,
      message: '🎉 TESTE PASSOU! O sistema de autenticação está funcionando!',
      steps,
      testCredentials: {
        email: testEmail,
        password: testPassword,
      },
    });

  } catch (error: any) {
    console.error('\n❌ EXCEÇÃO:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      steps,
    }, { status: 500 });
  }
}
