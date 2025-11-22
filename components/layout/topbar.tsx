'use client';

import { usePathname } from 'next/navigation';
import { appNavigation } from '@/lib/navigation';
import { Bell, Search, User } from 'lucide-react';

export function Topbar() {
  const pathname = usePathname();
  const current = appNavigation.find((item) => item.href === pathname)?.name || 'Dashboard';

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{current}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar..."
              className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button className="relative rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600"></span>
          </button>

          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-gray-900">Guilherme</p>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
