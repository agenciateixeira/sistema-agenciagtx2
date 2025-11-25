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
