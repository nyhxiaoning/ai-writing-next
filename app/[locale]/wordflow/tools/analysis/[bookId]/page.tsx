'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { BarChart3, Book, TrendingUp } from 'lucide-react';

interface AnalysisData {
  totalWords: number;
  chapterCount: number;
  avgChapterLength: number;
  chapters: { wordCount: number; createdAt: string }[];
}

export default function AnalysisPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wordflow/books/${bookId}/analysis`)
      .then((r) => r.json())
      .then((result) => setData(result.analysis))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) return <div className="py-10 text-center text-gray-400">加载中...</div>;
  if (!data) return <div className="py-10 text-center text-gray-400">暂无数据</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">写作分析</h2>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <Book className="h-5 w-5" />
            <span className="text-sm text-gray-500">总字数</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.totalWords.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm text-gray-500">章节数</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.chapterCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm text-gray-500">平均每章</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.avgChapterLength.toLocaleString()}</p>
        </div>
      </div>

      {/* Chapter word count chart */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-gray-700">章节字数分布</h3>
        <div className="flex items-end gap-2">
          {data.chapters.map((ch, i) => {
            const maxWords = Math.max(...data.chapters.map((c) => c.wordCount), 1);
            const height = (ch.wordCount / maxWords) * 200;
            return (
              <div key={i} className="group relative flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                  style={{ height: `${Math.max(height, 4)}px` }}
                />
                <span className="mt-1 text-[10px] text-gray-400">{i + 1}</span>
                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                  {ch.wordCount.toLocaleString()} 字
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
