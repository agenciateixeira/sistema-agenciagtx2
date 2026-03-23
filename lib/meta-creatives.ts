/**
 * Meta Creatives Insights Service
 * Busca dados de criativos e performance por anúncio
 * Análise de fadiga, CTR, frequência, Hook Rate, Hold Rate, Quality Score
 */

const GRAPH_API_URL = 'https://graph.facebook.com';
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v22.0';

export interface CreativeInsight {
  ad_id: string;
  ad_name: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  reach: number;
  frequency: number;
  conversions: number;
  cost_per_result: number;
  roas: number | null;
  date_start: string;
  date_stop: string;
  // Engagement metrics
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  link_clicks: number;
  // Video retention metrics
  video_plays: number;
  video_thru_plays: number;
  video_p25: number;
  video_p50: number;
  video_p75: number;
  video_p95: number;
  video_avg_time: number;
  // New: Hook & Hold rates
  hook_rate: number;   // ThruPlay / Impressions × 100
  hold_rate: number;   // video_p95 / ThruPlay × 100
}

export interface DailyInsight {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  reach: number;
  frequency: number;
  conversions: number;
  likes: number;
  comments: number;
  cost_per_result: number;
}

export interface PlacementInsight {
  publisher_platform: string;
  platform_position: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cost_per_result: number;
  reach: number;
  frequency: number;
}

export interface CreativeDetail {
  ad_id: string;
  ad_name: string;
  status: string;
  creative_id: string;
  thumbnail_url: string | null;
  image_url: string | null;
  video_thumbnail_url: string | null;
  title: string | null;
  body: string | null;
  link_url: string | null;
  call_to_action: string | null;
  creative_type: 'image' | 'video' | 'carousel' | 'unknown';
}

export interface CreativeWithInsights extends CreativeDetail {
  insights: CreativeInsight | null;
  fatigue_score: number;
  fatigue_level: 'low' | 'medium' | 'high' | 'critical';
  fatigue_reasons: string[];
  quality_score: number;      // 0-10
  quality_level: 'poor' | 'below_average' | 'average' | 'good' | 'excellent';
}

/**
 * Busca insights no nível de anúncio (ad level)
 */
export async function getAdLevelInsights(
  adAccountId: string,
  accessToken: string,
  datePreset: string = 'last_30d'
): Promise<CreativeInsight[]> {
  const cleanAccountId = adAccountId.replace('act_', '');

  const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/act_${cleanAccountId}/insights`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('date_preset', datePreset);
  url.searchParams.set('fields', [
    'ad_id',
    'ad_name',
    'campaign_id',
    'campaign_name',
    'adset_id',
    'adset_name',
    'spend',
    'impressions',
    'clicks',
    'cpc',
    'cpm',
    'ctr',
    'reach',
    'frequency',
    'actions',
    'cost_per_action_type',
    'action_values',
    'video_play_actions',
  ].join(','));
  url.searchParams.set('level', 'ad');
  url.searchParams.set('limit', '500');
  url.searchParams.set('sort', 'spend_descending');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch ad insights');
  }

  const json = await response.json();

  if (!json.data || json.data.length === 0) {
    return [];
  }

  return json.data.map((data: any) => {
    const conversions = data.actions
      ? data.actions.reduce((sum: number, a: any) => {
          if (['lead', 'purchase', 'complete_registration', 'offsite_conversion.fb_pixel_lead', 'offsite_conversion.fb_pixel_purchase'].includes(a.action_type)) {
            return sum + parseInt(a.value || 0);
          }
          return sum;
        }, 0)
      : 0;

    const costPerResult = data.cost_per_action_type
      ? data.cost_per_action_type.find((c: any) =>
          ['lead', 'purchase', 'offsite_conversion.fb_pixel_lead', 'offsite_conversion.fb_pixel_purchase'].includes(c.action_type)
        )?.value || 0
      : 0;

    const totalConversionValue = data.action_values
      ? data.action_values.reduce((sum: number, a: any) => {
          if (['offsite_conversion.fb_pixel_purchase', 'purchase'].includes(a.action_type)) {
            return sum + parseFloat(a.value || 0);
          }
          return sum;
        }, 0)
      : 0;

    const spend = parseFloat(data.spend || 0);
    const impressions = parseInt(data.impressions || 0);

    // Engagement & video metrics from actions array
    const getActionVal = (type: string) => {
      if (!data.actions) return 0;
      const found = data.actions.find((a: any) => a.action_type === type);
      return found ? parseInt(found.value || 0) : 0;
    };

    // video_play_actions is a separate field (not in actions array)
    const videoPlays = data.video_play_actions
      ? data.video_play_actions.reduce((sum: number, a: any) => sum + parseInt(a.value || 0), 0)
      : getActionVal('video_view'); // fallback to ThruPlay

    const videoThruPlays = getActionVal('video_view'); // ThruPlay
    const videoP25 = getActionVal('video_p25_watched');
    const videoP50 = getActionVal('video_p50_watched');
    const videoP75 = getActionVal('video_p75_watched');
    const videoP95 = getActionVal('video_p95_watched');

    // Hook Rate: ThruPlay / Impressions (% of people who watched 3s+)
    const hookRate = impressions > 0 ? (videoThruPlays / impressions) * 100 : 0;

    // Hold Rate: p95 / ThruPlay (% of hooked people who watched almost all)
    const holdRate = videoThruPlays > 0 ? (videoP95 / videoThruPlays) * 100 : 0;

    return {
      ad_id: data.ad_id,
      ad_name: data.ad_name,
      campaign_id: data.campaign_id,
      campaign_name: data.campaign_name,
      adset_id: data.adset_id,
      adset_name: data.adset_name,
      spend,
      impressions,
      clicks: parseInt(data.clicks || 0),
      cpc: parseFloat(data.cpc || 0),
      cpm: parseFloat(data.cpm || 0),
      ctr: parseFloat(data.ctr || 0),
      reach: parseInt(data.reach || 0),
      frequency: parseFloat(data.frequency || 0),
      conversions,
      cost_per_result: parseFloat(costPerResult),
      roas: spend > 0 && totalConversionValue > 0 ? totalConversionValue / spend : null,
      date_start: data.date_start,
      date_stop: data.date_stop,
      // Engagement
      likes: getActionVal('post_reaction'),
      comments: getActionVal('comment'),
      shares: getActionVal('post'),
      saves: getActionVal('onsite_conversion.post_save'),
      link_clicks: getActionVal('link_click'),
      // Video retention
      video_plays: videoPlays,
      video_thru_plays: videoThruPlays,
      video_p25: videoP25,
      video_p50: videoP50,
      video_p75: videoP75,
      video_p95: videoP95,
      video_avg_time: 0,
      // Hook & Hold
      hook_rate: hookRate,
      hold_rate: holdRate,
    };
  });
}

/**
 * Busca detalhes de criativos (thumbnail, texto, tipo)
 */
export async function getCreativeDetails(
  adAccountId: string,
  accessToken: string,
  adIds?: string[]
): Promise<CreativeDetail[]> {
  const cleanAccountId = adAccountId.replace('act_', '');

  const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/act_${cleanAccountId}/ads`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('fields', [
    'id',
    'name',
    'status',
    'creative{id,title,body,thumbnail_url,image_url,video_id,object_story_spec,call_to_action_type,effective_object_story_id}',
  ].join(','));
  url.searchParams.set('limit', '500');

  if (adIds && adIds.length > 0) {
    url.searchParams.set('filtering', JSON.stringify([
      { field: 'id', operator: 'IN', value: adIds }
    ]));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch creative details');
  }

  const json = await response.json();

  if (!json.data || json.data.length === 0) {
    return [];
  }

  return json.data.map((ad: any) => {
    const creative = ad.creative || {};
    const storySpec = creative.object_story_spec || {};

    let creativeType: 'image' | 'video' | 'carousel' | 'unknown' = 'unknown';
    let imageUrl = creative.image_url || null;
    let videoThumbnailUrl = null;
    let title = creative.title || null;
    let body = creative.body || null;
    let linkUrl = null;
    let callToAction = creative.call_to_action_type || null;

    // Detectar tipo de criativo
    if (storySpec.video_data) {
      creativeType = 'video';
      videoThumbnailUrl = storySpec.video_data.image_url || creative.thumbnail_url;
      title = title || storySpec.video_data.title;
      body = body || storySpec.video_data.message;
      linkUrl = storySpec.video_data.link || null;
      callToAction = callToAction || storySpec.video_data.call_to_action?.type;
    } else if (storySpec.link_data) {
      if (storySpec.link_data.child_attachments) {
        creativeType = 'carousel';
      } else {
        creativeType = 'image';
      }
      imageUrl = imageUrl || storySpec.link_data.image_hash || storySpec.link_data.picture;
      title = title || storySpec.link_data.name;
      body = body || storySpec.link_data.message;
      linkUrl = storySpec.link_data.link || null;
      callToAction = callToAction || storySpec.link_data.call_to_action?.type;
    } else if (creative.image_url) {
      creativeType = 'image';
    } else if (creative.video_id) {
      creativeType = 'video';
    }

    return {
      ad_id: ad.id,
      ad_name: ad.name,
      status: ad.status,
      creative_id: creative.id || '',
      thumbnail_url: creative.thumbnail_url || null,
      image_url: imageUrl,
      video_thumbnail_url: videoThumbnailUrl,
      title,
      body,
      link_url: linkUrl,
      call_to_action: callToAction,
      creative_type: creativeType,
    };
  });
}

/**
 * Calcula score de fadiga de um criativo
 * Score 0-100: 0 = fresco, 100 = extremamente fadigado
 */
export function calculateFatigueScore(insight: CreativeInsight): {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // Frequência alta = fadiga
  if (insight.frequency >= 5) {
    score += 40;
    reasons.push(`Frequência muito alta: ${insight.frequency.toFixed(1)}`);
  } else if (insight.frequency >= 3.5) {
    score += 25;
    reasons.push(`Frequência alta: ${insight.frequency.toFixed(1)}`);
  } else if (insight.frequency >= 2.5) {
    score += 15;
    reasons.push(`Frequência moderada: ${insight.frequency.toFixed(1)}`);
  }

  // CTR baixo = fadiga (relativo ao benchmark)
  if (insight.ctr < 0.5) {
    score += 30;
    reasons.push(`CTR muito baixo: ${insight.ctr.toFixed(2)}%`);
  } else if (insight.ctr < 1.0) {
    score += 15;
    reasons.push(`CTR abaixo da média: ${insight.ctr.toFixed(2)}%`);
  }

  // CPC alto comparado com a média
  if (insight.cpc > 5) {
    score += 20;
    reasons.push(`CPC muito alto: R$ ${insight.cpc.toFixed(2)}`);
  } else if (insight.cpc > 3) {
    score += 10;
    reasons.push(`CPC acima da média: R$ ${insight.cpc.toFixed(2)}`);
  }

  // CPM alto
  if (insight.cpm > 50) {
    score += 10;
    reasons.push(`CPM elevado: R$ ${insight.cpm.toFixed(2)}`);
  }

  // Hook Rate baixo (para vídeos)
  if (insight.video_thru_plays > 0 && insight.hook_rate < 5) {
    score += 10;
    reasons.push(`Hook Rate baixo: ${insight.hook_rate.toFixed(1)}%`);
  }

  score = Math.min(score, 100);

  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 70) level = 'critical';
  else if (score >= 45) level = 'high';
  else if (score >= 25) level = 'medium';
  else level = 'low';

  return { score, level, reasons };
}

/**
 * Calcula Quality Score de um criativo
 * Score 0-10: 0 = péssimo, 10 = excelente
 *
 * Componentes:
 * - Hook Rate (30% para vídeos, 0% para imagens)
 * - Hold Rate (20% para vídeos, 0% para imagens)
 * - CTR (25% para imagens, 20% para vídeos)
 * - Engagement Rate (15%)
 * - Conversion efficiency (15%)
 * - Inverse CPC (redistribuído se não for vídeo)
 */
export function calculateQualityScore(insight: CreativeInsight, isVideo: boolean): {
  score: number;
  level: 'poor' | 'below_average' | 'average' | 'good' | 'excellent';
} {
  let totalScore = 0;

  if (isVideo) {
    // Hook Rate score (0-10, benchmark ~15% is good)
    const hookScore = Math.min(insight.hook_rate / 2, 10);
    totalScore += hookScore * 0.30;

    // Hold Rate score (0-10, benchmark ~20% is good)
    const holdScore = Math.min(insight.hold_rate / 4, 10);
    totalScore += holdScore * 0.20;

    // CTR score
    const ctrScore = Math.min(insight.ctr / 0.3, 10);
    totalScore += ctrScore * 0.20;
  } else {
    // For images: CTR is more important
    const ctrScore = Math.min(insight.ctr / 0.25, 10);
    totalScore += ctrScore * 0.40;

    // CPC efficiency (lower is better)
    const cpcScore = insight.cpc > 0 ? Math.min(3 / insight.cpc, 1) * 10 : 5;
    totalScore += cpcScore * 0.10;
  }

  // Engagement Rate
  const totalEngagement = insight.likes + insight.comments + insight.shares;
  const engagementRate = insight.impressions > 0 ? (totalEngagement / insight.impressions) * 100 : 0;
  const engagementScore = Math.min(engagementRate / 0.5, 10);
  totalScore += engagementScore * 0.15;

  // Conversion efficiency
  const convRate = insight.impressions > 0 ? (insight.conversions / insight.impressions) * 1000 : 0;
  const convScore = Math.min(convRate / 2, 10);
  totalScore += convScore * 0.15;

  const score = Math.round(Math.min(totalScore, 10) * 10) / 10;

  let level: 'poor' | 'below_average' | 'average' | 'good' | 'excellent';
  if (score >= 8) level = 'excellent';
  else if (score >= 6) level = 'good';
  else if (score >= 4) level = 'average';
  else if (score >= 2) level = 'below_average';
  else level = 'poor';

  return { score, level };
}

/**
 * Combina insights + detalhes de criativos
 */
export async function getCreativesWithInsights(
  adAccountId: string,
  accessToken: string,
  datePreset: string = 'last_30d'
): Promise<CreativeWithInsights[]> {
  const [insights, details] = await Promise.all([
    getAdLevelInsights(adAccountId, accessToken, datePreset),
    getCreativeDetails(adAccountId, accessToken),
  ]);

  const insightsMap = new Map(insights.map(i => [i.ad_id, i]));

  return details.map(detail => {
    const insight = insightsMap.get(detail.ad_id) || null;
    const fatigue = insight
      ? calculateFatigueScore(insight)
      : { score: 0, level: 'low' as const, reasons: [] };
    const isVideo = detail.creative_type === 'video';
    const quality = insight
      ? calculateQualityScore(insight, isVideo)
      : { score: 0, level: 'poor' as const };

    return {
      ...detail,
      insights: insight,
      fatigue_score: fatigue.score,
      fatigue_level: fatigue.level,
      fatigue_reasons: fatigue.reasons,
      quality_score: quality.score,
      quality_level: quality.level,
    };
  });
}

/**
 * Performance diária de um anúncio específico (para gráfico de timeline + curva de fadiga)
 */
export async function getAdDailyPerformance(
  adId: string,
  accessToken: string,
  datePreset: string = 'last_30d'
): Promise<DailyInsight[]> {
  const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/${adId}/insights`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('date_preset', datePreset);
  url.searchParams.set('fields', [
    'spend',
    'impressions',
    'clicks',
    'cpc',
    'ctr',
    'reach',
    'frequency',
    'actions',
    'cost_per_action_type',
  ].join(','));
  url.searchParams.set('time_increment', '1');
  url.searchParams.set('limit', '500');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch daily performance');
  }

  const json = await response.json();

  if (!json.data || json.data.length === 0) {
    return [];
  }

  return json.data.map((d: any) => {
    const getActionVal = (type: string) => {
      if (!d.actions) return 0;
      const found = d.actions.find((a: any) => a.action_type === type);
      return found ? parseInt(found.value || 0) : 0;
    };

    const conversions = getActionVal('lead') + getActionVal('purchase') + getActionVal('offsite_conversion.fb_pixel_lead');

    const costPerResult = d.cost_per_action_type
      ? d.cost_per_action_type.find((c: any) =>
          ['lead', 'purchase', 'offsite_conversion.fb_pixel_lead', 'offsite_conversion.fb_pixel_purchase'].includes(c.action_type)
        )?.value || 0
      : 0;

    const impressions = parseInt(d.impressions || 0);
    const reach = parseInt(d.reach || 0);

    return {
      date: d.date_start,
      spend: parseFloat(d.spend || 0),
      impressions,
      clicks: parseInt(d.clicks || 0),
      ctr: parseFloat(d.ctr || 0),
      cpc: parseFloat(d.cpc || 0),
      reach,
      frequency: parseFloat(d.frequency || 0),
      conversions,
      likes: getActionVal('post_reaction'),
      comments: getActionVal('comment'),
      cost_per_result: parseFloat(costPerResult),
    };
  });
}

/**
 * Busca insights com breakdown por posicionamento para uma conta
 */
export async function getPlacementBreakdown(
  adAccountId: string,
  accessToken: string,
  datePreset: string = 'last_30d',
  adId?: string
): Promise<PlacementInsight[]> {
  const cleanAccountId = adAccountId.replace('act_', '');

  const baseUrl = adId
    ? `${GRAPH_API_URL}/${GRAPH_VERSION}/${adId}/insights`
    : `${GRAPH_API_URL}/${GRAPH_VERSION}/act_${cleanAccountId}/insights`;

  const url = new URL(baseUrl);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('date_preset', datePreset);
  url.searchParams.set('fields', [
    'spend',
    'impressions',
    'clicks',
    'cpc',
    'cpm',
    'ctr',
    'reach',
    'frequency',
    'actions',
    'cost_per_action_type',
  ].join(','));
  url.searchParams.set('breakdowns', 'publisher_platform,platform_position');
  if (!adId) {
    url.searchParams.set('level', 'ad');
  }
  url.searchParams.set('limit', '500');

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch placement breakdown');
  }

  const json = await response.json();

  if (!json.data || json.data.length === 0) {
    return [];
  }

  // Aggregate by platform+position
  const aggregated = new Map<string, PlacementInsight>();

  for (const d of json.data) {
    const key = `${d.publisher_platform}|${d.platform_position}`;

    const getActionVal = (type: string) => {
      if (!d.actions) return 0;
      const found = d.actions.find((a: any) => a.action_type === type);
      return found ? parseInt(found.value || 0) : 0;
    };

    const conversions = getActionVal('lead') + getActionVal('purchase') +
      getActionVal('offsite_conversion.fb_pixel_lead') + getActionVal('offsite_conversion.fb_pixel_purchase');

    const costPerResult = d.cost_per_action_type
      ? d.cost_per_action_type.find((c: any) =>
          ['lead', 'purchase', 'offsite_conversion.fb_pixel_lead'].includes(c.action_type)
        )?.value || 0
      : 0;

    const existing = aggregated.get(key);
    if (existing) {
      existing.spend += parseFloat(d.spend || 0);
      existing.impressions += parseInt(d.impressions || 0);
      existing.clicks += parseInt(d.clicks || 0);
      existing.reach += parseInt(d.reach || 0);
      existing.conversions += conversions;
    } else {
      aggregated.set(key, {
        publisher_platform: d.publisher_platform,
        platform_position: d.platform_position,
        spend: parseFloat(d.spend || 0),
        impressions: parseInt(d.impressions || 0),
        clicks: parseInt(d.clicks || 0),
        ctr: parseFloat(d.ctr || 0),
        cpc: parseFloat(d.cpc || 0),
        cpm: parseFloat(d.cpm || 0),
        reach: parseInt(d.reach || 0),
        frequency: parseFloat(d.frequency || 0),
        conversions,
        cost_per_result: parseFloat(costPerResult),
      });
    }
  }

  // Recalculate derived metrics for aggregated data
  return Array.from(aggregated.values()).map(p => ({
    ...p,
    ctr: p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0,
    cpc: p.clicks > 0 ? p.spend / p.clicks : 0,
    cpm: p.impressions > 0 ? (p.spend / p.impressions) * 1000 : 0,
    frequency: p.reach > 0 ? p.impressions / p.reach : 0,
    cost_per_result: p.conversions > 0 ? p.spend / p.conversions : 0,
  })).sort((a, b) => b.spend - a.spend);
}
