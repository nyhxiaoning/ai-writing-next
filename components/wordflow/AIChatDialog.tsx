'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Plus, Trash2, Settings, Sparkles } from 'lucide-react';
import AIConfigForm from './AIConfigForm';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  id: string;
  title?: string;
  bookId?: string;
  _count?: { messages: number };
}

export default function AIChatDialog({ bookId }: { bookId?: string }) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if AI is configured
  useEffect(() => {
    fetch('/api/wordflow/ai/config')
      .then((r) => r.json())
      .then((data) => setHasConfig(!!data.config))
      .catch(() => setHasConfig(false));
  }, []);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const params = bookId ? `?bookId=${bookId}` : '';
      const res = await fetch(`/api/wordflow/ai/chat${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {}
  }, [bookId]);

  useEffect(() => { if (open) loadSessions(); }, [open, loadSessions]);

  // Load messages for a session
  const loadMessages = async (sessionId: string) => {
    // Messages aren't fetched via a dedicated endpoint in the current API,
    // but we'll track them in state as they're streamed
    setActiveSessionId(sessionId);
    setMessages([]);
  };

  // Create new session
  const newSession = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    if (hasConfig === false) { setShowConfig(true); return; }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    // Optimistically add empty assistant message
    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/wordflow/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          bookId,
          message: userMsg.content,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `错误: ${err.error || '请求失败'}` } : m
          )
        );
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
              );
            }
            if (data.sessionId) {
              setActiveSessionId(data.sessionId);
              loadSessions();
            }
            if (data.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: `错误: ${data.error}` } : m
                )
              );
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: '网络错误' } : m)
      );
    } finally {
      setStreaming(false);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat dialog */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex w-96 flex-col rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-xl border-b bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI 创作助手</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowConfig(!showConfig)} className="rounded p-1 hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Config panel */}
          {showConfig && (
            <div className="border-b bg-gray-50 p-3">
              <AIConfigForm onClose={() => { setShowConfig(false); setOpen(false); }} />
            </div>
          )}

          {/* Session bar */}
          {!showConfig && (
            <div className="flex items-center gap-1 border-b bg-gray-50 px-3 py-1.5">
              <button onClick={newSession} className={`rounded px-2 py-1 text-xs ${!activeSessionId ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-200'}`}>
                新对话
              </button>
              {sessions.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSessionId(s.id); loadMessages(s.id); }}
                  className={`max-w-[100px] truncate rounded px-2 py-1 text-xs ${activeSessionId === s.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  {s.title || '对话'}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: '400px' }}>
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center py-10 text-center text-xs text-gray-400">
                <div>
                  <Sparkles className="mx-auto mb-2 h-8 w-8 text-blue-300" />
                  <p>AI 创作助手已就绪</p>
                  <p className="mt-1">可以帮你续写、改写、分析章节内容</p>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content || <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={hasConfig === false ? '先配置 AI API...' : '输入消息...'}
              disabled={streaming}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
