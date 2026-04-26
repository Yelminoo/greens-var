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
      NODE_ENV:                 'production',
      HOST:                     '127.0.0.1',
      PORT:                     3000,
      SUBDOMAIN_ROUTING:        process.env.SUBDOMAIN_ROUTING        || 'false',
      SESSION_SECRET:           process.env.SESSION_SECRET           || '',
      DATABASE_URL:             process.env.DATABASE_URL             || '',
      ADMIN_PASSWORD_HASH:      process.env.ADMIN_PASSWORD_HASH      || '',
      QUOTE_FROM_NAME:          process.env.QUOTE_FROM_NAME          || '',
      QUOTE_FROM_EMAIL:         process.env.QUOTE_FROM_EMAIL         || '',
      QUOTE_TO_EMAIL:           process.env.QUOTE_TO_EMAIL           || '',
      REPLY_TO_EMAIL:           process.env.REPLY_TO_EMAIL           || '',
      RESEND_API_KEY:           process.env.RESEND_API_KEY           || '',
      PUBLIC_RECAPTCHA_SITE_KEY:process.env.PUBLIC_RECAPTCHA_SITE_KEY|| '',
      RECAPTCHA_SECRET_KEY:     process.env.RECAPTCHA_SECRET_KEY     || '',
      PDF_STORAGE_DIR:          process.env.PDF_STORAGE_DIR          || '/var/www/greensvar/storage/quotes',
      IMAGE_UPLOAD_DIR:         process.env.IMAGE_UPLOAD_DIR         || '/var/www/greensvar/public/images/products',
    },
  }],
}
