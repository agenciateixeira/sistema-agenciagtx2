/**
 * GET  /api/alerts - Listar configurações de alertas do usuário
 * POST /api/alerts - Criar nova configuração de alerta
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar alertas do usuário
    const { data: alerts, error } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error in GET /api/alerts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      alert_type,
      name,
      description,
      config,
      check_frequency,
      notification_channels,
      ad_account_id,
      integration_id
    } = body;

    // Validações
    if (!alert_type || !name || !config) {
      return NextResponse.json(
        { error: 'alert_type, name e config são obrigatórios' },
        { status: 400 }
      );
    }

    if (!ad_account_id) {
      return NextResponse.json(
        { error: 'ad_account_id é obrigatório' },
        { status: 400 }
      );
    }

    // Criar alerta
    const { data: alert, error } = await supabase
      .from('alert_configs')
      .insert({
        user_id: user.id,
        alert_type,
        name,
        description: description || null,
        config,
        check_frequency: check_frequency || 'daily',
        notification_channels: notification_channels || ['email'],
        ad_account_id,
        integration_id: integration_id || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/alerts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
