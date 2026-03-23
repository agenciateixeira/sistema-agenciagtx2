'use client';

import { Image as ImageIcon, Video, Layers } from 'lucide-react';

interface CreativesTableProps {
  creatives: any[];
  onSelectCreative?: (creative: any) => void;
  selectedAdId?: string;
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

const qualityColors: Record<string, string> = {
  excellent: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  average: 'bg-yellow-100 text-yellow-700',
  below_average: 'bg-orange-100 text-orange-700',
  poor: 'bg-red-100 text-red-700',
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

export function CreativesTable({ creatives, onSelectCreative, selectedAdId }: CreativesTableProps) {
  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {['', 'Anúncio', 'Tipo', 'Status', 'Score', 'Gasto', 'CTR', 'CPC', 'Freq.', 'Hook', 'Hold', 'Conv.', 'Curtidas', 'Fadiga'].map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
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
            const ql = c.quality_level as keyof typeof qualityColors;
            const isVideo = c.creative_type === 'video';

            return (
              <tr
                key={c.ad_id}
                onClick={() => onSelectCreative?.(c)}
                className={`transition-colors cursor-pointer ${
                  selectedAdId === c.ad_id ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-3 py-2.5">
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
                <td className="max-w-[180px] px-3 py-2.5">
                  <p className="truncate font-medium text-gray-900" title={c.ad_name}>{c.ad_name}</p>
                  <p className="truncate text-[10px] text-gray-400" title={insights?.campaign_name}>{insights?.campaign_name || '-'}</p>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <TypeIcon type={c.creative_type} />
                    <span className="text-xs text-gray-600">
                      {c.creative_type === 'image' ? 'Img' : c.creative_type === 'video' ? 'Vídeo' : 'Carr.'}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${qualityColors[ql] || 'bg-gray-100 text-gray-700'}`}>
                    {(c.quality_score || 0).toFixed(1)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-gray-900">{insights ? formatCurrency(insights.spend) : '-'}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {insights ? (
                    <span className={`font-medium ${insights.ctr >= 1.5 ? 'text-green-600' : insights.ctr >= 1.0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {insights.ctr.toFixed(2)}%
                    </span>
                  ) : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{insights ? formatCurrency(insights.cpc) : '-'}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {insights ? (
                    <span className={`font-medium ${insights.frequency >= 3.5 ? 'text-red-600' : insights.frequency >= 2.5 ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {insights.frequency.toFixed(1)}x
                    </span>
                  ) : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {insights && isVideo && insights.hook_rate > 0 ? (
                    <span className={`font-medium ${insights.hook_rate >= 15 ? 'text-green-600' : insights.hook_rate >= 8 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {insights.hook_rate.toFixed(1)}%
                    </span>
                  ) : <span className="text-gray-300">-</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {insights && isVideo && insights.hold_rate > 0 ? (
                    <span className={`font-medium ${insights.hold_rate >= 25 ? 'text-green-600' : insights.hold_rate >= 12 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {insights.hold_rate.toFixed(1)}%
                    </span>
                  ) : <span className="text-gray-300">-</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{insights?.conversions ?? '-'}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-pink-600 font-medium">{insights?.likes || 0}</td>
                <td className="px-3 py-2.5">
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
