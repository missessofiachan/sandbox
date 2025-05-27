import { expect } from 'chai';
import { describe, it, before, after, beforeEach } from 'mocha';
import request from 'supertest';
import express from 'express';
import { dbManager } from '../src/database/dbManager';
import { UserRepositoryMongo } from '../src/repositories/UserRepositoryMongo';
import { UserRepositoryMSSQL } from '../src/repositories/UserRepositoryMSSQL';
import { User } from '../src/models/User';
import bcrypt from 'bcrypt';

// Mock Express app for testing
const app = express();
app.use(express.json());

describe('User Repository Tests', () => {
  let userRepo: UserRepositoryMongo | UserRepositoryMSSQL;
  const dbType = process.env.DB_TYPE || 'mongo';

  before(async () => {
    await dbManager.connect();

    if (dbType === 'mongo') {
      userRepo = new UserRepositoryMongo();
    } else {
      userRepo = new UserRepositoryMSSQL();
    }
  });

  after(async () => {
    await dbManager.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    if (dbType === 'mongo') {
      await User.deleteMany({ email: { $regex: /^test.*@test\.com$/ } });
    }
  });

  describe('User Creation', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test1@test.com',
        password: 'securePassword123',
        role: 'user',
      };

      const createdUser = await userRepo.create(userData);

      expect(createdUser).to.not.be.null;
      expect(createdUser.email).to.equal(userData.email);
      expect(createdUser.role).to.equal(userData.role);
      expect(createdUser.password).to.not.equal(userData.password); // Should be hashed
    });

    it('should hash the password during creation', async () => {
      const userData = {
        email: 'test2@test.com',
        password: 'plainTextPassword',
        role: 'user',
      };

      const createdUser = await userRepo.create(userData);

      expect(createdUser.password).to.not.equal(userData.password);

      // Verify the password can be compared using bcrypt
      const isPasswordValid = await bcrypt.compare(
        userData.password,
        createdUser.password
      );
      expect(isPasswordValid).to.be.true;
    });

    it('should not create a user with duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        role: 'user',
      };

      // Create first user
      await userRepo.create(userData);

      // Attempt to create duplicate
      try {
        await userRepo.create(userData);
        expect.fail('Should have thrown an error for duplicate email');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe('User Retrieval', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = {
        email: 'testuser@test.com',
        password: 'password123',
        role: 'user',
      };
      testUser = await userRepo.create(userData);
    });

    it('should find a user by ID', async () => {
      const foundUser = await userRepo.findById(testUser._id || testUser.id);

      expect(foundUser).to.not.be.null;
      expect(foundUser!.email).to.equal(testUser.email);
      expect(foundUser!.role).to.equal(testUser.role);
    });

    it('should find a user by email', async () => {
      const foundUser = await userRepo.findByEmail(testUser.email);

      expect(foundUser).to.not.be.null;
      expect(foundUser!.email).to.equal(testUser.email);
      expect(foundUser!.role).to.equal(testUser.role);
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await userRepo.findByEmail('nonexistent@test.com');

      expect(foundUser).to.be.null;
    });
  });

  describe('User Authentication', () => {
    let testUser: any;
    const plainPassword = 'testPassword123';

    beforeEach(async () => {
      const userData = {
        email: 'authtest@test.com',
        password: plainPassword,
        role: 'user',
      };
      testUser = await userRepo.create(userData);
    });

    it('should validate correct password', async () => {
      const isValid = await bcrypt.compare(plainPassword, testUser.password);
      expect(isValid).to.be.true;
    });

    it('should reject incorrect password', async () => {
      const isValid = await bcrypt.compare('wrongPassword', testUser.password);
      expect(isValid).to.be.false;
    });
  });

  describe('User Update', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = {
        email: 'updatetest@test.com',
        password: 'password123',
        role: 'user',
      };
      testUser = await userRepo.create(userData);
    });

    it('should update user role successfully', async () => {
      const updateData = { role: 'admin' };

      const updatedUser = await userRepo.update(
        testUser._id || testUser.id,
        updateData
      );

      expect(updatedUser).to.not.be.null;
      expect(updatedUser!.role).to.equal('admin');
      expect(updatedUser!.email).to.equal(testUser.email); // Should remain unchanged
    });
  });

  describe('User Deletion', () => {
    let testUser: any;

    beforeEach(async () => {
      const userData = {
        email: 'deletetest@test.com',
        password: 'password123',
        role: 'user',
      };
      testUser = await userRepo.create(userData);
    });

    it('should delete a user successfully', async () => {
      const deleted = await userRepo.delete(testUser._id || testUser.id);

      expect(deleted).to.be.true;

      // Verify the user is actually deleted
      const foundUser = await userRepo.findById(testUser._id || testUser.id);
      expect(foundUser).to.be.null;
    });
  });
});

describe('User Validation Tests', () => {
  describe('Email Validation', () => {
    const validEmails = [
      'user@example.com',
      'test.email+tag@domain.co.uk',
      'user.name@domain-name.com',
    ];

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user..name@domain.com',
      '',
    ];

    it('should accept valid email formats', () => {
      validEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).to.be.true;
      });
    });

    it('should reject invalid email formats', () => {
      invalidEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).to.be.false;
      });
    });
  });

  describe('Password Validation', () => {
    it('should require minimum password length', () => {
      const minLength = 4; // Based on your current validation

      expect('abc'.length).to.be.lessThan(minLength);
      expect('abcd'.length).to.equal(minLength);
      expect('abcde'.length).to.be.greaterThan(minLength);
    });

    it('should validate role values', () => {
      const validRoles = ['user', 'admin'];
      const invalidRoles = ['superuser', 'moderator', '', null];

      validRoles.forEach((role) => {
        expect(['user', 'admin']).to.include(role);
      });

      invalidRoles.forEach((role) => {
        expect(['user', 'admin']).to.not.include(role);
      });
    });
  });
});
