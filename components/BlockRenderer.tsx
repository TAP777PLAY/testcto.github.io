'use client';

import { Block } from './BlockEditor';

type BlockRendererProps = {
  block: Block;
  isPreview?: boolean;
};

export function BlockRenderer({ block, isPreview = false }: BlockRendererProps) {
  const styles = block.content.styles || {};
  const blockStyle = {
    backgroundColor: styles.backgroundColor,
    color: styles.color,
    textAlign: styles.textAlign as 'left' | 'center' | 'right' | 'justify' | undefined,
    padding: styles.padding,
    margin: styles.margin,
    borderRadius: styles.borderRadius,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
  };

  switch (block.type) {
    case 'heading':
      const HeadingTag = block.content.level || 'h2';
      return (
        <HeadingTag className="text-2xl font-bold" style={blockStyle}>
          {block.content.text || 'Заголовок'}
        </HeadingTag>
      );

    case 'text':
      return (
        <p className="text-gray-700 whitespace-pre-wrap" style={blockStyle}>
          {block.content.text || 'Текстовый блок'}
        </p>
      );

    case 'image':
      return (
        <div className="flex justify-center" style={blockStyle}>
          {block.content.url ? (
            <img
              src={block.content.url}
              alt={block.content.alt || ''}
              className="max-w-full h-auto rounded"
              style={{ maxWidth: block.content.width || '100%' }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500">Изображение не загружено</span>
            </div>
          )}
        </div>
      );

    case 'gallery':
      const images = block.content.images || [];
      const columns = block.content.columns || 3;
      return (
        <div 
          className="grid gap-4" 
          style={{
            ...blockStyle,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {images.length > 0 ? (
            images.map((img: { url: string; alt?: string }, idx: number) => (
              <div key={idx} className="overflow-hidden rounded">
                <img
                  src={img.url}
                  alt={img.alt || ''}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="col-span-full h-48 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500">Галерея пуста</span>
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
      const buttonStyle = buttonStyles[block.content.style as keyof typeof buttonStyles] || buttonStyles.primary;
      
      return (
        <div style={blockStyle}>
          <a
            href={block.content.link || '#'}
            className={`inline-block px-6 py-3 rounded font-medium transition ${buttonStyle}`}
          >
            {block.content.text || 'Кнопка'}
          </a>
        </div>
      );

    case 'form':
      type FormField = {
        label: string;
        type: string;
        placeholder?: string;
        required?: boolean;
        options?: string[];
      };
      const fields = (block.content.fields || []) as FormField[];
      return (
        <form className="space-y-4" style={blockStyle} onSubmit={(e) => e.preventDefault()}>
          <h3 className="text-xl font-bold mb-4">{block.content.title || 'Форма'}</h3>
          {fields.length > 0 ? (
            fields.map((field: FormField, idx: number) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                ) : field.type === 'select' ? (
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Выберите...</option>
                    {field.options?.map((opt: string, i: number) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">Добавьте поля формы</div>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {block.content.submitText || 'Отправить'}
          </button>
        </form>
      );

    case 'divider':
      return (
        <hr 
          style={{
            ...blockStyle,
            borderColor: styles.color || '#e5e7eb',
            borderWidth: block.content.thickness || '1px',
            borderStyle: block.content.style || 'solid',
          }} 
        />
      );

    case 'spacer':
      return (
        <div 
          style={{
            height: block.content.height || '40px',
            ...blockStyle,
          }} 
        />
      );

    default:
      return <div className="text-gray-400">Неизвестный тип блока: {block.type}</div>;
  }
}
