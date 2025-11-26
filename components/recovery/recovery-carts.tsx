'use client';

import { ShoppingCart, Mail, ExternalLink, Package } from 'lucide-react';

interface AbandonedCart {
  id: string;
  platform_cart_id: string;
  customer_email: string;
  customer_name: string | null;
  total_value: number;
  currency: string;
  cart_items: any[];
  checkout_url: string | null;
  status: string;
  abandoned_at: string;
  recovery_emails_sent: number;
  last_recovery_email_at: string | null;
}

interface RecoveryCartsProps {
  carts: AbandonedCart[];
}

export function RecoveryCarts({ carts }: RecoveryCartsProps) {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abandoned':
        return 'bg-yellow-100 text-yellow-800';
      case 'recovered':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'abandoned':
        return 'Abandonado';
      case 'recovered':
        return 'Recuperado';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  if (carts.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Nenhum carrinho abandonado
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Os carrinhos abandonados aparecerão aqui quando os clientes não finalizarem suas compras.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Carrinhos Abandonados
          </h3>
          <p className="text-sm text-gray-600">
            {carts.length} {carts.length === 1 ? 'carrinho encontrado' : 'carrinhos encontrados'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {carts.map((cart) => {
          const isPlaceholder = cart.customer_email.includes('sem-email@placeholder.com');

          return (
            <div
              key={cart.id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info Principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-gray-400" />
                      <h4 className="font-semibold text-gray-900">
                        {cart.customer_name || 'Cliente'}
                      </h4>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cart.status)}`}>
                      {getStatusLabel(cart.status)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className={isPlaceholder ? 'italic text-gray-400' : ''}>
                        {isPlaceholder ? 'Email não disponível' : cart.customer_email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>
                        {cart.cart_items?.length || 0} {cart.cart_items?.length === 1 ? 'produto' : 'produtos'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Abandonado em {formatDate(cart.abandoned_at)}
                    </div>

                    {cart.recovery_emails_sent > 0 && (
                      <div className="text-xs text-blue-600">
                        {cart.recovery_emails_sent} email{cart.recovery_emails_sent > 1 ? 's' : ''} de recuperação enviado{cart.recovery_emails_sent > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Produtos */}
                  {cart.cart_items && cart.cart_items.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {cart.cart_items.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-500">
                          • {item.title} (x{item.quantity}) - {formatCurrency(parseFloat(item.price || 0), cart.currency)}
                        </div>
                      ))}
                      {cart.cart_items.length > 2 && (
                        <div className="text-xs text-gray-400">
                          + {cart.cart_items.length - 2} produtos
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Valor e Ações */}
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(cart.total_value, cart.currency)}
                    </div>
                  </div>

                  {cart.checkout_url && (
                    <a
                      href={cart.checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver checkout
                    </a>
                  )}

                  {!isPlaceholder && cart.status === 'abandoned' && (
                    <button
                      className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                      title="Enviar email de recuperação"
                    >
                      <Mail className="h-3 w-3" />
                      Recuperar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
