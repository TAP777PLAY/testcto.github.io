'use client';

import { Block } from './BlockEditor';

type BlockRendererProps = {
  block: Block;
};

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = block.content.level || 'h2';
      return (
        <HeadingTag className="text-2xl font-bold">
          {block.content.text || 'Заголовок'}
        </HeadingTag>
      );

    case 'text':
      return (
        <p className="text-gray-700 whitespace-pre-wrap">
          {block.content.text || 'Текстовый блок'}
        </p>
      );

    case 'image':
      return (
        <div className="flex justify-center">
          {block.content.url ? (
            <img
              src={block.content.url}
              alt={block.content.alt || ''}
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500">Изображение не загружено</span>
            </div>
          )}
        </div>
      );

    case 'button':
      const buttonStyles = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
      };
      const style = buttonStyles[block.content.style as keyof typeof buttonStyles] || buttonStyles.primary;
      
      return (
        <a
          href={block.content.link || '#'}
          className={`inline-block px-6 py-3 rounded font-medium transition ${style}`}
        >
          {block.content.text || 'Кнопка'}
        </a>
      );

    default:
      return <div className="text-gray-400">Неизвестный тип блока: {block.type}</div>;
  }
}
