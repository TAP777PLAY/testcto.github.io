#!/bin/bash

# Setup Verification Script for SiteBuilder
# Usage: ./scripts/verify-setup.sh

echo "🔍 SiteBuilder Setup Verification"
echo "=================================="
echo ""

EXIT_CODE=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
  else
    echo -e "${RED}✗${NC} $1 - MISSING"
    EXIT_CODE=1
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
  else
    echo -e "${RED}✗${NC} $1/ - MISSING"
    EXIT_CODE=1
  fi
}

check_executable() {
  if [ -x "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 - executable"
  else
    echo -e "${YELLOW}⚠${NC} $1 - not executable (run: chmod +x $1)"
  fi
}

echo "📁 Core Files"
echo "-----------------------------------"
check_file "package.json"
check_file "tsconfig.json"
check_file "next.config.ts"
check_file "Dockerfile"
check_file ".dockerignore"
check_file ".gitignore"
check_file ".env.example"

echo ""
echo "🐳 Docker Compose Files"
echo "-----------------------------------"
check_file "docker-compose.yml"
check_file "docker-compose.dev.yml"
check_file "docker-compose.staging.yml"
check_file "docker-compose.prod.yml"

echo ""
echo "🔧 Environment Files"
echo "-----------------------------------"
check_file ".env.development"
check_file ".env.staging"
check_file ".env.production"

if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} .env - exists"
else
  echo -e "${YELLOW}⚠${NC} .env - not found (copy from .env.example)"
fi

echo ""
echo "🚀 CI/CD Workflows"
echo "-----------------------------------"
check_file ".github/workflows/ci.yml"
check_file ".github/workflows/deploy-staging.yml"
check_file ".github/workflows/deploy-production.yml"

echo ""
echo "📊 Monitoring Configuration"
echo "-----------------------------------"
check_file "monitoring/prometheus.yml"
check_file "monitoring/alerts.yml"
check_file "monitoring/grafana/datasources/prometheus.yml"
check_file "monitoring/grafana/dashboards/dashboard.yml"

echo ""
echo "🌐 Nginx Configuration"
echo "-----------------------------------"
check_file "nginx/staging.conf"
check_file "nginx/production.conf"

echo ""
echo "☸️  Kubernetes Manifests"
echo "-----------------------------------"
check_file "k8s/deployment.yml"
check_file "k8s/ingress.yml"
check_file "k8s/configmap.yml"
check_file "k8s/secrets-example.yml"
check_file "k8s/README.md"

echo ""
echo "📜 Scripts"
echo "-----------------------------------"
check_file "scripts/verify-setup.sh"
check_executable "scripts/verify-setup.sh"
check_file "scripts/backup.sh"
check_executable "scripts/backup.sh"
check_file "scripts/setup-ssl.sh"
check_executable "scripts/setup-ssl.sh"
check_file "scripts/performance-test.sh"
check_executable "scripts/performance-test.sh"

echo ""
echo "📚 Documentation"
echo "-----------------------------------"
check_file "README.md"
check_file "DEPLOYMENT.md"
check_file "CDN_SETUP.md"
check_file "SECURITY.md"
check_file "PHASE_6_SUMMARY.md"
check_file "QUICK_START_DEPLOYMENT.md"

echo ""
echo "📂 API Routes"
echo "-----------------------------------"
check_file "app/api/health/route.ts"
check_file "app/api/metrics/route.ts"

echo ""
echo "🔧 Library Files"
echo "-----------------------------------"
check_file "lib/prisma.ts"
check_file "lib/auth.ts"
check_file "lib/redis.ts"
check_file "lib/rate-limit.ts"
check_file "lib/sentry.ts"

echo ""
echo "🗂️  Directories"
echo "-----------------------------------"
check_dir "app"
check_dir "components"
check_dir "lib"
check_dir "prisma"
check_dir "public"
check_dir "scripts"
check_dir "nginx"
check_dir "monitoring"
check_dir "k8s"
check_dir ".github/workflows"

echo ""
echo "🔍 Optional Checks"
echo "-----------------------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules/ - dependencies installed"
else
  echo -e "${YELLOW}⚠${NC} node_modules/ - run: npm install"
fi

# Check if Docker is installed
if command -v docker >/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Docker is installed"
else
  echo -e "${RED}✗${NC} Docker is not installed"
  EXIT_CODE=1
fi

# Check if Docker Compose is installed (v1 or v2)
if command -v docker-compose >/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Docker Compose is installed (v1)"
elif docker compose version >/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Docker Compose is installed (v2)"
else
  echo -e "${RED}✗${NC} Docker Compose is not installed"
  EXIT_CODE=1
fi

echo ""
echo "=================================="

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All critical files are present!${NC}"
  echo ""
  echo "🚀 Next steps:"
  echo "  1. Copy .env.example to .env and configure"
  echo "  2. Install dependencies: npm install"
  echo "  3. Start development: npm run dev"
  echo "  4. Or use Docker: npm run docker:dev"
else
  echo -e "${RED}❌ Some files are missing!${NC}"
  echo ""
  echo "Please ensure all required files are present before deploying."
fi

echo ""
echo "📚 For more information, see:"
echo "  - DEPLOYMENT.md - Full deployment guide"
echo "  - QUICK_START_DEPLOYMENT.md - Quick start guide"
echo "  - PHASE_6_SUMMARY.md - Phase 6 completion summary"

exit $EXIT_CODE
