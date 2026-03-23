/**
 * GET /api/meta/creatives/daily
 *
 * Busca performance diária de um anúncio específico
 * Usado para gráficos de fadiga e tendência
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

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (!adId) {
      return NextResponse.json({ error: 'ad_id is required' }, { status: 400 });
    }

    const { data: metaConnection, error: connectionError } = await supabase
      .from('meta_connections')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (connectionError || !metaConnection) {
      return NextResponse.json(
        { error: 'Meta connection not found' },
        { status: 404 }
      );
    }

    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
    if (tokenExpired || metaConnection.status !== 'connected') {
      return NextResponse.json(
        { error: 'Token expired or connection not active' },
        { status: 401 }
      );
    }

    const accessToken = decrypt(metaConnection.access_token_encrypted);

    const data = await getAdDailyPerformance(adId, accessToken, datePreset);

    return NextResponse.json({
      success: true,
      data,
      ad_id: adId,
    });
  } catch (error: any) {
    console.error('Erro ao buscar daily performance:', error);

    if (error.message?.includes('OAuthException') || error.message?.includes('expired')) {
      return NextResponse.json(
        { error: 'Meta API authentication failed. Please reconnect your account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch daily performance' },
      { status: 500 }
    );
  }
}
