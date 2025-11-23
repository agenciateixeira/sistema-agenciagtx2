'use client';

import { useState } from 'react';
import { createWebhook } from '../../app/actions/webhooks';
import { Plus, Loader2 } from 'lucide-react';

export function CreateWebhookForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const result = await createWebhook(formData);

    if (result.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage('Webhook criado com sucesso!');
      (event.target as HTMLFormElement).reset();
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setMessage('');
      }, 2000);
    }
  }

  if (!isOpen) {
    return (
      <div className="mt-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Novo webhook
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            name="name"
            required
            placeholder="Ex: CRM HubSpot"
            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL</label>
          <input
            name="url"
            type="url"
            required
            placeholder="https://api.exemplo.com/webhook"
            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Eventos (separados por vírgula)</label>
        <input
          name="events"
          required
          placeholder="conversion.created, session.completed, alert.triggered"
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Secret (opcional)</label>
        <input
          name="secret"
          type="password"
          placeholder="Chave secreta para assinatura"
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {message && (
        <div className={`rounded-lg p-3 text-sm ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar webhook
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
