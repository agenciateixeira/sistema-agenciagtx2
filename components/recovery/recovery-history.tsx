'use client';

import { CheckCircle, Clock, Mail, MousePointer, Eye, ShoppingCart, XCircle } from 'lucide-react';

interface EmailAction {
  id: string;
  recipient: string;
  email_subject: string;
  status: string;
  sent_at: string;
  opened: boolean;
  opened_at: string | null;
  clicked: boolean;
  clicked_at: string | null;
  converted: boolean;
  converted_at: string | null;
  conversion_value: number | null;
}

interface RecoveryHistoryProps {
  actions: EmailAction[];
}

export function RecoveryHistory({ actions }: RecoveryHistoryProps) {
  if (actions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Nenhum email enviado ainda
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Os emails de recuperação aparecerão aqui após serem enviados.
        </p>
      </div>
    );
  }

  const getStatusBadge = (action: EmailAction) => {
    if (action.converted) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          <ShoppingCart className="h-3.5 w-3.5" />
          Convertido
        </span>
      );
    }
    if (action.clicked) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          <MousePointer className="h-3.5 w-3.5" />
          Clicou
        </span>
      );
    }
    if (action.opened) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
          <Eye className="h-3.5 w-3.5" />
          Abriu
        </span>
      );
    }
    if (action.status === 'sent') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
          <Clock className="h-3.5 w-3.5" />
          Enviado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
        <XCircle className="h-3.5 w-3.5" />
        Falhou
      </span>
    );
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '-';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins}min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatFullTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '-';

    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Enviado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Métricas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {actions.map((action) => (
                <tr key={action.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {action.recipient}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {action.email_subject}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(action)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {formatTimestamp(action.sent_at)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFullTimestamp(action.sent_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {action.opened ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Abriu {formatTimestamp(action.opened_at)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <XCircle className="h-3.5 w-3.5" />
                            Não abriu
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {action.clicked ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Clicou {formatTimestamp(action.clicked_at)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <XCircle className="h-3.5 w-3.5" />
                            Não clicou
                          </span>
                        )}
                      </div>
                      {action.converted && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Comprou {formatTimestamp(action.converted_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {action.conversion_value ? (
                      <span className="font-semibold text-green-600">
                        R$ {action.conversion_value.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Como funciona o rastreamento?</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• <strong>Abriu:</strong> Registrado quando o cliente abre o email (pixel invisível)</li>
              <li>• <strong>Clicou:</strong> Registrado quando clica no botão "Finalizar Compra"</li>
              <li>• <strong>Comprou:</strong> Registrado quando o pedido é criado no Shopify</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
