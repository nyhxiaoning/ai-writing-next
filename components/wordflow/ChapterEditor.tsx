'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Heading1, Heading2,
  Heading3, Undo, Redo, Copy, ClipboardPaste, Check, Code2, Eye, FileCode, ListTree,
} from 'lucide-react';

// ─── ProseMirror 基础样式 ───────────────────────────────────────
const proseMirrorStyles = `
.ProseMirror {
  position: relative;
  outline: none;
  min-height: 500px;
  word-wrap: break-word;
  white-space: pre-wrap;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
}
.ProseMirror p { margin: 0.5em 0; }
.ProseMirror h1 { font-size: 1.75em; font-weight: 700; margin: 0.8em 0 0.4em; }
.ProseMirror h2 { font-size: 1.5em; font-weight: 600; margin: 0.7em 0 0.3em; }
.ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 0.6em 0 0.3em; }
.ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 0.5em 0; }
.ProseMirror li { margin: 0.2em 0; }
.ProseMirror blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #6b7280;
  font-style: italic;
}
.ProseMirror pre {
  background: #1f2937;
  color: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-family: monospace;
  margin: 0.5em 0;
}
.ProseMirror code {
  background: #f3f4f6;
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-size: 0.875em;
}
.ProseMirror s { text-decoration: line-through; }
.ProseMirror u { text-decoration: underline; }
.ProseMirror em { font-style: italic; }
.ProseMirror strong { font-weight: 700; }
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
.ProseMirror hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 1.5em 0;
}
`;

interface ChapterEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  limit?: number;
}

type ViewMode = 'edit' | 'source' | 'preview';

function ToolbarButton({
  onClick, active, children, title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Table of Contents ──────────────────────────────────────────
function TocPanel({ editor, onClose }: { editor: any; onClose: () => void }) {
  const headings: { level: number; text: string; pos: number }[] = [];
  const doc = editor.getJSON();
  if (doc?.content) {
    let pos = 0;
    doc.content.forEach((node: any) => {
      if (node.type === 'heading') {
        headings.push({ level: node.attrs?.level || 1, text: node.content?.map((c: any) => c.text).join('') || '', pos });
      }
      pos += 1;
    });
  }

  const goToHeading = (index: number) => {
    editor.commands.focus();
    // Find the heading node position in the editor
    let count = 0;
    editor.state.doc.descendants((node: any, p: number) => {
      if (node.type.name === 'heading') {
        if (count === index) {
          editor.commands.setTextSelection({ from: p, to: p + node.nodeSize });
          editor.commands.scrollIntoView();
          return false;
        }
        count++;
      }
    });
    onClose();
  };

  if (headings.length === 0) {
    return (
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-400">当前文档无标题，使用 H1/H2/H3 添加标题后自动生成目录</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">文档目录</span>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">关闭</button>
      </div>
      <div className="space-y-0.5">
        {headings.map((h, i) => (
          <button
            key={i}
            onClick={() => goToHeading(i)}
            className={`block w-full rounded px-2 py-1 text-left text-xs hover:bg-blue-100 transition-colors ${
              h.level === 1 ? 'font-medium text-gray-800' : h.level === 2 ? 'text-gray-600' : 'text-gray-500'
            }`}
            style={{ paddingLeft: `${8 + (h.level - 1) * 12}px` }}
          >
            {h.text || '(空标题)'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChapterEditor({ content, onChange, placeholder, limit }: ChapterEditorProps) {
  const [copied, setCopied] = useState<'html' | 'text' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [sourceHtml, setSourceHtml] = useState(content);
  const [showToc, setShowToc] = useState(false);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  // 标记内容变化是否来自编辑器自身（避免回写导致光标跳转）
  const isEditorUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder || '开始写作...',
      }),
      CharacterCount.configure({ limit }),
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ] as any[],
    content,
    onUpdate: ({ editor }) => {
      isEditorUpdate.current = true;
      const html = editor.getHTML();
      onChange(html);
      setSourceHtml(html);
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror px-4 py-4',
      },
    },
  });

  // 同步外部内容（切换章节等），跳过编辑器自身触发的更新
  const prevContentRef = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content === prevContentRef.current) return;

    // 来自编辑器自身的触发 → 编辑器已有最新内容，无需回写
    if (isEditorUpdate.current) {
      isEditorUpdate.current = false;
      prevContentRef.current = content;
      return;
    }

    // 外部内容变更（切换章节等）→ 同步到编辑器
    prevContentRef.current = content;
    editor.commands.setContent(content || '<p></p>');
  }, [editor, content]);

  // Focus editor when switching to edit mode
  useEffect(() => {
    if (viewMode === 'edit' && editor) {
      editor.commands.focus();
    }
  }, [viewMode, editor]);

  const copyHtml = useCallback(() => {
    const html = viewMode === 'source' ? sourceHtml : editor?.getHTML() || sourceHtml;
    navigator.clipboard.writeText(html).then(() => {
      setCopied('html');
      setTimeout(() => setCopied(null), 2000);
    });
  }, [editor, viewMode, sourceHtml]);

  const copyText = useCallback(() => {
    const text = viewMode === 'source'
      ? sourceHtml.replace(/<[^>]*>/g, '')
      : editor?.getText() || sourceHtml.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(text).then(() => {
      setCopied('text');
      setTimeout(() => setCopied(null), 2000);
    });
  }, [editor, viewMode, sourceHtml]);

  const switchToSource = useCallback(() => {
    if (editor) {
      setSourceHtml(editor.getHTML());
    }
    setViewMode('source');
  }, [editor]);

  const switchToEdit = useCallback(() => {
    if (editor) {
      editor.commands.setContent(sourceHtml || '<p></p>');
      // Notify parent of the change
      onChange(sourceHtml);
    }
    setViewMode('edit');
  }, [editor, sourceHtml, onChange]);

  if (!editor && viewMode !== 'source') {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Inject ProseMirror styles */}
      <style>{proseMirrorStyles}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-3 py-2">
        {/* Formatting buttons — only show in edit mode */}
        {viewMode === 'edit' && (
          <>
            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleBold().run()} active={editor!.isActive('bold')} title="粗体 (Ctrl+B)">
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleItalic().run()} active={editor!.isActive('italic')} title="斜体 (Ctrl+I)">
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleUnderline().run()} active={editor!.isActive('underline')} title="下划线 (Ctrl+U)">
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-gray-200" />

            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleHeading({ level: 1 }).run()} active={editor!.isActive('heading', { level: 1 })} title="标题 1">
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleHeading({ level: 2 }).run()} active={editor!.isActive('heading', { level: 2 })} title="标题 2">
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleHeading({ level: 3 }).run()} active={editor!.isActive('heading', { level: 3 })} title="标题 3">
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-gray-200" />

            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleBulletList().run()} active={editor!.isActive('bulletList')} title="无序列表">
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleOrderedList().run()} active={editor!.isActive('orderedList')} title="有序列表">
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor!.chain().focus() as any).toggleBlockquote().run()} active={editor!.isActive('blockquote')} title="引用">
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-gray-200" />

            <ToolbarButton onClick={() => editor!.chain().focus().undo().run()} title="撤销 (Ctrl+Z)">
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor!.chain().focus().redo().run()} title="重做 (Ctrl+Shift+Z)">
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* View mode toggles */}
        <ToolbarButton onClick={() => setViewMode('edit')} active={viewMode === 'edit'} title="编辑模式">
          <FileCode className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={viewMode === 'source' ? switchToEdit : switchToSource} active={viewMode === 'source'} title="源码模式">
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setViewMode('preview')} active={viewMode === 'preview'} title="预览模式">
          <Eye className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        {/* Copy buttons */}
        <ToolbarButton onClick={copyHtml} title="复制 HTML 格式内容">
          {copied === 'html' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </ToolbarButton>
        <ToolbarButton onClick={copyText} title="复制纯文本">
          {copied === 'text' ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardPaste className="h-4 w-4" />}
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton onClick={() => setShowToc(!showToc)} active={showToc} title="文档目录">
          <ListTree className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* TOC panel */}
      {showToc && viewMode === 'edit' && editor && (
        <TocPanel editor={editor} onClose={() => setShowToc(false)} />
      )}

      {/* Editor / Source / Preview content */}
      <div className="relative">
        {/* Edit mode */}
        {viewMode === 'edit' && (
          <div onClick={() => editor?.commands.focus()}>
            <EditorContent editor={editor} />
          </div>
        )}

        {/* Source code mode */}
        {viewMode === 'source' && (
          <textarea
            ref={sourceTextareaRef}
            value={sourceHtml}
            onChange={(e) => setSourceHtml(e.target.value)}
            className="w-full min-h-[500px] resize-y border-0 bg-gray-50 p-4 font-mono text-sm leading-relaxed text-gray-800 focus:outline-none"
            spellCheck={false}
          />
        )}

        {/* Preview mode */}
        {viewMode === 'preview' && (
          <div
            className="prose prose-sm sm:prose-base max-w-none min-h-[500px] px-4 py-4"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || sourceHtml }}
          />
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-1.5 text-xs text-gray-400">
          <span>
            {viewMode === 'edit'
              ? `${editor!.storage.characterCount.characters()} 字`
              : viewMode === 'source'
              ? `${sourceHtml.length} 字符`
              : '预览模式'}
          </span>
          <span className="flex gap-3">
            <button type="button" onClick={copyHtml} className="hover:text-blue-600 transition-colors">
              复制格式
            </button>
            <button type="button" onClick={copyText} className="hover:text-blue-600 transition-colors">
              复制纯文本
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
