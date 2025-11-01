'use client';

import { useState } from 'react';
import FeedbackForm from './FeedbackForm';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 z-40"
        aria-label="Обратная связь"
        title="Сообщить о проблеме или предложить улучшение"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="hidden sm:inline">Обратная связь</span>
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <FeedbackForm onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
