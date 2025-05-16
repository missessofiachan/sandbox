import request from 'supertest';
import app from '../src/server';

describe('Product API', () => {
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    // Login as admin to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = res.body.token;
  });

  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        price: 19.99,
        description: 'A test product',
        inStock: true
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    productId = res.body._id;
  });

  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(productId);
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Product',
        price: 29.99,
        description: 'Updated description',
        inStock: false
      });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Product');
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted successfully');
  });
});
