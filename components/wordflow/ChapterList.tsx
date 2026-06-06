'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText, Plus, Trash2 } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  wordCount: number;
  sortOrder: number;
  status: string;
}

interface ChapterListProps {
  chapters: Chapter[];
  activeChapterId?: string;
  onSelect: (chapterId: string) => void;
  onReorder: (chapterIds: string[]) => void;
  onAdd: () => void;
  onDelete: (chapterId: string) => void;
}

function SortableChapter({
  chapter,
  isActive,
  onSelect,
  onDelete,
}: {
  chapter: Chapter;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
        isActive
          ? 'border-blue-300 bg-blue-50'
          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
      } ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-gray-300 hover:text-gray-500"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <FileText className="h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-700">
          {chapter.title || '无标题'}
        </p>
        <p className="text-xs text-gray-400">{chapter.wordCount} 字</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 text-gray-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ChapterList({
  chapters,
  activeChapterId,
  onSelect,
  onReorder,
  onAdd,
  onDelete,
}: ChapterListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((c) => c.id === active.id);
      const newIndex = chapters.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(chapters, oldIndex, newIndex);
      onReorder(newOrder.map((c) => c.id));
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">章节列表</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          新建章节
        </button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {chapters.map((chapter) => (
            <SortableChapter
              key={chapter.id}
              chapter={chapter}
              isActive={chapter.id === activeChapterId}
              onSelect={() => onSelect(chapter.id)}
              onDelete={() => onDelete(chapter.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {chapters.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">暂无章节</p>
      )}
    </div>
  );
}
