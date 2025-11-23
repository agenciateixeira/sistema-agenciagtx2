'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getSupabaseServer() {
  const cookieStore = cookies();

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

export async function createReport(formData: FormData) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const cadence = formData.get('cadence') as string;
  const channel = formData.get('channel') as string;

  try {
    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', user.id)
      .single();

    // Criar template de relatório
    const { data: template, error: templateError } = await supabase
      .from('ReportTemplate')
      .insert({
        teamId: user.id, // Temporariamente usando user.id como teamId
        name,
        description,
        metrics: [],
      })
      .select()
      .single();

    if (templateError) throw templateError;

    // Criar agendamento
    const { error: scheduleError } = await supabase
      .from('ReportSchedule')
      .insert({
        templateId: template.id,
        ownerId: user.id,
        cadence: cadence.toUpperCase(),
        channels: [channel.toUpperCase()],
        nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    if (scheduleError) throw scheduleError;

    // Se canal for EMAIL, enviar email de confirmação
    if (channel.toUpperCase() === 'EMAIL') {
      const { sendReportEmail } = await import('@/lib/email-service');
      await sendReportEmail({
        to: user.email!,
        userName: profile?.nome || 'Usuário',
        reportName: name,
        cadence: cadence.toUpperCase(),
        summary: description || 'Relatório configurado e pronto para ser enviado automaticamente.',
      });
    }

    revalidatePath('/reports');
    return { success: true, message: channel.toUpperCase() === 'EMAIL' ? 'Relatório criado! Email de confirmação enviado.' : 'Relatório criado com sucesso!' };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteReport(scheduleId: string) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    const { error } = await supabase
      .from('ReportSchedule')
      .delete()
      .eq('id', scheduleId)
      .eq('ownerId', user.id);

    if (error) throw error;

    revalidatePath('/reports');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
