'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface UTMBuilderProps {
  storeDomain: string;
}

export function UTMBuilder({ storeDomain }: UTMBuilderProps) {
  const [baseUrl, setBaseUrl] = useState(`https://${storeDomain}`);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Gerar URL completa
  const generateURL = () => {
    if (!utmSource || !utmMedium || !utmCampaign) {
      return baseUrl;
    }

    const params = new URLSearchParams();
    params.append('utm_source', utmSource);
    params.append('utm_medium', utmMedium);
    params.append('utm_campaign', utmCampaign);

    if (utmContent) params.append('utm_content', utmContent);
    if (utmTerm) params.append('utm_term', utmTerm);

    return `${baseUrl}?${params.toString()}`;
  };

  const finalUrl = generateURL();
  const isValid = utmSource && utmMedium && utmCampaign;

  // Copiar URL
  const handleCopy = async () => {
    if (!isValid) return;

    await navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sugestões rápidas
  const quickSuggestions = {
    facebook: {
      source: 'facebook',
      medium: 'cpc',
      campaign: 'campanha-facebook',
    },
    instagram: {
      source: 'instagram',
      medium: 'social',
      campaign: 'campanha-instagram',
    },
    google: {
      source: 'google',
      medium: 'cpc',
      campaign: 'campanha-google',
    },
  };

  const applySuggestion = (platform: keyof typeof quickSuggestions) => {
    const suggestion = quickSuggestions[platform];
    setUtmSource(suggestion.source);
    setUtmMedium(suggestion.medium);
    setUtmCampaign(suggestion.campaign);
  };

  return (
    <div className="space-y-6">
      {/* Sugestões Rápidas */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">⚡ Começar rápido:</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => applySuggestion('facebook')}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            📘 Facebook Ads
          </button>
          <button
            onClick={() => applySuggestion('instagram')}
            className="inline-flex items-center gap-2 rounded-lg border border-pink-300 bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700 transition hover:bg-pink-100"
          >
            📸 Instagram Ads
          </button>
          <button
            onClick={() => applySuggestion('google')}
            className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
          >
            🔍 Google Ads
          </button>
        </div>
      </div>

      {/* Formulário */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* URL Base */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL do Site
          </label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={`https://${storeDomain}/produtos`}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* UTM Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origem <span className="text-red-600">*</span>
            <span className="ml-1 text-xs text-gray-500">(utm_source)</span>
          </label>
          <input
            type="text"
            value={utmSource}
            onChange={(e) => setUtmSource(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="facebook"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Ex: facebook, instagram, google</p>
        </div>

        {/* UTM Medium */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meio <span className="text-red-600">*</span>
            <span className="ml-1 text-xs text-gray-500">(utm_medium)</span>
          </label>
          <input
            type="text"
            value={utmMedium}
            onChange={(e) => setUtmMedium(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="cpc"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Ex: cpc, social, email</p>
        </div>

        {/* UTM Campaign */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campanha <span className="text-red-600">*</span>
            <span className="ml-1 text-xs text-gray-500">(utm_campaign)</span>
          </label>
          <input
            type="text"
            value={utmCampaign}
            onChange={(e) => setUtmCampaign(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="black-friday-2024"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Ex: black-friday-2024, lancamento-produto</p>
        </div>

        {/* UTM Content (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo <span className="text-xs text-gray-500">(opcional)</span>
          </label>
          <input
            type="text"
            value={utmContent}
            onChange={(e) => setUtmContent(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="banner-azul"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* UTM Term (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Termo <span className="text-xs text-gray-500">(opcional)</span>
          </label>
          <input
            type="text"
            value={utmTerm}
            onChange={(e) => setUtmTerm(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="tenis-corrida"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Preview da URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔗 URL Gerada:
        </label>
        <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <code className="flex-1 break-all text-sm text-gray-900">
              {finalUrl}
            </code>
            <button
              onClick={handleCopy}
              disabled={!isValid}
              className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Copiado!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  Copiar
                </span>
              )}
            </button>
          </div>
        </div>
        {!isValid && (
          <p className="mt-2 text-sm text-amber-600">
            ⚠️ Preencha os campos obrigatórios (Origem, Meio e Campanha)
          </p>
        )}
      </div>

      {/* Próximos Passos */}
      {isValid && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">✅ URL pronta! Próximos passos:</p>
          <ol className="ml-5 list-decimal space-y-1 text-sm text-blue-800">
            <li>Clique em "Copiar" acima</li>
            <li>Abra o Gerenciador de Anúncios (Facebook, Google, etc)</li>
            <li>Cole a URL no campo "URL do site" ou "Link de destino"</li>
            <li>Publique o anúncio</li>
            <li>Acompanhe o ROI em <a href="/ads-dashboard" className="font-semibold underline">Meta Ads Dashboard</a></li>
          </ol>
        </div>
      )}
    </div>
  );
}
