'use client';

import { useEffect, useState } from 'react';

type Media = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  userId: string;
  createdAt: string;
};

export default function AdminMedia() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMedia();
  }, [typeFilter, page]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(typeFilter && { type: typeFilter }),
      });

      const response = await fetch(`/api/admin/media?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Ошибка загрузки медиа:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Медиа библиотека</h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            <option value="image">Изображения</option>
            <option value="video">Видео</option>
            <option value="document">Документы</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        ) : media.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Медиа файлы не найдены</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-4xl">
                      {item.type === 'video' ? '🎥' : '📄'}
                    </div>
                  )}
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatFileSize(item.size)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Предыдущая
                  </button>
                  <span className="text-sm text-gray-700">
                    Страница {page} из {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Следующая
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
