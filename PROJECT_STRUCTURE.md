# 📁 Структура проекта SiteBuilder

Подробное описание организации файлов и папок в проекте.

```
sitebuilder/
├── 📁 app/                           # Next.js App Router
│   ├── 📁 api/                       # API Routes (Backend)
│   │   ├── 📁 auth/                  # Аутентификация
│   │   │   ├── 📁 [...nextauth]/    # NextAuth.js handler
│   │   │   │   └── route.ts         # GET/POST /api/auth/*
│   │   │   └── 📁 register/         
│   │   │       └── route.ts         # POST /api/auth/register
│   │   ├── 📁 blocks/                # Управление блоками
│   │   │   └── 📁 [blockId]/        
│   │   │       └── route.ts         # DELETE /api/blocks/:id
│   │   ├── 📁 pages/                 # Управление страницами
│   │   │   └── 📁 [pageId]/         
│   │   │       ├── route.ts         # GET/PUT/DELETE /api/pages/:id
│   │   │       └── 📁 blocks/       
│   │   │           └── route.ts     # POST/PUT /api/pages/:id/blocks
│   │   ├── 📁 sites/                 # Управление сайтами
│   │   │   ├── route.ts             # GET/POST /api/sites
│   │   │   └── 📁 [siteId]/         
│   │   │       ├── route.ts         # GET/PUT/DELETE /api/sites/:id
│   │   │       └── 📁 pages/        
│   │   │           └── route.ts     # POST /api/sites/:id/pages
│   │   └── 📁 templates/             # Шаблоны
│   │       └── route.ts             # GET /api/templates
│   ├── 📁 auth/                      # Страницы аутентификации
│   │   ├── 📁 register/             
│   │   │   └── page.tsx             # Страница регистрации
│   │   └── 📁 signin/               
│   │       └── page.tsx             # Страница входа
│   ├── 📁 dashboard/                 # Панель управления
│   │   └── page.tsx                 # Список сайтов пользователя
│   ├── 📁 editor/                    # Визуальный редактор
│   │   └── 📁 [siteId]/             
│   │       └── page.tsx             # Редактор страниц
│   ├── layout.tsx                   # Корневой layout
│   ├── page.tsx                     # Главная страница (лендинг)
│   └── globals.css                  # Глобальные стили
│
├── 📁 components/                    # React компоненты
│   ├── BlockEditor.tsx              # Основной редактор блоков
│   ├── BlockRenderer.tsx            # Рендеринг блоков для preview
│   ├── SessionProvider.tsx          # NextAuth провайдер
│   └── SortableBlock.tsx            # Drag-and-drop блок
│
├── 📁 lib/                          # Утилиты и библиотеки
│   ├── auth.ts                      # NextAuth конфигурация
│   └── prisma.ts                    # Prisma клиент singleton
│
├── 📁 prisma/                       # Database схемы и миграции
│   ├── schema.prisma                # Схема базы данных
│   ├── seed.ts                      # Seed скрипт (шаблоны)
│   └── 📁 migrations/               # Миграции (генерируются)
│       └── ...
│
├── 📁 public/                       # Статические файлы
│   ├── next.svg                     # Next.js logo
│   └── vercel.svg                   # Vercel logo
│
├── 📁 node_modules/                 # Зависимости (не в Git)
├── 📁 .next/                        # Build output (не в Git)
│
├── 📄 .env                          # Переменные окружения (не в Git)
├── 📄 .env.example                  # Пример переменных окружения
├── 📄 .gitignore                    # Игнорируемые файлы
├── 📄 .nvmrc                        # Версия Node.js
│
├── 📄 Dockerfile                    # Docker конфигурация
├── 📄 docker-compose.yml            # Docker Compose setup
│
├── 📄 next.config.ts                # Next.js конфигурация
├── 📄 tsconfig.json                 # TypeScript конфигурация
├── 📄 postcss.config.mjs            # PostCSS конфигурация
├── 📄 eslint.config.mjs             # ESLint конфигурация
├── 📄 tailwind.config.ts            # Tailwind CSS конфигурация (в next.config)
│
├── 📄 package.json                  # Зависимости и скрипты
├── 📄 package-lock.json             # Lock файл зависимостей
│
├── 📄 vercel.json                   # Vercel конфигурация
│
├── 📄 README.md                     # Главная документация
├── 📄 QUICKSTART.md                 # Быстрый старт
├── 📄 ARCHITECTURE.md               # Архитектура проекта
├── 📄 API.md                        # API документация
├── 📄 VERCEL_DEPLOYMENT.md          # Деплой на Vercel
├── 📄 CONTRIBUTING.md               # Руководство для контрибьюторов
├── 📄 SECURITY.md                   # Политика безопасности
├── 📄 EXAMPLES.md                   # Примеры использования
├── 📄 CHANGELOG.md                  # История изменений
├── 📄 PROJECT_STRUCTURE.md          # Этот файл
└── 📄 LICENSE                       # MIT License
```

## 🗂️ Описание директорий

### `/app` - Next.js App Router

Основная директория приложения. Next.js использует файловую маршрутизацию:
- `page.tsx` - страницы
- `layout.tsx` - layouts
- `route.ts` - API endpoints

### `/app/api` - Backend API

REST API endpoints для всех операций:
- **Auth** - регистрация, вход, управление сессиями
- **Sites** - CRUD сайтов
- **Pages** - CRUD страниц
- **Blocks** - CRUD блоков контента
- **Templates** - получение шаблонов

### `/components` - React компоненты

Переиспользуемые компоненты:
- `BlockEditor` - главный компонент редактора с drag-and-drop
- `SortableBlock` - отдельный блок с возможностью сортировки
- `BlockRenderer` - рендеринг блоков для отображения
- `SessionProvider` - обёртка для NextAuth

### `/lib` - Утилиты

Вспомогательные модули:
- `prisma.ts` - singleton клиент Prisma
- `auth.ts` - конфигурация NextAuth.js

### `/prisma` - База данных

Всё, что связано с базой данных:
- `schema.prisma` - схема БД
- `seed.ts` - начальные данные
- `migrations/` - история миграций

## 📝 Ключевые файлы

### Конфигурация

| Файл | Назначение |
|------|-----------|
| `next.config.ts` | Конфигурация Next.js |
| `tsconfig.json` | Конфигурация TypeScript |
| `tailwind.config.ts` | Конфигурация Tailwind (через next.config) |
| `eslint.config.mjs` | Конфигурация ESLint |
| `postcss.config.mjs` | Конфигурация PostCSS |
| `vercel.json` | Конфигурация Vercel |

### Безопасность

| Файл | Назначение |
|------|-----------|
| `.env` | Переменные окружения (секреты) |
| `.env.example` | Шаблон переменных |
| `.gitignore` | Исключения из Git |

### Docker

| Файл | Назначение |
|------|-----------|
| `Dockerfile` | Docker image |
| `docker-compose.yml` | Локальная разработка с PostgreSQL |

### Документация

| Файл | Для кого |
|------|----------|
| `README.md` | Все |
| `QUICKSTART.md` | Новички |
| `ARCHITECTURE.md` | Разработчики |
| `API.md` | API пользователи |
| `VERCEL_DEPLOYMENT.md` | DevOps |
| `CONTRIBUTING.md` | Контрибьюторы |
| `SECURITY.md` | Security researchers |
| `EXAMPLES.md` | Разработчики |
| `CHANGELOG.md` | Все |

## 🔍 Поиск файлов

### По функциональности

**Аутентификация:**
```
app/api/auth/
app/auth/
lib/auth.ts
```

**Редактор:**
```
app/editor/
components/BlockEditor.tsx
components/SortableBlock.tsx
components/BlockRenderer.tsx
```

**API:**
```
app/api/sites/
app/api/pages/
app/api/blocks/
```

**База данных:**
```
prisma/schema.prisma
prisma/seed.ts
lib/prisma.ts
```

## 📐 Соглашения об именовании

### Файлы

- **Компоненты:** `PascalCase.tsx` (например, `BlockEditor.tsx`)
- **Утилиты:** `camelCase.ts` (например, `formatDate.ts`)
- **API Routes:** `route.ts` (стандарт Next.js)
- **Страницы:** `page.tsx` (стандарт Next.js)

### Директории

- **Динамические маршруты:** `[param]/` (например, `[siteId]/`)
- **Группы маршрутов:** `(group)/` (например, `(auth)/`)
- **Обычные:** `kebab-case/` (например, `auth-utils/`)

## 🚀 Добавление новых функций

### Новый API endpoint

1. Создать файл в `app/api/`
2. Экспортировать функции HTTP методов
3. Добавить документацию в `API.md`

### Новый компонент

1. Создать файл в `components/`
2. Использовать TypeScript типы
3. Добавить 'use client' если нужна интерактивность

### Новая страница

1. Создать `page.tsx` в нужной директории в `app/`
2. Опционально добавить `layout.tsx`
3. Обновить навигацию

### Новая модель БД

1. Обновить `prisma/schema.prisma`
2. Создать миграцию: `npx prisma migrate dev`
3. Обновить seed если нужно

## 🔄 Workflow разработки

```bash
# 1. Создать ветку
git checkout -b feature/new-feature

# 2. Разработка
npm run dev

# 3. Проверка
npm run build
npm run lint

# 4. Коммит
git commit -m "feat: добавлена новая функция"

# 5. Push
git push origin feature/new-feature

# 6. Pull Request
```

## 📊 Размер проекта

```
Строки кода (без зависимостей):
- TypeScript/TSX: ~3000 строк
- Prisma Schema: ~130 строк
- Документация: ~5000 строк

Зависимости: ~420 пакетов
Размер node_modules: ~200 MB
Размер production build: ~2 MB
```

---

Документация обновлена: 2024-11-01
