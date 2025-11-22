'use client';

import { createClient } from '@supabase/supabase-js';

let client = typeof window === 'undefined' ? null : globalThis.__supabase__;

export function getSupabaseBrowserClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
    }

    client = createClient(url, anonKey);
    if (typeof window !== 'undefined') {
      globalThis.__supabase__ = client;
    }
  }

  return client;
}

declare global {
  // eslint-disable-next-line no-var
  var __supabase__: ReturnType<typeof createClient> | null | undefined;
}
