/**
 * Motor de Decisão - Análise automática de campanhas
 * Sugere ações: escalar, manter, reduzir, pausar
 * Baseado em CPA, tendência, ROAS, frequência
 */

export type DecisionAction = 'escalar' | 'manter' | 'reduzir' | 'pausar' | 'observar';

export interface CampaignDecision {
  campaign_id: string;
  campaign_name: string;
  scenario: string;
  adsets_count: number;
  spend: number;
  cpa_medio: number;
  cpa_real: number;
  cpa_incremental: number;
  cpa_target: number;
  trend: 'improving' | 'stable' | 'worsening';
  trend_percent: number;
  decision: DecisionAction;
  decision_reason: string;
  suggested_budget_change: number; // percentage: +20%, -30%, etc
  conversions: number;
  roas: number | null;
  ctr: number;
  frequency: number;
  impressions: number;
  clicks: number;
  reach: number;
}

export interface MotorDecisaoResult {
  campaigns: CampaignDecision[];
  total_spend: number;
  total_conversions: number;
  avg_cpa: number;
  overall_cpa_real: number;
  overall_health: 'healthy' | 'warning' | 'critical';
  cpa_target: number;
  cpa_vs_target: number; // percentage above/below target
  roas_overall: number | null;
}

export interface DailyMetrics {
  date: string;
  spend: number;
  conversions: number;
  impressions: number;
  clicks: number;
  cpa: number;
}

/**
 * Calcula tendência de CPA baseado nos últimos dias
 */
function calculateTrend(
  dailyData: DailyMetrics[]
): { trend: 'improving' | 'stable' | 'worsening'; percent: number } {
  if (dailyData.length < 4) {
    return { trend: 'stable', percent: 0 };
  }

  const midPoint = Math.floor(dailyData.length / 2);
  const firstHalf = dailyData.slice(0, midPoint);
  const secondHalf = dailyData.slice(midPoint);

  const avgCpaFirst = firstHalf.reduce((s, d) => s + d.cpa, 0) / firstHalf.length;
  const avgCpaSecond = secondHalf.reduce((s, d) => s + d.cpa, 0) / secondHalf.length;

  if (avgCpaFirst === 0) return { trend: 'stable', percent: 0 };

  const changePercent = ((avgCpaSecond - avgCpaFirst) / avgCpaFirst) * 100;

  if (changePercent < -10) return { trend: 'improving', percent: changePercent };
  if (changePercent > 10) return { trend: 'worsening', percent: changePercent };
  return { trend: 'stable', percent: changePercent };
}

/**
 * Decide ação para uma campanha
 */
function decideCampaignAction(
  cpaReal: number,
  cpaTarget: number,
  trend: 'improving' | 'stable' | 'worsening',
  frequency: number,
  roas: number | null,
  conversions: number,
  spend: number,
): { action: DecisionAction; reason: string; budgetChange: number } {
  const cpaRatio = cpaTarget > 0 ? cpaReal / cpaTarget : 1;

  // Sem conversões e gasto significativo → pausar
  if (conversions === 0 && spend > 50) {
    return {
      action: 'pausar',
      reason: 'Sem conversões com gasto significativo',
      budgetChange: -100,
    };
  }

  // CPA muito acima do alvo (>2x) e piorando → pausar
  if (cpaRatio > 2 && trend === 'worsening') {
    return {
      action: 'pausar',
      reason: `CPA ${cpaRatio.toFixed(1)}x acima do alvo e piorando`,
      budgetChange: -100,
    };
  }

  // CPA muito acima do alvo (>1.8x) → reduzir bastante
  if (cpaRatio > 1.8) {
    return {
      action: 'reduzir',
      reason: `CPA ${cpaRatio.toFixed(1)}x acima do alvo`,
      budgetChange: -40,
    };
  }

  // CPA acima do alvo (>1.3x) e piorando → reduzir
  if (cpaRatio > 1.3 && trend === 'worsening') {
    return {
      action: 'reduzir',
      reason: `CPA acima do alvo e tendência de piora`,
      budgetChange: -25,
    };
  }

  // CPA acima do alvo mas melhorando → observar
  if (cpaRatio > 1.3 && trend === 'improving') {
    return {
      action: 'observar',
      reason: `CPA acima mas tendência de melhora`,
      budgetChange: 0,
    };
  }

  // CPA acima do alvo e estável → reduzir leve
  if (cpaRatio > 1.15) {
    return {
      action: 'reduzir',
      reason: `CPA levemente acima do alvo`,
      budgetChange: -15,
    };
  }

  // Frequência muito alta → reduzir
  if (frequency > 4) {
    return {
      action: 'reduzir',
      reason: `Frequência muito alta (${frequency.toFixed(1)}) - fadiga de público`,
      budgetChange: -20,
    };
  }

  // CPA dentro do alvo e melhorando → escalar
  if (cpaRatio <= 1 && trend === 'improving' && conversions >= 3) {
    return {
      action: 'escalar',
      reason: `CPA abaixo do alvo e melhorando`,
      budgetChange: 20,
    };
  }

  // CPA muito bom (<0.7x alvo) → escalar agressivo
  if (cpaRatio < 0.7 && conversions >= 5) {
    return {
      action: 'escalar',
      reason: `CPA excelente - ${((1 - cpaRatio) * 100).toFixed(0)}% abaixo do alvo`,
      budgetChange: 30,
    };
  }

  // CPA bom e estável → escalar leve
  if (cpaRatio <= 1 && trend === 'stable' && conversions >= 2) {
    return {
      action: 'escalar',
      reason: `CPA dentro do alvo e estável`,
      budgetChange: 15,
    };
  }

  // Default → manter
  return {
    action: 'manter',
    reason: 'Performance dentro do esperado',
    budgetChange: 0,
  };
}

/**
 * Motor de Decisão principal
 * Analisa todas as campanhas e retorna decisões
 */
export function analyzeMotorDecisao(
  campaigns: any[],
  cpaTarget: number,
  campaignDailyData?: Record<string, DailyMetrics[]>
): MotorDecisaoResult {
  const totalSpend = campaigns.reduce((s, c) => s + parseFloat(c.spend || 0), 0);
  const totalConversions = campaigns.reduce((s, c) => {
    const conv = c.actions?.reduce((sum: number, a: any) => {
      if (['lead', 'purchase', 'offsite_conversion.fb_pixel_lead', 'offsite_conversion.fb_pixel_purchase',
           'onsite_conversion.messaging_first_reply', 'onsite_conversion.messaging_conversation_started_7d'].includes(a.action_type)) {
        return sum + parseInt(a.value || 0);
      }
      return sum;
    }, 0) || 0;
    return s + conv;
  }, 0);

  const overallCpaReal = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const cpaVsTarget = cpaTarget > 0 ? ((overallCpaReal - cpaTarget) / cpaTarget) * 100 : 0;

  const totalConversionValue = campaigns.reduce((s, c) => {
    const val = c.action_values?.reduce((sum: number, a: any) => {
      if (['offsite_conversion.fb_pixel_purchase', 'purchase'].includes(a.action_type)) {
        return sum + parseFloat(a.value || 0);
      }
      return sum;
    }, 0) || 0;
    return s + val;
  }, 0);

  const roasOverall = totalSpend > 0 && totalConversionValue > 0 ? totalConversionValue / totalSpend : null;

  const decisions: CampaignDecision[] = campaigns.map((c) => {
    const spend = parseFloat(c.spend || 0);
    const impressions = parseInt(c.impressions || 0);
    const clicks = parseInt(c.clicks || 0);
    const reach = parseInt(c.reach || 0);
    const frequency = parseFloat(c.frequency || 0);
    const ctr = parseFloat(c.ctr || 0);

    const conversions = c.actions?.reduce((sum: number, a: any) => {
      if (['lead', 'purchase', 'offsite_conversion.fb_pixel_lead', 'offsite_conversion.fb_pixel_purchase',
           'onsite_conversion.messaging_first_reply', 'onsite_conversion.messaging_conversation_started_7d'].includes(a.action_type)) {
        return sum + parseInt(a.value || 0);
      }
      return sum;
    }, 0) || 0;

    const conversionValue = c.action_values?.reduce((sum: number, a: any) => {
      if (['offsite_conversion.fb_pixel_purchase', 'purchase'].includes(a.action_type)) {
        return sum + parseFloat(a.value || 0);
      }
      return sum;
    }, 0) || 0;

    const cpaReal = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 && conversionValue > 0 ? conversionValue / spend : null;

    // Cost per action from Meta
    const cpaMedio = c.cost_per_action_type?.find((cpa: any) =>
      ['lead', 'purchase', 'offsite_conversion.fb_pixel_lead', 'offsite_conversion.fb_pixel_purchase',
       'onsite_conversion.messaging_first_reply'].includes(cpa.action_type)
    )?.value || cpaReal;

    // Trend
    const dailyData = campaignDailyData?.[c.campaign_id] || [];
    const { trend, percent } = calculateTrend(dailyData);

    // Decision
    const { action, reason, budgetChange } = decideCampaignAction(
      cpaReal, cpaTarget, trend, frequency, roas, conversions, spend
    );

    // Count adsets
    const adsetsCount = c.adsets_count || 1;

    // Scenario label
    let scenario = '1 canal';
    if (c.campaign_name?.toLowerCase().includes('aquisição') || c.campaign_name?.toLowerCase().includes('aquisicao')) {
      scenario = `${adsetsCount} ad sets`;
    } else if (c.campaign_name?.toLowerCase().includes('ativação') || c.campaign_name?.toLowerCase().includes('ativacao')) {
      scenario = `${adsetsCount} ad sets`;
    } else if (c.campaign_name?.toLowerCase().includes('retenção') || c.campaign_name?.toLowerCase().includes('retencao')) {
      scenario = `${adsetsCount} ad sets`;
    } else {
      scenario = `${adsetsCount} canal`;
    }

    return {
      campaign_id: c.campaign_id,
      campaign_name: c.campaign_name,
      scenario,
      adsets_count: adsetsCount,
      spend,
      cpa_medio: parseFloat(String(cpaMedio)),
      cpa_real: cpaReal,
      cpa_incremental: 0, // TODO: calcular incrementalidade real
      cpa_target: cpaTarget,
      trend,
      trend_percent: percent,
      decision: action,
      decision_reason: reason,
      suggested_budget_change: budgetChange,
      conversions,
      roas,
      ctr,
      frequency,
      impressions,
      clicks,
      reach,
    };
  });

  const overallHealth: 'healthy' | 'warning' | 'critical' =
    cpaVsTarget > 50 ? 'critical' :
    cpaVsTarget > 15 ? 'warning' : 'healthy';

  return {
    campaigns: decisions.sort((a, b) => b.spend - a.spend),
    total_spend: totalSpend,
    total_conversions: totalConversions,
    avg_cpa: overallCpaReal,
    overall_cpa_real: overallCpaReal,
    overall_health: overallHealth,
    cpa_target: cpaTarget,
    cpa_vs_target: cpaVsTarget,
    roas_overall: roasOverall,
  };
}
