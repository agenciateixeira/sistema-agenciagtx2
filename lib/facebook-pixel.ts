/**
 * Facebook Conversions API Integration
 * Envia eventos de conversão para o Facebook via server-side
 */

// @ts-ignore
import bizSdk from 'facebook-nodejs-business-sdk';

const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;

// Configurações do Pixel (podem vir do env ou do banco)
const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '611003988383118';
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || 'EAANah2CP0DwBO0JN3XgJAU4TS0RSrIXKgeH9OvrbwIVGsHL0MeWzRfaXZCcO5vvzWoE1owpZCES2JRqalNOoZC2zTtFQZCcuovBtCVLcRvv7DKyCi6qeUU25ZBwY4rV8nNkBcZBKGNF7oLRjEDaQw58DUhJyWL7bvxZCJsrgrfNHpPWSoh1E27CfTYWIC0nXMq5BwZDZD';

const api = bizSdk.FacebookAdsApi.init(ACCESS_TOKEN);

interface FacebookEventParams {
  email: string;
  eventName: 'ViewContent' | 'InitiateCheckout' | 'Purchase';
  eventSourceUrl: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Envia evento de conversão para o Facebook
 */
export async function sendFacebookEvent(params: FacebookEventParams): Promise<void> {
  try {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn('⚠️ Facebook Pixel não configurado');
      return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Dados do usuário
    const userData = new UserData()
      .setEmails([params.email.toLowerCase()])
      .setClientIpAddress(params.ipAddress || '0.0.0.0')
      .setClientUserAgent(params.userAgent || 'Mozilla/5.0');

    // Dados customizados do evento
    const customData = new CustomData()
      .setCurrency(params.currency || 'BRL')
      .setValue(params.value || 0);

    if (params.contentIds) {
      const contents = params.contentIds.map(id =>
        new Content().setId(id).setQuantity(1)
      );
      customData.setContents(contents);
    }

    if (params.contentName) {
      customData.setContentName(params.contentName);
    }

    // Criar evento
    const serverEvent = new ServerEvent()
      .setEventName(params.eventName)
      .setEventTime(currentTimestamp)
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(params.eventSourceUrl)
      .setActionSource('email');

    // Criar request
    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(ACCESS_TOKEN, PIXEL_ID)
      .setEvents(eventsData);

    // Enviar para Facebook
    const response = await eventRequest.execute();

    console.log('✅ Facebook event sent:', {
      eventName: params.eventName,
      email: params.email,
      response: response,
    });
  } catch (error: any) {
    console.error('❌ Erro ao enviar evento para Facebook:', error);
    // Não quebra o fluxo se falhar
  }
}

/**
 * Envia evento ViewContent (cliente abriu email)
 */
export async function sendViewContentEvent(params: {
  email: string;
  actionId: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  await sendFacebookEvent({
    email: params.email,
    eventName: 'ViewContent',
    eventSourceUrl: `https://sistema-agenciagtx2.vercel.app/api/track/open/${params.actionId}`,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

/**
 * Envia evento InitiateCheckout (cliente clicou no link)
 */
export async function sendInitiateCheckoutEvent(params: {
  email: string;
  actionId: string;
  checkoutUrl: string;
  cartValue?: number;
  currency?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  await sendFacebookEvent({
    email: params.email,
    eventName: 'InitiateCheckout',
    eventSourceUrl: params.checkoutUrl,
    value: params.cartValue,
    currency: params.currency || 'BRL',
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

/**
 * Envia evento Purchase (cliente finalizou compra)
 */
export async function sendPurchaseEvent(params: {
  email: string;
  orderId: string;
  value: number;
  currency?: string;
  contentIds?: string[];
}) {
  await sendFacebookEvent({
    email: params.email,
    eventName: 'Purchase',
    eventSourceUrl: `https://sistema-agenciagtx2.vercel.app/recovery`,
    value: params.value,
    currency: params.currency || 'BRL',
    contentIds: params.contentIds,
    contentName: `Order ${params.orderId}`,
  });
}
