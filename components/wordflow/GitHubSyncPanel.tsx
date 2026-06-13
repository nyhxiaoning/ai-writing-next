'use client';

import { useState, useEffect } from 'react';
import { Upload, Eye, EyeOff, Check, Trash2, Github, RefreshCw, Download, Loader2, AlertCircle } from 'lucide-react';

interface SyncConfig {
  id?: string;
  githubOwner: string;
  githubRepo: string;
  githubPath: string;
  lastSyncedAt?: string | null;
}

interface GitHubSyncPanelProps {
  bookId: string;
  config: SyncConfig | null;
  onSaved: () => void;
}

export default function GitHubSyncPanel({
  bookId,
  config,
  onSaved,
}: GitHubSyncPanelProps) {
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'push' | 'pull' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    owner: '',
    repo: '',
    path: '',
    token: '',
  });

  useEffect(() => {
    if (config) {
      setForm({
        owner: config.githubOwner || '',
        repo: config.githubRepo || '',
        path: config.githubPath || 'story/data.json',
        token: '',
      });
    } else {
      setForm({
        owner: '',
        repo: '',
        path: 'story/data.json',
        token: '',
      });
    }
  }, [config, bookId]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    if (!form.owner || !form.repo || !form.path || !form.token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubOwner: form.owner,
          githubRepo: form.repo,
          githubPath: form.path,
          githubToken: form.token,
        }),
      });
      if (res.ok) {
        showMessage('success', '配置已保存');
        onSaved();
      } else {
        const err = await res.json();
        showMessage('error', err.error || '保存失败');
      }
    } catch (e) {
      console.error('Failed to save sync config', e);
      showMessage('error', '网络错误');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/sync`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setForm({ owner: '', repo: '', path: 'story/data.json', token: '' });
        showMessage('success', '同步配置已解除');
        onSaved();
      }
    } catch (e) {
      console.error('Failed to clear sync config', e);
      showMessage('error', '解除失败');
    }
  };

  const handleSyncPush = async () => {
    setSyncing(true);
    setSyncDirection('push');
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/sync/sync-now`, {
        method: 'POST',
      });
      if (res.ok) {
        showMessage('success', '推送成功');
        onSaved();
      } else {
        const err = await res.json();
        showMessage('error', err.error || '推送失败');
      }
    } catch {
      showMessage('error', '网络错误');
    } finally {
      setSyncing(false);
      setSyncDirection(null);
    }
  };

  const handleSyncPull = async () => {
    setSyncing(true);
    setSyncDirection('pull');
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
        showMessage('success', `拉取成功${parts.length ? '（' + parts.join('，') + '）' : ''}`);
        onSaved();
      } else {
        const err = await res.json();
        showMessage('error', err.error || '拉取失败');
      }
    } catch {
      showMessage('error', '网络错误');
    } finally {
      setSyncing(false);
      setSyncDirection(null);
    }
  };

  const hasConfig = !!config;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Github className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-800">GitHub 同步</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Status Banner */}
        {hasConfig && config.lastSyncedAt && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-green-700">已配置同步</p>
              <p className="text-[10px] text-green-600/70">
                上次同步: {new Date(config.lastSyncedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        )}

        {/* Quick Sync Actions */}
        {hasConfig && (
          <div className="flex gap-2">
            <button
              onClick={handleSyncPull}
              disabled={syncing}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing && syncDirection === 'pull' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              拉取
            </button>
            <button
              onClick={handleSyncPush}
              disabled={syncing}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing && syncDirection === 'push' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              推送
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-100' 
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-3 h-3 shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Repository Section */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">仓库信息</p>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="text-[10px] text-gray-400">用户名</span>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="github username"
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="flex-1">
              <span className="text-[10px] text-gray-400">仓库名</span>
              <input
                type="text"
                value={form.repo}
                onChange={(e) => setForm({ ...form, repo: e.target.value })}
                placeholder="repo name"
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] text-gray-400">文件路径</span>
            <input
              type="text"
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              placeholder="story/data.json"
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>

        {/* Token Section */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">认证</p>
          <label className="block">
            <span className="text-[10px] text-gray-400">Personal Access Token</span>
            <div className="flex gap-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={form.token}
                onChange={(e) => setForm({ ...form, token: e.target.value })}
                placeholder="ghp_..."
                className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600"
              >
                {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <span className="text-[9px] text-gray-400">
              需要 <code className="bg-gray-100 px-0.5 rounded">repo</code> 权限
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener"
                className="text-blue-600 hover:underline ml-1"
              >
                创建 →
              </a>
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {hasConfig && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              解除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!form.owner || !form.repo || !form.path || !form.token || saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
