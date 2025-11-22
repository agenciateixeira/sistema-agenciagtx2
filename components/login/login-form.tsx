'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabaseBrowserClient> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setSupabase(getSupabaseBrowserClient());
    } catch (error) {
      console.error(error);
      setMessage('Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar o login.');
      setStatus('error');
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setStatus('error');
      setMessage('Supabase não configurado. Verifique as variáveis de ambiente.');
      return;
    }
    setStatus('loading');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Não foi possível entrar.');
      return;
    }

    setStatus('success');
    setMessage('Login realizado com sucesso, redirecionando...');
    setTimeout(() => router.push('/dashboard'), 500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          placeholder="seu@email.com"
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <a href="#" className="text-sm text-brand-600 hover:text-brand-700">
            Esqueceu?
          </a>
        </div>
        <input
          id="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          placeholder="••••••••"
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {message && (
        <div className={`rounded-lg p-3 text-sm ${status === 'error' ? 'bg-red-50 text-red-800' : 'bg-brand-50 text-brand-800'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !supabase}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
        Entrar na plataforma
      </button>
    </form>
  );
}
