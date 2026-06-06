'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  PenSquare,
  Globe,
  Clock,
  Wrench,
  Sparkles,
  Users,
  Copy,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { key: 'studio', href: '/wordflow', icon: PenSquare },
  { key: 'world', href: '/wordflow/world', icon: Globe },
  { key: 'focus', href: '/wordflow/focus', icon: Clock },
  { key: 'tools', href: '/wordflow/tools', icon: Wrench },
  { key: 'ai', href: '/wordflow/ai', icon: Sparkles },
  { key: 'community', href: '/wordflow/community', icon: Users },
  { key: 'templates', href: '/wordflow/templates', icon: Copy },
];

export default function WordFlowSidebar() {
  const t = useTranslations('WordFlow.sidebar');
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    const actualPath = pathname.replace(`/${locale}`, '') || '/';
    if (href === '/wordflow') {
      return actualPath === '/wordflow' || actualPath.startsWith('/wordflow/studio');
    }
    return actualPath.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-slate-900 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        {collapsed ? (
          <span className="text-xl font-bold text-blue-400">W</span>
        ) : (
          <Link href={`/${locale}/wordflow`} className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-400">W</span>
            <span className="text-lg font-semibold">{t('studio').includes('Writing') ? 'WordFlow' : '码流'}</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = `/${locale}${item.href}`;
            return (
              <li key={item.key}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  title={collapsed ? t(item.key) : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{t(item.key)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-700 p-2">
        <Link
          href={`/${locale}/dashboard`}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'text-slate-300 hover:bg-slate-800 hover:text-white'
          )}
          title={collapsed ? t('backToDashboard') : undefined}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t('backToDashboard')}</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-400 hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
