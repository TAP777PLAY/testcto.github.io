import { Plugin, PluginInstance } from './types';
import { createPluginAPI } from './sdk';
import { blockRegistry } from './block-registry';
import { hookSystem } from './hooks';

class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();

  async register(plugin: Plugin): Promise<void> {
    const slug = plugin.manifest.slug;

    if (this.plugins.has(slug)) {
      throw new Error(`Plugin ${slug} is already registered`);
    }

    const instance: PluginInstance = {
      id: slug,
      plugin,
      active: false,
    };

    this.plugins.set(slug, instance);

    if (plugin.install) {
      const api = createPluginAPI(slug);
      await plugin.install(api);
    }
  }

  async unregister(slug: string): Promise<void> {
    const instance = this.plugins.get(slug);
    if (!instance) {
      return;
    }

    if (instance.active) {
      await this.deactivate(slug);
    }

    if (instance.plugin.uninstall) {
      const api = createPluginAPI(slug);
      await instance.plugin.uninstall(api);
    }

    blockRegistry.unregisterByPlugin(slug);
    this.plugins.delete(slug);
  }

  async activate(slug: string): Promise<void> {
    const instance = this.plugins.get(slug);
    if (!instance) {
      throw new Error(`Plugin ${slug} is not registered`);
    }

    if (instance.active) {
      return;
    }

    const api = createPluginAPI(slug);
    
    if (instance.plugin.activate) {
      await instance.plugin.activate(api);
    }

    instance.active = true;
    await hookSystem.doAction('plugin_activated', slug);
  }

  async deactivate(slug: string): Promise<void> {
    const instance = this.plugins.get(slug);
    if (!instance) {
      throw new Error(`Plugin ${slug} is not registered`);
    }

    if (!instance.active) {
      return;
    }

    const api = createPluginAPI(slug);

    if (instance.plugin.deactivate) {
      await instance.plugin.deactivate(api);
    }

    instance.active = false;
    await hookSystem.doAction('plugin_deactivated', slug);
  }

  get(slug: string): PluginInstance | undefined {
    return this.plugins.get(slug);
  }

  getAll(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  getActive(): PluginInstance[] {
    return Array.from(this.plugins.values()).filter((p) => p.active);
  }

  isActive(slug: string): boolean {
    const instance = this.plugins.get(slug);
    return instance?.active ?? false;
  }

  has(slug: string): boolean {
    return this.plugins.has(slug);
  }
}

export const pluginManager = new PluginManager();
