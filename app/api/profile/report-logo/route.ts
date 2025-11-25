/**
 * POST /api/profile/report-logo - Upload de logo para relatórios
 * PATCH /api/profile/report-logo - Atualizar nome da empresa
 * DELETE /api/profile/report-logo - Remover logo
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyName = formData.get('company_name') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use PNG, JPG ou SVG.' },
        { status: 400 }
      );
    }

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 2MB' },
        { status: 400 }
      );
    }

    // Buscar logo antigo para deletar
    const { data: profile } = await supabase
      .from('profiles')
      .select('report_logo_url')
      .eq('id', user.id)
      .single();

    // Deletar logo antigo se existir
    if (profile?.report_logo_url) {
      const oldPath = profile.report_logo_url.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('report-logos').remove([`${user.id}/${oldPath}`]);
      }
    }

    // Fazer upload do novo arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('report-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('report-logos')
      .getPublicUrl(filePath);

    // Atualizar profile
    const updateData: any = { report_logo_url: publicUrl };
    if (companyName) {
      updateData.report_company_name = companyName;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logo_url: publicUrl,
      company_name: companyName,
    });
  } catch (error: any) {
    console.error('Error in POST /api/profile/report-logo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company_name } = body;

    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Atualizar profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ report_company_name: company_name })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, company_name });
  } catch (error: any) {
    console.error('Error in PATCH /api/profile/report-logo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar logo atual
    const { data: profile } = await supabase
      .from('profiles')
      .select('report_logo_url')
      .eq('id', user.id)
      .single();

    // Deletar do storage
    if (profile?.report_logo_url) {
      const filePath = profile.report_logo_url.split('/').pop();
      if (filePath) {
        await supabase.storage.from('report-logos').remove([`${user.id}/${filePath}`]);
      }
    }

    // Atualizar profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ report_logo_url: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/profile/report-logo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
