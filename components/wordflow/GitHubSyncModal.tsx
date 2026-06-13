'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Eye, EyeOff, Check, Trash2, Github } from 'lucide-react';

interface SyncConfig {
  id?: string;
  githubOwner: string;
  githubRepo: string;
  githubPath: string;
  lastSyncedAt?: string | null;
}

interface GitHubSyncModalProps {
  open: boolean;
  bookId: string;
  config: SyncConfig | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function GitHubSyncModal({
  open,
  bookId,
  config,
  onClose,
  onSaved,
}: GitHubSyncModalProps) {
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    owner: '',
    repo: '',
    path: '',
    token: '',
  });

  useEffect(() => {
    if (open) {
      setShowToken(false);
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
    }
  }, [open, config, bookId]);

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
        onSaved();
        onClose();
      }
    } catch (e) {
      console.error('Failed to save sync config', e);
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
        onSaved();
        onClose();
      }
    } catch (e) {
      console.error('Failed to clear sync config', e);
    }
  };

  if (!open) return null;

  const hasConfig = !!config;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900">GitHub 同步</h3>
            <p className="text-xs text-gray-500 mt-0.5">配置后可将作品数据推送/拉取到 GitHub 仓库</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        {hasConfig && config.lastSyncedAt && (
          <div className="flex items-center gap-2.5 px-6 py-3 bg-green-50 border-b border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-600 shrink-0 shadow-[0_0_0_3px_rgba(22,163,74,0.14)]" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-xs font-semibold text-green-800">已配置同步</span>
              <span className="text-[11px] text-green-700/65">
                上次同步: {new Date(config.lastSyncedAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Repository Section */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gray-200/60 flex items-center justify-center text-gray-500 shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide">仓库信息</span>
            </div>
            <div className="flex gap-3">
              <label className="flex flex-col gap-1.5 flex-[1.2]">
                <span className="text-[11px] font-semibold text-gray-500">用户名</span>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  placeholder="如 nyhxiaoning"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                />
              </label>
              <label className="flex flex-col gap-1.5 flex-[1.8]">
                <span className="text-[11px] font-semibold text-gray-500">仓库名</span>
                <input
                  type="text"
                  value={form.repo}
                  onChange={(e) => setForm({ ...form, repo: e.target.value })}
                  placeholder="如 huobao-drama-backup"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-gray-500">文件路径</span>
              <input
                type="text"
                value={form.path}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
                placeholder="如 data/book-xxx.json"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
              <span className="text-[10.5px] text-gray-400 mt-0.5">数据存储路径，建议按作品命名</span>
            </label>
          </div>

          {/* Token Section */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gray-200/60 flex items-center justify-center text-gray-500 shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide">认证</span>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-gray-500">Personal Access Token</span>
              <div className="flex gap-1.5">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                  placeholder="ghp_..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10.5px] text-gray-400 mt-0.5">
                需要 <code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">repo</code> 权限。
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener"
                  className="text-blue-600 font-semibold hover:underline ml-1"
                >
                  创建 Token →
                </a>
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100">
          <div className="flex-1">
            {hasConfig && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                解除同步
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!form.owner || !form.repo || !form.path || !form.token || saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
