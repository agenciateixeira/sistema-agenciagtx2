/**
 * POST /api/meta/set-primary-account
 *
 * Define a conta de anúncios primária do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad_account_id } = body;

    if (!ad_account_id) {
      return NextResponse.json({ error: 'ad_account_id is required' }, { status: 400 });
    }

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

    // Atualizar primary_ad_account_id na meta_connections
    const { error: updateError } = await supabase
      .from('meta_connections')
      .update({ primary_ad_account_id: ad_account_id })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating primary account:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`✅ Primary ad account set to ${ad_account_id} for user ${user.id}`);

    return NextResponse.json({
      success: true,
      ad_account_id,
    });
  } catch (error: any) {
    console.error('Error setting primary account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
