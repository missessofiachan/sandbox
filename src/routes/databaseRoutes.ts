// Express route definitions for database monitoring endpoints
import express from 'express';
import * as databaseController from '../controllers/databaseController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Only allow admins to access database pool statistics and management
// GET /api/database/pool-stats - Get detailed connection pool statistics
router.get('/pool-stats', authMiddleware, databaseController.getPoolStatistics);

// POST /api/database/reset-pools - Reset connection pools
router.post(
  '/reset-pools',
  authMiddleware,
  databaseController.resetConnectionPools
);

export default router;
