'use client';

import { useState } from 'react';
import { Mail, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cancelInvite } from '../../app/actions/team';

interface PendingInvite {
  id: string;
  email: string;
  name: string;
  role: string;
  invitedAt: string;
  expiresAt: string;
  metadata?: any;
}

interface PendingInvitesListProps {
  invites: PendingInvite[];
}

export function PendingInvitesList({ invites }: PendingInvitesListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja cancelar o convite para ${email}?`)) {
      return;
    }

    setLoadingId(inviteId);
    setError(null);
    setSuccess(null);

    const result = await cancelInvite(inviteId);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || 'Convite cancelado com sucesso!');
    }

    setLoadingId(null);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      EDITOR: 'Editor',
      VIEWER: 'Visualizador',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700',
      EDITOR: 'bg-blue-100 text-blue-700',
      VIEWER: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Expirado';
    if (days === 0) return 'Expira hoje';
    if (days === 1) return 'Expira amanhã';
    return `Expira em ${days} dias`;
  };

  if (invites.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-sm font-medium text-gray-900">Nenhum convite pendente</h3>
        <p className="mt-1 text-sm text-gray-500">
          Os convites que você enviar aparecerão aqui até serem aceitos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="space-y-3">
        {invites.map((invite) => {
          const isExpiringSoon = new Date(invite.expiresAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;

          return (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                  <Mail className="h-5 w-5 text-brand-600" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{invite.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(invite.role)}`}>
                      {getRoleLabel(invite.role)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">{invite.email}</p>

                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(invite.expiresAt)}
                    </span>
                    {isExpiringSoon && (
                      <span className="text-amber-600">⚠️ Expirando em breve</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCancelInvite(invite.id, invite.email)}
                disabled={loadingId === invite.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {loadingId === invite.id ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
