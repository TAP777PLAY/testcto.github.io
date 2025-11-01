# Руководство по деплою на Vercel

Подробная инструкция по развертыванию SiteBuilder на платформе Vercel.

## 🚀 Быстрый старт

### Вариант 1: Деплой через GitHub

1. **Загрузите код на GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Зайдите на Vercel**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "Add New Project"
   - Выберите ваш GitHub репозиторий

3. **Настройте переменные окружения**
   
   В разделе Environment Variables добавьте:
   
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://ваш-домен.vercel.app
   NEXTAUTH_SECRET=ваш-секретный-ключ
   NEXT_PUBLIC_APP_URL=https://ваш-домен.vercel.app
   ```

4. **Разверните проект**
   - Нажмите "Deploy"
   - Дождитесь завершения сборки

### Вариант 2: Деплой через Vercel CLI

1. **Установите Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Авторизуйтесь**
   ```bash
   vercel login
   ```

3. **Разверните проект**
   ```bash
   vercel
   ```

4. **Добавьте переменные окружения**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXT_PUBLIC_APP_URL production
   ```

5. **Деплой в production**
   ```bash
   vercel --prod
   ```

## 🗄️ Настройка базы данных

### Использование Vercel Postgres

Vercel предоставляет встроенное решение для PostgreSQL.

1. **Создайте базу данных**
   ```bash
   vercel postgres create
   ```

2. **Подключите к проекту**
   ```bash
   vercel postgres connect
   ```

3. **Получите строку подключения**
   
   Vercel автоматически добавит переменные окружения:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

4. **Используйте в .env**
   ```env
   DATABASE_URL=${POSTGRES_PRISMA_URL}
   ```

### Альтернативные варианты

#### Supabase
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

#### Railway
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@containers-us-west-[ID].railway.app:[PORT]/railway
```

#### Neon
```env
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]
```

## 🔐 Генерация NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Или онлайн: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

## 📊 Миграции базы данных

### При первом деплое

После создания БД выполните миграции:

```bash
# Локально с production БД
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Или через Vercel CLI
vercel env pull
npx prisma migrate deploy
```

### При обновлении схемы

1. Обновите `schema.prisma`
2. Создайте миграцию локально:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Загрузите на GitHub
4. Vercel автоматически применит миграции при деплое

## ⚙️ Настройка проекта в Vercel

### Build Settings

Vercel автоматически определит Next.js, но вы можете настроить:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### Environment Variables по окружениям

**Development:**
```env
DATABASE_URL=postgresql://localhost:5432/sitebuilder_dev
NEXTAUTH_URL=http://localhost:3000
```

**Preview (ветки):**
```env
DATABASE_URL=postgresql://...preview-db...
NEXTAUTH_URL=https://preview-branch.vercel.app
```

**Production:**
```env
DATABASE_URL=postgresql://...production-db...
NEXTAUTH_URL=https://yourdomain.com
```

## 🌐 Настройка домена

1. **Добавьте домен в Vercel**
   - Settings → Domains
   - Добавьте ваш домен
   - Следуйте инструкциям по настройке DNS

2. **Обновите NEXTAUTH_URL**
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## 🔧 Post-Deploy скрипты

Создайте `package.json` скрипт для автоматизации:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## 📈 Мониторинг и логи

### Просмотр логов

```bash
vercel logs [deployment-url]
```

### В Vercel Dashboard

1. Перейдите в ваш проект
2. Выберите Deployments
3. Кликните на деплой → View Function Logs

## 🐛 Устранение проблем

### Ошибка: "Cannot find module '@prisma/client'"

**Решение:**
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Ошибка: Database connection failed

**Проверьте:**
1. Правильность DATABASE_URL
2. Белый список IP в настройках БД (для Vercel добавьте `0.0.0.0/0`)
3. SSL параметры в строке подключения

### Ошибка: NextAuth configuration

**Убедитесь:**
1. NEXTAUTH_URL совпадает с URL деплоя
2. NEXTAUTH_SECRET установлен
3. Используется `https://` в production

## 📚 Полезные команды

```bash
# Просмотр информации о проекте
vercel inspect

# Список деплоев
vercel ls

# Откатить к предыдущему деплою
vercel rollback [deployment-url]

# Удалить деплой
vercel rm [deployment-url]

# Просмотр переменных окружения
vercel env ls

# Загрузить .env локально
vercel env pull
```

## 🔄 CI/CD

Vercel автоматически:
- ✅ Деплоит каждый push в main → production
- ✅ Создает preview для каждого PR
- ✅ Запускает build checks
- ✅ Генерирует уникальные URL для preview

## 🎯 Оптимизация

### Edge Functions

Для быстрой работы API используйте Edge Runtime:

```typescript
export const runtime = 'edge';
```

### ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 60; // Обновлять каждую минуту
```

### Image Optimization

Next.js автоматически оптимизирует изображения через Vercel.

## 📱 Vercel Mobile App

Установите [Vercel Mobile App](https://vercel.com/mobile) для:
- Мониторинга деплоев
- Просмотра логов
- Управления проектами

---

## 📞 Поддержка

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [Next.js Documentation](https://nextjs.org/docs)
