import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SectionTitle } from '@/components/dashboard/section-title';
import { ReportsList } from '@/components/reports/reports-list';
import { CreateReportForm } from '@/components/reports/create-report-form';
import { Plus } from 'lucide-react';

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

export default async function ReportsPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar relatórios agendados
  const { data: schedules } = await supabase
    .from('ReportSchedule')
    .select(`
      *,
      template:ReportTemplate(*)
    `)
    .eq('ownerId', user.id)
    .order('createdAt', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Relatórios Personalizados"
          description="Crie e agende relatórios customizados"
        />

        <CreateReportForm />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Relatórios Agendados"
          description="Seus relatórios automáticos"
        />

        <ReportsList schedules={schedules || []} />
      </div>
    </div>
  );
}
