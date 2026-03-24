'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AIAnalyzeButtonProps {
  userId: string;
  adId: string;
  adAccountId: string;
  creativeUrl: string;
  creativeType: 'image' | 'video' | 'carousel';
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function AIAnalyzeButton({
  userId,
  adId,
  adAccountId,
  creativeUrl,
  creativeType,
  onAnalysisComplete,
  className,
  variant = 'default',
}: AIAnalyzeButtonProps) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);

    try {
      const response = await fetch('/api/meta/analyze-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ad_id: adId,
          ad_account_id: adAccountId,
          creative_url: creativeUrl,
          creative_type: creativeType,
          model: 'gpt-4o',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha na análise');
      }

      const result = await response.json();

      if (result.cached) {
        toast.success('Análise recuperada do cache!');
      } else {
        toast.success(`Análise completa! Custo: $${result.cost_usd.toFixed(4)}`);
      }

      onAnalysisComplete?.(result.data);

    } catch (error: any) {
      console.error('Erro ao analisar criativo:', error);
      toast.error(error.message || 'Erro ao analisar criativo');
    } finally {
      setAnalyzing(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-blue-700 disabled:opacity-50',
          className
        )}
        title="Analisar com IA"
      >
        {analyzing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {analyzing ? 'Analisando...' : 'IA'}
      </button>
    );
  }

  return (
    <button
      onClick={handleAnalyze}
      disabled={analyzing}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-purple-700 hover:to-blue-700 hover:shadow-lg disabled:opacity-50',
        className
      )}
    >
      {analyzing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analisando com IA...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Analisar com IA
        </>
      )}
    </button>
  );
}
