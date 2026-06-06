'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Book, Plus, BookOpen, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface BookData {
  id: string;
  title: string;
  genre?: string;
  description?: string;
  wordGoal?: number;
  status: string;
  chapterCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function WordFlowDashboard() {
  const t = useTranslations('WordFlow');
  const bt = useTranslations('WordFlow.books');
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', genre: '', description: '', wordGoal: '' });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/wordflow/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (e) {
      console.error('Failed to fetch books', e);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async () => {
    if (!formData.title.trim()) return;
    try {
      const res = await fetch('/api/wordflow/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          genre: formData.genre || undefined,
          description: formData.description || undefined,
          wordGoal: formData.wordGoal ? parseInt(formData.wordGoal) : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowModal(false);
        setFormData({ title: '', genre: '', description: '', wordGoal: '' });
        router.push(`/${locale}/wordflow/studio/${data.book.id}`);
      }
    } catch (e) {
      console.error('Failed to create book', e);
    }
  };

  const totalWords = 0; // TODO: sum from chapters
  const ongoingBooks = books.filter((b) => b.status === 'ongoing').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Book className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{bt('totalBooks')}</p>
              <p className="text-2xl font-bold text-gray-900">{books.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{bt('totalWords')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalWords.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{bt('status_ongoing')}</p>
              <p className="text-2xl font-bold text-gray-900">{ongoingBooks}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{bt('chapterCount')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.reduce((sum, b) => sum + (b.chapterCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Book list */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{bt('myBooks')}</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {bt('newBook')}
        </button>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20">
          <Book className="mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-4 text-gray-500">{bt('noBooks')}</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {bt('newBook')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/${locale}/wordflow/studio/${book.id}`}
              className="group rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{book.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  book.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                  book.status === 'finished' ? 'bg-blue-100 text-blue-700' :
                  book.status === 'archived' ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {bt(`status_${book.status}` as any)}
                </span>
              </div>
              {book.description && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-500">{book.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {book.genre && <span>{book.genre}</span>}
                {book.chapterCount !== undefined && <span>{book.chapterCount} {bt('chapterCount')}</span>}
                <span className="ml-auto">{bt('lastEdited')}: {new Date(book.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create book modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{bt('newBook')}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('bookForm.title')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('bookForm.titlePlaceholder')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('bookForm.genre')}</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">{t('bookForm.selectGenre')}</option>
                  <option value="xianxia">{t('templates.genre_xianxia')}</option>
                  <option value="urban">{t('templates.genre_urban')}</option>
                  <option value="sci_fi">{t('templates.genre_sci_fi')}</option>
                  <option value="wuxia">{t('templates.genre_wuxia')}</option>
                  <option value="fantasy">{t('templates.genre_fantasy')}</option>
                  <option value="horror">{t('templates.genre_horror')}</option>
                  <option value="romance">{t('templates.genre_romance')}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('bookForm.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('bookForm.descriptionPlaceholder')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('bookForm.wordGoal')}</label>
                <input
                  type="number"
                  value={formData.wordGoal}
                  onChange={(e) => setFormData({ ...formData, wordGoal: e.target.value })}
                  placeholder="50000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('bookForm.cancel')}
              </button>
              <button
                onClick={createBook}
                disabled={!formData.title.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {t('bookForm.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
