'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appNavigationSections } from '@/lib/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import { AlertsBadge } from '@/components/alerts/alerts-badge';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

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
          <div className="space-y-6">
            {appNavigationSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {/* Section Label */}
                {section.section && (
                  <div className="mb-2 px-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {section.section}
                    </h3>
                  </div>
                )}

                {/* Section Items */}
                <div className="space-y-0.5">
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
            ))}
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
