'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  Download,
  Calendar,
  Building2,
  CheckSquare,
  Loader2,
  Eye,
  FileSpreadsheet,
  FilePlus,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
} from 'lucide-react';
import { exportToCSV, prepareInsightsForCSV, prepareCampaignsForCSV } from '@/lib/export-utils';
import { LogoUpload } from './logo-upload';
import Image from 'next/image';

interface ReportsClientProps {
  userId: string;
  metaConnection: any;
  reportLogoUrl?: string | null;
  reportCompanyName?: string | null;
}

export function ReportsClient({ userId, metaConnection, reportLogoUrl, reportCompanyName }: ReportsClientProps) {
  const [step, setStep] = useState<'configure' | 'preview'>('configure');

  // Configuração do relatório
  const [datePreset, setDatePreset] = useState<'last_7d' | 'last_30d' | 'this_month' | 'last_month'>('last_30d');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'summary',
    'campaigns',
    'daily',
    'roi',
  ]);

  // Dados do relatório
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const SECTIONS = [
    {
      id: 'summary',
      name: 'Resumo Executivo',
      description: 'Métricas principais e visão geral',
      icon: TrendingUp,
    },
    {
      id: 'campaigns',
      name: 'Desempenho por Campanha',
      description: 'Detalhamento de todas as campanhas',
      icon: Target,
    },
    {
      id: 'daily',
      name: 'Performance Diária',
      description: 'Evolução dia a dia das métricas',
      icon: BarChart3,
    },
    {
      id: 'roi',
      name: 'Análise de ROI',
      description: 'Retorno sobre investimento em ads',
      icon: DollarSign,
    },
  ];

  useEffect(() => {
    loadAvailableAccounts();
  }, []);

  const loadAvailableAccounts = async () => {
    if (!metaConnection) {
      setLoadingAccounts(false);
      return;
    }

    setLoadingAccounts(true);
    try {
      const response = await fetch(`/api/meta/ad-accounts?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const accounts = data.accounts || [];
        setAvailableAccounts(accounts);

        // Selecionar conta principal por padrão
        if (metaConnection.primary_ad_account_id) {
          setSelectedAccounts([metaConnection.primary_ad_account_id]);
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Erro ao carregar contas');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const toggleAccount = (accountId: string) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter((id) => id !== accountId));
    } else {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter((id) => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const handleGeneratePreview = async () => {
    if (selectedAccounts.length === 0) {
      toast.error('Selecione pelo menos uma conta');
      return;
    }

    if (selectedSections.length === 0) {
      toast.error('Selecione pelo menos uma seção');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Gerando preview do relatório...');

    try {
      // Buscar dados de todas as contas selecionadas
      const promises = selectedAccounts.map(async (accountId) => {
        const [accountResponse, campaignsResponse, dailyResponse, roiResponse] = await Promise.all([
          selectedSections.includes('summary')
            ? fetch(`/api/meta/insights?user_id=${userId}&type=account&date_preset=${datePreset}`)
            : Promise.resolve(null),
          selectedSections.includes('campaigns')
            ? fetch(`/api/meta/insights?user_id=${userId}&type=campaigns&date_preset=${datePreset}`)
            : Promise.resolve(null),
          selectedSections.includes('daily')
            ? fetch(`/api/meta/insights?user_id=${userId}&type=daily&days=30`)
            : Promise.resolve(null),
          selectedSections.includes('roi')
            ? fetch(`/api/meta/roi?user_id=${userId}&date_preset=${datePreset}`)
            : Promise.resolve(null),
        ]);

        const accountData = accountResponse?.ok ? await accountResponse.json() : null;
        const campaignsData = campaignsResponse?.ok ? await campaignsResponse.json() : null;
        const dailyData = dailyResponse?.ok ? await dailyResponse.json() : null;
        const roiData = roiResponse?.ok ? await roiResponse.json() : null;

        const account = availableAccounts.find(
          (acc) => (acc.account_id || acc.id.replace('act_', '')) === accountId
        );

        return {
          accountId,
          accountName: account?.name || accountId,
          account: accountData?.data || null,
          campaigns: campaignsData?.data || [],
          daily: dailyData?.data || [],
          roi: roiData?.data || null,
        };
      });

      const results = await Promise.all(promises);
      setReportData(results);
      setStep('preview');
      toast.success('Preview gerado com sucesso!', { id: toastId });
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Erro ao gerar preview', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const toastId = toast.loading('Exportando para CSV...');

    try {
      const now = new Date().toISOString().split('T')[0];

      reportData.forEach((accountData: any) => {
        // Exportar resumo
        if (accountData.account && selectedSections.includes('summary')) {
          const summaryData = [prepareInsightsForCSV(accountData.account)];
          exportToCSV(summaryData, `relatorio-${accountData.accountName}-resumo-${now}`);
        }

        // Exportar campanhas
        if (accountData.campaigns?.length > 0 && selectedSections.includes('campaigns')) {
          const campaignsData = prepareCampaignsForCSV(accountData.campaigns);
          exportToCSV(campaignsData, `relatorio-${accountData.accountName}-campanhas-${now}`);
        }

        // Exportar diário
        if (accountData.daily?.length > 0 && selectedSections.includes('daily')) {
          const dailyData = accountData.daily.map((day: any) => ({
            Data: day.date_start || day.date,
            'Gasto (R$)': day.spend?.toFixed(2) || '0.00',
            Impressões: day.impressions || 0,
            Cliques: day.clicks || 0,
            'CTR (%)': day.ctr?.toFixed(2) || '0.00',
            'CPC (R$)': day.cpc?.toFixed(2) || '0.00',
          }));
          exportToCSV(dailyData, `relatorio-${accountData.accountName}-diario-${now}`);
        }

        // Exportar ROI
        if (accountData.roi?.campaigns?.length > 0 && selectedSections.includes('roi')) {
          const roiData = accountData.roi.campaigns.map((campaign: any) => ({
            Campanha: campaign.campaign_name,
            'Gasto em Ads (R$)': campaign.ad_spend?.toFixed(2) || '0.00',
            'Carrinhos Abandonados': campaign.abandoned_carts || 0,
            'Carrinhos Recuperados': campaign.recovered_carts || 0,
            'Receita Recuperada (R$)': campaign.revenue_recovered?.toFixed(2) || '0.00',
            'ROI (%)': campaign.roi?.toFixed(2) || '0.00',
          }));
          exportToCSV(roiData, `relatorio-${accountData.accountName}-roi-${now}`);
        }
      });

      toast.success('Relatórios CSV exportados!', { id: toastId });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Erro ao exportar CSV', { id: toastId });
    }
  };

  if (!metaConnection) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Meta Ads não conectado
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Conecte sua conta do Meta Ads para gerar relatórios
        </p>
      </div>
    );
  }

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep('configure')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            step === 'configure'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FilePlus className="h-4 w-4" />
          1. Configurar
        </button>
        <button
          onClick={() => step === 'preview' && setStep('preview')}
          disabled={!reportData}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            step === 'preview'
              ? 'bg-blue-600 text-white'
              : reportData
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Eye className="h-4 w-4" />
          2. Preview e Exportar
        </button>
      </div>

      {step === 'configure' ? (
        <div className="space-y-6">
          {/* Período */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Período do Relatório</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: 'last_7d', label: 'Últimos 7 dias' },
                { value: 'last_30d', label: 'Últimos 30 dias' },
                { value: 'this_month', label: 'Este mês' },
                { value: 'last_month', label: 'Mês passado' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setDatePreset(period.value as any)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
                    datePreset === period.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contas */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Contas de Anúncios</h3>
            </div>

            <div className="space-y-2">
              {availableAccounts.map((account) => {
                const accountId = account.account_id || account.id.replace('act_', '');
                const isSelected = selectedAccounts.includes(accountId);

                return (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(accountId)}
                    className={`flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-500">ID: {accountId}</p>
                    </div>
                    {isSelected && (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seções */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Seções do Relatório</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isSelected = selectedSections.includes(section.id);

                return (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{section.name}</p>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                    {isSelected && (
                      <CheckSquare className="h-5 w-5 flex-shrink-0 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo e Branding */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Logo e Branding</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure a logo e nome da empresa para personalizar seus relatórios
            </p>
            <LogoUpload
              userId={userId}
              currentLogoUrl={reportLogoUrl}
              currentCompanyName={reportCompanyName}
            />
          </div>

          {/* Botão gerar preview */}
          <button
            onClick={handleGeneratePreview}
            disabled={loading || selectedAccounts.length === 0 || selectedSections.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gerando Preview...
              </>
            ) : (
              <>
                <Eye className="h-5 w-5" />
                Gerar Preview do Relatório
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            {/* Logo Header */}
            {(reportLogoUrl || reportCompanyName) && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  {reportLogoUrl && (
                    <div className="relative h-16 w-32">
                      <Image
                        src={reportLogoUrl}
                        alt="Logo"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  {reportCompanyName && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{reportCompanyName}</h2>
                      <p className="text-sm text-gray-600">Relatório de Performance Meta Ads</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preview do Relatório
            </h3>

            {reportData?.map((accountData: any, index: number) => (
              <div key={index} className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  {accountData.accountName}
                </h4>

                {/* Resumo */}
                {accountData.account && selectedSections.includes('summary') && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Resumo Executivo:</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-600">Gasto Total</p>
                        <p className="text-lg font-bold text-gray-900">
                          R$ {accountData.account.spend?.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-600">Impressões</p>
                        <p className="text-lg font-bold text-gray-900">
                          {accountData.account.impressions?.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-600">Cliques</p>
                        <p className="text-lg font-bold text-gray-900">
                          {accountData.account.clicks?.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-600">CTR</p>
                        <p className="text-lg font-bold text-gray-900">
                          {accountData.account.ctr?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campanhas */}
                {accountData.campaigns?.length > 0 && selectedSections.includes('campaigns') && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Campanhas ({accountData.campaigns.length}):
                    </p>
                    <p className="text-xs text-gray-500">
                      {accountData.campaigns.length} campanhas serão incluídas no relatório
                    </p>
                  </div>
                )}

                {/* Diário */}
                {accountData.daily?.length > 0 && selectedSections.includes('daily') && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Performance Diária:
                    </p>
                    <p className="text-xs text-gray-500">
                      {accountData.daily.length} dias de dados incluídos
                    </p>
                  </div>
                )}

                {/* ROI */}
                {accountData.roi && selectedSections.includes('roi') && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Análise de ROI:</p>
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-xs text-green-700">ROI Geral</p>
                      <p className="text-lg font-bold text-green-800">
                        {accountData.roi.overall_roi?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botões de exportação */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FileSpreadsheet className="h-5 w-5" />
              Exportar CSV
            </button>

            <button
              onClick={() => toast('Exportação PDF em breve!', { icon: '📄' })}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <Download className="h-5 w-5" />
              Exportar PDF (em breve)
            </button>

            <button
              onClick={() => setStep('configure')}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Voltar para Configuração
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
