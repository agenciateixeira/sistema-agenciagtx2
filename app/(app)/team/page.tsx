import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SectionTitle } from '@/components/dashboard/section-title';
import { TeamMembersList } from '@/components/team/team-members-list';
import { InviteMemberForm } from '@/components/team/invite-member-form';
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
      {/* Formulário de convite */}
      <InviteMemberForm />

      {/* Lista de membros */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Membros da Equipe"
          description={`${profiles?.length || 0} ${profiles?.length === 1 ? 'membro' : 'membros'} no total`}
        />

        <TeamMembersList members={profiles || []} currentUserId={user.id} />
      </div>

      {/* Guia de Permissões */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Níveis de Acesso"
          description="Entenda as permissões de cada nível"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-red-900">Administrador</h3>
            </div>
            <ul className="space-y-2 text-sm text-red-800">
              <li>• Acesso total ao sistema</li>
              <li>• Gerenciar membros e permissões</li>
              <li>• Configurar integrações</li>
              <li>• Deletar dados</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-blue-900">Editor</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Criar e editar conteúdo</li>
              <li>• Gerenciar relatórios</li>
              <li>• Configurar notificações</li>
              <li>• Visualizar todos os dados</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Visualizador</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Apenas visualização</li>
              <li>• Não pode editar</li>
              <li>• Não pode deletar</li>
              <li>• Acesso limitado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Avisos de segurança */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">Notas Importantes</h3>
            <div className="mt-2 text-sm text-amber-700 space-y-1">
              <p>• Você não pode remover a si mesmo do sistema</p>
              <p>• Deve haver pelo menos 1 administrador ativo</p>
              <p>• Convites por email serão implementados em produção</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
