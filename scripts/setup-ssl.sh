#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# Usage: ./scripts/setup-ssl.sh [domain] [email]

DOMAIN=${1:-""}
EMAIL=${2:-""}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "❌ Missing required arguments"
  echo "Usage: ./scripts/setup-ssl.sh [domain] [email]"
  echo "Example: ./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com"
  exit 1
fi

echo "🔐 SSL Certificate Setup"
echo "=================================="
echo "📍 Domain: $DOMAIN"
echo "📧 Email: $EMAIL"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠️  This script requires root privileges"
  echo "Please run with: sudo ./scripts/setup-ssl.sh $DOMAIN $EMAIL"
  exit 1
fi

# Check if certbot is installed
if ! command -v certbot >/dev/null 2>&1; then
  echo "📦 Installing certbot..."
  
  if command -v apt-get >/dev/null 2>&1; then
    # Debian/Ubuntu
    apt-get update
    apt-get install -y certbot
  elif command -v yum >/dev/null 2>&1; then
    # CentOS/RHEL
    yum install -y certbot
  else
    echo "❌ Could not install certbot. Please install it manually."
    exit 1
  fi
fi

echo "✅ Certbot is installed"
echo ""

# Stop services that might use port 80
echo "⏸️  Stopping services on port 80..."
if systemctl is-active --quiet nginx; then
  systemctl stop nginx
  RESTART_NGINX=true
fi

if docker ps | grep -q "nginx"; then
  docker stop $(docker ps -q --filter "ancestor=nginx")
  RESTART_DOCKER_NGINX=true
fi

echo ""
echo "🔐 Obtaining SSL certificate..."
echo ""

# Obtain certificate
certbot certonly --standalone \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --non-interactive \
  --staple-ocsp

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Certificate obtained successfully!"
  
  # Create nginx ssl directory
  mkdir -p ./nginx/ssl
  
  # Copy certificates
  echo "📋 Copying certificates to ./nginx/ssl/"
  cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/cert.pem
  cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/key.pem
  
  # Set permissions
  chmod 644 ./nginx/ssl/cert.pem
  chmod 600 ./nginx/ssl/key.pem
  
  echo "✅ Certificates copied"
  
  # Certificate info
  echo ""
  echo "📄 Certificate Information:"
  openssl x509 -in ./nginx/ssl/cert.pem -noout -dates
  
  echo ""
  echo "=================================="
  echo "✅ SSL setup completed!"
  echo ""
  echo "📁 Certificates location:"
  echo "   Cert: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  echo "   Key:  /etc/letsencrypt/live/$DOMAIN/privkey.pem"
  echo ""
  echo "📋 Nginx location:"
  echo "   Cert: ./nginx/ssl/cert.pem"
  echo "   Key:  ./nginx/ssl/key.pem"
  echo ""
  echo "🔄 Certificate will expire in 90 days"
  echo ""
  echo "💡 To auto-renew, add to crontab:"
  echo "   0 0 1 * * certbot renew --quiet --deploy-hook \"./scripts/setup-ssl.sh $DOMAIN $EMAIL\""
  echo ""
  echo "🚀 Now you can start your application with HTTPS!"
  
else
  echo ""
  echo "❌ Failed to obtain certificate"
  echo ""
  echo "💡 Troubleshooting:"
  echo "  1. Make sure domain DNS is pointing to this server"
  echo "  2. Ensure ports 80 and 443 are open"
  echo "  3. Check firewall settings: sudo ufw status"
  exit 1
fi

# Restart services
if [ "$RESTART_NGINX" = true ]; then
  echo ""
  echo "🔄 Restarting nginx..."
  systemctl start nginx
fi

if [ "$RESTART_DOCKER_NGINX" = true ]; then
  echo ""
  echo "🔄 You can now restart your Docker containers"
  echo "   docker-compose up -d"
fi

echo ""
echo "🔐 SSL Certificate has been set up successfully!"
