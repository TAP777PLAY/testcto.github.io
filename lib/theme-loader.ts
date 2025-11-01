import { themeManager } from './theme-system';
import defaultTheme from '@/themes/default/theme.json';
import modernTheme from '@/themes/modern/theme.json';

export function loadDefaultThemes() {
  try {
    themeManager.register(defaultTheme);
    themeManager.register(modernTheme);
    
    themeManager.setActive('default');
    
    console.log('Default themes loaded successfully');
  } catch (error) {
    console.error('Error loading default themes:', error);
  }
}

export function getThemeCSS(slug: string): string {
  return themeManager.generateCSS(slug);
}

export function getActiveTheme() {
  return themeManager.getActive();
}

export function getAllThemes() {
  return themeManager.getAll();
}
