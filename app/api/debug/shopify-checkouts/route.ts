/**
 * GET /api/debug/shopify-checkouts?integration_id=xxx
 * Retorna estrutura completa dos checkouts da Shopify para debug
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id');

    if (!integrationId) {
      return NextResponse.json(
        { error: 'integration_id é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar integração
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json(
        { error: 'Integração não encontrada' },
        { status: 404 }
      );
    }

    // Extrair domínio da store_url
    const storeUrl = integration.store_url.replace('https://', '').replace('http://', '');
    const shopDomain = storeUrl.split('/')[0];

    // Buscar checkouts
    const apiUrl = `https://${shopDomain}/admin/api/2024-10/checkouts.json?limit=10`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': integration.api_key,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar checkouts', details: data },
        { status: response.status }
      );
    }

    const checkouts = data.checkouts || [];

    // Retornar estrutura completa para análise
    return NextResponse.json({
      success: true,
      total: checkouts.length,
      checkouts: checkouts.map((c: any) => ({
        id: c.id,
        // Tentar todos os campos possíveis de email
        emails_found: {
          'checkout.email': c.email || null,
          'checkout.customer?.email': c.customer?.email || null,
          'checkout.billing_address?.email': c.billing_address?.email || null,
          'checkout.shipping_address?.email': c.shipping_address?.email || null,
          'checkout.buyer_accepts_marketing': c.buyer_accepts_marketing || null,
        },
        customer: c.customer || null,
        billing_address: c.billing_address || null,
        shipping_address: c.shipping_address || null,
        // Estrutura completa
        full_checkout: c,
      })),
    });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
