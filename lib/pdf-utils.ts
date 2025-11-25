import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  accountName: string;
  account?: any;
  campaigns?: any[];
  daily?: any[];
  roi?: any;
}

interface PDFOptions {
  companyName?: string;
  logoUrl?: string;
  datePreset?: string;
}

/**
 * Gera PDF completo do relatório
 */
export async function generateReportPDF(
  reportData: ReportData[],
  sections: string[],
  options: PDFOptions = {}
) {
  const doc = new jsPDF();
  let currentY = 20;

  // Header com logo e nome da empresa
  if (options.companyName || options.logoUrl) {
    if (options.logoUrl) {
      try {
        // Carregar logo como imagem (se necessário implementar fetch + conversion)
        doc.setFontSize(20);
        doc.setTextColor(34, 197, 94); // Verde GTX
        doc.text(options.companyName || 'Relatório Meta Ads', 20, currentY);
        currentY += 15;
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    } else {
      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94);
      doc.text(options.companyName || 'Relatório Meta Ads', 20, currentY);
      currentY += 15;
    }
  } else {
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text('Relatório Meta Ads', 20, currentY);
    currentY += 15;
  }

  // Período
  const periodLabel = getPeriodLabel(options.datePreset || 'last_30d');
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(`Período: ${periodLabel}`, 20, currentY);
  currentY += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, currentY);
  currentY += 15;

  // Processar cada conta
  for (const accountData of reportData) {
    // Nome da conta
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text(accountData.accountName, 20, currentY);
    currentY += 10;

    // Resumo Executivo
    if (sections.includes('summary') && accountData.account) {
      doc.setFontSize(14);
      doc.setTextColor(34, 197, 94);
      doc.text('Resumo Executivo', 20, currentY);
      currentY += 8;

      const summaryData = [
        ['Gasto Total', `R$ ${accountData.account.spend?.toFixed(2) || '0.00'}`],
        ['Impressões', accountData.account.impressions?.toLocaleString('pt-BR') || '0'],
        ['Cliques', accountData.account.clicks?.toLocaleString('pt-BR') || '0'],
        ['CTR', `${accountData.account.ctr?.toFixed(2) || '0.00'}%`],
        ['CPC', `R$ ${accountData.account.cpc?.toFixed(2) || '0.00'}`],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [['Métrica', 'Valor']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 20 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Campanhas
    if (sections.includes('campaigns') && accountData.campaigns && accountData.campaigns.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(34, 197, 94);
      doc.text('Desempenho por Campanha', 20, currentY);
      currentY += 8;

      const campaignsData = accountData.campaigns.slice(0, 20).map((campaign: any) => [
        campaign.campaign_name || campaign.name || '-',
        `R$ ${campaign.spend?.toFixed(2) || '0.00'}`,
        campaign.impressions?.toLocaleString('pt-BR') || '0',
        campaign.clicks?.toLocaleString('pt-BR') || '0',
        `${campaign.ctr?.toFixed(2) || '0.00'}%`,
        `R$ ${campaign.cpc?.toFixed(2) || '0.00'}`,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Campanha', 'Gasto', 'Impressões', 'Cliques', 'CTR', 'CPC']],
        body: campaignsData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 8 },
        margin: { left: 20 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Performance Diária
    if (sections.includes('daily') && accountData.daily && accountData.daily.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(34, 197, 94);
      doc.text('Performance Diária', 20, currentY);
      currentY += 8;

      const dailyData = accountData.daily.slice(0, 30).map((day: any) => [
        day.date_start || day.date || '-',
        `R$ ${day.spend?.toFixed(2) || '0.00'}`,
        day.impressions?.toLocaleString('pt-BR') || '0',
        day.clicks?.toLocaleString('pt-BR') || '0',
        `${day.ctr?.toFixed(2) || '0.00'}%`,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Data', 'Gasto', 'Impressões', 'Cliques', 'CTR']],
        body: dailyData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 8 },
        margin: { left: 20 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Análise de ROI
    if (sections.includes('roi') && accountData.roi && accountData.roi.campaigns) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(34, 197, 94);
      doc.text('Análise de ROI', 20, currentY);
      currentY += 8;

      // ROI Geral
      if (accountData.roi.overall_roi) {
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text(`ROI Geral: ${accountData.roi.overall_roi.toFixed(2)}%`, 20, currentY);
        currentY += 10;
      }

      const roiData = accountData.roi.campaigns.slice(0, 15).map((campaign: any) => [
        campaign.campaign_name || '-',
        `R$ ${campaign.ad_spend?.toFixed(2) || '0.00'}`,
        campaign.abandoned_carts || '0',
        campaign.recovered_carts || '0',
        `R$ ${campaign.revenue_recovered?.toFixed(2) || '0.00'}`,
        `${campaign.roi?.toFixed(2) || '0.00'}%`,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Campanha', 'Gasto Ads', 'Abandonados', 'Recuperados', 'Receita', 'ROI']],
        body: roiData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 8 },
        margin: { left: 20 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Separador entre contas
    if (reportData.length > 1) {
      currentY += 10;
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${pageCount} - Sistema GTX`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Baixar PDF
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}

/**
 * Obter label do período
 */
function getPeriodLabel(datePreset: string): string {
  const labels: Record<string, string> = {
    last_7d: 'Últimos 7 dias',
    last_30d: 'Últimos 30 dias',
    this_month: 'Este mês',
    last_month: 'Mês passado',
  };
  return labels[datePreset] || datePreset;
}
