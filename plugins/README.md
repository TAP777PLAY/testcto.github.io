# 🔌 Plugins Directory

This directory contains plugin packages for SiteBuilder.

## Available Plugins

### 1. Contact Form (`contact-form`)

Add customizable contact forms to your site with email notifications and spam protection.

**Features:**
- Customizable fields (text, email, textarea)
- Required field validation
- Success messages
- Form submission hooks
- Email recipient configuration

**Usage:**
```typescript
// The plugin automatically registers a 'contact-form' block type
// that can be added to any page through the editor
```

### 2. Testimonials (`testimonials`)

Display customer testimonials and reviews with ratings and avatars.

**Features:**
- Multiple layout options (grid, carousel, list)
- 5-star rating system
- Author avatars or initials
- Automatic filtering by rating
- Customizable columns

**Usage:**
```typescript
// The plugin automatically registers a 'testimonials' block type
// that can be added to any page through the editor
```

## Creating a New Plugin

### 1. Create Plugin Directory

```bash
mkdir plugins/my-plugin
```

### 2. Create Manifest

Create `plugins/my-plugin/manifest.json`:

```json
{
  "name": "My Plugin",
  "slug": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "license": "MIT",
  "requires": {
    "core": ">=0.1.0"
  },
  "entryPoint": "index.ts"
}
```

### 3. Create Entry Point

Create `plugins/my-plugin/index.ts`:

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
      defaultContent: {},
    });

    api.addAction('my_action', callback);
    api.addFilter('my_filter', callback);
  },

  deactivate: async (api) => {
    // Cleanup
  },

  install: async (api) => {
    // First-time setup
    await api.setOption('setting', 'value');
  },

  uninstall: async (api) => {
    // Remove all data
  },
};

export default myPlugin;
```

### 4. Create Components (Optional)

Create `plugins/my-plugin/components/MyBlockComponent.tsx`:

```tsx
'use client';

export function MyBlockComponent({ content }: { content: any }) {
  return (
    <div className="my-block">
      {/* Your component JSX */}
    </div>
  );
}
```

## Plugin API

See [PLUGIN_THEME_SYSTEM.md](../PLUGIN_THEME_SYSTEM.md) for complete API documentation.

### Quick Reference

```typescript
// Register blocks
api.registerBlock(definition);

// Add hooks
api.addAction('hook_name', callback, priority);
api.addFilter('filter_name', callback, priority);

// Options/Settings
await api.getOption('key', defaultValue);
await api.setOption('key', value);

// HTTP Requests
await api.http.get(url);
await api.http.post(url, data);
await api.http.put(url, data);
await api.http.delete(url);
```

## Testing Plugins

Run the demo script to test plugin functionality:

```bash
npm run tsx scripts/demo-plugins.ts
```

## Plugin Lifecycle

1. **Install** - Called once when plugin is first installed
2. **Activate** - Called when plugin is activated
3. **Deactivate** - Called when plugin is deactivated
4. **Uninstall** - Called when plugin is deleted

## Best Practices

1. **Namespace everything** - Prefix hook names, options, and functions
2. **Clean up** - Remove data and hooks on uninstall
3. **Error handling** - Wrap code in try-catch blocks
4. **Documentation** - Comment your code and provide README
5. **Testing** - Test activation, deactivation, and uninstall

## Support

For questions or issues with plugins, see:
- [Plugin System Documentation](../PLUGIN_THEME_SYSTEM.md)
- [Examples](../EXAMPLES.md)
- [Contributing Guide](../CONTRIBUTING.md)
