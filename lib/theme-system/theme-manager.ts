import { ThemeManifest, ThemeConfig } from './types';

class ThemeManager {
  private themes: Map<string, ThemeConfig> = new Map();
  private activeTheme: string | null = null;

  register(manifest: ThemeManifest): void {
    const cssVariables = this.generateCSSVariables(manifest);
    this.themes.set(manifest.slug, { manifest, cssVariables });
  }

  unregister(slug: string): void {
    this.themes.delete(slug);
    if (this.activeTheme === slug) {
      this.activeTheme = null;
    }
  }

  get(slug: string): ThemeConfig | undefined {
    return this.themes.get(slug);
  }

  getAll(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  setActive(slug: string): void {
    if (!this.themes.has(slug)) {
      throw new Error(`Theme ${slug} is not registered`);
    }
    this.activeTheme = slug;
  }

  getActive(): ThemeConfig | null {
    if (!this.activeTheme) {
      return null;
    }
    return this.themes.get(this.activeTheme) ?? null;
  }

  private generateCSSVariables(manifest: ThemeManifest): Record<string, string> {
    const variables: Record<string, string> = {};

    variables['--color-primary'] = manifest.colors.primary;
    variables['--color-secondary'] = manifest.colors.secondary;
    variables['--color-background'] = manifest.colors.background;
    variables['--color-foreground'] = manifest.colors.foreground;

    if (manifest.colors.accent) {
      variables['--color-accent'] = manifest.colors.accent;
    }
    if (manifest.colors.muted) {
      variables['--color-muted'] = manifest.colors.muted;
    }
    if (manifest.colors.border) {
      variables['--color-border'] = manifest.colors.border;
    }

    variables['--font-family-heading'] = manifest.typography.fontFamily.heading;
    variables['--font-family-body'] = manifest.typography.fontFamily.body;
    variables['--font-size-base'] = manifest.typography.fontSize.base;
    variables['--line-height-tight'] = manifest.typography.lineHeight.tight.toString();
    variables['--line-height-normal'] = manifest.typography.lineHeight.normal.toString();
    variables['--line-height-relaxed'] = manifest.typography.lineHeight.relaxed.toString();

    variables['--spacing-unit'] = manifest.spacing.unit;
    manifest.spacing.scale.forEach((value, index) => {
      variables[`--spacing-${index}`] = `calc(${value} * ${manifest.spacing.unit})`;
    });

    variables['--border-radius-sm'] = manifest.borderRadius.sm;
    variables['--border-radius-md'] = manifest.borderRadius.md;
    variables['--border-radius-lg'] = manifest.borderRadius.lg;
    variables['--border-radius-full'] = manifest.borderRadius.full;

    if (manifest.shadows) {
      variables['--shadow-sm'] = manifest.shadows.sm;
      variables['--shadow-md'] = manifest.shadows.md;
      variables['--shadow-lg'] = manifest.shadows.lg;
    }

    return variables;
  }

  generateCSS(slug: string): string {
    const theme = this.themes.get(slug);
    if (!theme) {
      return '';
    }

    const cssRules = Object.entries(theme.cssVariables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');

    let css = `:root {\n${cssRules}\n}\n`;

    if (theme.manifest.customCSS) {
      css += '\n' + theme.manifest.customCSS;
    }

    return css;
  }
}

export const themeManager = new ThemeManager();
