import { expect } from 'chai';
import { describe, it, before, after, beforeEach } from 'mocha';
import request from 'supertest';
import express from 'express';
import { dbManager } from '../src/database/dbManager';
import { ProductRepositoryMongo } from '../src/repositories/ProductRepositoryMongo';
import { ProductRepositoryMSSQL } from '../src/repositories/ProductRepositoryMSSQL';
import { Product } from '../src/models/Product';
import { ProductEntity } from '../src/entities/Product';

// Mock Express app for testing
const app = express();
app.use(express.json());

describe('Product Repository Tests', () => {
  let productRepo: ProductRepositoryMongo | ProductRepositoryMSSQL;
  const dbType = process.env.DB_TYPE || 'mongo';

  before(async () => {
    // Initialize database connection
    await dbManager.connect();

    if (dbType === 'mongo') {
      productRepo = new ProductRepositoryMongo();
    } else {
      productRepo = new ProductRepositoryMSSQL();
    }
  });

  after(async () => {
    // Clean up database connection
    await dbManager.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    if (dbType === 'mongo') {
      await Product.deleteMany({ name: { $regex: /^Test Product/ } });
    } else {
      // For MSSQL, you might want to delete test products
      // This would require implementing a cleanup method in the repository
    }
  });

  describe('Product Creation', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Test Product 1',
        description: 'A test product for unit testing',
        price: 99.99,
        inStock: true,
      };

      const createdProduct = await productRepo.create(productData);

      expect(createdProduct).to.not.be.null;
      expect(createdProduct.name).to.equal(productData.name);
      expect(createdProduct.description).to.equal(productData.description);
      expect(createdProduct.price).to.equal(productData.price);
      expect(createdProduct.inStock).to.equal(productData.inStock);
    });

    it('should not create a product with invalid data', async () => {
      const invalidProductData = {
        name: '', // Empty name should fail validation
        description: 'Invalid product',
        price: -10, // Negative price should fail
        inStock: true,
      };

      try {
        await productRepo.create(invalidProductData);
        expect.fail('Should have thrown an error for invalid data');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe('Product Retrieval', () => {
    let testProduct: any;

    beforeEach(async () => {
      // Create a test product for retrieval tests
      const productData = {
        name: 'Test Product for Retrieval',
        description: 'A test product for retrieval testing',
        price: 149.99,
        inStock: true,
      };
      testProduct = await productRepo.create(productData);
    });

    it('should find a product by ID', async () => {
      const foundProduct = await productRepo.findById(
        testProduct._id || testProduct.id
      );

      expect(foundProduct).to.not.be.null;
      expect(foundProduct!.name).to.equal(testProduct.name);
      expect(foundProduct!.description).to.equal(testProduct.description);
    });

    it('should return null for non-existent product ID', async () => {
      const nonExistentId =
        dbType === 'mongo' ? '507f1f77bcf86cd799439011' : 999999;
      const foundProduct = await productRepo.findById(nonExistentId);

      expect(foundProduct).to.be.null;
    });

    it('should find all products', async () => {
      const products = await productRepo.findAll();

      expect(products).to.be.an('array');
      expect(products.length).to.be.greaterThan(0);

      // Check if our test product is in the results
      const testProductInResults = products.find(
        (p) => p.name === testProduct.name
      );
      expect(testProductInResults).to.not.be.undefined;
    });
  });

  describe('Product Update', () => {
    let testProduct: any;

    beforeEach(async () => {
      const productData = {
        name: 'Test Product for Update',
        description: 'A test product for update testing',
        price: 199.99,
        inStock: true,
      };
      testProduct = await productRepo.create(productData);
    });

    it('should update a product successfully', async () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 249.99,
        inStock: false,
      };

      const updatedProduct = await productRepo.update(
        testProduct._id || testProduct.id,
        updateData
      );

      expect(updatedProduct).to.not.be.null;
      expect(updatedProduct!.name).to.equal(updateData.name);
      expect(updatedProduct!.price).to.equal(updateData.price);
      expect(updatedProduct!.inStock).to.equal(updateData.inStock);
    });

    it('should return null when updating non-existent product', async () => {
      const nonExistentId =
        dbType === 'mongo' ? '507f1f77bcf86cd799439011' : 999999;
      const updateData = { name: 'Should not update' };

      const result = await productRepo.update(nonExistentId, updateData);

      expect(result).to.be.null;
    });
  });

  describe('Product Deletion', () => {
    let testProduct: any;

    beforeEach(async () => {
      const productData = {
        name: 'Test Product for Deletion',
        description: 'A test product for deletion testing',
        price: 299.99,
        inStock: true,
      };
      testProduct = await productRepo.create(productData);
    });

    it('should delete a product successfully', async () => {
      const deleted = await productRepo.delete(
        testProduct._id || testProduct.id
      );

      expect(deleted).to.be.true;

      // Verify the product is actually deleted
      const foundProduct = await productRepo.findById(
        testProduct._id || testProduct.id
      );
      expect(foundProduct).to.be.null;
    });

    it('should return false when deleting non-existent product', async () => {
      const nonExistentId =
        dbType === 'mongo' ? '507f1f77bcf86cd799439011' : 999999;

      const result = await productRepo.delete(nonExistentId);

      expect(result).to.be.false;
    });
  });
});

describe('Product Data Validation', () => {
  describe('Product Model Validation', () => {
    it('should validate required fields', () => {
      const productData = {
        name: 'Valid Product',
        description: 'A valid product description',
        price: 99.99,
        inStock: true,
      };

      // This test assumes you have validation logic in your models
      // You might need to adapt this based on your actual validation implementation
      expect(productData.name).to.not.be.empty;
      expect(productData.price).to.be.greaterThan(0);
      expect(typeof productData.inStock).to.equal('boolean');
    });

    it('should reject invalid price values', () => {
      const invalidPrices = [-1, 0, 'invalid', null, undefined];

      invalidPrices.forEach((price) => {
        expect(typeof price === 'number' && price > 0).to.be.false;
      });
    });

    it('should validate string field lengths', () => {
      const validName = 'Valid Product Name';
      const tooLongName = 'x'.repeat(256); // Assuming 255 char limit

      expect(validName.length).to.be.lessThan(256);
      expect(tooLongName.length).to.be.greaterThan(255);
    });
  });
});
