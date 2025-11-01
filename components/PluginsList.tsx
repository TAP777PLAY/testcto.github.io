'use client';

import { useState, useEffect } from 'react';

interface Plugin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version: string;
  author?: string;
  active: boolean;
}

export default function PluginsList() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await fetch('/api/plugins');
      if (response.ok) {
        const data = await response.json();
        setPlugins(data.plugins);
      }
    } catch (error) {
      console.error('Error fetching plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlugin = async (id: string, active: boolean) => {
    try {
      const endpoint = active ? 'deactivate' : 'activate';
      const response = await fetch(`/api/plugins/${id}/${endpoint}`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchPlugins();
      }
    } catch (error) {
      console.error('Error toggling plugin:', error);
    }
  };

  const deletePlugin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plugin?')) {
      return;
    }

    try {
      const response = await fetch(`/api/plugins/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPlugins();
      }
    } catch (error) {
      console.error('Error deleting plugin:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No plugins installed yet
          </div>
        ) : (
          plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{plugin.name}</h3>
                  <p className="text-sm text-gray-500">
                    v{plugin.version}
                    {plugin.author && ` by ${plugin.author}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    plugin.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plugin.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {plugin.description && (
                <p className="text-gray-600 mb-4">{plugin.description}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => togglePlugin(plugin.id, plugin.active)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    plugin.active
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plugin.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deletePlugin(plugin.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-2">Available Plugins</h3>
        <p className="text-gray-700 mb-4">
          Install demo plugins to extend your site functionality
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AvailablePlugin
            name="Contact Form"
            slug="contact-form"
            description="Add customizable contact forms to your site"
            onInstall={fetchPlugins}
          />
          <AvailablePlugin
            name="Testimonials"
            slug="testimonials"
            description="Display customer testimonials and reviews"
            onInstall={fetchPlugins}
          />
        </div>
      </div>
    </div>
  );
}

function AvailablePlugin({
  name,
  slug,
  description,
  onInstall,
}: {
  name: string;
  slug: string;
  description: string;
  onInstall: () => void;
}) {
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const response = await fetch('/api/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          version: '1.0.0',
          author: 'SiteBuilder',
        }),
      });

      if (response.ok) {
        onInstall();
      }
    } catch (error) {
      console.error('Error installing plugin:', error);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-bold mb-1">{name}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button
        onClick={handleInstall}
        disabled={installing}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {installing ? 'Installing...' : 'Install'}
      </button>
    </div>
  );
}
