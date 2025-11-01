import { pluginManager } from './plugin-system';
import contactFormPlugin from '@/plugins/contact-form';
import testimonialsPlugin from '@/plugins/testimonials';

export async function loadDemoPlugins() {
  try {
    await pluginManager.register(contactFormPlugin);
    await pluginManager.register(testimonialsPlugin);
    
    console.log('Demo plugins loaded successfully');
  } catch (error) {
    console.error('Error loading demo plugins:', error);
  }
}

export async function activatePluginBySlug(slug: string) {
  try {
    await pluginManager.activate(slug);
    console.log(`Plugin ${slug} activated`);
  } catch (error) {
    console.error(`Error activating plugin ${slug}:`, error);
  }
}

export async function deactivatePluginBySlug(slug: string) {
  try {
    await pluginManager.deactivate(slug);
    console.log(`Plugin ${slug} deactivated`);
  } catch (error) {
    console.error(`Error deactivating plugin ${slug}:`, error);
  }
}
