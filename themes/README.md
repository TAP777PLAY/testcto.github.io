# 🎨 Themes Directory

This directory contains theme packages for SiteBuilder.

## Available Themes

### 1. Default Theme (`default`)

Clean and modern light theme with professional blue accents.

**Color Palette:**
- Primary: Blue (#3B82F6)
- Secondary: Green (#10B981)
- Accent: Purple (#8B5CF6)
- Background: White (#FFFFFF)
- Foreground: Dark Gray (#1F2937)

**Typography:**
- Font Family: Inter
- Base Size: 16px
- Scale: 1.25

**Best For:** Business, SaaS, Professional services

### 2. Modern Dark (`modern`)

Sleek dark theme with vibrant accent colors and modern aesthetics.

**Color Palette:**
- Primary: Indigo (#6366F1)
- Secondary: Pink (#EC4899)
- Accent: Amber (#F59E0B)
- Background: Dark Blue (#0F172A)
- Foreground: Off-White (#F8FAFC)

**Typography:**
- Font Family: Poppins (headings), Inter (body)
- Base Size: 16px
- Scale: 1.333

**Best For:** Tech, Gaming, Creative portfolios

## Creating a New Theme

### 1. Create Theme Directory

```bash
mkdir themes/my-theme
```

### 2. Create Theme Manifest

Create `themes/my-theme/theme.json`:

```json
{
  "name": "My Theme",
  "slug": "my-theme",
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

### 3. Add Custom CSS (Optional)

Create `themes/my-theme/custom.css`:

```css
/* Additional custom styles */
body {
  /* Your styles */
}
```

## Theme Manifest Reference

### Required Fields

- `name` - Display name of the theme
- `slug` - Unique identifier (lowercase, hyphens)
- `version` - Semantic version (e.g., "1.0.0")
- `colors` - Color palette object
- `typography` - Typography settings object
- `spacing` - Spacing scale object
- `borderRadius` - Border radius values object

### Optional Fields

- `author` - Theme author name
- `description` - Brief theme description
- `tags` - Array of tags (e.g., ["modern", "dark"])
- `screenshot` - URL to preview image
- `shadows` - Shadow definitions
- `customCSS` - Additional CSS rules

## CSS Variables

Themes automatically generate CSS variables that can be used throughout your site:

### Colors

```css
--color-primary
--color-secondary
--color-accent
--color-background
--color-foreground
--color-muted
--color-border
```

### Typography

```css
--font-family-heading
--font-family-body
--font-size-base
--line-height-tight
--line-height-normal
--line-height-relaxed
```

### Spacing

```css
--spacing-unit
--spacing-0 through --spacing-N
```

### Border Radius

```css
--border-radius-sm
--border-radius-md
--border-radius-lg
--border-radius-full
```

### Shadows

```css
--shadow-sm
--shadow-md
--shadow-lg
```

## Using Theme Variables

### In React Components

```tsx
function MyComponent() {
  return (
    <div 
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-foreground)',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      Themed content
    </div>
  );
}
```

### In CSS Files

```css
.my-class {
  background-color: var(--color-primary);
  color: var(--color-foreground);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  font-family: var(--font-family-body);
}
```

### In Tailwind (with CSS variables)

```tsx
<div className="bg-[var(--color-primary)] text-[var(--color-foreground)]">
  Content
</div>
```

## Color Palette Guidelines

### Contrast Ratios

Ensure sufficient contrast between:
- Background and foreground (minimum 4.5:1)
- Primary color and background (minimum 3:1)
- Text on colored backgrounds (minimum 4.5:1)

### Accessibility

Test your color palette with:
- WCAG AA compliance (4.5:1 for normal text)
- WCAG AAA compliance (7:1 for normal text)
- Color blindness simulators

### Color Theory

- **Primary**: Main brand color, used for CTA buttons
- **Secondary**: Complementary color for accents
- **Accent**: Additional highlight color
- **Background**: Page background
- **Foreground**: Primary text color
- **Muted**: Subtle backgrounds and disabled states
- **Border**: Dividers and outlines

## Typography Guidelines

### Font Pairing

- Use different fonts for headings and body (optional)
- Ensure fonts work well together
- Test readability at different sizes

### Scale

- Modular scale creates visual hierarchy
- Common scales: 1.2 (minor third), 1.25 (major third), 1.333 (perfect fourth)
- Larger scales for bold, impactful designs
- Smaller scales for conservative, professional designs

### Line Height

- **Tight** (1.2-1.3): Large headings
- **Normal** (1.5-1.6): Body text
- **Relaxed** (1.7-1.8): Long-form content

## Best Practices

1. **Test thoroughly** - Preview on different devices and screen sizes
2. **Accessibility first** - Ensure sufficient contrast and readability
3. **Performance** - Minimize custom CSS
4. **Consistency** - Use variables throughout
5. **Documentation** - Explain theme features and use cases

## Loading Custom Fonts

To use custom fonts in your theme:

1. Add font files to `public/fonts/`
2. Add `@font-face` rules in `customCSS`
3. Reference in typography settings

Example:

```json
{
  "customCSS": "@font-face { font-family: 'MyFont'; src: url('/fonts/myfont.woff2'); } body { font-family: 'MyFont', sans-serif; }",
  "typography": {
    "fontFamily": {
      "body": "'MyFont', sans-serif"
    }
  }
}
```

## Activating Themes

### Via UI

1. Go to Dashboard → Themes
2. Select your site
3. Click "Activate Theme"

### Via API

```javascript
await fetch('/api/themes/my-theme/activate?siteId=SITE_ID', {
  method: 'POST'
});
```

### Programmatically

```typescript
import { themeManager } from '@/lib/theme-system';

themeManager.register(myThemeManifest);
themeManager.setActive('my-theme');
```

## Theme Examples

See the existing themes for reference:
- `/themes/default/` - Light theme example
- `/themes/modern/` - Dark theme example

## Support

For questions or issues with themes, see:
- [Theme System Documentation](../PLUGIN_THEME_SYSTEM.md)
- [Examples](../EXAMPLES.md)
- [Contributing Guide](../CONTRIBUTING.md)
