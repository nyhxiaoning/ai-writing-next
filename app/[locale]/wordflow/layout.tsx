'use client';

import { ReactNode } from 'react';
import WordFlowSidebar from '@/components/wordflow/WordFlowSidebar';
import WordFlowTopNav from '@/components/wordflow/WordFlowTopNav';

export default function WordFlowLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <WordFlowSidebar />
      <div className="ml-60 flex min-h-screen flex-col transition-all duration-300">
        <WordFlowTopNav />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
