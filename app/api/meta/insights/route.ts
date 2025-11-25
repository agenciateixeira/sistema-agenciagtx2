/**
 * GET /api/meta/insights
 *
 * Busca insights da Meta Ads de forma segura (server-side)
 * FASE 2: Dashboard Ads Básico
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';
import {
  getAdAccountInsights,
  getCampaignsInsights,
  getDailyInsights,
} from '@/lib/meta-insights';

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
    const type = searchParams.get('type') || 'account'; // account | campaigns | daily

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

    // Verificar se token expirou
    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();

    if (tokenExpired || metaConnection.status !== 'connected') {
      return NextResponse.json(
        { error: 'Token expired or connection not active' },
        { status: 401 }
      );
    }

    // Verificar se tem conta de anúncios
    if (!metaConnection.primary_ad_account_id) {
      return NextResponse.json(
        { error: 'No ad account configured' },
        { status: 400 }
      );
    }

    // Descriptografar token
    const accessToken = decrypt(metaConnection.access_token_encrypted);

    // Buscar insights conforme tipo solicitado
    let insights;

    switch (type) {
      case 'account':
        insights = await getAdAccountInsights(
          metaConnection.primary_ad_account_id,
          accessToken,
          datePreset as any
        );
        break;

      case 'campaigns':
        insights = await getCampaignsInsights(
          metaConnection.primary_ad_account_id,
          accessToken,
          datePreset as any
        );
        break;

      case 'daily':
        const days = parseInt(searchParams.get('days') || '30');
        insights = await getDailyInsights(
          metaConnection.primary_ad_account_id,
          accessToken,
          days
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: insights,
      account_name: metaConnection.meta_user_name,
      ad_account_id: metaConnection.primary_ad_account_id,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar insights:', error);

    // Se erro da API Meta
    if (error.message.includes('OAuthException') || error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'Meta API authentication failed. Please reconnect your account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
