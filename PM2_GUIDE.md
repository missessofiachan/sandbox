# PM2 Process Management Guide

This guide covers how to use PM2 for production-grade process management of the Sandbox API.

## Why PM2?

PM2 provides:
- **Process monitoring** and automatic restarts
- **Load balancing** across multiple CPU cores
- **Zero-downtime deployments**
- **Advanced logging** and monitoring
- **Memory monitoring** with automatic restart on leaks
- **Health checks** and performance metrics

## Quick Start

### 1. Production Deployment
```bash
# Build the application
npm run build

# Start all production processes
npm run pm2:start

# Check status
npm run pm2:status
```

### 2. Development Mode
```bash
# Start development process with file watching
npm run pm2:dev

# View logs in real-time
npm run pm2:logs
```

### 3. Database-Specific Deployments
```bash
# Start MongoDB-specific instance
npm run pm2:mongo

# Start MSSQL-specific instance
npm run pm2:mssql
```

## Available PM2 Scripts

| Script | Description |
|--------|-------------|
| `npm run pm2:start` | Start production processes (uses all CPU cores) |
| `npm run pm2:dev` | Start development process with file watching |
| `npm run pm2:mongo` | Start MongoDB-specific production instance |
| `npm run pm2:mssql` | Start MSSQL-specific production instance |
| `npm run pm2:stop` | Stop all processes |
| `npm run pm2:restart` | Restart all processes |
| `npm run pm2:reload` | Zero-downtime reload |
| `npm run pm2:delete` | Delete all processes |
| `npm run pm2:logs` | View real-time logs |
| `npm run pm2:status` | View process status |
| `npm run pm2:monitor` | Open PM2 web monitoring |
| `npm run pm2:flush` | Clear all logs |

## Process Configurations

### Production (`sandbox-api-prod`)
- **Instances**: Maximum CPU cores
- **Mode**: Cluster
- **Memory limit**: 500MB per instance
- **Health checks**: Every 30 seconds
- **Auto-restart**: On crashes and memory limits

### Development (`sandbox-api-dev`)
- **Instances**: 1
- **Mode**: Fork
- **File watching**: Enabled
- **TypeScript**: Direct execution via ts-node
- **Faster restarts**: For development workflow

### Database-Specific Instances
- **MongoDB instance**: Port 3001
- **MSSQL instance**: Port 3002
- **Independent scaling**: 2 instances each
- **Health monitoring**: Database-specific endpoints

## Advanced PM2 Commands

### Process Management
```bash
# Start specific app
pm2 start ecosystem.config.js --only sandbox-api-prod

# Restart specific app
pm2 restart sandbox-api-prod

# Stop specific app
pm2 stop sandbox-api-prod

# Scale to specific number of instances
pm2 scale sandbox-api-prod 4
```

### Monitoring and Logs
```bash
# Monitor specific process
pm2 monit sandbox-api-prod

# View logs for specific process
pm2 logs sandbox-api-prod

# View logs with specific number of lines
pm2 logs sandbox-api-prod --lines 100

# Stream logs to file
pm2 logs sandbox-api-prod > app.log
```

### Health and Performance
```bash
# Show detailed process information
pm2 show sandbox-api-prod

# Reset restart counter
pm2 reset sandbox-api-prod

# Show process tree
pm2 prettylist
```

## Custom Monitoring Script

We've included a custom monitoring script for enhanced observability:

```bash
# Collect current metrics
node scripts/pm2-monitor.js metrics

# Run health check
node scripts/pm2-monitor.js health

# Auto-restart problematic processes
node scripts/pm2-monitor.js restart

# Start continuous monitoring (1-minute intervals)
node scripts/pm2-monitor.js monitor 60000
```

## Health Checks

PM2 is configured to perform health checks on your `/health` endpoint:

- **Interval**: Every 30 seconds
- **Timeout**: 5 seconds
- **Automatic restart**: On health check failures

The health endpoint returns:
- Server uptime
- Database connection status
- Memory usage
- Connection pool statistics

## Memory Management

Each process has memory limits:
- **Production**: 500MB per instance
- **Development**: No limit (for debugging)
- **Database-specific**: 400MB per instance

Processes automatically restart when memory limits are exceeded.

## Log Management

PM2 logs are stored in the `logs/` directory:
- `pm2-combined.log` - All process output
- `pm2-out.log` - Standard output
- `pm2-error.log` - Error output
- `pm2-dev-*.log` - Development-specific logs

### Log Rotation
```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## Zero-Downtime Deployments

```bash
# Method 1: Using reload (recommended)
npm run pm2:reload

# Method 2: Using deployment script
npm run deploy

# Method 3: Manual deployment
git pull
npm install
npm run build
pm2 reload ecosystem.config.js --env production
```

## Production Best Practices

### 1. Environment Variables
Ensure all production environment variables are set:
```env
NODE_ENV=production
PORT=3000
DB_TYPE=mongo
ENABLE_RATE_LIMIT=true
ENABLE_CACHE=true
ENABLE_HELMET=true
```

### 2. System Resources
- Monitor CPU and memory usage
- Adjust instance count based on load
- Use `pm2 monit` for real-time monitoring

### 3. Database Connections
- Monitor connection pool statistics via `/api/database/pool-stats`
- Use health checks to detect database issues
- Configure proper connection timeouts

### 4. Security
- Run PM2 processes with limited user privileges
- Keep PM2 updated: `npm install -g pm2@latest`
- Use PM2 keymetrics for advanced monitoring

## Troubleshooting

### Common Issues

1. **Process won't start**
   ```bash
   pm2 logs sandbox-api-prod --lines 50
   ```

2. **High memory usage**
   ```bash
   pm2 show sandbox-api-prod
   node scripts/pm2-monitor.js metrics
   ```

3. **Frequent restarts**
   ```bash
   pm2 logs sandbox-api-prod --err
   node scripts/pm2-monitor.js health
   ```

4. **Database connection issues**
   - Check `/health` endpoint
   - Verify environment variables
   - Check database server status

### Recovery Commands
```bash
# Kill all PM2 processes
pm2 kill

# Restart PM2 daemon
pm2 resurrect

# Save current process list
pm2 save

# Restore saved processes
pm2 resurrect
```

## Integration with CI/CD

Example GitHub Actions workflow:
```yaml
name: Deploy with PM2
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run pm2:reload
```

This setup provides enterprise-level process management for your Sandbox API with comprehensive monitoring, health checks, and zero-downtime deployments.
