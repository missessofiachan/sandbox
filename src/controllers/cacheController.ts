import { Request, Response } from 'express';
import { getCacheStats } from '../middleware/cacheMiddleware';

/**
 * Get cache statistics for monitoring and debugging
 * @route GET /api/cache/stats
 * @access Admin only
 */
export const getCacheStatistics = (req: Request, res: Response): void => {
  const stats = getCacheStats();
  
  // Prepare a summarized view of popular resources
  const popularResources = Object.entries(stats.popular)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10) // Show only top 10 most popular resources
    .reduce((acc, [key, count]) => ({ ...acc, [key]: count }), {});
  
  res.json({
    hits: stats.hits,
    misses: stats.misses,
    hitRatio: stats.hits / (stats.hits + stats.misses || 1),
    entries: stats.entries,
    sizeInMB: Math.round(stats.size / 1024 / 1024 * 100) / 100,
    popularResources
  });
};

/**
 * Clear entire cache
 * @route DELETE /api/cache
 * @access Admin only
 */
export const clearEntireCache = (_req: Request, res: Response): void => {
  // Import clearCache function
  const { clearCache } = require('../middleware/cacheMiddleware');
  clearCache();
  res.status(200).json({ message: 'Cache cleared successfully' });
};

export default {
  getCacheStatistics,
  clearEntireCache
};
