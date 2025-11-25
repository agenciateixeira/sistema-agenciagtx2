import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReportsClient } from '@/components/reports/reports-client';

export const dynamic = 'force-dynamic';

async function getSupabaseServer() {
  const cookieStore = await cookies();

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

export default async function ReportsPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar conexão Meta
  const { data: metaConnection } = await supabase
    .from('meta_connections')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Buscar dados do profile (logo e nome da empresa)
  const { data: profile } = await supabase
    .from('profiles')
    .select('report_logo_url, report_company_name')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios para Clientes</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gere relatórios profissionais de Meta Ads para enviar aos seus clientes
        </p>
      </div>

      <ReportsClient
        userId={user.id}
        metaConnection={metaConnection ? { ...metaConnection, user_id: user.id } : null}
        reportLogoUrl={profile?.report_logo_url || null}
        reportCompanyName={profile?.report_company_name || null}
      />
    </div>
  );
}
