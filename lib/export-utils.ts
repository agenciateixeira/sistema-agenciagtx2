/**
 * Utilitários para exportação de dados
 */

/**
 * Converte dados para CSV e faz download
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Pegar headers das chaves do primeiro objeto
  const headers = Object.keys(data[0]);

  // Criar linhas do CSV
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escapar vírgulas e aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ];

  // Criar blob e fazer download
  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formata data para exportação
 */
export function formatDateForExport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata moeda para exportação
 */
export function formatCurrencyForExport(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Prepara dados de insights para exportação CSV
 */
export function prepareInsightsForCSV(insights: any) {
  return {
    'Período': `${insights.date_start} - ${insights.date_stop}`,
    'Gasto Total (R$)': insights.spend?.toFixed(2) || '0.00',
    'Impressões': insights.impressions || 0,
    'Cliques': insights.clicks || 0,
    'CTR (%)': insights.ctr?.toFixed(2) || '0.00',
    'CPC (R$)': insights.cpc?.toFixed(2) || '0.00',
    'CPM (R$)': insights.cpm?.toFixed(2) || '0.00',
    'Alcance': insights.reach || 0,
    'Frequência': insights.frequency?.toFixed(2) || '0.00',
  };
}

/**
 * Prepara dados de campanhas para exportação CSV
 */
export function prepareCampaignsForCSV(campaigns: any[]) {
  return campaigns.map(campaign => ({
    'Nome da Campanha': campaign.campaign_name || campaign.name,
    'Status': campaign.status || 'active',
    'Gasto (R$)': campaign.spend?.toFixed(2) || '0.00',
    'Impressões': campaign.impressions || 0,
    'Cliques': campaign.clicks || 0,
    'CTR (%)': campaign.ctr?.toFixed(2) || '0.00',
    'CPC (R$)': campaign.cpc?.toFixed(2) || '0.00',
    'CPM (R$)': campaign.cpm?.toFixed(2) || '0.00',
    'Conversões': campaign.conversions || 0,
    'Valor de Conversão (R$)': campaign.conversion_value?.toFixed(2) || '0.00',
  }));
}

/**
 * Exporta analytics de recuperação para Excel
 */
export async function exportRecoveryToExcel(analytics: any, period: string) {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();
  const timestamp = new Date().toISOString().split('T')[0];

  // Sheet 1: ROI Metrics
  const roiData = [
    ['Métrica', 'Valor'],
    ['Valor Abandonado', `R$ ${analytics.roi.totalAbandonedValue.toFixed(2)}`],
    ['Valor Recuperado', `R$ ${analytics.roi.totalRecoveredValue.toFixed(2)}`],
    ['Emails Enviados', analytics.roi.emailsSent],
    ['Custo Estimado', `R$ ${analytics.roi.estimatedCost.toFixed(2)}`],
    ['ROI', `${analytics.roi.roi}x`],
    ['Revenue por Email', `R$ ${analytics.roi.revenuePerEmail}`],
  ];
  const wsROI = XLSX.utils.aoa_to_sheet(roiData);
  XLSX.utils.book_append_sheet(wb, wsROI, 'ROI');

  // Sheet 2: Funil de Conversão
  const funnelData = [
    ['Etapa', 'Quantidade', 'Taxa (%)'],
    ['Enviados', analytics.funnel.sent, '100.0'],
    ['Abertos', analytics.funnel.opened, analytics.funnel.openRate],
    ['Clicados', analytics.funnel.clicked, analytics.funnel.clickRate],
    ['Convertidos', analytics.funnel.converted, analytics.funnel.conversionRate],
  ];
  const wsFunnel = XLSX.utils.aoa_to_sheet(funnelData);
  XLSX.utils.book_append_sheet(wb, wsFunnel, 'Funil');

  // Sheet 3: Coortes
  if (analytics.cohorts.length > 0) {
    const cohortData = [
      ['Semana', 'Total Carrinhos', 'Recuperados', 'Taxa (%)', 'Valor Médio'],
      ...analytics.cohorts.map((c: any) => [
        new Date(c.week).toLocaleDateString('pt-BR'),
        c.totalCarts,
        c.recoveredCarts,
        c.recoveryRate,
        `R$ ${c.avgCartValue}`,
      ]),
    ];
    const wsCohort = XLSX.utils.aoa_to_sheet(cohortData);
    XLSX.utils.book_append_sheet(wb, wsCohort, 'Coortes');
  }

  // Sheet 4: UTM Sources
  if (analytics.utm.sources.length > 0) {
    const utmData = [
      ['Source', 'Carrinhos', 'Recuperados', 'Taxa (%)', 'Valor Total'],
      ...analytics.utm.sources.map((u: any) => [
        u.name,
        u.carts,
        u.recovered,
        u.recoveryRate,
        `R$ ${u.totalValue.toFixed(2)}`,
      ]),
    ];
    const wsUTM = XLSX.utils.aoa_to_sheet(utmData);
    XLSX.utils.book_append_sheet(wb, wsUTM, 'UTM Sources');
  }

  // Sheet 5: Por Horário
  const timeData = [
    ['Hora', 'Carrinhos', 'Recuperados', 'Taxa (%)'],
    ...analytics.timeOfDay.byHour
      .filter((h: any) => h.carts > 0)
      .map((h: any) => [
        `${h.hour}:00`,
        h.carts,
        h.recovered,
        h.recoveryRate,
      ]),
  ];
  const wsTime = XLSX.utils.aoa_to_sheet(timeData);
  XLSX.utils.book_append_sheet(wb, wsTime, 'Por Horário');

  // Sheet 6: Por Valor
  const valueData = [
    ['Faixa de Valor', 'Carrinhos', 'Recuperados', 'Taxa (%)'],
    ...analytics.cartValue.map((v: any) => [
      v.range,
      v.carts,
      v.recovered,
      v.recoveryRate,
    ]),
  ];
  const wsValue = XLSX.utils.aoa_to_sheet(valueData);
  XLSX.utils.book_append_sheet(wb, wsValue, 'Por Valor');

  // Gerar arquivo e fazer download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `recovery-analytics-${period}days-${timestamp}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta analytics de recuperação para PDF
 */
export async function exportRecoveryToPDF(analytics: any, period: string) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF() as any;
  const timestamp = new Date().toLocaleDateString('pt-BR');
  let yPos = 20;

  // Título
  doc.setFontSize(18);
  doc.text('Relatório de Recuperação de Carrinhos', 14, yPos);
  doc.setFontSize(11);
  yPos += 7;
  doc.text(`Período: Últimos ${period} dias | Gerado em: ${timestamp}`, 14, yPos);
  yPos += 10;

  // ROI Metrics
  doc.setFontSize(14);
  doc.text('Métricas de ROI', 14, yPos);
  yPos += 7;

  doc.autoTable({
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: [
      ['Valor Abandonado', `R$ ${analytics.roi.totalAbandonedValue.toFixed(2)}`],
      ['Valor Recuperado', `R$ ${analytics.roi.totalRecoveredValue.toFixed(2)}`],
      ['Emails Enviados', analytics.roi.emailsSent],
      ['Custo Estimado', `R$ ${analytics.roi.estimatedCost.toFixed(2)}`],
      ['ROI', `${analytics.roi.roi}x`],
      ['Revenue por Email', `R$ ${analytics.roi.revenuePerEmail}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Funil de Conversão
  doc.setFontSize(14);
  doc.text('Funil de Conversão', 14, yPos);
  yPos += 7;

  doc.autoTable({
    startY: yPos,
    head: [['Etapa', 'Quantidade', 'Taxa (%)']],
    body: [
      ['Enviados', analytics.funnel.sent, '100.0'],
      ['Abertos', analytics.funnel.opened, analytics.funnel.openRate],
      ['Clicados', analytics.funnel.clicked, analytics.funnel.clickRate],
      ['Convertidos', analytics.funnel.converted, analytics.funnel.conversionRate],
    ],
    theme: 'striped',
    headStyles: { fillColor: [147, 51, 234] },
  });

  // Nova página para Coortes
  if (analytics.cohorts.length > 0) {
    doc.addPage();
    yPos = 20;
    doc.setFontSize(14);
    doc.text('Análise de Coorte Semanal', 14, yPos);
    yPos += 7;

    doc.autoTable({
      startY: yPos,
      head: [['Semana', 'Total', 'Recuperados', 'Taxa (%)', 'Valor Médio']],
      body: analytics.cohorts.map((c: any) => [
        new Date(c.week).toLocaleDateString('pt-BR'),
        c.totalCarts,
        c.recoveredCarts,
        c.recoveryRate,
        `R$ ${c.avgCartValue}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [168, 85, 247] },
    });
  }

  // Nova página para UTM e outras métricas
  doc.addPage();
  yPos = 20;

  // UTM Sources
  if (analytics.utm.sources.length > 0) {
    doc.setFontSize(14);
    doc.text('Top UTM Sources', 14, yPos);
    yPos += 7;

    doc.autoTable({
      startY: yPos,
      head: [['Source', 'Carrinhos', 'Taxa (%)']],
      body: analytics.utm.sources.slice(0, 10).map((u: any) => [
        u.name,
        u.carts,
        u.recoveryRate,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Por Valor do Carrinho
  doc.setFontSize(14);
  doc.text('Análise por Valor do Carrinho', 14, yPos);
  yPos += 7;

  doc.autoTable({
    startY: yPos,
    head: [['Faixa de Valor', 'Carrinhos', 'Taxa (%)']],
    body: analytics.cartValue.map((v: any) => [
      v.range,
      v.carts,
      v.recoveryRate,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
  });

  // Salvar PDF
  doc.save(`recovery-analytics-${period}days-${timestamp.replace(/\//g, '-')}.pdf`);
}
