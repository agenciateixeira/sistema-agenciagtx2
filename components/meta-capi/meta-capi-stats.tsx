'use client';

import { useState } from 'react';
import { Send, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface MetaCAPIStatsProps {
  totalRecovered: number;
  purchaseEventsSent: number;
  pendingEvents: number;
  userId: string;
}

export function MetaCAPIStats({
  totalRecovered,
  purchaseEventsSent,
  pendingEvents: initialPending,
  userId,
}: MetaCAPIStatsProps) {
  const [processing, setProcessing] = useState(false);
  const [pendingEvents, setPendingEvents] = useState(initialPending);
  const [lastProcessResult, setLastProcessResult] = useState<any>(null);

  const handleProcessPending = async () => {
    setProcessing(true);
    setLastProcessResult(null);

    try {
      const response = await fetch('/api/meta/capi/process-pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process pending events');
      }

      const result = await response.json();
      setLastProcessResult(result);
      setPendingEvents(pendingEvents - result.successful);
    } catch (error: any) {
      setLastProcessResult({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const deliveryRate = totalRecovered > 0
    ? ((purchaseEventsSent / totalRecovered) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total de Carrinhos Recuperados */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Carrinhos Recuperados</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalRecovered}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Eventos Enviados */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Eventos Enviados</p>
              <p className="mt-2 text-3xl font-bold text-green-700">{purchaseEventsSent}</p>
              <p className="mt-1 text-xs text-green-700">Taxa: {deliveryRate}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Send className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Eventos Pendentes */}
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-900">Pendentes</p>
              <p className="mt-2 text-3xl font-bold text-orange-700">{pendingEvents}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Processar Eventos Pendentes */}
      {pendingEvents > 0 && (
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">
                {pendingEvents} {pendingEvents === 1 ? 'evento pendente' : 'eventos pendentes'}
              </h3>
              <p className="mt-1 text-sm text-orange-700">
                {pendingEvents === 1
                  ? 'Existe 1 carrinho recuperado que ainda não enviou evento para o Meta.'
                  : `Existem ${pendingEvents} carrinhos recuperados que ainda não enviaram eventos para o Meta.`}
              </p>
            </div>
            <button
              onClick={handleProcessPending}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Agora
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Resultado do Processamento */}
      {lastProcessResult && (
        <div
          className={`rounded-lg border-2 p-6 ${
            lastProcessResult.error
              ? 'border-red-200 bg-red-50'
              : 'border-green-200 bg-green-50'
          }`}
        >
          {lastProcessResult.error ? (
            <div>
              <h3 className="font-semibold text-red-900">Erro ao processar eventos</h3>
              <p className="mt-1 text-sm text-red-700">{lastProcessResult.error}</p>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-green-900">Eventos processados com sucesso!</h3>
              <div className="mt-3 grid gap-2 text-sm text-green-700">
                <p>✅ <strong>{lastProcessResult.successful}</strong> eventos enviados</p>
                {lastProcessResult.failed > 0 && (
                  <p>❌ <strong>{lastProcessResult.failed}</strong> falharam</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
