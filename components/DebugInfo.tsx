'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function DebugInfo() {
  const locale = useLocale();
  const pathname = usePathname();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs z-50">
      <div>Locale: {locale}</div>
      <div>Pathname: {pathname}</div>
      <div>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
    </div>
  );
}