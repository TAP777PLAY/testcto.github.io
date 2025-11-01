#!/bin/bash

# Database Backup Script for SiteBuilder
# Usage: ./scripts/backup.sh [environment]

ENVIRONMENT=${1:-"production"}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sitebuilder_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"

echo "🔒 Starting backup for: $ENVIRONMENT"
echo "=================================="

# Create backup directory
mkdir -p $BACKUP_DIR

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
  echo "❌ docker-compose is required but not installed. Aborting."
  exit 1
fi

# Determine docker-compose file
case $ENVIRONMENT in
  "dev"|"development")
    COMPOSE_FILE="docker-compose.dev.yml"
    DB_NAME="sitebuilder_dev"
    ;;
  "staging")
    COMPOSE_FILE="docker-compose.staging.yml"
    DB_NAME="sitebuilder_staging"
    ;;
  "prod"|"production")
    COMPOSE_FILE="docker-compose.prod.yml"
    DB_NAME="sitebuilder_production"
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Usage: ./scripts/backup.sh [dev|staging|production]"
    exit 1
    ;;
esac

echo "📦 Environment: $ENVIRONMENT"
echo "📝 Database: $DB_NAME"
echo "📁 Backup file: $BACKUP_FILE"
echo ""

# Check if containers are running
if ! docker-compose -f $COMPOSE_FILE ps | grep -q "postgres"; then
  echo "❌ PostgreSQL container is not running"
  echo "Start it with: docker-compose -f $COMPOSE_FILE up -d postgres"
  exit 1
fi

echo "⏳ Creating backup..."

# Create database backup
docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U postgres $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
  echo "✅ Backup completed successfully!"
  echo "📦 Size: $BACKUP_SIZE"
  echo "📁 Location: $BACKUP_FILE"
else
  echo "❌ Backup failed!"
  exit 1
fi

echo ""
echo "🧹 Cleaning old backups (keeping last 7 days)..."

# Remove backups older than 7 days
find $BACKUP_DIR -name "sitebuilder_${ENVIRONMENT}_*.sql.gz" -type f -mtime +7 -delete

BACKUP_COUNT=$(find $BACKUP_DIR -name "sitebuilder_${ENVIRONMENT}_*.sql.gz" -type f | wc -l)
echo "📊 Total backups for $ENVIRONMENT: $BACKUP_COUNT"

echo ""
echo "=================================="
echo "✅ Backup process completed!"
echo ""
echo "💡 To restore this backup:"
echo "   gunzip < $BACKUP_FILE | docker-compose -f $COMPOSE_FILE exec -T postgres psql -U postgres $DB_NAME"
echo ""
echo "💡 To automate backups, add to crontab:"
echo "   0 2 * * * cd /path/to/project && ./scripts/backup.sh $ENVIRONMENT"
