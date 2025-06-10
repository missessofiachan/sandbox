# Sandbox Node.js CRUD API with Triple-Database Support

This project is a Node.js/TypeScript backend providing CRUD APIs for Users, Products, and Orders with role-based access control, JWT authentication, and **complete triple-database support** for MongoDB, MSSQL, and SQLite.

## Features

- **Complete Triple Database Support**: Seamlessly switch between MongoDB, MSSQL, and SQLite with a single configuration setting
- **Zero-Config SQLite**: Embedded database with automatic setup - no external server required
- **Repository Pattern Architecture**: Clean separation of concerns with database-agnostic interfaces
- **PM2 Process Management**: Production-ready process management with database-specific configurations
- **Full CRUD Operations**: Users, Products, and Orders with role-based access control
- **JWT Authentication**: Secure token-based authentication with role validation
- **Advanced Caching System**: Intelligent caching with adaptive TTL and cache invalidation
- **Comprehensive Health Monitoring**: Database connection monitoring and system health checks
- **Input Validation**: Robust validation using Joi schemas with database-specific ID handling
- **Structured Logging**: Winston-based logging with console and file outputs
- **Security Hardening**: Helmet middleware, rate limiting, and password hashing
- **API Documentation**: Complete OpenAPI/Swagger documentation with interactive testing
- **Development Tools**: Hot reload, TypeScript support, and testing utilities

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

This API can switch between MongoDB, MSSQL, and SQLite without code changes, using the repository pattern:

1. **Repository Interfaces**: `IProductRepository`, `IUserRepository`, and `IOrderRepository` define the data access contracts
2. **MongoDB Implementations**: `ProductRepositoryMongo`, `UserRepositoryMongo`, and `OrderRepositoryMongo`
3. **MSSQL Implementations**: `ProductRepositoryMSSQL`, `UserRepositoryMSSQL`, and `OrderRepositoryMSSQL`
4. **SQLite Implementations**: `ProductRepositorySQLite`, `UserRepositorySQLite`, and `OrderRepositorySQLite`

Controllers dynamically select the correct repository based on the DB_TYPE environment variable.

## Running with Different Databases

To switch between databases, set the `DB_TYPE` environment variable to `mongo`, `mssql`, or `sqlite`.

Run with MongoDB:

```bash
npm run start:mongo
```

Run with MSSQL:

```bash
npm run start:mssql
```

Run with SQLite:

```bash
npm run start:sqlite
```

Run with SQLite (development):

```bash
npm run start:sqlite-dev
```

Test database connections:

```bash
npm run test:db
```

## Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (for MongoDB mode)
- MSSQL Server (for MSSQL mode)
- SQLite3 (for SQLite mode - included with installation)
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

# SQLite connection
SQLITE_DB_PATH=./data/sandbox.db

# Database selector - set to 'mongo', 'mssql', or 'sqlite'
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
- Database type (mongo/mssql/sqlite)
- Connection status for the active database
- Current timestamp

Example response:

```json
{
  "status": "healthy",
  "uptime": "2 hours, 15 minutes",
  "activeDbType": "sqlite",
  "dbStatus": "connected",
  "timestamp": "2024-01-15T14:30:00.000Z"
}
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

### Production Deployment with PM2

For production-grade process management, use PM2:

```sh
# Build and start with PM2 (production)
npm run build
npm run pm2:start

# Development with file watching
npm run pm2:dev

# Database-specific PM2 processes
npm run pm2:mongo    # MongoDB on port 3001
npm run pm2:mssql    # MSSQL on port 3002
npm run pm2:sqlite   # SQLite on port 3003
npm run pm2:sqlite-dev # SQLite development on port 3004

# Check process status
npm run pm2:status

# View logs
npm run pm2:logs
```

PM2 provides:

- **Process monitoring** and automatic restarts
- **Load balancing** across CPU cores
- **Zero-downtime deployments**
- **Memory monitoring** with restart on leaks
- **Health checks** every 30 seconds
- **Advanced logging** and metrics

For detailed PM2 usage, see [PM2_GUIDE.md](./PM2_GUIDE.md).

### Create Admin User

Create admin users for different databases:

```sh
# For MongoDB
npm run ts-node src/scripts/createMongoAdmin.ts

# For MSSQL
npm run ts-node src/scripts/createMSSQLAdmin.ts

# For SQLite
npm run admin:sqlite
```

### SQLite Setup

SQLite requires minimal setup since the database file is created automatically:

1. Ensure the `data/` directory exists (created automatically)
2. Set `DB_TYPE=sqlite` and `SQLITE_DB_PATH=./data/sandbox.db` in your environment
3. The database file and tables are created automatically on first run
4. Create an admin user with `npm run admin:sqlite`

**SQLite Benefits:**

- **Zero-config**: No separate database server installation required
- **Self-contained**: Single file database, perfect for development and testing
- **Performance**: Fast for read-heavy workloads
- **Portability**: Database file can be easily copied or backed up

## Database Support Status

| Feature           | MongoDB | MSSQL | SQLite | Status             |
| ----------------- | ------- | ----- | ------ | ------------------ |
| Connection        | ✅      | ✅    | ✅     | Complete           |
| User CRUD         | ✅      | ✅    | ✅     | Complete           |
| Product CRUD      | ✅      | ✅    | ✅     | Complete           |
| Order CRUD        | ✅      | ✅    | ✅     | Complete           |
| Authentication    | ✅      | ✅    | ✅     | Complete           |
| Health Monitoring | ✅      | ✅    | ✅     | Complete           |
| PM2 Support       | ✅      | ✅    | ✅     | Complete           |


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

## API Documentation (OpenAPI/Swagger)

- **Interactive API docs available at**: [`/api-docs`](http://localhost:3000/api-docs) (Swagger UI)
- **OpenAPI 3.0** documentation is generated from JSDoc comments in all route files (`src/routes/*.ts`).
- **All endpoints** (Users, Products, Orders, Auth, Cache, Database) are fully documented, including:
  - Request and response schemas for all CRUD operations
  - Standard error responses (`400`, `401`, `403`, `404`, `409`, `500`) with descriptions and examples
  - Security requirements (JWT bearerAuth)
  - Tags and grouping for easy navigation
- **Reusable schemas** for `User`, `Product`, `Order`, and `Error` are defined in OpenAPI components.
- **How to use**: Visit `/api-docs` in your browser after starting the server to explore and test the API interactively.

## Error Handling & Validation

- **Centralized error handling**: All errors are returned in a consistent JSON format with appropriate HTTP status codes and error messages.
- **Standard error responses**: Every endpoint documents possible error responses in Swagger/OpenAPI, including examples for validation errors, unauthorized access, forbidden actions, not found, and server errors.
- **Input validation**: All user, product, and order endpoints enforce request validation using Joi schemas. Invalid requests return a `400` error with details.

## Security

- **JWT authentication**: All protected endpoints require a valid JWT in the `Authorization` header.
- **Role-based access control**: Admin/user roles enforced via middleware and documented in Swagger.
- **Password hashing**: User passwords are hashed with bcrypt before storage.
- **Sensitive config**: All secrets and credentials are stored in `.env` and never hardcoded.
- **Helmet**: Security headers enabled by default.
- **Rate limiting**: Prevents brute-force and abuse (configurable).

## Database & Repository Pattern

- **Dual database support**: Switch between MongoDB and MSSQL with the `DB_TYPE` env variable.
- **Repository pattern**: All data access is abstracted via interfaces and repository classes for each entity and database.
- **Entity definitions**: Found in `src/entities/` (MSSQL) and `src/models/` (MongoDB).
- **Connection config**: See `.env` and `src/database/dbManager.ts`.

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
- **Test via Swagger UI**: You can also test all endpoints directly in your browser at [`/api-docs`](http://localhost:3000/api-docs).
- Run automated tests:

  ```sh
  npm test
  ```

## Assessment Requirements Coverage

- [x] **Full CRUD** for users, products, and orders
- [x] **Validation**: Joi schemas for all input, enforced in middleware
- [x] **Security**: JWT, bcrypt, role-based access, helmet, dotenv
- [x] **SQL/NoSQL integration**: Repository pattern, triple database support (MongoDB, MSSQL, SQLite)
- [x] **OpenAPI/Swagger**: All endpoints, schemas, and errors documented
- [x] **Error handling**: Centralized, consistent, and documented
- [x] **OOP**: Repository pattern, interfaces, separation of concerns
- [x] **Environment config**: All sensitive data in `.env`
- [x] **Testing**: Postman collections, Swagger UI, and automated tests

