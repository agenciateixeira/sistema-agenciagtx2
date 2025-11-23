'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { SectionTitle } from '@/components/dashboard/section-title';
import { Lock, Save, Upload, User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface ProfileFormProps {
  user: User;
  profile: any;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(profile?.nome || '');

  async function handleUpdateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase
        .from('profiles')
        .update({ nome: name, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setStatus('success');
      setMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      setStatus('error');
      setMessage('Erro ao atualizar perfil.');
    }
  }

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setStatus('success');
      setMessage('Senha atualizada com sucesso!');
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      setStatus('error');
      setMessage('Erro ao atualizar senha.');
    }
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle title="Informações Pessoais" description="Atualize seus dados de perfil" />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-300 bg-brand-100">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.nome || 'Usuário'}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="h-12 w-12 text-brand-600" />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{profile?.nome || 'Usuário'}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              Alterar foto
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {message && status === 'success' && (
              <div className="rounded-lg p-3 text-sm bg-green-50 text-green-800">
                {message}
              </div>
            )}

            {message && status === 'error' && (
              <div className="rounded-lg p-3 text-sm bg-red-50 text-red-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Salvar alterações
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle title="Alterar Senha" description="Atualizar senha de acesso" />

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nova senha</label>
              <input
                name="newPassword"
                type="password"
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar senha</label>
              <input
                name="confirmPassword"
                type="password"
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            Atualizar senha
          </button>
        </form>
      </div>
    </>
  );
}
