# 📚 Развертывание документации

Руководство по развертыванию сайта документации SiteBuilder.

## 🚀 Варианты развертывания

### 1. Vercel (Рекомендуется)

#### Через Vercel CLI

```bash
# Установить Vercel CLI
npm install -g vercel

# Перейти в директорию документации
cd docs

# Войти в Vercel
vercel login

# Развернуть
vercel

# Production деплой
vercel --prod
```

#### Через GitHub

1. Подключите репозиторий к Vercel
2. Настройте проект:
   - **Root Directory**: `docs`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. Нажмите Deploy

#### Настройка домена

1. В Vercel перейдите в Settings → Domains
2. Добавьте домен `docs.sitebuilder.ru`
3. Настройте DNS записи у регистратора:
   ```
   CNAME docs cname.vercel-dns.com
   ```

### 2. GitHub Pages

```bash
cd docs

# Настроить информацию о репозитории
# В docusaurus.config.ts:
# organizationName: 'your-org'
# projectName: 'sitebuilder'

# Развернуть
GIT_USER=<your-username> npm run deploy
```

### 3. Netlify

#### Через Netlify CLI

```bash
# Установить Netlify CLI
npm install -g netlify-cli

cd docs

# Войти в Netlify
netlify login

# Собрать проект
npm run build

# Развернуть
netlify deploy

# Production деплой
netlify deploy --prod
```

#### Через веб-интерфейс

1. Создайте новый сайт на [netlify.com](https://netlify.com)
2. Подключите GitHub репозиторий
3. Настройте:
   - **Base directory**: `docs`
   - **Build command**: `npm run build`
   - **Publish directory**: `docs/build`
4. Deploy!

### 4. Docker

#### Создать образ

```bash
cd docs

# Создать Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Создать nginx.conf
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Собрать образ
docker build -t sitebuilder-docs .

# Запустить контейнер
docker run -p 80:80 sitebuilder-docs
```

#### Docker Compose

```yaml
version: '3.8'

services:
  docs:
    build: ./docs
    ports:
      - "80:80"
    restart: unless-stopped
```

### 5. Self-hosted (Node.js)

```bash
cd docs

# Установить зависимости
npm install

# Собрать
npm run build

# Установить serve
npm install -g serve

# Запустить
serve -s build -p 3001

# Или с pm2
npm install -g pm2
pm2 serve build 3001 --name docs
```

## 🔧 Настройка окружения

### Переменные окружения

Создайте `.env` в директории `docs/`:

```bash
# URL документации
SITE_URL=https://docs.sitebuilder.ru

# Google Analytics (опционально)
GA_TRACKING_ID=G-XXXXXXXXXX

# Algolia Search (опционально)
ALGOLIA_APP_ID=your-app-id
ALGOLIA_API_KEY=your-api-key
ALGOLIA_INDEX_NAME=sitebuilder-docs
```

### docusaurus.config.ts

Обновите конфигурацию для production:

```typescript
const config: Config = {
  url: process.env.SITE_URL || 'https://docs.sitebuilder.ru',
  
  // Google Analytics
  gtag: {
    trackingID: process.env.GA_TRACKING_ID,
  },
  
  // Algolia Search
  themeConfig: {
    algolia: {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
    },
  },
};
```

## 🔄 CI/CD

### GitHub Actions

Создайте `.github/workflows/docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - '.github/workflows/docs.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: docs/package-lock.json
      
      - name: Install dependencies
        working-directory: docs
        run: npm ci
      
      - name: Build
        working-directory: docs
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: docs
          vercel-args: '--prod'
```

### GitLab CI

Создайте `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build-docs:
  stage: build
  image: node:20
  only:
    changes:
      - docs/**
  script:
    - cd docs
    - npm ci
    - npm run build
  artifacts:
    paths:
      - docs/build
    expire_in: 1 hour

deploy-docs:
  stage: deploy
  image: alpine:latest
  dependencies:
    - build-docs
  only:
    refs:
      - main
    changes:
      - docs/**
  before_script:
    - apk add --no-cache rsync openssh
  script:
    - rsync -avz --delete docs/build/ user@server:/var/www/docs/
```

## 📊 Мониторинг

### Google Analytics

```typescript
// docusaurus.config.ts
gtag: {
  trackingID: 'G-XXXXXXXXXX',
  anonymizeIP: true,
}
```

### Sentry (для отслеживания ошибок)

```bash
npm install --save @sentry/react @sentry/tracing
```

```typescript
// src/theme/Root.tsx
import React from 'react';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});

export default function Root({children}) {
  return <>{children}</>;
}
```

## 🔒 Безопасность

### HTTPS

Убедитесь, что SSL сертификат настроен:
- Vercel/Netlify настраивают автоматически
- Self-hosted: используйте Let's Encrypt

### Заголовки безопасности

Для Nginx добавьте в конфиг:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:;" always;
```

## 🚨 Troubleshooting

### Проблема: Build fails

```bash
# Очистить кеш
cd docs
rm -rf node_modules package-lock.json .docusaurus
npm install
npm run build
```

### Проблема: 404 при переходе по прямым ссылкам

Убедитесь, что настроены правила для SPA:

**Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
```

### Проблема: Медленная загрузка

1. Включите Gzip сжатие
2. Настройте кеширование статики
3. Используйте CDN (Cloudflare, Fastly)

## 📈 Оптимизация

### Кеширование

**Nginx:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Сжатие

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### CDN

1. Cloudflare:
   - Добавьте домен в Cloudflare
   - Включите Auto Minify
   - Настройте Cache Level

2. Vercel (встроенный CDN):
   - Автоматически включен
   - Edge Network по всему миру

## 📞 Поддержка

Проблемы с развертыванием?
- 📖 [Docusaurus Docs](https://docusaurus.io/docs/deployment)
- 💬 [Telegram](https://t.me/sitebuilder_community)
- 🐛 [GitHub Issues](https://github.com/sitebuilder/sitebuilder/issues)

---

**Happy documenting!** 📚
