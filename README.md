# Sandbox Node.js CRUD API

This project is a Node.js/TypeScript backend providing CRUD APIs for Users, Products, and Orders with role-based access control, JWT authentication, and MongoDB/MSSQL support.

## Features

- User registration, login, and role-based access (admin/user)
- Product and Order CRUD APIs
- JWT authentication for protected endpoints
- Input validation using Joi
- MongoDB (default) and optional MSSQL support
- Response caching for improved performance
- Cache monitoring and management API
- Postman collections for API testing

## Project Structure

```
src/
  controllers/   # Route handlers for API logic
  entities/      # TypeORM entities (MSSQL)
  middleware/    # JWT, CORS, and auth middlewares
  models/        # Mongoose models (MongoDB)
  repositories/  # Data access layer for MongoDB/MSSQL
  routes/        # Express route definitions
  scripts/       # Utility scripts (e.g., createAdmin)
  types/         # TypeScript types/interfaces
  validation/    # Joi validation schemas
  views/         # Static HTML pages
tests/           # API tests
```

## Getting Started

### Prerequisites

- Node.js >= 16
- MongoDB running locally (see `.env` for connection string)

### Installation

```sh
npm install
```

### Environment Variables

Create `.env` and adjust as needed:

```
# MongoDB connection URI
MONGO_URI=mongodb://username:password@localhost:27017/yourdatabase?authSource=admin
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=your_secure_password
SECRET_KEY=your_secret_key_here

# Express server port
PORT=3000

# JWT settings
JWT_EXPIRES_IN=1h
JWT_ALGORITHM=HS256

# Node environment
NODE_ENV=development

# CORS allowed origin
CORS_ORIGIN=http://localhost:3000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Caching
CACHE_DURATION=60                # Default cache duration in seconds
PRODUCTS_CACHE_DURATION=300      # Product cache duration in seconds
ORDERS_CACHE_DURATION=120        # Order cache duration in seconds
CACHE_DEBUG=true                 # Enable cache debugging logs
CACHE_SIZE_LIMIT=100             # Cache size limit in MB
POPULAR_RESOURCE_MULTIPLIER=2    # Multiplier for popular resource TTL
```

### Build and Run

```sh
npm run build
npm start
```

For development with hot reload:

```sh
npm run dev
```

### Create Admin User

```sh
npm run ts-node src/scripts/createAdmin.ts
```

## API Overview

### Authentication

- `POST /api/auth/login` — Login, returns JWT
- `POST /api/auth/logout` — Logout

### Users

- `POST /api/users` — Register user (public)
- `GET /api/users` — List users (admin only)
- `GET /api/users/:id` — Get user by ID (admin only)
- `PUT /api/users/:id` — Update user (admin only)
- `PATCH /api/users/:id` — Partial update (admin only)
- `DELETE /api/users/:id` — Delete user (admin only)

### Products

- `POST /api/products` — Create product (admin only)
- `GET /api/products` — List products (public)
- `GET /api/products/:id` — Get product by ID (public)
- `PUT /api/products/:id` — Update product (admin only)
- `PATCH /api/products/:id` — Partial update (admin only)
- `DELETE /api/products/:id` — Delete product (admin only)

### Orders

- `POST /api/orders` — Create order (authenticated user)
- `GET /api/orders` — List orders (admin only)
- `GET /api/orders/:id` — Get order by ID (authenticated user)
- `PUT /api/orders/:id` — Update order (admin only)
- `PATCH /api/orders/:id` — Partial update (admin only)
- `DELETE /api/orders/:id` — Delete order (admin only)

### Cache Management

- `GET /api/cache/stats` — View cache statistics (admin only)
- `DELETE /api/cache` — Clear entire cache (admin only)

## Caching System

The API implements a comprehensive caching system to improve performance for frequently accessed endpoints:

### Cache Configuration

- **Default Cache Duration**: 60 seconds (configurable in `.env`)
- **Product Cache Duration**: 300 seconds (5 minutes)
- **Order Cache Duration**: 120 seconds (2 minutes)
- **Cache Size Limit**: 100MB (configurable)
- **Popular Resource Handling**: Frequently accessed resources get extended TTL

### Cached Endpoints

- GET `/api/products` - List all products
- GET `/api/products/:id` - Get a single product
- GET `/api/orders` - List all orders (admin only)
- GET `/api/orders/:id` - Get a single order

### Cache Headers

- **X-Cache**: Indicates if the response was served from cache (HIT/MISS)
- **Cache-Control**: Informs client-side caching behavior

### Cache Invalidation

Cache entries are automatically invalidated when:

- A product is created, updated, or deleted
- An order is created, updated, or deleted

### Cache Monitoring (Admin Only)

- **GET `/api/cache/stats`**: View cache statistics including hit/miss ratio
- **DELETE `/api/cache`**: Clear the entire cache

### Adaptive TTL

The caching system adapts TTL (Time-To-Live) values based on resource popularity:

- Frequently accessed resources get longer cache durations
- This dynamic TTL adjustment optimizes cache efficiency

## Testing

- Use the provided Postman collections (`*.postman_collection.json`) for API testing.
- Run automated tests:

  ```sh
  npm test
  ```

##