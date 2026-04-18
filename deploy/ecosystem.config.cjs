module.exports = {
  apps: [{
    name:    'greensvar',
    script:  './dist/server/entry.mjs',
    cwd:     '/var/www/greensvar',

    instances:          1,
    autorestart:        true,
    watch:              false,
    max_memory_restart: '400M',   // restart if app exceeds 400MB (1GB droplet)

    env: {
      NODE_ENV: 'production',
      HOST:     '127.0.0.1',      // bind to localhost only — Nginx is the public face
      PORT:     3000,
    },
  }],
}
