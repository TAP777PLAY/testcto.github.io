'use client';

import { useState, useEffect } from 'react';

interface ThemeManifest {
  name: string;
  slug: string;
  description?: string;
  author?: string;
  tags?: string[];
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
  };
}

export default function ThemeSelector() {
  const [themes, setThemes] = useState<ThemeManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    fetchThemes();
    fetchSites();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data.themes);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites');
      if (response.ok) {
        const data = await response.json();
        setSites(data.sites);
        if (data.sites.length > 0) {
          setSelectedSite(data.sites[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const activateTheme = async (slug: string) => {
    if (!selectedSite) {
      alert('Please select a site first');
      return;
    }

    try {
      const response = await fetch(
        `/api/themes/${slug}/activate?siteId=${selectedSite}`,
        { method: 'POST' }
      );

      if (response.ok) {
        alert('Theme activated successfully!');
      }
    } catch (error) {
      console.error('Error activating theme:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {sites.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Site:
          </label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.slug}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className="h-32 p-6"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              }}
            >
              <div className="h-full flex items-center justify-center">
                <h3 className="text-2xl font-bold" style={{ color: theme.colors.foreground }}>
                  {theme.name}
                </h3>
              </div>
            </div>

            <div className="p-6">
              {theme.author && (
                <p className="text-sm text-gray-500 mb-2">by {theme.author}</p>
              )}
              {theme.description && (
                <p className="text-gray-600 mb-4">{theme.description}</p>
              )}

              {theme.tags && theme.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {theme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Color Palette:</p>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-md border border-gray-200"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-10 h-10 rounded-md border border-gray-200"
                    style={{ backgroundColor: theme.colors.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-10 h-10 rounded-md border border-gray-200"
                    style={{ backgroundColor: theme.colors.background }}
                    title="Background"
                  />
                  <div
                    className="w-10 h-10 rounded-md border border-gray-200"
                    style={{ backgroundColor: theme.colors.foreground }}
                    title="Foreground"
                  />
                </div>
              </div>

              <button
                onClick={() => activateTheme(theme.slug)}
                disabled={!selectedSite}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Activate Theme
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
