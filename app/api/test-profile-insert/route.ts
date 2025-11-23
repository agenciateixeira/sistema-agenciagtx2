import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('\n🔍 === TESTE DE INSERÇÃO NA TABELA PROFILES ===\n');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      error: 'Variáveis de ambiente não configuradas'
    }, { status: 500 });
  }

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

  try {
    // STEP 1: Verificar se a tabela profiles existe
    console.log('📋 STEP 1: Verificando se tabela profiles existe...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError);
      return NextResponse.json({
        success: false,
        step: 'CHECK_TABLE',
        error: tableError.message,
        details: tableError,
        solution: 'A tabela profiles não existe ou não pode ser acessada. Execute a migration 007.',
      }, { status: 500 });
    }

    console.log('✅ Tabela profiles existe e pode ser acessada');

    // STEP 2: Criar usuário de teste
    console.log('\n👤 STEP 2: Criando usuário de teste...');
    const testEmail = `profile-test-${Date.now()}@test.com`;
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Test@123',
      email_confirm: true,
    });

    if (createError || !newUser.user) {
      console.error('❌ Erro ao criar usuário:', createError);
      return NextResponse.json({
        success: false,
        step: 'CREATE_USER',
        error: createError?.message,
        details: createError,
      }, { status: 500 });
    }

    console.log('✅ Usuário criado:', newUser.user.id);

    // STEP 3: Tentar inserir perfil
    console.log('\n📝 STEP 3: Tentando inserir perfil...');
    console.log('Dados a serem inseridos:', {
      id: newUser.user.id,
      nome: 'Teste Profile',
      role: 'VIEWER',
    });

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        nome: 'Teste Profile',
        role: 'VIEWER',
      })
      .select();

    if (profileError) {
      console.error('❌ ERRO ao inserir perfil:', profileError);

      // Limpar usuário de teste
      await supabase.auth.admin.deleteUser(newUser.user.id);

      return NextResponse.json({
        success: false,
        step: 'INSERT_PROFILE',
        error: profileError.message,
        details: profileError,
        userCreated: newUser.user.id,
        diagnosis: {
          code: profileError.code,
          message: profileError.message,
          hint: profileError.hint,
          details: profileError.details,
        },
        possibleCauses: [
          '1. RLS (Row Level Security) bloqueando inserção',
          '2. Enum user_role não existe ou está diferente',
          '3. Constraint de foreign key falhando',
          '4. Service role key sem permissões adequadas',
          '5. Campo obrigatório faltando',
        ],
        solution: [
          'Verifique as políticas RLS:',
          'SELECT * FROM pg_policies WHERE tablename = \'profiles\';',
          '',
          'Verifique o enum:',
          'SELECT unnest(enum_range(NULL::user_role));',
          '',
          'Tente inserir manualmente no SQL Editor:',
          `INSERT INTO profiles (id, nome, role) VALUES ('${newUser.user.id}', 'Teste', 'VIEWER');`,
        ],
      }, { status: 500 });
    }

    console.log('✅ Perfil inserido com sucesso!');
    console.log('Dados:', profileData);

    // STEP 4: Limpar
    console.log('\n🧹 STEP 4: Limpando usuário de teste...');
    await supabase.auth.admin.deleteUser(newUser.user.id);
    console.log('✅ Limpeza concluída');

    console.log('\n✅ === TESTE COMPLETO: SUCESSO! ===\n');

    return NextResponse.json({
      success: true,
      message: '🎉 Inserção de perfil funcionou! O problema não é com a tabela profiles.',
      steps: {
        check_table: 'OK',
        create_user: 'OK',
        insert_profile: 'OK',
        cleanup: 'OK',
      },
      profileInserted: profileData,
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
