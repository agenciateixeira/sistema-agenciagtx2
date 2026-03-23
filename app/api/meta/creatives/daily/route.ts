/**
 * GET /api/meta/creatives/daily?user_id=...&ad_id=...&date_preset=last_30d
 *
 * Busca performance diária de um anúncio específico
 * Para gráficos de timeline, curva de fadiga e análise semanal
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

    // Calculate weekly phases
    const weeklyPhases = calculateWeeklyPhases(data);

    return NextResponse.json({ success: true, data, weekly_phases: weeklyPhases });
  } catch (error: any) {
    console.error('Erro ao buscar performance diária:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch daily performance' },
      { status: 500 }
    );
  }
}

function calculateWeeklyPhases(data: any[]) {
  if (data.length === 0) return [];

  const weeks: Map<number, any[]> = new Map();
  const startDate = new Date(data[0].date);

  for (const day of data) {
    const dayDate = new Date(day.date);
    const weekNum = Math.floor((dayDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (!weeks.has(weekNum)) weeks.set(weekNum, []);
    weeks.get(weekNum)!.push(day);
  }

  return Array.from(weeks.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekNum, days]) => {
      const totalSpend = days.reduce((s, d) => s + d.spend, 0);
      const totalImpressions = days.reduce((s, d) => s + d.impressions, 0);
      const totalClicks = days.reduce((s, d) => s + d.clicks, 0);
      const totalConversions = days.reduce((s, d) => s + d.conversions, 0);
      const totalReach = days.reduce((s, d) => s + d.reach, 0);
      const avgCtr = days.reduce((s, d) => s + d.ctr, 0) / days.length;
      const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
      const avgFrequency = totalReach > 0 ? totalImpressions / totalReach : 0;
      const costPerResult = totalConversions > 0 ? totalSpend / totalConversions : 0;

      return {
        week: weekNum + 1,
        label: `Semana ${weekNum + 1}`,
        date_start: days[0].date,
        date_end: days[days.length - 1].date,
        days: days.length,
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        ctr: avgCtr,
        cpc: avgCpc,
        frequency: avgFrequency,
        cost_per_result: costPerResult,
      };
    });
}
