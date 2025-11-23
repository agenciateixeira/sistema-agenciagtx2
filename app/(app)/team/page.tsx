import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SectionTitle } from '@/components/dashboard/section-title';
import { TeamMembersList } from '@/components/team/team-members-list';
import { InviteMemberForm } from '@/components/team/invite-member-form';
import { PendingInvitesList } from '@/components/team/pending-invites-list';
import { User as UserIcon, Mail, Users, Shield } from 'lucide-react';

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

  // Buscar perfil do usuário logado para verificar role
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = currentUserProfile?.role === 'ADMIN';

  // Buscar convites pendentes (apenas para admins)
  const { data: invites } = isAdmin
    ? await supabase
        .from('TeamInvite')
        .select('*')
        .eq('status', 'PENDING')
        .order('invitedAt', { ascending: false })
    : { data: null };

  // Buscar membros da equipe
  const { data: members } = await supabase
    .from('profiles')
    .select('id, nome, role, created_at, avatar_url')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Formulário de convite - APENAS PARA ADMINS */}
      {isAdmin ? (
        <InviteMemberForm />
      ) : (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">Você faz parte desta equipe</h3>
              <p className="mt-2 text-sm text-blue-700">
                Apenas administradores podem convidar novos membros.
                {currentUserProfile?.role === 'EDITOR' && ' Como Editor, você pode gerenciar conteúdo e relatórios.'}
                {currentUserProfile?.role === 'VIEWER' && ' Como Visualizador, você tem acesso de leitura aos dados.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Convites Pendentes */}
      {invites && invites.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Convites Pendentes</h2>
              <p className="text-sm text-gray-500">
                {invites.length} {invites.length === 1 ? 'convite aguardando' : 'convites aguardando'} aceitação
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Mail className="h-5 w-5 text-amber-600" />
            </div>
          </div>

          <PendingInvitesList invites={invites} />
        </div>
      )}

      {/* Lista de membros */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Membros da Equipe</h2>
            <p className="text-sm text-gray-500">
              {members?.length || 0} {members?.length === 1 ? 'membro ativo' : 'membros ativos'}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
            <Users className="h-5 w-5 text-brand-600" />
          </div>
        </div>

        <TeamMembersList members={members || []} currentUserId={user.id} />
      </div>

      {/* Guia de Permissões */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Níveis de Acesso</h2>
            <p className="text-sm text-gray-500">Entenda as permissões de cada nível</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-5 transition-all hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-red-900">Administrador</h3>
            </div>
            <ul className="space-y-2 text-sm text-red-800">
              <li>• Acesso total ao sistema</li>
              <li>• Gerenciar membros e permissões</li>
              <li>• Configurar integrações</li>
              <li>• Deletar dados e membros</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5 transition-all hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
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

          <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-5 transition-all hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Visualizador</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Apenas visualização</li>
              <li>• Não pode editar</li>
              <li>• Não pode deletar</li>
              <li>• Acesso limitado a leitura</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Avisos de segurança */}
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-brand-800">Regras de Segurança</h3>
            <div className="mt-2 space-y-1 text-sm text-brand-700">
              <p>• Você não pode remover ou alterar suas próprias permissões</p>
              <p>• Deve haver pelo menos 1 administrador ativo no sistema</p>
              <p>• Convites expiram automaticamente após 7 dias</p>
              <p>• Membros removidos perdem acesso imediatamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
