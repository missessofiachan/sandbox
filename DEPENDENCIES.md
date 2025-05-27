# Project Dependencies Overview

This document lists all major dependencies used in this project, where they are used, and why they are included.

---

## 1. express

- **Where:** Throughout the project (server.ts, controllers, middleware, routes)
- **Why:** Core web framework for building REST APIs and handling HTTP requests/responses.

## 2. mongoose

- **Where:** models/, server.ts, MongoDB repositories
- **Why:** ODM for MongoDB, used for schema definition, validation, and database operations.

## 3. typeorm

- **Where:** entities/, connectMSSQL.ts, MSSQL repositories
- **Why:** ORM for MSSQL, used for schema definition, migrations, and database operations.

## 4. winston

- **Where:** utils/logger.ts, server.ts, errorHandlerMiddleware.ts
- **Why:** Provides robust, configurable logging for errors, requests, and application events.

## 5. helmet

- **Where:** server.ts
- **Why:** Adds security-related HTTP headers to protect the app from common web vulnerabilities.

## 6. express-rate-limit

- **Where:** server.ts
- **Why:** Middleware to limit repeated requests to public APIs and mitigate brute-force attacks.

## 7. dotenv

- **Where:** server.ts, utils/logger.ts
- **Why:** Loads environment variables from `.env` file for configuration.

## 8. bcrypt

- **Where:** userController.ts
- **Why:** Securely hashes user passwords before storing them in the database.

## 9. jsonwebtoken

- **Where:** verifyTokenMiddleware.ts, authController.ts
- **Why:** Handles JWT creation and verification for authentication and authorization.

## 10. joi

- **Where:** validation/
- **Why:** Schema validation for request payloads (users, products, orders).

## 11. cors

- **Where:** corsMiddleware.ts, server.ts
- **Why:** Enables Cross-Origin Resource Sharing for API access from different domains.

## 12. mssql

- **Where:** connectMSSQL.ts, MSSQL repositories
- **Why:** Connects to Microsoft SQL Server for data storage and retrieval.

## 13. @types/\*

- **Where:** Dev dependencies, throughout TypeScript code
- **Why:** Provides TypeScript type definitions for libraries like express, mongoose, winston, helmet, etc.

---

**Note:**

- Some dependencies are only used in specific database modes (MongoDB or MSSQL).
- All dependencies are managed via `package.json` and installed with `npm install`.

For more details, see the `package.json` file.
