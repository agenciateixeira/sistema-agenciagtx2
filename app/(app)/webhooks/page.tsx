import { SectionTitle } from '@/components/dashboard/section-title';
import { Plus, Webhook } from 'lucide-react';

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

        <div className="mt-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Webhook className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Nenhum webhook configurado
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Configure webhooks para integrar com sistemas externos
          </p>
        </div>
      </div>
    </div>
  );
}
