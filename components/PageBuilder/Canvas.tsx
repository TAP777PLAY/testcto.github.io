'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlock } from '../SortableBlock';
import { Block } from '../BlockEditor';
import { useEditorStore } from '@/lib/editorStore';
import { useState } from 'react';

type CanvasProps = {
  blocks: Block[];
  onUpdateBlocks: (blocks: Block[]) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
};

export function Canvas({ blocks, onUpdateBlocks, onUpdateBlock, onDeleteBlock }: CanvasProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const { selectedBlockId, setSelectedBlock, previewMode } = useEditorStore();

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

  const handleUpdateBlock = (blockId: string, content: Record<string, unknown>) => {
    onUpdateBlock(blockId, { content });
  };

  return (
    <div className={`flex-1 overflow-y-auto ${previewMode ? 'bg-white' : 'bg-gray-50'} p-6`}>
      <div className={`max-w-4xl mx-auto ${previewMode ? '' : 'min-h-screen'}`}>
        {!previewMode && blocks.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Страница пуста</h3>
            <p className="text-gray-500">Добавьте первый блок из панели слева</p>
          </div>
        )}

        {previewMode && blocks.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-500">Нет контента для отображения</p>
          </div>
        )}

        {blocks.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className={previewMode ? 'space-y-0' : 'space-y-2'}>
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isEditing={editingBlock === block.id}
                    onEdit={() => setEditingBlock(block.id)}
                    onUpdate={handleUpdateBlock}
                    onDelete={onDeleteBlock}
                    onStopEditing={() => setEditingBlock(null)}
                    onSelect={() => setSelectedBlock(block.id)}
                    isSelected={selectedBlockId === block.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
