require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

module.exports = {
  apps: [{
    name:    'greensvar',
    script:  './dist/server/entry.mjs',
    cwd:     '/var/www/greensvar',

    instances:          1,
    autorestart:        true,
    watch:              false,
    max_memory_restart: '400M',

    env: {
      NODE_ENV:          'production',
      HOST:              '127.0.0.1',
      PORT:              3000,
      SUBDOMAIN_ROUTING: process.env.SUBDOMAIN_ROUTING || 'false',
      SESSION_SECRET:    process.env.SESSION_SECRET    || '',
      DATABASE_URL:      process.env.DATABASE_URL      || '',
      GMAIL_USER:        process.env.GMAIL_USER        || '',
      GMAIL_APP_PASSWORD:process.env.GMAIL_APP_PASSWORD|| '',
      QUOTE_FROM_NAME:   process.env.QUOTE_FROM_NAME   || '',
      QUOTE_TO_EMAIL:    process.env.QUOTE_TO_EMAIL    || '',
      PDF_STORAGE_DIR:   process.env.PDF_STORAGE_DIR   || '/var/www/greensvar/storage/quotes',
    },
  }],
}
