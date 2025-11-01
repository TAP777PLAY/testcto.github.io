export interface ThemeManifest {
  name: string;
  slug: string;
  version: string;
  author?: string;
  description?: string;
  screenshot?: string;
  tags?: string[];
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    foreground: string;
    muted?: string;
    border?: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    fontSize: {
      base: string;
      scale: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    unit: string;
    scale: number[];
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows?: {
    sm: string;
    md: string;
    lg: string;
  };
  customCSS?: string;
  templates?: {
    header?: string;
    footer?: string;
    page?: string;
  };
}

export interface ThemeConfig {
  manifest: ThemeManifest;
  cssVariables: Record<string, string>;
}
