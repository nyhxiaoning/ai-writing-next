'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Key, Save, Check, AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';

interface AIConfigData {
  id?: string;
  provider: string;
  baseUrl?: string;
  model: string;
}

const PRESET_PROVIDERS = [
  { value: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { value: 'anthropic', label: 'Anthropic（兼容模式）', baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-sonnet-4-20250514' },
  { value: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  { value: 'siliconflow', label: 'SiliconFlow', baseUrl: 'https://api.siliconflow.cn/v1', defaultModel: '' },
  { value: 'custom', label: '自定义', baseUrl: '', defaultModel: '' },
];

export default function AIConfigForm({ onClose }: { onClose?: () => void }) {
  const [config, setConfig] = useState({ provider: 'openai', apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' });
  const [saved, setSaved] = useState<AIConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [models, setModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [modelInputMode, setModelInputMode] = useState<'select' | 'input'>('select');

  const selectedProvider = PRESET_PROVIDERS.find((p) => p.value === config.provider);

  useEffect(() => {
    fetch('/api/wordflow/ai/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setSaved(data.config);
          setConfig((prev) => ({
            ...prev,
            provider: data.config.provider || 'openai',
            baseUrl: data.config.baseUrl || PRESET_PROVIDERS.find((p) => p.value === (data.config.provider || 'openai'))?.baseUrl || '',
            model: data.config.model || 'gpt-4o',
          }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchModels = async () => {
    const baseUrl = config.baseUrl || selectedProvider?.baseUrl;
    if (!baseUrl || !config.apiKey) {
      setMessage('请先填写 API Key 和 API 地址');
      return;
    }
    setFetchingModels(true);
    setMessage('');
    try {
      const res = await fetch(baseUrl.replace(/\/+$/, '') + '/models', {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        const modelIds: string[] = (data.data || [])
          .map((m: any) => m.id)
          .sort();
        setModels(modelIds);
        if (modelIds.length > 0) {
          setMessage(`获取到 ${modelIds.length} 个模型`);
          // Auto-select first matching model if current is not in list
          if (!modelIds.includes(config.model) && modelIds.length > 0) {
            const preferred = modelIds.find((id) => id.includes('gpt-4o') || id.includes('claude') || id.includes('deepseek-chat'));
            setConfig((prev) => ({ ...prev, model: preferred || modelIds[0] }));
          }
        } else {
          setMessage('未获取到模型列表，请手动输入模型名');
          setModelInputMode('input');
        }
      } else {
        const errText = await res.text().catch(() => '');
        setMessage(`获取模型列表失败: ${res.status}${errText ? ' - ' + errText.slice(0, 100) : ''}`);
        setModelInputMode('input');
      }
    } catch (e: any) {
      setMessage(`网络错误: ${e.message || '无法连接到 API'}`);
      setModelInputMode('input');
    } finally {
      setFetchingModels(false);
    }
  };

  const testConnection = async () => {
    if (!config.apiKey.trim()) { setMessage('请先输入 API Key'); return; }
    setTestResult('testing');
    setMessage('');
    try {
      const res = await fetch('/api/wordflow/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setTestResult('success');
        setMessage('连接成功，配置有效');
      } else {
        setTestResult('error');
        const err = await res.json();
        setMessage(err.error || '连接失败');
      }
    } catch {
      setTestResult('error');
      setMessage('连接失败，请检查 API 地址');
    }
  };

  const saveConfig = async () => {
    if (!config.apiKey.trim()) { setMessage('请输入 API Key'); return; }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/wordflow/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.config);
        setMessage('配置已保存');
      } else {
        const err = await res.json();
        setMessage(err.error || '保存失败');
      }
    } catch { setMessage('网络错误'); }
    finally { setSaving(false); }
  };

  const handleProviderChange = (provider: string) => {
    const p = PRESET_PROVIDERS.find((x) => x.value === provider);
    setConfig((prev) => ({
      ...prev,
      provider,
      baseUrl: p?.baseUrl || '',
      model: p?.defaultModel || prev.model,
    }));
    setModels([]);
    setModelInputMode('select');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Settings className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">AI 配置</h3>
        {saved && <span className="flex items-center gap-1 text-xs text-green-600"><Check className="h-3 w-3" /> 已配置</span>}
        <div className="flex-1" />
        {onClose && (
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Provider */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">AI 提供商</label>
        <select
          value={config.provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {PRESET_PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">API Key</label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="sk-..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm"
          />
        </div>
      </div>

      {/* Base URL */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          API 地址
          {config.provider !== 'custom' && selectedProvider && (
            <span className="ml-1 text-gray-400">（{selectedProvider.baseUrl}）</span>
          )}
        </label>
        {config.provider === 'custom' ? (
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
            {selectedProvider?.baseUrl}
          </div>
        )}
      </div>

      {/* Model — fetched from API */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">模型</label>
          <div className="flex items-center gap-2">
            {modelInputMode === 'select' && (
              <button
                type="button"
                onClick={fetchModels}
                disabled={fetchingModels}
                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${fetchingModels ? 'animate-spin' : ''}`} />
                {fetchingModels ? '获取中...' : models.length > 0 ? '刷新模型' : '获取模型列表'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setModelInputMode(modelInputMode === 'select' ? 'input' : 'select')}
              className="text-[10px] text-gray-400 hover:text-gray-600"
            >
              {modelInputMode === 'select' ? '手动输入' : '选择模式'}
            </button>
          </div>
        </div>

        {modelInputMode === 'select' && models.length > 0 ? (
          <select
            value={config.model}
            onChange={(e) => setConfig({ ...config, model: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="gpt-4o"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {models.length > 0 && (
              <div className="mt-1 max-h-32 overflow-y-auto rounded border border-gray-200 bg-white shadow-sm">
                {models.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setConfig((prev) => ({ ...prev, model: m })); setModelInputMode('select'); }}
                    className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-blue-50 ${config.model === m ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          保存
        </button>
        <button
          onClick={testConnection}
          className={`flex items-center gap-1 rounded-lg border px-4 py-2 text-sm ${
            testResult === 'success' ? 'border-green-300 text-green-700' :
            testResult === 'error' ? 'border-red-300 text-red-700' :
            'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {testResult === 'testing' ? <Loader2 className="h-4 w-4 animate-spin" /> :
           testResult === 'success' ? <Check className="h-4 w-4" /> :
           <AlertCircle className="h-4 w-4" />}
          测试连接
        </button>
        <div className="flex-1" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            关闭
          </button>
        )}
      </div>

      {message && (
        <p className={`text-xs ${message.includes('失败') || message.includes('错误') || message.includes('无法') ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
