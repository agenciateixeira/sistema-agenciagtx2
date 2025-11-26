/**
 * Endpoint de teste para verificar se Shopify consegue acessar o servidor
 * GET /api/webhook/shopify-test
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  console.log('✅ Endpoint de teste acessado via GET');

  // Registrar acesso
  await supabase.from('webhook_events').insert({
    id: `test_${Date.now()}`,
    integration_id: '1e371393-e54c-45bd-ad5f-5153c3f4032e',
    user_id: 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c',
    event_type: 'test_get',
    event_data: { method: 'GET', timestamp: new Date().toISOString() },
    processed: true,
  });

  return NextResponse.json({
    success: true,
    message: 'Endpoint acessível via GET',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    console.log('✅ Endpoint de teste acessado via POST');
    console.log('📦 Body length:', bodyText.length);
    console.log('📋 Headers:', headers);

    // Registrar acesso
    await supabase.from('webhook_events').insert({
      id: `test_${Date.now()}`,
      integration_id: '1e371393-e54c-45bd-ad5f-5153c3f4032e',
      user_id: 'ebe65fa6-f26b-4686-8ac2-557d03c89a6c',
      event_type: 'test_post',
      event_data: {
        method: 'POST',
        bodyLength: bodyText.length,
        headers,
        timestamp: new Date().toISOString(),
      },
      processed: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Endpoint acessível via POST',
      timestamp: new Date().toISOString(),
      bodyLength: bodyText.length,
    });
  } catch (error: any) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
