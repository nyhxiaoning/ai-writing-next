'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Copy, Book, Plus, Pencil, X, Loader2, Check,
  Sparkles, AlertCircle,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  description?: string;
  genre?: string;
  type: string;
  content: string;
  isOfficial: boolean;
  usageCount: number;
  likes: number;
}

interface ModalState {
  open: boolean;
  mode: 'create' | 'edit';
  template?: Template;
}

const GENRES = ['', 'xianxia', 'urban', 'sci_fi', 'wuxia', 'fantasy', 'horror', 'romance', 'life'];
const TYPES = ['', 'outline', 'character_setting', 'world_setting', 'chapter', 'story_bible'];

// ─── Page ──────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const t = useTranslations('WordFlow.templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGenre, setFilterGenre] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create' });
  const [seedMessage, setSeedMessage] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formFields = {
    name: modal.mode === 'create' ? '' : modal.template?.name || '',
    description: modal.mode === 'create' ? '' : modal.template?.description || '',
    genre: modal.mode === 'create' ? '' : modal.template?.genre || '',
    type: modal.mode === 'create' ? 'outline' : modal.template?.type || 'outline',
    content: modal.mode === 'create' ? '' : modal.template?.content || '',
  };

  const fetchTemplates = useCallback(async (genre: string, type: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (genre) params.set('genre', genre);
      if (type) params.set('type', type);
      const r = await fetch(`/api/wordflow/templates?${params}`);
      if (r.ok) {
        const data = await r.json();
        setTemplates(data.templates || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates(filterGenre, filterType);
  }, [filterGenre, filterType, fetchTemplates]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage('');
    try {
      const r = await fetch('/api/wordflow/templates/seed', { method: 'POST' });
      const data = await r.json();
      setSeedMessage(data.message || data.error || '完成');
      fetchTemplates(filterGenre, filterType);
    } catch {
      setSeedMessage('导入失败');
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMessage(''), 4000);
    }
  };

  const handleSave = async (formData: any) => {
    if (!formData.name?.trim() || !formData.content?.trim()) {
      setError('名称和内容不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = '/api/wordflow/templates';
      const method = modal.mode === 'create' ? 'POST' : 'PUT';
      const body = modal.mode === 'edit'
        ? { id: modal.template!.id, ...formData }
        : formData;

      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (r.ok) {
        setModal({ open: false, mode: 'create' });
        fetchTemplates(filterGenre, filterType);
      } else {
        const err = await r.json();
        setError(err.error || '保存失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setSaving(false);
    }
  };

  const handleUseTemplate = async (tmpl: Template) => {
    // Increment usage count
    await fetch('/api/wordflow/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tmpl.id, usageCount: tmpl.usageCount + 1 }),
    });
    // Copy content to clipboard
    try {
      await navigator.clipboard.writeText(tmpl.content);
      alert('模板内容已复制到剪贴板！');
    } catch {
      alert('复制失败，请手动复制');
    }
    fetchTemplates(filterGenre, filterType);
  };

  const openCreate = () => {
    setModal({ open: true, mode: 'create' });
    setError('');
  };

  const openEdit = (tmpl: Template) => {
    setModal({ open: true, mode: 'edit', template: tmpl });
    setError('');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{t('library')}</h2>
        <div className="flex items-center gap-2">
          {templates.length === 0 && !loading && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
            >
              {seeding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              导入示例模板
            </button>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" /> 新建模板
          </button>
        </div>
      </div>

      {/* Seed message */}
      {seedMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          <Check className="h-4 w-4 shrink-0" />
          {seedMessage}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('allGenres')}</option>
          {GENRES.filter(Boolean).map((g) => (
            <option key={g} value={g}>{t(`genre_${g}` as any)}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('allTypes')}</option>
          {TYPES.filter(Boolean).map((tp) => (
            <option key={tp} value={tp}>{t(`type_${tp}` as any)}</option>
          ))}
        </select>
      </div>

      {/* Template list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20">
          <Copy className="mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-gray-500">暂无模板</p>
          <p className="mb-6 text-xs text-gray-400">点击"导入示例模板"添加官方模板，或点击"新建模板"创建自己的模板</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="group relative rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{tmpl.name}</h3>
                <div className="flex items-center gap-1">
                  {tmpl.isOfficial && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {t('official')}
                    </span>
                  )}
                  <button
                    onClick={() => openEdit(tmpl)}
                    className="ml-1 rounded p-1 text-gray-300 opacity-0 hover:bg-gray-100 hover:text-blue-600 group-hover:opacity-100 transition-opacity"
                    title="编辑"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {tmpl.description && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-500">{tmpl.description}</p>
              )}
              <div className="flex items-center gap-2">
                {tmpl.genre && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {t(`genre_${tmpl.genre}` as any)}
                  </span>
                )}
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600">
                  {t(`type_${tmpl.type}` as any)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{tmpl.usageCount} 次使用</span>
                <button
                  onClick={() => handleUseTemplate(tmpl)}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                >
                  <Book className="h-3 w-3" /> {t('useTemplate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (
        <TemplateFormModal
          mode={modal.mode}
          template={modal.template}
          saving={saving}
          error={error}
          onSave={handleSave}
          onClose={() => setModal({ open: false, mode: 'create' })}
          genreLabels={GENRES.filter(Boolean).map((g) => ({
            value: g,
            label: t(`genre_${g}` as any),
          }))}
          typeLabels={TYPES.filter(Boolean).map((tp) => ({
            value: tp,
            label: t(`type_${tp}` as any),
          }))}
        />
      )}
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────

function TemplateFormModal({
  mode, template, saving, error, onSave, onClose, genreLabels, typeLabels,
}: {
  mode: 'create' | 'edit';
  template?: Template;
  saving: boolean;
  error: string;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  genreLabels: { value: string; label: string }[];
  typeLabels: { value: string; label: string }[];
}) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [genre, setGenre] = useState(template?.genre || '');
  const [type, setType] = useState(template?.type || 'outline');
  const [content, setContent] = useState(template?.content || '');

  const handleSubmit = async () => {
    await onSave({ name, description, genre, type, content });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            {mode === 'create' ? '新建模板' : '编辑模板'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">名称 *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="模板名称"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简要描述模板的用途和特点..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">分类</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">不限</option>
                  {genreLabels.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">类型 *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none"
                >
                  {typeLabels.map((tp) => (
                    <option key={tp.value} value={tp.value}>{tp.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">模板内容 *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="编写模板内容，支持 Markdown 格式..."
                rows={12}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim() || !content.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'create' ? '创建' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
