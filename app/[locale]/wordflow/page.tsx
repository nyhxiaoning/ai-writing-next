'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Book, Plus, BookOpen, FileText, TrendingUp, Upload, Download, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';
import GitHubSyncModal from '@/components/wordflow/GitHubSyncModal';

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

interface SyncConfig {
  id?: string;
  githubOwner: string;
  githubRepo: string;
  githubPath: string;
  lastSyncedAt?: string | null;
}

export default function WordFlowDashboard() {
  const t = useTranslations('WordFlow');
  const bt = useTranslations('WordFlow.books');
  const router = useRouter();
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<{ title: string; genre: string; description: string; wordGoal: string; otherGenre: string }>({ title: '', genre: '', description: '', wordGoal: '', otherGenre: '' });
  const [error, setError] = useState('');
  const [syncConfigs, setSyncConfigs] = useState<Record<string, SyncConfig>>({});
  const [syncingBooks, setSyncingBooks] = useState<Record<string, 'push' | 'pull' | null>>({});
  const [syncMessages, setSyncMessages] = useState<Record<string, string>>({});
  const [syncModalBookId, setSyncModalBookId] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    fetchBooks();
  }, []);

  const handle401 = () => {
    setLoading(false);
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/wordflow/books');
      if (res.status === 401) {
        handle401();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
        setTotalWords(data.totalWords ?? 0);
        // Fetch sync configs for all books
        if (data.books?.length > 0) {
          fetchSyncConfigs(data.books);
        }
      }
    } catch (e) {
      console.error('Failed to fetch books', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncConfigs = async (bookList: BookData[]) => {
    const results: Record<string, SyncConfig> = {};
    await Promise.all(
      bookList.map(async (book) => {
        try {
          const res = await fetch(`/api/wordflow/books/${book.id}/sync`);
          if (res.ok) {
            const data = await res.json();
            if (data.config) results[book.id] = data.config;
          }
        } catch {}
      })
    );
    setSyncConfigs(results);
  };

  const handleSyncPush = async (bookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSyncingBooks((prev) => ({ ...prev, [bookId]: 'push' }));
    setSyncMessages((prev) => ({ ...prev, [bookId]: '' }));
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/sync/sync-now`, {
        method: 'POST',
      });
      if (res.ok) {
        setSyncMessages((prev) => ({ ...prev, [bookId]: '推送成功' }));
      } else {
        const err = await res.json();
        setSyncMessages((prev) => ({ ...prev, [bookId]: err.error || '推送失败' }));
      }
    } catch {
      setSyncMessages((prev) => ({ ...prev, [bookId]: '网络错误' }));
    } finally {
      setSyncingBooks((prev) => ({ ...prev, [bookId]: null }));
      setTimeout(() => setSyncMessages((prev) => { const n = { ...prev }; delete n[bookId]; return n; }), 3000);
    }
  };

  const handleSyncPull = async (bookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSyncingBooks((prev) => ({ ...prev, [bookId]: 'pull' }));
    setSyncMessages((prev) => ({ ...prev, [bookId]: '' }));
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/sync/sync-pull`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        const stats = data.stats || {};
        const parts: string[] = [];
        if (stats.imported > 0) parts.push(`导入 ${stats.imported} 章`);
        if (stats.updated > 0) parts.push(`更新 ${stats.updated} 章`);
        setSyncMessages((prev) => ({ ...prev, [bookId]: `拉取成功${parts.length ? '（' + parts.join('，') + '）' : ''}` }));
        // Refresh book list
        fetchBooks();
      } else {
        const err = await res.json();
        setSyncMessages((prev) => ({ ...prev, [bookId]: err.error || '拉取失败' }));
      }
    } catch {
      setSyncMessages((prev) => ({ ...prev, [bookId]: '网络错误' }));
    } finally {
      setSyncingBooks((prev) => ({ ...prev, [bookId]: null }));
      setTimeout(() => setSyncMessages((prev) => { const n = { ...prev }; delete n[bookId]; return n; }), 4000);
    }
  };

  const [syncingAll, setSyncingAll] = useState<'push' | 'pull' | null>(null);
  const [batchSyncMessage, setBatchSyncMessage] = useState('');

  const handleBatchPush = async () => {
    const configuredBooks = Object.keys(syncConfigs);
    if (configuredBooks.length === 0) {
      setBatchSyncMessage('请先在作品上配置 GitHub 同步（点击齿轮图标）');
      setTimeout(() => setBatchSyncMessage(''), 4000);
      return;
    }
    setSyncingAll('push');
    setBatchSyncMessage('');
    let success = 0;
    let fail = 0;
    for (const bookId of configuredBooks) {
      try {
        const res = await fetch(`/api/wordflow/books/${bookId}/sync/sync-now`, { method: 'POST' });
        if (res.ok) success++; else fail++;
      } catch { fail++; }
    }
    setSyncingAll(null);
    setBatchSyncMessage(`✓ 推送完成：成功 ${success} 个${fail > 0 ? `，失败 ${fail} 个` : ''}`);
    setTimeout(() => setBatchSyncMessage(''), 5000);
  };

  const handleBatchPull = async () => {
    const configuredBooks = Object.keys(syncConfigs);
    if (configuredBooks.length === 0) {
      setBatchSyncMessage('请先在作品上配置 GitHub 同步（点击齿轮图标）');
      setTimeout(() => setBatchSyncMessage(''), 4000);
      return;
    }
    setSyncingAll('pull');
    setBatchSyncMessage('');
    let success = 0;
    let fail = 0;
    for (const bookId of configuredBooks) {
      try {
        const res = await fetch(`/api/wordflow/books/${bookId}/sync/sync-pull`, { method: 'POST' });
        if (res.ok) success++; else fail++;
      } catch { fail++; }
    }
    setSyncingAll(null);
    if (success > 0) fetchBooks();
    setBatchSyncMessage(`✓ 拉取完成：成功 ${success} 个${fail > 0 ? `，失败 ${fail} 个` : ''}`);
    setTimeout(() => setBatchSyncMessage(''), 5000);
  };

  const createBook = async () => {
    if (!formData.title.trim()) return;
    const finalGenre = formData.genre === 'other' ? formData.otherGenre.trim() : formData.genre;
    if (formData.genre === 'other' && !finalGenre) return;
    setError('');
    try {
      const res = await fetch('/api/wordflow/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          genre: finalGenre || undefined,
          description: formData.description || undefined,
          wordGoal: formData.wordGoal ? parseInt(formData.wordGoal) : undefined,
        }),
      });
      if (res.status === 401) {
        handle401();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setShowModal(false);
        setFormData({ title: '', genre: '', description: '', wordGoal: '', otherGenre: '' });
        router.push(`/${locale}/wordflow/studio/${data.book.id}`);
      } else {
        const errData = await res.json();
        setError(errData.error || '创建失败');
      }
    } catch (e) {
      console.error('Failed to create book', e);
      setError('网络错误，请稍后重试');
    }
  };

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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={handleBatchPull}
              disabled={!!syncingAll}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="从 GitHub 批量拉取所有已配置同步的作品"
            >
              {syncingAll === 'pull' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              同步拉取
            </button>
            <button
              onClick={handleBatchPush}
              disabled={!!syncingAll}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="将作品批量推送到 GitHub"
            >
              {syncingAll === 'push' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              同步推送
            </button>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {bt('newBook')}
          </button>
        </div>
      </div>

      {batchSyncMessage && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${
          batchSyncMessage.startsWith('✓') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {batchSyncMessage}
        </div>
      )}

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
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={(e) => handleSyncPull(book.id, e)}
                    disabled={syncingBooks[book.id] === 'pull' || syncingBooks[book.id] === 'push'}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-40 transition-colors"
                    title="从 GitHub 拉取更新"
                  >
                    {syncingBooks[book.id] === 'pull' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    拉取
                  </button>
                  <button
                    onClick={(e) => handleSyncPush(book.id, e)}
                    disabled={syncingBooks[book.id] === 'pull' || syncingBooks[book.id] === 'push'}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-green-600 disabled:opacity-40 transition-colors"
                    title="推送到 GitHub"
                  >
                    {syncingBooks[book.id] === 'push' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    推送
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSyncModalBookId(book.id); }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="配置 GitHub 同步"
                  >
                    <Settings className="h-3 w-3" />
                  </button>
                  <span className="text-gray-400">{bt('lastEdited')}: {new Date(book.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              {syncMessages[book.id] && (
                <div className={`mt-2 text-xs ${
                  syncMessages[book.id].includes('成功') ? 'text-green-600' : 'text-red-500'
                }`}>
                  {syncMessages[book.id]}
                </div>
              )}
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
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}
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
                  <option value="other">{t('bookForm.genreOther')}</option>
                </select>
                {formData.genre === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={formData.otherGenre}
                      onChange={(e) => setFormData({ ...formData, otherGenre: e.target.value })}
                      placeholder={t('bookForm.genreOtherPlaceholder')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                )}
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

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        open={!!syncModalBookId}
        bookId={syncModalBookId || ''}
        config={syncModalBookId ? (syncConfigs[syncModalBookId] || null) as SyncConfig | null : null}
        onClose={() => setSyncModalBookId(null)}
        onSaved={() => { setSyncModalBookId(null); fetchSyncConfigs(books); }}
      />
    </div>
  );
}
