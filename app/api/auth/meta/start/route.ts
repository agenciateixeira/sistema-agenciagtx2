/**
 * GET /api/auth/meta/start
 *
 * Inicia fluxo OAuth com Meta
 * FASE 1.2 do Roadmap - OAuth Multi-tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Forçar rota dinâmica (não pre-renderizar)
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação via cookie de sessão
    const authHeader = request.headers.get('cookie');

    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Extrair session token do cookie (Next.js + Supabase padrão)
    const sessionMatch = authHeader.match(/sb-[^=]+-auth-token=([^;]+)/);

    if (!sessionMatch) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Gerar state CSRF token
    const state = crypto.randomBytes(32).toString('hex');

    // Salvar state na sessão (via tabela oauth_states temporária)
    // Expira em 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await supabase.from('oauth_states').insert({
      state,
      provider: 'meta',
      expires_at: expiresAt.toISOString(),
    });

    // Montar URL de autorização do Meta
    const authUrl = new URL('https://www.facebook.com/v22.0/dialog/oauth');

    authUrl.searchParams.set('client_id', process.env.META_APP_ID!);
    authUrl.searchParams.set('redirect_uri', process.env.META_OAUTH_REDIRECT_URI!);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'ads_read,business_management');
    authUrl.searchParams.set('response_type', 'code');

    console.log('🔐 OAuth iniciado:', { state, redirect_uri: process.env.META_OAUTH_REDIRECT_URI });

    // Redirecionar para Meta
    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('❌ Erro ao iniciar OAuth Meta:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start OAuth' },
      { status: 500 }
    );
  }
}
