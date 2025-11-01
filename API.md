# 📡 API Документация SiteBuilder

REST API для управления сайтами, страницами, постами и медиафайлами.

## 👥 Система ролей

В системе существует три роли пользователей:

### ADMIN (Администратор)
- Полный доступ ко всем функциям
- Может управлять всеми сайтами, страницами, постами и медиафайлами
- Может видеть и редактировать контент всех пользователей

### EDITOR (Редактор)
- Может создавать и редактировать свои сайты, страницы и посты
- Может загружать медиафайлы
- Может видеть только свой контент
- Может публиковать свои посты

### VIEWER (Наблюдатель)
- Может только просматривать опубликованный контент
- Не может создавать или редактировать контент
- Не может загружать медиафайлы

## 🔐 Аутентификация

Все защищённые эндпоинты требуют авторизации через NextAuth.js сессию.

### Регистрация

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "securepassword"
}
```

**Ответ (201):**
```json
{
  "message": "Пользователь успешно создан",
  "userId": "clx1234567890"
}
```

### Вход

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "ivan@example.com",
  "password": "securepassword"
}
```

### Выход

```http
POST /api/auth/signout
```

---

## 🌐 Сайты

### Получить список сайтов

```http
GET /api/sites
Authorization: Bearer <token>
```

**Ответ (200):**
```json
[
  {
    "id": "clx1234567890",
    "name": "Мой сайт",
    "slug": "my-site",
    "description": "Описание сайта",
    "published": false,
    "pages": [...],
    "theme": {...},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Создать сайт

```http
POST /api/sites
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Новый сайт",
  "slug": "new-site",
  "description": "Описание нового сайта"
}
```

**Ответ (201):**
```json
{
  "id": "clx1234567890",
  "name": "Новый сайт",
  "slug": "new-site",
  "description": "Описание нового сайта",
  "published": false,
  "userId": "clx0987654321",
  "pages": [
    {
      "id": "clx1111111111",
      "title": "Главная",
      "slug": "index",
      "isHome": true
    }
  ],
  "theme": {
    "id": "clx2222222222",
    "name": "Стандартная тема",
    "primaryColor": "#3B82F6",
    "secondaryColor": "#10B981"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Получить сайт

```http
GET /api/sites/:siteId
Authorization: Bearer <token>
```

### Обновить сайт

```http
PUT /api/sites/:siteId
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Обновлённое название",
  "slug": "updated-slug",
  "description": "Новое описание",
  "published": true
}
```

### Удалить сайт

```http
DELETE /api/sites/:siteId
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "message": "Сайт успешно удален"
}
```

---

## 📄 Страницы

### Создать страницу

```http
POST /api/sites/:siteId/pages
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "О нас",
  "slug": "about"
}
```

**Ответ (201):**
```json
{
  "id": "clx3333333333",
  "title": "О нас",
  "slug": "about",
  "siteId": "clx1234567890",
  "published": false,
  "isHome": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Получить страницу

```http
GET /api/pages/:pageId
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "id": "clx3333333333",
  "title": "О нас",
  "slug": "about",
  "published": false,
  "blocks": [
    {
      "id": "clx4444444444",
      "type": "heading",
      "content": {
        "text": "О нашей компании",
        "level": "h1"
      },
      "order": 0
    }
  ],
  "site": {
    "id": "clx1234567890",
    "name": "Мой сайт",
    "theme": {...}
  }
}
```

### Обновить страницу

```http
PUT /api/pages/:pageId
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "О компании",
  "slug": "about-company",
  "published": true,
  "metaTitle": "О компании - Мой сайт",
  "metaDescription": "Информация о нашей компании"
}
```

### Удалить страницу

```http
DELETE /api/pages/:pageId
Authorization: Bearer <token>
```

**Примечание:** Нельзя удалить главную страницу (isHome: true)

---

## 🧩 Блоки

### Создать блок

```http
POST /api/pages/:pageId/blocks
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "heading",
  "content": {
    "text": "Заголовок",
    "level": "h2"
  },
  "order": 0
}
```

**Типы блоков:**

#### Заголовок (heading)
```json
{
  "type": "heading",
  "content": {
    "text": "Текст заголовка",
    "level": "h1" | "h2" | "h3"
  }
}
```

#### Текст (text)
```json
{
  "type": "text",
  "content": {
    "text": "Многострочный текст"
  }
}
```

#### Изображение (image)
```json
{
  "type": "image",
  "content": {
    "url": "https://example.com/image.jpg",
    "alt": "Описание изображения"
  }
}
```

#### Кнопка (button)
```json
{
  "type": "button",
  "content": {
    "text": "Нажми меня",
    "link": "https://example.com",
    "style": "primary" | "secondary" | "outline"
  }
}
```

### Обновить блоки (массовое обновление)

```http
PUT /api/pages/:pageId/blocks
Content-Type: application/json
Authorization: Bearer <token>

{
  "blocks": [
    {
      "id": "clx4444444444",
      "type": "heading",
      "content": {
        "text": "Обновлённый заголовок",
        "level": "h1"
      },
      "order": 0
    },
    {
      "id": "clx5555555555",
      "type": "text",
      "content": {
        "text": "Обновлённый текст"
      },
      "order": 1
    }
  ]
}
```

### Удалить блок

```http
DELETE /api/blocks/:blockId
Authorization: Bearer <token>
```

---

## 📰 Посты

### Получить список постов

```http
GET /api/posts?siteId=<siteId>&published=<true|false>
Authorization: Bearer <token>
```

**Параметры запроса:**
- `siteId` (optional) - Фильтр по ID сайта
- `published` (optional) - Фильтр по статусу публикации

**Ответ (200):**
```json
[
  {
    "id": "clx7777777777",
    "title": "Введение в Next.js",
    "slug": "intro-to-nextjs",
    "content": "Полный текст поста...",
    "excerpt": "Краткое описание",
    "coverImage": "https://example.com/cover.jpg",
    "published": true,
    "publishedAt": "2024-01-15T00:00:00.000Z",
    "metaTitle": "Введение в Next.js",
    "metaDescription": "Подробное введение в Next.js",
    "tags": ["nextjs", "react", "javascript"],
    "author": {
      "id": "clx0987654321",
      "name": "Администратор",
      "email": "admin@example.com"
    },
    "siteId": "clx1234567890",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]
```

**Права доступа:**
- **VIEWER**: Может видеть только опубликованные посты
- **EDITOR**: Может видеть свои посты (опубликованные и неопубликованные)
- **ADMIN**: Может видеть все посты

### Создать пост

```http
POST /api/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Новый пост",
  "slug": "new-post",
  "content": "Содержимое поста...",
  "excerpt": "Краткое описание поста",
  "coverImage": "https://example.com/cover.jpg",
  "published": true,
  "publishedAt": "2024-01-20T00:00:00.000Z",
  "metaTitle": "Новый пост - Мой блог",
  "metaDescription": "SEO описание поста",
  "tags": ["javascript", "tutorial"],
  "siteId": "clx1234567890"
}
```

**Права доступа:** ADMIN, EDITOR

**Ответ (201):**
```json
{
  "id": "clx7777777777",
  "title": "Новый пост",
  "slug": "new-post",
  "content": "Содержимое поста...",
  "excerpt": "Краткое описание поста",
  "coverImage": "https://example.com/cover.jpg",
  "published": true,
  "publishedAt": "2024-01-20T00:00:00.000Z",
  "metaTitle": "Новый пост - Мой блог",
  "metaDescription": "SEO описание поста",
  "tags": ["javascript", "tutorial"],
  "authorId": "clx0987654321",
  "author": {
    "id": "clx0987654321",
    "name": "Редактор",
    "email": "editor@example.com"
  },
  "siteId": "clx1234567890",
  "createdAt": "2024-01-20T00:00:00.000Z",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

### Получить пост

```http
GET /api/posts/:postId
Authorization: Bearer <token>
```

**Права доступа:**
- **VIEWER**: Только опубликованные посты
- **EDITOR**: Свои посты (опубликованные и неопубликованные)
- **ADMIN**: Все посты

### Обновить пост

```http
PUT /api/posts/:postId
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Обновлённое название",
  "content": "Обновлённое содержимое...",
  "published": true
}
```

**Права доступа:** ADMIN или автор поста

### Удалить пост

```http
DELETE /api/posts/:postId
Authorization: Bearer <token>
```

**Права доступа:** ADMIN или автор поста

---

## 🖼️ Медиафайлы

### Получить список медиафайлов

```http
GET /api/media?type=<IMAGE|VIDEO|DOCUMENT>
Authorization: Bearer <token>
```

**Параметры запроса:**
- `type` (optional) - Фильтр по типу медиафайла (IMAGE, VIDEO, DOCUMENT)

**Ответ (200):**
```json
[
  {
    "id": "clx8888888888",
    "name": "Логотип компании",
    "fileName": "logo.png",
    "url": "https://example.com/uploads/logo.png",
    "type": "IMAGE",
    "mimeType": "image/png",
    "size": 15000,
    "width": 200,
    "height": 200,
    "alt": "Логотип компании",
    "caption": "Официальный логотип",
    "user": {
      "id": "clx0987654321",
      "name": "Администратор",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]
```

**Права доступа:**
- **ADMIN**: Может видеть все медиафайлы
- **EDITOR/VIEWER**: Может видеть только свои медиафайлы

### Загрузить медиафайл

```http
POST /api/media
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Новое изображение",
  "fileName": "image.jpg",
  "url": "https://example.com/uploads/image.jpg",
  "type": "IMAGE",
  "mimeType": "image/jpeg",
  "size": 250000,
  "width": 1920,
  "height": 1080,
  "alt": "Описание изображения",
  "caption": "Подпись к изображению"
}
```

**Типы медиафайлов:**
- `IMAGE` - Изображения (jpg, png, gif, webp)
- `VIDEO` - Видео (mp4, webm, avi)
- `DOCUMENT` - Документы (pdf, doc, docx)

**Права доступа:** ADMIN, EDITOR

**Ответ (201):**
```json
{
  "id": "clx8888888888",
  "name": "Новое изображение",
  "fileName": "image.jpg",
  "url": "https://example.com/uploads/image.jpg",
  "type": "IMAGE",
  "mimeType": "image/jpeg",
  "size": 250000,
  "width": 1920,
  "height": 1080,
  "alt": "Описание изображения",
  "caption": "Подпись к изображению",
  "userId": "clx0987654321",
  "user": {
    "id": "clx0987654321",
    "name": "Редактор",
    "email": "editor@example.com"
  },
  "createdAt": "2024-01-20T00:00:00.000Z",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

### Получить медиафайл

```http
GET /api/media/:mediaId
Authorization: Bearer <token>
```

**Права доступа:** ADMIN или владелец медиафайла

### Обновить медиафайл

```http
PUT /api/media/:mediaId
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Обновлённое название",
  "alt": "Новое описание",
  "caption": "Новая подпись"
}
```

**Права доступа:** ADMIN или владелец медиафайла

### Удалить медиафайл

```http
DELETE /api/media/:mediaId
Authorization: Bearer <token>
```

**Права доступа:** ADMIN или владелец медиафайла

---

## 📑 Шаблоны

### Получить список шаблонов

```http
GET /api/templates
```

**Ответ (200):**
```json
[
  {
    "id": "clx6666666666",
    "name": "Лендинг для стартапа",
    "description": "Современный одностраничный сайт",
    "preview": "https://example.com/preview.jpg",
    "category": "business",
    "blocks": [...]
  }
]
```

---

## 🎨 Темы

### Обновить тему сайта

```http
PUT /api/sites/:siteId/theme
Content-Type: application/json
Authorization: Bearer <token>

{
  "primaryColor": "#3B82F6",
  "secondaryColor": "#10B981",
  "backgroundColor": "#FFFFFF",
  "textColor": "#1F2937",
  "fontFamily": "Inter"
}
```

---

## ❌ Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Некорректные данные |
| 401 | Не авторизован |
| 403 | Недостаточно прав |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

**Формат ошибки:**
```json
{
  "error": "Описание ошибки"
}
```

---

## 🔧 Примеры использования

### cURL

```bash
# Создать сайт
curl -X POST https://api.example.com/api/sites \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "Мой сайт",
    "slug": "my-site"
  }'
```

### JavaScript (fetch)

```javascript
// Получить список сайтов
const response = await fetch('/api/sites', {
  credentials: 'include'
});
const sites = await response.json();

// Создать блок
const response = await fetch(`/api/pages/${pageId}/blocks`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    type: 'heading',
    content: { text: 'Заголовок', level: 'h2' },
    order: 0
  })
});
```

### Python

```python
import requests

# Создать страницу
response = requests.post(
    f'https://api.example.com/api/sites/{site_id}/pages',
    json={
        'title': 'Контакты',
        'slug': 'contacts'
    },
    cookies={'next-auth.session-token': 'token'}
)
page = response.json()
```

---

## 📊 Rate Limiting

В production рекомендуется настроить rate limiting:
- 100 запросов в минуту для авторизованных пользователей
- 20 запросов в минуту для неавторизованных

---

## 🔗 Полезные ссылки

- [Postman Collection](#) - Готовая коллекция запросов
- [OpenAPI Spec](#) - Спецификация OpenAPI 3.0
- [SDK для JavaScript](#) - Официальный SDK

---

Документация обновляется по мере развития API.
