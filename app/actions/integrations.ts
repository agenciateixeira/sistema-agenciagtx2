'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getSupabaseServer() {
  const cookieStore = cookies();

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

export async function addIntegration(formData: FormData) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Não autenticado' };
    }

    const platform = formData.get('platform') as string;
    const storeName = formData.get('store_name') as string;
    const apiKey = formData.get('api_key') as string;
    const apiSecret = formData.get('api_secret') as string;

    if (!platform || !storeName || !apiKey) {
      return { error: 'Campos obrigatórios faltando' };
    }

    // Validar conexão Shopify
    if (platform === 'shopify') {
      const storeUrl = `https://${storeName}.myshopify.com`;

      // Testar conexão com Shopify Admin API
      try {
        const shopifyResponse = await fetch(`${storeUrl}/admin/api/2024-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!shopifyResponse.ok) {
          return { error: 'Credenciais inválidas. Verifique o token de acesso.' };
        }

        const shopData = await shopifyResponse.json();

        // Salvar integração no banco
        const { data: integration, error: dbError } = await supabase
          .from('integrations')
          .insert({
            user_id: user.id,
            platform,
            store_name: storeName,
            store_url: storeUrl,
            api_key: apiKey,
            api_secret: apiSecret || null,
            webhook_secret: crypto.randomUUID(), // Gerar secret para validar webhooks
            status: 'active',
            last_sync_at: new Date().toISOString(),
            settings: {
              shop_name: shopData.shop?.name,
              shop_email: shopData.shop?.email,
              shop_currency: shopData.shop?.currency,
            },
          })
          .select()
          .single();

        if (dbError) {
          console.error('Erro ao salvar integração:', dbError);
          return { error: 'Erro ao salvar integração no banco' };
        }

        // Configurar webhooks automaticamente
        const { registerShopifyWebhooks } = await import('@/lib/shopify-webhooks');
        const webhookResult = await registerShopifyWebhooks({
          id: integration.id,
          store_url: storeUrl,
          api_key: apiKey,
          webhook_secret: integration.webhook_secret,
        });

        if (!webhookResult.success) {
          console.warn('Aviso: Webhooks não configurados:', webhookResult.error);
          // Não falha a integração, apenas loga o aviso
        } else {
          console.log(`✅ ${webhookResult.webhooks?.length || 0} webhooks configurados`);
        }

        revalidatePath('/integrations');
        return { success: true, integration };
      } catch (error: any) {
        console.error('Erro ao conectar com Shopify:', error);
        return { error: 'Erro ao conectar com Shopify. Verifique as credenciais.' };
      }
    }

    return { error: 'Plataforma não suportada ainda' };
  } catch (error: any) {
    console.error('Erro em addIntegration:', error);
    return { error: error.message || 'Erro desconhecido' };
  }
}

export async function deleteIntegration(integrationId: string) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Não autenticado' };
    }

    // Deletar integração (RLS garante que só pode deletar própria integração)
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId);

    if (error) {
      console.error('Erro ao deletar integração:', error);
      return { error: 'Erro ao deletar integração' };
    }

    revalidatePath('/integrations');
    return { success: true };
  } catch (error: any) {
    console.error('Erro em deleteIntegration:', error);
    return { error: error.message || 'Erro desconhecido' };
  }
}

export async function testIntegration(integrationId: string) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Não autenticado' };
    }

    // Buscar integração
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (fetchError || !integration) {
      return { error: 'Integração não encontrada' };
    }

    // Testar conexão com Shopify
    if (integration.platform === 'shopify') {
      try {
        const shopifyResponse = await fetch(`${integration.store_url}/admin/api/2024-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': integration.api_key,
            'Content-Type': 'application/json',
          },
        });

        if (!shopifyResponse.ok) {
          // Atualizar status para erro
          await supabase
            .from('integrations')
            .update({
              status: 'error',
              error_message: 'Credenciais inválidas ou expiradas',
            })
            .eq('id', integrationId);

          return { error: 'Credenciais inválidas ou expiradas' };
        }

        // Atualizar status para ativo
        await supabase
          .from('integrations')
          .update({
            status: 'active',
            error_message: null,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', integrationId);

        revalidatePath('/integrations');
        return { success: true };
      } catch (error: any) {
        console.error('Erro ao testar Shopify:', error);

        await supabase
          .from('integrations')
          .update({
            status: 'error',
            error_message: error.message,
          })
          .eq('id', integrationId);

        return { error: 'Erro ao conectar com Shopify' };
      }
    }

    return { error: 'Plataforma não suportada' };
  } catch (error: any) {
    console.error('Erro em testIntegration:', error);
    return { error: error.message || 'Erro desconhecido' };
  }
}
