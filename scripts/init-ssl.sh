#!/usr/bin/env bash
set -euo pipefail

DOMAIN="rostchips.morrost.com"
EMAIL="morrost@gmail.com"

echo "=== SSL Bootstrap for $DOMAIN ==="

# 1. Create directories used by certbot and nginx
echo "Creating directories..."
mkdir -p /var/www/certbot
docker volume create certbot-webroot >/dev/null 2>&1 || true
docker volume create certbot-certs  >/dev/null 2>&1 || true

# 2. Start a temporary nginx that serves only the ACME challenge over HTTP
echo "Starting temporary nginx for ACME challenge..."
docker run -d --name nginx-acme \
  -p 80:80 \
  -v certbot-webroot:/var/www/certbot \
  nginx:alpine sh -c '
    cat > /etc/nginx/nginx.conf <<EOF
events { worker_connections 128; }
http {
    server {
        listen 80;
        server_name _;
        location /.well-known/acme-challenge/ { root /var/www/certbot; }
        location / { return 444; }
    }
}
EOF
    nginx -g "daemon off;"
  '

# Give nginx a moment to start
sleep 2

# 3. Run certbot to obtain the initial certificate
echo "Requesting certificate from Let's Encrypt..."
docker run --rm \
  -v certbot-webroot:/var/www/certbot \
  -v certbot-certs:/etc/letsencrypt \
  certbot/certbot certonly \
    --webroot -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive

# 4. Stop and remove the temporary nginx
echo "Stopping temporary nginx..."
docker rm -f nginx-acme

echo ""
echo "=== Done! Certificate obtained for $DOMAIN ==="
echo "Now run: docker compose up -d"
