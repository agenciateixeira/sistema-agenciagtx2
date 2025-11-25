import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ShopifyWebhook {
  topic: string;
  address: string;
  format: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;

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

    if (integration.platform !== 'shopify') {
      return NextResponse.json(
        { error: 'Esta integração não é do Shopify' },
        { status: 400 }
      );
    }

    console.log('🔧 Configurando webhooks para:', integration.store_name);

    // Extrair domínio da store_url
    const storeUrl = integration.store_url.replace('https://', '').replace('http://', '');
    const shopDomain = storeUrl.split('/')[0];

    // URL do webhook
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sistema-agenciagtx2.vercel.app'}/api/webhook/shopify`;

    console.log('📍 Webhook URL:', webhookUrl);
    console.log('🏪 Shop Domain:', shopDomain);

    // Tópicos dos webhooks
    const topics = [
      'checkouts/create',
      'checkouts/update',
      'orders/create',
    ];

    // Primeiro, buscar webhooks existentes
    console.log('🔍 Buscando webhooks existentes...');
    const existingResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-10/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': integration.api_key,
        },
      }
    );

    const existingData = await existingResponse.json();
    const existingWebhooks = existingData.webhooks || [];

    console.log(`📋 Encontrados ${existingWebhooks.length} webhooks existentes`);
    existingWebhooks.forEach((w: any) => {
      console.log(`   - ${w.topic} -> ${w.address} (ID: ${w.id})`);
    });

    const results = [];
    const errors = [];

    for (const topic of topics) {
      try {
        // Verificar se já existe um webhook para este tópico e URL
        const existingWebhook = existingWebhooks.find(
          (w: any) => w.topic === topic && w.address === webhookUrl
        );

        if (existingWebhook) {
          console.log(`✅ Webhook ${topic} já existe (ID: ${existingWebhook.id})`);
          results.push({
            topic,
            id: existingWebhook.id,
            address: existingWebhook.address,
            status: 'already_exists',
          });
          continue;
        }

        console.log(`📡 Criando webhook: ${topic}`);

        const response = await fetch(
          `https://${shopDomain}/admin/api/2024-10/webhooks.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': integration.api_key,
            },
            body: JSON.stringify({
              webhook: {
                topic,
                address: webhookUrl,
                format: 'json',
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`❌ Erro ao criar webhook ${topic}:`, data);
          errors.push({
            topic,
            error: data.errors || data.error || 'Erro desconhecido',
          });
          continue;
        }

        console.log(`✅ Webhook ${topic} criado:`, data.webhook?.id);
        results.push({
          topic,
          id: data.webhook?.id,
          address: data.webhook?.address,
          status: 'created',
        });
      } catch (error: any) {
        console.error(`❌ Erro ao criar webhook ${topic}:`, error);
        errors.push({
          topic,
          error: error.message,
        });
      }
    }

    // Atualizar last_sync_at
    await supabase
      .from('integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', integrationId);

    // Contar quantos foram criados vs quantos já existiam
    const created = results.filter((r: any) => r.status === 'created').length;
    const alreadyExists = results.filter((r: any) => r.status === 'already_exists').length;

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Todos os webhooks falharam',
          results,
          errors,
        },
        { status: 207 }
      );
    }

    let message = '';
    if (created > 0 && alreadyExists > 0) {
      message = `${created} webhooks criados, ${alreadyExists} já existiam`;
    } else if (created > 0) {
      message = `${created} webhooks criados com sucesso`;
    } else if (alreadyExists > 0) {
      message = `${alreadyExists} webhooks já configurados`;
    }

    if (errors.length > 0) {
      message += `, ${errors.length} falharam`;
    }

    return NextResponse.json({
      success: true,
      message,
      webhooks: results,
      created,
      alreadyExists,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('❌ Erro ao configurar webhooks:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao configurar webhooks' },
      { status: 500 }
    );
  }
}

// Listar webhooks existentes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;

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

    const storeUrl = integration.store_url.replace('https://', '').replace('http://', '');
    const shopDomain = storeUrl.split('/')[0];

    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-10/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': integration.api_key,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors || 'Erro ao buscar webhooks' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      webhooks: data.webhooks || [],
    });
  } catch (error: any) {
    console.error('❌ Erro ao listar webhooks:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao listar webhooks' },
      { status: 500 }
    );
  }
}
