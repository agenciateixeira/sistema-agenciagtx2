'use client';

import { useState } from 'react';
import { login } from '../../app/actions/auth';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(event.currentTarget);

    try {
      const result = await login(formData);

      if (result?.error) {
        setStatus('error');
        setMessage(result.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro ao fazer login. Tente novamente.');
    }
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
          type="password"
          required
          placeholder="••••••••"
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {message && (
        <div className="rounded-lg p-3 text-sm bg-red-50 text-red-800">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
        Entrar na plataforma
      </button>
    </form>
  );
}
