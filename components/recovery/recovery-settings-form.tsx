'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { SectionTitle } from '@/components/dashboard/section-title';
import { Save, Upload, Mail, MessageSquare, Globe, Power, Clock, Repeat, Hash } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface RecoverySettingsFormProps {
  user: User;
  profile: any;
}

export function RecoverySettingsForm({ user, profile }: RecoverySettingsFormProps) {
  const emailSettings = profile?.email_recovery_settings || {
    sender_email: '',
    sender_name: '',
    reply_to: '',
    logo_url: '',
    custom_message: '',
    enabled: true,
    delay_hours: 1,
    interval_hours: 24,
    max_emails: 3,
  };

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(emailSettings.enabled ?? true);
  const [delayHours, setDelayHours] = useState(emailSettings.delay_hours || 1);
  const [intervalHours, setIntervalHours] = useState(emailSettings.interval_hours || 24);
  const [maxEmails, setMaxEmails] = useState(emailSettings.max_emails || 3);
  const [senderEmail, setSenderEmail] = useState(emailSettings.sender_email || '');
  const [senderName, setSenderName] = useState(emailSettings.sender_name || '');
  const [replyTo, setReplyTo] = useState(emailSettings.reply_to || '');
  const [logoUrl, setLogoUrl] = useState(emailSettings.logo_url || '');
  const [customMessage, setCustomMessage] = useState(
    emailSettings.custom_message || 'Notamos que você deixou alguns produtos incríveis no seu carrinho. Não perca essa oportunidade!'
  );
  const [uploading, setUploading] = useState(false);

  async function handleUpdateSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const supabase = getSupabaseBrowserClient();

      const newSettings = {
        sender_email: senderEmail.trim() || null,
        sender_name: senderName.trim() || null,
        reply_to: replyTo.trim() || null,
        logo_url: logoUrl.trim() || null,
        custom_message: customMessage.trim() || null,
        enabled,
        delay_hours: delayHours,
        interval_hours: intervalHours,
        max_emails: maxEmails,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ email_recovery_settings: newSettings })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        throw error;
      }

      setStatus('success');
      setMessage('Configurações salvas com sucesso!');

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`);
      console.error('Erro completo:', error);
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setStatus('error');
      setMessage('Formato inválido. Use: JPG, PNG, GIF, WebP ou SVG');
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
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

      // Fazer upload para bucket de logos
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
      setStatus('success');
      setMessage('Logo enviada com sucesso! Clique em "Salvar Configurações" para aplicar.');
    } catch (error: any) {
      setStatus('error');
      setMessage(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`);
      console.error('Erro completo:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpdateSettings} className="space-y-6">
      {/* Status do Sistema */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Status da Recuperação"
          description="Ativar ou desativar o sistema de recuperação de carrinhos"
        />

        <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2.5 ${enabled ? 'bg-green-50' : 'bg-gray-200'}`}>
              <Power className={`h-5 w-5 ${enabled ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {enabled ? 'Sistema Ativo' : 'Sistema Desativado'}
              </p>
              <p className="text-sm text-gray-600">
                {enabled
                  ? 'Emails de recuperação serão enviados automaticamente'
                  : 'Nenhum email será enviado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              enabled ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configurações de Automação */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Configurações de Automação"
          description="Defina quando e quantos emails de recuperação serão enviados"
        />

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Delay Inicial
            </label>
            <select
              value={delayHours}
              onChange={(e) => setDelayHours(parseInt(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={1}>1 hora</option>
              <option value={2}>2 horas</option>
              <option value={6}>6 horas</option>
              <option value={12}>12 horas</option>
              <option value={24}>24 horas</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Tempo após abandono antes do 1º email
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Repeat className="h-4 w-4" />
              Intervalo Entre Emails
            </label>
            <select
              value={intervalHours}
              onChange={(e) => setIntervalHours(parseInt(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={12}>12 horas</option>
              <option value={24}>24 horas</option>
              <option value={48}>48 horas</option>
              <option value={72}>72 horas</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Tempo entre emails subsequentes
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Hash className="h-4 w-4" />
              Máximo de Emails
            </label>
            <select
              value={maxEmails}
              onChange={(e) => setMaxEmails(parseInt(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={1}>1 email</option>
              <option value={2}>2 emails</option>
              <option value={3}>3 emails</option>
              <option value={4}>4 emails</option>
              <option value={5}>5 emails</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Máximo por carrinho abandonado
            </p>
          </div>
        </div>

        {/* Preview da Timeline */}
        <div className="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-3">📅 Timeline de Envio</p>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span><strong>00h:</strong> Cliente abandona carrinho</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span><strong>{delayHours}h:</strong> 1º email enviado</span>
            </div>
            {maxEmails >= 2 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span><strong>{delayHours + intervalHours}h:</strong> 2º email enviado</span>
              </div>
            )}
            {maxEmails >= 3 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span><strong>{delayHours + (intervalHours * 2)}h:</strong> 3º email enviado</span>
              </div>
            )}
            {maxEmails >= 4 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span><strong>{delayHours + (intervalHours * 3)}h:</strong> 4º email enviado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configurações de Email */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Configurações de Email"
          description="Personalize o remetente dos emails de recuperação"
        />

        <div className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                Email do Remetente
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="vendas@sualore.com (opcional)"
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Deixe vazio para usar o email padrão do sistema
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                Nome do Remetente
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Sua Loja (opcional)"
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nome exibido como remetente do email
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" />
              Email de Resposta (Reply-To)
            </label>
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="atendimento@sualore.com (opcional)"
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email que receberá as respostas dos clientes
            </p>
          </div>
        </div>
      </div>

      {/* Personalização Visual */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Personalização Visual"
          description="Adicione sua marca aos emails de recuperação"
        />

        <div className="mt-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4" />
              Logo da Loja
            </label>
            <div className="mt-2 flex items-start gap-4">
              {logoUrl && (
                <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="relative h-16 w-40">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Enviando...' : logoUrl ? 'Alterar Logo' : 'Enviar Logo'}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Recomendado: 180x60px, PNG ou SVG com fundo transparente
                </p>
                {logoUrl && (
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="URL da logo"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4" />
              Mensagem Personalizada
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              placeholder="Notamos que você deixou alguns produtos incríveis no seu carrinho..."
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mensagem que aparecerá no email de recuperação
            </p>
          </div>
        </div>
      </div>

      {/* Mensagens de Status */}
      {message && status === 'success' && (
        <div className="rounded-lg p-4 text-sm bg-green-50 text-green-800">
          {message}
        </div>
      )}

      {message && status === 'error' && (
        <div className="rounded-lg p-4 text-sm bg-red-50 text-red-800">
          {message}
        </div>
      )}

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {status === 'loading' ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  );
}
