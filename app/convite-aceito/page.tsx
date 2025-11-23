'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/logo';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Loader2, Copy, CheckCircle2 } from 'lucide-react';

export default function ConviteAceitoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const email = searchParams.get('email');
  const password = searchParams.get('password');

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAutoLogin = async () => {
    if (!email || !password) {
      setStatus('error');
      setMessage('Credenciais não fornecidas');
      return;
    }

    setStatus('loading');
    setMessage('Fazendo login automaticamente...');

    try {
      const supabase = getSupabaseBrowserClient();

      // Aguardar 2 segundos antes de tentar login
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setStatus('error');
        setMessage(`Erro ao fazer login: ${error.message}`);
        console.error('Erro no login automático:', error);
        return;
      }

      if (!data.session) {
        setStatus('error');
        setMessage('Erro ao criar sessão. Tente novamente.');
        return;
      }

      setStatus('success');
      setMessage('Login realizado com sucesso! Redirecionando...');

      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.href = '/dashboard';
    } catch (error: any) {
      setStatus('error');
      setMessage(`Erro: ${error.message}`);
    }
  };

  if (!email || !password) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <Logo className="mx-auto mb-8 text-gray-900" />
          <div className="rounded-xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-2xl font-bold text-red-900 mb-4">❌ Erro</h1>
            <p className="text-red-700">Credenciais não fornecidas. Por favor, clique no link do convite novamente.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Logo className="mx-auto text-gray-900 mb-6" />
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold">Conta Criada com Sucesso!</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">🎉 Bem-vindo ao Sistema GTX!</h1>
            <p className="text-green-100">Sua conta foi criada. Use as credenciais abaixo para acessar.</p>
          </div>

          {/* Credenciais */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  📧 Seu Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    readOnly
                    className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-base font-mono text-gray-900 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(email, 'email')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gray-200 p-2 hover:bg-gray-300 transition"
                    title="Copiar email"
                  >
                    {copied === 'email' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  🔑 Sua Senha Temporária
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={password}
                    readOnly
                    className="w-full rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3 pr-12 text-2xl font-mono font-bold text-green-700 focus:outline-none text-center tracking-widest"
                  />
                  <button
                    onClick={() => copyToClipboard(password, 'password')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-green-200 p-2 hover:bg-green-300 transition"
                    title="Copiar senha"
                  >
                    {copied === 'password' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Alerta de segurança */}
            <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>
                  <strong>Importante:</strong> Por segurança, altere sua senha no primeiro acesso.
                  <br />
                  Vá em <strong>Perfil → Alterar Senha</strong> após fazer login.
                </span>
              </p>
            </div>

            {/* Mensagem de status */}
            {message && (
              <div className={`mt-6 rounded-lg p-4 text-sm ${
                status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {message}
              </div>
            )}

            {/* Botões */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleAutoLogin}
                disabled={status === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                {status === 'loading' ? 'Entrando...' : '🚀 Fazer Login Agora'}
              </button>

              <button
                onClick={() => router.push('/login')}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Fazer Login Manualmente
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 Agência GTX. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
