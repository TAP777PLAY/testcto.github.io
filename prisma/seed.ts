import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  const templates = [
    {
      name: 'Лендинг для стартапа',
      description: 'Современный одностраничный сайт для технологического стартапа',
      preview: 'https://via.placeholder.com/400x300?text=Startup+Landing',
      category: 'business',
      blocks: [
        {
          type: 'heading',
          content: { text: 'Инновационное решение для вашего бизнеса', level: 'h1' },
          order: 0,
        },
        {
          type: 'text',
          content: {
            text: 'Мы помогаем компаниям внедрять современные технологии и масштабироваться.',
          },
          order: 1,
        },
        {
          type: 'button',
          content: { text: 'Начать бесплатно', link: '#signup', style: 'primary' },
          order: 2,
        },
      ],
    },
    {
      name: 'Портфолио',
      description: 'Минималистичное портфолио для дизайнера или разработчика',
      preview: 'https://via.placeholder.com/400x300?text=Portfolio',
      category: 'personal',
      blocks: [
        {
          type: 'heading',
          content: { text: 'Иван Иванов', level: 'h1' },
          order: 0,
        },
        {
          type: 'text',
          content: { text: 'Frontend разработчик с опытом 5+ лет' },
          order: 1,
        },
        {
          type: 'heading',
          content: { text: 'Мои проекты', level: 'h2' },
          order: 2,
        },
      ],
    },
    {
      name: 'Блог',
      description: 'Простой и чистый шаблон для персонального блога',
      preview: 'https://via.placeholder.com/400x300?text=Blog',
      category: 'blog',
      blocks: [
        {
          type: 'heading',
          content: { text: 'Мой блог', level: 'h1' },
          order: 0,
        },
        {
          type: 'text',
          content: { text: 'Делюсь опытом в разработке, дизайне и технологиях.' },
          order: 1,
        },
        {
          type: 'heading',
          content: { text: 'Последние статьи', level: 'h2' },
          order: 2,
        },
      ],
    },
    {
      name: 'Магазин',
      description: 'Базовый шаблон для интернет-магазина',
      preview: 'https://via.placeholder.com/400x300?text=Shop',
      category: 'ecommerce',
      blocks: [
        {
          type: 'heading',
          content: { text: 'Добро пожаловать в наш магазин', level: 'h1' },
          order: 0,
        },
        {
          type: 'text',
          content: { text: 'Лучшие товары по доступным ценам' },
          order: 1,
        },
        {
          type: 'button',
          content: { text: 'Каталог', link: '/catalog', style: 'primary' },
          order: 2,
        },
      ],
    },
    {
      name: 'Корпоративный сайт',
      description: 'Профессиональный шаблон для компании',
      preview: 'https://via.placeholder.com/400x300?text=Corporate',
      category: 'business',
      blocks: [
        {
          type: 'heading',
          content: { text: 'О нашей компании', level: 'h1' },
          order: 0,
        },
        {
          type: 'text',
          content: {
            text: 'Мы - ведущая компания в своей отрасли с опытом работы более 10 лет.',
          },
          order: 1,
        },
        {
          type: 'heading',
          content: { text: 'Наши услуги', level: 'h2' },
          order: 2,
        },
        {
          type: 'button',
          content: { text: 'Связаться с нами', link: '/contact', style: 'primary' },
          order: 3,
        },
      ],
    },
  ];

  console.log('📝 Создание шаблонов...');

  for (const template of templates) {
    await prisma.template.create({
      data: template,
    });
    console.log(`✓ Создан шаблон: ${template.name}`);
  }

  console.log('💳 Создание тарифных планов...');

  const plans = [
    {
      name: 'Free',
      description: 'Идеально для начала',
      price: 0,
      currency: 'RUB',
      interval: 'month',
      features: [
        'Визуальный редактор',
        'Готовые шаблоны',
        'Базовая поддержка',
      ],
      maxSites: 1,
      maxPages: 10,
      customDomain: false,
      aiCredits: 5,
      marketplaceAccess: false,
      priority: 0,
    },
    {
      name: 'Pro',
      description: 'Для профессионалов',
      price: 99000,
      currency: 'RUB',
      interval: 'month',
      features: [
        'Все из Free',
        'Приоритетная поддержка',
        'Расширенная аналитика',
        'Экспорт в HTML/CSS',
      ],
      maxSites: 5,
      maxPages: 100,
      customDomain: true,
      aiCredits: 100,
      marketplaceAccess: true,
      priority: 1,
    },
    {
      name: 'Business',
      description: 'Для команд и агентств',
      price: 299000,
      currency: 'RUB',
      interval: 'month',
      features: [
        'Все из Pro',
        'Белая метка',
        'API доступ',
        'Управление командой',
        'SLA гарантии',
      ],
      maxSites: -1,
      maxPages: -1,
      customDomain: true,
      aiCredits: -1,
      marketplaceAccess: true,
      priority: 2,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: plan,
    });
    console.log(`✓ Создан план: ${plan.name}`);
  }

  console.log('🛍️ Создание примеров для маркетплейса...');

  const samplePlugins = [
    {
      name: 'Форма обратной связи',
      slug: 'contact-form',
      description: 'Добавьте форму обратной связи на ваш сайт',
      longDescription:
        'Полнофункциональная форма обратной связи с валидацией, защитой от спама и уведомлениями по email.',
      version: '1.0.0',
      author: 'SiteBuilder Team',
      price: 0,
      category: 'forms',
      tags: ['форма', 'контакты', 'email'],
      config: {
        fields: ['name', 'email', 'message'],
        emailTo: 'admin@example.com',
      },
      code: '// Plugin code here',
      featured: true,
    },
    {
      name: 'Google Analytics',
      slug: 'google-analytics',
      description: 'Интеграция с Google Analytics',
      longDescription: 'Простая интеграция Google Analytics для отслеживания посетителей.',
      version: '1.0.0',
      author: 'SiteBuilder Team',
      price: 0,
      category: 'analytics',
      tags: ['аналитика', 'google', 'статистика'],
      config: {
        trackingId: '',
      },
      code: '// Plugin code here',
      featured: true,
    },
  ];

  for (const plugin of samplePlugins) {
    await prisma.marketplacePlugin.create({
      data: plugin,
    });
    console.log(`✓ Создан плагин: ${plugin.name}`);
  }

  const sampleThemes = [
    {
      name: 'Modern Blue',
      slug: 'modern-blue',
      description: 'Современная синяя тема',
      longDescription: 'Чистый и современный дизайн в синих тонах',
      version: '1.0.0',
      author: 'SiteBuilder Team',
      price: 0,
      category: 'business',
      tags: ['синий', 'современный', 'чистый'],
      colors: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter',
      },
      featured: true,
    },
    {
      name: 'Dark Elegance',
      slug: 'dark-elegance',
      description: 'Элегантная темная тема',
      longDescription: 'Стильная темная тема для современных сайтов',
      version: '1.0.0',
      author: 'SiteBuilder Team',
      price: 49000,
      category: 'creative',
      tags: ['темная', 'элегантная', 'стильная'],
      colors: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        backgroundColor: '#1F2937',
        textColor: '#F9FAFB',
        fontFamily: 'Poppins',
      },
      featured: true,
    },
  ];

  for (const theme of sampleThemes) {
    await prisma.marketplaceTheme.create({
      data: theme,
    });
    console.log(`✓ Создана тема: ${theme.name}`);
  }

  console.log('✅ База данных успешно заполнена!');
  console.log(`📊 Создано шаблонов: ${templates.length}`);
  console.log(`💳 Создано планов: ${plans.length}`);
  console.log(`🔌 Создано плагинов: ${samplePlugins.length}`);
  console.log(`🎨 Создано тем: ${sampleThemes.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
