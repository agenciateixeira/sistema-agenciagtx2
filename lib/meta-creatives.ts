/**
 * Meta Creatives Insights Service
 * Busca dados de criativos e performance por anúncio
 * Análise de fadiga, CTR, frequência e thumbnails
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

    return {
      ad_id: data.ad_id,
      ad_name: data.ad_name,
      campaign_id: data.campaign_id,
      campaign_name: data.campaign_name,
      adset_id: data.adset_id,
      adset_name: data.adset_name,
      spend,
      impressions: parseInt(data.impressions || 0),
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

  score = Math.min(score, 100);

  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 70) level = 'critical';
  else if (score >= 45) level = 'high';
  else if (score >= 25) level = 'medium';
  else level = 'low';

  return { score, level, reasons };
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

    return {
      ...detail,
      insights: insight,
      fatigue_score: fatigue.score,
      fatigue_level: fatigue.level,
    };
  });
}
