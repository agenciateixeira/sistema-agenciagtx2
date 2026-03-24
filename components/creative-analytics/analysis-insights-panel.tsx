'use client';

import { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Palette,
  Eye,
  Type,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisInsightsPanelProps {
  analysis: any;
  onClose?: () => void;
}

export function AnalysisInsightsPanel({ analysis, onClose }: AnalysisInsightsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  if (!analysis) return null;

  const tangible = analysis.tangible_attributes || {};
  const intangible = analysis.intangible_attributes || {};
  const textAnalysis = analysis.text_analysis || {};
  const performance = analysis.performance_correlation || {};
  const hookAnalysis = performance.hook_analysis || {};

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-700 bg-green-100';
    if (score >= 6) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Análise de IA do Criativo</h2>
                <p className="text-xs text-gray-600">
                  Modelo: {analysis.model_used} • {(analysis.processing_time_ms / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Overview Section */}
              <Section
                title="Visão Geral"
                icon={Target}
                expanded={expandedSection === 'overview'}
                onToggle={() => toggleSection('overview')}
              >
                <div className="grid grid-cols-3 gap-4">
                  <ScoreCard
                    label="Hook Strength"
                    score={intangible.hook_strength || 0}
                    description="Força do gancho (3s iniciais)"
                  />
                  <ScoreCard
                    label="CTA Prominence"
                    score={intangible.cta_prominence || 0}
                    description="Visibilidade do Call-to-Action"
                  />
                  <ScoreCard
                    label="Aesthetic Score"
                    score={intangible.aesthetic_score || 0}
                    description="Qualidade estética geral"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Tom / Emoção
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {intangible.tone || 'N/A'} • {intangible.emotion || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Densidade de Informação
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {intangible.information_density || 'N/A'}
                    </p>
                  </div>
                </div>
              </Section>

              {/* Hook Analysis */}
              {hookAnalysis && Object.keys(hookAnalysis).length > 0 && (
                <Section
                  title="Análise do Hook (0-3s)"
                  icon={Zap}
                  expanded={expandedSection === 'hook'}
                  onToggle={() => toggleSection('hook')}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                      <span className="text-sm font-medium text-gray-700">Hook Rate Previsto</span>
                      <span className="text-lg font-bold text-blue-700">
                        {((hookAnalysis.predicted_hook_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>

                    {hookAnalysis.attention_grabbers && hookAnalysis.attention_grabbers.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-600">
                          Elementos de Atenção
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hookAnalysis.attention_grabbers.map((grabber: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700"
                            >
                              {grabber}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          hookAnalysis.has_motion ? 'bg-green-500' : 'bg-gray-300'
                        )} />
                        <span className="text-gray-700">Movimento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          hookAnalysis.has_face_closeup ? 'bg-green-500' : 'bg-gray-300'
                        )} />
                        <span className="text-gray-700">Rosto em Close</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          hookAnalysis.has_bold_text ? 'bg-green-500' : 'bg-gray-300'
                        )} />
                        <span className="text-gray-700">Texto Forte</span>
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* Visual Attributes */}
              <Section
                title="Atributos Visuais"
                icon={Palette}
                expanded={expandedSection === 'visual'}
                onToggle={() => toggleSection('visual')}
              >
                <div className="space-y-4">
                  {tangible.colors && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-gray-600">Cores</p>
                      <div className="flex items-center gap-3">
                        {tangible.colors.palette?.map((color: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className="h-8 w-8 rounded-md border border-gray-300 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs font-mono text-gray-600">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tangible.objects && tangible.objects.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-gray-600">
                        Objetos Detectados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tangible.objects.map((obj: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                          >
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <MetricBadge label="Rostos" value={tangible.faces_count || 0} />
                    <MetricBadge
                      label="Brilho"
                      value={`${((tangible.brightness || 0) * 100).toFixed(0)}%`}
                    />
                    <MetricBadge
                      label="Contraste"
                      value={`${((tangible.contrast || 0) * 100).toFixed(0)}%`}
                    />
                  </div>
                </div>
              </Section>

              {/* Text Analysis */}
              {textAnalysis && Object.keys(textAnalysis).length > 0 && (
                <Section
                  title="Análise de Texto"
                  icon={Type}
                  expanded={expandedSection === 'text'}
                  onToggle={() => toggleSection('text')}
                >
                  <div className="space-y-3">
                    {textAnalysis.headline && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-xs font-semibold text-blue-900">Headline</p>
                        <p className="mt-1 text-sm font-medium text-blue-800">
                          "{textAnalysis.headline}"
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {textAnalysis.urgency_words && textAnalysis.urgency_words.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-600">
                            Palavras de Urgência
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {textAnalysis.urgency_words.map((word: string, idx: number) => (
                              <span
                                key={idx}
                                className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {textAnalysis.power_words && textAnalysis.power_words.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-600">Power Words</p>
                          <div className="flex flex-wrap gap-1">
                            {textAnalysis.power_words.map((word: string, idx: number) => (
                              <span
                                key={idx}
                                className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>
              )}

              {/* Strengths & Weaknesses */}
              <Section
                title="Forças & Fraquezas"
                icon={Eye}
                expanded={expandedSection === 'swot'}
                onToggle={() => toggleSection('swot')}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-xs font-semibold uppercase text-gray-600">Forças</p>
                    </div>
                    <ul className="space-y-1">
                      {performance.strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <p className="text-xs font-semibold uppercase text-gray-600">Fraquezas</p>
                    </div>
                    <ul className="space-y-1">
                      {performance.weaknesses?.map((weakness: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Section>

              {/* Recommendations */}
              {performance.recommendations && performance.recommendations.length > 0 && (
                <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Recomendações de IA</h3>
                  </div>
                  <ul className="space-y-2">
                    {performance.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-800">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Analisado em {new Date(analysis.created_at).toLocaleString('pt-BR')}
              </span>
              <span>Custo: ${(analysis.cost_usd || 0).toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Section({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: any;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}

function ScoreCard({ label, score, description }: { label: string; score: number; description: string }) {
  const getColor = (s: number) => {
    if (s >= 8) return 'from-green-500 to-emerald-500';
    if (s >= 6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn(
          'text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
          getColor(score)
        )}>
          {score.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">/10</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-center">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
