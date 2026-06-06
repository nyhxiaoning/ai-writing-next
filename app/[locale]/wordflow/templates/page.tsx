'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Book, Search } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description?: string;
  genre?: string;
  type: string;
  isOfficial: boolean;
  usageCount: number;
  likes: number;
}

export default function TemplatesPage() {
  const t = useTranslations('WordFlow.templates');
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGenre, setFilterGenre] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterGenre) params.set('genre', filterGenre);
    if (filterType) params.set('type', filterType);
    fetch(`/api/wordflow/templates?${params}`)
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterGenre, filterType]);

  const genres = ['', 'xianxia', 'urban', 'sci_fi', 'wuxia', 'fantasy', 'horror', 'romance'];
  const types = ['', 'outline', 'character_setting', 'world_setting', 'chapter', 'story_bible'];

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">{t('library')}</h2>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('allGenres')}</option>
          {genres.filter(Boolean).map((g) => (
            <option key={g} value={g}>{t(`genre_${g}` as any)}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('allTypes')}</option>
          {types.filter(Boolean).map((tp) => (
            <option key={tp} value={tp}>{t(`type_${tp}` as any)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20">
          <Copy className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">暂无模板</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="group relative rounded-lg border bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{tmpl.name}</h3>
                {tmpl.isOfficial && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {t('official')}
                  </span>
                )}
              </div>
              {tmpl.description && <p className="mb-3 line-clamp-2 text-sm text-gray-500">{tmpl.description}</p>}
              <div className="flex items-center gap-2">
                {tmpl.genre && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t(`genre_${tmpl.genre}` as any)}</span>}
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-600">{t(`type_${tmpl.type}` as any)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{tmpl.usageCount} 次使用</span>
                <button className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700">
                  <Book className="h-3 w-3" /> {t('useTemplate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
