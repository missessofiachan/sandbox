# Sandbox Node.js CRUD API

This project is a Node.js/TypeScript backend providing CRUD APIs for Users, Products, and Orders with role-based access control, JWT authentication, and MongoDB/MSSQL support.

## Features

- User registration, login, and role-based access (admin/user)
- Product and Order CRUD APIs
- JWT authentication for protected endpoints
- Input validation using Joi
- MongoDB (default) and optional MSSQL support
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

## Testing

- Use the provided Postman collections (`*.postman_collection.json`) for API testing.
- Run automated tests:
  ```sh
  npm test
  ```

##