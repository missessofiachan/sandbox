import { expect } from 'chai';
import { describe, it } from 'mocha';
import jwt from 'jsonwebtoken';
import authMiddleware from '../src/middleware/authMiddleware';
import { Request, Response, NextFunction } from 'express';

// Mock Express objects with proper typing
interface MockRequest extends Partial<Request> {}

interface MockResponse {
  statusCode?: number;
  jsonData?: any;
  status: (code: number) => MockResponse;
  json: (data: any) => MockResponse;
}

interface MockNext extends NextFunction {
  called?: boolean;
}

const createMockRequest = (authHeader?: string): MockRequest => ({
  headers: authHeader ? { authorization: authHeader } : {},
});

const createMockResponse = (): MockResponse => {
  const res: MockResponse = {} as MockResponse;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

const createMockNext = (): MockNext => {
  const next: MockNext = (() => {
    next.called = true;
  }) as MockNext;
  next.called = false;
  return next;
};

describe('Authentication Middleware Tests', () => {
  const validSecretKey = process.env.JWT_SECRET || 'test-secret-key';
  const validPayload = { id: '123', email: 'test@example.com', role: 'user' };

  describe('Valid Token Tests', () => {
    it('should allow request with valid JWT token', () => {
      const token = jwt.sign(validPayload, validSecretKey, { expiresIn: '1h' });
      const req = createMockRequest(`Bearer ${token}`) as Request;
      const res = createMockResponse() as any;
      const next = createMockNext();

      authMiddleware(req, res, next);

      expect(next.called).to.be.true;
      expect(req.user).to.exist;
      expect(req.user?.email).to.equal(validPayload.email);
    });

    it('should extract user information from token', () => {
      const token = jwt.sign(validPayload, validSecretKey, { expiresIn: '1h' });
      const req = createMockRequest(`Bearer ${token}`) as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(req.user).to.deep.include({
        id: validPayload.id,
        email: validPayload.email,
        role: validPayload.role,
      });
    });
  });

  describe('Invalid Token Tests', () => {
    it('should reject request without Authorization header', () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(401);
      expect(res.jsonData).to.deep.equal({ error: 'No token provided' });
    });

    it('should reject request with malformed Authorization header', () => {
      const req = createMockRequest('InvalidFormat token123') as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(401);
      expect(res.jsonData).to.deep.equal({ error: 'No token provided' });
    });

    it('should reject request with invalid JWT token', () => {
      const req = createMockRequest('Bearer invalid.jwt.token') as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(403);
      expect(res.jsonData).to.deep.equal({ error: 'Invalid token' });
    });

    it('should reject request with expired JWT token', () => {
      const expiredToken = jwt.sign(validPayload, validSecretKey, {
        expiresIn: '-1h',
      });
      const req = createMockRequest(`Bearer ${expiredToken}`) as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(403);
      expect(res.jsonData).to.deep.equal({ error: 'Invalid token' });
    });

    it('should reject request with token signed with wrong secret', () => {
      const wrongSecretToken = jwt.sign(validPayload, 'wrong-secret', {
        expiresIn: '1h',
      });
      const req = createMockRequest(`Bearer ${wrongSecretToken}`) as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(403);
      expect(res.jsonData).to.deep.equal({ error: 'Invalid token' });
    });
  });

  describe('Token Edge Cases', () => {
    it('should handle Bearer token without space correctly', () => {
      const req = createMockRequest('Bearertoken123') as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(401);
    });

    it('should handle empty Bearer token', () => {
      const req = createMockRequest('Bearer ') as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(403);
    });

    it('should handle case-sensitive Bearer keyword', () => {
      const token = jwt.sign(validPayload, validSecretKey, { expiresIn: '1h' });
      const req = createMockRequest(`bearer ${token}`) as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res as any, next);

      expect(next.called).to.be.false;
      expect(res.statusCode).to.equal(401);
    });
  });
});
