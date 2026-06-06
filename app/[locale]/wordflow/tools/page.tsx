'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { TreePine, BarChart3, Replace, Wand2 } from 'lucide-react';

export default function ToolsPage() {
  const t = useTranslations('WordFlow.tools');
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';
  const [books, setBooks] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wordflow/books')
      .then((r) => r.json())
      .then((data) => setBooks(data.books || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tools = [
    { key: 'outline' as const, icon: TreePine, color: 'text-emerald-600 bg-emerald-100', desc: '拖拽式节点搭建全书大纲' },
    { key: 'analysis' as const, icon: BarChart3, color: 'text-blue-600 bg-blue-100', desc: '写作数据统计与分析' },
    { key: 'batchReplace' as const, icon: Replace, color: 'text-purple-600 bg-purple-100', desc: '批量角色名/地名替换' },
    { key: 'aiTools' as const, icon: Wand2, color: 'text-amber-600 bg-amber-100', desc: 'AI 辅助创作工具' },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">工具箱</h2>
      <p className="mb-6 text-sm text-gray-500">选择作品后使用工具</p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20">
          <p className="text-gray-500">还没有作品</p>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="font-medium text-gray-900">{book.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const href =
                    tool.key === 'aiTools'
                      ? `/${locale}/wordflow/ai`
                      : `/${locale}/wordflow/tools/${tool.key}/${book.id}`;
                  return (
                    <Link
                      key={tool.key}
                      href={href}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tool.color} hover:opacity-80`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t(tool.key as any)}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
