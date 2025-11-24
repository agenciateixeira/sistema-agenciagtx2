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
    const storeUrlInput = formData.get('store_url') as string;
    const accessToken = formData.get('access_token') as string;
    const apiKey = formData.get('api_key') as string;
    const apiSecret = formData.get('api_secret') as string;

    if (!platform || !storeName || !storeUrlInput || !accessToken || !apiKey || !apiSecret) {
      return { error: 'Todos os campos são obrigatórios' };
    }

    // Validar conexão Shopify
    if (platform === 'shopify') {
      // Limpar URL: remove https://, http://, www., espaços e barras
      let cleanUrl = storeUrlInput
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

      // Adicionar .myshopify.com se não tiver
      if (!cleanUrl.includes('.myshopify.com')) {
        cleanUrl = `${cleanUrl}.myshopify.com`;
      }

      const storeUrl = `https://${cleanUrl}`;

      console.log('🔍 DEBUG - Tentando conectar:', {
        input: storeUrlInput,
        cleanUrl,
        storeName,
        storeUrl,
        accessToken: accessToken.substring(0, 10) + '...',
        apiKey: apiKey.substring(0, 10) + '...',
        apiSecret: apiSecret.substring(0, 10) + '...',
      });

      // Testar conexão com Shopify Admin API
      try {
        const shopifyResponse = await fetch(`${storeUrl}/admin/api/2024-10/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        });

        if (!shopifyResponse.ok) {
          const errorText = await shopifyResponse.text();
          console.error('Shopify API Error:', {
            status: shopifyResponse.status,
            statusText: shopifyResponse.statusText,
            error: errorText,
            storeUrl,
          });
          return {
            error: `Erro ao conectar: ${shopifyResponse.status} - ${shopifyResponse.statusText}. Verifique suas credenciais.`
          };
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
            api_key: accessToken, // Token de acesso (usado nas requisições)
            api_secret: apiSecret,
            webhook_secret: crypto.randomUUID(), // Gerar secret para validar webhooks
            status: 'active',
            last_sync_at: new Date().toISOString(),
            settings: {
              shop_name: shopData.shop?.name,
              shop_email: shopData.shop?.email,
              shop_currency: shopData.shop?.currency,
              api_key_normal: apiKey, // API Key normal (32 caracteres)
            },
          })
          .select()
          .single();

        if (dbError) {
          console.error('Erro ao salvar integração:', dbError);
          return { error: 'Erro ao salvar integração no banco' };
        }

        // Configurar webhooks automaticamente na Shopify
        const { registerShopifyWebhooks } = await import('@/lib/shopify-webhooks');
        const webhookResult = await registerShopifyWebhooks({
          id: integration.id,
          store_url: storeUrl,
          api_key: accessToken,
          webhook_secret: integration.webhook_secret,
        });

        if (!webhookResult.success) {
          console.error('⚠️ Aviso: Erro ao configurar webhooks:', webhookResult.error);
          // Não retorna erro, apenas avisa - a integração já foi criada
        } else {
          console.log('✅ Webhooks configurados:', webhookResult.webhooks?.length || 0);
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

export async function updateIntegration(integrationId: string, formData: FormData) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Não autenticado' };
    }

    const storeName = formData.get('store_name') as string;
    const storeUrlInput = formData.get('store_url') as string;
    const accessToken = formData.get('access_token') as string;
    const apiKey = formData.get('api_key') as string;
    const apiSecret = formData.get('api_secret') as string;

    if (!storeName || !storeUrlInput || !accessToken || !apiKey || !apiSecret) {
      return { error: 'Todos os campos são obrigatórios' };
    }

    // Limpar URL
    let cleanUrl = storeUrlInput
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    if (!cleanUrl.includes('.myshopify.com')) {
      cleanUrl = `${cleanUrl}.myshopify.com`;
    }

    const storeUrl = `https://${cleanUrl}`;

    // Testar credenciais primeiro
    const shopifyResponse = await fetch(`${storeUrl}/admin/api/2024-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!shopifyResponse.ok) {
      return { error: 'Credenciais inválidas. Verifique o token de acesso.' };
    }

    const shopData = await shopifyResponse.json();

    // Atualizar integração
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        store_name: storeName,
        store_url: storeUrl,
        api_key: accessToken,
        api_secret: apiSecret,
        status: 'active',
        error_message: null,
        last_sync_at: new Date().toISOString(),
        settings: {
          shop_name: shopData.shop?.name,
          shop_email: shopData.shop?.email,
          shop_currency: shopData.shop?.currency,
          api_key_normal: apiKey,
        },
      })
      .eq('id', integrationId);

    if (updateError) {
      console.error('Erro ao atualizar integração:', updateError);
      return { error: 'Erro ao atualizar integração' };
    }

    revalidatePath('/integrations');
    return { success: true };
  } catch (error: any) {
    console.error('Erro em updateIntegration:', error);
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
        const shopifyResponse = await fetch(`${integration.store_url}/admin/api/2024-10/shop.json`, {
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
