import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = '/', className }: LogoProps) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-3', className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
        <span className="text-xl font-bold text-white">G</span>
      </div>
      <div className="leading-tight">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">GTX</p>
        <p className="text-sm font-semibold text-gray-900">Sistema</p>
      </div>
    </Link>
  );
}
