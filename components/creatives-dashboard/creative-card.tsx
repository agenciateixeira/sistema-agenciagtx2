'use client';

import { Image as ImageIcon, Video, Layers, ExternalLink } from 'lucide-react';

interface CreativeCardProps {
  creative: any;
}

const fatigueColors = {
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Saudável' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Atenção' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Fadiga Alta' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Crítico' },
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  DELETED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'video': return <Video className="h-3.5 w-3.5" />;
    case 'carousel': return <Layers className="h-3.5 w-3.5" />;
    default: return <ImageIcon className="h-3.5 w-3.5" />;
  }
}

export function CreativeCard({ creative }: CreativeCardProps) {
  const fatigue = fatigueColors[creative.fatigue_level as keyof typeof fatigueColors] || fatigueColors.low;
  const insights = creative.insights;
  const thumbnailUrl = creative.thumbnail_url || creative.image_url || creative.video_thumbnail_url;

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-gray-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={creative.ad_name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <TypeIcon type={creative.creative_type} />
            <span className="ml-2 text-xs text-gray-400">Sem preview</span>
          </div>
        )}

        {/* Badges no thumbnail */}
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[creative.status] || 'bg-gray-100 text-gray-700'}`}>
            {creative.status}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-700 backdrop-blur-sm">
            <TypeIcon type={creative.creative_type} />
            {creative.creative_type === 'image' ? 'Imagem' : creative.creative_type === 'video' ? 'Vídeo' : 'Carrossel'}
          </span>
        </div>

        {/* Fatigue badge */}
        <div className="absolute right-2 top-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${fatigue.bg} ${fatigue.text}`}>
            Fadiga: {creative.fatigue_score}%
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Nome do anúncio */}
        <h3 className="truncate text-sm font-semibold text-gray-900" title={creative.ad_name}>
          {creative.ad_name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-gray-500" title={creative.insights?.campaign_name}>
          {creative.insights?.campaign_name || 'Sem campanha'}
        </p>

        {/* Texto do criativo */}
        {creative.body && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{creative.body}</p>
        )}

        {/* Métricas */}
        {insights ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
              <div>
                <p className="text-[10px] font-medium uppercase text-gray-400">Gasto</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(insights.spend)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-gray-400">CTR</p>
                <p className={`text-sm font-bold ${insights.ctr >= 1.5 ? 'text-green-600' : insights.ctr >= 1.0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {insights.ctr.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-gray-400">CPC</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(insights.cpc)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-gray-400">Impressões</p>
                <p className="text-sm font-bold text-gray-900">{formatNumber(insights.impressions)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-gray-400">Frequência</p>
                <p className={`text-sm font-bold ${insights.frequency >= 3.5 ? 'text-red-600' : insights.frequency >= 2.5 ? 'text-yellow-600' : 'text-gray-900'}`}>
                  {insights.frequency.toFixed(1)}x
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-gray-400">Conv.</p>
                <p className="text-sm font-bold text-gray-900">{insights.conversions}</p>
              </div>
            </div>

            {/* Engagement row */}
            {(insights.likes > 0 || insights.comments > 0 || insights.shares > 0) && (
              <div className="mt-2 flex items-center gap-3 border-t border-gray-100 pt-2">
                {insights.likes > 0 && (
                  <span className="text-[10px] text-pink-600 font-medium">{formatNumber(insights.likes)} curtidas</span>
                )}
                {insights.comments > 0 && (
                  <span className="text-[10px] text-amber-600 font-medium">{formatNumber(insights.comments)} coment.</span>
                )}
                {insights.shares > 0 && (
                  <span className="text-[10px] text-green-600 font-medium">{formatNumber(insights.shares)} shares</span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">Sem dados de performance</p>
          </div>
        )}

        {/* Fatigue bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold ${fatigue.text}`}>{fatigue.label}</span>
            <span className="text-[10px] text-gray-400">{creative.fatigue_score}/100</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${
                creative.fatigue_score >= 70 ? 'bg-red-500' :
                creative.fatigue_score >= 45 ? 'bg-orange-500' :
                creative.fatigue_score >= 25 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${creative.fatigue_score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
