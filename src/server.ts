// Main server file for the backend application
// Sets up Express, connects to MongoDB, configures middleware, and defines routes
// Starts the server on the specified port

// Importing required modules
import express, { Application } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import rateLimit from 'express-rate-limit';
import pageRoutes from './routes/pageRoutes';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import userRoutes from './routes/userRoutes';
import cacheRoutes from './routes/cacheRoutes';
import corsMiddleware from './middleware/corsMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandlerMiddleware';

// Load environment variables
dotenv.config();

// Database connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
}

try {
    mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
} catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
}

// Initializing the Express application
const app: Application = express();

// Configure rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Middleware to parse incoming JSON requests
app.use(express.json());
// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Enable CORS and handle OPTIONS pre-flight requests
app.use(corsMiddleware());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

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
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
