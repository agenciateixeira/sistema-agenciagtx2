import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SectionTitle } from '@/components/dashboard/section-title';
import { TeamMembersList } from '@/components/team/team-members-list';
import { User as UserIcon } from 'lucide-react';

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

export default async function TeamPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar todos os perfis (como uma forma simples de "equipe")
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Equipe"
          description="Membros com acesso ao sistema"
        />

        <TeamMembersList members={profiles || []} currentUserId={user.id} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Permissões"
          description="Configure níveis de acesso"
        />

        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Administrador</p>
                <p className="text-sm text-gray-600">Acesso total ao sistema</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Editor</p>
                <p className="text-sm text-gray-600">Pode criar e editar conteúdo</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Visualizador</p>
                <p className="text-sm text-gray-600">Apenas visualização</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
