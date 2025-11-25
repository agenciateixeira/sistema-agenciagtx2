/**
 * GET /api/auth/meta/callback
 *
 * Callback do OAuth Meta - processa autorização
 * FASE 1.2 do Roadmap - OAuth Multi-tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/crypto';
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getMe,
  getUserBusinesses,
  getBusinessAdAccounts,
  getBusinessPixels,
} from '@/lib/meta-client';

// Forçar rota dinâmica (não pre-renderizar)
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // 1. Verificar se houve erro no OAuth
    if (error) {
      console.error('❌ OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=oauth_failed&reason=${error}`
      );
    }

    // 2. Validar parâmetros
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=invalid_callback`
      );
    }

    // 3. Validar state (CSRF protection)
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'meta')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !oauthState) {
      console.error('❌ Invalid or expired state');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=invalid_state`
      );
    }

    // Remover state usado
    await supabase.from('oauth_states').delete().eq('state', state);

    console.log('✅ State validado');

    // 4. Trocar code por short-lived token
    console.log('🔄 Trocando code por token...');
    const shortTokenData = await exchangeCodeForToken(code);

    // 5. Trocar short token por long-lived token (60 dias)
    console.log('🔄 Trocando por long-lived token...');
    const longTokenData = await getLongLivedToken(shortTokenData.access_token);

    const accessToken = longTokenData.access_token;
    const expiresIn = longTokenData.expires_in; // segundos
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    console.log('✅ Long-lived token obtido (válido por', expiresIn / 86400, 'dias)');

    // 6. Buscar informações do usuário
    console.log('👤 Buscando informações do usuário...');
    const userInfo = await getMe(accessToken);

    // 7. Buscar businesses
    console.log('🏢 Buscando businesses...');
    const businesses = await getUserBusinesses(accessToken);

    // 8. Para cada business, buscar ad accounts e pixels
    console.log('📊 Buscando ad accounts e pixels...');
    const adAccountIds: any[] = [];
    const pixelIds: any[] = [];

    for (const business of businesses) {
      try {
        const accounts = await getBusinessAdAccounts(business.id, accessToken);
        adAccountIds.push(...accounts.map((acc) => ({
          id: acc.id,
          account_id: acc.account_id,
          name: acc.name,
          business_id: business.id,
        })));

        const pixels = await getBusinessPixels(business.id, accessToken);
        pixelIds.push(...pixels.map((pix) => ({
          id: pix.id,
          name: pix.name,
          business_id: business.id,
        })));
      } catch (error: any) {
        console.warn(`⚠️ Erro ao buscar assets do business ${business.id}:`, error.message);
      }
    }

    console.log('✅ Assets encontrados:', {
      businesses: businesses.length,
      ad_accounts: adAccountIds.length,
      pixels: pixelIds.length,
    });

    // 9. Criptografar access token
    const encryptedToken = encrypt(accessToken);

    // 10. Obter user_id do usuário autenticado
    // TODO: Melhorar isso - buscar user_id do session token
    // Por enquanto, vamos criar um middleware ou pegar do cookie
    // Para MVP, vamos criar a conexão para o primeiro usuário encontrado
    // Em produção, SEMPRE validar o user_id da sessão

    const { data: users } = await supabase.from('profiles').select('id').limit(1);
    const userId = users?.[0]?.id;

    if (!userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=user_not_found`
      );
    }

    // 11. Salvar ou atualizar conexão no banco
    const connectionData = {
      user_id: userId,
      meta_user_id: userInfo.id,
      meta_user_name: userInfo.name,
      meta_user_email: userInfo.email,
      access_token_encrypted: encryptedToken,
      token_expires_at: expiresAt.toISOString(),
      granted_scopes: ['ads_read', 'business_management'],
      business_ids: businesses.map((b) => ({ id: b.id, name: b.name })),
      ad_account_ids: adAccountIds,
      pixel_ids: pixelIds,
      primary_ad_account_id: null, // Usuário vai escolher no dashboard
      primary_pixel_id: null, // Usuário vai escolher no dashboard
      status: 'connected',
      last_sync_at: new Date().toISOString(),
    };

    // Upsert (insert ou update se já existir)
    const { error: saveError } = await supabase
      .from('meta_connections')
      .upsert(connectionData, {
        onConflict: 'user_id',
      });

    if (saveError) {
      console.error('❌ Erro ao salvar conexão:', saveError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=save_failed`
      );
    }

    console.log('✅ Conexão Meta salva com sucesso!');

    // 12. Redirecionar para página de seleção de conta (se tiver múltiplas)
    if (adAccountIds.length > 1) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations/meta/select-account`
      );
    }

    // 13. Redirecionar para integrações com sucesso
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=meta_connected`
    );
  } catch (error: any) {
    console.error('❌ Erro no callback OAuth Meta:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=oauth_failed&details=${encodeURIComponent(error.message)}`
    );
  }
}
