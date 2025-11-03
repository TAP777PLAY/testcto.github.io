import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';

interface ExportOptions {
  minify?: boolean;
  includeImages?: boolean;
}

interface BlockContent {
  styles?: Record<string, string>;
  [key: string]: unknown;
}

interface Block {
  id: string;
  type: string;
  content: BlockContent;
  order: number;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  isHome: boolean;
  blocks: Block[];
}

interface Theme {
  id: string;
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

interface Site {
  id: string;
  slug: string;
  pages: Page[];
  theme?: Theme | null;
}

// Simple HTML minifier
function minifyHTML(html: string): string {
  return html
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

// Simple CSS minifier
function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/;\s*}/g, '}')
    .replace(/\s*{\s*/g, '{')
    .replace(/;\s*/g, ';')
    .trim();
}

// Simple JS minifier
function minifyJS(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/;\s*}/g, '}')
    .replace(/\s*{\s*/g, '{')
    .replace(/;\s*/g, ';')
    .trim();
}

// Generate CSS from theme
function generateThemeCSS(theme: Theme | null): string {
  if (!theme) return '';
  
  return `
:root {
  --primary-color: ${theme.primaryColor || '#3B82F6'};
  --secondary-color: ${theme.secondaryColor || '#10B981'};
  --background-color: ${theme.backgroundColor || '#FFFFFF'};
  --text-color: ${theme.textColor || '#1F2937'};
}

body {
  font-family: ${theme.fontFamily || 'Inter'}, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Button styles */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: color-mix(in srgb, var(--primary-color) 90%, black);
}

.btn-secondary {
  background-color: #6B7280;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: color-mix(in srgb, #6B7280 90%, black);
}

.btn-outline {
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Form styles */
form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--text-color);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-submit {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-submit:hover {
  background-color: color-mix(in srgb, var(--primary-color) 90%, black);
}

/* Grid utilities */
.grid {
  display: grid;
  gap: 16px;
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Image styles */
img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Text styles */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Spacing */
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.p-4 { padding: 16px; }

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
`;
}

// Generate HTML for blocks
function generateBlocksHTML(blocks: Block[]): string {
  return blocks.map(block => {
    const styles = block.content.styles || {};
    const styleString = Object.entries(styles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');

    const styleAttr = styleString ? ` style="${styleString}"` : '';

    switch (block.type) {
      case 'heading':
        const level = block.content.level || 'h2';
        return `<${level}${styleAttr}>${block.content.text || 'Заголовок'}</${level}>`;

      case 'text':
        return `<p${styleAttr} class="whitespace-pre-wrap">${block.content.text || 'Текстовый блок'}</p>`;

      case 'image':
        if (block.content.url) {
          const widthStyle = block.content.width ? ` style="max-width: ${block.content.width}"` : '';
          return `<div${styleAttr} class="text-center"><img src="${block.content.url}" alt="${block.content.alt || ''}" class="rounded"${widthStyle}></div>`;
        }
        return `<div${styleAttr} class="w-full h-48 bg-gray-200 rounded flex items-center justify-center"><span class="text-gray-500">Изображение не загружено</span></div>`;

      case 'gallery':
        const images = (block.content.images as { url: string; alt?: string }[]) || [];
        const columns = (block.content.columns as number) || 3;
        if (images.length > 0) {
          const galleryHTML = images.map((img) => 
            `<div class="overflow-hidden rounded"><img src="${img.url}" alt="${img.alt || ''}" class="w-full h-full object-cover"></div>`
          ).join('');
          return `<div class="grid grid-cols-${columns}"${styleAttr}>${galleryHTML}</div>`;
        }
        return `<div${styleAttr} class="col-span-full h-48 bg-gray-200 rounded flex items-center justify-center"><span class="text-gray-500">Галерея пуста</span></div>`;

      case 'button':
        const buttonClass = block.content.style === 'secondary' ? 'btn-secondary' : 
                          block.content.style === 'outline' ? 'btn-outline' : 'btn-primary';
        return `<div${styleAttr}><a href="${block.content.link || '#'}" class="${buttonClass}">${block.content.text || 'Кнопка'}</a></div>`;

      case 'form':
        interface FormField {
          label: string;
          type: string;
          placeholder?: string;
          required?: boolean;
          options?: string[];
        }
        const fields = (block.content.fields as FormField[]) || [];
        const fieldsHTML = fields.map((field) => {
          const requiredAttr = field.required ? ' required' : '';
          const labelHTML = `<label class="form-label">${field.label}${field.required ? ' *' : ''}</label>`;
          
          let inputHTML = '';
          if (field.type === 'textarea') {
            inputHTML = `<textarea class="form-textarea" placeholder="${field.placeholder || ''}"${requiredAttr}></textarea>`;
          } else if (field.type === 'select') {
            const options = field.options ? 
              field.options.map((opt: string) => `<option value="${opt}">${opt}</option>`).join('') :
              '';
            inputHTML = `<select class="form-select"${requiredAttr}><option value="">Выберите...</option>${options}</select>`;
          } else {
            inputHTML = `<input type="${field.type || 'text'}" class="form-input" placeholder="${field.placeholder || ''}"${requiredAttr}>`;
          }
          
          return `<div class="form-group">${labelHTML}${inputHTML}</div>`;
        }).join('');
        
        return `<form${styleAttr} onsubmit="event.preventDefault(); alert('Форма отправлена!');"><h3>${block.content.title || 'Форма'}</h3>${fieldsHTML || '<p class="text-gray-500">Добавьте поля формы</p>'}<button type="submit" class="form-submit">${block.content.submitText || 'Отправить'}</button></form>`;

      case 'divider':
        const dividerStyle = `border: none; border-top: ${block.content.thickness || '1px'} ${block.content.style || 'solid'} ${styles.color || '#e5e7eb'}; ${styleString.replace('style="', '').replace('"', '')}`;
        return `<hr style="${dividerStyle}">`;

      case 'spacer':
        const spacerStyle = `height: ${block.content.height || '40px'}; ${styleString.replace('style="', '').replace('"', '')}`;
        return `<div style="${spacerStyle}"></div>`;

      default:
        return `<div class="text-gray-400">Неизвестный тип блока: ${block.type}</div>`;
    }
  }).join('\n');
}

// Generate complete HTML page
function generateHTMLPage(page: Page, site: Site, allPages: Page[], themeCSS: string, options: ExportOptions): string {
  const blocksHTML = generateBlocksHTML(page.blocks || []);
  
  // Generate navigation if there are multiple pages
  let navigationHTML = '';
  if (allPages.length > 1) {
    const navItems = allPages.map(p => 
      `<a href="${p.slug}.html" class="${page.id === p.id ? 'font-bold' : ''}">${p.title}</a>`
    ).join(' | ');
    navigationHTML = `<nav class="container mb-8"><div class="py-4 border-b">${navItems}</div></nav>`;
  }

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.metaTitle || page.title}</title>
    ${page.metaDescription ? `<meta name="description" content="${page.metaDescription}">` : ''}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ${navigationHTML}
    <main class="container">
        <h1>${page.title}</h1>
        <div class="mt-4">
            ${blocksHTML}
        </div>
    </main>
    <script src="scripts.js"></script>
</body>
</html>`;

  return options.minify ? minifyHTML(html) : html;
}

// Generate JavaScript file
function generateJS(options: ExportOptions): string {
  const js = `
// Simple form handling
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Форма отправлена! (Это статическая версия сайта)');
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
`;

  return options.minify ? minifyJS(js) : js;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const options: ExportOptions = await request.json();

    // Get site with all pages and theme
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: (session.user as { id: string }).id,
      },
      include: {
        pages: {
          include: {
            blocks: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            isHome: 'desc',
          },
        },
        theme: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Сайт не найден' }, { status: 404 });
    }

    if (!site.pages || site.pages.length === 0) {
      return NextResponse.json({ error: 'У сайта нет страниц' }, { status: 400 });
    }

    // Create ZIP archive
    const zip = new JSZip();

    // Generate CSS
    const themeCSS = generateThemeCSS(site.theme);
    const processedCSS = options.minify ? minifyCSS(themeCSS) : themeCSS;
    zip.file('styles.css', processedCSS);

    // Generate JavaScript
    const js = generateJS(options);
    zip.file('scripts.js', js);

    // Generate HTML files for each page
    for (const page of site.pages) {
      const html = generateHTMLPage(page, site, site.pages, themeCSS, options);
      const fileName = page.isHome ? 'index.html' : `${page.slug}.html`;
      zip.file(fileName, html);
    }

    // Add assets folder placeholder
    zip.folder('assets');

    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'base64' });

    // Return the ZIP file
    return new NextResponse(Buffer.from(zipBuffer, 'base64'), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${site.slug}-export.zip"`,
      },
    });

  } catch (error) {
    console.error('Ошибка экспорта сайта:', error);
    return NextResponse.json(
      { error: 'Ошибка при экспорте сайта' },
      { status: 500 }
    );
  }
}