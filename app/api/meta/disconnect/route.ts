/**
 * POST /api/meta/disconnect
 *
 * Desconecta a conta Meta Ads do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Buscar usuário autenticado
    const authHeader = request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extrair token do cookie
    const accessToken = authHeader
      .split(';')
      .find((c) => c.trim().startsWith('sb-access-token='))
      ?.split('=')[1];

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Deletar conexão Meta
    const { error: deleteError } = await supabase
      .from('meta_connections')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error disconnecting Meta:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log(`✅ Meta Ads disconnected for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Meta Ads disconnected successfully',
    });
  } catch (error: any) {
    console.error('Error disconnecting Meta:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
