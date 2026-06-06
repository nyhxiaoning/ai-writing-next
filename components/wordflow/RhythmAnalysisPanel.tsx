'use client';

import { useState } from 'react';
import { BarChart3, Loader2, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

interface Dimension {
  score: number;
  label: string;
  desc: string;
}

interface AnalysisResult {
  dimensions: Record<string, Dimension>;
  highlights: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

export default function RhythmAnalysisPanel({ chapterId, bookId }: { chapterId?: string; bookId?: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    if (!chapterId || !bookId) { setError('请先选择章节'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/wordflow/ai/analysis/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      } else {
        const err = await res.json();
        setError(err.error || '分析失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  const getColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="flex items-center gap-1.5 font-medium text-gray-900">
          <BarChart3 className="h-4 w-4 text-indigo-500" /> 节奏分析
        </h3>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
          {loading ? '分析中...' : '开始分析'}
        </button>
      </div>

      {/* 8-dimension bar chart */}
      {analysis?.dimensions && (
        <div className="space-y-2">
          {Object.entries(analysis.dimensions).map(([key, dim]) => (
            <div key={key}>
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-xs text-gray-600">{dim.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getColor(dim.score)}`}>
                  {dim.score}/10
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dim.score >= 8 ? 'bg-green-500' : dim.score >= 6 ? 'bg-blue-500' : dim.score >= 4 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${dim.score * 10}%` }}
                />
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400">{dim.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {analysis?.summary && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-2.5 text-xs text-gray-700">
          {analysis.summary}
        </div>
      )}

      {/* Highlights */}
      {analysis?.highlights && analysis.highlights.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-1 text-xs font-medium text-green-700">
            <TrendingUp className="h-3 w-3" /> 亮点
          </h4>
          <ul className="space-y-1">
            {analysis.highlights.map((h, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {analysis?.weaknesses && analysis.weaknesses.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-700">
            <AlertTriangle className="h-3 w-3" /> 待改进
          </h4>
          <ul className="space-y-1">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis?.suggestions && analysis.suggestions.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-700">
            <Lightbulb className="h-3 w-3" /> 改进建议
          </h4>
          <ul className="space-y-1">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {!analysis && !loading && !error && (
        <p className="py-6 text-center text-xs text-gray-400">点击"开始分析"对当前章节进行 8 维度节奏评估</p>
      )}
    </div>
  );
}
