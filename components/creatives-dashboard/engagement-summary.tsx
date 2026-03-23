'use client';

import { Heart, MessageCircle, Share2, Bookmark, Link2, Play } from 'lucide-react';

interface EngagementTotals {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  link_clicks: number;
  impressions: number;
  video_plays: number;
  video_thru_plays: number;
}

interface EngagementSummaryProps {
  totals: EngagementTotals;
}

function formatNumber(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function EngagementSummary({ totals }: EngagementSummaryProps) {
  const totalEngagement = totals.likes + totals.comments + totals.shares;
  const engagementRate = totals.impressions > 0
    ? ((totalEngagement / totals.impressions) * 100).toFixed(2)
    : '0.00';

  const metrics = [
    { label: 'Curtidas', value: totals.likes, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
    { label: 'Comentários', value: totals.comments, icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Shares', value: totals.shares, icon: Share2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { label: 'Salvamentos', value: totals.saves, icon: Bookmark, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Cliques link', value: totals.link_clicks, icon: Link2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Reproduções', value: totals.video_plays, icon: Play, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Engajamento Total</h3>
        <div className="rounded-full bg-green-100 px-3 py-1">
          <span className="text-xs font-bold text-green-700">
            Taxa: {engagementRate}%
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`flex items-center gap-2.5 rounded-lg border ${m.border} ${m.bg} p-3`}
            >
              <Icon className={`h-4 w-4 ${m.color}`} />
              <div>
                <p className={`text-lg font-bold ${m.color}`}>{formatNumber(m.value)}</p>
                <p className="text-[10px] font-medium text-gray-500">{m.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
