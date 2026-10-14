module.exports = {
  apps: [
    {
      name: "radiotherapist-website",
      script: "npm",
      args: "start",
      cwd: "./",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // Environment variables
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // ⚠️ Set these in your environment or .env file!
        // ADMIN_PASSWORD: "your-secure-password",
        // SESSION_SECRET: "your-random-32-char-secret",
      },

      // Error handling
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",

      // Timezone (Iran)
      timezone: "Asia/Tehran",

      // Restart delay
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
    },
    {
      // Daily database backup at 2:00 AM Tehran time
      name: "db-backup",
      script: "node",
      args: "scripts/backup-db.js",
      cwd: "./",
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: "0 2 * * *",
      timezone: "Asia/Tehran",
      error_file: "./logs/backup-err.log",
      out_file: "./logs/backup-out.log",
    },
    {
      // Weekly sitemap ping to Google/Bing every Monday at 6:00 AM
      name: "sitemap-ping",
      script: "node",
      args: "scripts/ping-sitemap.js",
      cwd: "./",
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: "0 6 * * 1",
      timezone: "Asia/Tehran",
      error_file: "./logs/ping-err.log",
      out_file: "./logs/ping-out.log",
    },
  ],
};
