'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from './BlockEditor';
import { BlockRenderer } from './BlockRenderer';
import {
  HeadingEditor,
  TextEditor,
  ImageEditor,
  GalleryEditor,
  ButtonEditor,
  FormEditor,
  DividerEditor,
  SpacerEditor,
} from './PageBuilder/BlockEditors';
import { useEditorStore } from '@/lib/editorStore';

type SortableBlockProps = {
  block: Block;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onDelete: (blockId: string) => void;
  onStopEditing: () => void;
  onSelect: () => void;
  isSelected: boolean;
};

export function SortableBlock({
  block,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onStopEditing,
  onSelect,
  isSelected,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const { previewMode } = useEditorStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (previewMode) {
    return (
      <div className="mb-2">
        <BlockRenderer block={block} isPreview />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className={`border rounded-lg p-4 bg-white transition-all ${
          isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-400'
        }`}
        onClick={onSelect}
      >
        {!isEditing && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              {...attributes}
              {...listeners}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm cursor-move"
              title="Переместить"
            >
              ⋮⋮
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Удалить этот блок?')) {
                  onDelete(block.id);
                }
              }}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        )}

        {isEditing ? (
          <BlockEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />
        ) : (
          <BlockRenderer block={block} />
        )}
      </div>
    </div>
  );
}

type BlockEditorProps = {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onStopEditing: () => void;
};

function BlockEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  switch (block.type) {
    case 'heading':
      return <HeadingEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    case 'text':
      return <TextEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    case 'image':
      return <ImageEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    case 'gallery':
      return <GalleryEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    case 'button':
      return <ButtonEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    case 'form':
      return <FormEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    case 'divider':
      return <DividerEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    case 'spacer':
      return <SpacerEditor block={block} onUpdate={onUpdate} onStopEditing={onStopEditing} />;
    default:
      return <div>Редактор для типа {block.type} не найден</div>;
  }
}
