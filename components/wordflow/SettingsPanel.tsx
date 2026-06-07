'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, ListTree, Settings2, Plus, Loader2, Pencil, Trash2,
  Shield, Crown, Swords,
} from 'lucide-react';
import SettingDetailModal from './SettingDetailModal';

// ─── Types ────────────────────────────────────────────────────────
interface SettingsPanelProps {
  bookId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────
const SUB_TABS = [
  { key: 'characters' as const, label: '角色', icon: Users },
  { key: 'factions' as const, label: '势力', icon: ListTree },
  { key: 'equipment' as const, label: '装备', icon: Settings2 },
];

// Display helpers for list item enrichment
const ROLE_TAG_COLORS: Record<string, string> = {
  '主角': 'bg-red-100 text-red-600',
  '反派': 'bg-purple-100 text-purple-600',
  '配角': 'bg-blue-100 text-blue-600',
  '主要角色': 'bg-amber-100 text-amber-600',
  '次要角色': 'bg-gray-100 text-gray-500',
};

const RARITY_COLORS: Record<string, string> = {
  '普通': 'bg-gray-100 text-gray-500',
  '精良': 'bg-green-100 text-green-600',
  '稀有': 'bg-blue-100 text-blue-600',
  '史诗': 'bg-purple-100 text-purple-600',
  '传说': 'bg-amber-100 text-amber-600',
};

const FACTION_TYPE_ICONS: Record<string, any> = {
  '政治': Shield,
  '军事': Swords,
  '宗教': Crown,
};

const EQUIPMENT_TYPE_ICONS: Record<string, any> = {
  '武器': Swords,
  '防具': Shield,
  '法器': Crown,
};

// ─── Component ────────────────────────────────────────────────────
export default function SettingsPanel({ bookId }: SettingsPanelProps) {
  const [subTab, setSubTab] = useState<'characters' | 'factions' | 'equipment'>('characters');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const apiPath = `/api/wordflow/books/${bookId}/${subTab}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(apiPath);
      if (r.ok) {
        const data = await r.json();
        setItems(data[subTab] || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [apiPath, subTab]);

  useEffect(() => { load(); }, [load]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data: any) => {
    const method = editingItem ? 'PUT' : 'POST';
    const body = editingItem ? { id: editingItem.id, ...data } : data;
    const r = await fetch(apiPath, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      setModalOpen(false);
      setEditingItem(null);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return;
    await fetch(`${apiPath}?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-2">
      {/* Sub-tab bar */}
      <div className="flex gap-0.5 rounded-md bg-gray-100 p-0.5">
        {SUB_TABS.map((st) => {
          const Icon = st.icon;
          return (
            <button
              key={st.key}
              onClick={() => { setSubTab(st.key); setModalOpen(false); }}
              className={`flex flex-1 items-center justify-center gap-1 rounded px-1 py-1 text-[10px] font-medium transition-colors ${
                subTab === st.key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-3 w-3" /> {st.label}
            </button>
          );
        })}
      </div>

      {/* Create button */}
      <button
        onClick={handleOpenCreate}
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 py-2 text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600"
      >
        <Plus className="h-3 w-3" /> 新建{SUB_TABS.find((st) => st.key === subTab)?.label}
      </button>

      {/* List */}
      {loading ? (
        <p className="py-4 text-center text-xs text-gray-400">
          <Loader2 className="inline h-3 w-3 animate-spin" /> 加载中...
        </p>
      ) : items.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">
          暂无{SUB_TABS.find((st) => st.key === subTab)?.label}
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="group flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                {/* Primary: name */}
                <p className="truncate text-xs font-medium text-gray-700">{item.name}</p>

                {/* Secondary: role/type/rarity + faction/owner/memberCount */}
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  {/* Character: role badge */}
                  {subTab === 'characters' && item.role && (
                    <span className={`inline-block rounded px-1 py-[1px] text-[9px] font-medium ${ROLE_TAG_COLORS[item.role] || 'bg-gray-100 text-gray-500'}`}>
                      {item.role}
                    </span>
                  )}

                  {/* Character: faction name */}
                  {subTab === 'characters' && item.faction?.name && (
                    <span className="text-[9px] text-blue-500">
                      {item.faction.name}
                    </span>
                  )}

                  {/* Faction: type badge */}
                  {subTab === 'factions' && item.type && (
                    <span className="inline-block rounded bg-gray-100 px-1 py-[1px] text-[9px] font-medium text-gray-500">
                      {item.type}
                    </span>
                  )}

                  {/* Faction: member count */}
                  {subTab === 'factions' && (
                    <span className="text-[9px] text-gray-400">
                      {item._count?.members ?? 0} 人
                    </span>
                  )}

                  {/* Equipment: rarity badge */}
                  {subTab === 'equipment' && item.rarity && (
                    <span className={`inline-block rounded px-1 py-[1px] text-[9px] font-medium ${RARITY_COLORS[item.rarity] || 'bg-gray-100 text-gray-500'}`}>
                      {item.rarity}
                    </span>
                  )}

                  {/* Equipment: type */}
                  {subTab === 'equipment' && item.type && (
                    <span className="text-[9px] text-gray-400">
                      {item.type}
                    </span>
                  )}

                  {/* Equipment: owner name */}
                  {subTab === 'equipment' && item.owner?.name && (
                    <span className="text-[9px] text-blue-500">
                      {item.owner.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                className="hidden shrink-0 text-gray-300 hover:text-blue-500 group-hover:block"
                title="编辑"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="hidden shrink-0 text-gray-300 hover:text-red-500 group-hover:block"
                title="删除"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail/Edit Modal */}
      <SettingDetailModal
        open={modalOpen}
        entityType={subTab}
        initialData={editingItem}
        bookId={bookId}
        onSave={handleSave}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
      />
    </div>
  );
}
