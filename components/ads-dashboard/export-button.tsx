'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToCSV, prepareInsightsForCSV, prepareCampaignsForCSV } from '@/lib/export-utils';

interface ExportButtonProps {
  accountInsights: any;
  campaignsInsights: any[];
  dailyInsights: any[];
  roiData: any;
  datePreset: string;
}

export function ExportButton({
  accountInsights,
  campaignsInsights,
  dailyInsights,
  roiData,
  datePreset,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async (type: 'account' | 'campaigns' | 'daily' | 'roi') => {
    setExporting(true);
    const toastId = toast.loading('Gerando arquivo CSV...');

    try {
      const now = new Date().toISOString().split('T')[0];

      switch (type) {
        case 'account':
          if (!accountInsights) throw new Error('Sem dados de conta');
          const accountData = [prepareInsightsForCSV(accountInsights)];
          exportToCSV(accountData, `meta-ads-resumo-${now}`);
          break;

        case 'campaigns':
          if (!campaignsInsights || campaignsInsights.length === 0) {
            throw new Error('Sem dados de campanhas');
          }
          const campaignsData = prepareCampaignsForCSV(campaignsInsights);
          exportToCSV(campaignsData, `meta-ads-campanhas-${now}`);
          break;

        case 'daily':
          if (!dailyInsights || dailyInsights.length === 0) {
            throw new Error('Sem dados diários');
          }
          const dailyData = dailyInsights.map((day: any) => ({
            'Data': day.date_start || day.date,
            'Gasto (R$)': day.spend?.toFixed(2) || '0.00',
            'Impressões': day.impressions || 0,
            'Cliques': day.clicks || 0,
            'CTR (%)': day.ctr?.toFixed(2) || '0.00',
            'CPC (R$)': day.cpc?.toFixed(2) || '0.00',
            'CPM (R$)': day.cpm?.toFixed(2) || '0.00',
          }));
          exportToCSV(dailyData, `meta-ads-diario-${now}`);
          break;

        case 'roi':
          if (!roiData) throw new Error('Sem dados de ROI');
          const roiCampaigns = roiData.campaigns?.map((campaign: any) => ({
            'Campanha': campaign.campaign_name,
            'Gasto em Ads (R$)': campaign.ad_spend?.toFixed(2) || '0.00',
            'Carrinhos Abandonados': campaign.abandoned_carts || 0,
            'Carrinhos Recuperados': campaign.recovered_carts || 0,
            'Receita Recuperada (R$)': campaign.revenue_recovered?.toFixed(2) || '0.00',
            'ROI (%)': campaign.roi?.toFixed(2) || '0.00',
            'Taxa de Recuperação (%)': campaign.recovery_rate?.toFixed(2) || '0.00',
          })) || [];
          exportToCSV(roiCampaigns, `meta-ads-roi-${now}`);
          break;
      }

      toast.success('Arquivo CSV exportado com sucesso!', { id: toastId });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Erro ao exportar arquivo', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        disabled={exporting}
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Exportar Relatório
          </>
        )}
      </button>

      {isOpen && !exporting && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Exportar como CSV
              </p>

              <button
                onClick={() => handleExportCSV('account')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Resumo Geral</p>
                  <p className="text-xs text-gray-500">Métricas principais</p>
                </div>
              </button>

              {campaignsInsights && campaignsInsights.length > 0 && (
                <button
                  onClick={() => handleExportCSV('campaigns')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Campanhas</p>
                    <p className="text-xs text-gray-500">
                      {campaignsInsights.length} {campaignsInsights.length === 1 ? 'campanha' : 'campanhas'}
                    </p>
                  </div>
                </button>
              )}

              {dailyInsights && dailyInsights.length > 0 && (
                <button
                  onClick={() => handleExportCSV('daily')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Performance Diária</p>
                    <p className="text-xs text-gray-500">
                      {dailyInsights.length} dias
                    </p>
                  </div>
                </button>
              )}

              {roiData && roiData.campaigns && roiData.campaigns.length > 0 && (
                <button
                  onClick={() => handleExportCSV('roi')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">ROI por Campanha</p>
                    <p className="text-xs text-gray-500">
                      Ads vs Receita
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="border-t border-gray-200 p-2">
              <p className="px-3 py-1 text-xs text-gray-500">
                PDF em breve
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
