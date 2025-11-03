'use client';

import { Block } from '@/components/BlockEditor';
import { useState } from 'react';

type BlockContent = Record<string, unknown>;

type BlockEditorProps = {
  block: Block;
  onUpdate: (blockId: string, content: BlockContent) => void;
  onStopEditing: () => void;
};

export function HeadingEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [text, setText] = useState(block.content.text || '');
  const [level, setLevel] = useState(block.content.level || 'h2');

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, text, level });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Текст заголовка"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      >
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="h6">H6</option>
      </select>
      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

export function TextEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [text, setText] = useState(block.content.text || '');

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, text });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Текст"
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

export function ImageEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [url, setUrl] = useState(block.content.url || '');
  const [alt, setAlt] = useState(block.content.alt || '');
  const [width, setWidth] = useState(block.content.width || '100%');

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, url, alt, width });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL изображения"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Альтернативный текст"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <div>
        <label className="block text-sm text-gray-600 mb-1">Ширина</label>
        <input
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="100%"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

type GalleryImage = { url: string; alt: string };

export function GalleryEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [images, setImages] = useState<GalleryImage[]>(block.content.images as GalleryImage[] || []);
  const [columns, setColumns] = useState(block.content.columns as number || 3);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');

  const handleAddImage = () => {
    if (newImageUrl) {
      setImages([...images, { url: newImageUrl, alt: newImageAlt }]);
      setNewImageUrl('');
      setNewImageAlt('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i: number) => i !== index));
  };

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, images, columns });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Количество колонок</label>
        <select
          value={columns}
          onChange={(e) => setColumns(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>

      <div className="border-t pt-3">
        <label className="block text-sm text-gray-600 mb-2">Изображения</label>
        <div className="space-y-2 mb-3">
          {images.map((img: GalleryImage, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <img src={img.url} alt={img.alt} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 text-sm truncate">{img.url}</div>
              <button
                onClick={() => handleRemoveImage(idx)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="URL изображения"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <input
            value={newImageAlt}
            onChange={(e) => setNewImageAlt(e.target.value)}
            placeholder="Описание (alt)"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleAddImage}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Добавить изображение
          </button>
        </div>
      </div>

      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

export function ButtonEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [text, setText] = useState(block.content.text || '');
  const [link, setLink] = useState(block.content.link || '');
  const [style, setStyle] = useState(block.content.style || 'primary');

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, text, link, style });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Текст кнопки"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Ссылка"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <select
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded"
      >
        <option value="primary">Основная</option>
        <option value="secondary">Вторичная</option>
        <option value="outline">Контурная</option>
      </select>
      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

type FormField = {
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
};

export function FormEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [title, setTitle] = useState(block.content.title as string || '');
  const [fields, setFields] = useState<FormField[]>(block.content.fields as FormField[] || []);
  const [submitText, setSubmitText] = useState(block.content.submitText as string || 'Отправить');

  const handleAddField = () => {
    setFields([...fields, { label: '', type: 'text', placeholder: '', required: false }]);
  };

  const handleUpdateField = (index: number, key: string, value: string | boolean) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i: number) => i !== index));
  };

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, title, fields, submitText });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название формы"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />

      <div className="border-t pt-3">
        <label className="block text-sm text-gray-600 mb-2">Поля формы</label>
        <div className="space-y-3 mb-3">
          {fields.map((field: FormField, idx: number) => (
            <div key={idx} className="p-3 bg-gray-50 rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Поле {idx + 1}</span>
                <button
                  onClick={() => handleRemoveField(idx)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Удалить
                </button>
              </div>
              <input
                value={field.label}
                onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                placeholder="Название поля"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <select
                value={field.type}
                onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="text">Текст</option>
                <option value="email">Email</option>
                <option value="tel">Телефон</option>
                <option value="textarea">Многострочный текст</option>
                <option value="select">Выпадающий список</option>
              </select>
              <input
                value={field.placeholder}
                onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                placeholder="Подсказка"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                />
                <span className="text-sm">Обязательное поле</span>
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddField}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Добавить поле
        </button>
      </div>

      <input
        value={submitText}
        onChange={(e) => setSubmitText(e.target.value)}
        placeholder="Текст кнопки отправки"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />

      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

export function DividerEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [thickness, setThickness] = useState(block.content.thickness || '1px');
  const [style, setStyle] = useState(block.content.style || 'solid');

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, thickness, style });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Толщина</label>
        <input
          value={thickness}
          onChange={(e) => setThickness(e.target.value)}
          placeholder="1px"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Стиль</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="solid">Сплошная</option>
          <option value="dashed">Пунктирная</option>
          <option value="dotted">Точечная</option>
        </select>
      </div>
      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

export function SpacerEditor({ block, onUpdate, onStopEditing }: BlockEditorProps) {
  const [height, setHeight] = useState(block.content.height || '40px');

  const handleSave = () => {
    onUpdate(block.id, { ...block.content, height });
    onStopEditing();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Высота</label>
        <input
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="40px"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>
      <EditorButtons onSave={handleSave} onCancel={onStopEditing} />
    </div>
  );
}

function EditorButtons({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        onClick={onSave}
        className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Сохранить
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Отмена
      </button>
    </div>
  );
}
