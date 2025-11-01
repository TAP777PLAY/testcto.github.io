# Руководство по миграции на версию 0.2.0 (Phase 8)

## Обзор изменений

Версия 0.2.0 добавляет поддержку SaaS-функциональности, включая систему подписок, маркетплейс и AI-инструменты. Эта миграция требует обновления базы данных и добавления новых переменных окружения.

## Предварительные требования

- PostgreSQL база данных
- Node.js 18+ и npm
- Доступ к базе данных с правами на создание таблиц
- (Опционально) Аккаунт Stripe для платежей
- (Опционально) API ключ OpenAI для AI функций

## Шаг 1: Резервное копирование

⚠️ **ВАЖНО**: Создайте резервную копию базы данных перед началом миграции!

```bash
pg_dump -U postgres -d sitebuilder > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Шаг 2: Обновление кода

```bash
# Получите последний код
git pull origin main

# Установите новые зависимости
npm install
```

Новые зависимости:
- `stripe@^17.5.0` - платежная система
- `openai@^4.77.0` - AI генерация

## Шаг 3: Настройка переменных окружения

Добавьте в файл `.env` следующие переменные:

```env
# Stripe (обязательно для платежей)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# YooKassa (опционально, для российского рынка)
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=

# OpenAI (обязательно для AI функций)
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=

# Флаги функций
NEXT_PUBLIC_ENABLE_MARKETPLACE=true
NEXT_PUBLIC_ENABLE_AI_TOOLS=true
```

### Получение ключей Stripe

1. Зарегистрируйтесь на [stripe.com](https://stripe.com)
2. В Dashboard перейдите в раздел "Developers" → "API keys"
3. Скопируйте "Secret key" и "Publishable key"
4. Для webhook:
   - Перейдите в "Developers" → "Webhooks"
   - Создайте endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Выберите события (см. ниже)
   - Скопируйте "Signing secret"

Требуемые webhook события:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Получение ключа OpenAI

1. Зарегистрируйтесь на [platform.openai.com](https://platform.openai.com)
2. Перейдите в "API keys"
3. Создайте новый API key
4. (Опционально) Укажите Organization ID

## Шаг 4: Миграция базы данных

### Создание миграции

```bash
npx prisma generate
npx prisma migrate dev --name phase8-saas
```

Эта команда создаст новые таблицы:
- `Plan` - тарифные планы
- `Subscription` - подписки пользователей
- `Payment` - история платежей
- `MarketplacePlugin` - плагины
- `MarketplaceTheme` - темы
- `Installation` - установленные расширения
- `AIGenerationLog` - лог AI генераций

И обновит существующие:
- `User` - добавит поля для Stripe и подписок
- `Site` - добавит поля для доменов и мультисайта

### В production окружении

Для production используйте:

```bash
npx prisma migrate deploy
```

## Шаг 5: Заполнение начальными данными

Запустите seed скрипт для создания тарифных планов и примеров:

```bash
npm run db:seed
```

Это создаст:
- 3 тарифных плана (Free, Pro, Business)
- 2 примера плагинов (бесплатных)
- 2 примера тем (1 бесплатная, 1 платная)
- Существующие шаблоны страниц

## Шаг 6: Миграция существующих пользователей

Все существующие пользователи автоматически получат Free план. Это происходит при первом входе, но вы можете запустить миграцию вручную:

```typescript
// scripts/migrate-users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const freePlan = await prisma.plan.findUnique({
    where: { name: 'Free' },
  });

  if (!freePlan) {
    throw new Error('Free plan not found. Run db:seed first.');
  }

  const users = await prisma.user.findMany({
    where: { subscription: null },
  });

  console.log(`Migrating ${users.length} users to Free plan...`);

  for (const user of users) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✓ Migrated user: ${user.email}`);
  }

  console.log('Migration complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Запуск:
```bash
npx tsx scripts/migrate-users.ts
```

## Шаг 7: Настройка Stripe планов

После создания тарифов в базе данных, создайте соответствующие продукты в Stripe:

1. В Stripe Dashboard перейдите в "Products"
2. Создайте продукты:
   - **Free** - $0/month (для тестирования)
   - **Pro** - $99/month (или ₽990)
   - **Business** - $299/month (или ₽2990)
3. Скопируйте Price ID для каждого продукта
4. Обновите базу данных:

```sql
UPDATE "Plan" SET "stripePriceId" = 'price_xxx' WHERE name = 'Pro';
UPDATE "Plan" SET "stripePriceId" = 'price_yyy' WHERE name = 'Business';
```

Или через Prisma:

```typescript
await prisma.plan.update({
  where: { name: 'Pro' },
  data: { stripePriceId: 'price_xxx' },
});
```

## Шаг 8: Тестирование

### 1. Проверьте базу данных

```bash
npx prisma studio
```

Убедитесь, что все таблицы созданы и содержат данные.

### 2. Проверьте API endpoints

```bash
# Получить планы
curl http://localhost:3000/api/plans

# Получить плагины
curl http://localhost:3000/api/marketplace/plugins

# Получить темы
curl http://localhost:3000/api/marketplace/themes
```

### 3. Тестовая подписка

1. Зайдите на `/pricing`
2. Выберите план
3. Используйте тестовую карту Stripe: `4242 4242 4242 4242`
4. Проверьте создание подписки

### 4. Тест AI (если настроено)

```bash
# Через API
curl -X POST http://localhost:3000/api/ai/generate-text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Напиши описание продукта"}'
```

### 5. Тест webhook

```bash
# Используйте Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger customer.subscription.created
```

## Шаг 9: Деплой

### Vercel

1. Обновите переменные окружения в Vercel Dashboard
2. Запушьте изменения в Git:

```bash
git add .
git commit -m "feat: Phase 8 - SaaS platform"
git push origin main
```

3. Vercel автоматически задеплоит изменения

### Другие платформы

Убедитесь, что:
- Все переменные окружения настроены
- База данных мигрирована
- Webhook URL правильно настроен в Stripe

## Откат изменений

Если что-то пошло не так:

### 1. Откат базы данных

```bash
# Восстановите из бэкапа
psql -U postgres -d sitebuilder < backup_YYYYMMDD_HHMMSS.sql
```

### 2. Откат кода

```bash
git revert HEAD
git push origin main
```

### 3. Удаление миграции

```bash
npx prisma migrate resolve --rolled-back phase8-saas
```

## Проверочный список

- [ ] Создан бэкап базы данных
- [ ] Установлены новые зависимости
- [ ] Настроены переменные окружения
- [ ] Выполнена миграция БД
- [ ] Запущен seed скрипт
- [ ] Мигрированы существующие пользователи
- [ ] Настроены Stripe продукты
- [ ] Проведено тестирование
- [ ] Обновлена документация
- [ ] Выполнен деплой

## Известные проблемы

### Stripe не работает в development

Используйте Stripe CLI для тестирования webhook:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### OpenAI rate limits

При интенсивном использовании вы можете столкнуться с лимитами. Решения:
- Увеличьте лимиты в OpenAI Dashboard
- Используйте кэширование результатов
- Ограничьте количество AI кредитов

### Миграция долго выполняется

Для больших баз данных миграция может занять время. Используйте:
- Индексы для оптимизации
- Батчинг для массовых операций
- Мониторинг прогресса

## Поддержка

При возникновении проблем:
- Проверьте логи приложения
- Изучите документацию в PHASE8_SAAS.md
- Создайте issue в репозитории
- Свяжитесь с поддержкой

## Следующие шаги

После успешной миграции:
1. Настройте мониторинг платежей
2. Создайте больше плагинов и тем
3. Оптимизируйте AI промпты
4. Добавьте аналитику
5. Настройте email уведомления

---

**Версия документа:** 1.0.0  
**Дата последнего обновления:** 2024  
**Применимо к версии:** 0.2.0
