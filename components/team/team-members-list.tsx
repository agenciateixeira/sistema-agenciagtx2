'use client';

import { User as UserIcon, Users } from 'lucide-react';
import Image from 'next/image';

interface TeamMembersListProps {
  members: any[];
  currentUserId: string;
}

export function TeamMembersList({ members, currentUserId }: TeamMembersListProps) {
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
          Os membros da equipe aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.id === currentUserId;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
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
              <div>
                <p className="font-semibold text-gray-900">
                  {member.nome || 'Usuário'}
                  {isCurrentUser && (
                    <span className="ml-2 rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      Você
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Membro desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                Administrador
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
