'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Copy, Wand2, Type, FileText, Sun, BookOpen,
  Lightbulb, ChevronDown, Loader2, AlertCircle, ClipboardCheck,
  CheckCircle2, XCircle, ArrowRight,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────

interface Book {
  id: string;
  title: string;
  chapterCount: number;
}

interface ToolConfig {
  key: string;
  icon: any;
  color: string;
  bgColor: string;
  label: string;
  params: ParamField[];
}

interface ParamField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
}

// ─── Tool definitions ─────────────────────────────────────────────

const TOOLS: ToolConfig[] = [
  {
    key: 'nameGenerator',
    icon: Type,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    label: '起名生成器',
    params: [
      {
        key: 'type', label: '命名类型', type: 'select',
        options: [
          { value: 'character', label: '角色名' },
          { value: 'place', label: '地名' },
          { value: 'item', label: '物品名' },
          { value: 'organization', label: '组织名' },
          { value: 'skill', label: '招式/能力名' },
        ],
        defaultValue: 'character',
      },
      {
        key: 'style', label: '命名风格', type: 'select',
        options: [
          { value: 'classical', label: '古典雅致' },
          { value: 'modern', label: '现代简洁' },
          { value: 'fantasy', label: '奇幻瑰丽' },
          { value: 'sci-fi', label: '科幻未来' },
          { value: 'eastern', label: '东方韵味' },
          { value: 'western', label: '西方奇幻' },
        ],
        defaultValue: 'classical',
      },
      {
        key: 'count', label: '生成数量', type: 'select',
        options: [
          { value: '5', label: '5 个' },
          { value: '10', label: '10 个' },
          { value: '20', label: '20 个' },
        ],
        defaultValue: '10',
      },
      {
        key: 'prompt', label: '关键词/主题', type: 'textarea',
        placeholder: '描述想要的命名方向、主题关键词或风格要求…',
      },
    ],
  },
  {
    key: 'plotSuggestion',
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    label: '剧情建议',
    params: [
      {
        key: 'goal', label: '剧情目标', type: 'select',
        options: [
          { value: 'conflict', label: '冲突升级' },
          { value: 'arc', label: '角色弧光' },
          { value: 'suspense', label: '悬念设计' },
          { value: 'twist', label: '剧情转折' },
          { value: 'ending', label: '结局设计' },
          { value: 'worldbuild', label: '世界观展开' },
        ],
        defaultValue: 'conflict',
      },
      {
        key: 'mood', label: '情感基调', type: 'select',
        options: [
          { value: 'warm', label: '温暖治愈' },
          { value: 'tense', label: '紧张刺激' },
          { value: 'sad', label: '悲伤感人' },
          { value: 'light', label: '轻松幽默' },
          { value: 'epic', label: '壮丽史诗' },
        ],
        defaultValue: 'tense',
      },
      {
        key: 'branchCount', label: '推荐方案数', type: 'select',
        options: [
          { value: '2', label: '2 个方案' },
          { value: '3', label: '3 个方案' },
        ],
        defaultValue: '3',
      },
      {
        key: 'prompt', label: '当前剧情描述', type: 'textarea',
        placeholder: '描述当前的剧情阶段、角色状态、遇到的瓶颈或想突破的方向…',
      },
    ],
  },
  {
    key: 'descriptionExpander',
    icon: Sun,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    label: '描述扩写',
    params: [
      {
        key: 'sceneType', label: '场景类型', type: 'select',
        options: [
          { value: 'nature', label: '自然环境' },
          { value: 'building', label: '建筑场景' },
          { value: 'character', label: '人物外貌' },
          { value: 'action', label: '动作场面' },
          { value: 'emotion', label: '情感氛围' },
          { value: 'battle', label: '战斗场景' },
        ],
        defaultValue: 'nature',
      },
      {
        key: 'style', label: '描写风格', type: 'select',
        options: [
          { value: 'realistic', label: '写实细腻' },
          { value: 'poetic', label: '诗意优美' },
          { value: 'concise', label: '简洁有力' },
          { value: 'grand', label: '华丽宏大' },
        ],
        defaultValue: 'realistic',
      },
      {
        key: 'targetLength', label: '目标字数', type: 'select',
        options: [
          { value: '100', label: '约 100 字' },
          { value: '300', label: '约 300 字' },
          { value: '500', label: '约 500 字' },
        ],
        defaultValue: '300',
      },
      {
        key: 'prompt', label: '基础描述', type: 'textarea',
        placeholder: '输入需要扩写的简短描述，可以是几个关键词或一句话…',
      },
    ],
  },
  {
    key: 'summaryGenerator',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: '章节摘要',
    params: [
      {
        key: 'granularity', label: '摘要粒度', type: 'select',
        options: [
          { value: 'simple', label: '简洁摘要（一段话）' },
          { value: 'detailed', label: '详细分析（含结构）' },
          { value: 'sectioned', label: '分节摘要（按段落）' },
        ],
        defaultValue: 'detailed',
      },
      {
        key: 'include', label: '包含内容', type: 'select',
        options: [
          { value: 'all', label: '全部（情节+角色+伏笔）' },
          { value: 'plot', label: '仅关键情节' },
          { value: 'arc', label: '角色弧光' },
          { value: 'foreshadow', label: '伏笔与悬念' },
        ],
        defaultValue: 'all',
      },
      {
        key: 'prompt', label: '章节内容', type: 'textarea',
        placeholder: '粘贴章节内容、大纲或关键情节描述…',
      },
    ],
  },
  {
    key: 'scriptReviewer',
    icon: ClipboardCheck,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: '剧情审阅器',
    params: [
      {
        key: 'prompt', label: '剧本内容', type: 'textarea',
        placeholder: '粘贴或写入需要审阅的剧本内容…',
      },
    ],
  },
];

// ─── Page ──────────────────────────────────────────────────────────

export default function AIPage() {
  const [selectedTool, setSelectedTool] = useState<string>('nameGenerator');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [bookContext, setBookContext] = useState<Record<string, any>>({});
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [action, setAction] = useState<'idle' | 'derive' | 'generate'>('idle');
  const [loading, setLoading] = useState(false);
  const [derivation, setDerivation] = useState('');
  const [result, setResult] = useState('');
  const [showDerivation, setShowDerivation] = useState(true);
  const [error, setError] = useState('');
  // Reviewer-specific state
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [reviewResult, setReviewResult] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [reviewStep, setReviewStep] = useState<'input' | 'review' | 'optimized'>('input');
  const [targetWordCount, setTargetWordCount] = useState('');

  const tool = TOOLS.find((t) => t.key === selectedTool)!;

  // Fetch books list
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/wordflow/books');
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || []);
        }
      } catch {
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, []);

  // Reset state when switching tools
  useEffect(() => {
    setDerivation('');
    setResult('');
    setAction('idle');
    setError('');
    setSelectedDirections([]);
    setReviewResult('');
    setOptimizedContent('');
    setReviewStep('input');
    setTargetWordCount('');
    // Initialize param defaults
    if (tool) {
      const defaults: Record<string, string> = {};
      tool.params.forEach((p) => {
        if (p.defaultValue) defaults[p.key] = p.defaultValue;
        else defaults[p.key] = '';
      });
      setParamValues(defaults);
    }
  }, [selectedTool]);

  // Load book context when book is selected
  const loadBookContext = useCallback(async (bookId: string) => {
    if (!bookId) return;
    try {
      const [bookRes, charsRes] = await Promise.all([
        fetch(`/api/wordflow/books/${bookId}`),
        fetch(`/api/wordflow/books/${bookId}/characters`),
      ]);
      const bookData = bookRes.ok ? await bookRes.json() : null;
      const charsData = charsRes.ok ? await charsRes.json() : null;

      setBookContext({
        bookTitle: bookData?.book?.title || '',
        chapterCount: bookData?.book?.chapters?.length || 0,
        characterCount: charsData?.characters?.length || 0,
        existingNames: charsData?.characters?.slice(0, 10).map((c: any) => c.name).join('、') || '',
        totalWords: bookData?.book?.chapters?.reduce((sum: number, ch: any) => sum + (ch.wordCount || 0), 0) || 0,
      });
    } catch {
      setBookContext({});
    }
  }, []);

  useEffect(() => {
    if (selectedBookId) loadBookContext(selectedBookId);
  }, [selectedBookId, loadBookContext]);

  const callTool = async (actionType: 'derive' | 'generate', extraParams?: Record<string, any>) => {
    const prompt = paramValues['prompt']?.trim();
    if (!prompt) return;

    setLoading(true);
    setError('');
    setAction(actionType);

    // For reviewer optimize, pass directions and review summary
    const mergedParams = extraParams
      ? { ...paramValues, ...extraParams }
      : paramValues;

    try {
      const res = await fetch('/api/wordflow/ai/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBookId || undefined,
          tool: selectedTool,
          action: actionType,
          params: mergedParams,
          context: selectedBookId ? bookContext : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '请求失败');
      }

      const data = await res.json();

      if (selectedTool === 'scriptReviewer') {
        if (actionType === 'derive') {
          setReviewResult(data.result);
        } else {
          setOptimizedContent(data.result);
        }
      } else {
        if (actionType === 'derive') {
          setDerivation(data.result);
          setShowDerivation(true);
        } else {
          setResult(data.result);
        }
      }
    } catch (e: any) {
      setError(e.message || '请求失败，请检查 AI 配置');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewerOptimize = async () => {
    if (selectedDirections.length === 0) {
      setError('请至少选择一个优化方向');
      return;
    }
    const directionLabels: Record<string, string> = {
      consistency: '角色一致性优化',
      coherence: '对话连贯性优化',
      interest: '对话趣味性增强',
      emotion: '情感表达丰富化',
      rhythm: '节奏感优化',
      imagery: '画面感增强',
    };
    const directionsText = selectedDirections.map((d) => directionLabels[d] || d).join('、');
    await callTool('generate', {
      directions: directionsText,
      reviewSummary: reviewResult,
      targetWordCount: targetWordCount || undefined,
    });
    setReviewStep('optimized');
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result || optimizedContent);
  };

  const currentTool = TOOLS.find((t) => t.key === selectedTool) || TOOLS[0];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">AI 创作助手</h2>
        <p className="mt-1 text-sm text-gray-500">智能辅助创作，先推导再生成，让内容更有深度</p>
      </div>

      {/* Book selector */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          选择关联作品（可选，提供上下文让 AI 更了解你的故事）
        </label>
        {loadingBooks ? (
          <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
        ) : (
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">不关联作品（通用模式）</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}（{b.chapterCount} 章）
              </option>
            ))}
          </select>
        )}

        {/* Book context summary */}
        {selectedBookId && bookContext.bookTitle && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="rounded bg-blue-50 px-2 py-1 text-blue-600">{bookContext.bookTitle}</span>
            <span className="rounded bg-gray-50 px-2 py-1">{bookContext.chapterCount} 章节</span>
            <span className="rounded bg-gray-50 px-2 py-1">{bookContext.characterCount} 个角色</span>
            <span className="rounded bg-gray-50 px-2 py-1">{bookContext.totalWords} 总字数</span>
          </div>
        )}
      </div>

      {/* Tool selection */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = selectedTool === tool.key;
          return (
            <button
              key={tool.key}
              onClick={() => setSelectedTool(tool.key)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                isActive
                  ? tool.bgColor + ' shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <Icon className={`h-6 w-6 ${tool.color}`} />
              <span className="text-xs font-medium text-gray-700">{tool.label}</span>
              <span className="text-[10px] text-gray-400">
                {tool.params.length} 项配置
              </span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Script Reviewer UI ── */}
      {selectedTool === 'scriptReviewer' ? (
        <div className="space-y-4">
          {/* Content input */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">剧本内容</label>
            <textarea
              value={paramValues['prompt'] || ''}
              onChange={(e) => setParamValues({ ...paramValues, prompt: e.target.value })}
              placeholder="粘贴或写入需要审阅的剧本内容，包括角色对话、场景描述等…"
              rows={8}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/20 resize-y"
            />
            <div className="mt-3">
              <button
                onClick={() => { callTool('derive'); setReviewStep('review'); }}
                disabled={loading || !paramValues['prompt']?.trim()}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading && action === 'derive' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ClipboardCheck className="h-4 w-4" />
                )}
                开始审阅
              </button>
            </div>
          </div>

          {/* Review result */}
          {reviewResult && (
            <div className="rounded-lg border border-red-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-semibold text-gray-900">审阅报告</h3>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {reviewResult}
              </div>
            </div>
          )}

          {/* Optimization directions (show after review) */}
          {reviewResult && reviewStep === 'review' && (
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-semibold text-gray-900">期望优化方向</h3>
                <span className="text-xs text-gray-400">（选择后点击下方按钮生成优化内容）</span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { key: 'consistency', label: '角色一致性优化', desc: '统一角色言行与性格设定' },
                  { key: 'coherence', label: '对话连贯性优化', desc: '让对话逻辑更自然流畅' },
                  { key: 'interest', label: '对话趣味性增强', desc: '增加对话张力和吸引力' },
                  { key: 'emotion', label: '情感表达丰富化', desc: '强化情绪渲染和代入感' },
                  { key: 'rhythm', label: '节奏感优化', desc: '调整对话节奏避免单调' },
                  { key: 'imagery', label: '画面感增强', desc: '增强场景画面的生动性' },
                ].map((dir) => {
                  const isSelected = selectedDirections.includes(dir.key);
                  return (
                    <button
                      key={dir.key}
                      onClick={() => {
                        setSelectedDirections((prev) =>
                          isSelected
                            ? prev.filter((d) => d !== dir.key)
                            : [...prev, dir.key]
                        );
                      }}
                      className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4 text-purple-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300" />
                        )}
                        <span className="text-xs font-medium text-gray-800">{dir.label}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 ml-5">{dir.desc}</span>
                    </button>
                  );
                })}
              </div>
              {/* Target word count */}
              <div className="mb-4 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">优化后字数限制</label>
                <input
                  type="number"
                  value={targetWordCount}
                  onChange={(e) => setTargetWordCount(e.target.value)}
                  placeholder="不限"
                  min={0}
                  className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400">留空表示不限制字数</span>
              </div>
              <button
                onClick={handleReviewerOptimize}
                disabled={loading || selectedDirections.length === 0}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading && action === 'generate' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                生成优化内容
                {selectedDirections.length > 0 && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    已选 {selectedDirections.length} 项
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Optimized content */}
          {optimizedContent && (
            <div className="rounded-lg border border-green-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-green-600" />
                  <h3 className="text-base font-semibold text-gray-900">优化结果</h3>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(optimizedContent)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" /> 复制结果
                </button>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {optimizedContent}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Standard tool UI ── */}

          {/* Parameters + Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            {/* Parameters */}
            <div className="mb-5 space-y-4">
              {currentTool.params.map((param) => (
                <div key={param.key}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {param.label}
                  </label>
                  {param.type === 'textarea' ? (
                    <textarea
                      value={paramValues[param.key] || ''}
                      onChange={(e) => setParamValues({ ...paramValues, [param.key]: e.target.value })}
                      placeholder={param.placeholder}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-y min-h-[60px]"
                    />
                  ) : param.type === 'select' ? (
                    <select
                      value={paramValues[param.key] || ''}
                      onChange={(e) => setParamValues({ ...paramValues, [param.key]: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    >
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={paramValues[param.key] || ''}
                      onChange={(e) => setParamValues({ ...paramValues, [param.key]: e.target.value })}
                      placeholder={param.placeholder}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => callTool('derive')}
                disabled={loading || !paramValues['prompt']?.trim()}
                className="flex items-center gap-2 rounded-lg border-2 border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                {loading && action === 'derive' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
                推导分析
                <span className="text-[10px] text-amber-500 font-normal">先分析再生成</span>
              </button>

              <button
                onClick={() => callTool('generate')}
                disabled={loading || !paramValues['prompt']?.trim()}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading && action === 'generate' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                开始生成
              </button>
            </div>
          </div>

          {/* Derivation result (collapsible) */}
          {derivation && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <button
                onClick={() => setShowDerivation(!showDerivation)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-medium text-amber-800">推导分析结果</h3>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-amber-500 transition-transform ${
                    showDerivation ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>
              {showDerivation && (
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-900">
                  {derivation}
                </div>
              )}
            </div>
          )}

          {/* Final result */}
          {result && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-700">生成结果</h3>
                </div>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" /> 复制结果
                </button>
              </div>
              {loading && action === 'generate' && !result ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-400">AI 正在生成中…</span>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {result}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
