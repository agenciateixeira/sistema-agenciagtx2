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

export async function createNotification(formData: FormData) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  const title = formData.get('title') as string;
  const message = formData.get('message') as string;
  const severity = formData.get('severity') as string;
  const channel = formData.get('channel') as string;

  try {
    const { error } = await supabase
      .from('Notification')
      .insert({
        teamId: user.id,
        userId: user.id,
        title,
        message,
        severity: severity.toUpperCase(),
        channel: channel.toUpperCase(),
      });

    if (error) throw error;

    revalidatePath('/notifications');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markAsRead(notificationId: string) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    const { error } = await supabase
      .from('Notification')
      .update({ readAt: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('userId', user.id);

    if (error) throw error;

    revalidatePath('/notifications');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteNotification(notificationId: string) {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Não autenticado' };
  }

  try {
    const { error } = await supabase
      .from('Notification')
      .delete()
      .eq('id', notificationId)
      .eq('userId', user.id);

    if (error) throw error;

    revalidatePath('/notifications');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
