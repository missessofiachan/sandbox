import express from 'express';
import cacheController from '../controllers/cacheController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     CacheStats:
 *       type: object
 *       properties:
 *         hits:
 *           type: integer
 *           example: 42
 *         misses:
 *           type: integer
 *           example: 7
 *         keys:
 *           type: integer
 *           example: 10
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message."
 *
 * /api/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags:
 *       - Cache
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CacheStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error."
 *
 * /api/cache:
 *   delete:
 *     summary: Clear the entire cache
 *     tags:
 *       - Cache
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cache cleared successfully."
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error."
 */

// Only allow admins to access cache statistics and management
// GET /api/cache/stats - Get cache statistics
router.get('/stats', authMiddleware, cacheController.getCacheStatistics);

// DELETE /api/cache - Clear the entire cache
router.delete('/', authMiddleware, cacheController.clearEntireCache);

export default router;
