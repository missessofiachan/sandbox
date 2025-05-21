// Database connection test script
import dotenv from 'dotenv';
import { dbManager } from './database/dbManager';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

async function testMongoDB() {
  logger.info('Testing MongoDB connection...');
  try {
    const success = await dbManager.connectMongo();
    if (success) {
      logger.info('✓ MongoDB connection successful');
    } else {
      logger.error('✗ MongoDB connection failed');
    }
  } catch (err) {
    logger.error(`✗ MongoDB connection error: ${err}`);
  }
}

async function testMSSQL() {
  logger.info('Testing MSSQL connection...');
  try {
    const success = await dbManager.connectMSSQL();
    if (success) {
      logger.info('✓ MSSQL connection successful');
    } else {
      logger.error('✗ MSSQL connection failed');
    }
  } catch (err) {
    logger.error(`✗ MSSQL connection error: ${err}`);
  }
}

async function testMain() {
  logger.info('=== Database Connection Test ===');
  
  // Test MongoDB
  await testMongoDB();
  
  // Test MSSQL
  await testMSSQL();
  
  // Close connections
  await dbManager.closeConnections();
  
  logger.info('=== Test Complete ===');
}

// Run tests
testMain().catch(err => {
  logger.error(`Unhandled error during test: ${err}`);
  process.exit(1);
});
