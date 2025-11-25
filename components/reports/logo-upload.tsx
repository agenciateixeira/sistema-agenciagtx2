'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Building2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface LogoUploadProps {
  userId: string;
  currentLogoUrl?: string | null;
  currentCompanyName?: string | null;
}

export function LogoUpload({ userId, currentLogoUrl, currentCompanyName }: LogoUploadProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);
  const [companyName, setCompanyName] = useState(currentCompanyName || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações no cliente
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PNG, JPG ou SVG.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 2MB');
      return;
    }

    // Upload
    setIsUploading(true);
    const toastId = toast.loading('Enviando logo...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (companyName) {
        formData.append('company_name', companyName);
      }

      const response = await fetch('/api/profile/report-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      setLogoUrl(data.logo_url);
      toast.success('Logo enviada com sucesso!', { id: toastId });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Erro ao enviar logo', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    setIsDeleting(true);
    const toastId = toast.loading('Removendo logo...');

    try {
      const response = await fetch('/api/profile/report-logo', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover logo');
      }

      setLogoUrl(null);
      toast.success('Logo removida com sucesso!', { id: toastId });
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast.error(error.message || 'Erro ao remover logo', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateCompanyName = async () => {
    if (!companyName.trim()) {
      toast.error('Digite o nome da empresa');
      return;
    }

    const toastId = toast.loading('Atualizando...');

    try {
      // Re-upload with new company name (will keep same logo)
      if (logoUrl) {
        const response = await fetch('/api/profile/report-logo', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_name: companyName }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar nome da empresa');
        }
      }

      toast.success('Nome da empresa atualizado!', { id: toastId });
    } catch (error: any) {
      console.error('Error updating company name:', error);
      toast.error(error.message || 'Erro ao atualizar', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Name Input */}
      <div>
        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
          Nome da Empresa/Agência
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Agência GTX"
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleUpdateCompanyName}
            disabled={!companyName.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Este nome aparecerá nos relatórios gerados
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo para Relatórios
        </label>

        {logoUrl ? (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative inline-block rounded-lg border-2 border-gray-200 bg-white p-4">
              <div className="relative h-24 w-48">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <button
                onClick={handleRemoveLogo}
                disabled={isDeleting}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Remover logo"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </div>

            {/* Upload New */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Trocar Logo
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-sm font-medium text-gray-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Clique para fazer upload da logo
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG ou SVG. Máximo 2MB.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
