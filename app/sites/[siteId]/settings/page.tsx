'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type SiteSettings = {
  id: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  googleAnalytics: string | null;
  facebookPixel: string | null;
  customCSS: string | null;
  customJS: string | null;
};

type Site = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  favicon: string | null;
  logo: string | null;
};

export default function SiteSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, siteId]);

  const fetchData = async () => {
    try {
      const [siteRes, settingsRes] = await Promise.all([
        fetch(`/api/sites/${siteId}`),
        fetch(`/api/sites/${siteId}/settings`),
      ]);

      if (siteRes.ok) {
        const siteData = await siteRes.json();
        setSite(siteData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSiteUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        favicon: formData.get('favicon') as string,
        logo: formData.get('logo') as string,
      };

      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Основные настройки сохранены!');
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Произошла ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        metaTitle: formData.get('metaTitle') as string,
        metaDescription: formData.get('metaDescription') as string,
        metaKeywords: formData.get('metaKeywords') as string,
        ogImage: formData.get('ogImage') as string,
        googleAnalytics: formData.get('googleAnalytics') as string,
        facebookPixel: formData.get('facebookPixel') as string,
        customCSS: formData.get('customCSS') as string,
        customJS: formData.get('customJS') as string,
      };

      const response = await fetch(`/api/sites/${siteId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('SEO настройки сохранены!');
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Произошла ошибка');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Сайт не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Настройки сайта</h1>
              <p className="text-gray-600">{site.name}</p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Назад к сайтам
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Основные настройки</h2>
            <form onSubmit={handleSiteUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название сайта
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={site.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  defaultValue={site.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon URL
                </label>
                <input
                  type="url"
                  name="favicon"
                  defaultValue={site.favicon || ''}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  defaultValue={site.logo || ''}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить основные настройки'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">SEO и метаданные</h2>
            <form onSubmit={handleSettingsUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  defaultValue={settings?.metaTitle || ''}
                  placeholder="Заголовок для поисковиков"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  defaultValue={settings?.metaDescription || ''}
                  rows={3}
                  placeholder="Описание для поисковиков"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="metaKeywords"
                  defaultValue={settings?.metaKeywords || ''}
                  placeholder="ключевые, слова, через, запятую"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Open Graph Image URL
                </label>
                <input
                  type="url"
                  name="ogImage"
                  defaultValue={settings?.ogImage || ''}
                  placeholder="https://example.com/og-image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  name="googleAnalytics"
                  defaultValue={settings?.googleAnalytics || ''}
                  placeholder="UA-XXXXXXXXX-X или G-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  name="facebookPixel"
                  defaultValue={settings?.facebookPixel || ''}
                  placeholder="XXXXXXXXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom CSS
                </label>
                <textarea
                  name="customCSS"
                  defaultValue={settings?.customCSS || ''}
                  rows={5}
                  placeholder="/* Ваш CSS код */"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom JavaScript
                </label>
                <textarea
                  name="customJS"
                  defaultValue={settings?.customJS || ''}
                  rows={5}
                  placeholder="// Ваш JS код"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить SEO настройки'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
