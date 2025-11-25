/**
 * Meta Insights Service
 * Busca métricas de campanhas do Meta Ads
 * FASE 2: Dashboard Ads Básico
 */

import { decrypt } from './crypto';

const GRAPH_API_URL = 'https://graph.facebook.com';
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v22.0';

export interface AdAccountInsights {
  account_id: string;
  account_name: string;
  date_start: string;
  date_stop: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  reach: number;
  frequency: number;
  conversions?: number;
  conversion_value?: number;
  roas?: number;
}

export interface CampaignInsights {
  campaign_id: string;
  campaign_name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  conversions?: number;
  roas?: number;
}

export interface DailyInsights {
  date: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions?: number;
}

/**
 * Busca insights de uma conta de anúncios
 */
export async function getAdAccountInsights(
  adAccountId: string,
  accessToken: string,
  datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'this_month' | 'last_month' = 'last_30d'
): Promise<AdAccountInsights | null> {
  try {
    // Remove 'act_' prefix se existir
    const cleanAccountId = adAccountId.replace('act_', '');

    const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/act_${cleanAccountId}/insights`);

    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('date_preset', datePreset);
    url.searchParams.set('fields', [
      'account_id',
      'account_name',
      'date_start',
      'date_stop',
      'spend',
      'impressions',
      'clicks',
      'cpc',
      'cpm',
      'ctr',
      'reach',
      'frequency',
      'conversions',
      'conversion_values',
    ].join(','));
    url.searchParams.set('level', 'account');
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro ao buscar insights:', error);
      throw new Error(error.error?.message || 'Failed to fetch insights');
    }

    const json = await response.json();

    if (!json.data || json.data.length === 0) {
      return null;
    }

    const data = json.data[0];

    // Calcular ROAS se tiver conversões
    let roas = undefined;
    if (data.conversion_values && data.conversion_values.length > 0 && parseFloat(data.spend) > 0) {
      const totalConversionValue = data.conversion_values.reduce(
        (sum: number, item: any) => sum + parseFloat(item.value || 0),
        0
      );
      roas = totalConversionValue / parseFloat(data.spend);
    }

    return {
      account_id: data.account_id,
      account_name: data.account_name,
      date_start: data.date_start,
      date_stop: data.date_stop,
      spend: parseFloat(data.spend || 0),
      impressions: parseInt(data.impressions || 0),
      clicks: parseInt(data.clicks || 0),
      cpc: parseFloat(data.cpc || 0),
      cpm: parseFloat(data.cpm || 0),
      ctr: parseFloat(data.ctr || 0),
      reach: parseInt(data.reach || 0),
      frequency: parseFloat(data.frequency || 0),
      conversions: data.conversions ? data.conversions.length : undefined,
      conversion_value: data.conversion_values
        ? data.conversion_values.reduce((sum: number, item: any) => sum + parseFloat(item.value || 0), 0)
        : undefined,
      roas,
    };
  } catch (error: any) {
    console.error('❌ Erro ao buscar insights da conta:', error);
    throw error;
  }
}

/**
 * Busca insights de todas as campanhas de uma conta
 */
export async function getCampaignsInsights(
  adAccountId: string,
  accessToken: string,
  datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'last_30d'
): Promise<CampaignInsights[]> {
  try {
    const cleanAccountId = adAccountId.replace('act_', '');

    const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/act_${cleanAccountId}/insights`);

    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('date_preset', datePreset);
    url.searchParams.set('fields', [
      'campaign_id',
      'campaign_name',
      'spend',
      'impressions',
      'clicks',
      'cpc',
      'ctr',
      'conversions',
      'conversion_values',
    ].join(','));
    url.searchParams.set('level', 'campaign');
    url.searchParams.set('limit', '100');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro ao buscar campanhas:', error);
      throw new Error(error.error?.message || 'Failed to fetch campaigns');
    }

    const json = await response.json();

    if (!json.data || json.data.length === 0) {
      return [];
    }

    // Buscar status de cada campanha
    const campaigns: CampaignInsights[] = await Promise.all(
      json.data.map(async (data: any) => {
        let status = 'UNKNOWN';

        try {
          const campaignUrl = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/${data.campaign_id}`);
          campaignUrl.searchParams.set('access_token', accessToken);
          campaignUrl.searchParams.set('fields', 'status');

          const campaignResponse = await fetch(campaignUrl.toString());
          if (campaignResponse.ok) {
            const campaignData = await campaignResponse.json();
            status = campaignData.status;
          }
        } catch (error) {
          console.warn(`⚠️ Não foi possível buscar status da campanha ${data.campaign_id}`);
        }

        // Calcular ROAS
        let roas = undefined;
        if (data.conversion_values && data.conversion_values.length > 0 && parseFloat(data.spend) > 0) {
          const totalConversionValue = data.conversion_values.reduce(
            (sum: number, item: any) => sum + parseFloat(item.value || 0),
            0
          );
          roas = totalConversionValue / parseFloat(data.spend);
        }

        return {
          campaign_id: data.campaign_id,
          campaign_name: data.campaign_name,
          status,
          spend: parseFloat(data.spend || 0),
          impressions: parseInt(data.impressions || 0),
          clicks: parseInt(data.clicks || 0),
          cpc: parseFloat(data.cpc || 0),
          ctr: parseFloat(data.ctr || 0),
          conversions: data.conversions ? data.conversions.length : undefined,
          roas,
        };
      })
    );

    return campaigns;
  } catch (error: any) {
    console.error('❌ Erro ao buscar campanhas:', error);
    throw error;
  }
}

/**
 * Busca insights diários (últimos 30 dias)
 */
export async function getDailyInsights(
  adAccountId: string,
  accessToken: string,
  days: number = 30
): Promise<DailyInsights[]> {
  try {
    const cleanAccountId = adAccountId.replace('act_', '');

    // Calcular data de início (30 dias atrás)
    const dateEnd = new Date();
    const dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - days);

    const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/act_${cleanAccountId}/insights`);

    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('time_range', JSON.stringify({
      since: dateStart.toISOString().split('T')[0],
      until: dateEnd.toISOString().split('T')[0],
    }));
    url.searchParams.set('time_increment', '1'); // 1 dia
    url.searchParams.set('fields', 'spend,clicks,impressions,conversions');
    url.searchParams.set('level', 'account');
    url.searchParams.set('limit', String(days));

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro ao buscar insights diários:', error);
      throw new Error(error.error?.message || 'Failed to fetch daily insights');
    }

    const json = await response.json();

    if (!json.data || json.data.length === 0) {
      return [];
    }

    return json.data.map((data: any) => ({
      date: data.date_start,
      spend: parseFloat(data.spend || 0),
      clicks: parseInt(data.clicks || 0),
      impressions: parseInt(data.impressions || 0),
      conversions: data.conversions ? data.conversions.length : undefined,
    }));
  } catch (error: any) {
    console.error('❌ Erro ao buscar insights diários:', error);
    throw error;
  }
}

/**
 * Formata valores monetários em BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata percentuais
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Formata números grandes (impressões, alcance)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
