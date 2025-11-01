'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  recentActivities: Array<any>;
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Всего пользователей"
          value={analytics.overview.totalUsers}
          change={`+${analytics.overview.recentUsers} за период`}
          icon="👥"
          link="/admin/users"
        />
        <StatsCard
          title="Всего сайтов"
          value={analytics.overview.totalSites}
          subtitle={`${analytics.overview.publishedSites} опубликовано`}
          icon="🌐"
        />
        <StatsCard
          title="Всего страниц"
          value={analytics.overview.totalPages}
          subtitle={`${analytics.overview.publishedPages} опубликовано`}
          icon="📄"
          link="/admin/pages"
        />
        <StatsCard
          title="Просмотры страниц"
          value={analytics.overview.pageViews}
          subtitle="За период"
          icon="👁️"
          link="/admin/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Топ страниц по просмотрам</h2>
          {analytics.topPages.length === 0 ? (
            <p className="text-gray-500">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {analytics.topPages.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <div className="font-medium">{item.page?.title || 'Без названия'}</div>
                    <div className="text-sm text-gray-500">
                      {item.page?.site?.name} / {item.page?.slug}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {item.views}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Последняя активность</h2>
          {analytics.recentActivities.length === 0 ? (
            <p className="text-gray-500">Нет активности</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.recentActivities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name || activity.user?.email}</span>
                      {' '}
                      <span className="text-gray-600">{getActionText(activity.action)}</span>
                      {' '}
                      <span className="text-gray-900">{activity.entity}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold">Управление пользователями</div>
            <div className="text-sm text-gray-500">Просмотр и редактирование пользователей</div>
          </Link>
          <Link
            href="/admin/pages"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-2">📄</div>
            <div className="font-semibold">Управление страницами</div>
            <div className="text-sm text-gray-500">Просмотр всех страниц</div>
          </Link>
          <Link
            href="/admin/logs"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold">Логи активности</div>
            <div className="text-sm text-gray-500">Просмотр всех действий</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  change,
  icon,
  link,
}: {
  title: string;
  value: number;
  subtitle?: string;
  change?: string;
  icon: string;
  link?: string;
}) {
  const content = (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      {change && <div className="text-sm text-green-600">{change}</div>}
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'create':
      return '➕';
    case 'update':
      return '✏️';
    case 'delete':
      return '🗑️';
    case 'publish':
      return '🚀';
    case 'unpublish':
      return '📦';
    default:
      return '📌';
  }
}

function getActionText(action: string) {
  switch (action) {
    case 'create':
      return 'создал(а)';
    case 'update':
      return 'обновил(а)';
    case 'delete':
      return 'удалил(а)';
    case 'publish':
      return 'опубликовал(а)';
    case 'unpublish':
      return 'снял(а) с публикации';
    default:
      return action;
  }
}
