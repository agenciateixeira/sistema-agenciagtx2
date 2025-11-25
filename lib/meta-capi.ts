/**
 * Meta Conversions API (CAPI) Service
 * Envia eventos de conversão server-side para o Meta
 * FASE 6: CAPI
 *
 * Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import crypto from 'crypto';

const GRAPH_API_URL = 'https://graph.facebook.com';
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v22.0';

export interface MetaCAPIEvent {
  event_name: 'Purchase' | 'AddToCart' | 'InitiateCheckout' | 'Lead';
  event_time: number; // Unix timestamp in seconds
  event_id: string; // Unique ID for deduplication
  event_source_url: string; // URL where event occurred
  action_source: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';

  // User data (for matching)
  user_data: {
    em?: string; // Email (hashed with SHA256)
    ph?: string; // Phone (hashed with SHA256)
    fn?: string; // First name (hashed)
    ln?: string; // Last name (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };

  // Custom data (purchase info)
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    contents?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    num_items?: number;
  };
}

/**
 * Hash de dados do usuário (SHA256)
 * Meta requer que dados pessoais sejam hasheados
 */
function hashData(data: string | undefined | null): string | undefined {
  if (!data) return undefined;

  // Normalizar: lowercase, sem espaços
  const normalized = data.toLowerCase().trim().replace(/\s+/g, '');

  // SHA256
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Envia evento para Meta Conversions API
 */
export async function sendMetaCAPIEvent(
  pixelId: string,
  accessToken: string,
  event: MetaCAPIEvent
): Promise<{ success: boolean; event_id: string }> {
  try {
    const url = `${GRAPH_API_URL}/${GRAPH_VERSION}/${pixelId}/events`;

    const payload = {
      data: [event],
      access_token: accessToken,
    };

    console.log('📤 Enviando evento CAPI para Meta:', {
      pixel: pixelId,
      event: event.event_name,
      event_id: event.event_id,
      value: event.custom_data?.value,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro ao enviar evento CAPI:', error);
      throw new Error(error.error?.message || 'Failed to send CAPI event');
    }

    const result = await response.json();

    console.log('✅ Evento CAPI enviado com sucesso:', result);

    return {
      success: true,
      event_id: event.event_id,
    };
  } catch (error: any) {
    console.error('❌ Erro ao enviar evento CAPI:', error);
    throw error;
  }
}

/**
 * Cria evento Purchase (quando carrinho é recuperado)
 */
export function createPurchaseEvent(
  customerEmail: string,
  customerName: string | null,
  totalValue: number,
  currency: string,
  cartItems: any[],
  eventSourceUrl: string,
  clientIp?: string,
  clientUserAgent?: string
): MetaCAPIEvent {
  // Gerar Event ID único (para deduplicação)
  const eventId = `purchase_${crypto.randomBytes(16).toString('hex')}`;

  // Hash do email e nome
  const emailHash = hashData(customerEmail);

  // Separar primeiro e último nome
  let firstNameHash: string | undefined;
  let lastNameHash: string | undefined;

  if (customerName) {
    const nameParts = customerName.trim().split(' ');
    firstNameHash = hashData(nameParts[0]);
    lastNameHash = hashData(nameParts[nameParts.length - 1]);
  }

  // Preparar dados dos produtos
  const contents = cartItems.map((item: any) => ({
    id: item.product_id || item.id || 'unknown',
    quantity: item.quantity || 1,
    item_price: parseFloat(item.price || 0),
  }));

  const contentIds = contents.map((c) => c.id);

  return {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000), // Unix timestamp
    event_id: eventId,
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: {
      em: emailHash,
      fn: firstNameHash,
      ln: lastNameHash,
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent,
    },
    custom_data: {
      currency,
      value: totalValue,
      content_ids: contentIds,
      content_type: 'product',
      contents,
      num_items: cartItems.length,
    },
  };
}

/**
 * Cria evento AddToCart (quando carrinho é criado)
 */
export function createAddToCartEvent(
  customerEmail: string,
  customerName: string | null,
  totalValue: number,
  currency: string,
  cartItems: any[],
  eventSourceUrl: string,
  clientIp?: string,
  clientUserAgent?: string
): MetaCAPIEvent {
  const eventId = `add_to_cart_${crypto.randomBytes(16).toString('hex')}`;

  const emailHash = hashData(customerEmail);

  let firstNameHash: string | undefined;
  let lastNameHash: string | undefined;

  if (customerName) {
    const nameParts = customerName.trim().split(' ');
    firstNameHash = hashData(nameParts[0]);
    lastNameHash = hashData(nameParts[nameParts.length - 1]);
  }

  const contents = cartItems.map((item: any) => ({
    id: item.product_id || item.id || 'unknown',
    quantity: item.quantity || 1,
    item_price: parseFloat(item.price || 0),
  }));

  const contentIds = contents.map((c) => c.id);

  return {
    event_name: 'AddToCart',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: {
      em: emailHash,
      fn: firstNameHash,
      ln: lastNameHash,
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent,
    },
    custom_data: {
      currency,
      value: totalValue,
      content_ids: contentIds,
      content_type: 'product',
      contents,
      num_items: cartItems.length,
    },
  };
}

/**
 * Valida se Pixel ID está configurado
 */
export function isPixelConfigured(pixelId: string | null | undefined): boolean {
  return !!pixelId && pixelId.length > 0;
}
