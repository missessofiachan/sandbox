import { expect } from 'chai';
import { describe, it, before, after, beforeEach } from 'mocha';
import request from 'supertest';
import express from 'express';
import { dbManager } from '../src/database/dbManager';
import productRoutes from '../src/routes/productRoutes';
import userRoutes from '../src/routes/userRoutes';
import authRoutes from '../src/routes/authRoutes';
import { errorHandler } from '../src/middleware/errorHandlerMiddleware';
import jwt from 'jsonwebtoken';

// Create test Express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);

  // Error handling middleware
  app.use(errorHandler);

  return app;
};

describe('API Integration Tests', () => {
  let app: express.Application;
  let authToken: string;
  let adminToken: string;

  before(async () => {
    app = createTestApp();
    await dbManager.connect();

    // Create test tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
    authToken = jwt.sign(
      { id: 'testuser123', email: 'testuser@example.com', role: 'user' },
      jwtSecret,
      { expiresIn: '1h' }
    );
    adminToken = jwt.sign(
      { id: 'admin123', email: 'admin@example.com', role: 'admin' },
      jwtSecret,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    await dbManager.disconnect();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'newuser@test.com',
          password: 'securePassword123',
          role: 'user',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body).to.have.property('message');
        expect(response.body).to.have.property('user');
        expect(response.body.user.email).to.equal(userData.email);
        expect(response.body.user).to.not.have.property('password');
      });

      it('should reject registration with invalid email', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'securePassword123',
          role: 'user',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body).to.have.property('error');
      });

      it('should reject registration with weak password', async () => {
        const userData = {
          email: 'test@example.com',
          password: '123', // Too short
          role: 'user',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body).to.have.property('error');
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        // Create a test user for login tests
        await request(app).post('/api/auth/register').send({
          email: 'logintest@test.com',
          password: 'loginPassword123',
          role: 'user',
        });
      });

      it('should login with valid credentials', async () => {
        const loginData = {
          email: 'logintest@test.com',
          password: 'loginPassword123',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
        expect(response.body.user.email).to.equal(loginData.email);
      });

      it('should reject login with invalid password', async () => {
        const loginData = {
          email: 'logintest@test.com',
          password: 'wrongPassword',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body).to.have.property('error');
      });

      it('should reject login with non-existent email', async () => {
        const loginData = {
          email: 'nonexistent@test.com',
          password: 'anyPassword',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body).to.have.property('error');
      });
    });
  });

  describe('Product Endpoints', () => {
    describe('POST /api/products', () => {
      it('should create a new product with admin token', async () => {
        const productData = {
          name: 'Test Product API',
          description: 'A test product created via API',
          price: 99.99,
          inStock: true,
        };

        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(201);

        expect(response.body).to.have.property('name', productData.name);
        expect(response.body).to.have.property('price', productData.price);
        expect(response.body).to.have.property('id');
      });

      it('should reject product creation without authentication', async () => {
        const productData = {
          name: 'Unauthorized Product',
          description: 'This should fail',
          price: 99.99,
          inStock: true,
        };

        await request(app).post('/api/products').send(productData).expect(401);
      });

      it('should reject product creation with user token (not admin)', async () => {
        const productData = {
          name: 'User Product',
          description: 'Users should not be able to create',
          price: 99.99,
          inStock: true,
        };

        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(productData)
          .expect(403);
      });
    });

    describe('GET /api/products', () => {
      it('should retrieve all products without authentication', async () => {
        const response = await request(app).get('/api/products').expect(200);

        expect(response.body).to.be.an('array');
      });

      it('should support pagination parameters', async () => {
        const response = await request(app)
          .get('/api/products?page=1&limit=5')
          .expect(200);

        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.at.most(5);
      });
    });

    describe('GET /api/products/:id', () => {
      let testProductId: string;

      beforeEach(async () => {
        // Create a test product
        const productData = {
          name: 'Test Product for Get',
          description: 'For retrieval testing',
          price: 149.99,
          inStock: true,
        };

        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData);

        testProductId = createResponse.body.id || createResponse.body._id;
      });

      it('should retrieve a specific product by ID', async () => {
        const response = await request(app)
          .get(`/api/products/${testProductId}`)
          .expect(200);

        expect(response.body).to.have.property('name', 'Test Product for Get');
        expect(response.body).to.have.property('price', 149.99);
      });

      it('should return 404 for non-existent product ID', async () => {
        const nonExistentId = '507f1f77bcf86cd799439011';

        await request(app).get(`/api/products/${nonExistentId}`).expect(404);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).to.have.property('error');
    });

    it('should handle invalid routes', async () => {
      await request(app).get('/api/nonexistent').expect(404);
    });

    it('should validate content type for JSON endpoints', async () => {
      await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('not json')
        .expect(400);
    });
  });

  describe('Rate Limiting (if implemented)', () => {
    it('should allow reasonable number of requests', async () => {
      // Make several requests quickly
      const promises = Array(5)
        .fill(null)
        .map(() => request(app).get('/api/products'));

      const responses = await Promise.all(promises);

      // All should succeed if rate limiting is reasonable
      responses.forEach((response) => {
        expect(response.status).to.equal(200);
      });
    });
  });
});
