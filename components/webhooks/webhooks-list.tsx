'use client';

import { useState } from 'react';
import { deleteWebhook, toggleWebhook } from '../../app/actions/webhooks';
import { Link as LinkIcon, Activity, Trash2, Power, Webhook } from 'lucide-react';

interface WebhooksListProps {
  webhooks: any[];
}

export function WebhooksList({ webhooks }: WebhooksListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este webhook?')) {
      return;
    }

    setDeleting(id);
    await deleteWebhook(id);
    setDeleting(null);
  }

  async function handleToggle(id: string, currentActive: boolean) {
    setToggling(id);
    await toggleWebhook(id, !currentActive);
    setToggling(null);
  }

  if (webhooks.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Webhook className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Nenhum webhook configurado
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Crie seu primeiro webhook acima
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {webhooks.map((hook) => (
        <div
          key={hook.id}
          className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-brand-600" />
                <h3 className="font-semibold text-gray-900">{hook.name}</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600">URL: {hook.url}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(hook.id, hook.active)}
                disabled={toggling === hook.id}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  hook.active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                <Power className="h-4 w-4" />
                {hook.active ? 'Ativo' : 'Inativo'}
              </button>
              <button
                onClick={() => handleDelete(hook.id)}
                disabled={deleting === hook.id}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {hook.events?.slice(0, 3).map((event: string) => (
              <span
                key={event}
                className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {event}
              </span>
            ))}
            {hook.events?.length > 3 && (
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                +{hook.events.length - 3} eventos
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
