/**
 * Shopify Webhooks Configuration
 *
 * Auto-configura webhooks na Shopify após integração ser conectada
 */

interface ShopifyWebhook {
  topic: string;
  address: string;
  format: 'json';
}

interface Integration {
  id: string;
  store_url: string;
  api_key: string;
  webhook_secret: string;
}

const WEBHOOK_TOPICS = [
  'checkouts/create',
  'checkouts/update',
  'orders/create',
] as const;

/**
 * Registra todos os webhooks necessários na Shopify
 */
export async function registerShopifyWebhooks(integration: Integration): Promise<{
  success: boolean;
  webhooks?: any[];
  error?: string;
}> {
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/shopify`;
    const webhooksCreated = [];

    for (const topic of WEBHOOK_TOPICS) {
      const webhook: ShopifyWebhook = {
        topic,
        address: webhookUrl,
        format: 'json',
      };

      const response = await fetch(
        `${integration.store_url}/admin/api/2024-10/webhooks.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': integration.api_key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ webhook }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(`Erro ao criar webhook ${topic}:`, error);

        // Se webhook já existe, não é erro fatal
        if (error.errors?.address?.[0]?.includes('already exists')) {
          console.log(`Webhook ${topic} já existe, pulando...`);
          continue;
        }

        return {
          success: false,
          error: `Erro ao criar webhook ${topic}: ${JSON.stringify(error)}`,
        };
      }

      const data = await response.json();
      webhooksCreated.push(data.webhook);
      console.log(`✅ Webhook criado: ${topic} → ${data.webhook.id}`);
    }

    return {
      success: true,
      webhooks: webhooksCreated,
    };
  } catch (error: any) {
    console.error('Erro em registerShopifyWebhooks:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Lista webhooks existentes na Shopify
 */
export async function listShopifyWebhooks(integration: Integration): Promise<{
  success: boolean;
  webhooks?: any[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${integration.store_url}/admin/api/2024-10/webhooks.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': integration.api_key,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Erro ao listar webhooks: ${JSON.stringify(error)}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      webhooks: data.webhooks,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Remove webhooks antigos do GTX Analytics (cleanup)
 */
export async function cleanupOldWebhooks(integration: Integration): Promise<{
  success: boolean;
  removed?: number;
  error?: string;
}> {
  try {
    const { webhooks, error } = await listShopifyWebhooks(integration);

    if (error || !webhooks) {
      return { success: false, error };
    }

    let removed = 0;
    const ourWebhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/shopify`;

    // Remove webhooks que apontam para nosso sistema mas estão duplicados
    for (const webhook of webhooks) {
      if (webhook.address === ourWebhookUrl) {
        // Mantém apenas os webhooks dos topics que usamos
        if (!WEBHOOK_TOPICS.includes(webhook.topic)) {
          await fetch(
            `${integration.store_url}/admin/api/2024-10/webhooks/${webhook.id}.json`,
            {
              method: 'DELETE',
              headers: {
                'X-Shopify-Access-Token': integration.api_key,
              },
            }
          );
          removed++;
        }
      }
    }

    return {
      success: true,
      removed,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Valida webhook recebido da Shopify usando HMAC
 */
export function validateShopifyWebhook(
  body: string,
  hmacHeader: string,
  secret: string
): boolean {
  const crypto = require('crypto');

  const calculatedHmac = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return calculatedHmac === hmacHeader;
}
