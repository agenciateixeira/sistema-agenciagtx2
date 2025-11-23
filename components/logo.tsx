import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = '/', className }: LogoProps) {
  return (
    <Link href={href} className={cn('inline-flex items-center', className)}>
      <Image
        src="/images/logo.png"
        alt="GTX Logo"
        width={120}
        height={40}
        className="object-contain"
        priority
      />
    </Link>
  );
}
