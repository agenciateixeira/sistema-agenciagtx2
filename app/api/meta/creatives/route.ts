/**
 * GET /api/meta/creatives
 *
 * Busca dados de criativos com insights de performance
 * Inclui: thumbnail, tipo, texto, CTR, frequência, fadiga
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';
import {
  getAdLevelInsights,
  getCreativeDetails,
  getCreativesWithInsights,
} from '@/lib/meta-creatives';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const datePreset = searchParams.get('date_preset') || 'last_30d';
    const type = searchParams.get('type') || 'full'; // full | insights | details

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Buscar conexão Meta do usuário
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

    // Verificar token
    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
    if (tokenExpired || metaConnection.status !== 'connected') {
      return NextResponse.json(
        { error: 'Token expired or connection not active' },
        { status: 401 }
      );
    }

    if (!metaConnection.primary_ad_account_id) {
      return NextResponse.json(
        { error: 'No ad account configured' },
        { status: 400 }
      );
    }

    // Descriptografar token
    const accessToken = decrypt(metaConnection.access_token_encrypted);

    let data;

    switch (type) {
      case 'insights':
        data = await getAdLevelInsights(
          metaConnection.primary_ad_account_id,
          accessToken,
          datePreset
        );
        break;

      case 'details':
        data = await getCreativeDetails(
          metaConnection.primary_ad_account_id,
          accessToken
        );
        break;

      case 'full':
      default:
        data = await getCreativesWithInsights(
          metaConnection.primary_ad_account_id,
          accessToken,
          datePreset
        );
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      account_name: metaConnection.meta_user_name,
      ad_account_id: metaConnection.primary_ad_account_id,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar criativos:', error);

    if (error.message.includes('OAuthException') || error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'Meta API authentication failed. Please reconnect your account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch creatives' },
      { status: 500 }
    );
  }
}
