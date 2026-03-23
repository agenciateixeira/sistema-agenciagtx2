'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { appNavigationSections } from '@/lib/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { AlertsBadge } from '@/components/alerts/alerts-badge';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Estado para controlar seções expandidas/colapsadas
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    0: true, // Dashboard sempre expandido
    1: true, // Meta Ads expandido por padrão
    2: true, // Recuperação expandido
    3: true, // Relatórios expandido
    4: false, // Configurações colapsado por padrão
  });

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:flex lg:translate-x-0',
          isMobileMenuOpen ? 'flex translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="border-b border-gray-200 px-6 py-5">
          <Logo className="text-gray-900" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {appNavigationSections.map((section, sectionIdx) => {
              const isExpanded = expandedSections[sectionIdx] ?? true;
              const hasMultipleItems = section.items.length > 1;

              return (
                <div key={sectionIdx}>
                  {/* Section Header (clicável se tiver múltiplos items) */}
                  {section.section && (
                    <button
                      onClick={() => hasMultipleItems && toggleSection(sectionIdx)}
                      className={cn(
                        'mb-1 flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
                        hasMultipleItems
                          ? 'cursor-pointer text-gray-600 hover:text-gray-900'
                          : 'cursor-default text-gray-500'
                      )}
                    >
                      <span>{section.section}</span>
                      {hasMultipleItems && (
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200',
                            isExpanded ? 'rotate-0' : '-rotate-90'
                          )}
                        />
                      )}
                    </button>
                  )}

                  {/* Section Items com animação de colapso */}
                  <div
                    className={cn(
                      'space-y-0.5 overflow-hidden transition-all duration-200',
                      isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    {section.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                            active
                              ? 'bg-gradient-to-r from-brand-50 to-brand-100/50 text-brand-700 shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          )}
                          title={item.description}
                        >
                          <item.icon
                            className={cn(
                              'h-5 w-5 flex-shrink-0 transition-colors',
                              active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'
                            )}
                          />
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.showBadge && <AlertsBadge />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-900">Workspace Status</p>
                <p className="mt-1 text-xs text-gray-600">Banco conectado</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-brand-600" />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand-600"></div>
              <span className="text-xs font-medium text-gray-700">Plano GTX Elite</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
