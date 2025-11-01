# 🚀 Phase 4 Quick Start Guide

## Quick Overview

Phase 4 adds a complete plugin and theme system to SiteBuilder, similar to WordPress.

## ⚡ Quick Start

### Using Plugins (UI)

1. Navigate to `/dashboard/plugins`
2. Click "Install" on a demo plugin
3. Click "Activate" to enable it
4. Use the plugin's blocks in your editor

### Using Themes (UI)

1. Navigate to `/dashboard/themes`
2. Select your site from the dropdown
3. Click "Activate Theme" on your preferred theme
4. Theme is applied immediately

### Available Demo Plugins

#### 🔔 Contact Form
- Adds contact form block to editor
- Customizable fields
- Form submission handling

#### ⭐ Testimonials
- Adds testimonials block
- Grid/list layouts
- Rating system

### Available Demo Themes

#### 🎨 Default Theme
- Clean, professional light theme
- Blue/green color scheme
- Inter font

#### 🌙 Modern Theme
- Bold dark theme
- Indigo/pink accents
- Poppins/Inter fonts

## 📁 Key Directories

```
/lib/plugin-system/    # Plugin system core
/lib/theme-system/     # Theme system core
/plugins/              # Plugin packages
/themes/               # Theme packages
/app/api/plugins/      # Plugin API routes
/app/api/themes/       # Theme API routes
/app/dashboard/plugins/ # Plugin management UI
/app/dashboard/themes/  # Theme selection UI
```

## 🔌 Creating a Plugin

### 1. Create Directory Structure

```bash
mkdir -p plugins/my-plugin/components
```

### 2. Create Manifest (`manifest.json`)

```json
{
  "name": "My Plugin",
  "slug": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "entryPoint": "index.ts"
}
```

### 3. Create Plugin (`index.ts`)

```typescript
import { Plugin } from '@/lib/plugin-system/types';
import manifest from './manifest.json';

const myPlugin: Plugin = {
  manifest,

  activate: async (api) => {
    // Register blocks, hooks, filters
    api.registerBlock({
      type: 'my-block',
      label: 'My Block',
      icon: '🎨',
      category: 'content',
      defaultContent: { text: 'Hello World' },
    });
  },

  deactivate: async (api) => {
    // Cleanup
  },
};

export default myPlugin;
```

### 4. Install via API

```javascript
await fetch('/api/plugins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Plugin',
    slug: 'my-plugin',
    version: '1.0.0'
  })
});
```

## 🎨 Creating a Theme

### 1. Create Directory

```bash
mkdir themes/my-theme
```

### 2. Create Manifest (`theme.json`)

```json
{
  "name": "My Theme",
  "slug": "my-theme",
  "version": "1.0.0",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "background": "#FFFFFF",
    "foreground": "#1F2937"
  },
  "typography": {
    "fontFamily": {
      "heading": "'Inter', sans-serif",
      "body": "'Inter', sans-serif"
    },
    "fontSize": {
      "base": "16px",
      "scale": 1.25
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    }
  },
  "spacing": {
    "unit": "0.25rem",
    "scale": [0, 1, 2, 3, 4, 6, 8, 12, 16, 24]
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "1rem",
    "full": "9999px"
  }
}
```

### 3. Activate via API

```javascript
await fetch('/api/themes/my-theme/activate?siteId=SITE_ID', {
  method: 'POST'
});
```

### 4. Use CSS Variables

```css
.my-element {
  background-color: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}
```

## 🎯 Plugin API Cheat Sheet

```typescript
// Register a block
api.registerBlock({
  type: 'block-type',
  label: 'Block Label',
  icon: '🎨',
  defaultContent: {}
});

// Add action hook
api.addAction('hook_name', callback, priority);

// Add filter hook
api.addFilter('filter_name', callback, priority);

// Get/Set options
const value = await api.getOption('key', defaultValue);
await api.setOption('key', value);

// HTTP requests
await api.http.get(url);
await api.http.post(url, data);
await api.http.put(url, data);
await api.http.delete(url);
```

## 📝 Available Hooks

### Actions
- `plugin_activated` - After plugin activation
- `plugin_deactivated` - After plugin deactivation
- `form_submit` - When form is submitted
- `page_published` - When page is published
- `site_created` - When site is created

### Filters
- `block_content` - Modify block content
- `page_content` - Modify page content
- `testimonials_display` - Filter testimonials

## 🌐 API Endpoints

### Plugins
```
GET    /api/plugins              # List plugins
POST   /api/plugins              # Install plugin
GET    /api/plugins/:id          # Get plugin
PUT    /api/plugins/:id          # Update plugin
DELETE /api/plugins/:id          # Delete plugin
POST   /api/plugins/:id/activate # Activate
POST   /api/plugins/:id/deactivate # Deactivate
```

### Themes
```
GET  /api/themes                    # List themes
POST /api/themes/:slug/activate     # Activate (requires siteId)
```

### Contact Form
```
POST /api/contact-form/submit       # Submit form
```

## 📚 Documentation

- **Full Documentation**: [PLUGIN_THEME_SYSTEM.md](./PLUGIN_THEME_SYSTEM.md)
- **Plugin Guide**: [plugins/README.md](./plugins/README.md)
- **Theme Guide**: [themes/README.md](./themes/README.md)
- **Examples**: [EXAMPLES.md](./EXAMPLES.md)
- **Implementation Details**: [PHASE_4_IMPLEMENTATION.md](./PHASE_4_IMPLEMENTATION.md)

## 🎉 Next Steps

1. Explore demo plugins in `/plugins/`
2. Try creating your own plugin
3. Customize themes in `/themes/`
4. Read full documentation for advanced features

Happy building! 🚀
