// Main server file for the backend application
// Sets up Express, connects to MongoDB, configures middleware, and defines routes
// Starts the server on the specified port

// Importing required modules
import express, { Application } from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pageRoutes from './routes/pageRoutes';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import cacheRoutes from './routes/cacheRoutes';
import databaseRoutes from './routes/databaseRoutes';
import corsMiddleware from './middleware/corsMiddleware';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandlerMiddleware';
import { logger, requestLogger, isFeatureEnabled } from './utils/logger';
import { cleanEnv, str, num, bool } from 'envalid';

// Load and validate environment variables
cleanEnv(process.env, {
  MONGO_URI: str({ desc: 'MongoDB connection URI' }),
  MONGO_DB: str({ desc: 'MongoDB database name', default: '' }),
  MONGO_USER: str({ desc: 'MongoDB username', default: '' }),
  MONGO_PASSWORD: str({ desc: 'MongoDB password', default: '' }),
  MONGO_AUTH_DB: str({ desc: 'MongoDB auth DB', default: 'admin' }),
  MSSQL_HOST: str({ desc: 'MSSQL host', default: '' }),
  MSSQL_PORT: num({ desc: 'MSSQL port', default: 1433 }),
  MSSQL_USER: str({ desc: 'MSSQL user', default: '' }),
  MSSQL_PASSWORD: str({ desc: 'MSSQL password', default: '' }),
  MSSQL_DB: str({ desc: 'MSSQL database', default: '' }),
  DB_TYPE: str({ choices: ['mongo', 'mssql'], default: 'mongo' }),
  PORT: num({ default: 3000 }),
  NODE_ENV: str({ default: 'development' }),
  ENABLE_RATE_LIMIT: bool({ default: true }),
  ENABLE_CACHE: bool({ default: true }),
  ENABLE_HELMET: bool({ default: true }),
  LOG_LEVEL: str({ default: 'info' }),
  // Add more as needed
});

// Database connection using our dbManager
import { dbManager } from './database/dbManager';

// Initialize database connections
(async () => {
  try {
    const dbType = process.env.DB_TYPE || 'mongo';
    const success = await dbManager.connect();
    if (!success) {
      logger.error(`Failed to connect to ${dbType} database`);
      process.exit(1);
    }
    logger.info(`Connected to ${dbType} database`);
  } catch (err) {
    logger.error(`Database connection error: ${err}`);
    process.exit(1);
  }
})();

// Initializing the Express application
const app: Application = express();

// Use helmet for security headers if enabled
if (isFeatureEnabled('ENABLE_HELMET')) {
  app.use(helmet());
  logger.info('Helmet middleware enabled for security headers');
}

// Use request logger middleware
app.use(requestLogger);

// Middleware to parse incoming JSON requests
app.use(express.json());
// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Enable CORS and handle OPTIONS pre-flight requests
app.use(corsMiddleware());

// Configure rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Apply rate limiting to API routes if enabled
if (isFeatureEnabled('ENABLE_RATE_LIMIT')) {
  const apiPrefix = process.env.API_PREFIX || '/api';
  app.use(apiPrefix, apiLimiter);
  logger.info(`Rate limiting enabled for ${apiPrefix} routes`);
} else {
  logger.warn('Rate limiting is disabled');
}

// Enhanced health check endpoint with connection pool statistics
// Define the expected type for databaseHealth
interface DatabaseHealth {
  mongodb: {
    connected: boolean;
    stats: unknown;
  };
  mssql: {
    connected: boolean;
    stats: unknown;
  };
}

app.get('/health', async (req, res) => {
  try {
    const dbType = process.env.DB_TYPE || 'mongo';

    // Get comprehensive database health information
    const databaseHealth =
      (await dbManager.getDatabaseHealth()) as DatabaseHealth;

    // Determine overall status
    let dbStatus = 'unknown';
    if (dbType === 'mongo') {
      dbStatus = databaseHealth.mongodb.connected
        ? 'connected'
        : 'disconnected';
    } else {
      dbStatus = databaseHealth.mssql.connected ? 'connected' : 'disconnected';
    }

    const healthResponse = {
      status: 'ok',
      uptime: process.uptime(),
      activeDbType: dbType,
      dbStatus,
      database: databaseHealth,
      connectionPools: {
        mongodb: databaseHealth.mongodb.stats,
        mssql: databaseHealth.mssql.stats,
      },
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
        external:
          Math.round((process.memoryUsage().external / 1024 / 1024) * 100) /
          100,
        rss: Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(healthResponse);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Setting up routes for authentication
app.use('/api/auth', authRoutes);
// Setting up routes for product-related operations
app.use('/api/products', productRoutes);
// Setting up routes for order-related operations
app.use('/api/orders', orderRoutes);
// Setting up routes for user-related operations
app.use('/api/users', userRoutes);
// Setting up routes for cache management
app.use('/api/cache', cacheRoutes);
// Setting up routes for database monitoring
app.use('/api/database', databaseRoutes);
// Setting up routes for serving pages (should be last)
app.use('/', pageRoutes);

// Handle 404 errors for undefined routes
app.use(notFoundHandler);

// Global error handler - should be last middleware
app.use(errorHandler);

// Example: toggle a new feature
if (isFeatureEnabled('ENABLE_NEW_FEATURE')) {
  logger.info('New feature is enabled!');
  // Initialize or mount new feature here
}

// Starting the server
const PORT: number = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Database type: ${process.env.DB_TYPE}`);
});

export default app;
