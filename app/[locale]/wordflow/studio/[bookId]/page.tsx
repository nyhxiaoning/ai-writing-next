'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ChapterList from '@/components/wordflow/ChapterList';
import GitHubSyncModal from '@/components/wordflow/GitHubSyncModal';
import AIRewritePanel from '@/components/wordflow/AIRewritePanel';
import RhythmAnalysisPanel from '@/components/wordflow/RhythmAnalysisPanel';
import AIChatDialog from '@/components/wordflow/AIChatDialog';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Save, Clock, History, Upload, Loader2, Wand2, BarChart3 } from 'lucide-react';

// Dynamic import to avoid SSR issues
const ChapterEditor = dynamic(() => import('@/components/wordflow/ChapterEditor'), { ssr: false });

interface Book {
  id: string;
  title: string;
  genre?: string;
  status: string;
  wordGoal?: number;
  chapters: ChapterItem[];
}

interface ChapterItem {
  id: string;
  title: string;
  wordCount: number;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ChapterContent {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

export default function StudioPage() {
  const t = useTranslations('WordFlow');
  const st = useTranslations('WordFlow.studio');
  const params = useParams();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [rightTab, setRightTab] = useState<'history' | 'rewrite' | 'analysis' | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const router = useRouter();
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';
  const [syncing, setSyncing] = useState(false);
  const [syncConfig, setSyncConfig] = useState<any>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch book data
  const fetchBook = useCallback(async () => {
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}`);
      if (res.status === 401) {
        router.push(`/${locale}/auth/signin`);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBook(data.book);
        setChapters(data.book.chapters || []);
        // Auto-select first chapter
        if (data.book.chapters?.length > 0 && !activeChapterId) {
          setActiveChapterId(data.book.chapters[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch book', e);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  // Fetch sync config
  const fetchSyncConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/sync`);
      if (res.ok) {
        const data = await res.json();
        setSyncConfig(data.config);
      }
    } catch (e) {
      console.error('Failed to fetch sync config', e);
    }
  }, [bookId]);

  // Fetch chapter content
  const fetchChapterContent = useCallback(async (chapterId: string) => {
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/chapters/${chapterId}`);
      if (res.ok) {
        const data = await res.json();
        setChapterContent(data.chapter);
      }
    } catch (e) {
      console.error('Failed to fetch chapter', e);
    }
  }, [bookId]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        await checkAuth();
      }
      if (useAuthStore.getState().isAuthenticated) {
        fetchBook();
        fetchSyncConfig();
      } else {
        setLoading(false);
        setAuthChecked(true);
      }
    };
    init();
  }, [fetchBook, fetchSyncConfig]);

  // Load chapter content when switching
  useEffect(() => {
    if (activeChapterId) {
      fetchChapterContent(activeChapterId);
      setSaveStatus('idle');
    }
  }, [activeChapterId, fetchChapterContent]);

  // Debounced auto-save
  const saveChapter = useCallback(async (title: string, content: string) => {
    if (!activeChapterId) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/chapters/${activeChapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        // Update chapter list word count
        const contentText = content.replace(/<[^>]*>/g, '');
        setChapters((prev) =>
          prev.map((c) =>
            c.id === activeChapterId ? { ...c, wordCount: contentText.length } : c
          )
        );
      }
    } catch (e) {
      console.error('Save failed', e);
      setSaveStatus('idle');
    }
  }, [activeChapterId, bookId]);

  const handleContentChange = useCallback(
    (html: string) => {
      if (!chapterContent) return;
      setChapterContent((prev) => (prev ? { ...prev, content: html } : prev));

      // Debounced auto-save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveChapter(chapterContent.title, html);
      }, 2000);
    },
    [chapterContent, saveChapter]
  );

  const handleAddChapter = async () => {
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `第 ${chapters.length + 1} 章` }),
      });
      if (res.ok) {
        const data = await res.json();
        setChapters((prev) => [...prev, data.chapter]);
        setActiveChapterId(data.chapter.id);
      }
    } catch (e) {
      console.error('Failed to add chapter', e);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm(st('deleteChapter'))) return;
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChapters((prev) => prev.filter((c) => c.id !== chapterId));
        if (activeChapterId === chapterId) {
          setActiveChapterId(null);
          setChapterContent(null);
        }
      }
    } catch (e) {
      console.error('Failed to delete chapter', e);
    }
  };

  const handleReorder = async (chapterIds: string[]) => {
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/chapters/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterIds }),
      });
      if (res.ok) {
        setChapters((prev) =>
          chapterIds.map((id, i) => {
            const ch = prev.find((c) => c.id === id)!;
            return { ...ch, sortOrder: i };
          })
        );
      }
    } catch (e) {
      console.error('Failed to reorder', e);
    }
  };

  const handleFetchVersions = async () => {
    if (!activeChapterId) return;
    try {
      const res = await fetch(
        `/api/wordflow/books/${bookId}/chapters/${activeChapterId}/versions`
      );
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (e) {
      console.error('Failed to fetch versions', e);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/sync/sync-now`, {
        method: 'POST',
      });
      if (res.ok) {
        // Refresh sync config to get updated lastSyncedAt
        await fetchSyncConfig();
      }
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncConfigSaved = () => {
    fetchSyncConfig();
  };

  // If auth checked and not authenticated, show message that will redirect
  if (authChecked && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-gray-500 mb-4">请先登录后访问写作台</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        作品不存在
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left: Chapter list */}
      <div className="w-64 shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
        <ChapterList
          chapters={chapters}
          activeChapterId={activeChapterId || undefined}
          onSelect={setActiveChapterId}
          onReorder={handleReorder}
          onAdd={handleAddChapter}
          onDelete={handleDeleteChapter}
          bookId={bookId}
        />
      </div>

      {/* Center: Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chapter header */}
        {chapterContent && (
          <div className="mb-3 flex items-center justify-between">
            <input
              type="text"
              value={chapterContent.title}
              onChange={(e) =>
                setChapterContent((prev) => (prev ? { ...prev, title: e.target.value } : prev))
              }
              onBlur={() => saveChapter(chapterContent.title, chapterContent.content)}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 flex-1 min-w-0 mr-4"
              placeholder={st('chapterTitlePlaceholder')}
            />
            <div className="flex items-center gap-3 shrink-0">
              {/* Save status with time */}
              <span className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {st('saving')}
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Save className="h-3 w-3 text-green-500" />
                    {st('saved')}
                    {lastSavedAt && (
                      <span className="text-gray-400"> {lastSavedAt.toLocaleTimeString()}</span>
                    )}
                  </>
                )}
                {saveStatus === 'idle' && lastSavedAt && (
                  <>
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{lastSavedAt.toLocaleTimeString()}</span>
                  </>
                )}
              </span>

              {/* GitHub Sync button */}
              {syncConfig && (
                <button
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  title={syncConfig.lastSyncedAt ? `上次同步: ${new Date(syncConfig.lastSyncedAt).toLocaleString()}` : '同步到 GitHub'}
                >
                  {syncing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  同步
                </button>
              )}
              <button
                onClick={() => setShowSyncModal(true)}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
              >
                <Upload className="h-3.5 w-3.5" />
                {syncConfig ? '同步设置' : 'GitHub 同步'}
              </button>

              {/* Right panel toggles */}
              <button
                onClick={() => {
                  const next = rightTab === 'history' ? null : 'history';
                  setRightTab(next);
                  if (next === 'history') handleFetchVersions();
                }}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  rightTab === 'history'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                {st('versionHistory')}
              </button>
              <button
                onClick={() => setRightTab(rightTab === 'rewrite' ? null : 'rewrite')}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  rightTab === 'rewrite'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                AI 改写
              </button>
              <button
                onClick={() => setRightTab(rightTab === 'analysis' ? null : 'analysis')}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  rightTab === 'analysis'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                节奏分析
              </button>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          {chapterContent ? (
            <ChapterEditor
              content={chapterContent.content}
              onChange={handleContentChange}
              placeholder="开始写作..."
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="mb-2 text-lg">选择或创建一个章节开始写作</p>
                <button
                  onClick={handleAddChapter}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  创建第一个章节
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Tabbed panel (History / AI Rewrite / Rhythm Analysis) */}
      {rightTab && (
        <div className="w-72 shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
          {/* Tab bar */}
          <div className="mb-3 flex gap-1 rounded-md bg-gray-100 p-0.5">
            {(['history', 'rewrite', 'analysis'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setRightTab(rightTab === tab ? null : tab);
                  if (tab === 'history') handleFetchVersions();
                }}
                className={`flex-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                  rightTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'history' ? st('versionHistory') : tab === 'rewrite' ? 'AI 改写' : '节奏分析'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {rightTab === 'history' && (
            <>
              {versions.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">暂无历史版本</p>
              ) : (
                <div className="space-y-2">
                  {versions.map((v: any, i: number) => (
                    <div key={v.id} className="rounded-lg border border-gray-100 p-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">v{versions.length - i}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{v.wordCount} 字</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {rightTab === 'rewrite' && (
            <AIRewritePanel
              chapterContent={chapterContent?.content}
              onInsert={(html) => {
                if (chapterContent) {
                  handleContentChange(html);
                }
              }}
            />
          )}
          {rightTab === 'analysis' && (
            <RhythmAnalysisPanel chapterId={activeChapterId || undefined} bookId={bookId} />
          )}
        </div>
      )}

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        open={showSyncModal}
        bookId={bookId}
        config={syncConfig}
        onClose={() => setShowSyncModal(false)}
        onSaved={handleSyncConfigSaved}
      />

      {/* AI Chat Dialog */}
      <AIChatDialog bookId={bookId} />
    </div>
  );
}
