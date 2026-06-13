'use client';

import { useState, useEffect } from 'react';
import { Settings, Github, Upload, Download, Loader2, Check, AlertCircle, X, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';

interface BookData {
  id: string;
  title: string;
  status: string;
  chapterCount?: number;
}

interface SyncConfig {
  id?: string;
  githubOwner: string;
  githubRepo: string;
  githubPath: string;
  lastSyncedAt?: string | null;
}

interface GlobalSyncPanelProps {
  open: boolean;
  books: BookData[];
  syncConfigs: Record<string, SyncConfig>;
  onClose: () => void;
  onSyncAll: (direction: 'push' | 'pull') => Promise<void>;
  onConfigsRefreshed: () => void;
}

export default function GlobalSyncPanel({
  open,
  books,
  syncConfigs,
  onClose,
  onSyncAll,
  onConfigsRefreshed,
}: GlobalSyncPanelProps) {
  const [syncing, setSyncing] = useState<'push' | 'pull' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalConfig, setGlobalConfig] = useState({
    owner: '',
    repo: '',
    path: 'story/data.json',
    token: '',
  });

  const configuredCount = Object.keys(syncConfigs).length;
  const unconfiguredBooks = books.filter((b) => !syncConfigs[b.id]);

  useEffect(() => {
    if (open) {
      const firstConfig = Object.values(syncConfigs)[0];
      if (firstConfig) {
        setGlobalConfig({
          owner: firstConfig.githubOwner || '',
          repo: firstConfig.githubRepo || '',
          path: firstConfig.githubPath || 'story/data.json',
          token: '',
        });
      } else {
        setGlobalConfig({ owner: '', repo: '', path: 'story/data.json', token: '' });
      }
    }
  }, [open, syncConfigs]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSync = async (direction: 'push' | 'pull') => {
    setSyncing(direction);
    try {
      await onSyncAll(direction);
      showMessage('success', direction === 'push' ? '全部推送完成' : '全部拉取完成');
    } catch {
      showMessage('error', '同步出错');
    } finally {
      setSyncing(null);
    }
  };

  const handleApplyToAll = async () => {
    if (!globalConfig.owner || !globalConfig.repo) return;
    setSaving(true);
    try {
      let success = 0;
      let fail = 0;
      for (const book of unconfiguredBooks) {
        try {
          const res = await fetch(`/api/wordflow/books/${book.id}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              githubOwner: globalConfig.owner,
              githubRepo: globalConfig.repo,
              githubPath: globalConfig.path,
              githubToken: globalConfig.token || 'PLACEHOLDER',
            }),
          });
          if (res.ok) success++;
          else fail++;
        } catch {
          fail++;
        }
      }
      showMessage('success', `已为 ${success} 本书配置同步${fail > 0 ? `，${fail} 本失败` : ''}`);
      onConfigsRefreshed();
    } catch {
      showMessage('error', '配置出错');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900">同步设置</h3>
            <p className="text-xs text-gray-500 mt-0.5">管理所有作品的远程平台同步配置</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status Summary */}
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-[11px] font-semibold text-blue-600">已配置同步</p>
              <p className="text-2xl font-bold text-blue-700">{configuredCount}</p>
              <p className="text-[10px] text-blue-500/70">本书</p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500">未配置</p>
              <p className="text-2xl font-bold text-gray-600">{unconfiguredBooks.length}</p>
              <p className="text-[10px] text-gray-400">本书</p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {message.type === 'success' ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              {message.text}
            </div>
          )}

          {/* Quick Sync Actions */}
          <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-3">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-600 tracking-wide">批量同步</span>
            </div>
            <p className="text-[11px] text-gray-400">
              对所有已配置同步的作品执行推送到 GitHub 或从 GitHub 拉取
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSync('pull')}
                disabled={!!syncing || configuredCount === 0}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
              >
                {syncing === 'pull' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                全部拉取
              </button>
              <button
                onClick={() => handleSync('push')}
                disabled={!!syncing || configuredCount === 0}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {syncing === 'push' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                全部推送
              </button>
            </div>
          </div>

          {/* Global Config for Unconfigured Books */}
          {unconfiguredBooks.length > 0 && (
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5">
                <Github className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600 tracking-wide">批量配置</span>
              </div>
              <p className="text-[11px] text-gray-400">
                为 {unconfiguredBooks.length} 本未配置的作品批量设置 GitHub 同步
              </p>

              <div className="flex gap-2">
                <label className="flex-1">
                  <span className="text-[10px] text-gray-400">用户名</span>
                  <input
                    type="text"
                    value={globalConfig.owner}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, owner: e.target.value })}
                    placeholder="github username"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-[10px] text-gray-400">仓库名</span>
                  <input
                    type="text"
                    value={globalConfig.repo}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, repo: e.target.value })}
                    placeholder="repo name"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <label className="flex-1">
                  <span className="text-[10px] text-gray-400">文件路径</span>
                  <input
                    type="text"
                    value={globalConfig.path}
                    onChange={(e) => setGlobalConfig({ ...globalConfig, path: e.target.value })}
                    placeholder="story/data.json"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-[10px] text-gray-400">Token (留空则跳过)</span>
                  <div className="flex gap-1">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={globalConfig.token}
                      onChange={(e) => setGlobalConfig({ ...globalConfig, token: e.target.value })}
                      placeholder="ghp_..."
                      className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </label>
              </div>
              <button
                onClick={handleApplyToAll}
                disabled={!globalConfig.owner || !globalConfig.repo || saving}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                应用到未配置的作品
              </button>
            </div>
          )}

          {/* Configured Books List */}
          {configuredCount > 0 && (
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-3">
              <div className="flex items-center gap-1.5">
                <Github className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600 tracking-wide">已配置作品</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {books.filter((b) => syncConfigs[b.id]).map((book) => {
                  const cfg = syncConfigs[book.id];
                  return (
                    <div key={book.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100">
                      <Github className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{book.title}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {cfg.githubOwner}/{cfg.githubRepo}/{cfg.githubPath}
                        </p>
                      </div>
                      {cfg.lastSyncedAt && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(cfg.lastSyncedAt).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
