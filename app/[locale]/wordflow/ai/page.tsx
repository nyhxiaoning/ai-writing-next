'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, Copy, Wand2, Type, FileText, Sun } from 'lucide-react';

const aiTools = [
  { key: 'nameGenerator', icon: Type, color: 'text-purple-600', prompt: '输入关键词或风格，生成角色/地名：' },
  { key: 'plotSuggestion', icon: Sparkles, color: 'text-amber-600', prompt: '描述当前剧情困境，获取建议：' },
  { key: 'descriptionExpander', icon: Sun, color: 'text-green-600', prompt: '输入简短的描述，AI将扩写成丰富段落：' },
  { key: 'summaryGenerator', icon: FileText, color: 'text-blue-600', prompt: '粘贴章节内容或大纲：' },
];

export default function AIPage() {
  const t = useTranslations('WordFlow.ai');
  const [selectedTool, setSelectedTool] = useState<string>('nameGenerator');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // Simulate AI generation
    await new Promise((r) => setTimeout(r, 1500));
    setResult(`这是基于"${prompt}"的 AI 生成结果示例。\n\n实际使用时，这里会接入 AI API 进行真实生成。`);
    setGenerating(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
        <p className="mt-1 text-sm text-gray-500">AI 辅助创作，让写作更轻松</p>
      </div>

      {/* Tool selection */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.key}
              onClick={() => { setSelectedTool(tool.key); setResult(''); }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                selectedTool === tool.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`h-6 w-6 ${tool.color}`} />
              <span className="text-xs font-medium text-gray-700">{t(tool.key as any)}</span>
            </button>
          );
        })}
      </div>

      {/* Prompt input */}
      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('prompt')}
          rows={4}
          className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Generate button */}
      <div className="mb-8 flex justify-center">
        <button
          onClick={generate}
          disabled={generating || !prompt.trim()}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90 disabled:opacity-50"
        >
          {generating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          {generating ? t('generating') : t('generate')}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">{t('result')}</h3>
            <button
              onClick={copyResult}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
            >
              <Copy className="h-3.5 w-3.5" /> {t('copyResult')}
            </button>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
