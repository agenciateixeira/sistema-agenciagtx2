/**
 * POST /api/meta/disconnect
 *
 * Desconecta a conta Meta Ads do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Criar cliente Supabase server-side
    const cookieStore = cookies();
    const supabase = createServerClient(
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

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

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
