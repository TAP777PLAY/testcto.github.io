'use client';

import { useEffect, useState } from 'react';

type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: any;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(actionFilter && { action: actionFilter }),
        ...(entityFilter && { entity: entityFilter }),
      });

      const response = await fetch(`/api/admin/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      publish: 'bg-purple-100 text-purple-800',
      unpublish: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          colors[action] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {action}
      </span>
    );
  };

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Логи активности</h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все действия</option>
              <option value="create">Создание</option>
              <option value="update">Обновление</option>
              <option value="delete">Удаление</option>
              <option value="publish">Публикация</option>
              <option value="unpublish">Снятие с публикации</option>
            </select>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все сущности</option>
              <option value="site">Сайты</option>
              <option value="page">Страницы</option>
              <option value="block">Блоки</option>
              <option value="user">Пользователи</option>
              <option value="settings">Настройки</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Логи не найдены</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {log.user.image ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={log.user.image}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                          {(log.user.name || log.user.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {log.user.name || log.user.email}
                        </span>
                        {getActionBadge(log.action)}
                        <span className="text-gray-500">
                          {log.entity}
                          {log.entityId && ` (${log.entityId.substring(0, 8)}...)`}
                        </span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-sm text-gray-500 bg-gray-50 rounded p-2 mt-2 font-mono">
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(log.createdAt).toLocaleString('ru-RU')}
                      </div>
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
