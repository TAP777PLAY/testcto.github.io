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

  console.log('✅ База данных успешно заполнена!');
  console.log(`📊 Создано шаблонов: ${templates.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
