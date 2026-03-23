/**
 * GET /api/meta/creatives/daily?user_id=...&ad_id=...&date_preset=last_30d
 *
 * Busca performance diária de um anúncio específico
 * Para gráficos de timeline e identificação de picos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';
import { getAdDailyPerformance } from '@/lib/meta-creatives';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const adId = searchParams.get('ad_id');
    const datePreset = searchParams.get('date_preset') || 'last_30d';

    if (!userId || !adId) {
      return NextResponse.json(
        { error: 'user_id and ad_id are required' },
        { status: 400 }
      );
    }

    const { data: metaConnection, error: connectionError } = await supabase
      .from('meta_connections')
      .select('access_token_encrypted, token_expires_at, status')
      .eq('user_id', userId)
      .single();

    if (connectionError || !metaConnection) {
      return NextResponse.json({ error: 'Meta connection not found' }, { status: 404 });
    }

    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
    if (tokenExpired || metaConnection.status !== 'connected') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    const accessToken = decrypt(metaConnection.access_token_encrypted);
    const data = await getAdDailyPerformance(adId, accessToken, datePreset);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao buscar performance diária:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch daily performance' },
      { status: 500 }
    );
  }
}
