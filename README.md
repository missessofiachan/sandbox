# Sandbox Node.js CRUD API with Dual-Database Support

This project is a Node.js/TypeScript backend providing CRUD APIs for Users, Products, and Orders with role-based access control, JWT authentication, and dual-database support for MongoDB and MSSQL.

## Features

- **Dual Database Support**: Switch between MongoDB and MSSQL with a configuration setting
- User registration, login, and role-based access (admin/user)
- Product and Order CRUD APIs using repository pattern
- JWT authentication for protected endpoints
- Input validation using Joi
- Structured Winston logging with console and file outputs
- Response caching for improved performance
- Cache monitoring and management API
- Security enhancements with Helmet middleware
- Health endpoint for system monitoring
- Postman collections for API testing

## Project Structure

```
src/
  controllers/   # Route handlers for API logic
  entities/      # TypeORM entities (MSSQL)
  middleware/    # Express middleware
  models/        # MongoDB models
  repositories/  # Database repositories (MongoDB and MSSQL)
  routes/        # API route definitions
  types/         # TypeScript interface definitions
  utils/         # Utility functions
  validation/    # Input validation schemas
```

## Database Support

This API can switch between MongoDB and MSSQL without code changes, using the repository pattern:

1. **Repository Interfaces**: `IProductRepository`, `IUserRepository`, and `IOrderRepository` define the data access contracts
2. **MongoDB Implementations**: `ProductRepositoryMongo`, `UserRepositoryMongo`, and `OrderRepositoryMongo`
3. **MSSQL Implementations**: `ProductRepositoryMSSQL`, `UserRepositoryMSSQL`, and `OrderRepositoryMSSQL`

Controllers dynamically select the correct repository based on the DB_TYPE environment variable.

## Running with Different Databases

To switch between databases, set the `DB_TYPE` environment variable to either `mongo` or `mssql`.

Run with MongoDB:

```bash
npm run start:mongo
```

Run with MSSQL:

```bash
npm run start:mssql
```

Test both database connections:

```bash
npm run test:db
```

## Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (for MongoDB mode)
- MSSQL Server (for MSSQL mode)
- npm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# MongoDB connection URI
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/your-db
MONGO_DB=your-db-name
MONGO_USER=your-username
MONGO_PASSWORD=your-password
MONGO_AUTH_DB=admin

# MSSQL connection
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_USER=your-user
MSSQL_PASSWORD=your-password
MSSQL_DB=your-db-name

# Database selector - set to either 'mongo' or 'mssql'
DB_TYPE=mongo

# Server configuration
PORT=3000
NODE_ENV=development

# Security and performance
ENABLE_RATE_LIMIT=true
ENABLE_CACHE=true
ENABLE_HELMET=true

# Logging
LOG_LEVEL=info
```

## Health Check

The API provides a health check endpoint at `/health` that returns:

- System uptime
- Database type (mongo/mssql)
- Connection status for both databases
- Current timestamp

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

## Dependencies

This project uses the following major dependencies:

- **express**: Core web framework for building REST APIs and handling HTTP requests/responses.
- **mongoose**: ODM for MongoDB, used for schema definition, validation, and database operations.
- **typeorm**: ORM for MSSQL, used for schema definition, migrations, and database operations.
- **winston**: Provides robust, configurable logging for errors, requests, and application events.
- **helmet**: Adds security-related HTTP headers to protect the app from common web vulnerabilities.
- **express-rate-limit**: Middleware to limit repeated requests to public APIs and mitigate brute-force attacks.
- **dotenv**: Loads environment variables from `.env` file for configuration.
- **bcrypt**: Securely hashes user passwords before storing them in the database.
- **jsonwebtoken**: Handles JWT creation and verification for authentication and authorization.
- **joi**: Schema validation for request payloads (users, products, orders).
- **cors**: Enables Cross-Origin Resource Sharing for API access from different domains.
- **mssql**: Connects to Microsoft SQL Server for data storage and retrieval.
- **@types/\***: TypeScript type definitions for libraries like express, mongoose, winston, helmet, etc.

For a detailed explanation of each dependency, where it is used, and why, see [DEPENDENCIES.md](./DEPENDENCIES.md).

## Testing

- Use the provided Postman collections (`*.postman_collection.json`) for API testing.
- Run automated tests:

  ```sh
  npm test
  ```
