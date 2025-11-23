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

export async function createWebhook(formData: FormData) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  const name = formData.get('name') as string;
  const url = formData.get('url') as string;
  const events = (formData.get('events') as string).split(',').map(e => e.trim());
  const secret = formData.get('secret') as string || null;

  try {
    const { error } = await supabase
      .from('WebhookEndpoint')
      .insert({
        teamId: user.id,
        name,
        url,
        events,
        secret,
        active: true,
      });

    if (error) throw error;

    revalidatePath('/webhooks');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleWebhook(webhookId: string, active: boolean) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    const { error } = await supabase
      .from('WebhookEndpoint')
      .update({ active })
      .eq('id', webhookId)
      .eq('teamId', user.id);

    if (error) throw error;

    revalidatePath('/webhooks');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteWebhook(webhookId: string) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    const { error } = await supabase
      .from('WebhookEndpoint')
      .delete()
      .eq('id', webhookId)
      .eq('teamId', user.id);

    if (error) throw error;

    revalidatePath('/webhooks');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
