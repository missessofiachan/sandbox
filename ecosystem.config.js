module.exports = {
  apps: [
    {
      // Production configuration
      name: 'sandbox-api-prod',
      script: './dist/server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_TYPE: 'mongo',
        ENABLE_RATE_LIMIT: 'true',
        ENABLE_CACHE: 'true',
        ENABLE_HELMET: 'true',
        LOG_LEVEL: 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_TYPE: 'mongo'
      },
      // Process management
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_type: 'json',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Health monitoring
      health_check_http: {
        url: 'http://localhost:3000/health',
        method: 'GET',
        timeout: 5000,
        interval: 30000
      },
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Environment-specific overrides
      increment_var: 'PORT'
    },
    
    // Development configuration - uses built JavaScript for stability
    {
      name: 'sandbox-api-dev',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_TYPE: 'mongo',
        ENABLE_RATE_LIMIT: 'false',
        ENABLE_CACHE: 'true',
        ENABLE_HELMET: 'false',
        LOG_LEVEL: 'debug'
      },
      
      // Development-specific settings
      autorestart: true,
      watch: ['./src'],
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'logs',
        'dist',
        'tests',
        '*.log',
        '.git',
        '*.md'
      ],
      watch_options: {
        followSymlinks: false
      },
      
      // Faster restarts for development
      restart_delay: 1000,
      max_restarts: 50,
      min_uptime: '2s',
      
      // Development logging
      log_file: './logs/pm2-dev-combined.log',
      out_file: './logs/pm2-dev-out.log',
      error_file: './logs/pm2-dev-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    
    // Alternative TypeScript development configuration (more stable)
    {
      name: 'sandbox-api-dev-ts',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        DB_TYPE: 'mongo',
        ENABLE_RATE_LIMIT: 'false',
        ENABLE_CACHE: 'true',
        ENABLE_HELMET: 'false',
        LOG_LEVEL: 'debug'
      },
      
      // Development-specific settings
      autorestart: true,
      watch: ['./dist'],
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'logs',
        'src',
        'tests',
        '*.log',
        '.git'
      ],
      
      // Faster restarts for development
      restart_delay: 1000,
      max_restarts: 15,
      min_uptime: '3s',
      
      // Development logging
      log_file: './logs/pm2-dev-ts-combined.log',
      out_file: './logs/pm2-dev-ts-out.log',
      error_file: './logs/pm2-dev-ts-error.log'
    },
    
    // MongoDB-specific production app
    {
      name: 'sandbox-api-mongo',
      script: './dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_TYPE: 'mongo',
        ENABLE_RATE_LIMIT: 'true',
        ENABLE_CACHE: 'true',
        ENABLE_HELMET: 'true'
      },
      autorestart: true,
      max_memory_restart: '400M',
      
      // Health check specific to MongoDB
      health_check_http: {
        url: 'http://localhost:3001/health',
        method: 'GET',
        timeout: 5000,
        interval: 30000
      }
    },
    
    // MSSQL-specific production app
    {
      name: 'sandbox-api-mssql',
      script: './dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        DB_TYPE: 'mssql',
        ENABLE_RATE_LIMIT: 'true',
        ENABLE_CACHE: 'true',
        ENABLE_HELMET: 'true'
      },
      autorestart: true,
      max_memory_restart: '400M',
      
      // Health check specific to MSSQL
      health_check_http: {
        url: 'http://localhost:3002/health',
        method: 'GET',
        timeout: 5000,
        interval: 30000
      }
    },
    
    // SQLite-specific production app
    {
      name: 'sandbox-api-sqlite',
      script: './dist/server.js',
      instances: 1, // SQLite works best with single instance
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        DB_TYPE: 'sqlite',
        SQLITE_DB_PATH: './data/sandbox.db',
        ENABLE_RATE_LIMIT: 'true',
        ENABLE_CACHE: 'true',
        ENABLE_HELMET: 'true'
      },
      autorestart: true,
      max_memory_restart: '300M',
      
      // Health check specific to SQLite
      health_check_http: {
        url: 'http://localhost:3003/health',
        method: 'GET',
        timeout: 5000,
        interval: 30000
      },
      
      // SQLite-specific logging
      log_file: './logs/pm2-sqlite-combined.log',
      out_file: './logs/pm2-sqlite-out.log',
      error_file: './logs/pm2-sqlite-error.log'
    },
    
    // SQLite development app
    {
      name: 'sandbox-api-sqlite-dev',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3004,
        DB_TYPE: 'sqlite',
        SQLITE_DB_PATH: './data/sandbox-dev.db',
        ENABLE_RATE_LIMIT: 'false',
        ENABLE_CACHE: 'true',
        ENABLE_HELMET: 'false',
        LOG_LEVEL: 'debug'
      },
      
      // Development-specific settings
      autorestart: true,
      watch: ['./dist'],
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'logs',
        'src',
        'tests',
        '*.log',
        '.git',
        'data/*.db'
      ],
      
      // Faster restarts for development
      restart_delay: 1000,
      max_restarts: 15,
      min_uptime: '3s',
      
      // Development logging
      log_file: './logs/pm2-sqlite-dev-combined.log',
      out_file: './logs/pm2-sqlite-dev-out.log',
      error_file: './logs/pm2-sqlite-dev-error.log'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/sandbox.git',
      path: '/var/www/sandbox',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
