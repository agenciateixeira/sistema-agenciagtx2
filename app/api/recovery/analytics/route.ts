/**
 * GET /api/recovery/analytics
 * Analytics avançado de recuperação de carrinhos:
 * - Análise de coorte
 * - Funil de conversão
 * - Cruzamento de dados (UTM, horário, valor)
 * - ROI e métricas de negócio
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // dias

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // 1. ANÁLISE DE COORTE
    const cohortAnalysis = await analyzeCohorts(supabase, user.id, startDate);

    // 2. FUNIL DE CONVERSÃO
    const funnelAnalysis = await analyzeFunnel(supabase, user.id, startDate);

    // 3. CRUZAMENTO POR UTM
    const utmAnalysis = await analyzeByUTM(supabase, user.id, startDate);

    // 4. CRUZAMENTO POR HORÁRIO
    const timeAnalysis = await analyzeByTime(supabase, user.id, startDate);

    // 5. CRUZAMENTO POR VALOR
    const valueAnalysis = await analyzeByValue(supabase, user.id, startDate);

    // 6. MÉTRICAS DE ROI
    const roiMetrics = await calculateROI(supabase, user.id, startDate);

    return NextResponse.json({
      success: true,
      period: parseInt(period),
      startDate: startDate.toISOString(),
      cohorts: cohortAnalysis,
      funnel: funnelAnalysis,
      utm: utmAnalysis,
      timeOfDay: timeAnalysis,
      cartValue: valueAnalysis,
      roi: roiMetrics,
    });
  } catch (error: any) {
    console.error('Erro em analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Análise de Coorte por Semana
 */
async function analyzeCohorts(supabase: any, userId: string, startDate: Date) {
  const { data: carts } = await supabase
    .from('abandoned_carts')
    .select('abandoned_at, status, total_value, recovered_value')
    .eq('user_id', userId)
    .gte('abandoned_at', startDate.toISOString())
    .order('abandoned_at');

  if (!carts || carts.length === 0) {
    return [];
  }

  // Agrupar por semana
  const cohorts = new Map<string, any>();

  carts.forEach((cart: any) => {
    const date = new Date(cart.abandoned_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Domingo da semana
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!cohorts.has(weekKey)) {
      cohorts.set(weekKey, {
        week: weekKey,
        totalCarts: 0,
        recoveredCarts: 0,
        totalValue: 0,
        recoveredValue: 0,
      });
    }

    const cohort = cohorts.get(weekKey)!;
    cohort.totalCarts++;
    cohort.totalValue += cart.total_value;

    if (cart.status === 'recovered') {
      cohort.recoveredCarts++;
      cohort.recoveredValue += cart.recovered_value || 0;
    }
  });

  return Array.from(cohorts.values()).map(cohort => ({
    ...cohort,
    recoveryRate: cohort.totalCarts > 0
      ? ((cohort.recoveredCarts / cohort.totalCarts) * 100).toFixed(1)
      : '0.0',
    avgCartValue: cohort.totalCarts > 0
      ? (cohort.totalValue / cohort.totalCarts).toFixed(2)
      : '0.00',
  }));
}

/**
 * Análise de Funil de Conversão
 */
async function analyzeFunnel(supabase: any, userId: string, startDate: Date) {
  // Buscar todos os emails enviados
  const { data: emails } = await supabase
    .from('automated_actions')
    .select('*')
    .eq('action_type', 'email_sent')
    .gte('created_at', startDate.toISOString());

  const totalSent = emails?.length || 0;
  const opened = emails?.filter((e: any) => e.opened).length || 0;
  const clicked = emails?.filter((e: any) => e.clicked).length || 0;
  const converted = emails?.filter((e: any) => e.converted).length || 0;

  return {
    sent: totalSent,
    opened,
    clicked,
    converted,
    openRate: totalSent > 0 ? ((opened / totalSent) * 100).toFixed(1) : '0.0',
    clickRate: totalSent > 0 ? ((clicked / totalSent) * 100).toFixed(1) : '0.0',
    conversionRate: totalSent > 0 ? ((converted / totalSent) * 100).toFixed(1) : '0.0',
    clickToConversion: clicked > 0 ? ((converted / clicked) * 100).toFixed(1) : '0.0',
  };
}

/**
 * Análise por UTM
 */
async function analyzeByUTM(supabase: any, userId: string, startDate: Date) {
  const { data: carts } = await supabase
    .from('abandoned_carts')
    .select('utm_source, utm_medium, utm_campaign, status, total_value, recovered_value')
    .eq('user_id', userId)
    .gte('abandoned_at', startDate.toISOString());

  if (!carts || carts.length === 0) {
    return { sources: [], mediums: [], campaigns: [] };
  }

  // Agrupar por source
  const sources = groupByField(carts, 'utm_source');
  const mediums = groupByField(carts, 'utm_medium');
  const campaigns = groupByField(carts, 'utm_campaign');

  return { sources, mediums, campaigns };
}

/**
 * Análise por Horário
 */
async function analyzeByTime(supabase: any, userId: string, startDate: Date) {
  const { data: carts } = await supabase
    .from('abandoned_carts')
    .select('abandoned_at, status, total_value')
    .eq('user_id', userId)
    .gte('abandoned_at', startDate.toISOString());

  if (!carts || carts.length === 0) {
    return { byHour: [], byDayOfWeek: [] };
  }

  // Agrupar por hora do dia
  const byHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    carts: 0,
    recovered: 0,
    value: 0,
  }));

  // Agrupar por dia da semana
  const byDayOfWeek = Array.from({ length: 7 }, (_, i) => ({
    day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
    carts: 0,
    recovered: 0,
    value: 0,
  }));

  carts.forEach((cart: any) => {
    const date = new Date(cart.abandoned_at);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    byHour[hour].carts++;
    byHour[hour].value += cart.total_value;
    if (cart.status === 'recovered') byHour[hour].recovered++;

    byDayOfWeek[dayOfWeek].carts++;
    byDayOfWeek[dayOfWeek].value += cart.total_value;
    if (cart.status === 'recovered') byDayOfWeek[dayOfWeek].recovered++;
  });

  return {
    byHour: byHour.map(h => ({
      ...h,
      recoveryRate: h.carts > 0 ? ((h.recovered / h.carts) * 100).toFixed(1) : '0.0',
    })),
    byDayOfWeek: byDayOfWeek.map(d => ({
      ...d,
      recoveryRate: d.carts > 0 ? ((d.recovered / d.carts) * 100).toFixed(1) : '0.0',
    })),
  };
}

/**
 * Análise por Valor do Carrinho
 */
async function analyzeByValue(supabase: any, userId: string, startDate: Date) {
  const { data: carts } = await supabase
    .from('abandoned_carts')
    .select('total_value, status')
    .eq('user_id', userId)
    .gte('abandoned_at', startDate.toISOString());

  if (!carts || carts.length === 0) {
    return [];
  }

  // Definir faixas de valor
  const ranges = [
    { min: 0, max: 100, label: 'R$ 0-100' },
    { min: 100, max: 300, label: 'R$ 100-300' },
    { min: 300, max: 500, label: 'R$ 300-500' },
    { min: 500, max: 1000, label: 'R$ 500-1000' },
    { min: 1000, max: Infinity, label: 'R$ 1000+' },
  ];

  return ranges.map(range => {
    const cartsInRange = carts.filter(
      c => c.total_value >= range.min && c.total_value < range.max
    );
    const recovered = cartsInRange.filter(c => c.status === 'recovered').length;

    return {
      range: range.label,
      carts: cartsInRange.length,
      recovered,
      recoveryRate: cartsInRange.length > 0
        ? ((recovered / cartsInRange.length) * 100).toFixed(1)
        : '0.0',
    };
  });
}

/**
 * Calcular ROI
 */
async function calculateROI(supabase: any, userId: string, startDate: Date) {
  const { data: carts } = await supabase
    .from('abandoned_carts')
    .select('status, total_value, recovered_value')
    .eq('user_id', userId)
    .gte('abandoned_at', startDate.toISOString());

  const { data: emails } = await supabase
    .from('automated_actions')
    .select('*')
    .eq('action_type', 'email_sent')
    .gte('created_at', startDate.toISOString());

  const totalAbandoned = carts?.reduce((sum: number, c: any) => sum + c.total_value, 0) || 0;
  const totalRecovered = carts?.reduce((sum: number, c: any) => sum + (c.recovered_value || 0), 0) || 0;
  const emailsSent = emails?.length || 0;

  // Custo estimado por email (R$ 0.10 como exemplo)
  const costPerEmail = 0.10;
  const totalCost = emailsSent * costPerEmail;

  return {
    totalAbandonedValue: totalAbandoned,
    totalRecoveredValue: totalRecovered,
    emailsSent,
    estimatedCost: totalCost,
    roi: totalCost > 0 ? ((totalRecovered / totalCost) * 100).toFixed(0) : '0',
    revenuePerEmail: emailsSent > 0 ? (totalRecovered / emailsSent).toFixed(2) : '0.00',
  };
}

/**
 * Agrupar por campo UTM
 */
function groupByField(carts: any[], field: string) {
  const groups = new Map<string, any>();

  carts.forEach(cart => {
    const key = cart[field] || '(direct)';

    if (!groups.has(key)) {
      groups.set(key, {
        name: key,
        carts: 0,
        recovered: 0,
        totalValue: 0,
        recoveredValue: 0,
      });
    }

    const group = groups.get(key)!;
    group.carts++;
    group.totalValue += cart.total_value;

    if (cart.status === 'recovered') {
      group.recovered++;
      group.recoveredValue += cart.recovered_value || 0;
    }
  });

  return Array.from(groups.values())
    .map(g => ({
      ...g,
      recoveryRate: g.carts > 0 ? ((g.recovered / g.carts) * 100).toFixed(1) : '0.0',
    }))
    .sort((a, b) => b.carts - a.carts)
    .slice(0, 10); // Top 10
}
