/**
 * POST /api/auth/meta/data-deletion
 *
 * GDPR Compliance - requisição de deleção de dados
 * Facebook chama quando usuário solicita deleção de dados
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
    // Facebook envia signed_request quando usuário pede deleção
    const formData = await request.formData();
    const signedRequest = formData.get('signed_request') as string;

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
    }

    // Parse signed request
    const [signature, payload] = signedRequest.split('.');
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf8')
    );

    const { user_id: metaUserId } = decodedPayload;

    console.log('🗑️  Data deletion request:', { metaUserId });

    // Deletar todos dados relacionados ao usuário Meta
    const { error } = await supabase
      .from('meta_connections')
      .delete()
      .eq('meta_user_id', metaUserId);

    if (error) {
      console.error('❌ Erro ao deletar dados:', error);
      return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }

    // TODO: Se tiver outras tabelas com dados Meta, deletar também
    // Exemplo: meta_insights, meta_campaigns, etc.

    console.log('✅ Dados deletados');

    // Facebook espera um confirmation code (URL de status)
    // Formato: { url: 'https://yourdomain.com/deletion-status/:deletion_id', confirmation_code: ':deletion_id' }
    const deletionId = `deletion_${metaUserId}_${Date.now()}`;

    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/deletion-status/${deletionId}`,
      confirmation_code: deletionId,
    });
  } catch (error: any) {
    console.error('❌ Erro ao processar data deletion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
