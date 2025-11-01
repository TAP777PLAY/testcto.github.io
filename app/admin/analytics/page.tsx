'use client';

import { useEffect, useState } from 'react';

type Analytics = {
  overview: {
    totalUsers: number;
    totalSites: number;
    totalPages: number;
    publishedSites: number;
    publishedPages: number;
    pageViews: number;
    recentUsers: number;
  };
  charts: {
    activityByDay: Array<{ date: string; count: number }>;
    pageViewsByDay: Array<{ date: string; count: number }>;
  };
  topPages: Array<{
    page: any;
    views: number;
  }>;
};

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Не удалось загрузить данные</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Последние 24 часа</option>
          <option value="7d">Последние 7 дней</option>
          <option value="30d">Последние 30 дней</option>
          <option value="90d">Последние 90 дней</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Просмотры страниц</div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.overview.pageViews.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">За выбранный период</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Новых пользователей</div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.overview.recentUsers}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Всего: {analytics.overview.totalUsers}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Опубликовано</div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.overview.publishedPages}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            страниц на {analytics.overview.publishedSites} сайтах
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Просмотры по дням</h2>
          {analytics.charts.pageViewsByDay.length === 0 ? (
            <p className="text-gray-500">Нет данных</p>
          ) : (
            <div className="space-y-2">
              {analytics.charts.pageViewsByDay.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('ru-RU', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="bg-blue-500 h-6 rounded"
                      style={{
                        width: `${Math.min(
                          100,
                          (item.count /
                            Math.max(...analytics.charts.pageViewsByDay.map((d) => d.count))) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-900">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Топ страниц</h2>
          {analytics.topPages.length === 0 ? (
            <p className="text-gray-500">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {analytics.topPages.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {item.page?.title || 'Без названия'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {item.page?.site?.name} / {item.page?.slug}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-lg font-semibold text-blue-600">{item.views}</div>
                    <div className="text-xs text-gray-500">просмотров</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Активность по дням</h2>
        {analytics.charts.activityByDay.length === 0 ? (
          <p className="text-gray-500">Нет данных</p>
        ) : (
          <div className="space-y-2">
            {analytics.charts.activityByDay.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1">
                  <div
                    className="bg-green-500 h-6 rounded"
                    style={{
                      width: `${Math.min(
                        100,
                        (item.count /
                          Math.max(...analytics.charts.activityByDay.map((d) => d.count))) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <div className="w-16 text-right text-sm font-medium text-gray-900">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
