'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Book } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  genre?: string;
}

export default function WorldPage() {
  const t = useTranslations('WordFlow');
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';

  useEffect(() => {
    fetch('/api/wordflow/books')
      .then((r) => r.json())
      .then((data) => setBooks(data.books || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20">
        <Book className="mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">{t('books.noBooks')}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">{t('world.factions')}</h2>
      <p className="mb-6 text-sm text-gray-500">请选择要编辑设定库的作品</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/${locale}/wordflow/world/${book.id}`}
            className="rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <h3 className="font-semibold text-gray-900">{book.title}</h3>
            {book.genre && (
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                {book.genre}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
