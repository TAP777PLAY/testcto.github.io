# 🔌 Plugin & Theme System Documentation

## Overview

SiteBuilder features a powerful plugin and theme system inspired by WordPress, allowing developers to extend functionality and customize appearance without modifying core code.

## 🎯 Plugin System

### Architecture

The plugin system is built around three core concepts:

1. **Hooks & Events** - Action and filter system for extensibility
2. **Block Registration** - Add custom content blocks
3. **SDK** - Full API access for plugins

### Creating a Plugin

#### 1. Plugin Structure

```
plugins/
└── your-plugin/
    ├── manifest.json
    ├── index.ts
    └── components/
        └── YourComponent.tsx
```

#### 2. Manifest File

```json
{
  "name": "Your Plugin",
  "slug": "your-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "homepage": "https://example.com",
  "license": "MIT",
  "requires": {
    "core": ">=0.1.0"
  },
  "entryPoint": "index.ts"
}
```

#### 3. Plugin Entry Point

```typescript
import { Plugin } from '@/lib/plugin-system/types';
import manifest from './manifest.json';

const yourPlugin: Plugin = {
  manifest,

  activate: async (api) => {
    // Called when plugin is activated
    api.registerBlock({
      type: 'your-block',
      label: 'Your Block',
      icon: '🎨',
      category: 'content',
      defaultContent: {
        // Default block data
      },
    });

    api.addAction('hook_name', callback);
    api.addFilter('filter_name', callback);
  },

  deactivate: async (api) => {
    // Called when plugin is deactivated
  },

  install: async (api) => {
    // Called on first installation
    await api.setOption('setting', 'value');
  },

  uninstall: async (api) => {
    // Called when plugin is deleted
  },
};

export default yourPlugin;
```

### Plugin API Reference

#### Hooks

```typescript
// Add an action hook
api.addAction('hook_name', (arg1, arg2) => {
  // Your code
}, priority);

// Add a filter hook
api.addFilter('filter_name', (value, arg1) => {
  // Modify and return value
  return value;
}, priority);

// Remove hooks
api.removeAction('hook_name', callback);
api.removeFilter('filter_name', callback);
```

#### Block Registration

```typescript
api.registerBlock({
  type: 'unique-block-type',
  label: 'Block Label',
  icon: '🎨',
  category: 'content',
  defaultContent: {
    // Default properties
  },
  schema: {
    // JSON schema for validation (optional)
  },
});
```

#### Options/Settings

```typescript
// Get option
const value = await api.getOption('key', defaultValue);

// Set option
await api.setOption('key', value);
```

#### HTTP Requests

```typescript
// GET request
const response = await api.http.get('/api/endpoint');

// POST request
const response = await api.http.post('/api/endpoint', { data });

// PUT request
const response = await api.http.put('/api/endpoint', { data });

// DELETE request
const response = await api.http.delete('/api/endpoint');
```

### Available Hooks

#### Actions

- `plugin_activated` - After a plugin is activated
- `plugin_deactivated` - After a plugin is deactivated
- `form_submit` - When a form is submitted
- `page_published` - When a page is published
- `site_created` - When a new site is created

#### Filters

- `block_content` - Modify block content before rendering
- `page_content` - Modify page content before display
- `testimonials_display` - Filter testimonials to display

### Demo Plugins

#### 1. Contact Form Plugin

Adds customizable contact forms to your site.

**Features:**
- Drag-and-drop form builder
- Custom fields (text, email, textarea)
- Email notifications
- Spam protection
- Success messages

**Usage:**
```typescript
// The plugin registers a 'contact-form' block
// that can be added to any page
```

#### 2. Testimonials Plugin

Display customer testimonials and reviews.

**Features:**
- Multiple layout options (grid, carousel, list)
- Star ratings
- Author avatars
- Customizable styling
- Rating filters

**Usage:**
```typescript
// The plugin registers a 'testimonials' block
// with pre-configured testimonials
```

## 🎨 Theme System

### Architecture

Themes in SiteBuilder use a JSON manifest system that defines:
- Color palettes
- Typography
- Spacing
- Border radius
- Shadows
- Custom CSS

### Theme Structure

```
themes/
└── your-theme/
    ├── theme.json
    └── custom.css (optional)
```

### Theme Manifest

```json
{
  "name": "Your Theme",
  "slug": "your-theme",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Theme description",
  "tags": ["modern", "minimal"],
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "accent": "#8B5CF6",
    "background": "#FFFFFF",
    "foreground": "#1F2937",
    "muted": "#F3F4F6",
    "border": "#E5E7EB"
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
    "scale": [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64]
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "1rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  },
  "customCSS": "/* Optional custom CSS */"
}
```

### CSS Variables

Themes automatically generate CSS variables:

```css
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-background: #FFFFFF;
  --color-foreground: #1F2937;
  
  /* Typography */
  --font-family-heading: 'Inter', sans-serif;
  --font-family-body: 'Inter', sans-serif;
  --font-size-base: 16px;
  
  /* Spacing */
  --spacing-unit: 0.25rem;
  --spacing-0: calc(0 * var(--spacing-unit));
  --spacing-1: calc(1 * var(--spacing-unit));
  
  /* Border Radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

### Using Theme Variables in Components

```tsx
function MyComponent() {
  return (
    <div 
      style={{
        backgroundColor: 'var(--color-primary)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--spacing-4)',
      }}
    >
      Content
    </div>
  );
}
```

### Default Themes

#### 1. Default Theme

Clean and modern light theme with blue accents.

**Colors:**
- Primary: Blue (#3B82F6)
- Secondary: Green (#10B981)
- Background: White
- Foreground: Dark Gray

#### 2. Modern Dark Theme

Sleek dark theme with vibrant accents.

**Colors:**
- Primary: Indigo (#6366F1)
- Secondary: Pink (#EC4899)
- Background: Dark Blue (#0F172A)
- Foreground: Off-White

## 📡 API Endpoints

### Plugins

```
GET    /api/plugins              - List all plugins
POST   /api/plugins              - Install a plugin
GET    /api/plugins/:id          - Get plugin details
PUT    /api/plugins/:id          - Update plugin
DELETE /api/plugins/:id          - Delete plugin
POST   /api/plugins/:id/activate - Activate plugin
POST   /api/plugins/:id/deactivate - Deactivate plugin
```

### Themes

```
GET  /api/themes                      - List all themes
POST /api/themes/:slug/activate       - Activate theme (requires siteId)
```

### Contact Form

```
POST /api/contact-form/submit - Submit contact form
```

## 🚀 Installation & Usage

### For End Users

1. Navigate to Dashboard → Plugins
2. Browse available plugins
3. Click "Install" on desired plugin
4. Click "Activate" to enable
5. Navigate to Dashboard → Themes
6. Select a site
7. Click "Activate Theme" on desired theme

### For Developers

#### Installing Demo Plugins

The demo plugins are already included. To install them:

1. Go to `/dashboard/plugins`
2. Scroll to "Available Plugins"
3. Click "Install" for Contact Form or Testimonials

#### Creating Custom Plugins

1. Create plugin directory: `plugins/my-plugin/`
2. Create manifest.json
3. Create index.ts with plugin logic
4. Register plugin through API or code

#### Creating Custom Themes

1. Create theme directory: `themes/my-theme/`
2. Create theme.json with manifest
3. Theme will appear in Dashboard → Themes

## 🔧 Advanced Usage

### Plugin Communication

Plugins can communicate via hooks:

```typescript
// Plugin A
api.addAction('data_processed', (data) => {
  console.log('Data:', data);
});

// Plugin B
await doAction('data_processed', myData);
```

### Dynamic Block Loading

```typescript
import { blockRegistry } from '@/lib/plugin-system';

// Get all registered blocks
const blocks = blockRegistry.getAll();

// Get specific block
const block = blockRegistry.get('contact-form');

// Check if block exists
if (blockRegistry.has('testimonials')) {
  // Render testimonials
}
```

### Theme Customization

Extend themes programmatically:

```typescript
import { themeManager } from '@/lib/theme-system';

// Register custom theme
themeManager.register(myThemeManifest);

// Get active theme
const activeTheme = themeManager.getActive();

// Generate CSS
const css = themeManager.generateCSS('my-theme');
```

## 🛠️ Development Best Practices

### Plugins

1. **Namespace everything** - Prefix functions, hooks, and options
2. **Clean up on uninstall** - Remove data and options
3. **Version compatibility** - Check core version requirements
4. **Error handling** - Wrap code in try-catch blocks
5. **Documentation** - Comment your code and provide README

### Themes

1. **Use CSS variables** - For easy customization
2. **Test accessibility** - Ensure color contrast
3. **Responsive design** - Test on multiple screen sizes
4. **Performance** - Minimize custom CSS
5. **Documentation** - Explain theme features and usage

## 📚 Examples

See the following files for complete examples:

- `/plugins/contact-form/` - Full contact form plugin
- `/plugins/testimonials/` - Testimonials display plugin
- `/themes/default/` - Default light theme
- `/themes/modern/` - Modern dark theme

## 🐛 Troubleshooting

### Plugin Not Appearing

1. Check manifest.json is valid JSON
2. Ensure slug is unique
3. Verify entryPoint file exists
4. Check browser console for errors

### Theme Not Loading

1. Validate theme.json structure
2. Check color values are valid CSS colors
3. Ensure slug is unique
4. Clear browser cache

### Hooks Not Firing

1. Verify plugin is activated
2. Check hook name spelling
3. Ensure priority is set correctly
4. Use `hasAction()` or `hasFilter()` to debug

## 📖 Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Examples](./EXAMPLES.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

Built with ❤️ for the SiteBuilder community
