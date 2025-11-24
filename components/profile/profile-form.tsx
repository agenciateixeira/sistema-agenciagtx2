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
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  async function handleUpdateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase
        .from('profiles')
        .update({ nome: name })
        .eq('id', user.id);

      if (error) {
        console.error('Erro detalhado ao atualizar perfil:', error);
        throw error;
      }

      setStatus('success');
      setMessage('Perfil atualizado com sucesso!');

      // Recarregar a página após 1 segundo para refletir mudanças no topbar
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`Erro ao atualizar perfil: ${error.message || 'Erro desconhecido'}`);
      console.error('Erro completo:', error);
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStatus('error');
      setMessage('Formato inválido. Use: JPG, PNG, GIF ou WebP');
      return;
    }

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setStatus('error');
      setMessage('Arquivo muito grande. Máximo: 2MB');
      return;
    }

    setUploading(true);
    setStatus('idle');
    setMessage('');

    try {
      const supabase = getSupabaseBrowserClient();

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Fazer upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar perfil com nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      setStatus('success');
      setMessage('Foto atualizada com sucesso!');

      // Recarregar página após 1 segundo
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`);
      console.error('Erro completo:', error);
    } finally {
      setUploading(false);
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
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile?.nome || 'Usuário'}
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
            <input
              type="file"
              id="avatar-upload"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Enviando...' : 'Alterar foto'}
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
