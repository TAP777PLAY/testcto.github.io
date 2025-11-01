# 🚀 Руководство по развертыванию SiteBuilder

## Оглавление

1. [Обзор](#обзор)
2. [Предварительные требования](#предварительные-требования)
3. [Окружения](#окружения)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Docker Deployment](#docker-deployment)
6. [Мониторинг](#мониторинг)
7. [Безопасность](#безопасность)
8. [Масштабирование](#масштабирование)

---

## Обзор

SiteBuilder поддерживает три окружения:
- **Development** (dev) - для локальной разработки
- **Staging** (staging) - для тестирования перед продакшеном
- **Production** (prod) - боевое окружение

### Архитектура

```
┌─────────────┐
│   Nginx     │ ← HTTPS, Rate Limiting
└──────┬──────┘
       │
┌──────▼──────────────────┐
│   Next.js App (x2)      │ ← Application Servers
└──────┬──────────────────┘
       │
┌──────▼──────┐  ┌────────┐
│  PostgreSQL │  │ Redis  │ ← Data Layer
└─────────────┘  └────────┘
       │
┌──────▼─────────────────┐
│  Prometheus + Grafana  │ ← Monitoring
└────────────────────────┘
```

---

## Предварительные требования

### Минимальные требования к серверу

**Staging:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 20GB SSD
- OS: Ubuntu 20.04+ / Debian 11+

**Production:**
- CPU: 4 cores
- RAM: 8GB
- Disk: 50GB SSD
- OS: Ubuntu 20.04+ / Debian 11+

### Установленное ПО

```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git (для CI/CD)
sudo apt-get update && sudo apt-get install -y git
```

---

## Окружения

### Development

Локальное окружение для разработки с hot-reload.

```bash
# Скопируйте .env файл
cp .env.development .env

# Запустите с Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Или без Docker
npm install
npm run dev
```

Доступ:
- App: http://localhost:3000
- Database: localhost:5432
- Redis: localhost:6379

### Staging

Тестовое окружение, максимально близкое к production.

```bash
# Настройте переменные окружения
cp .env.staging .env
# Отредактируйте .env с реальными значениями

# Сгенерируйте SSL сертификаты (Let's Encrypt)
sudo certbot certonly --standalone -d staging.yourdomain.com

# Скопируйте сертификаты
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/staging.yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/staging.yourdomain.com/privkey.pem nginx/ssl/key.pem

# Запустите
docker-compose -f docker-compose.staging.yml up -d

# Миграции базы данных
docker-compose -f docker-compose.staging.yml exec app npx prisma migrate deploy
```

Доступ:
- App: https://staging.yourdomain.com
- Health: https://staging.yourdomain.com/health

### Production

Боевое окружение с полным мониторингом.

```bash
# Настройте переменные окружения
cp .env.production .env
# Отредактируйте .env с СИЛЬНЫМИ паролями

# Сгенерируйте безопасные секреты
openssl rand -base64 32  # для NEXTAUTH_SECRET
openssl rand -base64 16  # для паролей

# SSL сертификаты
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Запустите
docker-compose -f docker-compose.prod.yml up -d

# Миграции
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Проверка здоровья
curl https://yourdomain.com/health
```

Доступ:
- App: https://yourdomain.com
- Grafana: https://yourdomain.com:3001
- Prometheus: http://yourdomain.com:9090 (только внутренний доступ)

---

## CI/CD Pipeline

### GitHub Actions

Pipeline автоматически запускается при:
- Push в `main` → Deploy to Production
- Push в `develop` → Deploy to Staging
- Pull Request → CI Tests

#### Настройка GitHub Actions

1. **Создайте GitHub Secrets:**

```
Settings → Secrets and variables → Actions → New repository secret
```

Необходимые секреты:
- `DOCKER_REGISTRY_TOKEN` - токен для Docker Registry
- `STAGING_HOST` - адрес staging сервера
- `STAGING_SSH_KEY` - SSH ключ для staging
- `PRODUCTION_HOST` - адрес production сервера
- `PRODUCTION_SSH_KEY` - SSH ключ для production
- `DATABASE_URL_STAGING` - connection string для staging DB
- `DATABASE_URL_PRODUCTION` - connection string для production DB

2. **Настройте Environments в GitHub:**

```
Settings → Environments → New environment
```

Создайте:
- `staging` - с required reviewers (опционально)
- `production` - с required reviewers (обязательно!)

#### Workflows

**CI Workflow** (`.github/workflows/ci.yml`)
- ✅ Lint
- ✅ Type Check
- ✅ Build
- ✅ Security Audit
- ✅ Docker Build Test

**Deploy Staging** (`.github/workflows/deploy-staging.yml`)
- 🐳 Build & Push Docker Image
- 🚀 Deploy to Staging
- ✅ Health Check

**Deploy Production** (`.github/workflows/deploy-production.yml`)
- 🐳 Build & Push Docker Image
- 🚀 Deploy to Production
- ✅ Health Check
- 📢 Notifications

---

## Docker Deployment

### Build Image

```bash
# Build локально
docker build -t sitebuilder:latest .

# Build для конкретной платформы
docker buildx build --platform linux/amd64 -t sitebuilder:latest .

# Build и push в registry
docker build -t ghcr.io/yourorg/sitebuilder:latest .
docker push ghcr.io/yourorg/sitebuilder:latest
```

### Docker Compose Commands

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f app

# Рестарт конкретного сервиса
docker-compose restart app

# Выполнение команд в контейнере
docker-compose exec app npm run db:seed
docker-compose exec app npx prisma studio

# Обновление образов
docker-compose pull
docker-compose up -d

# Очистка
docker-compose down -v  # с удалением volumes (ОСТОРОЖНО!)
```

### Мониторинг контейнеров

```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Логи с фильтром
docker-compose logs -f --tail=100 app

# Health check
docker inspect --format='{{json .State.Health}}' sitebuilder-app-prod
```

---

## Мониторинг

### Prometheus

**Доступ:** http://your-server:9090

**Основные метрики:**
- `http_requests_total` - общее количество запросов
- `http_errors_total` - количество ошибок
- `process_uptime_seconds` - время работы приложения
- `nodejs_memory_*` - метрики памяти

**Примеры запросов:**

```promql
# Error rate
rate(http_errors_total[5m]) / rate(http_requests_total[5m])

# Memory usage
nodejs_memory_heap_used_bytes / nodejs_memory_heap_total_bytes

# Request rate
rate(http_requests_total[1m])
```

### Grafana

**Доступ:** http://your-server:3001
**Логин:** admin / (пароль из GRAFANA_PASSWORD)

**Настройка дашборда:**

1. Add data source → Prometheus → http://prometheus:9090
2. Import dashboard → ID: 1860 (Node Exporter)
3. Create custom dashboard для метрик приложения

**Рекомендуемые дашборды:**
- Node Exporter Full (ID: 1860)
- Docker and System Monitoring (ID: 893)
- PostgreSQL Database (ID: 9628)
- Redis Dashboard (ID: 763)

### Алерты

Алерты настроены в `monitoring/alerts.yml`:
- High error rate (> 5%)
- High response time (> 2s)
- Database connection failed
- Redis connection failed
- High memory/CPU usage
- Low disk space

### Логирование

```bash
# Просмотр логов приложения
docker-compose logs -f app

# Логи nginx
docker-compose logs -f nginx

# Логи базы данных
docker-compose logs -f postgres

# Экспорт логов
docker-compose logs --no-color > app-logs.txt

# Логи за определенный период
docker-compose logs --since "2024-01-01T00:00:00" app
```

### Sentry Integration

Для продвинутого error tracking:

```bash
# Установите Sentry SDK (опционально)
npm install @sentry/nextjs

# Настройте в .env
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

---

## Безопасность

### SSL/TLS

**Let's Encrypt (рекомендуется):**

```bash
# Установка Certbot
sudo apt-get install certbot

# Получение сертификата
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos

# Авто-обновление (добавьте в crontab)
0 12 * * * certbot renew --quiet --deploy-hook "docker-compose restart nginx"
```

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw status
```

### Rate Limiting

Настроено в nginx:
- API endpoints: 20 req/s
- Auth endpoints: 5 req/s
- General: 100 req/s
- Max connections: 20 per IP

### Secrets Management

**Никогда не коммитьте:**
- `.env` файлы
- SSL сертификаты
- Database пароли
- API ключи

**Используйте:**
- GitHub Secrets для CI/CD
- Environment variables в production
- Vault или AWS Secrets Manager для энтерпрайза

### Backup

```bash
# Backup базы данных
docker-compose exec postgres pg_dump -U postgres sitebuilder_production > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres sitebuilder_production < backup.sql

# Автоматический backup (добавьте в crontab)
0 2 * * * cd /app && docker-compose exec postgres pg_dump -U postgres sitebuilder_production | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

---

## Масштабирование

### Horizontal Scaling

**Docker Swarm:**

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml sitebuilder

# Scale services
docker service scale sitebuilder_app=4
```

**Kubernetes:**

```bash
# Create deployment
kubectl apply -f k8s/

# Scale
kubectl scale deployment sitebuilder-app --replicas=4

# Autoscaling
kubectl autoscale deployment sitebuilder-app --min=2 --max=10 --cpu-percent=70
```

### Database Scaling

**Read Replicas:**

```yaml
# docker-compose.prod.yml
postgres-replica:
  image: postgres:16-alpine
  environment:
    POSTGRES_MASTER_HOST: postgres
```

**Connection Pooling:**

Prisma уже использует connection pooling. Для дополнительного pooling используйте PgBouncer:

```yaml
pgbouncer:
  image: pgbouncer/pgbouncer:latest
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_DBNAME: sitebuilder_production
```

### Redis Scaling

**Redis Cluster:**

```yaml
redis-cluster:
  image: redis:7-alpine
  command: redis-server --cluster-enabled yes
```

### CDN

**Настройка CDN для статики:**

1. **Cloudflare:**
   - Добавьте домен в Cloudflare
   - Включите "Auto Minify"
   - Настройте Cache Rules
   - Установите CDN_URL в .env

2. **AWS CloudFront:**
   - Создайте CloudFront distribution
   - Origin: ваш сервер
   - Cache behaviors: /_next/static/* (1 year)

3. **Next.js Config:**
   ```typescript
   // next.config.ts
   assetPrefix: process.env.CDN_URL
   ```

---

## Troubleshooting

### Проблемы с подключением к БД

```bash
# Проверьте статус
docker-compose ps postgres

# Логи
docker-compose logs postgres

# Подключение вручную
docker-compose exec postgres psql -U postgres -d sitebuilder_production
```

### Проблемы с памятью

```bash
# Проверьте использование
docker stats

# Увеличьте лимит в docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

### Медленные запросы

```bash
# Включите Prisma logging
export DEBUG="prisma:query"

# Проверьте slow queries в PostgreSQL
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

---

## Чек-лист развертывания

**Перед деплоем в Production:**

- [ ] Все переменные окружения настроены
- [ ] SSL сертификаты установлены
- [ ] Database migrations выполнены
- [ ] Backup настроен
- [ ] Мониторинг работает
- [ ] Алерты настроены
- [ ] Firewall настроен
- [ ] Rate limiting включен
- [ ] Health checks проходят
- [ ] Load testing выполнен
- [ ] Rollback план готов
- [ ] Документация обновлена

---

## Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте health: `curl https://yourdomain.com/health`
3. Проверьте метрики в Grafana
4. Создайте issue в GitHub

---

**Последнее обновление:** 2024
**Версия:** 0.1.0
