'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  price: number;
  icon?: string;
  category: string;
  downloadCount: number;
  rating?: number;
  reviewCount: number;
  featured: boolean;
}

interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  price: number;
  preview?: string;
  category: string;
  downloadCount: number;
  rating?: number;
  reviewCount: number;
  featured: boolean;
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plugins' | 'themes'>('plugins');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, [activeTab, search]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'plugins' ? '/api/marketplace/plugins' : '/api/marketplace/themes';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`${endpoint}?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'plugins') {
          setPlugins(data);
        } else {
          setThemes(data);
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (itemId: string, type: 'plugin' | 'theme') => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const endpoint = type === 'plugin' 
        ? '/api/marketplace/plugins/install'
        : '/api/marketplace/themes/install';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [`${type}Id`]: itemId }),
      });

      if (response.ok) {
        alert('Успешно установлено!');
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка установки');
      }
    } catch (error) {
      console.error('Error installing:', error);
      alert('Ошибка установки');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Маркетплейс</h1>
          <p className="mt-2 text-gray-600">
            Расширьте возможности вашего сайта с помощью плагинов и тем
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('plugins')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'plugins'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Плагины
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'themes'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Темы
            </button>
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeTab === 'plugins' &&
              plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {plugin.featured && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-yellow-500 rounded mb-2">
                      Рекомендуемый
                    </span>
                  )}
                  <div className="flex items-start gap-4">
                    {plugin.icon && (
                      <img
                        src={plugin.icon}
                        alt={plugin.name}
                        className="w-12 h-12 rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plugin.name}
                      </h3>
                      <p className="text-sm text-gray-600">{plugin.author}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 text-sm">{plugin.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span>{plugin.downloadCount} загрузок</span>
                      {plugin.rating && (
                        <span className="ml-3">★ {plugin.rating}</span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {plugin.price === 0 ? 'Бесплатно' : `${plugin.price / 100} ₽`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleInstall(plugin.id, 'plugin')}
                    className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Установить
                  </button>
                </div>
              ))}

            {activeTab === 'themes' &&
              themes.map((theme) => (
                <div
                  key={theme.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {theme.preview && (
                    <img
                      src={theme.preview}
                      alt={theme.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {theme.featured && (
                    <span className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold text-white bg-yellow-500 rounded">
                      Рекомендуемая
                    </span>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {theme.name}
                    </h3>
                    <p className="text-sm text-gray-600">{theme.author}</p>
                    <p className="mt-2 text-gray-700 text-sm">{theme.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>{theme.downloadCount} загрузок</span>
                        {theme.rating && (
                          <span className="ml-3">★ {theme.rating}</span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {theme.price === 0 ? 'Бесплатно' : `${theme.price / 100} ₽`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleInstall(theme.id, 'theme')}
                      className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Установить
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {!loading && activeTab === 'plugins' && plugins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Плагины не найдены</p>
          </div>
        )}

        {!loading && activeTab === 'themes' && themes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Темы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
