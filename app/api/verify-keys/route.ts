import { NextResponse } from 'next/server';

// Rota para verificar se as chaves estão corretas (mostra apenas primeiros/últimos caracteres)
export async function GET() {
  const maskKey = (key: string | undefined) => {
    if (!key) return '❌ FALTANDO';
    if (key.length < 20) return '⚠️ Muito curta';
    return `${key.substring(0, 15)}...${key.substring(key.length - 10)}`;
  };

  return NextResponse.json({
    keys: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ FALTANDO',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: maskKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: maskKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '❌ FALTANDO',
      RESEND_API_KEY: maskKey(process.env.RESEND_API_KEY),
    },
    expected: {
      SUPABASE_SERVICE_ROLE_KEY_should_start_with: 'eyJhbGciOiJIUzI1...',
      SUPABASE_SERVICE_ROLE_KEY_should_end_with: '...fkDfY',
      note: 'Se não bate, a chave está ERRADA no Vercel!',
    },
  });
}
