import { SectionTitle } from '@/components/dashboard/section-title';
import { teamMembers, onboardingChecklist } from '@/data/dashboard';
import { Plus, CheckCircle, Circle, User } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Equipe"
          description="Gerencie membros e permissões"
          action={
            <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              Adicionar membro
            </button>
          }
        />

        <div className="mt-6 space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Último acesso</p>
                <p className="text-sm font-medium text-gray-900">{member.lastActive}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Configuração do Workspace"
          description="Status das integrações e configurações"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {onboardingChecklist.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircle className="h-5 w-5 text-brand-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <span className={step.done ? 'text-gray-900' : 'text-gray-600'}>{step.label}</span>
              </div>
              <span
                className={`text-xs font-medium ${step.done ? 'text-brand-600' : 'text-gray-400'}`}
              >
                {step.done ? 'Concluído' : 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
