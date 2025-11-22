'use client';

import { useEffect, useState } from 'react';
import { BellRing, CheckCircle2, SmartphoneCharging, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaNotificationCenter() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [sending, setSending] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSupported('Notification' in window);
    setPermission('Notification' in window ? Notification.permission : 'denied');

    const installListener = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', installListener);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwReady(true)).catch(() => setSwReady(false));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', installListener);
    };
  }, []);

  const requestPermission = async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const triggerTestNotification = async () => {
    if (!supported || permission !== 'granted') return;
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    new Notification('GTX • Notificação de teste', {
      body: 'Alertas proativos liberados! Você receberá insights críticos mesmo offline.',
      tag: 'gtx-demo',
      icon: '/icons/icon-192.png'
    });
    setSending(false);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="rounded-3xl border border-emerald-200/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-900 p-6 text-white">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
          <BellRing className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">
            Sistema de notificações
          </p>
          <p className="text-lg font-semibold">PWA pronto para alertas inteligentes</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-emerald-50">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Status</p>
          <ul className="mt-2 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${swReady ? 'text-emerald-300' : 'text-slate-400'}`} />
              Service worker {swReady ? 'ativado e pronto.' : 'ainda não registrado.'}
            </li>
            <li className="flex items-center gap-2">
              <SmartphoneCharging className={`h-4 w-4 ${installPrompt ? 'text-emerald-300' : 'text-slate-400'}`} />
              {installPrompt ? 'App instalável neste dispositivo.' : 'Instalação disponível após primeira visita.'}
            </li>
            <li className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-slate-400" />
              PWA cacheia dashboard para leitura offline.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Ações rápidas</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={requestPermission}
              className="rounded-full bg-white/90 px-4 py-2 font-semibold text-slate-900 transition hover:bg-white"
            >
              {permission === 'granted' ? 'Permissão concedida' : 'Ativar notificações'}
            </button>
            <button
              type="button"
              onClick={triggerTestNotification}
              disabled={permission !== 'granted' || sending}
              className="rounded-full border border-white/50 px-4 py-2 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar teste' }
            </button>
            {installPrompt && (
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-full border border-emerald-300/60 px-4 py-2 font-semibold text-emerald-100 transition hover:bg-emerald-500/10"
              >
                Instalar app
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-emerald-100/80">
            Os alertas em produção usarão Web Push + e-mail para avisar quedas bruscas e relatórios prontos.
          </p>
        </div>
      </div>
    </div>
  );
}
