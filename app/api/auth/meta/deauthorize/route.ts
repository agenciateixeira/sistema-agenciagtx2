/**
 * POST /api/auth/meta/deauthorize
 *
 * Desautoriza conexão com Meta Ads
 * Chamado quando usuário revoga permissões no Facebook
 * FASE 1.2 do Roadmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Facebook envia signed_request quando usuário revoga
    const formData = await request.formData();
    const signedRequest = formData.get('signed_request') as string;

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
    }

    // Parse signed request
    // Formato: signature.payload (base64)
    const [signature, payload] = signedRequest.split('.');
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf8')
    );

    const { user_id: metaUserId } = decodedPayload;

    console.log('🔓 Deauthorize recebido:', { metaUserId });

    // Marcar conexão como disconnected
    const { error } = await supabase
      .from('meta_connections')
      .update({
        status: 'disconnected',
        error_message: 'User deauthorized app',
      })
      .eq('meta_user_id', metaUserId);

    if (error) {
      console.error('❌ Erro ao desautorizar:', error);
      return NextResponse.json({ error: 'Failed to deauthorize' }, { status: 500 });
    }

    console.log('✅ Conexão desautorizada');

    // Facebook espera confirmação vazia
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error('❌ Erro ao processar deauthorize:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
