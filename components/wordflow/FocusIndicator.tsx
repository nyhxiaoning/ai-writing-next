'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, X } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';

export default function FocusIndicator() {
  const { isActive, mode, label, startedAt, stopFocus } = useFocusStore();
  const router = useRouter();
  const [elapsed, setElapsed] = useState('');

  // Update elapsed time every second while active
  useEffect(() => {
    if (!isActive || !startedAt) {
      setElapsed('');
      return;
    }

    const tick = () => {
      const diff = Math.floor((Date.now() - startedAt) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, startedAt]);

  if (!isActive || !mode) return null;

  const handleClick = () => {
    const locale = window.location.pathname.split('/')[1] || 'zh';
    router.push(`/${locale}/wordflow/focus`);
  };

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2" role="status" aria-live="polite">
      <button
        onClick={handleClick}
        className="group flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 shadow-lg ring-1 ring-white/20 hover:bg-indigo-700 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
      >
        {/* Animated dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>

        <Clock className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white whitespace-nowrap">
          {label}
        </span>
        {elapsed && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-mono text-white">
            {elapsed}
          </span>
        )}

        {/* Dismiss button — shown on hover to avoid accidental click */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            stopFocus();
          }}
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-white/60 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </span>
      </button>
    </div>
  );
}
