/**
 * GET /api/meta/ad-accounts
 *
 * Busca todas as contas de anúncios do usuário do Meta
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getSupabaseServer() {
  const cookieStore = await cookies();

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar conexão Meta
    const { data: metaConnection, error: connectionError } = await supabase
      .from('meta_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connectionError || !metaConnection) {
      return NextResponse.json({
        accounts: [],
        pixels: [],
        total_accounts: 0,
        total_pixels: 0,
      });
    }

    // Usar dados salvos no banco (que já têm business_id)
    const accounts = metaConnection.ad_account_ids || [];
    const pixels = metaConnection.pixel_ids || [];

    return NextResponse.json({
      accounts,
      pixels,
      total_accounts: accounts.length,
      total_pixels: pixels.length,
    });
  } catch (error: any) {
    console.error('Error fetching ad accounts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
