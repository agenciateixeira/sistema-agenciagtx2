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

    // Descriptografar token
    const accessToken = decrypt(metaConnection.access_token_encrypted);

    // Buscar contas de anúncios do Meta
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/adaccounts?fields=id,name,account_status,currency&limit=100&access_token=${accessToken}`
    );

    if (!accountsResponse.ok) {
      const error = await accountsResponse.json();
      throw new Error(error.error?.message || 'Failed to fetch ad accounts');
    }

    const accountsData = await accountsResponse.json();

    // Formatar contas
    const accounts = (accountsData.data || []).map((account: any) => ({
      id: account.id.replace('act_', ''),
      name: account.name,
      account_status: account.account_status,
      currency: account.currency,
    }));

    // Buscar Pixels do Meta
    const pixelsResponse = await fetch(
      `https://graph.facebook.com/v22.0/me/adspixels?fields=id,name&limit=100&access_token=${accessToken}`
    );

    let pixels = [];
    if (pixelsResponse.ok) {
      const pixelsData = await pixelsResponse.json();
      pixels = (pixelsData.data || []).map((pixel: any) => ({
        id: pixel.id,
        name: pixel.name,
      }));
    }

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
