# 📚 Примеры использования SiteBuilder

Практические примеры работы с SiteBuilder API и интерфейсом.

## 🌟 Основные сценарии

### 1. Создание простого лендинга

```javascript
// 1. Создаём сайт
const site = await fetch('/api/sites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Мой стартап',
    slug: 'my-startup',
    description: 'Инновационный продукт'
  })
}).then(r => r.json());

// 2. Получаем главную страницу
const pages = site.pages;
const mainPage = pages.find(p => p.isHome);

// 3. Добавляем блоки
const blocks = [
  {
    type: 'heading',
    content: { text: 'Революционный продукт', level: 'h1' },
    order: 0
  },
  {
    type: 'text',
    content: { text: 'Мы меняем индустрию к лучшему' },
    order: 1
  },
  {
    type: 'button',
    content: { 
      text: 'Попробовать бесплатно', 
      link: '/signup',
      style: 'primary'
    },
    order: 2
  }
];

for (const block of blocks) {
  await fetch(`/api/pages/${mainPage.id}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(block)
  });
}

// 4. Публикуем страницу
await fetch(`/api/pages/${mainPage.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ published: true })
});
```

### 2. Создание страницы "О нас"

```javascript
// Создаём новую страницу
const aboutPage = await fetch(`/api/sites/${siteId}/pages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'О нас',
    slug: 'about'
  })
}).then(r => r.json());

// Добавляем контент
const aboutContent = [
  {
    type: 'heading',
    content: { text: 'О нашей компании', level: 'h1' }
  },
  {
    type: 'text',
    content: { 
      text: 'Мы работаем с 2020 года и помогаем бизнесу расти.'
    }
  },
  {
    type: 'image',
    content: {
      url: 'https://example.com/team.jpg',
      alt: 'Наша команда'
    }
  },
  {
    type: 'heading',
    content: { text: 'Наши ценности', level: 'h2' }
  }
];

for (let i = 0; i < aboutContent.length; i++) {
  await fetch(`/api/pages/${aboutPage.id}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...aboutContent[i], order: i })
  });
}
```

### 3. Изменение темы сайта

```javascript
// Обновляем тему
await fetch(`/api/sites/${siteId}/theme`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4',
    backgroundColor: '#F7FFF7',
    textColor: '#1A535C',
    fontFamily: 'Roboto'
  })
});
```

### 4. Использование шаблона

```javascript
// Получаем список шаблонов
const templates = await fetch('/api/templates').then(r => r.json());

// Выбираем шаблон
const startupTemplate = templates.find(t => 
  t.name === 'Лендинг для стартапа'
);

// Создаём страницу из шаблона
const page = await fetch(`/api/sites/${siteId}/pages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Главная',
    slug: 'home'
  })
}).then(r => r.json());

// Добавляем блоки из шаблона
for (const block of startupTemplate.blocks) {
  await fetch(`/api/pages/${page.id}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(block)
  });
}
```

## 🎨 Работа с блоками

### Галерея изображений

```javascript
const images = [
  'https://example.com/img1.jpg',
  'https://example.com/img2.jpg',
  'https://example.com/img3.jpg'
];

for (let i = 0; i < images.length; i++) {
  await fetch(`/api/pages/${pageId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'image',
      content: {
        url: images[i],
        alt: `Изображение ${i + 1}`
      },
      order: i
    })
  });
}
```

### Призыв к действию (CTA)

```javascript
const cta = [
  {
    type: 'heading',
    content: { text: 'Готовы начать?', level: 'h2' },
    order: 0
  },
  {
    type: 'text',
    content: { text: 'Присоединяйтесь к 10,000+ довольных клиентов' },
    order: 1
  },
  {
    type: 'button',
    content: { 
      text: 'Регистрация',
      link: '/signup',
      style: 'primary'
    },
    order: 2
  }
];

await Promise.all(cta.map(block => 
  fetch(`/api/pages/${pageId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(block)
  })
));
```

### Переупорядочивание блоков

```javascript
// Получаем текущие блоки
const page = await fetch(`/api/pages/${pageId}`).then(r => r.json());
let blocks = page.blocks;

// Меняем порядок (например, перемещаем первый блок в конец)
const firstBlock = blocks.shift();
blocks.push(firstBlock);

// Обновляем order
blocks = blocks.map((block, index) => ({
  ...block,
  order: index
}));

// Сохраняем новый порядок
await fetch(`/api/pages/${pageId}/blocks`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ blocks })
});
```

## 🔄 Массовые операции

### Создание многостраничного сайта

```javascript
const pages = [
  { title: 'Главная', slug: 'index' },
  { title: 'О нас', slug: 'about' },
  { title: 'Услуги', slug: 'services' },
  { title: 'Портфолио', slug: 'portfolio' },
  { title: 'Контакты', slug: 'contacts' }
];

for (const pageData of pages) {
  await fetch(`/api/sites/${siteId}/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageData)
  });
}
```

### Клонирование страницы

```javascript
// Получаем исходную страницу
const sourcePage = await fetch(`/api/pages/${sourcePageId}`)
  .then(r => r.json());

// Создаём новую страницу
const newPage = await fetch(`/api/sites/${siteId}/pages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: `${sourcePage.title} (копия)`,
    slug: `${sourcePage.slug}-copy`
  })
}).then(r => r.json());

// Копируем блоки
for (const block of sourcePage.blocks) {
  await fetch(`/api/pages/${newPage.id}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: block.type,
      content: block.content,
      order: block.order
    })
  });
}
```

## 🚀 Интеграции

### Webhook при публикации

```javascript
// После публикации отправляем webhook
async function publishPageWithWebhook(pageId) {
  // Публикуем страницу
  const page = await fetch(`/api/pages/${pageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ published: true })
  }).then(r => r.json());

  // Отправляем webhook
  await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Страница "${page.title}" опубликована! 🎉`
    })
  });

  return page;
}
```

### Экспорт в HTML

```javascript
async function exportToHTML(pageId) {
  const page = await fetch(`/api/pages/${pageId}`).then(r => r.json());
  
  let html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <style>
    body { font-family: ${page.site.theme.fontFamily}, sans-serif; }
    h1, h2, h3 { color: ${page.site.theme.primaryColor}; }
  </style>
</head>
<body>
`;

  for (const block of page.blocks) {
    switch (block.type) {
      case 'heading':
        const tag = block.content.level || 'h2';
        html += `<${tag}>${block.content.text}</${tag}>\n`;
        break;
      case 'text':
        html += `<p>${block.content.text}</p>\n`;
        break;
      case 'image':
        html += `<img src="${block.content.url}" alt="${block.content.alt}">\n`;
        break;
      case 'button':
        html += `<a href="${block.content.link}" class="btn-${block.content.style}">${block.content.text}</a>\n`;
        break;
    }
  }

  html += `
</body>
</html>
`;

  return html;
}
```

## 📊 Аналитика и статистика

### Получение статистики по сайтам

```javascript
async function getSitesStats() {
  const sites = await fetch('/api/sites').then(r => r.json());
  
  const stats = {
    total: sites.length,
    published: sites.filter(s => s.published).length,
    drafts: sites.filter(s => !s.published).length,
    totalPages: sites.reduce((sum, s) => sum + s.pages.length, 0),
    totalBlocks: 0
  };

  for (const site of sites) {
    for (const page of site.pages) {
      const pageData = await fetch(`/api/pages/${page.id}`)
        .then(r => r.json());
      stats.totalBlocks += pageData.blocks.length;
    }
  }

  return stats;
}
```

## 🎯 Продвинутые примеры

### Автосохранение в редакторе

```javascript
let saveTimeout;

function autoSave(pageId, blocks) {
  clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(async () => {
    await fetch(`/api/pages/${pageId}/blocks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks })
    });
    console.log('✓ Автосохранение выполнено');
  }, 1000); // Сохраняем через 1 секунду после последнего изменения
}
```

### Проверка уникальности slug

```javascript
async function generateUniqueSlug(siteId, baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const site = await fetch(`/api/sites/${siteId}`).then(r => r.json());
    const exists = site.pages.some(p => p.slug === slug);
    
    if (!exists) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
```

## 🔧 Утилиты

### Валидация блока

```javascript
function validateBlock(block) {
  const schemas = {
    heading: ['text', 'level'],
    text: ['text'],
    image: ['url', 'alt'],
    button: ['text', 'link', 'style']
  };

  const required = schemas[block.type];
  if (!required) return false;

  return required.every(field => 
    block.content && block.content[field] !== undefined
  );
}
```

### Форматирование даты

```javascript
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
```

## 🔌 Работа с плагинами

### Установка и активация плагина

```javascript
// Установить плагин
const plugin = await fetch('/api/plugins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Contact Form',
    slug: 'contact-form',
    version: '1.0.0',
    description: 'Add contact forms to your site',
    author: 'SiteBuilder'
  })
}).then(r => r.json());

// Активировать плагин
await fetch(`/api/plugins/${plugin.id}/activate`, {
  method: 'POST'
});
```

### Использование хуков в плагине

```javascript
// В плагине
api.addAction('form_submit', async (formData) => {
  // Отправить email
  await sendEmail({
    to: 'admin@example.com',
    subject: 'New contact form submission',
    body: JSON.stringify(formData)
  });
});

// В приложении
import { doAction } from '@/lib/plugin-system';

await doAction('form_submit', {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
});
```

### Регистрация пользовательского блока

```javascript
// В плагине
api.registerBlock({
  type: 'custom-cta',
  label: 'Custom CTA',
  icon: '🎯',
  category: 'marketing',
  defaultContent: {
    title: 'Join Us Today',
    subtitle: 'Get started in minutes',
    buttonText: 'Sign Up',
    buttonLink: '/signup'
  }
});
```

### Использование фильтров

```javascript
// Добавить фильтр
api.addFilter('page_title', (title, pageId) => {
  return title.toUpperCase();
});

// Применить фильтр
import { applyFilters } from '@/lib/plugin-system';

const title = await applyFilters('page_title', 'My Page', pageId);
// Результат: "MY PAGE"
```

## 🎨 Работа с темами

### Получение списка тем

```javascript
const themes = await fetch('/api/themes')
  .then(r => r.json());

console.log(themes);
```

### Активация темы

```javascript
await fetch(`/api/themes/modern/activate?siteId=${siteId}`, {
  method: 'POST'
});
```

### Использование CSS переменных темы

```javascript
// В React компоненте
function MyComponent() {
  return (
    <div style={{
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-foreground)',
      padding: 'var(--spacing-4)',
      borderRadius: 'var(--border-radius-md)',
      boxShadow: 'var(--shadow-md)',
      fontFamily: 'var(--font-family-body)'
    }}>
      Styled with theme variables
    </div>
  );
}
```

### Создание пользовательской темы

```javascript
// themes/my-theme/theme.json
{
  "name": "My Custom Theme",
  "slug": "my-theme",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A custom theme",
  "colors": {
    "primary": "#FF6B6B",
    "secondary": "#4ECDC4",
    "background": "#FFFFFF",
    "foreground": "#2C3E50"
  },
  "typography": {
    "fontFamily": {
      "heading": "'Montserrat', sans-serif",
      "body": "'Open Sans', sans-serif"
    },
    "fontSize": {
      "base": "16px",
      "scale": 1.2
    },
    "lineHeight": {
      "tight": 1.2,
      "normal": 1.6,
      "relaxed": 1.8
    }
  },
  "spacing": {
    "unit": "0.25rem",
    "scale": [0, 1, 2, 3, 4, 6, 8, 12, 16, 24]
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "16px",
    "full": "9999px"
  }
}
```

## 🚀 Продвинутые сценарии с плагинами

### Создание формы обратной связи

```javascript
// Добавить блок контактной формы
await fetch(`/api/pages/${pageId}/blocks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'contact-form',
    content: {
      title: 'Contact Us',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'text', required: false },
        { name: 'message', label: 'Message', type: 'textarea', required: true }
      ],
      submitText: 'Send Message',
      successMessage: 'Thank you! We will contact you soon.',
      recipientEmail: 'contact@example.com'
    },
    order: 0
  })
});
```

### Добавление секции отзывов

```javascript
// Добавить блок с отзывами
await fetch(`/api/pages/${pageId}/blocks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'testimonials',
    content: {
      title: 'What Our Clients Say',
      testimonials: [
        {
          id: '1',
          content: 'Excellent service! Highly recommend.',
          author: 'Alice Johnson',
          role: 'CEO, TechCorp',
          avatar: 'https://example.com/alice.jpg',
          rating: 5
        },
        {
          id: '2',
          content: 'Great experience from start to finish.',
          author: 'Bob Smith',
          role: 'Founder, StartupXYZ',
          avatar: 'https://example.com/bob.jpg',
          rating: 5
        }
      ],
      layout: 'grid',
      columns: 2
    },
    order: 1
  })
});
```

---

Больше примеров в [документации API](./API.md) и [документации плагинов](./PLUGIN_THEME_SYSTEM.md).
