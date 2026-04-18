const path = require('path')
const fs   = require('fs')

// Load .env from project root so all vars are available to the app
const envFile = path.join(__dirname, '..', '.env')
const envVars = {}
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8')
    .split('\n')
    .forEach(line => {
      const [key, ...rest] = line.split('=')
      if (key && !key.startsWith('#')) {
        envVars[key.trim()] = rest.join('=').trim()
      }
    })
}

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
      ...envVars,                 // spread all vars from .env
    },
  }],
}
