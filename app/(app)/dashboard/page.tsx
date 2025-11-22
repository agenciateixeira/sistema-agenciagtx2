import { ModuleCard } from '@/components/dashboard/module-card';
import { SectionTitle } from '@/components/dashboard/section-title';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  modules,
  scheduledReports,
  notifications,
  onboardingChecklist,
  auditLog,
  abTests,
  predictivePerformance,
  predictiveTraining,
  webhooks,
  chatInbox
} from '@/data/dashboard';
import { Download, TrendingUp, Zap, Users, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visão Geral do Sistema</h2>
            <p className="mt-1 text-sm text-gray-600">
              Acompanhe métricas em tempo real e performance das campanhas
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sessões com score alto"
          value={`${predictivePerformance.sessionsScoreHigh}`}
          helper="Últimas 24h"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label="Intervenções do chat"
          value={`${predictivePerformance.chatInterventions}`}
          helper="Ações em tempo real"
          icon={<Zap className="h-5 w-5" />}
        />
        <StatCard
          label="Conversões salvas"
          value={`${predictivePerformance.savedConversions}`}
          helper="Impacto direto"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Modo atual"
          value={predictivePerformance.intensity}
          helper="Algoritmo preditivo"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle
            title="Relatórios Agendados"
            description="Entregas automáticas diárias, semanais ou mensais"
          />
          <div className="mt-6 space-y-3">
            {scheduledReports.map((report) => (
              <div key={report.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{report.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{report.cadence}</p>
                  </div>
                  <span className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {report.channel}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-500">Próxima execução: {report.nextRun}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle title="Onboarding" description="Configure todas as integrações" />
          <div className="mt-6 space-y-2">
            {onboardingChecklist.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <span className={step.done ? 'text-gray-500 line-through' : 'text-gray-900'}>
                  {step.label}
                </span>
                <span
                  className={`text-xs font-medium ${step.done ? 'text-brand-600' : 'text-gray-400'}`}
                >
                  {step.done ? 'Completo' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle title="Alertas Recentes" description="Notificações do sistema" />
          <div className="mt-6 space-y-3">
            {notifications.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{alert.type}</span>
                  <span>{alert.time}</span>
                </div>
                <p className="mt-2 text-sm text-gray-900">{alert.message}</p>
                <p className="mt-1 text-xs text-gray-600">Canal: {alert.channel}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle title="Testes A/B" description="Variações de mensagens" />
          <div className="mt-6 space-y-3">
            {abTests.map((test) => (
              <div key={test.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{test.name}</p>
                  <span className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {test.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <p className="font-semibold text-gray-900">Variação A</p>
                    <p className="text-gray-600">Conversão: {test.variantA.conversion}%</p>
                    <p className="text-gray-600">Tempo: {test.variantA.responseTime}</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <p className="font-semibold text-gray-900">Variação B</p>
                    <p className="text-gray-600">Conversão: {test.variantB.conversion}%</p>
                    <p className="text-gray-600">Tempo: {test.variantB.responseTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle title="Treinamento do Algoritmo" description="Rotule sessões manualmente" />
          <div className="mt-6 space-y-2">
            {predictiveTraining.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-gray-900">Sessão {session.session}</p>
                  <p className="text-xs text-gray-600">Rótulo: {session.label}</p>
                </div>
                <span className="text-xs font-medium text-brand-600">Impacto {session.impact}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle title="Webhooks Ativos" description="Integrações configuradas" />
          <div className="mt-6 space-y-2">
            {webhooks.slice(0, 3).map((hook) => (
              <div
                key={hook.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-gray-900">{hook.name}</p>
                  <p className="text-xs text-gray-600">Evento: {hook.event}</p>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <p className="font-medium text-brand-600">{hook.status}</p>
                  <p>{hook.lastDelivery}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle title="Inbox WhatsApp" description="Conversas centralizadas" />
          <div className="mt-6 space-y-3">
            {chatInbox.map((chat) => (
              <div key={chat.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{chat.customer}</p>
                    <p className="text-xs text-gray-600">{chat.tag}</p>
                  </div>
                  <span className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {chat.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{chat.lastMessage}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Conversão: {chat.conversionLinked ? 'Sim' : 'Não'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <SectionTitle title="Log de Auditoria" description="Eventos do sistema" />
          <div className="mt-6 space-y-3">
            {auditLog.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{item.event}</span>
                  <span>{item.time}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SectionTitle
          title="Módulos do Sistema"
          description="Funcionalidades disponíveis e em desenvolvimento"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </div>
  );
}
