# 🚀 Quick Start - Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

## 1️⃣ Development (Local)

```bash
# Clone and setup
git clone <repository>
cd sitebuilder

# Copy environment
cp .env.development .env

# Install dependencies
npm install

# Start development server
npm run dev

# Or with Docker
npm run docker:dev
```

**Access:** http://localhost:3000

## 2️⃣ Staging

```bash
# Setup environment
cp .env.staging .env
nano .env  # Edit with your values

# Generate SSL certificate
sudo ./scripts/setup-ssl.sh staging.yourdomain.com your@email.com

# Start services
npm run docker:staging

# Run migrations
docker-compose -f docker-compose.staging.yml exec app npm run db:migrate
```

**Access:** https://staging.yourdomain.com

## 3️⃣ Production

```bash
# Setup environment (USE STRONG PASSWORDS!)
cp .env.production .env
nano .env  # Edit with your production values

# Generate secrets
openssl rand -base64 32  # for NEXTAUTH_SECRET

# Generate SSL certificate
sudo ./scripts/setup-ssl.sh yourdomain.com your@email.com

# Start services
npm run docker:prod

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec app npm run db:seed

# Health check
curl https://yourdomain.com/health
```

**Access:**
- App: https://yourdomain.com
- Grafana: https://yourdomain.com:3001
- Prometheus: http://localhost:9090 (internal only)

## 4️⃣ CI/CD Setup (GitHub Actions)

```bash
# 1. Create GitHub Secrets:
#    - DOCKER_REGISTRY_TOKEN
#    - STAGING_HOST, STAGING_SSH_KEY
#    - PRODUCTION_HOST, PRODUCTION_SSH_KEY
#    - DATABASE_URL_STAGING
#    - DATABASE_URL_PRODUCTION

# 2. Create GitHub Environments:
#    - staging
#    - production (with required reviewers)

# 3. Push to trigger:
git push origin develop    # → Deploy to Staging
git push origin main        # → Deploy to Production
```

## 5️⃣ Monitoring

**Grafana Dashboard:**
- URL: http://your-server:3001
- Login: admin / (GRAFANA_PASSWORD from .env)
- Datasource: Prometheus (auto-configured)

**Prometheus:**
- URL: http://your-server:9090
- Metrics: http://your-server:3000/api/metrics

**Health Check:**
```bash
curl https://yourdomain.com/health
```

## 6️⃣ Maintenance

**Backup Database:**
```bash
./scripts/backup.sh production
```

**View Logs:**
```bash
npm run docker:logs

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
```

**Update Application:**
```bash
# Pull latest
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

**Scale Application:**
```bash
# Docker Swarm
docker service scale sitebuilder_app=4

# Kubernetes
kubectl scale deployment sitebuilder-app --replicas=4
```

## 7️⃣ Troubleshooting

**Container not starting:**
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs app
```

**Database connection issues:**
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres
```

**High memory usage:**
```bash
docker stats
```

**SSL certificate renewal:**
```bash
sudo certbot renew
sudo ./scripts/setup-ssl.sh yourdomain.com your@email.com
```

## 📦 Key Files

- `.env.*` - Environment configurations
- `docker-compose.*.yml` - Docker orchestration
- `nginx/*.conf` - Nginx configurations
- `monitoring/` - Prometheus & Grafana configs
- `scripts/` - Utility scripts
- `k8s/` - Kubernetes manifests

## 🔐 Security Checklist

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database passwords are strong
- [ ] SSL certificates are installed
- [ ] Firewall is configured (ports 22, 80, 443)
- [ ] Rate limiting is enabled
- [ ] Backups are automated
- [ ] Environment variables are not in Git
- [ ] HTTPS is enforced
- [ ] Security headers are enabled

## 📚 Documentation

- **Full Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **CDN Setup:** [CDN_SETUP.md](./CDN_SETUP.md)
- **Security:** [SECURITY.md](./SECURITY.md)
- **Phase 6 Summary:** [PHASE_6_SUMMARY.md](./PHASE_6_SUMMARY.md)
- **Kubernetes:** [k8s/README.md](./k8s/README.md)

## 🆘 Support

- Health Check: `/health`
- Metrics: `/api/metrics`
- Logs: `npm run docker:logs`

---

**Ready to deploy!** 🚀
