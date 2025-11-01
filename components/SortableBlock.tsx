'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from './BlockEditor';
import { BlockRenderer } from './BlockRenderer';

type SortableBlockProps = {
  block: Block;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (blockId: string, content: any) => void;
  onDelete: (blockId: string) => void;
  onStopEditing: () => void;
};

export function SortableBlock({ block, isEditing, onEdit, onUpdate, onDelete, onStopEditing }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-400">
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm cursor-move"
          >
            ⋮⋮
          </button>
          <button
            onClick={onEdit}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            🗑️
          </button>
        </div>

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
  onUpdate: (blockId: string, content: any) => void;
  onStopEditing: () => void;
};

function BlockEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let content: any = {};
    
    switch (block.type) {
      case 'heading':
        content = {
          text: formData.get('text'),
          level: formData.get('level'),
        };
        break;
      case 'text':
        content = {
          text: formData.get('text'),
        };
        break;
      case 'image':
        content = {
          url: formData.get('url'),
          alt: formData.get('alt'),
        };
        break;
      case 'button':
        content = {
          text: formData.get('text'),
          link: formData.get('link'),
          style: formData.get('style'),
        };
        break;
    }

    onUpdate(block.id, content);
    onStopEditing();
  };

  return (
    <form onSubmit={handleSave} className="space-y-3">
      {block.type === 'heading' && (
        <>
          <input
            name="text"
            defaultValue={block.content.text}
            placeholder="Текст заголовка"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <select
            name="level"
            defaultValue={block.content.level || 'h2'}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
          </select>
        </>
      )}

      {block.type === 'text' && (
        <textarea
          name="text"
          defaultValue={block.content.text}
          placeholder="Текст"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      )}

      {block.type === 'image' && (
        <>
          <input
            name="url"
            defaultValue={block.content.url}
            placeholder="URL изображения"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <input
            name="alt"
            defaultValue={block.content.alt}
            placeholder="Альтернативный текст"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </>
      )}

      {block.type === 'button' && (
        <>
          <input
            name="text"
            defaultValue={block.content.text}
            placeholder="Текст кнопки"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <input
            name="link"
            defaultValue={block.content.link}
            placeholder="Ссылка"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <select
            name="style"
            defaultValue={block.content.style || 'primary'}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="primary">Основная</option>
            <option value="secondary">Вторичная</option>
            <option value="outline">Контурная</option>
          </select>
        </>
      )}

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Сохранить
        </button>
        <button
          type="button"
          onClick={onStopEditing}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
