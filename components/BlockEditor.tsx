'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';

export type Block = {
  id: string;
  type: string;
  content: any;
  order: number;
};

type BlockEditorProps = {
  blocks: Block[];
  onUpdateBlocks: (blocks: Block[]) => void;
  onAddBlock: (type: string) => void;
  onDeleteBlock: (blockId: string) => void;
};

export default function BlockEditor({ blocks, onUpdateBlocks, onAddBlock, onDeleteBlock }: BlockEditorProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index,
      }));
      onUpdateBlocks(newBlocks);
    }
  };

  const handleUpdateBlock = (blockId: string, content: any) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, content } : block
    );
    onUpdateBlocks(newBlocks);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => onAddBlock('heading')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Заголовок
        </button>
        <button
          onClick={() => onAddBlock('text')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Текст
        </button>
        <button
          onClick={() => onAddBlock('image')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Изображение
        </button>
        <button
          onClick={() => onAddBlock('button')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Кнопка
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                isEditing={editingBlock === block.id}
                onEdit={() => setEditingBlock(block.id)}
                onUpdate={handleUpdateBlock}
                onDelete={onDeleteBlock}
                onStopEditing={() => setEditingBlock(null)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Страница пуста. Добавьте первый блок!</p>
        </div>
      )}
    </div>
  );
}
