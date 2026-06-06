'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Users, Building2, Swords, Clock, Map, Plus, X } from 'lucide-react';

type Tab = 'characters' | 'factions' | 'equipment' | 'timeline' | 'maps';

interface Character {
  id: string;
  name: string;
  alias?: string;
  role?: string;
  description?: string;
}

interface Faction {
  id: string;
  name: string;
  type?: string;
  description?: string;
  _count?: { members: number };
}

interface Equipment {
  id: string;
  name: string;
  type?: string;
  rarity?: string;
  description?: string;
  owner?: { id: string; name: string };
}

interface TimelineEvent {
  id: string;
  title: string;
  dateLabel?: string;
  description?: string;
  eventType?: string;
  color?: string;
}

interface WorldMap {
  id: string;
  name: string;
  description?: string;
  _count?: { markers: number };
}

export default function WorldBuildingPage() {
  const t = useTranslations('WordFlow');
  const wt = useTranslations('WordFlow.world');
  const params = useParams();
  const bookId = params.bookId as string;
  const [activeTab, setActiveTab] = useState<Tab>('characters');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'characters', label: wt('characters'), icon: <Users className="h-4 w-4" /> },
    { key: 'factions', label: wt('factions'), icon: <Building2 className="h-4 w-4" /> },
    { key: 'equipment', label: wt('equipment'), icon: <Swords className="h-4 w-4" /> },
    { key: 'timeline', label: wt('timeline'), icon: <Clock className="h-4 w-4" /> },
    { key: 'maps', label: wt('maps'), icon: <Map className="h-4 w-4" /> },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'characters' && <CharactersTab bookId={bookId} />}
      {activeTab === 'factions' && <FactionsTab bookId={bookId} />}
      {activeTab === 'equipment' && <EquipmentTab bookId={bookId} />}
      {activeTab === 'timeline' && <TimelineTab bookId={bookId} />}
      {activeTab === 'maps' && <MapsTab bookId={bookId} />}
    </div>
  );
}

function CharactersTab({ bookId }: { bookId: string }) {
  const wt = useTranslations('WordFlow.world');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', alias: '', role: '', description: '' });

  useEffect(() => {
    fetch(`/api/wordflow/books/${bookId}/characters`)
      .then((r) => r.json())
      .then((data) => setCharacters(data.characters || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId]);

  const createCharacter = async () => {
    if (!form.name.trim()) return;
    const res = await fetch(`/api/wordflow/books/${bookId}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setCharacters((prev) => [data.character, ...prev]);
      setShowForm(false);
      setForm({ name: '', alias: '', role: '', description: '' });
    }
  };

  const deleteCharacter = async (id: string) => {
    const res = await fetch(`/api/wordflow/books/${bookId}/characters?id=${id}`, { method: 'DELETE' });
    if (res.ok) setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <div className="py-10 text-center text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{characters.length} 个人物</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {wt('newCharacter')}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={wt('name')}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              value={form.alias || ''}
              onChange={(e) => setForm({ ...form, alias: e.target.value })}
              placeholder={wt('alias')}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              value={form.role || ''}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder={wt('role')}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={wt('description')}
              rows={2}
              className="col-span-2 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">取消</button>
            <button onClick={createCharacter} className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">{wt('newCharacter')}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((c) => (
          <div key={c.id} className="group relative rounded-lg border bg-white p-4 shadow-sm">
            <button
              onClick={() => deleteCharacter(c.id)}
              className="absolute right-2 top-2 hidden text-gray-300 hover:text-red-500 group-hover:block"
            >
              <X className="h-4 w-4" />
            </button>
            <h4 className="font-medium text-gray-900">{c.name}</h4>
            {c.alias && <p className="text-xs text-gray-400">{c.alias}</p>}
            {c.role && <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{c.role}</span>}
            {c.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{c.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FactionsTab({ bookId }: { bookId: string }) {
  const wt = useTranslations('WordFlow.world');
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', description: '' });

  useEffect(() => {
    fetch(`/api/wordflow/books/${bookId}/factions`)
      .then((r) => r.json())
      .then((data) => setFactions(data.factions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId]);

  const createFaction = async () => {
    if (!form.name.trim()) return;
    const res = await fetch(`/api/wordflow/books/${bookId}/factions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setFactions((prev) => [data.faction, ...prev]);
      setShowForm(false);
      setForm({ name: '', type: '', description: '' });
    }
  };

  const deleteFaction = async (id: string) => {
    const res = await fetch(`/api/wordflow/books/${bookId}/factions?id=${id}`, { method: 'DELETE' });
    if (res.ok) setFactions((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) return <div className="py-10 text-center text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{factions.length} 个势力</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> {wt('newFaction')}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={wt('name')} className="rounded border px-3 py-2 text-sm" />
            <input value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder={wt('type')} className="rounded border px-3 py-2 text-sm" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={wt('description')} rows={2} className="col-span-2 rounded border px-3 py-2 text-sm" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">取消</button>
            <button onClick={createFaction} className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">{wt('newFaction')}</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {factions.map((f) => (
          <div key={f.id} className="group relative rounded-lg border bg-white p-4 shadow-sm">
            <button onClick={() => deleteFaction(f.id)} className="absolute right-2 top-2 hidden text-gray-300 hover:text-red-500 group-hover:block"><X className="h-4 w-4" /></button>
            <h4 className="font-medium text-gray-900">{f.name}</h4>
            {f.type && <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{f.type}</span>}
            {f.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{f.description}</p>}
            <p className="mt-2 text-xs text-gray-400">{f._count?.members || 0} 个成员</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EquipmentTab({ bookId }: { bookId: string }) {
  const wt = useTranslations('WordFlow.world');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', rarity: '', description: '' });

  useEffect(() => {
    fetch(`/api/wordflow/books/${bookId}/equipment`)
      .then((r) => r.json())
      .then((data) => setEquipment(data.equipment || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId]);

  const createEquipment = async () => {
    if (!form.name.trim()) return;
    const res = await fetch(`/api/wordflow/books/${bookId}/equipment`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setEquipment((prev) => [data.equipment, ...prev]);
      setShowForm(false);
      setForm({ name: '', type: '', rarity: '', description: '' });
    }
  };

  const deleteEquipment = async (id: string) => {
    const res = await fetch(`/api/wordflow/books/${bookId}/equipment?id=${id}`, { method: 'DELETE' });
    if (res.ok) setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <div className="py-10 text-center text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{equipment.length} 个装备</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> {wt('newEquipment')}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={wt('name')} className="rounded border px-3 py-2 text-sm" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded border px-3 py-2 text-sm">
              <option value="">{wt('type')}</option>
              <option value="weapon">武器</option>
              <option value="armor">防具</option>
              <option value="artifact">法宝</option>
              <option value="tool">工具</option>
              <option value="consumable">消耗品</option>
            </select>
            <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} className="rounded border px-3 py-2 text-sm">
              <option value="">{wt('rarity')}</option>
              <option value="common">普通</option>
              <option value="uncommon">稀有</option>
              <option value="rare">精良</option>
              <option value="epic">史诗</option>
              <option value="legendary">传说</option>
              <option value="mythic">神话</option>
            </select>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={wt('description')} rows={2} className="col-span-2 rounded border px-3 py-2 text-sm" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">取消</button>
            <button onClick={createEquipment} className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">{wt('newEquipment')}</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {equipment.map((e) => (
          <div key={e.id} className="group relative rounded-lg border bg-white p-4 shadow-sm">
            <button onClick={() => deleteEquipment(e.id)} className="absolute right-2 top-2 hidden text-gray-300 hover:text-red-500 group-hover:block"><X className="h-4 w-4" /></button>
            <h4 className="font-medium text-gray-900">{e.name}</h4>
            <div className="mt-1 flex gap-2">
              {e.type && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{e.type}</span>}
              {e.rarity && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${e.rarity === 'legendary' ? 'bg-orange-100 text-orange-700' : e.rarity === 'epic' ? 'bg-purple-100 text-purple-700' : e.rarity === 'rare' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {e.rarity}
                </span>
              )}
            </div>
            {e.owner && <p className="mt-1 text-xs text-gray-400">持有者: {e.owner.name}</p>}
            {e.description && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{e.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineTab({ bookId }: { bookId: string }) {
  const wt = useTranslations('WordFlow.world');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', dateLabel: '', description: '', color: '#3B82F6' });

  useEffect(() => {
    fetch(`/api/wordflow/books/${bookId}/timeline`)
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId]);

  const createEvent = async () => {
    if (!form.title.trim()) return;
    const res = await fetch(`/api/wordflow/books/${bookId}/timeline`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sortOrder: events.length }),
    });
    if (res.ok) {
      const data = await res.json();
      setEvents((prev) => [...prev, data.event]);
      setShowForm(false);
      setForm({ title: '', dateLabel: '', description: '', color: '#3B82F6' });
    }
  };

  const deleteEvent = async (id: string) => {
    const res = await fetch(`/api/wordflow/books/${bookId}/timeline?id=${id}`, { method: 'DELETE' });
    if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) return <div className="py-10 text-center text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{events.length} 个事件</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> {wt('newEvent')}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="事件标题" className="rounded border px-3 py-2 text-sm" />
            <input value={form.dateLabel || ''} onChange={(e) => setForm({ ...form, dateLabel: e.target.value })} placeholder={wt('dateLabel')} className="rounded border px-3 py-2 text-sm" />
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-9 w-9 rounded border p-0.5" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={wt('description')} rows={2} className="col-span-2 rounded border px-3 py-2 text-sm" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">取消</button>
            <button onClick={createEvent} className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">{wt('newEvent')}</button>
          </div>
        </div>
      )}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="group relative ml-10">
              {/* Dot */}
              <div className="absolute -left-[34px] top-1.5 h-3 w-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: event.color || '#3B82F6' }} />
              <div className="rounded-lg border bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {event.dateLabel && <span className="text-xs text-gray-400">{event.dateLabel}</span>}
                  </div>
                  <button onClick={() => deleteEvent(event.id)} className="text-gray-300 hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
                {event.description && <p className="mt-1 text-sm text-gray-500">{event.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapsTab({ bookId }: { bookId: string }) {
  const wt = useTranslations('WordFlow.world');
  const [maps, setMaps] = useState<WorldMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetch(`/api/wordflow/books/${bookId}/maps`)
      .then((r) => r.json())
      .then((data) => setMaps(data.maps || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookId]);

  const createMap = async () => {
    if (!form.name.trim()) return;
    const res = await fetch(`/api/wordflow/books/${bookId}/maps`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setMaps((prev) => [data.map, ...prev]);
      setShowForm(false);
      setForm({ name: '', description: '' });
    }
  };

  const deleteMap = async (id: string) => {
    const res = await fetch(`/api/wordflow/books/${bookId}/maps?id=${id}`, { method: 'DELETE' });
    if (res.ok) setMaps((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) return <div className="py-10 text-center text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{maps.length} 张地图</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> {wt('newMap')}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={wt('name')} className="rounded border px-3 py-2 text-sm" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={wt('description')} rows={2} className="col-span-2 rounded border px-3 py-2 text-sm" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">取消</button>
            <button onClick={createMap} className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">{wt('newMap')}</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {maps.map((m) => (
          <div key={m.id} className="group relative rounded-lg border bg-white p-4 shadow-sm">
            <button onClick={() => deleteMap(m.id)} className="absolute right-2 top-2 hidden text-gray-300 hover:text-red-500 group-hover:block"><X className="h-4 w-4" /></button>
            <div className="flex h-32 items-center justify-center rounded-md bg-gray-100 text-gray-400">
              <Map className="h-8 w-8" />
            </div>
            <h4 className="mt-2 font-medium text-gray-900">{m.name}</h4>
            {m.description && <p className="text-sm text-gray-500">{m.description}</p>}
            <p className="text-xs text-gray-400">{m._count?.markers || 0} 个标记</p>
          </div>
        ))}
      </div>
    </div>
  );
}
