'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Wand2, Loader2, Plus, Trash2, Copy, Check } from 'lucide-react';

interface RewriteRow {
  id: string;
  sceneId: string;
  originalSummary: string;
  hasDialogue: string;
  personification: string;
  narrativeStyle: string;
  sceneType: string;
  emotionalTone: string;
  otherRequirements: string[];
  targetWordCount: string;
  priority: string;
}

const emptyRow = (id: string): RewriteRow => ({
  id,
  sceneId: '',
  originalSummary: '',
  hasDialogue: '有',
  personification: '高',
  narrativeStyle: '电影级',
  sceneType: '日常',
  emotionalTone: '温暖',
  otherRequirements: [],
  targetWordCount: '800',
  priority: '中',
});

const requirementOptions = [
  '增加环境/感官描写', '强化冲突与悬念', '调整节奏（加快）',
  '调整节奏（放缓）', '优化人物性格一致性', '添加潜台词',
  '适配目标读者', '提升画面感',
];

export default function AIRewritePanel({ chapterContent, onInsert }: { chapterContent?: string; onInsert?: (html: string) => void }) {
  const t = useTranslations('WordFlow.ai');
  const [rows, setRows] = useState<RewriteRow[]>([emptyRow('1')]);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const addRow = () => setRows((prev) => [...prev, emptyRow(String(prev.length + 1))]);

  const updateRow = (id: string, field: keyof RewriteRow, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const toggleRequirement = (id: string, req: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, otherRequirements: r.otherRequirements.includes(req) ? r.otherRequirements.filter((x) => x !== req) : [...r.otherRequirements, req] }
          : r
      )
    );
  };

  const deleteRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const generateRewrite = async (row: RewriteRow) => {
    setGenerating((prev) => ({ ...prev, [row.id]: true }));
    try {
      const res = await fetch('/api/wordflow/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: chapterContent || row.originalSummary,
          requirements: {
            hasDialogue: row.hasDialogue,
            personification: row.personification,
            narrativeStyle: row.narrativeStyle,
            sceneType: row.sceneType,
            emotionalTone: row.emotionalTone,
            otherRequirements: row.otherRequirements.join('；'),
            targetWordCount: row.targetWordCount,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults((prev) => ({ ...prev, [row.id]: data.rewritten }));
      } else {
        const err = await res.json();
        setResults((prev) => ({ ...prev, [row.id]: `错误: ${err.error || '请求失败'}` }));
      }
    } catch {
      setResults((prev) => ({ ...prev, [row.id]: '网络错误，请稍后重试' }));
    } finally {
      setGenerating((prev) => ({ ...prev, [row.id]: false }));
    }
  };

  const copyResult = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insertResult = (text: string) => {
    onInsert?.(text.replace(/\n/g, '<p>') + '</p>');
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="flex items-center gap-1.5 font-medium text-gray-900">
          <Wand2 className="h-4 w-4 text-blue-500" /> AI 改写
        </h3>
        <button onClick={addRow} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
          <Plus className="h-3.5 w-3.5" /> 添加场景
        </button>
      </div>

      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border border-gray-200 bg-white p-3">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">场景 #{row.id}</span>
            {rows.length > 1 && (
              <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            <input value={row.sceneId} onChange={(e) => updateRow(row.id, 'sceneId', e.target.value)} placeholder="场景 ID (如 C001-S01)" className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs" />
            <textarea value={row.originalSummary} onChange={(e) => updateRow(row.id, 'originalSummary', e.target.value)} placeholder={chapterContent ? '将使用当前编辑器内容' : '粘贴原文摘要...'} rows={2} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs" />

            {/* 有无对话对白 */}
            <div>
              <label className="mb-0.5 block text-[10px] font-medium text-gray-500">有无对话对白</label>
              <select value={row.hasDialogue} onChange={(e) => updateRow(row.id, 'hasDialogue', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs">
                <option>有</option><option>无</option><option>半有</option>
              </select>
              <p className="mt-0.5 text-[10px] text-gray-400">有=提供原文对话；无=纯叙述；半有=AI补全</p>
            </div>

            {/* 角色拟人化程度 */}
            <div>
              <label className="mb-0.5 block text-[10px] font-medium text-gray-500">角色拟人化程度</label>
              <select value={row.personification} onChange={(e) => updateRow(row.id, 'personification', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs">
                <option>高</option><option>中</option><option>低</option>
              </select>
              <p className="mt-0.5 text-[10px] text-gray-400">高=完整人类化(情绪/口语/习惯)；中=保留特性+人类情感；低=保持原特性</p>
            </div>

            {/* 叙事风格 */}
            <div>
              <label className="mb-0.5 block text-[10px] font-medium text-gray-500">叙事风格</label>
              <select value={row.narrativeStyle} onChange={(e) => updateRow(row.id, 'narrativeStyle', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs">
                <option>电影级</option><option>纪录片级</option><option>日常级</option><option>文学叙事</option>
              </select>
              <p className="mt-0.5 text-[10px] text-gray-400">电影级=强戏剧张力画面感；纪录片=真实自然；日常=轻松生活化；文学叙事=细腻心理描写</p>
            </div>

            {/* 场景分类 */}
            <div>
              <label className="mb-0.5 block text-[10px] font-medium text-gray-500">场景分类</label>
              <select value={row.sceneType} onChange={(e) => updateRow(row.id, 'sceneType', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs">
                <option>室内日常</option><option>动作</option><option>情感</option><option>悬疑</option><option>回忆</option><option>梦幻</option>
              </select>
              <p className="mt-0.5 text-[10px] text-gray-400">室内日常/动作/情感/悬疑/回忆/梦幻</p>
            </div>

            {/* 情感基调 */}
            <div>
              <label className="mb-0.5 block text-[10px] font-medium text-gray-500">情感基调</label>
              <select value={row.emotionalTone} onChange={(e) => updateRow(row.id, 'emotionalTone', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs">
                <option>温暖</option><option>紧张</option><option>悲伤</option><option>治愈</option><option>轻松</option>
              </select>
              <p className="mt-0.5 text-[10px] text-gray-400">温暖/紧张/悲伤/治愈/轻松</p>
            </div>

            {/* 目标字数 + 优先级 同行 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-gray-500">目标字数</label>
                <input type="number" value={row.targetWordCount} onChange={(e) => updateRow(row.id, 'targetWordCount', e.target.value)} placeholder="800" className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs" />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-gray-500">优先级</label>
                <select value={row.priority} onChange={(e) => updateRow(row.id, 'priority', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs">
                  <option>高</option><option>中</option><option>低</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requirement tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {requirementOptions.map((req) => (
              <button
                key={req}
                onClick={() => toggleRequirement(row.id, req)}
                className={`rounded-full px-2 py-0.5 text-[10px] border transition-colors ${
                  row.otherRequirements.includes(req)
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {req}
              </button>
            ))}
          </div>

          {/* Generate button */}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => generateRewrite(row)}
              disabled={generating[row.id]}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50"
            >
              {generating[row.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
              {generating[row.id] ? '生成中...' : 'AI 生成改写'}
            </button>
          </div>

          {/* Result */}
          {results[row.id] && (
            <div className="mt-2 rounded-lg border border-purple-100 bg-purple-50 p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-medium text-purple-700">改写结果</span>
                <div className="flex gap-1">
                  <button onClick={() => copyResult(results[row.id], row.id)} className="text-purple-400 hover:text-purple-600">
                    {copiedId === row.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                  {onInsert && (
                    <button onClick={() => insertResult(results[row.id])} className="text-[10px] text-purple-600 hover:text-purple-700">
                      插入编辑器
                    </button>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700">{results[row.id]}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
