// Database pool monitoring controller
import { Request, Response } from 'express';
import { dbManager } from '../database/dbManager';
import { asyncHandler } from '../middleware/errorHandlerMiddleware';

/**
 * Get detailed database connection pool statistics
 * @route GET /api/database/pool-stats
 * @access Admin only
 */
export const getPoolStatistics = asyncHandler(async (req: Request, res: Response) => {
  const databaseHealth = await dbManager.getDatabaseHealth();
  
  const poolStats = {
    timestamp: new Date().toISOString(),
    activeDatabase: process.env.DB_TYPE || 'mongo',
    mongodb: {
      enabled: process.env.DB_TYPE === 'mongo' || process.env.ENABLE_MONGO_MONITORING === 'true',
      connected: databaseHealth.mongodb.connected,
      ping: databaseHealth.mongodb.ping,
      connectionPool: databaseHealth.mongodb.stats,
      configuration: {
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
        minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 2,
        maxIdleTimeMS: Number(process.env.MONGO_MAX_IDLE_TIME_MS) || 30000,
        serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
        socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
        connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10000,
      }
    },
    mssql: {
      enabled: process.env.DB_TYPE === 'mssql' || process.env.ENABLE_MSSQL_MONITORING === 'true',
      connected: databaseHealth.mssql.connected,
      ping: databaseHealth.mssql.ping,
      connectionPool: databaseHealth.mssql.stats,
      configuration: {
        poolSize: Number(process.env.MSSQL_POOL_SIZE) || 10,
        poolMax: Number(process.env.MSSQL_POOL_MAX) || 10,
        poolMin: Number(process.env.MSSQL_POOL_MIN) || 2,
        acquireTimeoutMS: Number(process.env.MSSQL_ACQUIRE_TIMEOUT_MS) || 60000,
        idleTimeoutMS: Number(process.env.MSSQL_IDLE_TIMEOUT_MS) || 30000,
        connectionTimeoutMS: Number(process.env.MSSQL_CONNECTION_TIMEOUT_MS) || 15000,
        requestTimeoutMS: Number(process.env.MSSQL_REQUEST_TIMEOUT_MS) || 15000,
      }
    },
    recommendations: generatePoolRecommendations(databaseHealth)
  };

  res.json(poolStats);
});

/**
 * Reset database connections and connection pools
 * @route POST /api/database/reset-pools
 * @access Admin only
 */
export const resetConnectionPools = asyncHandler(async (req: Request, res: Response) => {
  try {
    await dbManager.closeConnections();
    
    // Reconnect based on current DB_TYPE
    const success = await dbManager.connect();
    
    if (success) {
      res.json({
        message: 'Connection pools reset successfully',
        timestamp: new Date().toISOString(),
        activeDatabase: process.env.DB_TYPE || 'mongo'
      });
    } else {
      res.status(500).json({
        error: 'Failed to reconnect after pool reset',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Error resetting connection pools',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Generate recommendations based on current pool statistics
 */
function generatePoolRecommendations(health: any): string[] {
  const recommendations: string[] = [];
  
  // MongoDB recommendations
  if (health.mongodb.connected && health.mongodb.stats) {
    const stats = health.mongodb.stats;
    
    if (stats.readyState !== 1) {
      recommendations.push('MongoDB connection is not in ready state - consider checking network connectivity');
    }
    
    if (stats.poolConnections === 'unknown') {
      recommendations.push('Unable to retrieve MongoDB pool statistics - consider updating MongoDB driver');
    }
  }
  
  // MSSQL recommendations
  if (health.mssql.connected && health.mssql.stats) {
    const poolMax = Number(process.env.MSSQL_POOL_MAX) || 10;
    const idleTimeout = Number(process.env.MSSQL_IDLE_TIMEOUT_MS) || 30000;
    
    if (poolMax > 20) {
      recommendations.push('MSSQL pool size is quite large - consider reducing if not under heavy load');
    }
    
    if (idleTimeout < 10000) {
      recommendations.push('MSSQL idle timeout is very low - consider increasing to reduce connection churn');
    }
  }
  
  // General recommendations
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    recommendations.push('Ensure connection pool monitoring is enabled in production');
    recommendations.push('Consider implementing connection pool metrics collection');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Connection pool configuration appears optimal');
  }
  
  return recommendations;
}

export default {
  getPoolStatistics,
  resetConnectionPools
};
