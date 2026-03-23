'use client';

import { Image as ImageIcon, Video, Layers } from 'lucide-react';

interface CreativesTableProps {
  creatives: any[];
}

const fatigueColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const fatigueLabels = {
  low: 'Saudável',
  medium: 'Atenção',
  high: 'Alta',
  critical: 'Crítico',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'video': return <Video className="h-4 w-4 text-pink-500" />;
    case 'carousel': return <Layers className="h-4 w-4 text-blue-500" />;
    default: return <ImageIcon className="h-4 w-4 text-purple-500" />;
  }
}

export function CreativesTable({ creatives }: CreativesTableProps) {
  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {['', 'Anúncio', 'Campanha', 'Tipo', 'Status', 'Gasto', 'Impressões', 'Cliques', 'CTR', 'CPC', 'Freq.', 'Conv.', 'Fadiga'].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {creatives.map((c) => {
            const insights = c.insights;
            const thumbnail = c.thumbnail_url || c.image_url || c.video_thumbnail_url;
            const fl = c.fatigue_level as keyof typeof fatigueColors;

            return (
              <tr key={c.ad_id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="h-10 w-10 overflow-hidden rounded bg-gray-100">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <TypeIcon type={c.creative_type} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="max-w-[200px] px-4 py-3">
                  <p className="truncate font-medium text-gray-900" title={c.ad_name}>{c.ad_name}</p>
                </td>
                <td className="max-w-[150px] px-4 py-3">
                  <p className="truncate text-gray-500" title={insights?.campaign_name}>{insights?.campaign_name || '-'}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <TypeIcon type={c.creative_type} />
                    <span className="text-xs text-gray-600">
                      {c.creative_type === 'image' ? 'Img' : c.creative_type === 'video' ? 'Vídeo' : 'Carr.'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{insights ? formatCurrency(insights.spend) : '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{insights ? formatNumber(insights.impressions) : '-'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{insights ? formatNumber(insights.clicks) : '-'}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {insights ? (
                    <span className={`font-medium ${insights.ctr >= 1.5 ? 'text-green-600' : insights.ctr >= 1.0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {insights.ctr.toFixed(2)}%
                    </span>
                  ) : '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{insights ? formatCurrency(insights.cpc) : '-'}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {insights ? (
                    <span className={`font-medium ${insights.frequency >= 3.5 ? 'text-red-600' : insights.frequency >= 2.5 ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {insights.frequency.toFixed(1)}x
                    </span>
                  ) : '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{insights?.conversions ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${fatigueColors[fl] || 'bg-gray-100 text-gray-700'}`}>
                    {fatigueLabels[fl] || '-'} ({c.fatigue_score})
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
