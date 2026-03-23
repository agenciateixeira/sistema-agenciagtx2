'use client';

import { useState, useEffect } from 'react';
import { Loader2, Monitor, Smartphone, Layout } from 'lucide-react';

interface PlacementData {
  publisher_platform: string;
  platform_position: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cost_per_result: number;
  reach: number;
  frequency: number;
}

interface PlacementBreakdownProps {
  userId: string;
  adAccountId: string;
  datePreset: string;
  adId?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('pt-BR').format(value);
}

const platformNames: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  messenger: 'Messenger',
  audience_network: 'Audience Network',
};

const positionNames: Record<string, string> = {
  feed: 'Feed',
  story: 'Stories',
  reels: 'Reels',
  right_hand_column: 'Coluna Direita',
  instant_article: 'Instant Article',
  marketplace: 'Marketplace',
  video_feeds: 'Video Feeds',
  search: 'Busca',
  instream_video: 'In-Stream',
  explore: 'Explorar',
  explore_home: 'Explorar Home',
  an_classic: 'Audience Network',
  rewarded_video: 'Rewarded Video',
  profile_feed: 'Perfil Feed',
};

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'instagram':
      return <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-tr from-purple-600 to-pink-500 text-[10px] font-bold text-white">IG</div>;
    case 'facebook':
      return <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">FB</div>;
    case 'messenger':
      return <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-[10px] font-bold text-white">MS</div>;
    default:
      return <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-400 text-[10px] font-bold text-white">AN</div>;
  }
}

export function PlacementBreakdown({ userId, adAccountId, datePreset, adId }: PlacementBreakdownProps) {
  const [data, setData] = useState<PlacementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlacements = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          user_id: userId,
          date_preset: datePreset,
        });
        if (adAccountId) params.set('ad_account_id', adAccountId);
        if (adId) params.set('ad_id', adId);

        const res = await fetch(`/api/meta/creatives/placements?${params}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacements();
  }, [userId, adAccountId, datePreset, adId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
        <span className="ml-2 text-sm text-gray-500">Carregando posicionamentos...</span>
      </div>
    );
  }

  if (error) {
    return <p className="py-4 text-center text-sm text-red-500">{error}</p>;
  }

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Sem dados de posicionamento</p>;
  }

  const totalSpend = data.reduce((s, d) => s + d.spend, 0);

  // Find best performing placement (lowest cost_per_result with conversions > 0)
  const withConversions = data.filter(d => d.conversions > 0);
  const bestPlacement = withConversions.length > 0
    ? withConversions.reduce((best, d) => d.cost_per_result < best.cost_per_result ? d : best)
    : null;

  return (
    <div className="space-y-4">
      {/* Best placement highlight */}
      {bestPlacement && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-xs font-bold text-green-700">
            Melhor posicionamento: {platformNames[bestPlacement.publisher_platform] || bestPlacement.publisher_platform} — {positionNames[bestPlacement.platform_position] || bestPlacement.platform_position}
          </p>
          <p className="text-[10px] text-green-600">
            Custo por resultado: {formatCurrency(bestPlacement.cost_per_result)} · CTR: {bestPlacement.ctr.toFixed(2)}%
          </p>
        </div>
      )}

      {/* Placement bars */}
      <div className="space-y-2">
        {data.map((placement, i) => {
          const pctSpend = totalSpend > 0 ? (placement.spend / totalSpend) * 100 : 0;
          const platform = platformNames[placement.publisher_platform] || placement.publisher_platform;
          const position = positionNames[placement.platform_position] || placement.platform_position;

          return (
            <div key={`${placement.publisher_platform}-${placement.platform_position}`} className="rounded-lg border border-gray-100 bg-white p-3 transition hover:bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <PlatformIcon platform={placement.publisher_platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{platform} — {position}</p>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${pctSpend}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600">{pctSpend.toFixed(0)}%</span>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <p className="text-[9px] uppercase text-gray-400">Gasto</p>
                  <p className="text-xs font-bold text-gray-900">{formatCurrency(placement.spend)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-400">CTR</p>
                  <p className={`text-xs font-bold ${placement.ctr >= 1.5 ? 'text-green-600' : placement.ctr < 0.8 ? 'text-red-600' : 'text-gray-900'}`}>
                    {placement.ctr.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-400">CPC</p>
                  <p className="text-xs font-bold text-gray-900">{formatCurrency(placement.cpc)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-400">Conv.</p>
                  <p className="text-xs font-bold text-gray-900">{formatNumber(placement.conversions)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-400">CPR</p>
                  <p className={`text-xs font-bold ${placement.cost_per_result > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {placement.cost_per_result > 0 ? formatCurrency(placement.cost_per_result) : '-'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
