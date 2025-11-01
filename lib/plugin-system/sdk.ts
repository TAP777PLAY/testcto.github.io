import { PluginAPI, BlockDefinition } from './types';
import { addAction, addFilter, removeAction, removeFilter } from './hooks';
import { blockRegistry } from './block-registry';

export function createPluginAPI(pluginSlug: string): PluginAPI {
  return {
    registerBlock: (definition: BlockDefinition) => {
      blockRegistry.register(pluginSlug, definition);
    },

    addAction: (hookName: string, callback: any, priority?: number) => {
      addAction(hookName, callback, priority);
    },

    addFilter: (filterName: string, callback: any, priority?: number) => {
      addFilter(filterName, callback, priority);
    },

    removeAction: (hookName: string, callback: any) => {
      removeAction(hookName, callback);
    },

    removeFilter: (filterName: string, callback: any) => {
      removeFilter(filterName, callback);
    },

    getOption: async (key: string, defaultValue?: any) => {
      const fullKey = `plugin_${pluginSlug}_${key}`;
      try {
        const response = await fetch(`/api/options/${encodeURIComponent(fullKey)}`);
        if (response.ok) {
          const data = await response.json();
          return data.value ?? defaultValue;
        }
        return defaultValue;
      } catch (error) {
        console.error('Error fetching option:', error);
        return defaultValue;
      }
    },

    setOption: async (key: string, value: any) => {
      const fullKey = `plugin_${pluginSlug}_${key}`;
      try {
        await fetch(`/api/options/${encodeURIComponent(fullKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        });
      } catch (error) {
        console.error('Error setting option:', error);
        throw error;
      }
    },

    http: {
      get: async (url: string, options?: RequestInit) => {
        return fetch(url, { ...options, method: 'GET' });
      },

      post: async (url: string, body?: any, options?: RequestInit) => {
        return fetch(url, {
          ...options,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          body: JSON.stringify(body),
        });
      },

      put: async (url: string, body?: any, options?: RequestInit) => {
        return fetch(url, {
          ...options,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          body: JSON.stringify(body),
        });
      },

      delete: async (url: string, options?: RequestInit) => {
        return fetch(url, { ...options, method: 'DELETE' });
      },
    },
  };
}
