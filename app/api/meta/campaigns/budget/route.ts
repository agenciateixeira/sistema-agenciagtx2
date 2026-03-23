/**
 * POST /api/meta/campaigns/budget
 *
 * Edita a verba (daily_budget ou lifetime_budget) de uma campanha ou ad set
 * via Meta Marketing API
 *
 * Body:
 *   - campaign_id ou adset_id: ID do objeto a editar
 *   - daily_budget?: nova verba diária em centavos (ex: 5000 = R$ 50,00)
 *   - lifetime_budget?: nova verba total em centavos
 *   - budget_amount?: valor em reais (converte pra centavos automaticamente)
 *   - level: 'campaign' | 'adset' (default: 'campaign')
 *
 * A Meta API espera budget em centavos (minor units).
 * Ex: R$ 100,00 = 10000 centavos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

const GRAPH_API_URL = 'https://graph.facebook.com';
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v22.0';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BudgetUpdateRequest {
  campaign_id?: string;
  adset_id?: string;
  daily_budget?: number;
  lifetime_budget?: number;
  budget_amount?: number; // em reais, convertemos pra centavos
  level?: 'campaign' | 'adset';
}

async function updateMetaBudget(
  objectId: string,
  accessToken: string,
  params: Record<string, string>
): Promise<{ success: boolean; data?: any; error?: string }> {
  const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/${objectId}`);

  const body = new URLSearchParams();
  body.append('access_token', accessToken);

  for (const [key, value] of Object.entries(params)) {
    body.append(key, value);
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const json = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: json.error?.message || 'Failed to update budget',
    };
  }

  return { success: true, data: json };
}

async function getObjectDetails(
  objectId: string,
  accessToken: string,
  level: 'campaign' | 'adset'
): Promise<any> {
  const fields = level === 'campaign'
    ? 'id,name,status,daily_budget,lifetime_budget,budget_remaining,objective'
    : 'id,name,status,daily_budget,lifetime_budget,budget_remaining,campaign_id';

  const url = new URL(`${GRAPH_API_URL}/${GRAPH_VERSION}/${objectId}`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('fields', fields);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch object details');
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body: BudgetUpdateRequest = await request.json();
    const { campaign_id, adset_id, daily_budget, lifetime_budget, budget_amount, level = 'campaign' } = body;

    // Validar input
    const objectId = level === 'adset' ? adset_id : campaign_id;

    if (!objectId) {
      return NextResponse.json(
        { error: `${level}_id is required` },
        { status: 400 }
      );
    }

    if (!daily_budget && !lifetime_budget && !budget_amount) {
      return NextResponse.json(
        { error: 'daily_budget, lifetime_budget or budget_amount is required' },
        { status: 400 }
      );
    }

    // Buscar user_id do header ou body
    const userId = request.headers.get('x-user-id') || body.toString();

    // Buscar todas as conexões Meta ativas (pegar a que tem o objeto)
    // Para simplicidade, pegamos pelo header x-user-id
    const userIdFromUrl = new URL(request.url).searchParams.get('user_id');
    const finalUserId = userIdFromUrl || request.headers.get('x-user-id');

    if (!finalUserId) {
      return NextResponse.json(
        { error: 'user_id is required (query param or x-user-id header)' },
        { status: 400 }
      );
    }

    const { data: metaConnection, error: connectionError } = await supabase
      .from('meta_connections')
      .select('*')
      .eq('user_id', finalUserId)
      .single();

    if (connectionError || !metaConnection) {
      return NextResponse.json(
        { error: 'Meta connection not found' },
        { status: 404 }
      );
    }

    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
    if (tokenExpired || metaConnection.status !== 'connected') {
      return NextResponse.json(
        { error: 'Token expired or connection not active' },
        { status: 401 }
      );
    }

    const accessToken = decrypt(metaConnection.access_token_encrypted);

    // Buscar detalhes atuais do objeto
    const currentDetails = await getObjectDetails(objectId, accessToken, level);

    // Calcular novo budget em centavos
    let newDailyBudget: number | undefined;
    let newLifetimeBudget: number | undefined;

    if (budget_amount) {
      // budget_amount está em reais, converter para centavos
      newDailyBudget = Math.round(budget_amount * 100);
    } else if (daily_budget) {
      // Se já está em centavos, usar direto
      newDailyBudget = daily_budget;
    } else if (lifetime_budget) {
      newLifetimeBudget = lifetime_budget;
    }

    // Validações de segurança
    const currentBudgetCents = parseInt(currentDetails.daily_budget || currentDetails.lifetime_budget || '0');
    const newBudgetCents = newDailyBudget || newLifetimeBudget || 0;

    // Não permitir reduzir mais de 80% de uma vez
    if (currentBudgetCents > 0 && newBudgetCents < currentBudgetCents * 0.2) {
      return NextResponse.json(
        {
          error: 'Redução máxima de 80% por vez. Reduza gradualmente.',
          current_budget: currentBudgetCents / 100,
          minimum_allowed: (currentBudgetCents * 0.2) / 100,
        },
        { status: 400 }
      );
    }

    // Não permitir aumentar mais de 200% de uma vez (regra Meta + segurança)
    if (currentBudgetCents > 0 && newBudgetCents > currentBudgetCents * 3) {
      return NextResponse.json(
        {
          error: 'Aumento máximo de 200% por vez. Aumente gradualmente para evitar reset de aprendizado.',
          current_budget: currentBudgetCents / 100,
          maximum_allowed: (currentBudgetCents * 3) / 100,
        },
        { status: 400 }
      );
    }

    // Montar params para a API
    const updateParams: Record<string, string> = {};

    if (newDailyBudget) {
      updateParams['daily_budget'] = String(newDailyBudget);
    }

    if (newLifetimeBudget) {
      updateParams['lifetime_budget'] = String(newLifetimeBudget);
    }

    // Executar update
    const result = await updateMetaBudget(objectId, accessToken, updateParams);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Buscar detalhes atualizados
    const updatedDetails = await getObjectDetails(objectId, accessToken, level);

    // Log da alteração para auditoria
    console.log('Budget updated:', {
      user_id: finalUserId,
      level,
      object_id: objectId,
      object_name: currentDetails.name,
      previous_daily_budget: currentDetails.daily_budget,
      new_daily_budget: updatedDetails.daily_budget,
      previous_lifetime_budget: currentDetails.lifetime_budget,
      new_lifetime_budget: updatedDetails.lifetime_budget,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDetails.id,
        name: updatedDetails.name,
        status: updatedDetails.status,
        daily_budget: updatedDetails.daily_budget ? parseInt(updatedDetails.daily_budget) / 100 : null,
        lifetime_budget: updatedDetails.lifetime_budget ? parseInt(updatedDetails.lifetime_budget) / 100 : null,
        budget_remaining: updatedDetails.budget_remaining ? parseInt(updatedDetails.budget_remaining) / 100 : null,
        previous_daily_budget: currentDetails.daily_budget ? parseInt(currentDetails.daily_budget) / 100 : null,
        previous_lifetime_budget: currentDetails.lifetime_budget ? parseInt(currentDetails.lifetime_budget) / 100 : null,
      },
      message: `Verba de "${updatedDetails.name}" atualizada com sucesso`,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar budget:', error);

    if (error.message?.includes('OAuthException') || error.message?.includes('expired')) {
      return NextResponse.json(
        { error: 'Meta API authentication failed. Please reconnect your account.' },
        { status: 401 }
      );
    }

    if (error.message?.includes('budget')) {
      return NextResponse.json(
        { error: `Erro Meta API: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update budget' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meta/campaigns/budget
 *
 * Busca budget atual de uma campanha ou ad set
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const objectId = searchParams.get('campaign_id') || searchParams.get('adset_id');
    const level = searchParams.get('level') as 'campaign' | 'adset' || 'campaign';

    if (!userId || !objectId) {
      return NextResponse.json(
        { error: 'user_id and campaign_id/adset_id are required' },
        { status: 400 }
      );
    }

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

    const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
    if (tokenExpired || metaConnection.status !== 'connected') {
      return NextResponse.json(
        { error: 'Token expired or connection not active' },
        { status: 401 }
      );
    }

    const accessToken = decrypt(metaConnection.access_token_encrypted);
    const details = await getObjectDetails(objectId, accessToken, level);

    return NextResponse.json({
      success: true,
      data: {
        id: details.id,
        name: details.name,
        status: details.status,
        daily_budget: details.daily_budget ? parseInt(details.daily_budget) / 100 : null,
        lifetime_budget: details.lifetime_budget ? parseInt(details.lifetime_budget) / 100 : null,
        budget_remaining: details.budget_remaining ? parseInt(details.budget_remaining) / 100 : null,
        objective: details.objective || null,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar budget:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}
