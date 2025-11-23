import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SectionTitle } from '@/components/dashboard/section-title';
import { Download, Database } from 'lucide-react';

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

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {profile?.nome || 'Usuário'}!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Seu painel está pronto para uso
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Database className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Sistema Conectado ao Supabase
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Todos os dados fakes foram removidos. O sistema agora está conectado ao banco de dados.
        </p>
        <p className="mt-4 text-xs text-gray-500">
          Comece a usar o sistema para ver seus dados aparecerem aqui.
        </p>
      </div>
    </div>
  );
}
