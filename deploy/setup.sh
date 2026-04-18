#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Greens Variegated — DigitalOcean Ubuntu 24.04 setup
# Run as root on a fresh droplet: bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "── [1/7] Updating system ─────────────────────────────"
apt-get update -y && apt-get upgrade -y

echo "── [2/7] Installing Node.js 22 ──────────────────────"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node -v   # should print v22.x

echo "── [3/7] Installing PM2 & tools ─────────────────────"
npm install -g pm2
apt-get install -y nginx git

echo "── [4/7] Setting up PostgreSQL ──────────────────────"
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
# Create DB user + database
sudo -u postgres psql <<SQL
CREATE USER greensvar WITH PASSWORD 'CHANGE_THIS_PASSWORD';
CREATE DATABASE greensvar_prod OWNER greensvar;
SQL

echo "── [5/7] Creating app directory ─────────────────────"
mkdir -p /var/www/greensvar
mkdir -p /var/www/greensvar/storage/quotes   # PDF invoice storage

echo "── [6/7] Configuring Nginx (no domain, HTTP only) ──"
cp /var/www/greensvar/deploy/nginx-ip.conf /etc/nginx/sites-available/greensvar
ln -sf /etc/nginx/sites-available/greensvar /etc/nginx/sites-enabled/greensvar
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "── [7/7] PM2 startup on boot ────────────────────────"
pm2 startup systemd -u root --hp /root
# pm2 save  ← run this after starting the app

echo ""
echo "✅ System ready. Next steps:"
echo "   1. cd /var/www/greensvar"
echo "   2. Upload your code (git clone or scp)"
echo "   3. cp deploy/.env.production.example .env && nano .env"
echo "   4. npm install --omit=dev"
echo "   5. npm run build"
echo "   6. npm run db:push && npm run db:seed"
echo "   7. pm2 start deploy/ecosystem.config.cjs"
echo "   8. pm2 save"
echo "   9. Visit http://YOUR_DROPLET_IP"
