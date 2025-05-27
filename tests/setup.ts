import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Use test database
if (process.env.DB_TYPE === 'mongo') {
  process.env.MONGO_URI =
    process.env.MONGO_TEST_URI || process.env.MONGO_URI + '_test';
} else {
  process.env.MSSQL_DATABASE =
    process.env.MSSQL_TEST_DATABASE || process.env.MSSQL_DATABASE + '_test';
}

// Mock JWT secret for testing
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
}

// Helper function to clear test data
export const clearTestData = async () => {
  const dbType = process.env.DB_TYPE || 'mongo';

  if (dbType === 'mongo') {
    const { User } = require('../src/models/User');
    const { Product } = require('../src/models/Product');
    const { Order } = require('../src/models/Order');

    await Promise.all([
      User.deleteMany({ email: { $regex: /test\.com$/ } }),
      Product.deleteMany({ name: { $regex: /^Test/ } }),
      Order.deleteMany({ customerName: { $regex: /^Test/ } }),
    ]);
  } else {
    // For MSSQL, implement similar cleanup
    // This would require running DELETE queries
  }
};
