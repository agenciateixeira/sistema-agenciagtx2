import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface MetaCAPIStatusProps {
  metaConnection: any;
}

export function MetaCAPIStatus({ metaConnection }: MetaCAPIStatusProps) {
  // Sem conexão Meta
  if (!metaConnection) {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Meta Ads não conectado</h3>
            <p className="mt-1 text-sm text-red-700">
              Você precisa conectar sua conta do Meta Ads antes de usar o CAPI.
            </p>
            <Link
              href="/integrations"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Conectar Meta Ads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Token expirado
  const tokenExpired = new Date(metaConnection.token_expires_at) < new Date();
  if (tokenExpired || metaConnection.status !== 'connected') {
    return (
      <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">Token do Meta Ads expirado</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Seu token de acesso expirou. Reconecte para continuar usando o CAPI.
            </p>
            <Link
              href="/integrations"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
            >
              Reconectar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sem Pixel configurado
  if (!metaConnection.primary_pixel_id) {
    return (
      <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">Pixel não configurado</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Nenhum Pixel do Meta foi encontrado na sua conta. O CAPI precisa de um Pixel ID para enviar eventos.
            </p>
            <div className="mt-3 rounded-lg bg-yellow-100 p-3">
              <p className="text-xs text-yellow-900">
                <strong>Como resolver:</strong> Crie um Pixel no Gerenciador de Eventos do Meta e reconecte sua conta.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tudo OK!
  return (
    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
      <div className="flex items-start gap-4">
        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900">CAPI Configurado ✓</h3>
          <p className="mt-1 text-sm text-green-700">
            Seu sistema está pronto para enviar eventos de conversão para o Meta.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-green-100 p-3">
              <p className="text-xs font-semibold text-green-900">Conta Meta:</p>
              <p className="mt-1 text-sm text-green-800">{metaConnection.meta_user_name}</p>
            </div>

            <div className="rounded-lg bg-green-100 p-3">
              <p className="text-xs font-semibold text-green-900">Pixel ID:</p>
              <p className="mt-1 font-mono text-sm text-green-800">{metaConnection.primary_pixel_id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
