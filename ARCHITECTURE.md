# Архитектура проекта SiteBuilder

## 📐 Общая архитектура

SiteBuilder построен на монолитной архитектуре с использованием Next.js App Router, что обеспечивает:
- Унифицированный код frontend и backend
- Server-side rendering (SSR)
- API Routes для RESTful API
- Оптимизацию производительности

## 🏗️ Основные модули

### 1. Frontend (React/Next.js)

```
app/
├── page.tsx              # Лендинг
├── auth/                 # Аутентификация
├── dashboard/            # Панель управления
└── editor/               # Визуальный редактор
```

**Особенности:**
- Server Components по умолчанию
- Client Components для интерактивности
- Использование Next.js App Router
- TypeScript для типобезопасности

### 2. Backend (API Routes)

```
app/api/
├── auth/                 # Аутентификация
│   ├── [...nextauth]/    # NextAuth.js
│   └── register/         # Регистрация
├── sites/                # CRUD сайтов
├── pages/                # CRUD страниц
├── blocks/               # CRUD блоков
└── templates/            # Шаблоны
```

**Особенности:**
- RESTful API
- Middleware для аутентификации
- Валидация данных
- Обработка ошибок

### 3. База данных (PostgreSQL + Prisma)

**Модели:**

```
User (Пользователи)
  ↓ 1:N
Site (Сайты)
  ↓ 1:N
Page (Страницы)
  ↓ 1:N
Block (Блоки контента)

Site → 1:1 → Theme (Темы)

Template (Шаблоны) - независимая
```

### 4. Визуальный редактор

```
components/
├── BlockEditor.tsx       # Основной редактор
├── SortableBlock.tsx     # Drag-and-drop блок
└── BlockRenderer.tsx     # Рендеринг блоков
```

**Технологии:**
- @dnd-kit для drag-and-drop
- React состояния для управления
- Real-time сохранение

## 🔄 Поток данных

### Создание сайта

```
1. User → Dashboard → "Создать сайт"
2. POST /api/sites { name, slug, description }
3. Backend создаёт:
   - Site запись
   - Главную Page
   - Стандартную Theme
4. Возврат данных в Dashboard
5. Редирект в Editor
```

### Редактирование страницы

```
1. User → Editor → Добавить блок
2. POST /api/pages/:id/blocks { type, content }
3. Backend создаёт Block
4. Frontend обновляет состояние
5. Auto-save каждые N секунд
```

### Публикация

```
1. User → "Опубликовать"
2. PUT /api/pages/:id { published: true }
3. Backend обновляет статус
4. Frontend показывает статус
```

## 🔐 Аутентификация

### NextAuth.js Flow

```
1. User → Форма входа
2. POST /api/auth/signin
3. CredentialsProvider проверяет данные
4. Создание JWT токена
5. Установка cookie сессии
6. Редирект в Dashboard
```

### Защита API Routes

```typescript
// В каждом защищённом route
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## 📦 Структура блоков

### Схема блока

```typescript
{
  id: string,
  type: 'heading' | 'text' | 'image' | 'button',
  content: {
    // Зависит от типа
  },
  order: number,
  pageId: string
}
```

### Типы блоков

**Heading:**
```json
{
  "text": "Заголовок",
  "level": "h1" | "h2" | "h3"
}
```

**Text:**
```json
{
  "text": "Текстовое содержимое"
}
```

**Image:**
```json
{
  "url": "https://...",
  "alt": "Описание"
}
```

**Button:**
```json
{
  "text": "Текст кнопки",
  "link": "https://...",
  "style": "primary" | "secondary" | "outline"
}
```

## 🎨 Система тем

### Модель Theme

```typescript
{
  primaryColor: string,      // #3B82F6
  secondaryColor: string,    // #10B981
  backgroundColor: string,   // #FFFFFF
  textColor: string,         // #1F2937
  fontFamily: string         // Inter
}
```

### Применение

Темы применяются через CSS переменные:

```css
:root {
  --color-primary: theme.primaryColor;
  --color-secondary: theme.secondaryColor;
  --color-bg: theme.backgroundColor;
  --color-text: theme.textColor;
  --font-family: theme.fontFamily;
}
```

## 🚀 Производительность

### Оптимизации

1. **Server Components**
   - Минимизация JavaScript на клиенте
   - Серверный рендеринг

2. **API Caching**
   - Кэширование запросов
   - Revalidation стратегии

3. **Database**
   - Индексы на часто запрашиваемых полях
   - Connection pooling через Prisma

4. **Images**
   - Next.js Image Optimization
   - Lazy loading

## 🔄 State Management

### Client State (React)

```typescript
// Локальное состояние компонента
const [blocks, setBlocks] = useState<Block[]>([]);

// Для сложной логики - можно использовать Zustand
import { create } from 'zustand';

const useEditorStore = create((set) => ({
  blocks: [],
  addBlock: (block) => set((state) => ({ 
    blocks: [...state.blocks, block] 
  }))
}));
```

### Server State (Database)

```typescript
// Prisma ORM
const site = await prisma.site.findUnique({
  where: { id },
  include: {
    pages: {
      include: {
        blocks: true
      }
    }
  }
});
```

## 🧪 Тестирование (Будущее развитие)

### Unit Tests
- Компоненты React
- Утилитные функции
- Валидация данных

### Integration Tests
- API endpoints
- Database операции

### E2E Tests
- Полный user flow
- Создание и редактирование сайта

## 📈 Масштабирование

### Горизонтальное масштабирование

- Vercel автоматически масштабирует
- Serverless функции
- Edge Network

### Вертикальное масштабирование

- Увеличение мощности БД
- Connection pooling
- Read replicas для чтения

### Микросервисная архитектура (Будущее)

Возможное разделение:
- Auth Service
- Site Management Service
- Editor Service
- Template Service
- Media Storage Service

## 🔒 Безопасность

### Уровни защиты

1. **Authentication**
   - NextAuth.js
   - JWT токены
   - Secure cookies

2. **Authorization**
   - Role-based access
   - Ownership verification

3. **Validation**
   - Input sanitization
   - SQL injection protection (Prisma)
   - XSS protection

4. **Rate Limiting**
   - API request limits
   - DDoS protection

## 📊 Мониторинг

### Метрики

- Response time
- Error rate
- Active users
- Database queries

### Логирование

```typescript
console.error('Error:', error);
// В production: отправка в Sentry/LogRocket
```

## 🎯 Будущие улучшения

1. **Кэширование**
   - Redis для сессий
   - CDN для статики

2. **Background Jobs**
   - Queue система (Bull/BullMQ)
   - Async операции

3. **Real-time**
   - WebSockets для collaboration
   - Live preview

4. **Analytics**
   - User behavior tracking
   - Performance monitoring

---

Документация обновляется по мере развития проекта.
