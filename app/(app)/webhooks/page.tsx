import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SectionTitle } from '@/components/dashboard/section-title';
import { WebhooksList } from '@/components/webhooks/webhooks-list';
import { CreateWebhookForm } from '@/components/webhooks/create-webhook-form';

async function getSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function WebhooksPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar webhooks
  const { data: webhooks } = await supabase
    .from('WebhookEndpoint')
    .select('*')
    .eq('teamId', user.id)
    .order('createdAt', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Webhooks"
          description="Integrações com sistemas externos"
        />

        <CreateWebhookForm />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Webhooks Configurados"
          description="Suas integrações ativas"
        />

        <WebhooksList webhooks={webhooks || []} />
      </div>
    </div>
  );
}
