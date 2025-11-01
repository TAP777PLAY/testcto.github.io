'use client';

import { useEditorStore } from '@/lib/editorStore';
import Link from 'next/link';

type ToolbarProps = {
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function Toolbar({ onSave, canUndo, canRedo }: ToolbarProps) {
  const { undo, redo, previewMode, togglePreview } = useEditorStore();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Назад
        </Link>
        <div className="h-6 w-px bg-gray-300" />
        <h1 className="text-lg font-bold text-gray-900">Редактор страниц</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`px-3 py-2 rounded flex items-center gap-2 ${
            canUndo
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          title="Отменить (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="hidden sm:inline">Отменить</span>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`px-3 py-2 rounded flex items-center gap-2 ${
            canRedo
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          title="Повторить (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
          <span className="hidden sm:inline">Повторить</span>
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button
          onClick={togglePreview}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            previewMode
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="Переключить предпросмотр"
        >
          {previewMode ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Редактор</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Просмотр</span>
            </>
          )}
        </button>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          title="Сохранить (Ctrl+S)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>Сохранить</span>
        </button>
      </div>
    </div>
  );
}
