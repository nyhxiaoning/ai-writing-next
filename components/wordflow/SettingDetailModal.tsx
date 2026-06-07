'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
interface SettingDetailModalProps {
  open: boolean;
  entityType: 'characters' | 'factions' | 'equipment';
  initialData?: any;
  bookId: string;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

// ─── Options ──────────────────────────────────────────────────────
const ROLE_OPTIONS = ['主角', '反派', '配角', '主要角色', '次要角色', '其他'];
const FACTION_TYPE_OPTIONS = ['政治', '军事', '宗教', '商业', '秘密组织', '其他'];
const EQUIPMENT_TYPE_OPTIONS = ['武器', '防具', '饰品', '工具', '法器', '其他'];
const RARITY_OPTIONS = ['普通', '精良', '稀有', '史诗', '传说'];

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'reference-select';
  required?: boolean;
  options?: string[];
  refEntityType?: 'characters' | 'factions';
  placeholder?: string;
}

function getFieldConfig(entityType: string): FieldConfig[] {
  switch (entityType) {
    case 'characters':
      return [
        { key: 'name', label: '名称', type: 'text', required: true },
        { key: 'alias', label: '别名', type: 'text' },
        { key: 'role', label: '角色定位', type: 'select', options: ROLE_OPTIONS },
        { key: 'factionId', label: '所属势力', type: 'reference-select', refEntityType: 'factions' },
        { key: 'appearance', label: '外貌', type: 'textarea', placeholder: '描述角色的外貌特征...' },
        { key: 'personality', label: '性格', type: 'textarea', placeholder: '描述角色的性格特点...' },
        { key: 'background', label: '背景', type: 'textarea', placeholder: '角色的背景故事...' },
        { key: 'abilities', label: '能力', type: 'textarea', placeholder: '角色的能力或特长...' },
        { key: 'description', label: '描述', type: 'textarea', placeholder: '其他补充描述...' },
      ];
    case 'factions':
      return [
        { key: 'name', label: '名称', type: 'text', required: true },
        { key: 'type', label: '类型', type: 'select', options: FACTION_TYPE_OPTIONS },
        { key: 'leaderId', label: '领袖', type: 'reference-select', refEntityType: 'characters' },
        { key: 'territory', label: '领地/范围', type: 'text', placeholder: '势力控制的区域...' },
        { key: 'ideology', label: '理念/宗旨', type: 'textarea', placeholder: '势力的核心信条或目标...' },
        { key: 'description', label: '描述', type: 'textarea', placeholder: '势力的详细介绍...' },
      ];
    case 'equipment':
      return [
        { key: 'name', label: '名称', type: 'text', required: true },
        { key: 'type', label: '类型', type: 'select', options: EQUIPMENT_TYPE_OPTIONS },
        { key: 'rarity', label: '稀有度', type: 'select', options: RARITY_OPTIONS },
        { key: 'ownerId', label: '持有者', type: 'reference-select', refEntityType: 'characters' },
        { key: 'properties', label: '属性/效果', type: 'textarea', placeholder: '装备的属性加成或特殊效果...' },
        { key: 'description', label: '描述', type: 'textarea', placeholder: '装备的外观和来历...' },
      ];
    default:
      return [];
  }
}

// ─── Component ────────────────────────────────────────────────────
export default function SettingDetailModal({
  open, entityType, initialData, bookId, onSave, onClose,
}: SettingDetailModalProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [references, setReferences] = useState<Record<string, any[]>>({});
  const [loadingRefs, setLoadingRefs] = useState(false);

  const isEdit = !!initialData;
  const fields = getFieldConfig(entityType);

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      const f: Record<string, string> = {};
      fields.forEach((field) => {
        f[field.key] = initialData[field.key] || '';
      });
      setForm(f);
    } else {
      const f: Record<string, string> = {};
      fields.forEach((field) => {
        if (field.type === 'select' && field.options && field.options.length > 0) {
          // Set first option as default for non-reference selects (optional fields can be empty)
          f[field.key] = '';
        } else {
          f[field.key] = '';
        }
      });
      setForm(f);
    }
  }, [open, initialData, entityType]);

  // Fetch reference data (factions for character form, characters for faction/equipment form)
  useEffect(() => {
    if (!open) return;
    const refTypes = new Set<string>();
    fields.forEach((f) => {
      if (f.type === 'reference-select' && f.refEntityType) {
        refTypes.add(f.refEntityType);
      }
    });
    if (refTypes.size === 0) return;

    setLoadingRefs(true);
    Promise.all(
      Array.from(refTypes).map(async (refType) => {
        try {
          const r = await fetch(`/api/wordflow/books/${bookId}/${refType}`);
          if (r.ok) {
            const data = await r.json();
            return { refType, items: data[refType] || [] };
          }
        } catch {}
        return { refType, items: [] };
      })
    ).then((results) => {
      const refs: Record<string, any[]> = {};
      results.forEach(({ refType, items }) => { refs[refType] = items; });
      setReferences(refs);
      setLoadingRefs(false);
    });
  }, [open, bookId, entityType]);

  const handleSave = async () => {
    // Validate required fields
    for (const field of fields) {
      if (field.required && !form[field.key]?.trim()) {
        return;
      }
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const entityLabels: Record<string, string> = {
    characters: '人物',
    factions: '势力',
    equipment: '装备',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="max-w-lg w-full mx-4 rounded-xl bg-white p-0 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            {isEdit ? '编辑' : '新建'}{entityLabels[entityType]}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="ml-0.5 text-red-500">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 min-h-[80px]"
                  />
                ) : field.type === 'select' || field.type === 'reference-select' ? (
                  <div className="relative">
                    <select
                      value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 bg-white appearance-none"
                    >
                      <option value="">{field.type === 'reference-select' ? '（无）' : '（不限）'}</option>
                      {field.type === 'reference-select' && field.refEntityType
                        ? (references[field.refEntityType] || []).map((ref: any) => (
                            <option key={ref.id} value={ref.id}>{ref.name}</option>
                          ))
                        : field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))
                      }
                    </select>
                    {field.type === 'reference-select' && loadingRefs && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
}
