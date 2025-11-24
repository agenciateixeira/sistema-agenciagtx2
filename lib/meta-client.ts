/**
 * Meta Graph API Client
 *
 * Cliente para interagir com Facebook/Meta Graph API
 * Usado para OAuth e consultas de dados de anúncios
 */

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v22.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

interface MetaAPIResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

/**
 * Troca authorization code por short-lived access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const response = await fetch(
    `${META_GRAPH_BASE}/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: process.env.META_OAUTH_REDIRECT_URI!,
        code,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Troca short-lived token por long-lived token (60 dias)
 */
export async function getLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const response = await fetch(
    `${META_GRAPH_BASE}/oauth/access_token?` +
      new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: shortToken,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get long-lived token');
  }

  return response.json();
}

/**
 * Busca informações do usuário autenticado
 */
export async function getMe(accessToken: string): Promise<{
  id: string;
  name: string;
  email?: string;
}> {
  const response = await fetch(
    `${META_GRAPH_BASE}/me?` +
      new URLSearchParams({
        fields: 'id,name,email',
        access_token: accessToken,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get user info');
  }

  return response.json();
}

/**
 * Busca negócios do usuário
 */
export async function getUserBusinesses(
  accessToken: string
): Promise<Array<{ id: string; name: string }>> {
  const response = await fetch(
    `${META_GRAPH_BASE}/me/businesses?` +
      new URLSearchParams({
        fields: 'id,name',
        access_token: accessToken,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get businesses');
  }

  const json: MetaAPIResponse<Array<{ id: string; name: string }>> =
    await response.json();
  return json.data || [];
}

/**
 * Busca contas de anúncios owned de um negócio
 */
export async function getBusinessAdAccounts(
  businessId: string,
  accessToken: string
): Promise<Array<{ id: string; name: string; account_id: string }>> {
  const response = await fetch(
    `${META_GRAPH_BASE}/${businessId}/owned_ad_accounts?` +
      new URLSearchParams({
        fields: 'id,name,account_id',
        access_token: accessToken,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get ad accounts');
  }

  const json: MetaAPIResponse<Array<{ id: string; name: string; account_id: string }>> =
    await response.json();
  return json.data || [];
}

/**
 * Busca pixels owned de um negócio
 */
export async function getBusinessPixels(
  businessId: string,
  accessToken: string
): Promise<Array<{ id: string; name: string }>> {
  const response = await fetch(
    `${META_GRAPH_BASE}/${businessId}/owned_pixels?` +
      new URLSearchParams({
        fields: 'id,name',
        access_token: accessToken,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get pixels');
  }

  const json: MetaAPIResponse<Array<{ id: string; name: string }>> =
    await response.json();
  return json.data || [];
}

/**
 * Valida se um token ainda é válido
 */
export async function debugToken(
  accessToken: string
): Promise<{
  is_valid: boolean;
  expires_at: number;
  scopes: string[];
  user_id: string;
}> {
  const response = await fetch(
    `${META_GRAPH_BASE}/debug_token?` +
      new URLSearchParams({
        input_token: accessToken,
        access_token: `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`,
      })
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to debug token');
  }

  const json = await response.json();
  return json.data;
}
