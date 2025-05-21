// Main server file for the backend application
// Sets up Express, connects to MongoDB, configures middleware, and defines routes
// Starts the server on the specified port

// Importing required modules
import express, { Application } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pageRoutes from './routes/pageRoutes';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import cacheRoutes from './routes/cacheRoutes';
import corsMiddleware from './middleware/corsMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandlerMiddleware';
import { logger, requestLogger } from './utils/logger';

// Load environment variables
dotenv.config();

// Database connection using our dbManager
import { dbManager } from './database/dbManager';

// Connect to the appropriate database based on DB_TYPE
dbManager.connect()
  .then(success => {
    if (!success) {
      logger.error(`Failed to connect to ${process.env.DB_TYPE || 'mongo'} database`);
      process.exit(1);
    }
    logger.info(`Connected to ${process.env.DB_TYPE || 'mongo'} database`);
  })
  .catch(err => {
    logger.error(`Database connection error: ${err}`);
    process.exit(1);
  });

// Initializing the Express application
const app: Application = express();

// Use helmet for security headers if enabled
if (process.env.ENABLE_HELMET === 'true') {
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
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiting to API routes if enabled
if (process.env.ENABLE_RATE_LIMIT === 'true') {
  const apiPrefix = process.env.API_PREFIX || '/api';
  app.use(apiPrefix, apiLimiter);
  logger.info(`Rate limiting enabled for ${apiPrefix} routes`);
} else {
  logger.warn('Rate limiting is disabled');
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbType = process.env.DB_TYPE || 'mongo';
  let dbStatus = 'unknown';
  let mongoStatus = 'not checked';
  let mssqlStatus = 'not checked';
  
  // Check the currently active database
  if (dbType === 'mongo') {
    mongoStatus = dbManager.isMongoConnected() ? 'connected' : 'disconnected';
    dbStatus = mongoStatus;
  } else {
    mssqlStatus = dbManager.isMSSQLConnected() ? 'connected' : 'disconnected';
    dbStatus = mssqlStatus;
  }

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    activeDbType: dbType,
    dbStatus,
    details: {
      mongo: mongoStatus,
      mssql: mssqlStatus
    },
    timestamp: new Date().toISOString(),
  });
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
// Setting up routes for serving pages (should be last)
app.use('/', pageRoutes);

// Handle 404 errors for undefined routes
app.use(notFoundHandler);

// Global error handler - should be last middleware
app.use(errorHandler);

// Starting the server
const PORT: number = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Database type: ${process.env.DB_TYPE}`);
});

export default app;
