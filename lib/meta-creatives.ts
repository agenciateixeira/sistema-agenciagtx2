/**
 * Meta Creatives Insights Service
 * Busca dados de criativos e performance por anúncio
 * Análise de fadiga, CTR, frequência, Hook Rate, Hold Rate, Quality Score
 * Tipos de conversão customizáveis, Account Health, Cohort Analysis
 */

const GRAPH_API_URL = 'https://graph.facebook.com';
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v22.0';

// ─── Tipos de Conversão Customizáveis ─────────────────────

export type ConversionType =
  | 'messages'
  | 'leads'
  | 'purchases'
  | 'registrations'
  | 'link_clicks'
  | 'landing_page_views'
  | 'add_to_cart'
  | 'initiate_checkout';

export const CONVERSION_ACTION_MAP: Record<ConversionType, string[]> = {
  messages: [
    'onsite_conversion.messaging_first_reply',
    'onsite_conversion.messaging_conversation_started_7d',
    'onsite_conversion.messaging_reply',
  ],
  leads: [
    'lead',
    'offsite_conversion.fb_pixel_lead',
    'onsite_conversion.lead_grouped',
  ],
  purchases: [
    'purchase',
    'offsite_conversion.fb_pixel_purchase',
  ],
  registrations: [
    'complete_registration',
    'offsite_conversion.fb_pixel_complete_registration',
  ],
  link_clicks: ['link_click'],
  landing_page_views: ['landing_page_view'],
  add_to_cart: [
    'offsite_conversion.fb_pixel_add_to_cart',
    'add_to_cart',
  ],
  initiate_checkout: [
    'offsite_conversion.fb_pixel_initiate_checkout',
    'initiate_checkout',
  ],
};

export const CONVERSION_TYPE_LABELS: Record<ConversionType, string> = {
  messages: 'Mensagens',
  leads: 'Leads',
  purchases: 'Compras',
  registrations: 'Cadastros',
  link_clicks: 'Cliques no Link',
  landing_page_views: 'Views na LP',
  add_to_cart: 'Add ao Carrinho',
  initiate_checkout: 'Início Checkout',
};

// ─── Interfaces ───────────────────────────────────────────

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
  // Engagement
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  link_clicks: number;
  // Video retention
  video_plays: number;
  video_thru_plays: number;
  video_p25: number;
  video_p50: number;
  video_p75: number;
  video_p95: number;
  video_avg_time: number;
  // Rates
  hook_rate: number;
  hold_rate: number;
  click_rate: number;
  engagement_rate: number;
  save_rate: number;
  // Conversion breakdown
  messages: number;
  landing_page_views: number;
  add_to_cart: number;
  initiate_checkout: number;
  registrations: number;
  purchases_count: number;
  leads_count: number;
  // Raw data for custom conversion selection
  raw_actions: Record<string, number>;
  raw_cost_per_action: Record<string, number>;
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
  messages: number;
  link_clicks: number;
  landing_page_views: number;
  leads_count: number;
  purchases_count: number;
  saves: number;
  shares: number;
  raw_actions: Record<string, number>;
  raw_cost_per_action: Record<string, number>;
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
  quality_score: number;
  quality_level: 'poor' | 'below_average' | 'average' | 'good' | 'excellent';
}

// ─── API: Ad Level Insights ───────────────────────────────

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
    const getActionVal = (type: string) => {
      if (!data.actions) return 0;
      const found = data.actions.find((a: any) => a.action_type === type);
      return found ? parseInt(found.value || 0) : 0;
    };

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
    const clicks = parseInt(data.clicks || 0);

    // Video metrics
    const videoPlays = data.video_play_actions
      ? data.video_play_actions.reduce((sum: number, a: any) => sum + parseInt(a.value || 0), 0)
      : getActionVal('video_view');
    const videoThruPlays = getActionVal('video_view');
    const videoP25 = getActionVal('video_p25_watched');
    const videoP50 = getActionVal('video_p50_watched');
    const videoP75 = getActionVal('video_p75_watched');
    const videoP95 = getActionVal('video_p95_watched');

    // Rates
    const hookRate = impressions > 0 ? (videoThruPlays / impressions) * 100 : 0;
    const holdRate = videoThruPlays > 0 ? (videoP95 / videoThruPlays) * 100 : 0;

    const likes = getActionVal('post_reaction');
    const comments = getActionVal('comment');
    const shares = getActionVal('post');
    const saves = getActionVal('onsite_conversion.post_save');
    const linkClicks = getActionVal('link_click');

    const clickRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const engagementRate = impressions > 0 ? ((likes + comments + shares) / impressions) * 100 : 0;
    const saveRate = impressions > 0 ? (saves / impressions) * 100 : 0;

    // Messages
    const messagesReceived =
      getActionVal('onsite_conversion.messaging_first_reply') +
      getActionVal('onsite_conversion.messaging_conversation_started_7d');

    // Raw actions map
    const rawActions: Record<string, number> = {};
    if (data.actions) {
      for (const a of data.actions) {
        rawActions[a.action_type] = parseInt(a.value || 0);
      }
    }

    const rawCostPerAction: Record<string, number> = {};
    if (data.cost_per_action_type) {
      for (const c of data.cost_per_action_type) {
        rawCostPerAction[c.action_type] = parseFloat(c.value || 0);
      }
    }

    return {
      ad_id: data.ad_id,
      ad_name: data.ad_name,
      campaign_id: data.campaign_id,
      campaign_name: data.campaign_name,
      adset_id: data.adset_id,
      adset_name: data.adset_name,
      spend,
      impressions,
      clicks,
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
      likes,
      comments,
      shares,
      saves,
      link_clicks: linkClicks,
      video_plays: videoPlays,
      video_thru_plays: videoThruPlays,
      video_p25: videoP25,
      video_p50: videoP50,
      video_p75: videoP75,
      video_p95: videoP95,
      video_avg_time: 0,
      hook_rate: hookRate,
      hold_rate: holdRate,
      click_rate: clickRate,
      engagement_rate: engagementRate,
      save_rate: saveRate,
      messages: messagesReceived,
      landing_page_views: getActionVal('landing_page_view'),
      add_to_cart: getActionVal('offsite_conversion.fb_pixel_add_to_cart') + getActionVal('add_to_cart'),
      initiate_checkout: getActionVal('offsite_conversion.fb_pixel_initiate_checkout') + getActionVal('initiate_checkout'),
      registrations: getActionVal('complete_registration') + getActionVal('offsite_conversion.fb_pixel_complete_registration'),
      purchases_count: getActionVal('purchase') + getActionVal('offsite_conversion.fb_pixel_purchase'),
      leads_count: getActionVal('lead') + getActionVal('offsite_conversion.fb_pixel_lead'),
      raw_actions: rawActions,
      raw_cost_per_action: rawCostPerAction,
    };
  });
}

// ─── API: Creative Details ────────────────────────────────

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

// ─── Fatigue Score ────────────────────────────────────────

export function calculateFatigueScore(insight: CreativeInsight): {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

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

  if (insight.ctr < 0.5) {
    score += 30;
    reasons.push(`CTR muito baixo: ${insight.ctr.toFixed(2)}%`);
  } else if (insight.ctr < 1.0) {
    score += 15;
    reasons.push(`CTR abaixo da média: ${insight.ctr.toFixed(2)}%`);
  }

  if (insight.cpc > 5) {
    score += 20;
    reasons.push(`CPC muito alto: R$ ${insight.cpc.toFixed(2)}`);
  } else if (insight.cpc > 3) {
    score += 10;
    reasons.push(`CPC acima da média: R$ ${insight.cpc.toFixed(2)}`);
  }

  if (insight.cpm > 50) {
    score += 10;
    reasons.push(`CPM elevado: R$ ${insight.cpm.toFixed(2)}`);
  }

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

// ─── Quality Score ────────────────────────────────────────

export function calculateQualityScore(insight: CreativeInsight, isVideo: boolean): {
  score: number;
  level: 'poor' | 'below_average' | 'average' | 'good' | 'excellent';
} {
  let totalScore = 0;

  if (isVideo) {
    const hookScore = Math.min(insight.hook_rate / 2, 10);
    totalScore += hookScore * 0.30;
    const holdScore = Math.min(insight.hold_rate / 4, 10);
    totalScore += holdScore * 0.20;
    const ctrScore = Math.min(insight.ctr / 0.3, 10);
    totalScore += ctrScore * 0.20;
  } else {
    const ctrScore = Math.min(insight.ctr / 0.25, 10);
    totalScore += ctrScore * 0.40;
    const cpcScore = insight.cpc > 0 ? Math.min(3 / insight.cpc, 1) * 10 : 5;
    totalScore += cpcScore * 0.10;
  }

  const totalEngagement = insight.likes + insight.comments + insight.shares;
  const engagementRate = insight.impressions > 0 ? (totalEngagement / insight.impressions) * 100 : 0;
  const engagementScore = Math.min(engagementRate / 0.5, 10);
  totalScore += engagementScore * 0.15;

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

// ─── Combine Insights + Details ───────────────────────────

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

// ─── API: Daily Performance ───────────────────────────────

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

    const rawActions: Record<string, number> = {};
    if (d.actions) {
      for (const a of d.actions) {
        rawActions[a.action_type] = parseInt(a.value || 0);
      }
    }

    const rawCostPerAction: Record<string, number> = {};
    if (d.cost_per_action_type) {
      for (const c of d.cost_per_action_type) {
        rawCostPerAction[c.action_type] = parseFloat(c.value || 0);
      }
    }

    const messagesReceived =
      getActionVal('onsite_conversion.messaging_first_reply') +
      getActionVal('onsite_conversion.messaging_conversation_started_7d');

    return {
      date: d.date_start,
      spend: parseFloat(d.spend || 0),
      impressions: parseInt(d.impressions || 0),
      clicks: parseInt(d.clicks || 0),
      ctr: parseFloat(d.ctr || 0),
      cpc: parseFloat(d.cpc || 0),
      reach: parseInt(d.reach || 0),
      frequency: parseFloat(d.frequency || 0),
      conversions,
      likes: getActionVal('post_reaction'),
      comments: getActionVal('comment'),
      cost_per_result: parseFloat(costPerResult),
      messages: messagesReceived,
      link_clicks: getActionVal('link_click'),
      landing_page_views: getActionVal('landing_page_view'),
      leads_count: getActionVal('lead') + getActionVal('offsite_conversion.fb_pixel_lead'),
      purchases_count: getActionVal('purchase') + getActionVal('offsite_conversion.fb_pixel_purchase'),
      saves: getActionVal('onsite_conversion.post_save'),
      shares: getActionVal('post'),
      raw_actions: rawActions,
      raw_cost_per_action: rawCostPerAction,
    };
  });
}

// ─── API: Placement Breakdown ─────────────────────────────

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

  return Array.from(aggregated.values()).map(p => ({
    ...p,
    ctr: p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0,
    cpc: p.clicks > 0 ? p.spend / p.clicks : 0,
    cpm: p.impressions > 0 ? (p.spend / p.impressions) * 1000 : 0,
    frequency: p.reach > 0 ? p.impressions / p.reach : 0,
    cost_per_result: p.conversions > 0 ? p.spend / p.conversions : 0,
  })).sort((a, b) => b.spend - a.spend);
}

// ─── Helpers: Custom Conversion Calculation ───────────────

export function getConversionsForTypes(
  rawActions: Record<string, number>,
  conversionTypes: ConversionType[]
): number {
  let total = 0;
  for (const type of conversionTypes) {
    const actionTypes = CONVERSION_ACTION_MAP[type];
    for (const at of actionTypes) {
      total += rawActions[at] || 0;
    }
  }
  return total;
}

export function getCostPerConversion(
  spend: number,
  rawActions: Record<string, number>,
  conversionTypes: ConversionType[]
): number {
  const total = getConversionsForTypes(rawActions, conversionTypes);
  return total > 0 ? spend / total : 0;
}

// ─── Account Health Score ─────────────────────────────────

export interface AccountHealthResult {
  score: number;
  level: 'critical' | 'poor' | 'average' | 'good' | 'excellent';
  metrics: {
    label: string;
    value: string;
    score: number;
    status: 'danger' | 'warning' | 'good' | 'excellent';
    benchmark: string;
  }[];
  summary: string;
}

export function calculateAccountHealth(
  insights: CreativeInsight[],
  conversionTypes: ConversionType[]
): AccountHealthResult {
  if (insights.length === 0) {
    return {
      score: 0,
      level: 'critical',
      metrics: [],
      summary: 'Sem dados suficientes para análise.',
    };
  }

  const totalSpend = insights.reduce((s, i) => s + i.spend, 0);
  const totalImpressions = insights.reduce((s, i) => s + i.impressions, 0);
  const totalClicks = insights.reduce((s, i) => s + i.clicks, 0);
  const totalReach = insights.reduce((s, i) => s + i.reach, 0);
  const totalConversions = insights.reduce((s, i) =>
    s + getConversionsForTypes(i.raw_actions, conversionTypes), 0);
  const totalEngagement = insights.reduce((s, i) =>
    s + i.likes + i.comments + i.shares + i.saves, 0);

  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgFrequency = totalReach > 0 ? totalImpressions / totalReach : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const engagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

  const metrics: AccountHealthResult['metrics'] = [];

  // 1. CTR
  const ctrScore = Math.min(avgCTR / 0.02, 100);
  metrics.push({
    label: 'CTR Médio',
    value: `${avgCTR.toFixed(2)}%`,
    score: ctrScore,
    status: avgCTR >= 2 ? 'excellent' : avgCTR >= 1 ? 'good' : avgCTR >= 0.5 ? 'warning' : 'danger',
    benchmark: 'Bom: >1% · Excelente: >2%',
  });

  // 2. CPC
  const cpcScore = avgCPC > 0 ? Math.min((2 / avgCPC) * 50, 100) : 50;
  metrics.push({
    label: 'CPC Médio',
    value: `R$ ${avgCPC.toFixed(2)}`,
    score: cpcScore,
    status: avgCPC <= 1 ? 'excellent' : avgCPC <= 2 ? 'good' : avgCPC <= 4 ? 'warning' : 'danger',
    benchmark: 'Bom: <R$2 · Excelente: <R$1',
  });

  // 3. CPM
  const cpmScore = avgCPM > 0 ? Math.min((30 / avgCPM) * 50, 100) : 50;
  metrics.push({
    label: 'CPM Médio',
    value: `R$ ${avgCPM.toFixed(2)}`,
    score: cpmScore,
    status: avgCPM <= 20 ? 'excellent' : avgCPM <= 35 ? 'good' : avgCPM <= 60 ? 'warning' : 'danger',
    benchmark: 'Bom: <R$35 · Excelente: <R$20',
  });

  // 4. Frequência
  const freqScore = avgFrequency <= 1.5 ? 100 : avgFrequency <= 2.5 ? 70 : avgFrequency <= 3.5 ? 40 : 10;
  metrics.push({
    label: 'Frequência',
    value: avgFrequency.toFixed(1),
    score: freqScore,
    status: avgFrequency <= 1.5 ? 'excellent' : avgFrequency <= 2.5 ? 'good' : avgFrequency <= 3.5 ? 'warning' : 'danger',
    benchmark: 'Bom: <2.5 · Perigoso: >3.5',
  });

  // 5. Taxa de Conversão
  const convScore = conversionRate >= 5 ? 100 : conversionRate >= 2 ? 70 : conversionRate >= 0.5 ? 40 : 10;
  metrics.push({
    label: 'Taxa de Conversão',
    value: totalConversions > 0 ? `${conversionRate.toFixed(2)}%` : 'N/A',
    score: totalConversions > 0 ? convScore : 0,
    status: totalConversions > 0 ? (conversionRate >= 5 ? 'excellent' : conversionRate >= 2 ? 'good' : conversionRate >= 0.5 ? 'warning' : 'danger') : 'danger',
    benchmark: 'Bom: >2% · Excelente: >5%',
  });

  // 6. Custo por Conversão
  const cpcvScore = costPerConversion > 0 ? Math.min((20 / costPerConversion) * 50, 100) : 0;
  metrics.push({
    label: 'Custo por Conversão',
    value: totalConversions > 0 ? `R$ ${costPerConversion.toFixed(2)}` : 'N/A',
    score: totalConversions > 0 ? cpcvScore : 0,
    status: totalConversions > 0 ? (costPerConversion <= 10 ? 'excellent' : costPerConversion <= 25 ? 'good' : costPerConversion <= 50 ? 'warning' : 'danger') : 'danger',
    benchmark: 'Depende do nicho',
  });

  // 7. Engajamento
  const engScore = engagementRate >= 3 ? 100 : engagementRate >= 1.5 ? 70 : engagementRate >= 0.5 ? 40 : 15;
  metrics.push({
    label: 'Engajamento',
    value: `${engagementRate.toFixed(2)}%`,
    score: engScore,
    status: engagementRate >= 3 ? 'excellent' : engagementRate >= 1.5 ? 'good' : engagementRate >= 0.5 ? 'warning' : 'danger',
    benchmark: 'Bom: >1.5% · Excelente: >3%',
  });

  // Overall weighted score
  const weights = [0.15, 0.15, 0.10, 0.15, 0.20, 0.15, 0.10];
  const overallScore = Math.round(
    metrics.reduce((sum, m, i) => sum + m.score * weights[i], 0)
  );

  let level: AccountHealthResult['level'];
  if (overallScore >= 80) level = 'excellent';
  else if (overallScore >= 60) level = 'good';
  else if (overallScore >= 40) level = 'average';
  else if (overallScore >= 20) level = 'poor';
  else level = 'critical';

  const summaryMap = {
    excellent: 'Conta com performance excelente! Os indicadores estão acima dos benchmarks.',
    good: 'Boa performance. Alguns pontos podem ser otimizados.',
    average: 'Performance na média. Há oportunidades de otimização.',
    poor: 'Performance abaixo da média. Revisão urgente recomendada.',
    critical: 'Performance crítica. Pausar, analisar e reestruturar.',
  };

  return { score: overallScore, level, metrics, summary: summaryMap[level] };
}
