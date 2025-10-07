module.exports = {
  apps: [
    {
      name: 'brew-api',
      cwd: './be',
      script: 'app.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'brew-vue',
      cwd: './fe',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      watch: true,
      ignore_watch: ['node_modules', 'dist'],
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
