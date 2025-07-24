'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomeNav() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <div className="w-full flex items-center p-4 bg-white/80 sticky top-0 z-50 shadow-sm">
      <Link href="/" className="text-orange-600 font-bold text-lg hover:underline">
        Home
      </Link>
    </div>
  );
} 