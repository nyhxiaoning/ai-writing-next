'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Plus, Trash2, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';

interface Node {
  id: string;
  title: string;
  content?: string;
  sortOrder: number;
  depth: number;
  nodeType?: string;
  collapsed: boolean;
  children: Node[];
}

export default function OutlinePage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNodeTitle, setNewNodeTitle] = useState('');

  const fetchOutline = async () => {
    try {
      const res = await fetch(`/api/wordflow/books/${bookId}/outline`);
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOutline(); }, [bookId]);

  const addNode = async () => {
    if (!newNodeTitle.trim()) return;
    const res = await fetch(`/api/wordflow/books/${bookId}/outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newNodeTitle.trim(), sortOrder: nodes.length }),
    });
    if (res.ok) {
      const data = await res.json();
      setNodes((prev) => [...prev, data.node]);
      setNewNodeTitle('');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">大纲编辑器</h2>

      {/* Add node */}
      <div className="mb-6 flex gap-2">
        <input
          value={newNodeTitle}
          onChange={(e) => setNewNodeTitle(e.target.value)}
          placeholder="输入大纲节点标题..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && addNode()}
        />
        <button
          onClick={addNode}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> 添加
        </button>
      </div>

      {/* Tree */}
      {loading ? (
        <div className="py-10 text-center text-gray-400">加载中...</div>
      ) : nodes.length === 0 ? (
        <div className="py-20 text-center text-gray-400">暂无大纲节点，添加一个开始</div>
      ) : (
        <div className="space-y-1">
          {nodes.map((node) => (
            <OutlineNodeItem key={node.id} node={node} bookId={bookId} onRefresh={fetchOutline} />
          ))}
        </div>
      )}
    </div>
  );
}

function OutlineNodeItem({ node, bookId, onRefresh }: { node: Node; bookId: string; onRefresh: () => void }) {
  const [collapsed, setCollapsed] = useState(node.collapsed);

  const deleteNode = async () => {
    const res = await fetch(`/api/wordflow/books/${bookId}/outline?id=${node.id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
  };

  return (
    <div>
      <div className="group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 hover:border-gray-200 hover:bg-gray-50">
        <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
        {node.children?.length > 0 && (
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
        {(!node.children || node.children.length === 0) && <div className="w-4" />}
        <span className="flex-1 text-sm font-medium text-gray-800">{node.title}</span>
        {node.nodeType && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{node.nodeType}</span>
        )}
        <button onClick={deleteNode} className="hidden text-gray-300 hover:text-red-500 group-hover:block">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {node.children && node.children.length > 0 && !collapsed && (
        <div className="ml-6 border-l border-gray-200 pl-2">
          {node.children.map((child) => (
            <OutlineNodeItem key={child.id} node={child} bookId={bookId} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
