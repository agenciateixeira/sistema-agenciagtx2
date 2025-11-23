'use client';

import { useState } from 'react';
import { Logo } from '@/components/logo';

export default function DebugPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (test: string) => {
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(`/api/${test}?email=debug@test.com&t=${Date.now()}`);
      const data = await res.json();
      setResults({ test, data });
    } catch (error: any) {
      setResults({ test, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 text-gray-900" />
          <h1 className="text-3xl font-bold text-gray-900">🔍 Página de DEBUG</h1>
          <p className="mt-2 text-gray-600">Diagnóstico completo do sistema</p>
        </div>

        {/* Variáveis de Ambiente */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Variáveis de Ambiente</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className="text-gray-900 font-semibold">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ FALTANDO'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className="text-gray-900 font-semibold">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ FALTANDO'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${process.env.NEXT_PUBLIC_SITE_URL ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-700">NEXT_PUBLIC_SITE_URL:</span>
              <span className="text-gray-900 font-semibold">
                {process.env.NEXT_PUBLIC_SITE_URL || '❌ FALTANDO'}
              </span>
            </div>
          </div>

          {!process.env.NEXT_PUBLIC_SITE_URL && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>NEXT_PUBLIC_SITE_URL não configurado!</strong>
                <br />
                Configure no Vercel: Settings → Environment Variables
                <br />
                Key: <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_SITE_URL</code>
                <br />
                Value: <code className="bg-yellow-100 px-1 rounded">https://app.agenciagtx.com.br</code>
              </p>
            </div>
          )}
        </div>

        {/* Testes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Testes Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => runTest('test-supabase')}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              🔐 Testar Criação de Usuário
            </button>
            <button
              onClick={() => runTest('test-login')}
              disabled={loading}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              🔓 Testar Login Completo
            </button>
            <button
              onClick={() => runTest('test-email')}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              📧 Testar Envio de Email
            </button>
          </div>

          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">⏳ Executando teste...</p>
            </div>
          )}
        </div>

        {/* Resultados */}
        {results && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {results.data?.success ? '✅' : '❌'} Resultado do Teste: {results.test}
            </h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(results.data || results.error, null, 2)}
            </pre>

            {results.data?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✅ Teste passou! O sistema está funcionando.
                </p>
              </div>
            )}

            {!results.data?.success && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">
                  ❌ Teste falhou! Veja os detalhes acima.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instruções */}
        <div className="mt-6 bg-gray-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">📖 Como usar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Verifique se todas as variáveis de ambiente estão configuradas</li>
            <li>Clique em cada botão de teste para verificar o que funciona</li>
            <li>Se algum teste falhar, veja o JSON com os detalhes do erro</li>
            <li>Copie o resultado e envie para o desenvolvedor</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
