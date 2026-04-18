module.exports = {
  apps: [{
    name:         'greensvar',
    script:       './dist/server/entry.mjs',
    instances:    1,
    autorestart:  true,
    watch:        false,
    max_memory_restart: '400M',
    env: {
      NODE_ENV:   'production',
      HOST:       '127.0.0.1',
      PORT:       3000,
    },
    env_file: '.env',
  }],
}
