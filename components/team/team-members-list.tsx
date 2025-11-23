'use client';

import { useState } from 'react';
import { removeTeamMember, updateMemberRole } from '../../app/actions/team';
import { User as UserIcon, Users, Trash2, Edit2, Shield, Eye, UserCog } from 'lucide-react';
import Image from 'next/image';

interface TeamMembersListProps {
  members: any[];
  currentUserId: string;
}

export function TeamMembersList({ members, currentUserId }: TeamMembersListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('ADMIN');

  async function handleDelete(memberId: string) {
    if (!confirm('Tem certeza que deseja remover este membro? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeleting(memberId);
    const result = await removeTeamMember(memberId);

    if (result.error) {
      alert(result.error);
    }

    setDeleting(null);
  }

  async function handleUpdateRole(memberId: string) {
    const result = await updateMemberRole(memberId, selectedRole);

    if (result.error) {
      alert(result.error);
    } else {
      alert(result.message);
      setEditing(null);
    }
  }

  if (members.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Nenhum membro encontrado
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Convide membros para sua equipe
        </p>
      </div>
    );
  }

  const roleIcons: Record<string, any> = {
    ADMIN: Shield,
    EDITOR: Edit2,
    VIEWER: Eye,
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    EDITOR: 'bg-blue-100 text-blue-700',
    VIEWER: 'bg-gray-100 text-gray-700',
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    EDITOR: 'Editor',
    VIEWER: 'Visualizador',
  };

  return (
    <div className="mt-6 space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.id === currentUserId;
        const role = member.role || 'VIEWER'; // Role do banco ou VIEWER por padrão
        const RoleIcon = roleIcons[role] || UserCog;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt={member.nome || 'Usuário'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {member.nome || 'Usuário'}
                  </p>
                  {isCurrentUser && (
                    <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      Você
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Membro desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {editing === member.id ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="VIEWER">Visualizador</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  <button
                    onClick={() => handleUpdateRole(member.id)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${roleColors[role]}`}>
                    <RoleIcon className="h-3.5 w-3.5" />
                    {roleLabels[role]}
                  </div>

                  {!isCurrentUser && (
                    <>
                      <button
                        onClick={() => setEditing(member.id)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                        title="Editar permissões"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={deleting === member.id}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Remover membro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
