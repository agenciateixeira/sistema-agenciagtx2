'use client';

import { useState } from 'react';
import { deleteNotification, markAsRead } from '../../app/actions/notifications';
import { AlertTriangle, Info, CheckCircle, Bell, Trash2, Check } from 'lucide-react';

interface NotificationsListProps {
  notifications: any[];
}

const severityConfig: Record<string, { icon: any; color: string; bg: string }> = {
  HIGH: { icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  MEDIUM: { icon: Info, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  LOW: { icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
};

const channelLabels: Record<string, string> = {
  IN_APP: 'In-app',
  EMAIL: 'E-mail',
  WEBHOOK: 'Webhook',
};

export function NotificationsList({ notifications }: NotificationsListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) {
      return;
    }

    setDeleting(id);
    await deleteNotification(id);
    setDeleting(null);
  }

  async function handleMarkAsRead(id: string) {
    await markAsRead(id);
  }

  if (notifications.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Bell className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Nenhuma notificação
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Crie sua primeira notificação acima
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {notifications.map((notification) => {
        const severity = notification.severity || 'LOW';
        const config = severityConfig[severity] || severityConfig.LOW;
        const Icon = config.icon;
        const isRead = !!notification.readAt;

        return (
          <div
            key={notification.id}
            className={`rounded-lg border p-4 ${config.bg} ${isRead ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 ${config.color} flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase ${config.color}`}>
                    {notification.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="rounded-lg p-1.5 text-green-600 hover:bg-green-100"
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      disabled={deleting === notification.id}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-900">{notification.message}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                  <span>Canal: {channelLabels[notification.channel] || notification.channel}</span>
                  <span>Severidade: {severity}</span>
                  <span>{new Date(notification.createdAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
