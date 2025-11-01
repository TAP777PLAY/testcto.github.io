'use client';

import { Block } from '@/components/BlockEditor';
import { useEditorStore } from '@/lib/editorStore';

type SettingsPanelProps = {
  selectedBlock: Block | null;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
};

export function SettingsPanel({ selectedBlock, onUpdateBlock }: SettingsPanelProps) {
  const { setSelectedBlock } = useEditorStore();

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Настройки</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="text-gray-400">
            <div className="text-4xl mb-2">⚙️</div>
            <p className="text-sm">Выберите блок для настройки</p>
          </div>
        </div>
      </div>
    );
  }

  const handleStyleChange = (property: string, value: string) => {
    const currentStyles = selectedBlock.content.styles || {};
    onUpdateBlock(selectedBlock.id, {
      content: {
        ...selectedBlock.content,
        styles: {
          ...currentStyles,
          [property]: value,
        },
      },
    });
  };

  const styles = selectedBlock.content.styles || {};

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Настройки блока</h2>
        <button
          onClick={() => setSelectedBlock(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Тип блока</h3>
          <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
            {selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Стили</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Цвет фона
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Цвет текста
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Выравнивание
              </label>
              <select
                value={styles.textAlign || 'left'}
                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="left">Слева</option>
                <option value="center">По центру</option>
                <option value="right">Справа</option>
                <option value="justify">По ширине</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Отступы (padding)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={parseInt(styles.padding || '16')}
                onChange={(e) => handleStyleChange('padding', e.target.value + 'px')}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {styles.padding || '16px'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Внешние отступы (margin)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={parseInt(styles.margin || '0')}
                onChange={(e) => handleStyleChange('margin', e.target.value + 'px')}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {styles.margin || '0px'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Скругление углов
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={parseInt(styles.borderRadius || '0')}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value + 'px')}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {styles.borderRadius || '0px'}
              </div>
            </div>

            {(selectedBlock.type === 'heading' || selectedBlock.type === 'text') && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Размер шрифта
                  </label>
                  <select
                    value={styles.fontSize || '16px'}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="32px">32px</option>
                    <option value="40px">40px</option>
                    <option value="48px">48px</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Толщина шрифта
                  </label>
                  <select
                    value={styles.fontWeight || 'normal'}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="300">Тонкий (300)</option>
                    <option value="normal">Обычный (400)</option>
                    <option value="500">Средний (500)</option>
                    <option value="600">Полужирный (600)</option>
                    <option value="bold">Жирный (700)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
