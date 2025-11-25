/**
 * GET /api/meta/ad-accounts
 *
 * Busca todas as contas de anúncios do usuário do Meta
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Buscar conexão Meta
    const { data: metaConnection, error: connectionError } = await supabase
      .from('meta_connections')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (connectionError || !metaConnection) {
      return NextResponse.json({ error: 'Meta connection not found' }, { status: 404 });
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
