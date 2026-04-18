#!/bin/bash
# Run once on a fresh Ubuntu 24.04 DO droplet

set -e

# 1. Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. PM2
sudo npm install -g pm2

# 3. Nginx
sudo apt-get install -y nginx

# 4. Certbot (SSL)
sudo apt-get install -y certbot python3-certbot-nginx

# 5. PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres createuser --superuser greensvar
sudo -u postgres createdb greensvar
# Set password:  sudo -u postgres psql -c "ALTER USER greensvar PASSWORD 'yourpassword';"

# 6. Clone repo and install deps
# git clone https://github.com/your-org/greensvar.git /var/www/greensvar
# cd /var/www/greensvar && npm install

# 7. Copy .env
# cp .env.example .env && nano .env

# 8. Run DB migrations
# npx drizzle-kit push

# 9. Hash admin password (run this locally, paste hash into .env)
# node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(console.log)"

# 10. Build and start
# npm run build
# pm2 start deploy/ecosystem.config.cjs
# pm2 save && pm2 startup

# 11. Nginx config
# sudo cp deploy/nginx.conf /etc/nginx/sites-available/greensvar
# sudo ln -s /etc/nginx/sites-available/greensvar /etc/nginx/sites-enabled/
# sudo nginx -t && sudo systemctl reload nginx

# 12. SSL (run after DNS is pointed at the droplet)
# sudo certbot --nginx -d greensvar.com -d www.greensvar.com -d fruithai.greensvar.com -d variegata.greensvar.com

echo "Setup complete. Follow the commented steps to finish deployment."
