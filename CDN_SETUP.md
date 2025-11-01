# 🌐 CDN Setup Guide

## Обзор

CDN (Content Delivery Network) значительно ускоряет загрузку статических ресурсов, кэшируя их на серверах по всему миру.

## Поддерживаемые CDN

### 1. Cloudflare (Рекомендуется)

**Преимущества:**
- ✅ Бесплатный план
- ✅ Автоматический SSL
- ✅ DDoS защита
- ✅ Простая настройка

**Настройка:**

1. Зарегистрируйтесь на [Cloudflare](https://cloudflare.com)
2. Добавьте ваш домен
3. Обновите NS записи у регистратора
4. Настройте Caching Rules:

```
Page Rules → Create Page Rule

Pattern: yourdomain.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
  - Browser Cache TTL: 1 year

Pattern: yourdomain.com/images/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 week
```

5. В `.env.production`:
```bash
CDN_URL="https://yourdomain.com"  # Cloudflare автоматически кэширует
```

### 2. AWS CloudFront

**Настройка:**

1. Создайте S3 bucket для статики:
```bash
aws s3 mb s3://sitebuilder-cdn
```

2. Создайте CloudFront Distribution:
```bash
aws cloudfront create-distribution \
  --origin-domain-name yourdomain.com \
  --default-cache-behavior "ViewerProtocolPolicy=redirect-to-https,MinTTL=0,DefaultTTL=86400"
```

3. Настройте Cache Behaviors:
   - `/_next/static/*` → Cache: 1 year
   - `/images/*` → Cache: 7 days

4. В `.env.production`:
```bash
CDN_URL="https://d123456789.cloudfront.net"
```

### 3. Vercel Edge Network

Если деплоите на Vercel, CDN включен автоматически:

```bash
# vercel.json
{
  "github": {
    "silent": true
  },
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. Custom CDN Setup

Для использования собственного CDN:

1. Настройте nginx как CDN origin:
```nginx
server {
    listen 80;
    server_name cdn.yourdomain.com;

    location /_next/static/ {
        proxy_pass http://app:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    location /images/ {
        proxy_pass http://app:3000;
        add_header Cache-Control "public, max-age=604800";
        add_header Access-Control-Allow-Origin "*";
    }
}
```

2. В `.env.production`:
```bash
CDN_URL="https://cdn.yourdomain.com"
```

## Настройка Next.js

В `next.config.ts` уже настроено:

```typescript
const nextConfig: NextConfig = {
  // CDN support
  ...(process.env.CDN_URL && {
    assetPrefix: process.env.CDN_URL,
  }),

  images: {
    remotePatterns: [
      // Добавьте ваши CDN домены
      {
        protocol: 'https',
        hostname: 'cdn.yourdomain.com',
      },
    ],
  },
};
```

## Загрузка изображений

### Использование Next.js Image

```tsx
import Image from 'next/image';

export function MyComponent() {
  return (
    <Image
      src="/images/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      priority // для важных изображений
    />
  );
}
```

### Внешние изображения

Для внешних источников (Unsplash, Cloudinary):

```tsx
<Image
  src="https://images.unsplash.com/photo-123"
  alt="Photo"
  width={800}
  height={600}
  loader={({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  }}
/>
```

## Image Optimization

### Cloudinary

```bash
# Установка
npm install cloudinary

# .env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'sitebuilder' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    ).end(buffer);
  });
}
```

### AWS S3 + CloudFront

```bash
# Установка
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# .env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=sitebuilder-images
```

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, key: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
}
```

## Кэширование

### Cache Headers

В `next.config.ts` настроены оптимальные заголовки:

```typescript
// Static assets (JS, CSS)
'Cache-Control': 'public, max-age=31536000, immutable'

// Images
'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'

// API responses
'Cache-Control': 'no-store, max-age=0'
```

### Purge Cache

**Cloudflare:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**CloudFront:**
```bash
aws cloudfront create-invalidation \
  --distribution-id E123456789 \
  --paths "/*"
```

## Performance Testing

### Lighthouse

```bash
npm install -g lighthouse

lighthouse https://yourdomain.com --view
```

### WebPageTest

Используйте [WebPageTest](https://www.webpagetest.org/) для детального анализа.

### Метрики

Целевые показатели:
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **FID** (First Input Delay): < 100ms

## Troubleshooting

### Изображения не загружаются с CDN

```bash
# Проверьте CORS headers
curl -I https://cdn.yourdomain.com/images/test.jpg

# Должен быть заголовок:
Access-Control-Allow-Origin: *
```

### Старый контент кэшируется

```bash
# Добавьте версию к URL
/images/photo.jpg?v=2

# Или используйте хэш в имени файла
/images/photo-abc123.jpg
```

### Медленная загрузка

1. Проверьте формат изображений (используйте WebP/AVIF)
2. Оптимизируйте размер изображений
3. Используйте `priority` для важных изображений
4. Добавьте lazy loading

## Best Practices

1. **Всегда используйте Next.js Image** для автоматической оптимизации
2. **Настройте CDN** для статических ресурсов
3. **Используйте WebP/AVIF** форматы (Next.js делает автоматически)
4. **Lazy load** изображения ниже fold
5. **Responsive images** с правильными размерами
6. **Минифицируйте** CSS и JS (Next.js делает автоматически)
7. **Gzip/Brotli** компрессия (nginx настроен)
8. **HTTP/2** или HTTP/3 для параллельной загрузки

---

**Рекомендация:** Используйте Cloudflare для начала (бесплатно и просто), затем переходите на AWS CloudFront для энтерпрайза.
