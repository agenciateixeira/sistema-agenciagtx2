'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appNavigation } from '@/lib/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 hidden w-64 flex-col border-r border-gray-200 bg-white px-6 py-6 lg:flex">
      <div className="mb-8">
        <Logo className="text-gray-900" />
      </div>

      <nav className="flex-1 space-y-1">
        {appNavigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('h-5 w-5', active ? 'text-brand-600' : 'text-gray-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-900">Workspace Status</p>
            <p className="mt-1 text-xs text-gray-600">Supabase conectado</p>
          </div>
          <ShieldCheck className="h-4 w-4 text-brand-600" />
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-brand-600"></div>
          <span className="text-xs font-medium text-gray-700">Plano GTX Elite</span>
        </div>
      </div>
    </aside>
  );
}
