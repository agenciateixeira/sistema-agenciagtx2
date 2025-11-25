/**
 * PATCH /api/alerts/notifications/[id] - Marcar notificação como lida
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { is_read } = body;

    // Atualizar notificação
    const { error: updateError } = await supabase
      .from('alert_history')
      .update({ is_read })
      .eq('id', params.id)
      .eq('user_id', user.id); // Garantir que o usuário só pode atualizar suas próprias notificações

    if (updateError) {
      console.error('Error updating notification:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/alerts/notifications/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
