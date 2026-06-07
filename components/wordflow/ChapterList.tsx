'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, FileText, Plus, Trash2, Search, ListTree, BookMarked, Settings2,
  Clock, MapPin, Users, ArrowRight, FileSearch, Sparkles, Loader2, Pencil, Check, X, ChevronDown, ChevronRight,
} from 'lucide-react';

import SettingsPanel from './SettingsPanel';

interface Chapter {
  id: string;
  title: string;
  wordCount: number;
  sortOrder: number;
  status: string;
}

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId?: string;
  onSelect: (chapterId: string) => void;
  onReorder: (chapterIds: string[]) => void;
  onAdd: () => void;
  onDelete: (chapterId: string) => void;
  bookId: string;
}

// ─── Sortable Chapter Item ─────────────────────────────────────
function SortableChapter({ chapter, isActive, onSelect, onDelete }: {
  chapter: Chapter; isActive: boolean; onSelect: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
        isActive ? 'border-blue-300 bg-blue-50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
      } ${isDragging ? 'opacity-50 shadow-lg' : ''}`} onClick={onSelect}>
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-gray-300 hover:text-gray-500" onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-4 w-4" />
      </button>
      <FileText className="h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-700">{chapter.title || '无标题'}</p>
        <p className="text-xs text-gray-400">{chapter.wordCount} 字</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="shrink-0 text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Tab: 搜索 ──────────────────────────────────────────────────
function SearchTab({ bookId, onSelect }: { bookId: string; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ chapterId: string; chapterTitle: string; snippet: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(async () => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/chapters/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {} finally { setSearching(false); }
  }, [bookId, query]);

  useEffect(() => {
    const timer = setTimeout(doSearch, 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索章节内容..." className="w-full rounded-lg border border-gray-200 py-1.5 pl-7 pr-2 text-xs focus:border-blue-400 focus:outline-none" />
      </div>
      {searching && <p className="text-center text-xs text-gray-400"><Loader2 className="inline h-3 w-3 animate-spin" /> 搜索中...</p>}
      {!searching && results.length === 0 && query && <p className="text-center text-xs text-gray-400">无匹配结果</p>}
      {results.map((r, i) => (
        <button key={i} onClick={() => onSelect(r.chapterId)}
          className="w-full rounded-lg border border-gray-100 bg-white p-2 text-left text-xs hover:border-blue-200 hover:bg-blue-50 transition-colors">
          <span className="font-medium text-gray-700">{r.chapterTitle}</span>
          <p className="mt-0.5 line-clamp-2 text-gray-500" dangerouslySetInnerHTML={{
            __html: r.snippet.replace(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), (m) => `<mark class="bg-yellow-200">${m}</mark>`)
          }} />
        </button>
      ))}
      {!query && <p className="py-6 text-center text-xs text-gray-400">输入关键词搜索所有章节</p>}
    </div>
  );
}

// ─── Tab: 大纲（支持多层父子嵌套 + 弹窗）────────────────────────
function OutlineTab({ bookId }: { bookId: string }) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalEditId, setModalEditId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/wordflow/books/${bookId}/outline`);
      if (r.ok) setNodes((await r.json()).nodes || []);
    } catch {} finally { setLoading(false); }
  }, [bookId]);

  useEffect(() => { load(); }, [load]);

  const openCreateModal = (parentId: string | null = null) => {
    setModalTitle('');
    setModalContent('');
    setModalParentId(parentId);
    setModalEditId(null);
    setShowModal(true);
  };

  const openEditModal = (id: string, title: string, content?: string) => {
    setModalTitle(title);
    setModalContent(content || '');
    setModalParentId(null);
    setModalEditId(id);
    setShowModal(true);
  };

  const saveModal = async () => {
    if (!modalTitle.trim()) return;
    if (modalEditId) {
      await fetch(`/api/wordflow/books/${bookId}/outline`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modalEditId, title: modalTitle.trim(), content: modalContent }),
      });
    } else {
      await fetch(`/api/wordflow/books/${bookId}/outline`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: modalTitle.trim(),
          content: modalContent || null,
          parentId: modalParentId,
          sortOrder: 0,
        }),
      });
    }
    setShowModal(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('确定删除此大纲节点及其所有子节点？')) return;
    await fetch(`/api/wordflow/books/${bookId}/outline?id=${id}`, { method: 'DELETE' });
    load();
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Recursive render node
  const renderNode = (node: any, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div key={node.id}>
        <div className={`group flex items-center gap-1 rounded px-2 py-1.5 text-xs hover:bg-gray-50 ${depth > 0 ? 'ml-4 border-l border-gray-100 pl-3' : ''}`}>
          {hasChildren ? (
            <button onClick={() => toggleCollapse(node.id)} className="text-gray-400 shrink-0">
              {collapsed.has(node.id) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          ) : (
            <span className="w-3 shrink-0" />
          )}
          <ListTree className="h-3 w-3 shrink-0 text-blue-400" />
          <span className="flex-1 truncate font-medium text-gray-700">{node.title}</span>
          <button onClick={() => openCreateModal(node.id)} className="hidden shrink-0 text-gray-300 hover:text-green-500 group-hover:block" title="添加子节点">
            <Plus className="h-3 w-3" />
          </button>
          <button onClick={() => openEditModal(node.id, node.title, node.content)} className="hidden shrink-0 text-gray-300 hover:text-blue-500 group-hover:block" title="编辑">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={() => remove(node.id)} className="hidden shrink-0 text-gray-300 hover:text-red-500 group-hover:block" title="删除">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        {hasChildren && !collapsed.has(node.id) && (
          <div className="border-l border-gray-100 ml-2">
            {node.children.map((child: any) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p className="py-6 text-center text-xs text-gray-400"><Loader2 className="inline h-3 w-3 animate-spin" /> 加载中...</p>;

  return (
    <div className="space-y-2">
      {/* Top-level create button */}
      <button onClick={() => openCreateModal(null)}
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 py-2 text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600">
        <Plus className="h-3 w-3" /> 新建根节点
      </button>

      {/* Tree */}
      {nodes.length === 0 && !loading && <p className="py-4 text-center text-xs text-gray-400">暂无大纲节点</p>}
      {nodes.map((node: any) => renderNode(node))}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="w-80 rounded-xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-sm font-medium text-gray-900">
              {modalEditId ? '编辑节点' : modalParentId ? '添加子节点' : '新建根节点'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">标题</label>
                <input value={modalTitle} onChange={(e) => setModalTitle(e.target.value)} autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="节点标题"
                  onKeyDown={(e) => e.key === 'Enter' && saveModal()} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">备注（可选）</label>
                <textarea value={modalContent} onChange={(e) => setModalContent(e.target.value)} rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="节点备注..." />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={saveModal} disabled={!modalTitle.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {modalEditId ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: 六要素（小故事 CRUD）───────────────────────────────────
function SixElementsTab({ bookId }: { bookId: string }) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [editData, setEditData] = useState<Record<string, string>>({
    title: '', time: '', place: '', characters: '', cause: '', process: '', result: '',
  });

  const fields = [
    { key: 'time', label: '时间', icon: Clock }, { key: 'place', label: '地点', icon: MapPin },
    { key: 'characters', label: '人物', icon: Users }, { key: 'cause', label: '起因', icon: Sparkles },
    { key: 'process', label: '经过', icon: ArrowRight }, { key: 'result', label: '结果', icon: BookMarked },
  ];

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/wordflow/notes?bookId=${bookId}&category=six_elements`);
      if (r.ok) setStories((await r.json()).notes || []);
    } catch {} finally { setLoading(false); }
  }, [bookId]);

  useEffect(() => { load(); }, [load]);

  const parseNote = (note: any) => {
    try { return JSON.parse(note.content || '{}'); } catch {
      // Legacy format: parse markdown-style content
      const lines = (note.content || '').split('\n');
      const d: any = { title: note.title, time: '', place: '', characters: '', cause: '', process: '', result: '' };
      lines.forEach((l: string) => { fields.forEach((f) => { if (l.startsWith(`【${f.label}】`)) d[f.key] = l.replace(`【${f.label}】`, ''); }); });
      return d;
    }
  };

  const createStory = async () => {
    if (!newTitle.trim()) return;
    const content = JSON.stringify({ title: newTitle.trim(), time: '', place: '', characters: '', cause: '', process: '', result: '' });
    const r = await fetch('/api/wordflow/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, title: newTitle.trim(), content, category: 'six_elements' }),
    });
    if (r.ok) { setNewTitle(''); load(); }
  };

  const saveStory = async (note: any) => {
    const content = JSON.stringify(editData);
    await fetch(`/api/wordflow/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, title: editData.title, content, category: 'six_elements' }),
    });
    load();
  };

  const deleteStory = async (id: string) => {
    if (!confirm('删除此故事？')) return;
    await fetch(`/api/wordflow/notes?id=${id}`, { method: 'DELETE' });
    if (expandedId === id) setExpandedId(null);
    load();
  };

  const expandStory = (note: any) => {
    if (expandedId === note.id) { setExpandedId(null); return; }
    const d = parseNote(note);
    setEditData({ title: note.title, ...d });
    setExpandedId(note.id);
  };

  if (loading) return <p className="py-6 text-center text-xs text-gray-400"><Loader2 className="inline h-3 w-3 animate-spin" /> 加载中...</p>;

  return (
    <div className="space-y-2">
      {/* Create */}
      <div className="flex gap-1">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="新故事名称..."
          className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs" onKeyDown={(e) => e.key === 'Enter' && createStory()} />
        <button onClick={createStory} className="shrink-0 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Story list */}
      {stories.length === 0 && <p className="py-4 text-center text-xs text-gray-400">暂无故事，创建一个六要素故事</p>}
      {stories.map((note) => {
        const data = parseNote(note);
        const isOpen = expandedId === note.id;
        return (
          <div key={note.id} className="rounded-lg border border-gray-100 bg-white">
            <button onClick={() => expandStory(note)} className="flex w-full items-center gap-1.5 px-2 py-2 text-left text-xs hover:bg-gray-50">
              <BookMarked className="h-3 w-3 shrink-0 text-blue-400" />
              <span className="flex-1 truncate font-medium text-gray-700">{note.title}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteStory(note.id); }} className="text-gray-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              {isOpen ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
            </button>
            {isOpen && (
              <div className="space-y-2 border-t border-gray-100 p-2">
                <input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="故事标题" className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-medium" />
                <div className="grid grid-cols-2 gap-2">
                  {fields.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.key}>
                        <label className="flex items-center gap-0.5 text-[10px] text-gray-500"><Icon className="h-2.5 w-2.5" /> {f.label}</label>
                        <input value={editData[f.key]} onChange={(e) => setEditData({ ...editData, [f.key]: e.target.value })} className="w-full rounded border border-gray-200 px-1.5 py-1 text-[10px]" />
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => saveStory(note)} className="w-full rounded bg-blue-600 py-1 text-[10px] text-white hover:bg-blue-700">
                  保存故事
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ChapterList ───────────────────────────────────────────
export default function ChapterList(props: ChapterListProps) {
  const { chapters, activeChapterId, onSelect, onReorder, onAdd, onDelete, bookId } = props;
  const [tab, setTab] = useState<'chapters' | 'search' | 'outline' | 'elements' | 'settings'>('chapters');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((c) => c.id === active.id);
      const newIndex = chapters.findIndex((c) => c.id === over.id);
      onReorder(arrayMove(chapters, oldIndex, newIndex).map((c) => c.id));
    }
  };

  const tabs = [
    { key: 'chapters' as const, icon: FileText, label: '章节' },
    { key: 'search' as const, icon: Search, label: '搜索' },
    { key: 'outline' as const, icon: ListTree, label: '大纲' },
    { key: 'elements' as const, icon: BookMarked, label: '六要素' },
    { key: 'settings' as const, icon: Settings2, label: '设定' },
  ];

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Tab bar */}
      <div className="flex gap-0.5 rounded-md bg-gray-100 p-0.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1 rounded px-1 py-1 text-[10px] font-medium transition-colors ${
                tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="h-3 w-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'chapters' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-gray-500">章节列表</h3>
              <button onClick={onAdd} className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600 hover:text-blue-700">
                <Plus className="h-3 w-3" /> 新建
              </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {chapters.map((chapter) => (
                  <SortableChapter key={chapter.id} chapter={chapter} isActive={chapter.id === activeChapterId} onSelect={() => onSelect(chapter.id)} onDelete={() => onDelete(chapter.id)} />
                ))}
              </SortableContext>
            </DndContext>
            {chapters.length === 0 && <p className="py-6 text-center text-xs text-gray-400">暂无章节</p>}
          </div>
        )}
        {tab === 'search' && <SearchTab bookId={bookId} onSelect={onSelect} />}
        {tab === 'outline' && <OutlineTab bookId={bookId} />}
        {tab === 'elements' && <SixElementsTab bookId={bookId} />}
        {tab === 'settings' && <SettingsPanel bookId={bookId} />}
      </div>
    </div>
  );
}
