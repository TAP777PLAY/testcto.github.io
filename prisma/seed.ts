import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Создание пользователей с разными ролями
  console.log('👥 Создание пользователей...');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Администратор',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('✓ Создан администратор: admin@example.com (пароль: admin123)');

  const editorPassword = await bcrypt.hash('editor123', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Редактор',
      password: editorPassword,
      role: Role.EDITOR,
    },
  });
  console.log('✓ Создан редактор: editor@example.com (пароль: editor123)');

  const viewerPassword = await bcrypt.hash('viewer123', 10);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Наблюдатель',
      password: viewerPassword,
      role: Role.VIEWER,
    },
  });
  console.log('✓ Создан наблюдатель: viewer@example.com (пароль: viewer123)');

  // Создание шаблонов
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
    await prisma.template.upsert({
      where: {
        id: template.name,
      },
      update: {},
      create: template,
    });
    console.log(`✓ Создан шаблон: ${template.name}`);
  }

  // Создание демо-сайта для администратора
  console.log('🌐 Создание демо-сайта...');
  
  const demoSite = await prisma.site.upsert({
    where: { slug: 'demo-site' },
    update: {},
    create: {
      name: 'Демо-сайт',
      slug: 'demo-site',
      description: 'Тестовый сайт для демонстрации возможностей',
      userId: admin.id,
      published: true,
      theme: {
        create: {
          name: 'Демо-тема',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          fontFamily: 'Inter',
        },
      },
      pages: {
        create: [
          {
            title: 'Главная',
            slug: 'index',
            isHome: true,
            published: true,
            metaTitle: 'Главная страница - Демо-сайт',
            metaDescription: 'Добро пожаловать на наш демо-сайт',
            blocks: {
              create: [
                {
                  type: 'heading',
                  content: { text: 'Добро пожаловать!', level: 'h1' },
                  order: 0,
                },
                {
                  type: 'text',
                  content: {
                    text: 'Это демонстрационный сайт, созданный для показа возможностей CMS.',
                  },
                  order: 1,
                },
                {
                  type: 'button',
                  content: {
                    text: 'Узнать больше',
                    link: '#about',
                    style: 'primary',
                  },
                  order: 2,
                },
              ],
            },
          },
          {
            title: 'О нас',
            slug: 'about',
            published: true,
            metaTitle: 'О нас - Демо-сайт',
            metaDescription: 'Информация о нашем проекте',
            blocks: {
              create: [
                {
                  type: 'heading',
                  content: { text: 'О нашем проекте', level: 'h1' },
                  order: 0,
                },
                {
                  type: 'text',
                  content: {
                    text: 'Мы создали современную CMS для простого создания сайтов.',
                  },
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('✓ Создан демо-сайт: demo-site');

  // Создание тестовых постов
  console.log('📰 Создание тестовых постов...');

  const posts = [
    {
      title: 'Введение в Next.js',
      slug: 'intro-to-nextjs',
      content: 'Next.js - это мощный React-фреймворк для создания производительных веб-приложений. В этой статье мы рассмотрим основные возможности и преимущества использования Next.js в современной веб-разработке.',
      excerpt: 'Узнайте об основах Next.js и его преимуществах',
      coverImage: 'https://via.placeholder.com/800x400?text=Next.js',
      published: true,
      publishedAt: new Date('2024-01-15'),
      metaTitle: 'Введение в Next.js - Полное руководство',
      metaDescription: 'Подробное введение в Next.js для начинающих разработчиков',
      tags: ['nextjs', 'react', 'javascript'],
      authorId: admin.id,
      siteId: demoSite.id,
    },
    {
      title: 'Основы TypeScript',
      slug: 'typescript-basics',
      content: 'TypeScript добавляет типизацию в JavaScript, что делает код более надежным и легким для поддержки. Давайте разберем основные концепции и типы данных.',
      excerpt: 'Изучите основы TypeScript и статической типизации',
      coverImage: 'https://via.placeholder.com/800x400?text=TypeScript',
      published: true,
      publishedAt: new Date('2024-01-20'),
      metaTitle: 'Основы TypeScript для начинающих',
      metaDescription: 'Полное руководство по TypeScript',
      tags: ['typescript', 'javascript', 'programming'],
      authorId: editor.id,
      siteId: demoSite.id,
    },
    {
      title: 'Создание REST API',
      slug: 'building-rest-api',
      content: 'REST API - это стандарт для создания веб-сервисов. В этой статье мы создадим полноценный REST API с использованием Next.js и Prisma.',
      excerpt: 'Пошаговое руководство по созданию REST API',
      coverImage: 'https://via.placeholder.com/800x400?text=REST+API',
      published: false,
      metaTitle: 'Создание REST API с Next.js',
      metaDescription: 'Руководство по созданию REST API',
      tags: ['api', 'rest', 'backend'],
      authorId: editor.id,
      siteId: demoSite.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: {
        slug_siteId: {
          slug: post.slug,
          siteId: post.siteId,
        },
      },
      update: {},
      create: post,
    });
    console.log(`✓ Создан пост: ${post.title}`);
  }

  // Создание тестовых медиафайлов
  console.log('🖼️  Создание тестовых медиафайлов...');

  const mediaFiles = [
    {
      name: 'Логотип компании',
      fileName: 'logo.png',
      url: 'https://via.placeholder.com/200x200?text=Logo',
      type: 'IMAGE' as const,
      mimeType: 'image/png',
      size: 15000,
      width: 200,
      height: 200,
      alt: 'Логотип компании',
      caption: 'Официальный логотип',
      userId: admin.id,
    },
    {
      name: 'Баннер главной страницы',
      fileName: 'hero-banner.jpg',
      url: 'https://via.placeholder.com/1920x1080?text=Hero+Banner',
      type: 'IMAGE' as const,
      mimeType: 'image/jpeg',
      size: 250000,
      width: 1920,
      height: 1080,
      alt: 'Баннер главной страницы',
      caption: 'Основной баннер для главной страницы',
      userId: admin.id,
    },
    {
      name: 'Промо видео',
      fileName: 'promo.mp4',
      url: 'https://www.example.com/videos/promo.mp4',
      type: 'VIDEO' as const,
      mimeType: 'video/mp4',
      size: 5000000,
      width: 1920,
      height: 1080,
      alt: 'Промо видео компании',
      caption: 'Видео презентация продукта',
      userId: editor.id,
    },
    {
      name: 'Руководство пользователя',
      fileName: 'user-guide.pdf',
      url: 'https://www.example.com/docs/user-guide.pdf',
      type: 'DOCUMENT' as const,
      mimeType: 'application/pdf',
      size: 1500000,
      alt: 'Руководство пользователя',
      caption: 'Подробное руководство по использованию системы',
      userId: admin.id,
    },
  ];

  for (const media of mediaFiles) {
    await prisma.media.create({
      data: media,
    });
    console.log(`✓ Создан медиафайл: ${media.name}`);
  }

  console.log('\n✅ База данных успешно заполнена!');
  console.log('\n📊 Статистика:');
  console.log(`   👥 Пользователей: 3`);
  console.log(`   📝 Шаблонов: ${templates.length}`);
  console.log(`   🌐 Сайтов: 1`);
  console.log(`   📄 Страниц: 2`);
  console.log(`   📰 Постов: ${posts.length}`);
  console.log(`   🖼️  Медиафайлов: ${mediaFiles.length}`);
  console.log('\n🔑 Учетные данные для входа:');
  console.log('   Администратор: admin@example.com / admin123');
  console.log('   Редактор: editor@example.com / editor123');
  console.log('   Наблюдатель: viewer@example.com / viewer123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
