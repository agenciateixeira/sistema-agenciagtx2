import { SectionTitle } from '@/components/dashboard/section-title';
import { webhooks } from '@/data/dashboard';
import { Plus, Link as LinkIcon, Activity } from 'lucide-react';

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Webhooks"
          description="Integrações com sistemas externos"
          action={
            <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              Novo webhook
            </button>
          }
        />

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
                  <p className="mt-2 text-sm text-gray-600">Evento: {hook.event}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand-600" />
                  <span className="text-sm font-medium text-brand-700">{hook.status}</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-mono text-gray-600">
                  POST https://api.gtx.app/webhooks/{hook.id}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {hook.events.slice(0, 2).map((event) => (
                    <span
                      key={event}
                      className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700"
                    >
                      {event}
                    </span>
                  ))}
                  {hook.events.length > 2 && (
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      +{hook.events.length - 2} eventos
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Última entrega: {hook.lastDelivery}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
