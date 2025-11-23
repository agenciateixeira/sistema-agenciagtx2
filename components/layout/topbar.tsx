'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { appNavigation } from '@/lib/navigation';
import { Bell, Search, User, LogOut, Menu, X } from 'lucide-react';
import { logout } from '../../app/actions/auth';

interface TopbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Topbar({ onMenuToggle, isMobileMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const current = appNavigation.find((item) => item.href === pathname)?.name || 'Dashboard';
  const [showUserMenu, setShowUserMenu] = useState(false);

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{current}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
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

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-gray-900">Guilherme</p>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
