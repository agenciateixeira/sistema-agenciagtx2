/**
 * ROI Service
 * Cruza dados de Meta Ads com Carrinhos Abandonados
 * para calcular ROI Real de cada campanha
 * FASE 3: Dashboard de ROI
 */

import { createClient } from '@supabase/supabase-js';
import { decrypt } from './crypto';
import { getCampaignsInsights } from './meta-insights';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CampaignROI {
  // Dados da campanha
  campaign_name: string;
  utm_campaign: string;

  // Meta Ads data
  ad_spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;

  // Carrinhos data
  total_carts: number;
  abandoned_carts: number;
  recovered_carts: number;
  total_cart_value: number;
  recovered_value: number;

  // ROI calculations
  roi_percentage: number; // (recovered_value - ad_spend) / ad_spend * 100
  roas: number; // recovered_value / ad_spend
  cost_per_cart: number; // ad_spend / total_carts
  recovery_rate: number; // recovered_carts / abandoned_carts * 100
}

export interface ROISummary {
  // Period
  date_start: string;
  date_stop: string;

  // Totals
  total_ad_spend: number;
  total_recovered_value: number;
  total_carts: number;
  total_recovered_carts: number;

  // Overall metrics
  overall_roi: number;
  overall_roas: number;
  overall_recovery_rate: number;

  // Per campaign
  campaigns: CampaignROI[];
}

/**
 * Calcula ROI de todas as campanhas para um usuário
 */
export async function calculateUserROI(
  userId: string,
  datePreset: 'last_7d' | 'last_30d' | 'this_month' | 'last_month' = 'last_30d'
): Promise<ROISummary | null> {
  try {
    // 1. Buscar conexão Meta Ads do usuário
    const { data: metaConnection, error: connectionError } = await supabase
      .from('meta_connections')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (connectionError || !metaConnection) {
      throw new Error('Meta connection not found');
    }

    // Verificar se token expirou
    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
    if (tokenExpired || metaConnection.status !== 'connected') {
      throw new Error('Token expired or connection not active');
    }

    if (!metaConnection.primary_ad_account_id) {
      throw new Error('No ad account configured');
    }

    // 2. Descriptografar token
    const accessToken = decrypt(metaConnection.access_token_encrypted);

    // 3. Buscar insights de campanhas da Meta Ads
    // Converter datePreset para formato suportado pela Meta API
    const metaDatePreset = (datePreset === 'this_month' || datePreset === 'last_month')
      ? 'last_30d'
      : datePreset;

    const campaignsInsights = await getCampaignsInsights(
      metaConnection.primary_ad_account_id,
      accessToken,
      metaDatePreset as 'last_7d' | 'last_30d'
    );

    if (campaignsInsights.length === 0) {
      return null;
    }

    // 4. Calcular período baseado no date_preset
    const { dateStart, dateStop } = getDateRange(datePreset);

    // 5. Para cada campanha, buscar carrinhos abandonados relacionados
    const campaignsROI: CampaignROI[] = [];

    for (const campaign of campaignsInsights) {
      // Extrair nome limpo da campanha para match com UTM
      // Geralmente Meta Ads usa o nome da campanha como utm_campaign
      const utm_campaign = campaign.campaign_name.toLowerCase().replace(/\s+/g, '-');

      // Buscar carrinhos com este utm_campaign
      const { data: carts } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('user_id', userId)
        .ilike('utm_campaign', `%${utm_campaign}%`)
        .gte('abandoned_at', dateStart.toISOString())
        .lte('abandoned_at', dateStop.toISOString());

      const totalCarts = carts?.length || 0;
      const abandonedCarts = carts?.filter((c) => c.status === 'abandoned').length || 0;
      const recoveredCarts = carts?.filter((c) => c.status === 'recovered').length || 0;

      const totalCartValue = carts?.reduce((sum, c) => sum + parseFloat(c.total_value || 0), 0) || 0;
      const recoveredValue = carts?.filter((c) => c.status === 'recovered')
        .reduce((sum, c) => sum + parseFloat(c.recovered_value || c.total_value || 0), 0) || 0;

      // Calcular ROI
      const roi_percentage = campaign.spend > 0
        ? ((recoveredValue - campaign.spend) / campaign.spend) * 100
        : 0;

      const roas = campaign.spend > 0 ? recoveredValue / campaign.spend : 0;
      const cost_per_cart = totalCarts > 0 ? campaign.spend / totalCarts : 0;
      const recovery_rate = abandonedCarts > 0 ? (recoveredCarts / abandonedCarts) * 100 : 0;

      campaignsROI.push({
        campaign_name: campaign.campaign_name,
        utm_campaign,
        ad_spend: campaign.spend,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        cpc: campaign.cpc,
        ctr: campaign.ctr,
        total_carts: totalCarts,
        abandoned_carts: abandonedCarts,
        recovered_carts: recoveredCarts,
        total_cart_value: totalCartValue,
        recovered_value: recoveredValue,
        roi_percentage,
        roas,
        cost_per_cart,
        recovery_rate,
      });
    }

    // 6. Calcular totais
    const total_ad_spend = campaignsROI.reduce((sum, c) => sum + c.ad_spend, 0);
    const total_recovered_value = campaignsROI.reduce((sum, c) => sum + c.recovered_value, 0);
    const total_carts = campaignsROI.reduce((sum, c) => sum + c.total_carts, 0);
    const total_recovered_carts = campaignsROI.reduce((sum, c) => sum + c.recovered_carts, 0);
    const total_abandoned_carts = campaignsROI.reduce((sum, c) => sum + c.abandoned_carts, 0);

    const overall_roi = total_ad_spend > 0
      ? ((total_recovered_value - total_ad_spend) / total_ad_spend) * 100
      : 0;

    const overall_roas = total_ad_spend > 0 ? total_recovered_value / total_ad_spend : 0;
    const overall_recovery_rate = total_abandoned_carts > 0
      ? (total_recovered_carts / total_abandoned_carts) * 100
      : 0;

    return {
      date_start: dateStart.toISOString().split('T')[0],
      date_stop: dateStop.toISOString().split('T')[0],
      total_ad_spend,
      total_recovered_value,
      total_carts,
      total_recovered_carts,
      overall_roi,
      overall_roas,
      overall_recovery_rate,
      campaigns: campaignsROI.sort((a, b) => b.recovered_value - a.recovered_value),
    };
  } catch (error: any) {
    console.error('❌ Erro ao calcular ROI:', error);
    throw error;
  }
}

/**
 * Retorna range de datas baseado no preset
 */
function getDateRange(preset: string): { dateStart: Date; dateStop: Date } {
  const dateStop = new Date();
  const dateStart = new Date();

  switch (preset) {
    case 'last_7d':
      dateStart.setDate(dateStart.getDate() - 7);
      break;
    case 'last_30d':
      dateStart.setDate(dateStart.getDate() - 30);
      break;
    case 'this_month':
      dateStart.setDate(1);
      break;
    case 'last_month':
      dateStart.setMonth(dateStart.getMonth() - 1);
      dateStart.setDate(1);
      dateStop.setDate(0); // Último dia do mês anterior
      break;
    default:
      dateStart.setDate(dateStart.getDate() - 30);
  }

  return { dateStart, dateStop };
}

/**
 * Formata valores monetários
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
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Formata ROI com cor (positivo = verde, negativo = vermelho)
 */
export function getROIColor(roi: number): string {
  if (roi > 50) return 'text-green-700';
  if (roi > 0) return 'text-green-600';
  if (roi > -20) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Formata ROAS com descrição
 */
export function formatROAS(roas: number): string {
  return `${roas.toFixed(2)}x`;
}
