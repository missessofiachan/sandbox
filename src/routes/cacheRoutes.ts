import express from 'express';
import cacheController from '../controllers/cacheController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Only allow admins to access cache statistics and management
// GET /api/cache/stats - Get cache statistics
router.get('/stats', authMiddleware, cacheController.getCacheStatistics);

// DELETE /api/cache - Clear the entire cache
router.delete('/', authMiddleware, cacheController.clearEntireCache);

export default router;
