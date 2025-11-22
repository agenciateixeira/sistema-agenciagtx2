import Image from 'next/image';
import { currentUserProfile, securityDevices } from '@/data/dashboard';
import { SectionTitle } from '@/components/dashboard/section-title';
import { Lock, Save, Upload } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle title="Informações Pessoais" description="Atualize seus dados de perfil" />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-300">
              <Image
                src={currentUserProfile.avatar}
                alt={currentUserProfile.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{currentUserProfile.name}</p>
              <p className="text-sm text-gray-600">{currentUserProfile.role}</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              Alterar foto
            </button>
          </div>

          <form className="flex-1 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                <input
                  defaultValue={currentUserProfile.name}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail corporativo</label>
                <input
                  type="email"
                  defaultValue={currentUserProfile.email}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  defaultValue={currentUserProfile.phone}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fuso horário</label>
                <input
                  defaultValue={currentUserProfile.timezone}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Idioma</label>
              <input
                defaultValue={currentUserProfile.language}
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              <Save className="h-4 w-4" />
              Salvar alterações
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle title="Segurança e Sessões" description="Dispositivos com acesso ativo" />

        <div className="mt-6 space-y-3">
          {securityDevices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">{device.device}</p>
                <p className="text-sm text-gray-600">{device.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Último acesso: {device.lastSeen}</p>
                <button className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  {device.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle title="Alterar Senha" description="Atualizar senha de acesso" />

        <form className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha atual</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nova senha</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar senha</label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Lock className="h-4 w-4" />
            Atualizar senha
          </button>
        </form>
      </div>
    </div>
  );
}
