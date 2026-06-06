'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function WordFlowTopNav() {
  const t = useTranslations('WordFlow');
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const user = useAuthStore((s) => s.user);

  // Build breadcrumbs from path
  const segments = pathname
    .replace(`/${locale}/wordflow`, '')
    .split('/')
    .filter(Boolean);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/${locale}/wordflow`} className="hover:text-gray-700">
          <Home className="h-4 w-4" />
        </Link>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${locale}/wordflow/${segments.slice(0, index + 1).join('/')}`;
          return (
            <span key={segment} className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3" />
              {isLast ? (
                <span className="font-medium text-gray-900 capitalize">{decodeURIComponent(segment)}</span>
              ) : (
                <Link href={href} className="capitalize hover:text-gray-700">
                  {decodeURIComponent(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      {/* User info */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-gray-600">
            {user.name}
          </span>
        )}
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
