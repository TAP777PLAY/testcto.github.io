'use client';

import { useState } from 'react';

type BlockType = {
  type: string;
  name: string;
  icon: string;
  category: string;
};

const blockTypes: BlockType[] = [
  { type: 'heading', name: 'Заголовок', icon: '📝', category: 'Текст' },
  { type: 'text', name: 'Текст', icon: '📄', category: 'Текст' },
  { type: 'image', name: 'Изображение', icon: '🖼️', category: 'Медиа' },
  { type: 'gallery', name: 'Галерея', icon: '🖼️', category: 'Медиа' },
  { type: 'button', name: 'Кнопка', icon: '🔘', category: 'Элементы' },
  { type: 'form', name: 'Форма', icon: '📋', category: 'Элементы' },
  { type: 'divider', name: 'Разделитель', icon: '➖', category: 'Элементы' },
  { type: 'spacer', name: 'Отступ', icon: '⬜', category: 'Элементы' },
];

const categories = ['Все', 'Текст', 'Медиа', 'Элементы'];

type BlockPanelProps = {
  onAddBlock: (type: string) => void;
};

export function BlockPanel({ onAddBlock }: BlockPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBlocks = blockTypes.filter(block => {
    const matchesCategory = selectedCategory === 'Все' || block.category === selectedCategory;
    const matchesSearch = block.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Блоки</h2>
        
        <input
          type="text"
          placeholder="Поиск блоков..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-1 p-2 border-b border-gray-200 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {filteredBlocks.map((block) => (
            <button
              key={block.type}
              onClick={() => onAddBlock(block.type)}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <span className="text-2xl">{block.icon}</span>
              <div className="text-left">
                <div className="font-medium text-sm text-gray-900">{block.name}</div>
                <div className="text-xs text-gray-500">{block.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
